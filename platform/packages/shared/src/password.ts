/**
 * Server-only password hashing. Imported via the "@hcmos/shared/password" entry
 * point so `node:crypto` never reaches the browser bundle.
 *
 * Uses scrypt (memory-hard, in the Node standard library — no native build step,
 * which keeps CI and the Hostinger VPS simple). Format: `scrypt$N$r$p$salt$hash`,
 * all base64url. For a very high-security deployment, swap this for argon2id;
 * the format tag makes the hashes self-describing and migratable.
 */
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const N = 16384; // CPU/memory cost
const r = 8;
const p = 1;
const KEYLEN = 32;

const b64 = (b: Buffer): string => b.toString("base64url");

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, KEYLEN, { N, r, p, maxmem: 64 * 1024 * 1024 });
  return `scrypt$${N}$${r}$${p}$${b64(salt)}$${b64(hash)}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const [, nStr, rStr, pStr, saltB64, hashB64] = parts as [
    string,
    string,
    string,
    string,
    string,
    string,
  ];
  const salt = Buffer.from(saltB64, "base64url");
  const expected = Buffer.from(hashB64, "base64url");
  const actual = scryptSync(password, salt, expected.length, {
    N: Number(nStr),
    r: Number(rStr),
    p: Number(pStr),
    maxmem: 64 * 1024 * 1024,
  });
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
