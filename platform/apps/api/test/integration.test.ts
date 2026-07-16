/**
 * End-to-end integration tests against a real, migrated + seeded Postgres.
 * These encode the design-contract guarantees as automated checks:
 *   - mandatory MFA enrollment + TOTP login for privileged roles
 *   - confidential fields "absent, not masked"
 *   - segregation of duties on payroll (maker ≠ checker)
 *   - append-only, verifiable audit chain
 *
 * Gated on RUN_DB_TESTS so `pnpm -r test` stays green without a database; CI
 * sets RUN_DB_TESTS=1 after `migrate deploy` + `seed`.
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { authenticator } from "otplib";
import type { FastifyInstance } from "fastify";
import { PrismaClient } from "@hcmos/db";

const run = process.env.RUN_DB_TESTS === "1";

describe.skipIf(!run)("HCMOS API integration", () => {
  let app: FastifyInstance;
  let admin: PrismaClient;

  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    // Reset auth state (as the owner, RLS-bypassing) so the run is idempotent
    // regardless of a previous run's MFA enrollments / lockouts.
    admin = new PrismaClient({
      datasources: { db: { url: process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL } },
    });
    await admin.$executeRawUnsafe(
      "UPDATE app_user SET mfa_enabled=false, mfa_secret=NULL, failed_attempts=0, locked_until=NULL",
    );

    const { buildApp } = await import("../src/app.js");
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app?.close();
    await admin?.$disconnect();
  });

  async function post(url: string, body: unknown, token?: string) {
    return app.inject({
      method: "POST",
      url,
      payload: body,
      headers: token ? { authorization: `Bearer ${token}` } : {},
    });
  }
  async function patch(url: string, body: unknown, token: string) {
    return app.inject({ method: "PATCH", url, payload: body, headers: { authorization: `Bearer ${token}` } });
  }
  async function get(url: string, token: string) {
    return app.inject({ method: "GET", url, headers: { authorization: `Bearer ${token}` } });
  }

  // Caches each user's TOTP secret for the run (enrolled the first time we see them).
  const secrets = new Map<string, string>();

  async function completeMfa(email: string, mfaToken: string): Promise<string> {
    const secret = secrets.get(email);
    if (!secret) throw new Error(`no cached MFA secret for ${email}`);
    const done = (await post("/api/auth/mfa/verify", { mfaToken, code: authenticator.generate(secret) })).json();
    expect(done.status).toBe("ok");
    return done.accessToken;
  }

  /** Password → (enroll MFA the first time) → TOTP verify → access token. */
  async function fullLogin(email: string, password = "Passw0rd!"): Promise<string> {
    const body = (await post("/api/auth/login", { tenantSlug: "taifa", email, password })).json();

    if (body.status === "ok") return body.accessToken;

    if (body.status === "mfa_setup_required") {
      const enroll = (await post("/api/auth/mfa/enroll", {}, body.setupToken)).json();
      secrets.set(email, enroll.secret);
      const v = await post("/api/auth/mfa/enroll/verify", { code: authenticator.generate(enroll.secret) }, body.setupToken);
      expect(v.statusCode).toBe(200);
      const relogin = (await post("/api/auth/login", { tenantSlug: "taifa", email, password })).json();
      expect(relogin.status).toBe("mfa_required");
      return completeMfa(email, relogin.mfaToken);
    }

    // Already enrolled earlier in this run.
    expect(body.status).toBe("mfa_required");
    return completeMfa(email, body.mfaToken);
  }

  it("enforces MFA for a privileged role, then grants access", async () => {
    const token = await fullLogin("payroll@taifamining.tz");
    expect(token).toBeTruthy();
  });

  it("shows confidential salary to payroll but omits it for a plain employee", async () => {
    const payroll = await fullLogin("payroll@taifamining.tz");
    const withConf = (await get("/api/employees", payroll)).json().data;
    expect(withConf.length).toBeGreaterThan(0);
    expect("basicSalary" in withConf[0]).toBe(true);

    const employee = await fullLogin("employee@taifamining.tz"); // R01, not privileged, no MFA
    const noConf = (await get("/api/employees", employee)).json().data;
    expect("basicSalary" in noConf[0]).toBe(false); // absent, not masked
  });

  it("runs payroll and enforces segregation of duties on approval", async () => {
    const payroll = await fullLogin("payroll@taifamining.tz");
    const run = await post("/api/payroll/runs", { period: "2027-01" }, payroll);
    // 201 first time; 409 if a previous run in this DB already created it.
    expect([201, 409]).toContain(run.statusCode);

    let runId: string;
    if (run.statusCode === 201) {
      runId = run.json().data.id;
    } else {
      const list = (await get("/api/payroll/runs", payroll)).json().data;
      runId = list.find((r: { period: string }) => r.period === "2027-01").id;
    }

    // Maker (payroll) cannot approve — lacks payroll:approve.
    const selfApprove = await post(`/api/payroll/runs/${runId}/approve`, {}, payroll);
    expect(selfApprove.statusCode).toBe(403);

    // Checker (finance) approves.
    const finance = await fullLogin("finance@taifamining.tz");
    const approve = await post(`/api/payroll/runs/${runId}/approve`, {}, finance);
    expect([200, 409]).toContain(approve.statusCode); // 409 if already approved by a prior run
  });

  it("exposes a verifiable, intact audit chain", async () => {
    const it_ = await fullLogin("it@taifamining.tz"); // R13, has audit:read
    const verify = (await get("/api/audit/verify", it_)).json().data;
    expect(verify.ok).toBe(true);
    expect(verify.count).toBeGreaterThan(0);
  });

  it("locks an account after repeated failed logins", async () => {
    const email = "hrofficer@taifamining.tz"; // not used by other tests
    for (let i = 0; i < 5; i++) {
      const bad = await post("/api/auth/login", { tenantSlug: "taifa", email, password: "wrong" });
      expect(bad.statusCode).toBe(401);
    }
    // Now locked — even the correct password is refused with 423 until cooldown.
    const locked = await post("/api/auth/login", { tenantSlug: "taifa", email, password: "Passw0rd!" });
    expect(locked.statusCode).toBe(423);
    // Clear the lock so the state doesn't leak to other assertions/runs.
    await admin.$executeRawUnsafe(
      "UPDATE app_user SET failed_attempts=0, locked_until=NULL WHERE email='hrofficer@taifamining.tz'",
    );
  });

  it("rejects refresh for a disabled account and revokes its tokens (CWE-613)", async () => {
    const email = "employee@taifamining.tz"; // R01, no MFA → login returns tokens directly
    const login = (await post("/api/auth/login", { tenantSlug: "taifa", email, password: "Passw0rd!" })).json();
    expect(login.status).toBe("ok");

    // Disable the account out-of-band (as an admin would on termination).
    await admin.$executeRawUnsafe("UPDATE app_user SET disabled=true WHERE email=$1", email);
    const refresh = await post("/api/auth/refresh", { refreshToken: login.refreshToken });
    expect(refresh.statusCode).toBe(401);

    // Re-enable so the fixture is clean for reruns.
    await admin.$executeRawUnsafe("UPDATE app_user SET disabled=false WHERE email=$1", email);
  });

  it("computes ELRA severance via the labour endpoint", async () => {
    const payroll = await fullLogin("payroll@taifamining.tz");
    const res = (await post("/api/labour/severance", { basicMonthly: 1_300_000, monthsService: 60 }, payroll)).json();
    expect(res.data.amount).toBe(1_750_000); // 50,000/day × 7 × 5 years
  });

  it("runs the leave request → approval workflow with maker≠checker", async () => {
    // Employee (linked to an employee record) submits a request.
    const employee = await fullLogin("employee@taifamining.tz");
    const created = await post(
      "/api/leave/requests",
      { type: "annual", startDate: "2027-03-02", endDate: "2027-03-06" },
      employee,
    );
    expect(created.statusCode).toBe(201);
    const reqId = created.json().data.id;
    expect(created.json().data.days).toBe(5);

    // An HR approver (different user) approves it.
    const hr = await fullLogin("hrhead@taifamining.tz");
    const decided = await post(`/api/leave/requests/${reqId}/decide`, { decision: "approve" }, hr);
    expect(decided.statusCode).toBe(200);
    expect(decided.json().data.status).toBe("approved");

    // Liability endpoint returns a monetised total.
    const liability = (await get("/api/leave/liability", hr)).json().data;
    expect(liability.monetisedTZS).toBeGreaterThan(0);
  });

  it("records attendance via clock-in then clock-out", async () => {
    const employee = await fullLogin("employee@taifamining.tz");
    const inRes = await post("/api/attendance/clock-in", { source: "kiosk" }, employee);
    // 201 first time; 409 if a prior run already clocked in today.
    expect([201, 409]).toContain(inRes.statusCode);

    const outRes = await post("/api/attendance/clock-out", {}, employee);
    expect([200, 409]).toContain(outRes.statusCode);
    if (outRes.statusCode === 200) {
      expect(outRes.json().data.clockOut).toBeTruthy();
      expect(outRes.json().data.minutes).toBeGreaterThanOrEqual(0);
    }

    const list = (await get("/api/attendance", employee)).json().data;
    expect(Array.isArray(list)).toBe(true);
  });

  it("runs the performance appraisal lifecycle (draft→submit→acknowledge)", async () => {
    const hr = await fullLogin("hrhead@taifamining.tz"); // performance:write
    // Find Joseph's employee id (the ESS-linked employee).
    const employees = (await get("/api/employees", hr)).json().data;
    const joseph = employees.find((e: { firstName: string }) => e.firstName === "Joseph");
    expect(joseph).toBeTruthy();

    const created = await post("/api/performance/reviews", { employeeId: joseph.id, cycle: "2027-Q1" }, hr);
    expect([201, 409]).toContain(created.statusCode);
    let reviewId: string;
    if (created.statusCode === 201) {
      reviewId = created.json().data.id;
    } else {
      reviewId = (await get("/api/performance/reviews", hr)).json().data.find((r: { cycle: string }) => r.cycle === "2027-Q1").id;
    }

    // Submitting without a rating is rejected.
    const early = await post(`/api/performance/reviews/${reviewId}/submit`, {}, hr);
    expect([400, 409]).toContain(early.statusCode);

    // Rate then submit.
    await patch(`/api/performance/reviews/${reviewId}`, { rating: 4, strengths: "Reliable" }, hr).then((r) =>
      expect([200, 409]).toContain(r.statusCode),
    );
    const submitted = await post(`/api/performance/reviews/${reviewId}/submit`, {}, hr);
    expect([200, 409]).toContain(submitted.statusCode);

    // The employee acknowledges their own review; HR (not the subject) cannot.
    const hrAck = await post(`/api/performance/reviews/${reviewId}/acknowledge`, {}, hr);
    expect(hrAck.statusCode).toBe(403);
    const employee = await fullLogin("employee@taifamining.tz");
    const empAck = await post(`/api/performance/reviews/${reviewId}/acknowledge`, {}, employee);
    expect([200, 409]).toContain(empAck.statusCode);
  });

  it("manages departments (org:manage) and shows headcount", async () => {
    const hr = await fullLogin("hrhead@taifamining.tz"); // org:manage
    const before = (await get("/api/org/departments", hr)).json().data;
    expect(before.length).toBeGreaterThan(0);
    expect(before.reduce((n: number, d: { headcount: number }) => n + d.headcount, 0)).toBeGreaterThan(0);

    const created = await post("/api/org/departments", { name: "Logistics", code: "LOG" }, hr);
    expect(created.statusCode).toBe(201);

    // A plain employee cannot create departments.
    const employee = await fullLogin("employee@taifamining.tz");
    const denied = await post("/api/org/departments", { name: "Rogue" }, employee);
    expect(denied.statusCode).toBe(403);
  });

  it("logs HSEQ incidents and reflects them in the safety summary", async () => {
    const sheq = await fullLogin("sheq@taifamining.tz"); // R11 SHEQ Manager (hseq:write)
    const reported = await post(
      "/api/hseq/incidents",
      { locationCode: "MWD", category: "injury", severity: "lti", description: "Hand injury at crusher", occurredOn: "2026-06-19" },
      sheq,
    );
    expect(reported.statusCode).toBe(201);
    const incidentId = reported.json().data.id;

    const summary = (await get("/api/hseq/summary", sheq)).json().data;
    expect(summary.ltiYtd).toBeGreaterThanOrEqual(1);
    expect(summary.openIncidents).toBeGreaterThanOrEqual(1);

    const patched = await patch(`/api/hseq/incidents/${incidentId}`, { status: "closed" }, sheq);
    expect(patched.statusCode).toBe(200);
    expect(patched.json().data.status).toBe("closed");
  });

  it("adds a training record and reports compliance", async () => {
    const hr = await fullLogin("hrhead@taifamining.tz"); // training:write
    const employees = (await get("/api/employees", hr)).json().data;
    const emp = employees[0];
    const created = await post("/api/training", { employeeId: emp.id, course: "Fire Marshal", provider: "OSHA" }, hr);
    expect(created.statusCode).toBe(201);
    const id = created.json().data.id;

    const completed = await patch(`/api/training/${id}`, { status: "completed", completedOn: "2026-07-15" }, hr);
    expect(completed.statusCode).toBe(200);
    expect(completed.json().data.status).toBe("completed");

    const summary = (await get("/api/training/summary", hr)).json().data;
    expect(summary.total).toBeGreaterThanOrEqual(1);
    expect(summary.completed).toBeGreaterThanOrEqual(1);
    expect(summary.compliancePct).toBeGreaterThanOrEqual(0);
  });

  it("computes the KPI scorecard across modules", async () => {
    const hr = await fullLogin("hrhead@taifamining.tz"); // kpi:read
    const kpis = (await get("/api/kpi/scorecard", hr)).json().data;
    expect(Array.isArray(kpis)).toBe(true);
    const headcount = kpis.find((k: { key: string }) => k.key === "headcount");
    expect(headcount.value).toBeGreaterThan(0);
    // Statutory KPI is derived from the payroll engine and must be positive.
    const statutory = kpis.find((k: { key: string }) => k.key === "statutory");
    expect(statutory.value).toBeGreaterThan(0);
    expect([...new Set(kpis.map((k: { category: string }) => k.category))].length).toBeGreaterThanOrEqual(3);

    // A plain employee lacks kpi:read.
    const employee = await fullLogin("employee@taifamining.tz");
    const denied = await get("/api/kpi/scorecard", employee);
    expect(denied.statusCode).toBe(403);
  });
});
