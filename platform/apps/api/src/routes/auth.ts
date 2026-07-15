import type { FastifyInstance } from "fastify";
import { authLookup, withTenant } from "@hcmos/db";
import {
  loginSchema,
  mfaVerifySchema,
  refreshSchema,
  mfaEnrollVerifySchema,
  requiresMfa,
  type RoleCode,
} from "@hcmos/shared";
import { verifyPassword } from "@hcmos/shared/password";
import { issueSession, sha256 } from "../lib/session.js";
import { signMfaChallenge, signSetupToken, verifyMfaChallenge, verifyRefresh } from "../lib/jwt.js";
import { generateMfaSecret, mfaKeyUri, verifyTotp } from "../lib/mfa.js";
import { audit } from "../lib/audit.js";

const MAX_FAILED = 5;
const LOCK_MS = 15 * 60 * 1000;
// Dummy hash so a nonexistent account still costs a scrypt verify (anti-enumeration).
const DUMMY_HASH = "scrypt$16384$8$1$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

// Stricter per-route limit on credential endpoints (in addition to the global
// cap). Relaxed under NODE_ENV=test so integration suites aren't throttled.
const authRateLimit = {
  config: { rateLimit: { max: process.env.NODE_ENV === "test" ? 100_000 : 10, timeWindow: "1 minute" } },
};

export async function authRoutes(app: FastifyInstance): Promise<void> {
  // First factor, with account lockout and mandatory-MFA enforcement.
  app.post("/auth/login", authRateLimit, async (req, reply) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: "bad_request", message: "Invalid login" });
    const { tenantSlug, email, password } = parsed.data;

    const boot = await authLookup(tenantSlug, email);
    if (!boot) {
      verifyPassword(password, DUMMY_HASH); // constant-ish timing
      return reply.code(401).send({ error: "unauthorized", message: "Invalid credentials" });
    }

    const outcome = await withTenant(boot.tenant_id, async (tx) => {
      const user = await tx.user.findUnique({ where: { id: boot.user_id }, include: { roles: true } });
      if (!user || user.disabled) return { kind: "invalid" as const };
      if (user.lockedUntil && user.lockedUntil > new Date()) {
        return { kind: "locked" as const, until: user.lockedUntil };
      }
      if (!verifyPassword(password, user.passwordHash)) {
        const attempts = user.failedAttempts + 1;
        const lock = attempts >= MAX_FAILED;
        await tx.user.update({
          where: { id: user.id },
          data: { failedAttempts: lock ? 0 : attempts, lockedUntil: lock ? new Date(Date.now() + LOCK_MS) : null },
        });
        if (lock) {
          await audit(tx, boot.tenant_id, { actorUserId: user.id, action: "auth.lockout", entity: "user", entityId: user.id });
        }
        return { kind: "invalid" as const };
      }
      // Success — reset the counter.
      if (user.failedAttempts !== 0 || user.lockedUntil) {
        await tx.user.update({ where: { id: user.id }, data: { failedAttempts: 0, lockedUntil: null } });
      }
      return {
        kind: "ok" as const,
        mfaEnabled: user.mfaEnabled,
        roleCodes: user.roles.map((r) => r.roleCode as RoleCode),
      };
    });

    if (outcome.kind === "locked") {
      return reply.code(423).send({ error: "locked", message: "Account temporarily locked. Try again later." });
    }
    if (outcome.kind === "invalid") {
      return reply.code(401).send({ error: "unauthorized", message: "Invalid credentials" });
    }
    if (outcome.mfaEnabled) {
      return reply.send({ status: "mfa_required", mfaToken: signMfaChallenge(boot.user_id, boot.tenant_id) });
    }
    // Privileged roles must enroll MFA before they get a usable session.
    if (requiresMfa(outcome.roleCodes)) {
      return reply.send({ status: "mfa_setup_required", setupToken: signSetupToken(boot.user_id, boot.tenant_id) });
    }
    const session = await issueSession(boot.user_id, boot.tenant_id);
    await withTenant(boot.tenant_id, (tx) =>
      audit(tx, boot.tenant_id, { actorUserId: boot.user_id, action: "auth.login", entity: "user", entityId: boot.user_id }),
    );
    return reply.send({ status: "ok", ...session });
  });

  // Second factor.
  app.post("/auth/mfa/verify", authRateLimit, async (req, reply) => {
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
        // Token reuse / mismatch — revoke the whole family for this user.
        await tx.refreshToken.updateMany({
          where: { userId: row.userId, revokedAt: null },
          data: { revokedAt: new Date() },
        });
        return false;
      }
      // Re-check account status: a disabled/terminated user must not be able to
      // keep minting access tokens off an already-issued refresh token (CWE-613).
      const user = await tx.user.findUnique({ where: { id: row.userId }, select: { disabled: true } });
      if (!user || user.disabled) {
        await tx.refreshToken.updateMany({
          where: { userId: row.userId, revokedAt: null },
          data: { revokedAt: new Date() },
        });
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
