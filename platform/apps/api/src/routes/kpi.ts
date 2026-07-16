import type { FastifyInstance } from "fastify";
import { withTenant } from "@hcmos/db";
import { computePayslip, leaveLiability } from "@hcmos/statutory";
import type { RequestAuth } from "../plugins/auth.js";

export interface Kpi {
  category: string;
  key: string;
  label: string;
  value: number;
  unit?: string;
  target?: number;
  /** "up" if higher is better, "down" if lower is better — for RAG colouring. */
  goodDirection?: "up" | "down";
  sub?: string;
}

function pct(n: number, d: number): number {
  return d > 0 ? Math.round((n / d) * 100) : 0;
}
function daysBetween(a: Date, b: Date): number {
  return Math.floor((a.getTime() - b.getTime()) / 86_400_000);
}

/**
 * KPI scorecard — the group-level operating picture, computed live from the
 * modules (workforce, cost, safety, people, performance). Read-only, gated on
 * kpi:read. Targets are indicative and would become tenant-configurable.
 */
export async function kpiRoutes(app: FastifyInstance): Promise<void> {
  app.get("/kpi/scorecard", { preHandler: [app.authenticate, app.requirePermission("kpi:read")] }, async (req, reply) => {
    const auth = req.auth as RequestAuth;
    const kpis = await withTenant(auth.tenantId, async (tx) => {
      const now = new Date();
      const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
      const yearStart = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
      const today = new Date(now.toISOString().slice(0, 10) + "T00:00:00Z");

      const employees = await tx.employee.findMany({ where: { tenantId: auth.tenantId } });
      const active = employees.filter((e) => e.status === "active");
      const headcount = active.length;
      const terminatedYtd = employees.filter((e) => e.status === "terminated").length;

      // Cost
      const wageBill = active.reduce((n, e) => n + (e.basicSalary ?? 0), 0);
      let statutory = 0;
      for (const e of active) {
        if (e.basicSalary) statutory += computePayslip({ gross: e.basicSalary, employerHeadcount: headcount }).statutoryTotal;
      }

      // Leave
      const balances = await tx.leaveBalance.findMany({ where: { tenantId: auth.tenantId, cycleYear: now.getUTCFullYear() } });
      const balByEmp = new Map(balances.map((b) => [b.employeeId, b]));
      let liability = 0;
      const approvedToday = await tx.leaveRequest.count({
        where: { tenantId: auth.tenantId, status: "approved", startDate: { lte: today }, endDate: { gte: today } },
      });
      for (const e of active) {
        const bal = balByEmp.get(e.id);
        const accrued = Math.max((bal?.entitledDays ?? 28) - (bal?.takenDays ?? 0), 0);
        if (e.basicSalary) liability += leaveLiability(e.basicSalary, accrued);
      }

      // Attendance
      const clockedToday = await tx.attendanceRecord.count({ where: { tenantId: auth.tenantId, workDate: today } });

      // Safety
      const incidents = await tx.hseqIncident.findMany({ where: { tenantId: auth.tenantId } });
      const ltis = incidents.filter((i) => i.severity === "lti");
      const lastLti = ltis.sort((a, b) => b.occurredOn.getTime() - a.occurredOn.getTime())[0];
      const medicals = await tx.medicalRecord.findMany({ where: { tenantId: auth.tenantId } });
      const validMedical = new Set(medicals.filter((m) => m.validFrom <= now && m.validTo >= now).map((m) => m.employeeId)).size;

      // Training
      const training = await tx.trainingRecord.findMany({ where: { tenantId: auth.tenantId } });
      const trainingCompleted = training.filter((t) => t.status === "completed").length;

      // Performance
      const reviews = await tx.performanceReview.findMany({ where: { tenantId: auth.tenantId, rating: { not: null } } });
      const avgRating = reviews.length ? reviews.reduce((n, r) => n + (r.rating ?? 0), 0) / reviews.length : 0;

      const list: Kpi[] = [
        { category: "Workforce", key: "headcount", label: "Active headcount", value: headcount, goodDirection: "up" },
        { category: "Workforce", key: "on_leave", label: "On leave today", value: approvedToday, unit: "staff", goodDirection: "down" },
        { category: "Workforce", key: "attendance", label: "Clocked in today", value: pct(clockedToday, headcount), unit: "%", target: 95, goodDirection: "up", sub: `${clockedToday}/${headcount}` },
        { category: "Workforce", key: "turnover", label: "Turnover (YTD)", value: pct(terminatedYtd, headcount + terminatedYtd), unit: "%", target: 8, goodDirection: "down" },
        { category: "Cost", key: "wage_bill", label: "Monthly wage bill", value: wageBill, unit: "TZS", goodDirection: "down" },
        { category: "Cost", key: "statutory", label: "Statutory / month", value: statutory, unit: "TZS", sub: "NSSF · PAYE · SDL · WCF" },
        { category: "Cost", key: "leave_liability", label: "Leave liability", value: liability, unit: "TZS", goodDirection: "down", sub: "monetised, ELRA" },
        { category: "Safety", key: "days_since_lti", label: "Days since LTI", value: lastLti ? daysBetween(now, lastLti.occurredOn) : 0, unit: "days", target: 90, goodDirection: "up" },
        { category: "Safety", key: "incidents_mtd", label: "Incidents (MTD)", value: incidents.filter((i) => i.occurredOn >= monthStart).length, goodDirection: "down" },
        { category: "Safety", key: "lti_ytd", label: "LTI (YTD)", value: ltis.filter((i) => i.occurredOn >= yearStart).length, target: 0, goodDirection: "down" },
        { category: "Safety", key: "medicals", label: "Medicals valid", value: pct(validMedical, headcount), unit: "%", target: 100, goodDirection: "up" },
        { category: "People", key: "training", label: "Training complete", value: pct(trainingCompleted, training.length), unit: "%", target: 90, goodDirection: "up", sub: `${trainingCompleted}/${training.length}` },
        { category: "People", key: "avg_rating", label: "Avg appraisal", value: Math.round(avgRating * 10) / 10, unit: "/5", target: 3, goodDirection: "up" },
      ];
      return list;
    });
    return reply.send({ data: kpis });
  });
}
