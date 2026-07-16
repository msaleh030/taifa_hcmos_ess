import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { withTenant } from "@hcmos/db";
import { audit } from "../lib/audit.js";
import type { RequestAuth } from "../plugins/auth.js";

const incidentSchema = z.object({
  employeeId: z.string().uuid().optional(),
  locationCode: z.string().regex(/^[A-Z]{2,4}$/),
  category: z.enum(["injury", "near_miss", "property", "environmental"]),
  severity: z.enum(["low", "medium", "high", "lti"]),
  description: z.string().min(1).max(2000),
  occurredOn: z.string().date(),
});

const statusSchema = z.object({ status: z.enum(["open", "investigating", "closed"]) });

const ppeSchema = z.object({
  employeeId: z.string().uuid(),
  item: z.enum(["helmet", "boots", "hi_vis", "gloves", "respirator"]),
  issuedOn: z.string().date(),
  expiresOn: z.string().date().optional(),
});

const medicalSchema = z.object({
  employeeId: z.string().uuid(),
  type: z.enum(["osha", "pre_employment", "periodic"]),
  validFrom: z.string().date(),
  validTo: z.string().date(),
});

function daysBetween(a: Date, b: Date): number {
  return Math.floor((a.getTime() - b.getTime()) / 86_400_000);
}

/** HSEQ: incident logging, PPE issue, medical validity, and safety KPIs. */
export async function hseqRoutes(app: FastifyInstance): Promise<void> {
  app.get("/hseq/incidents", { preHandler: [app.authenticate, app.requirePermission("hseq:read")] }, async (req, reply) => {
    const auth = req.auth as RequestAuth;
    const rows = await withTenant(auth.tenantId, (tx) =>
      tx.hseqIncident.findMany({ where: { tenantId: auth.tenantId }, orderBy: { occurredOn: "desc" }, take: 200 }),
    );
    return reply.send({ data: rows });
  });

  app.post("/hseq/incidents", { preHandler: [app.authenticate, app.requirePermission("hseq:write")] }, async (req, reply) => {
    const auth = req.auth as RequestAuth;
    const parsed = incidentSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: "bad_request", message: "Invalid incident", details: parsed.error.issues });
    const created = await withTenant(auth.tenantId, async (tx) => {
      const rec = await tx.hseqIncident.create({
        data: {
          tenantId: auth.tenantId,
          employeeId: parsed.data.employeeId ?? null,
          locationCode: parsed.data.locationCode,
          category: parsed.data.category,
          severity: parsed.data.severity,
          description: parsed.data.description,
          occurredOn: new Date(parsed.data.occurredOn),
          reportedBy: auth.userId,
        },
      });
      await audit(tx, auth.tenantId, {
        actorUserId: auth.userId,
        action: "hseq.incident.report",
        entity: "hseq_incident",
        entityId: rec.id,
        data: { severity: rec.severity, category: rec.category },
      });
      return rec;
    });
    return reply.code(201).send({ data: created });
  });

  app.patch("/hseq/incidents/:id", { preHandler: [app.authenticate, app.requirePermission("hseq:write")] }, async (req, reply) => {
    const auth = req.auth as RequestAuth;
    const { id } = req.params as { id: string };
    const parsed = statusSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: "bad_request", message: "Invalid status" });
    const outcome = await withTenant(auth.tenantId, async (tx) => {
      const rec = await tx.hseqIncident.findUnique({ where: { id } });
      if (!rec || rec.tenantId !== auth.tenantId) return { code: 404 as const };
      const updated = await tx.hseqIncident.update({ where: { id }, data: { status: parsed.data.status } });
      await audit(tx, auth.tenantId, { actorUserId: auth.userId, action: "hseq.incident.status", entity: "hseq_incident", entityId: id, data: { status: parsed.data.status } });
      return { code: 200 as const, updated };
    });
    if (outcome.code === 404) return reply.code(404).send({ error: "not_found", message: "Incident not found" });
    return reply.send({ data: outcome.updated });
  });

  app.post("/hseq/ppe", { preHandler: [app.authenticate, app.requirePermission("hseq:write")] }, async (req, reply) => {
    const auth = req.auth as RequestAuth;
    const parsed = ppeSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: "bad_request", message: "Invalid PPE issue" });
    const created = await withTenant(auth.tenantId, (tx) =>
      tx.ppeIssue.create({
        data: {
          tenantId: auth.tenantId,
          employeeId: parsed.data.employeeId,
          item: parsed.data.item,
          issuedOn: new Date(parsed.data.issuedOn),
          expiresOn: parsed.data.expiresOn ? new Date(parsed.data.expiresOn) : null,
        },
      }),
    );
    return reply.code(201).send({ data: created });
  });

  app.post("/hseq/medicals", { preHandler: [app.authenticate, app.requirePermission("hseq:write")] }, async (req, reply) => {
    const auth = req.auth as RequestAuth;
    const parsed = medicalSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: "bad_request", message: "Invalid medical record" });
    const created = await withTenant(auth.tenantId, (tx) =>
      tx.medicalRecord.create({
        data: {
          tenantId: auth.tenantId,
          employeeId: parsed.data.employeeId,
          type: parsed.data.type,
          validFrom: new Date(parsed.data.validFrom),
          validTo: new Date(parsed.data.validTo),
        },
      }),
    );
    return reply.code(201).send({ data: created });
  });

  // Safety KPIs mirrored from the design dashboard.
  app.get("/hseq/summary", { preHandler: [app.authenticate, app.requirePermission("hseq:read")] }, async (req, reply) => {
    const auth = req.auth as RequestAuth;
    const data = await withTenant(auth.tenantId, async (tx) => {
      const now = new Date();
      const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
      const yearStart = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));

      const incidents = await tx.hseqIncident.findMany({ where: { tenantId: auth.tenantId } });
      const ltis = incidents.filter((i) => i.severity === "lti");
      const lastLti = ltis.sort((a, b) => b.occurredOn.getTime() - a.occurredOn.getTime())[0];
      const daysSinceLti = lastLti ? daysBetween(now, lastLti.occurredOn) : null;
      const incidentsMtd = incidents.filter((i) => i.occurredOn >= monthStart).length;
      const ltiYtd = ltis.filter((i) => i.occurredOn >= yearStart).length;

      const activeEmployees = await tx.employee.count({ where: { tenantId: auth.tenantId, status: "active" } });
      const medicals = await tx.medicalRecord.findMany({ where: { tenantId: auth.tenantId } });
      const employeesWithValidMedical = new Set(
        medicals.filter((m) => m.validFrom <= now && m.validTo >= now).map((m) => m.employeeId),
      ).size;
      const validMedicalPct = activeEmployees ? Math.round((employeesWithValidMedical / activeEmployees) * 100) : 0;

      const ppe = await tx.ppeIssue.findMany({ where: { tenantId: auth.tenantId } });
      const employeesWithCurrentPpe = new Set(
        ppe.filter((p) => !p.expiresOn || p.expiresOn >= now).map((p) => p.employeeId),
      ).size;
      const ppeCompliancePct = activeEmployees ? Math.round((employeesWithCurrentPpe / activeEmployees) * 100) : 0;

      return { daysSinceLti, incidentsMtd, ltiYtd, openIncidents: incidents.filter((i) => i.status !== "closed").length, validMedicalPct, ppeCompliancePct };
    });
    return reply.send({ data });
  });
}
