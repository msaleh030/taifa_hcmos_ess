import { PrismaClient, Prisma } from "../generated/client/index.js";

export { Prisma };
export type { PrismaClient };
export type TenantClient = Prisma.TransactionClient;

let _prisma: PrismaClient | undefined;

/** Process-wide Prisma singleton (avoids exhausting connections on reload). */
export function getPrisma(): PrismaClient {
  if (!_prisma) {
    _prisma = new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    });
  }
  return _prisma;
}

/**
 * Run `fn` inside a transaction bound to `tenantId`. The `SET LOCAL` binds the
 * GUC that every RLS policy reads, so all queries `fn` issues on `tx` are
 * transparently scoped to that tenant — a missing or wrong tenant id yields zero
 * rows, never another tenant's data. This is the ONLY sanctioned way for the API
 * to touch tenant data.
 */
export async function withTenant<T>(
  tenantId: string,
  fn: (tx: TenantClient) => Promise<T>,
): Promise<T> {
  const prisma = getPrisma();
  return prisma.$transaction(async (tx) => {
    // set_config(key, value, is_local=true) === SET LOCAL — scoped to this tx.
    await tx.$executeRaw`SELECT set_config('app.current_tenant', ${tenantId}, true)`;
    return fn(tx);
  });
}

export interface AuthLookupRow {
  user_id: string;
  tenant_id: string;
  tenant_slug: string;
  email: string;
  password_hash: string;
  display_name: string;
  mfa_secret: string | null;
  mfa_enabled: boolean;
  disabled: boolean;
}

/**
 * Login bootstrap. Calls the SECURITY DEFINER `auth_lookup` function, the one
 * sanctioned pre-authentication read (no tenant is bound yet). Returns the
 * single candidate matching tenant slug + email, or null.
 */
export async function authLookup(slug: string, email: string): Promise<AuthLookupRow | null> {
  const rows = await getPrisma().$queryRaw<AuthLookupRow[]>`
    SELECT * FROM auth_lookup(${slug}, ${email})
  `;
  return rows[0] ?? null;
}
