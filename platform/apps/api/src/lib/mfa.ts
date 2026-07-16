import { authenticator } from "otplib";
import { createHash, randomBytes } from "node:crypto";
import { loadEnv } from "../env.js";

// Allow ±1 time step (30s) of clock drift.
authenticator.options = { window: 1 };

export function generateMfaSecret(): string {
  return authenticator.generateSecret();
}

/** otpauth:// URI for the authenticator-app QR code. */
export function mfaKeyUri(secret: string, accountEmail: string): string {
  const env = loadEnv();
  return authenticator.keyuri(accountEmail, env.MFA_ISSUER, secret);
}

export function verifyTotp(code: string, secret: string): boolean {
  try {
    return authenticator.verify({ token: code, secret });
  } catch {
    return false;
  }
}

/** One-time recovery codes, returned once at enrollment and stored hashed. */
export function generateRecoveryCodes(count = 8): { plain: string[]; hashed: string[] } {
  const plain: string[] = [];
  const hashed: string[] = [];
  for (let i = 0; i < count; i++) {
    const code = randomBytes(5).toString("hex"); // 10 hex chars
    plain.push(code);
    hashed.push(createHash("sha256").update(code).digest("hex"));
  }
  return { plain, hashed };
}
