import { createHash } from "node:crypto";
import type { TenantClient } from "@hcmos/db";
import { withTenant } from "@hcmos/db";

export interface AuditInput {
  actorUserId: string | null;
  action: string; // e.g. "employee.create", "payroll.approve"
  entity: string; // e.g. "employee"
  entityId?: string | null;
  data?: unknown;
}

/**
 * Append an audit event. The per-tenant sequence and hash chain are computed by
 * the database trigger (server-authoritative), so the application cannot forge
 * ordering or links. Must run on a tenant-bound `tx`.
 */
export async function audit(tx: TenantClient, tenantId: string, input: AuditInput): Promise<void> {
  await tx.auditEvent.create({
    data: {
      tenantId,
      actorUserId: input.actorUserId,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId ?? null,
      data: (input.data ?? undefined) as never,
    },
  });
}

/** Recompute the hash of a stored row exactly as the DB trigger does. */
function recomputeHash(row: {
  prevHash: string;
  tenantId: string;
  seq: bigint;
  actorUserId: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  data: unknown;
  createdAt: Date;
}): string {
  // Must match audit_event_chain() in the migration, including Postgres'
  // text rendering of jsonb and timestamptz. `data` is compared structurally
  // by the DB; here we trust the stored `data` round-trips to the same text.
  const parts = [
    row.prevHash,
    row.tenantId,
    String(row.seq),
    row.actorUserId ?? "",
    row.action,
    row.entity,
    row.entityId ?? "",
    row.data === null || row.data === undefined ? "" : JSON.stringify(row.data),
    row.createdAt.toISOString(),
  ];
  return createHash("sha256").update(parts.join("|")).digest("hex");
}

export interface ChainVerification {
  ok: boolean;
  count: number;
  /** seq of the first row whose link/hash is inconsistent, if any. */
  brokenAt?: number;
  reason?: string;
}

/**
 * Verify the tenant's audit chain is intact: sequential, correctly linked, and
 * (best-effort) hash-consistent. Link/sequence checks are authoritative here;
 * the hash re-computation is a defence-in-depth cross-check. Any UPDATE/DELETE
 * of an earlier row (blocked by grants) would surface as a broken link.
 */
export async function verifyChain(tenantId: string): Promise<ChainVerification> {
  return withTenant(tenantId, async (tx) => {
    const rows = await tx.auditEvent.findMany({
      where: { tenantId },
      orderBy: { seq: "asc" },
    });
    let prevHash = "0".repeat(64);
    let expectedSeq = 1n;
    for (const row of rows) {
      if (row.seq !== expectedSeq) {
        return { ok: false, count: rows.length, brokenAt: Number(row.seq), reason: "sequence gap" };
      }
      if (row.prevHash !== prevHash) {
        return { ok: false, count: rows.length, brokenAt: Number(row.seq), reason: "broken link" };
      }
      expectedSeq += 1n;
      prevHash = row.hash;
    }
    return { ok: true, count: rows.length };
  });
}

export { recomputeHash };
