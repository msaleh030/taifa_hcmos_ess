import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { withTenant } from "@hcmos/db";
import { audit } from "../lib/audit.js";
import { callerEmployeeId } from "../lib/ess.js";
import type { RequestAuth } from "../plugins/auth.js";

const createSchema = z.object({
  employeeId: z.string().uuid(),
  course: z.string().min(1).max(160),
  provider: z.string().max(160).optional(),
  status: z.enum(["planned", "completed", "expired"]).optional(),
  completedOn: z.string().date().optional(),
  expiresOn: z.string().date().optional(),
});

const updateSchema = z.object({
  status: z.enum(["planned", "completed", "expired"]).optional(),
  completedOn: z.string().date().optional(),
  expiresOn: z.string().date().optional(),
});

/** Training & competency records with an expiry/compliance summary. */
export async function trainingRoutes(app: FastifyInstance): Promise<void> {
  app.get("/training", { preHandler: [app.authenticate] }, async (req, reply) => {
    const auth = req.auth as RequestAuth;
    const rows = await withTenant(auth.tenantId, async (tx) => {
      if (auth.permissions.has("training:read")) {
        return tx.trainingRecord.findMany({ where: { tenantId: auth.tenantId }, orderBy: { createdAt: "desc" }, take: 300 });
      }
      const empId = await callerEmployeeId(tx, auth.userId);
      if (!empId) return [];
      return tx.trainingRecord.findMany({ where: { tenantId: auth.tenantId, employeeId: empId }, orderBy: { createdAt: "desc" } });
    });
    return reply.send({ data: rows });
  });

  app.post("/training", { preHandler: [app.authenticate, app.requirePermission("training:write")] }, async (req, reply) => {
    const auth = req.auth as RequestAuth;
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: "bad_request", message: "Invalid training record", details: parsed.error.issues });
    const outcome = await withTenant(auth.tenantId, async (tx) => {
      const emp = await tx.employee.findUnique({ where: { id: parsed.data.employeeId } });
      if (!emp || emp.tenantId !== auth.tenantId) return { code: 404 as const };
      const rec = await tx.trainingRecord.create({
        data: {
          tenantId: auth.tenantId,
          employeeId: parsed.data.employeeId,
          course: parsed.data.course,
          provider: parsed.data.provider ?? null,
          status: parsed.data.status ?? "planned",
          completedOn: parsed.data.completedOn ? new Date(parsed.data.completedOn) : null,
          expiresOn: parsed.data.expiresOn ? new Date(parsed.data.expiresOn) : null,
        },
      });
      await audit(tx, auth.tenantId, { actorUserId: auth.userId, action: "training.create", entity: "training_record", entityId: rec.id, data: { course: rec.course } });
      return { code: 201 as const, rec };
    });
    if (outcome.code === 404) return reply.code(404).send({ error: "not_found", message: "Employee not found" });
    return reply.code(201).send({ data: outcome.rec });
  });

  app.patch("/training/:id", { preHandler: [app.authenticate, app.requirePermission("training:write")] }, async (req, reply) => {
    const auth = req.auth as RequestAuth;
    const { id } = req.params as { id: string };
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: "bad_request", message: "Invalid update" });
    const outcome = await withTenant(auth.tenantId, async (tx) => {
      const rec = await tx.trainingRecord.findUnique({ where: { id } });
      if (!rec || rec.tenantId !== auth.tenantId) return { code: 404 as const };
      const updated = await tx.trainingRecord.update({
        where: { id },
        data: {
          status: parsed.data.status,
          completedOn: parsed.data.completedOn ? new Date(parsed.data.completedOn) : undefined,
          expiresOn: parsed.data.expiresOn ? new Date(parsed.data.expiresOn) : undefined,
        },
      });
      await audit(tx, auth.tenantId, { actorUserId: auth.userId, action: "training.update", entity: "training_record", entityId: id });
      return { code: 200 as const, updated };
    });
    if (outcome.code === 404) return reply.code(404).send({ error: "not_found", message: "Training record not found" });
    return reply.send({ data: outcome.updated });
  });

  app.get("/training/summary", { preHandler: [app.authenticate, app.requirePermission("training:read")] }, async (req, reply) => {
    const auth = req.auth as RequestAuth;
    const data = await withTenant(auth.tenantId, async (tx) => {
      const now = new Date();
      const soon = new Date(now.getTime() + 60 * 86_400_000);
      const rows = await tx.trainingRecord.findMany({ where: { tenantId: auth.tenantId } });
      const total = rows.length;
      const completed = rows.filter((r) => r.status === "completed").length;
      const planned = rows.filter((r) => r.status === "planned").length;
      const expired = rows.filter((r) => r.status === "expired" || (r.expiresOn && r.expiresOn < now)).length;
      const expiringSoon = rows.filter((r) => r.expiresOn && r.expiresOn >= now && r.expiresOn <= soon).length;
      return { total, completed, planned, expired, expiringSoon, compliancePct: total ? Math.round((completed / total) * 100) : 0 };
    });
    return reply.send({ data });
  });
}
