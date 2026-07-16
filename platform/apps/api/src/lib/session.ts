import { createHash } from "node:crypto";
import { withTenant } from "@hcmos/db";
import { permissionsFor, type RoleCode, type SessionUser } from "@hcmos/shared";
import { signAccess, signRefresh } from "./jwt.js";
import { loadEnv } from "../env.js";

const sha256 = (s: string): string => createHash("sha256").update(s).digest("hex");

/** Refresh-token lifetime in ms, parsed from a compact "30d"/"12h" string. */
function ttlMs(ttl: string): number {
  const m = /^(\d+)([smhd])$/.exec(ttl);
  if (!m) return 30 * 24 * 60 * 60 * 1000;
  const n = Number(m[1]);
  const unit = m[2];
  const mult = unit === "s" ? 1e3 : unit === "m" ? 6e4 : unit === "h" ? 36e5 : 864e5;
  return n * mult;
}

export interface IssuedSession {
  accessToken: string;
  refreshToken: string;
  user: SessionUser;
}

/**
 * Load a user's roles, mint access + rotating refresh tokens, and persist the
 * refresh token (hashed) for revocation. All reads/writes are tenant-scoped.
 */
export async function issueSession(userId: string, tenantId: string): Promise<IssuedSession> {
  const env = loadEnv();
  return withTenant(tenantId, async (tx) => {
    const user = await tx.user.findUniqueOrThrow({
      where: { id: userId },
      include: { roles: true, tenant: true },
    });
    const roleCodes = user.roles.map((r) => r.roleCode as RoleCode);
    const perms = [...permissionsFor(roleCodes)];

    // Create the refresh-token row first so its id becomes the JWT's jti.
    const row = await tx.refreshToken.create({
      data: {
        userId,
        tenantId,
        tokenHash: "",
        expiresAt: new Date(Date.now() + ttlMs(env.REFRESH_TOKEN_TTL)),
      },
    });
    const refreshToken = signRefresh({ sub: userId, tid: tenantId, jti: row.id });
    await tx.refreshToken.update({
      where: { id: row.id },
      data: { tokenHash: sha256(refreshToken) },
    });

    const accessToken = signAccess({ sub: userId, tid: tenantId, roles: roleCodes, perms });

    const sessionUser: SessionUser = {
      id: user.id,
      tenantId,
      tenantSlug: user.tenant.slug,
      email: user.email,
      displayName: user.displayName,
      roles: roleCodes,
      permissions: perms,
      mfaEnabled: user.mfaEnabled,
    };
    return { accessToken, refreshToken, user: sessionUser };
  });
}

export { sha256 };
