import type { FastifyInstance } from "fastify";
import { authLookup, withTenant } from "@hcmos/db";
import { loginSchema, mfaVerifySchema, refreshSchema, mfaEnrollVerifySchema } from "@hcmos/shared";
import { verifyPassword } from "@hcmos/shared/password";
import { issueSession, sha256 } from "../lib/session.js";
import { signMfaChallenge, verifyMfaChallenge, verifyRefresh } from "../lib/jwt.js";
import { generateMfaSecret, mfaKeyUri, verifyTotp } from "../lib/mfa.js";
import { audit } from "../lib/audit.js";

export async function authRoutes(app: FastifyInstance): Promise<void> {
  // First factor.
  app.post("/auth/login", async (req, reply) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: "bad_request", message: "Invalid login" });
    const { tenantSlug, email, password } = parsed.data;

    const row = await authLookup(tenantSlug, email);
    // Constant-ish: still run a verify to reduce user-enumeration timing signal.
    const ok = row ? verifyPassword(password, row.password_hash) : verifyPassword(password, "scrypt$16384$8$1$x$x");
    if (!row || row.disabled || !ok) {
      return reply.code(401).send({ error: "unauthorized", message: "Invalid credentials" });
    }

    if (row.mfa_enabled) {
      return reply.send({ status: "mfa_required", mfaToken: signMfaChallenge(row.user_id, row.tenant_id) });
    }
    const session = await issueSession(row.user_id, row.tenant_id);
    await withTenant(row.tenant_id, (tx) =>
      audit(tx, row.tenant_id, { actorUserId: row.user_id, action: "auth.login", entity: "user", entityId: row.user_id }),
    );
    return reply.send({ status: "ok", ...session });
  });

  // Second factor.
  app.post("/auth/mfa/verify", async (req, reply) => {
    const parsed = mfaVerifySchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: "bad_request", message: "Invalid input" });
    let challenge: { sub: string; tid: string };
    try {
      challenge = verifyMfaChallenge(parsed.data.mfaToken);
    } catch {
      return reply.code(401).send({ error: "unauthorized", message: "MFA challenge expired" });
    }
    const verified = await withTenant(challenge.tid, async (tx) => {
      const user = await tx.user.findUnique({ where: { id: challenge.sub } });
      if (!user?.mfaSecret) return false;
      return verifyTotp(parsed.data.code, user.mfaSecret);
    });
    if (!verified) return reply.code(401).send({ error: "unauthorized", message: "Invalid MFA code" });

    const session = await issueSession(challenge.sub, challenge.tid);
    await withTenant(challenge.tid, (tx) =>
      audit(tx, challenge.tid, { actorUserId: challenge.sub, action: "auth.mfa", entity: "user", entityId: challenge.sub }),
    );
    return reply.send({ status: "ok", ...session });
  });

  // Rotate refresh token.
  app.post("/auth/refresh", async (req, reply) => {
    const parsed = refreshSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: "bad_request", message: "Invalid input" });
    let claims;
    try {
      claims = verifyRefresh(parsed.data.refreshToken);
    } catch {
      return reply.code(401).send({ error: "unauthorized", message: "Invalid refresh token" });
    }
    const valid = await withTenant(claims.tid, async (tx) => {
      const row = await tx.refreshToken.findUnique({ where: { id: claims.jti } });
      if (!row || row.revokedAt || row.expiresAt < new Date()) return false;
      if (row.tokenHash !== sha256(parsed.data.refreshToken)) {
        // Token reuse / mismatch — revoke defensively.
        await tx.refreshToken.update({ where: { id: row.id }, data: { revokedAt: new Date() } });
        return false;
      }
      await tx.refreshToken.update({ where: { id: row.id }, data: { revokedAt: new Date() } });
      return true;
    });
    if (!valid) return reply.code(401).send({ error: "unauthorized", message: "Refresh rejected" });
    const session = await issueSession(claims.sub, claims.tid);
    return reply.send({ status: "ok", ...session });
  });

  app.post("/auth/logout", { preHandler: [app.authenticate] }, async (req, reply) => {
    const auth = req.auth!;
    await withTenant(auth.tenantId, (tx) =>
      tx.refreshToken.updateMany({ where: { userId: auth.userId, revokedAt: null }, data: { revokedAt: new Date() } }),
    );
    return reply.send({ status: "ok" });
  });

  app.get("/auth/me", { preHandler: [app.authenticate] }, async (req, reply) => {
    const auth = req.auth!;
    const user = await withTenant(auth.tenantId, (tx) =>
      tx.user.findUniqueOrThrow({ where: { id: auth.userId }, include: { tenant: true } }),
    );
    return reply.send({
      id: user.id,
      tenantId: auth.tenantId,
      tenantSlug: user.tenant.slug,
      email: user.email,
      displayName: user.displayName,
      roles: auth.roles,
      permissions: [...auth.permissions],
      mfaEnabled: user.mfaEnabled,
    });
  });

  // Begin MFA enrollment: issue a secret + QR URI (not yet enabled).
  app.post("/auth/mfa/enroll", { preHandler: [app.authenticate] }, async (req, reply) => {
    const auth = req.auth!;
    const secret = generateMfaSecret();
    const email = await withTenant(auth.tenantId, async (tx) => {
      const user = await tx.user.update({
        where: { id: auth.userId },
        data: { mfaSecret: secret, mfaEnabled: false },
      });
      return user.email;
    });
    return reply.send({ secret, otpauthUri: mfaKeyUri(secret, email) });
  });

  // Confirm enrollment with a live code, then enable MFA.
  app.post("/auth/mfa/enroll/verify", { preHandler: [app.authenticate] }, async (req, reply) => {
    const auth = req.auth!;
    const parsed = mfaEnrollVerifySchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: "bad_request", message: "Invalid code" });
    const enabled = await withTenant(auth.tenantId, async (tx) => {
      const user = await tx.user.findUniqueOrThrow({ where: { id: auth.userId } });
      if (!user.mfaSecret || !verifyTotp(parsed.data.code, user.mfaSecret)) return false;
      await tx.user.update({ where: { id: auth.userId }, data: { mfaEnabled: true } });
      await audit(tx, auth.tenantId, { actorUserId: auth.userId, action: "auth.mfa.enroll", entity: "user", entityId: auth.userId });
      return true;
    });
    if (!enabled) return reply.code(400).send({ error: "bad_request", message: "Code did not verify" });
    return reply.send({ status: "ok", mfaEnabled: true });
  });
}
