import { describe, it, expect, beforeAll } from "vitest";
import { buildPayrollJournal } from "../src/integrations/exact/adapter.js";
import { hashPassword, verifyPassword } from "@hcmos/shared/password";

describe("payroll → GL journal", () => {
  it("produces a balanced journal (debits == credits)", () => {
    // From one employee grossing 800,000: PAYE 60,000, NSSF ee 80,000,
    // net 660,000, employer 112,000.
    const j = buildPayrollJournal({
      period: "2024-07",
      runId: "run-1",
      grossTotal: 800_000,
      netTotal: 660_000,
      payeTotal: 60_000,
      nssfEmployeeTotal: 80_000,
      employerTotal: 112_000,
    });
    const balance = j.lines.reduce((s, l) => s + l.amount, 0);
    expect(balance).toBe(0);
    // No rounding line needed for exact inputs.
    expect(j.lines.some((l) => l.glAccount === "2490")).toBe(false);
  });
});

describe("password hashing", () => {
  it("verifies a correct password and rejects a wrong one", () => {
    const stored = hashPassword("Passw0rd!");
    expect(verifyPassword("Passw0rd!", stored)).toBe(true);
    expect(verifyPassword("wrong", stored)).toBe(false);
  });

  it("produces a self-describing scrypt hash", () => {
    expect(hashPassword("x").startsWith("scrypt$")).toBe(true);
  });
});

describe("jwt round-trip", () => {
  beforeAll(() => {
    process.env.DATABASE_URL ??= "postgresql://localhost/test";
    process.env.JWT_ACCESS_SECRET ??= "test-access-secret-1234567890";
    process.env.JWT_REFRESH_SECRET ??= "test-refresh-secret-1234567890";
  });

  it("signs and verifies an access token", async () => {
    const { signAccess, verifyAccess } = await import("../src/lib/jwt.js");
    const token = signAccess({ sub: "u1", tid: "t1", roles: ["R09"], perms: ["payroll:run"] });
    const claims = verifyAccess(token);
    expect(claims.sub).toBe("u1");
    expect(claims.tid).toBe("t1");
    expect(claims.perms).toContain("payroll:run");
  });
});
