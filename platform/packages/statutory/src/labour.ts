import type { TZS } from "./types.js";
import { resolveLabourPolicy, type LabourPolicy } from "./tables/tz-labour.js";

const round = (n: number): TZS => Math.round(n);
const clampNonNeg = (n: number): number => (n < 0 ? 0 : n);

/** Daily wage from monthly basic, using the policy's day divisor (default 26). */
export function dailyWage(basicMonthly: TZS, policy: LabourPolicy): TZS {
  return round(clampNonNeg(basicMonthly) / policy.daysPerMonthForDailyWage);
}

/** Ordinary hourly rate: monthly basic annualised over ordinary weekly hours. */
export function hourlyRate(basicMonthly: TZS, policy: LabourPolicy): number {
  const annualHours = policy.ordinaryHoursPerWeek * 52;
  return (clampNonNeg(basicMonthly) * 12) / annualHours;
}

export type OvertimeKind = "ordinary" | "rest_day_or_holiday";

/** Overtime pay (ELRA s.19): 1.5× on a normal day, 2× on a rest day/holiday. */
export function overtimePay(
  basicMonthly: TZS,
  hours: number,
  kind: OvertimeKind,
  policy: LabourPolicy = resolveLabourPolicy(),
): TZS {
  const h = clampNonNeg(hours);
  const mult = kind === "rest_day_or_holiday" ? policy.overtime.restDayHolidayMultiplier : policy.overtime.ordinaryMultiplier;
  return round(hourlyRate(basicMonthly, policy) * mult * h);
}

/** True if the overtime hours exceed the ELRA s.19(2) 4-week ceiling. */
export function exceedsOvertimeCeiling(hoursIn4Weeks: number, policy: LabourPolicy = resolveLabourPolicy()): boolean {
  return hoursIn4Weeks > policy.overtime.maxOvertimeHoursPer4Weeks;
}

/**
 * Monetised leave liability (design KPI "Leave liability, monetised"):
 * accrued unused leave days × daily wage.
 */
export function leaveLiability(
  basicMonthly: TZS,
  accruedUnusedDays: number,
  policy: LabourPolicy = resolveLabourPolicy(),
): TZS {
  return round(dailyWage(basicMonthly, policy) * clampNonNeg(accruedUnusedDays));
}

/** Annual leave accrued pro-rata for months worked in the current cycle. */
export function accruedAnnualLeaveDays(monthsWorkedInCycle: number, policy: LabourPolicy = resolveLabourPolicy()): number {
  const months = Math.min(Math.max(monthsWorkedInCycle, 0), 12);
  return (policy.leave.annualLeaveDays * months) / 12;
}

export interface SeveranceResult {
  eligible: boolean;
  countedYears: number;
  dailyWage: TZS;
  amount: TZS;
  reason?: string;
}

/**
 * Severance pay (ELRA s.42): 7 days' basic wage per completed year of continuous
 * service, capped at the policy's max years, requiring ≥ the minimum months of
 * service. Payable on employer termination for operational requirements.
 */
export function severancePay(
  basicMonthly: TZS,
  monthsService: number,
  policy: LabourPolicy = resolveLabourPolicy(),
): SeveranceResult {
  const dw = dailyWage(basicMonthly, policy);
  if (monthsService < policy.severance.minMonthsService) {
    return { eligible: false, countedYears: 0, dailyWage: dw, amount: 0, reason: "below minimum service" };
  }
  const completedYears = Math.floor(monthsService / 12);
  const countedYears = Math.min(completedYears, policy.severance.maxYears);
  const amount = round(dw * policy.severance.daysPerCompletedYear * countedYears);
  return { eligible: true, countedYears, dailyWage: dw, amount };
}

/** Statutory minimum notice (ELRA s.41). */
export function noticeDays(monthsService: number, policy: LabourPolicy = resolveLabourPolicy()): number {
  return monthsService < 1 ? policy.notice.firstMonthDays : policy.notice.monthlyPaidDays;
}

export { resolveLabourPolicy };
export type { LabourPolicy };
