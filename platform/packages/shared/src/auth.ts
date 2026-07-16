import { z } from "zod";
import { ROLE_CODES } from "./roles.js";

export const loginSchema = z.object({
  tenantSlug: z.string().min(1).max(63),
  email: z.string().email(),
  password: z.string().min(1).max(200),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const mfaVerifySchema = z.object({
  mfaToken: z.string().min(10),
  code: z.string().regex(/^\d{6}$/, "6-digit code"),
});
export type MfaVerifyInput = z.infer<typeof mfaVerifySchema>;

export const mfaEnrollVerifySchema = z.object({
  code: z.string().regex(/^\d{6}$/),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(10),
});

/** Result of a first-factor login. */
export type LoginResult =
  | { status: "mfa_required"; mfaToken: string }
  | { status: "mfa_setup_required"; setupToken: string }
  | { status: "ok"; accessToken: string; refreshToken: string; user: SessionUser };

export interface SessionUser {
  id: string;
  tenantId: string;
  tenantSlug: string;
  email: string;
  displayName: string;
  roles: (typeof ROLE_CODES)[number][];
  permissions: string[];
  mfaEnabled: boolean;
}

/** JWT access-token claims. `sub` = user id; `tid` = tenant id (drives RLS). */
export interface AccessClaims {
  sub: string;
  tid: string;
  roles: string[];
  perms: string[];
  typ: "access";
  /**
   * True for a restricted "MFA setup" token: it carries no roles/permissions, so
   * every data route rejects it — the holder can only enroll MFA, then re-login.
   */
  mfaPending?: boolean;
}
