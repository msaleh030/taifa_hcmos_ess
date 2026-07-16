import type { FastifyInstance } from "fastify";
import { withTenant } from "@hcmos/db";
import { getExactAdapter } from "../integrations/exact/client.js";
import { buildPayrollJournal } from "../integrations/exact/adapter.js";
import { audit } from "../lib/audit.js";
import type { RequestAuth } from "../plugins/auth.js";

export async function integrationRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/integrations/exact/status",
    { preHandler: [app.authenticate, app.requirePermission("integration:manage")] },
    async (req, reply) => {
      const auth = req.auth as RequestAuth;
      const adapter = getExactAdapter();
      const connected = await adapter.isConnected(auth.tenantId);
      return reply.send({ data: { mode: adapter.mode, connected } });
    },
  );

  app.get(
    "/integrations/exact/connect",
    { preHandler: [app.authenticate, app.requirePermission("integration:manage")] },
    async (req, reply) => {
      const auth = req.auth as RequestAuth;
      const adapter = getExactAdapter();
      // `state` binds the consent redirect to this tenant; verify on callback in prod.
      const url = adapter.authorizationUrl(auth.tenantId, auth.tenantId);
      return reply.send({ data: { authorizationUrl: url } });
    },
  );

  app.get(
    "/integrations/exact/callback",
    { preHandler: [app.authenticate, app.requirePermission("integration:manage")] },
    async (req, reply) => {
      const auth = req.auth as RequestAuth;
      const { code, state } = req.query as { code?: string; state?: string };
      if (!code) return reply.code(400).send({ error: "bad_request", message: "Missing code" });
      // CSRF: the state issued by /connect is bound to the tenant; reject a
      // callback whose state does not match the authenticated tenant.
      if (state !== auth.tenantId) {
        return reply.code(400).send({ error: "bad_request", message: "State mismatch" });
      }
      const adapter = getExactAdapter();
      await adapter.handleCallback(auth.tenantId, code);
      await withTenant(auth.tenantId, (tx) =>
        audit(tx, auth.tenantId, { actorUserId: auth.userId, action: "integration.exact.connect", entity: "exact_connection" }),
      );
      return reply.send({ data: { connected: true } });
    },
  );

  // Post an approved payroll run to Exact as a GL journal.
  app.post(
    "/payroll/runs/:id/export-to-exact",
    { preHandler: [app.authenticate, app.requirePermission("integration:manage")] },
    async (req, reply) => {
      const auth = req.auth as RequestAuth;
      const { id } = req.params as { id: string };
      const run = await withTenant(auth.tenantId, (tx) =>
        tx.payrollRun.findUnique({ where: { id }, include: { payslips: true } }),
      );
      if (!run || run.tenantId !== auth.tenantId) {
        return reply.code(404).send({ error: "not_found", message: "Run not found" });
      }
      if (run.status !== "approved") {
        return reply.code(409).send({ error: "conflict", message: "Only approved runs can be exported" });
      }
      const payeTotal = run.payslips.reduce((s, p) => s + p.paye, 0);
      const nssfEmployeeTotal = run.payslips.reduce((s, p) => s + p.nssfEmployee, 0);
      const employerTotal = run.payslips.reduce((s, p) => s + p.employerTotal, 0);
      const journal = buildPayrollJournal({
        period: run.period,
        runId: run.id,
        grossTotal: Number(run.grossTotal),
        netTotal: Number(run.netTotal),
        payeTotal,
        nssfEmployeeTotal,
        employerTotal,
      });
      const adapter = getExactAdapter();
      const result = await adapter.postPayrollJournal(auth.tenantId, journal);
      await withTenant(auth.tenantId, (tx) =>
        audit(tx, auth.tenantId, {
          actorUserId: auth.userId,
          action: "payroll.export.exact",
          entity: "payroll_run",
          entityId: run.id,
          data: { remoteId: result.remoteId, mode: adapter.mode },
        }),
      );
      return reply.send({ data: { remoteId: result.remoteId, mode: adapter.mode, journal } });
    },
  );
}
