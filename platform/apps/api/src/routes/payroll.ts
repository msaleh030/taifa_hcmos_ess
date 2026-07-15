import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { withTenant } from "@hcmos/db";
import { computePayslip, resolveTable } from "@hcmos/statutory";
import { audit } from "../lib/audit.js";
import type { RequestAuth } from "../plugins/auth.js";

const createRunSchema = z.object({
  period: z.string().regex(/^\d{4}-\d{2}$/, "Expected YYYY-MM"),
});

export async function payrollRoutes(app: FastifyInstance): Promise<void> {
  // Maker: run payroll. Computes statutory lines for every active employee.
  app.post(
    "/payroll/runs",
    { preHandler: [app.authenticate, app.requirePermission("payroll:run")] },
    async (req, reply) => {
      const auth = req.auth as RequestAuth;
      const parsed = createRunSchema.safeParse(req.body);
      if (!parsed.success) return reply.code(400).send({ error: "bad_request", message: "Invalid period" });
      const { period } = parsed.data;

      const result = await withTenant(auth.tenantId, async (tx) => {
        const existing = await tx.payrollRun.findUnique({
          where: { tenantId_period: { tenantId: auth.tenantId, period } },
        });
        if (existing) return { conflict: true as const };

        const employees = await tx.employee.findMany({
          where: { tenantId: auth.tenantId, status: "active" },
        });
        const headcount = employees.length;
        const table = resolveTable(`${period}-01`);

        const run = await tx.payrollRun.create({
          data: {
            tenantId: auth.tenantId,
            period,
            status: "run",
            tableId: table.id,
            createdBy: auth.userId,
          },
        });

        let grossTotal = 0n;
        let netTotal = 0n;
        let statTotal = 0n;
        for (const e of employees) {
          const gross = e.basicSalary ?? 0;
          if (gross <= 0) continue; // cannot pay without a salary on record
          const slip = computePayslip({ gross, employerHeadcount: headcount, periodDate: `${period}-01` });
          await tx.payslip.create({
            data: {
              tenantId: auth.tenantId,
              runId: run.id,
              employeeId: e.id,
              gross,
              nssfEmployee: slip.employee.nssfEmployee,
              paye: slip.employee.paye,
              netPay: slip.employee.netPay,
              employerTotal: slip.employer.totalEmployerContributions,
              statutoryTotal: slip.statutoryTotal,
            },
          });
          grossTotal += BigInt(gross);
          netTotal += BigInt(slip.employee.netPay);
          statTotal += BigInt(slip.statutoryTotal);
        }

        const finalRun = await tx.payrollRun.update({
          where: { id: run.id },
          data: { grossTotal, netTotal, statTotal },
        });
        await audit(tx, auth.tenantId, {
          actorUserId: auth.userId,
          action: "payroll.run",
          entity: "payroll_run",
          entityId: run.id,
          data: { period, headcount, tableId: table.id },
        });
        return { conflict: false as const, run: finalRun };
      });

      if (result.conflict) return reply.code(409).send({ error: "conflict", message: "Run already exists for period" });
      return reply.code(201).send({ data: serializeRun(result.run) });
    },
  );

  app.get(
    "/payroll/runs",
    { preHandler: [app.authenticate, app.requirePermission("payroll:read")] },
    async (req, reply) => {
      const auth = req.auth as RequestAuth;
      const runs = await withTenant(auth.tenantId, (tx) =>
        tx.payrollRun.findMany({ where: { tenantId: auth.tenantId }, orderBy: { period: "desc" } }),
      );
      return reply.send({ data: runs.map(serializeRun) });
    },
  );

  app.get(
    "/payroll/runs/:id",
    { preHandler: [app.authenticate, app.requirePermission("payroll:read")] },
    async (req, reply) => {
      const auth = req.auth as RequestAuth;
      const { id } = req.params as { id: string };
      const run = await withTenant(auth.tenantId, (tx) =>
        tx.payrollRun.findUnique({ where: { id }, include: { payslips: true } }),
      );
      if (!run || run.tenantId !== auth.tenantId) {
        return reply.code(404).send({ error: "not_found", message: "Run not found" });
      }
      return reply.send({ data: { ...serializeRun(run), payslips: run.payslips } });
    },
  );

  // Checker: approve payroll. Segregation of duties — the approver must differ
  // from the creator; the DB also enforces this with a CHECK constraint.
  app.post(
    "/payroll/runs/:id/approve",
    { preHandler: [app.authenticate, app.requirePermission("payroll:approve")] },
    async (req, reply) => {
      const auth = req.auth as RequestAuth;
      const { id } = req.params as { id: string };
      const result = await withTenant(auth.tenantId, async (tx) => {
        const run = await tx.payrollRun.findUnique({ where: { id } });
        if (!run || run.tenantId !== auth.tenantId) return { code: 404 as const };
        if (run.status !== "run") return { code: 409 as const, message: "Run is not awaiting approval" };
        if (run.createdBy === auth.userId) {
          return { code: 403 as const, message: "Segregation of duties: maker cannot approve their own run" };
        }
        const updated = await tx.payrollRun.update({
          where: { id },
          data: { status: "approved", approvedBy: auth.userId, approvedAt: new Date() },
        });
        await audit(tx, auth.tenantId, {
          actorUserId: auth.userId,
          action: "payroll.approve",
          entity: "payroll_run",
          entityId: id,
        });
        return { code: 200 as const, run: updated };
      });
      if (result.code === 404) return reply.code(404).send({ error: "not_found", message: "Run not found" });
      if (result.code === 409) return reply.code(409).send({ error: "conflict", message: result.message });
      if (result.code === 403) return reply.code(403).send({ error: "forbidden", message: result.message });
      return reply.send({ data: serializeRun(result.run) });
    },
  );
}

function serializeRun(run: {
  id: string;
  period: string;
  status: string;
  tableId: string;
  createdBy: string;
  approvedBy: string | null;
  grossTotal: bigint;
  netTotal: bigint;
  statTotal: bigint;
  createdAt: Date;
  approvedAt: Date | null;
}) {
  return {
    id: run.id,
    period: run.period,
    status: run.status,
    tableId: run.tableId,
    createdBy: run.createdBy,
    approvedBy: run.approvedBy,
    grossTotal: run.grossTotal.toString(),
    netTotal: run.netTotal.toString(),
    statTotal: run.statTotal.toString(),
    createdAt: run.createdAt.toISOString(),
    approvedAt: run.approvedAt?.toISOString() ?? null,
  };
}
