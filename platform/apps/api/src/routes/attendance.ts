import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { withTenant } from "@hcmos/db";
import { audit } from "../lib/audit.js";
import { callerEmployeeId } from "../lib/ess.js";
import type { RequestAuth } from "../plugins/auth.js";

const clockSchema = z.object({
  source: z.enum(["kiosk", "gps", "biometric", "manual"]).default("manual"),
});

/** UTC date (midnight) for "today", used as the attendance work_date key. */
function today(): Date {
  return new Date(new Date().toISOString().slice(0, 10) + "T00:00:00Z");
}

export async function attendanceRoutes(app: FastifyInstance): Promise<void> {
  // Roster view for supervisors/HR (attendance:read); ESS users see their own.
  app.get("/attendance", { preHandler: [app.authenticate] }, async (req, reply) => {
    const auth = req.auth as RequestAuth;
    const rows = await withTenant(auth.tenantId, async (tx) => {
      if (auth.permissions.has("attendance:read")) {
        return tx.attendanceRecord.findMany({ where: { tenantId: auth.tenantId }, orderBy: { workDate: "desc" }, take: 200 });
      }
      const empId = await callerEmployeeId(tx, auth.userId);
      if (!empId) return [];
      return tx.attendanceRecord.findMany({ where: { tenantId: auth.tenantId, employeeId: empId }, orderBy: { workDate: "desc" }, take: 60 });
    });
    return reply.send({ data: rows });
  });

  // Clock in for the caller's own employee record (one open record per day).
  app.post(
    "/attendance/clock-in",
    { preHandler: [app.authenticate, app.requirePermission("attendance:clock")] },
    async (req, reply) => {
      const auth = req.auth as RequestAuth;
      const parsed = clockSchema.safeParse(req.body ?? {});
      if (!parsed.success) return reply.code(400).send({ error: "bad_request", message: "Invalid source" });

      const outcome = await withTenant(auth.tenantId, async (tx) => {
        const empId = await callerEmployeeId(tx, auth.userId);
        if (!empId) return { code: 400 as const, message: "Your login is not linked to an employee record" };
        const workDate = today();
        const existing = await tx.attendanceRecord.findUnique({
          where: { tenantId_employeeId_workDate: { tenantId: auth.tenantId, employeeId: empId, workDate } },
        });
        if (existing) return { code: 409 as const, message: existing.clockOut ? "Already clocked out today" : "Already clocked in" };
        const rec = await tx.attendanceRecord.create({
          data: { tenantId: auth.tenantId, employeeId: empId, workDate, clockIn: new Date(), source: parsed.data.source },
        });
        await audit(tx, auth.tenantId, { actorUserId: auth.userId, action: "attendance.clock_in", entity: "attendance_record", entityId: rec.id });
        return { code: 201 as const, rec };
      });
      if (outcome.code === 400) return reply.code(400).send({ error: "no_employee", message: outcome.message });
      if (outcome.code === 409) return reply.code(409).send({ error: "conflict", message: outcome.message });
      return reply.code(201).send({ data: outcome.rec });
    },
  );

  // Clock out — closes today's open record and records worked minutes.
  app.post(
    "/attendance/clock-out",
    { preHandler: [app.authenticate, app.requirePermission("attendance:clock")] },
    async (req, reply) => {
      const auth = req.auth as RequestAuth;
      const outcome = await withTenant(auth.tenantId, async (tx) => {
        const empId = await callerEmployeeId(tx, auth.userId);
        if (!empId) return { code: 400 as const, message: "Your login is not linked to an employee record" };
        const workDate = today();
        const rec = await tx.attendanceRecord.findUnique({
          where: { tenantId_employeeId_workDate: { tenantId: auth.tenantId, employeeId: empId, workDate } },
        });
        if (!rec) return { code: 409 as const, message: "Not clocked in today" };
        if (rec.clockOut) return { code: 409 as const, message: "Already clocked out" };
        const now = new Date();
        const minutes = Math.max(0, Math.round((now.getTime() - rec.clockIn.getTime()) / 60_000));
        const updated = await tx.attendanceRecord.update({ where: { id: rec.id }, data: { clockOut: now, minutes } });
        await audit(tx, auth.tenantId, { actorUserId: auth.userId, action: "attendance.clock_out", entity: "attendance_record", entityId: rec.id, data: { minutes } });
        return { code: 200 as const, updated };
      });
      if (outcome.code === 400) return reply.code(400).send({ error: "no_employee", message: outcome.message });
      if (outcome.code === 409) return reply.code(409).send({ error: "conflict", message: outcome.message });
      return reply.send({ data: outcome.updated });
    },
  );
}
