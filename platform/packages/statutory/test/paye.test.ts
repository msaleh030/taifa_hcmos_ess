import { describe, it, expect } from "vitest";
import { computePaye, computeEmployee, computeEmployer, computePayslip } from "../src/engine.js";
import { TZ_2024 } from "../src/tables/tz-2024.js";

describe("PAYE progressive bands (TZ-2024-07)", () => {
  it("is zero at or below the tax-free threshold", () => {
    expect(computePaye(0, TZ_2024)).toBe(0);
    expect(computePaye(270_000, TZ_2024)).toBe(0);
  });

  it("matches each band boundary exactly (continuity)", () => {
    expect(computePaye(520_000, TZ_2024)).toBe(20_000); // end of 8% band
    expect(computePaye(760_000, TZ_2024)).toBe(68_000); // end of 20% band
    expect(computePaye(1_000_000, TZ_2024)).toBe(128_000); // end of 25% band
  });

  it("computes marginal tax inside a band", () => {
    // 720,000 → 20,000 + 20% of (720,000 − 520,000) = 60,000
    expect(computePaye(720_000, TZ_2024)).toBe(60_000);
  });

  it("applies 30% on the top open band", () => {
    // 1,200,000 → 128,000 + 30% of 200,000 = 188,000
    expect(computePaye(1_200_000, TZ_2024)).toBe(188_000);
  });

  it("never returns negative tax for negative input", () => {
    expect(computePaye(-5000, TZ_2024)).toBe(0);
  });
});

describe("employee deductions", () => {
  it("deducts NSSF before PAYE and returns net pay", () => {
    const r = computeEmployee({ gross: 800_000 }, TZ_2024);
    expect(r.nssfEmployee).toBe(80_000); // 10%
    expect(r.taxablePay).toBe(720_000); // gross − NSSF
    expect(r.paye).toBe(60_000);
    expect(r.totalEmployeeDeductions).toBe(140_000);
    expect(r.netPay).toBe(660_000);
  });

  it("honours additional post-tax deductions", () => {
    const r = computeEmployee({ gross: 800_000, otherPostTaxDeductions: 50_000 }, TZ_2024);
    expect(r.netPay).toBe(610_000);
  });
});

describe("employer contributions", () => {
  it("charges NSSF, SDL and WCF above the SDL headcount threshold", () => {
    const r = computeEmployer(800_000, TZ_2024, 100);
    expect(r.nssfEmployer).toBe(80_000); // 10%
    expect(r.sdl).toBe(28_000); // 3.5%
    expect(r.wcf).toBe(4_000); // 0.5%
    expect(r.totalEmployerContributions).toBe(112_000);
  });

  it("waives SDL below the minimum-employee threshold", () => {
    const r = computeEmployer(800_000, TZ_2024, 5);
    expect(r.sdl).toBe(0);
    expect(r.totalEmployerContributions).toBe(84_000); // NSSF + WCF only
  });
});

describe("full payslip", () => {
  it("aggregates the statutory total (both NSSF sides + PAYE + SDL + WCF)", () => {
    const p = computePayslip({ gross: 800_000, employerHeadcount: 100 });
    expect(p.tableId).toBe("TZ-2024-07");
    expect(p.employee.netPay).toBe(660_000);
    // 80,000 (NSSF ee) + 60,000 (PAYE) + 112,000 (employer) = 252,000
    expect(p.statutoryTotal).toBe(252_000);
  });
});
