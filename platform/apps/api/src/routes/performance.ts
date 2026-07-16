import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { withTenant } from "@hcmos/db";
import { audit } from "../lib/audit.js";
import { callerEmployeeId } from "../lib/ess.js";
import type { RequestAuth } from "../plugins/auth.js";

const createSchema = z.object({
  employeeId: z.string().uuid(),
  cycle: z.string().regex(/^\d{4}-(Q[1-4]|H[12]|\d{2})$/, "e.g. 2026-Q2"),
});

const updateSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  strengths: z.string().max(2000).optional(),
  improvements: z.string().max(2000).optional(),
});

/**
 * Performance appraisals. Lifecycle: a reviewer drafts and edits a review, then
 * submits it (rating required); the employee then acknowledges their own review.
 * Reviewers see the whole tenant; employees see only their own reviews.
 */
export async function performanceRoutes(app: FastifyInstance): Promise<void> {
  app.get("/performance/reviews", { preHandler: [app.authenticate] }, async (req, reply) => {
    const auth = req.auth as RequestAuth;
    const rows = await withTenant(auth.tenantId, async (tx) => {
      if (auth.permissions.has("performance:read")) {
        return tx.performanceReview.findMany({ where: { tenantId: auth.tenantId }, orderBy: { createdAt: "desc" }, take: 200 });
      }
      const empId = await callerEmployeeId(tx, auth.userId);
      if (!empId) return [];
      return tx.performanceReview.findMany({ where: { tenantId: auth.tenantId, employeeId: empId }, orderBy: { createdAt: "desc" } });
    });
    return reply.send({ data: rows });
  });

  app.post(
    "/performance/reviews",
    { preHandler: [app.authenticate, app.requirePermission("performance:write")] },
    async (req, reply) => {
      const auth = req.auth as RequestAuth;
      const parsed = createSchema.safeParse(req.body);
      if (!parsed.success) return reply.code(400).send({ error: "bad_request", message: "Invalid review", details: parsed.error.issues });

      const outcome = await withTenant(auth.tenantId, async (tx) => {
        const emp = await tx.employee.findUnique({ where: { id: parsed.data.employeeId } });
        if (!emp || emp.tenantId !== auth.tenantId) return { code: 404 as const };
        const existing = await tx.performanceReview.findUnique({
          where: { tenantId_employeeId_cycle: { tenantId: auth.tenantId, employeeId: parsed.data.employeeId, cycle: parsed.data.cycle } },
        });
        if (existing) return { code: 409 as const };
        const created = await tx.performanceReview.create({
          data: {
            tenantId: auth.tenantId,
            employeeId: parsed.data.employeeId,
            cycle: parsed.data.cycle,
            reviewerId: auth.userId,
          },
        });
        await audit(tx, auth.tenantId, { actorUserId: auth.userId, action: "performance.create", entity: "performance_review", entityId: created.id });
        return { code: 201 as const, created };
      });
      if (outcome.code === 404) return reply.code(404).send({ error: "not_found", message: "Employee not found" });
      if (outcome.code === 409) return reply.code(409).send({ error: "conflict", message: "Review already exists for this cycle" });
      return reply.code(201).send({ data: outcome.created });
    },
  );

  app.patch(
    "/performance/reviews/:id",
    { preHandler: [app.authenticate, app.requirePermission("performance:write")] },
    async (req, reply) => {
      const auth = req.auth as RequestAuth;
      const { id } = req.params as { id: string };
      const parsed = updateSchema.safeParse(req.body);
      if (!parsed.success) return reply.code(400).send({ error: "bad_request", message: "Invalid update" });
      const outcome = await withTenant(auth.tenantId, async (tx) => {
        const r = await tx.performanceReview.findUnique({ where: { id } });
        if (!r || r.tenantId !== auth.tenantId) return { code: 404 as const };
        if (r.status !== "draft") return { code: 409 as const, message: "Only draft reviews can be edited" };
        const updated = await tx.performanceReview.update({ where: { id }, data: parsed.data });
        return { code: 200 as const, updated };
      });
      if (outcome.code === 404) return reply.code(404).send({ error: "not_found", message: "Review not found" });
      if (outcome.code === 409) return reply.code(409).send({ error: "conflict", message: outcome.message });
      return reply.send({ data: outcome.updated });
    },
  );

  app.post(
    "/performance/reviews/:id/submit",
    { preHandler: [app.authenticate, app.requirePermission("performance:write")] },
    async (req, reply) => {
      const auth = req.auth as RequestAuth;
      const { id } = req.params as { id: string };
      const outcome = await withTenant(auth.tenantId, async (tx) => {
        const r = await tx.performanceReview.findUnique({ where: { id } });
        if (!r || r.tenantId !== auth.tenantId) return { code: 404 as const };
        if (r.status !== "draft") return { code: 409 as const, message: "Review already submitted" };
        if (r.rating == null) return { code: 400 as const, message: "A rating is required before submitting" };
        const updated = await tx.performanceReview.update({ where: { id }, data: { status: "submitted", submittedAt: new Date() } });
        await audit(tx, auth.tenantId, { actorUserId: auth.userId, action: "performance.submit", entity: "performance_review", entityId: id });
        return { code: 200 as const, updated };
      });
      if (outcome.code === 404) return reply.code(404).send({ error: "not_found", message: "Review not found" });
      if (outcome.code === 400) return reply.code(400).send({ error: "bad_request", message: outcome.message });
      if (outcome.code === 409) return reply.code(409).send({ error: "conflict", message: outcome.message });
      return reply.send({ data: outcome.updated });
    },
  );

  // The employee acknowledges their OWN submitted review (no elevated permission).
  app.post("/performance/reviews/:id/acknowledge", { preHandler: [app.authenticate] }, async (req, reply) => {
    const auth = req.auth as RequestAuth;
    const { id } = req.params as { id: string };
    const outcome = await withTenant(auth.tenantId, async (tx) => {
      const r = await tx.performanceReview.findUnique({ where: { id } });
      if (!r || r.tenantId !== auth.tenantId) return { code: 404 as const };
      const empId = await callerEmployeeId(tx, auth.userId);
      if (!empId || empId !== r.employeeId) return { code: 403 as const };
      if (r.status !== "submitted") return { code: 409 as const, message: "Review is not awaiting acknowledgement" };
      const updated = await tx.performanceReview.update({ where: { id }, data: { status: "acknowledged", acknowledgedAt: new Date() } });
      await audit(tx, auth.tenantId, { actorUserId: auth.userId, action: "performance.acknowledge", entity: "performance_review", entityId: id });
      return { code: 200 as const, updated };
    });
    if (outcome.code === 404) return reply.code(404).send({ error: "not_found", message: "Review not found" });
    if (outcome.code === 403) return reply.code(403).send({ error: "forbidden", message: "You can only acknowledge your own review" });
    if (outcome.code === 409) return reply.code(409).send({ error: "conflict", message: outcome.message });
    return reply.send({ data: outcome.updated });
  });
}
