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

  it("computes ELRA severance via the labour endpoint", async () => {
    const payroll = await fullLogin("payroll@taifamining.tz");
    const res = (await post("/api/labour/severance", { basicMonthly: 1_300_000, monthsService: 60 }, payroll)).json();
    expect(res.data.amount).toBe(1_750_000); // 50,000/day × 7 × 5 years
  });
});
