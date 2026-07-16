import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { withTenant } from "@hcmos/db";
import { leaveLiability } from "@hcmos/statutory";
import { audit } from "../lib/audit.js";
import { callerEmployeeId, inclusiveDays } from "../lib/ess.js";
import type { RequestAuth } from "../plugins/auth.js";

const LEAVE_TYPES = ["annual", "sick", "maternity", "paternity", "unpaid"] as const;

const createSchema = z.object({
  type: z.enum(LEAVE_TYPES),
  startDate: z.string().date(),
  endDate: z.string().date(),
  reason: z.string().max(500).optional(),
});

const decideSchema = z.object({ decision: z.enum(["approve", "reject"]) });

function currentCycleYear(): number {
  return new Date().getUTCFullYear();
}

export async function leaveRoutes(app: FastifyInstance): Promise<void> {
  // List requests. Approvers see the whole tenant; everyone else sees only their own.
  app.get("/leave/requests", { preHandler: [app.authenticate] }, async (req, reply) => {
    const auth = req.auth as RequestAuth;
    const rows = await withTenant(auth.tenantId, async (tx) => {
      const seeAll = auth.permissions.has("leave:approve") || auth.permissions.has("leave:read");
      if (seeAll) {
        return tx.leaveRequest.findMany({ where: { tenantId: auth.tenantId }, orderBy: { createdAt: "desc" }, take: 200 });
      }
      const empId = await callerEmployeeId(tx, auth.userId);
      if (!empId) return [];
      return tx.leaveRequest.findMany({ where: { tenantId: auth.tenantId, employeeId: empId }, orderBy: { createdAt: "desc" } });
    });
    return reply.send({ data: rows });
  });

  // Submit a leave request for the caller's own employee record.
  app.post(
    "/leave/requests",
    { preHandler: [app.authenticate, app.requirePermission("leave:request")] },
    async (req, reply) => {
      const auth = req.auth as RequestAuth;
      const parsed = createSchema.safeParse(req.body);
      if (!parsed.success) return reply.code(400).send({ error: "bad_request", message: "Invalid request", details: parsed.error.issues });
      const input = parsed.data;
      const days = inclusiveDays(input.startDate, input.endDate);
      if (days < 1) return reply.code(400).send({ error: "bad_request", message: "End date is before start date" });

      const result = await withTenant(auth.tenantId, async (tx) => {
        const empId = await callerEmployeeId(tx, auth.userId);
        if (!empId) return { error: "no_employee" as const };
        const created = await tx.leaveRequest.create({
          data: {
            tenantId: auth.tenantId,
            employeeId: empId,
            type: input.type,
            startDate: new Date(input.startDate),
            endDate: new Date(input.endDate),
            days,
            reason: input.reason ?? null,
            requestedBy: auth.userId,
          },
        });
        await audit(tx, auth.tenantId, {
          actorUserId: auth.userId,
          action: "leave.request",
          entity: "leave_request",
          entityId: created.id,
          data: { type: input.type, days },
        });
        return { created };
      });
      if ("error" in result) {
        return reply.code(400).send({ error: "no_employee", message: "Your login is not linked to an employee record" });
      }
      return reply.code(201).send({ data: result.created });
    },
  );

  // Approve or reject. Segregation of duties: an approver cannot decide their own
  // request (enforced here and by a DB CHECK). Approval draws down the balance.
  app.post(
    "/leave/requests/:id/decide",
    { preHandler: [app.authenticate, app.requirePermission("leave:approve")] },
    async (req, reply) => {
      const auth = req.auth as RequestAuth;
      const { id } = req.params as { id: string };
      const parsed = decideSchema.safeParse(req.body);
      if (!parsed.success) return reply.code(400).send({ error: "bad_request", message: "Invalid decision" });

      const outcome = await withTenant(auth.tenantId, async (tx) => {
        const lr = await tx.leaveRequest.findUnique({ where: { id } });
        if (!lr || lr.tenantId !== auth.tenantId) return { code: 404 as const };
        if (lr.status !== "pending") return { code: 409 as const, message: "Request already decided" };
        if (lr.requestedBy === auth.userId) {
          return { code: 403 as const, message: "Segregation of duties: you cannot decide your own request" };
        }
        const status = parsed.data.decision === "approve" ? "approved" : "rejected";
        const updated = await tx.leaveRequest.update({
          where: { id },
          data: { status, decidedBy: auth.userId, decidedAt: new Date() },
        });
        if (status === "approved") {
          const cycleYear = currentCycleYear();
          await tx.leaveBalance.upsert({
            where: { tenantId_employeeId_cycleYear: { tenantId: auth.tenantId, employeeId: lr.employeeId, cycleYear } },
            update: { takenDays: { increment: lr.days } },
            create: { tenantId: auth.tenantId, employeeId: lr.employeeId, cycleYear, takenDays: lr.days },
          });
        }
        await audit(tx, auth.tenantId, {
          actorUserId: auth.userId,
          action: `leave.${status}`,
          entity: "leave_request",
          entityId: id,
        });
        return { code: 200 as const, updated };
      });

      if (outcome.code === 404) return reply.code(404).send({ error: "not_found", message: "Request not found" });
      if (outcome.code === 409) return reply.code(409).send({ error: "conflict", message: outcome.message });
      if (outcome.code === 403) return reply.code(403).send({ error: "forbidden", message: outcome.message });
      return reply.send({ data: outcome.updated });
    },
  );

  // Monetised leave liability across the workforce (design KPI). Returns totals
  // only — never per-employee salary — so it is safe for leave:read holders.
  app.get(
    "/leave/liability",
    { preHandler: [app.authenticate, app.requirePermission("leave:read")] },
    async (req, reply) => {
      const auth = req.auth as RequestAuth;
      const data = await withTenant(auth.tenantId, async (tx) => {
        const cycleYear = currentCycleYear();
        const employees = await tx.employee.findMany({
          where: { tenantId: auth.tenantId, status: "active" },
          select: { id: true, basicSalary: true },
        });
        const balances = await tx.leaveBalance.findMany({ where: { tenantId: auth.tenantId, cycleYear } });
        const balByEmp = new Map(balances.map((b) => [b.employeeId, b]));
        let total = 0;
        let accrualDays = 0;
        for (const e of employees) {
          const bal = balByEmp.get(e.id);
          const entitled = bal?.entitledDays ?? 28;
          const taken = bal?.takenDays ?? 0;
          const accrued = Math.max(entitled - taken, 0);
          accrualDays += accrued;
          if (e.basicSalary) total += leaveLiability(e.basicSalary, accrued);
        }
        return { cycleYear, employees: employees.length, accruedDays: accrualDays, monetisedTZS: total };
      });
      return reply.send({ data });
    },
  );
}
