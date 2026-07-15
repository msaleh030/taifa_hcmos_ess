import { describe, it, expect } from "vitest";
import {
  dailyWage,
  hourlyRate,
  overtimePay,
  exceedsOvertimeCeiling,
  leaveLiability,
  accruedAnnualLeaveDays,
  severancePay,
  noticeDays,
} from "../src/labour.js";
import { TZ_LABOUR_2024 as P } from "../src/tables/tz-labour.js";

describe("daily & hourly wage", () => {
  it("derives a daily wage on the 26-day convention", () => {
    expect(dailyWage(1_300_000, P)).toBe(50_000); // 1,300,000 / 26
  });
  it("derives an ordinary hourly rate over 45h/week annualised", () => {
    // 1,000,000 * 12 / (45*52) = 12,000,000 / 2,340 ≈ 5,128.2
    expect(Math.round(hourlyRate(1_000_000, P))).toBe(5_128);
  });
});

describe("overtime (ELRA s.19)", () => {
  it("pays 1.5× on a normal day", () => {
    // hourly ≈ 5128.2, ×1.5 ×10h ≈ 76,923
    expect(overtimePay(1_000_000, 10, "ordinary", P)).toBe(76_923);
  });
  it("pays 2× on a rest day or public holiday", () => {
    expect(overtimePay(1_000_000, 10, "rest_day_or_holiday", P)).toBe(102_564);
  });
  it("flags overtime beyond the 4-week ceiling of 50h", () => {
    expect(exceedsOvertimeCeiling(48, P)).toBe(false);
    expect(exceedsOvertimeCeiling(51, P)).toBe(true);
  });
});

describe("annual leave (ELRA s.31)", () => {
  it("accrues 28 days over a full 12-month cycle", () => {
    expect(accruedAnnualLeaveDays(12, P)).toBe(28);
    expect(accruedAnnualLeaveDays(6, P)).toBe(14);
  });
  it("monetises leave liability at the daily wage", () => {
    // daily wage 50,000 × 10 accrued days = 500,000
    expect(leaveLiability(1_300_000, 10, P)).toBe(500_000);
  });
});

describe("severance (ELRA s.42)", () => {
  it("pays 7 days' wage per completed year", () => {
    // 5 years, basic 1,300,000 → daily 50,000 × 7 × 5 = 1,750,000
    const r = severancePay(1_300_000, 5 * 12, P);
    expect(r.eligible).toBe(true);
    expect(r.countedYears).toBe(5);
    expect(r.amount).toBe(1_750_000);
  });
  it("caps counted years at 10", () => {
    const r = severancePay(1_300_000, 15 * 12, P);
    expect(r.countedYears).toBe(10);
    expect(r.amount).toBe(50_000 * 7 * 10);
  });
  it("is ineligible below the minimum service period", () => {
    const r = severancePay(1_300_000, 6, P);
    expect(r.eligible).toBe(false);
    expect(r.amount).toBe(0);
  });
});

describe("notice (ELRA s.41)", () => {
  it("is 7 days in the first month, 28 days thereafter", () => {
    expect(noticeDays(0.5, P)).toBe(7);
    expect(noticeDays(4, P)).toBe(28);
  });
});
