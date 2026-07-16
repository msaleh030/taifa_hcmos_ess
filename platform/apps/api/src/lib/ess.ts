import type { TenantClient } from "@hcmos/db";

/**
 * The employee record backing an Employee Self-Service login, or null for a
 * back-office user with no linked employee. Self-scoped ("my leave", "my
 * attendance") endpoints filter on this.
 */
export async function callerEmployeeId(tx: TenantClient, userId: string): Promise<string | null> {
  const u = await tx.user.findUnique({ where: { id: userId }, select: { employeeId: true } });
  return u?.employeeId ?? null;
}

/** Whole inclusive days between two ISO dates (YYYY-MM-DD). */
export function inclusiveDays(startISO: string, endISO: string): number {
  const start = Date.parse(`${startISO}T00:00:00Z`);
  const end = Date.parse(`${endISO}T00:00:00Z`);
  return Math.floor((end - start) / 86_400_000) + 1;
}
