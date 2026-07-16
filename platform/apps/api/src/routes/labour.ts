import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { overtimePay, severancePay, leaveLiability, noticeDays, resolveLabourPolicy } from "@hcmos/statutory";

const overtimeSchema = z.object({
  basicMonthly: z.number().int().nonnegative(),
  hours: z.number().nonnegative(),
  kind: z.enum(["ordinary", "rest_day_or_holiday"]),
});

const severanceSchema = z.object({
  basicMonthly: z.number().int().nonnegative(),
  monthsService: z.number().int().nonnegative(),
});

const leaveSchema = z.object({
  basicMonthly: z.number().int().nonnegative(),
  accruedUnusedDays: z.number().nonnegative(),
});

/**
 * Labour-law calculators (ELRA 2004). Read-scoped: they compute entitlements
 * from supplied figures and never mutate records. Basic pay is confidential, so
 * these require payroll:read (the roles that legitimately see wages).
 */
export async function labourRoutes(app: FastifyInstance): Promise<void> {
  app.post(
    "/labour/overtime",
    { preHandler: [app.authenticate, app.requirePermission("payroll:read")] },
    async (req, reply) => {
      const p = overtimeSchema.safeParse(req.body);
      if (!p.success) return reply.code(400).send({ error: "bad_request", message: "Invalid input" });
      return reply.send({ data: { amount: overtimePay(p.data.basicMonthly, p.data.hours, p.data.kind) } });
    },
  );

  app.post(
    "/labour/severance",
    { preHandler: [app.authenticate, app.requirePermission("payroll:read")] },
    async (req, reply) => {
      const p = severanceSchema.safeParse(req.body);
      if (!p.success) return reply.code(400).send({ error: "bad_request", message: "Invalid input" });
      const result = severancePay(p.data.basicMonthly, p.data.monthsService);
      return reply.send({ data: { ...result, noticeDays: noticeDays(p.data.monthsService) } });
    },
  );

  app.post(
    "/labour/leave-liability",
    { preHandler: [app.authenticate, app.requirePermission("payroll:read")] },
    async (req, reply) => {
      const p = leaveSchema.safeParse(req.body);
      if (!p.success) return reply.code(400).send({ error: "bad_request", message: "Invalid input" });
      return reply.send({
        data: {
          policyId: resolveLabourPolicy().id,
          amount: leaveLiability(p.data.basicMonthly, p.data.accruedUnusedDays),
        },
      });
    },
  );
}
