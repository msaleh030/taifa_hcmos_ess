import type { FastifyInstance } from "fastify";
import { withTenant } from "@hcmos/db";
import { verifyChain } from "../lib/audit.js";
import type { RequestAuth } from "../plugins/auth.js";

export async function auditRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/audit/events",
    { preHandler: [app.authenticate, app.requirePermission("audit:read")] },
    async (req, reply) => {
      const auth = req.auth as RequestAuth;
      const q = req.query as { limit?: string };
      const limit = Math.min(Math.max(Number(q.limit ?? 100), 1), 500);
      const rows = await withTenant(auth.tenantId, (tx) =>
        tx.auditEvent.findMany({
          where: { tenantId: auth.tenantId },
          orderBy: { seq: "desc" },
          take: limit,
        }),
      );
      return reply.send({
        data: rows.map((r) => ({
          seq: Number(r.seq),
          action: r.action,
          entity: r.entity,
          entityId: r.entityId,
          actorUserId: r.actorUserId,
          hash: r.hash,
          prevHash: r.prevHash,
          createdAt: r.createdAt.toISOString(),
        })),
      });
    },
  );

  // Integrity check — recompute the chain and report the first break, if any.
  app.get(
    "/audit/verify",
    { preHandler: [app.authenticate, app.requirePermission("audit:read")] },
    async (req, reply) => {
      const auth = req.auth as RequestAuth;
      const result = await verifyChain(auth.tenantId);
      return reply.send({ data: result });
    },
  );
}
