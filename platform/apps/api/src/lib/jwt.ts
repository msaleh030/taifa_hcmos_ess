import jwt from "jsonwebtoken";
import type { AccessClaims } from "@hcmos/shared";
import { loadEnv } from "../env.js";

export interface RefreshClaims {
  sub: string; // user id
  tid: string; // tenant id
  jti: string; // refresh-token id (matched against refresh_token table)
  typ: "refresh";
}

export function signAccess(claims: Omit<AccessClaims, "typ">): string {
  const env = loadEnv();
  return jwt.sign({ ...claims, typ: "access" } satisfies AccessClaims, env.JWT_ACCESS_SECRET, {
    expiresIn: env.ACCESS_TOKEN_TTL as jwt.SignOptions["expiresIn"],
  });
}

export function verifyAccess(token: string): AccessClaims {
  const env = loadEnv();
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessClaims;
  if (decoded.typ !== "access") throw new Error("wrong token type");
  return decoded;
}

export function signRefresh(claims: Omit<RefreshClaims, "typ">): string {
  const env = loadEnv();
  return jwt.sign({ ...claims, typ: "refresh" } satisfies RefreshClaims, env.JWT_REFRESH_SECRET, {
    expiresIn: env.REFRESH_TOKEN_TTL as jwt.SignOptions["expiresIn"],
  });
}

export function verifyRefresh(token: string): RefreshClaims {
  const env = loadEnv();
  const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshClaims;
  if (decoded.typ !== "refresh") throw new Error("wrong token type");
  return decoded;
}

/** Short-lived token issued between first factor and MFA verification. */
export function signMfaChallenge(userId: string, tenantId: string): string {
  const env = loadEnv();
  return jwt.sign({ sub: userId, tid: tenantId, typ: "mfa" }, env.JWT_ACCESS_SECRET, {
    expiresIn: "5m",
  });
}

export function verifyMfaChallenge(token: string): { sub: string; tid: string } {
  const env = loadEnv();
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as {
    sub: string;
    tid: string;
    typ: string;
  };
  if (decoded.typ !== "mfa") throw new Error("wrong token type");
  return { sub: decoded.sub, tid: decoded.tid };
}
