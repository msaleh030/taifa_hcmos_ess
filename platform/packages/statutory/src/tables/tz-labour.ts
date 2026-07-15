/**
 * Tanzania labour-law entitlement policy — Employment and Labour Relations Act
 * No. 6 of 2004 (ELRA), mainland Tanzania. Section references are in comments so
 * the figures are auditable against the Act.
 *
 * ⚠️ Same disclaimer as the tax table: this encodes the Act's provisions as a
 * working reference. Labour law is amended and interpreted by the Labour Court;
 * confirm each figure with a Tanzanian labour-law advisor before relying on it
 * for terminations, severance or disputes. The policy is versioned and
 * table-driven so a corrected version can be dropped in without code changes.
 */

export interface LabourPolicy {
  id: string;
  effectiveFrom: string;
  source: string;

  /** ELRA s.19 — ordinary hours. */
  ordinaryHoursPerWeek: number;
  ordinaryDaysPerWeek: number;
  /** Divisor to convert monthly basic pay to a daily wage (26-day convention). */
  daysPerMonthForDailyWage: number;

  overtime: {
    /** s.19(5)(a) — overtime on a normal working day. */
    ordinaryMultiplier: number;
    /** s.19(5)(b) — work on a rest day or public holiday. */
    restDayHolidayMultiplier: number;
    /** s.19(2) — max overtime averaged over a 4-week cycle. */
    maxOvertimeHoursPer4Weeks: number;
  };

  leave: {
    /** s.31 — annual leave per 12-month cycle, days (paid). */
    annualLeaveDays: number;
    sick: {
      /** s.32 — sick-leave cycle length (months). */
      cycleMonths: number;
      /** Days paid at full wage, then days paid at half wage. */
      fullPayDays: number;
      halfPayDays: number;
    };
    /** s.33 — maternity leave (days), single vs multiple birth. */
    maternityDaysSingle: number;
    maternityDaysMultiple: number;
    /** s.34 — paternity leave (days). */
    paternityDays: number;
  };

  /** s.41 — minimum notice of termination. */
  notice: {
    firstMonthDays: number;
    monthlyPaidDays: number;
  };

  severance: {
    /** s.42 — days' basic wage per completed year of service. */
    daysPerCompletedYear: number;
    /** Cap on the number of counted years. */
    maxYears: number;
    /** Minimum continuous months of service to qualify. */
    minMonthsService: number;
  };
}

export const TZ_LABOUR_2024: LabourPolicy = {
  id: "TZ-LABOUR-2004",
  effectiveFrom: "2004-05-01",
  source: "Employment and Labour Relations Act No. 6 of 2004 (mainland Tanzania). VERIFY before use.",
  ordinaryHoursPerWeek: 45,
  ordinaryDaysPerWeek: 6,
  daysPerMonthForDailyWage: 26,
  overtime: {
    ordinaryMultiplier: 1.5,
    restDayHolidayMultiplier: 2.0,
    maxOvertimeHoursPer4Weeks: 50,
  },
  leave: {
    annualLeaveDays: 28,
    sick: { cycleMonths: 36, fullPayDays: 63, halfPayDays: 63 },
    maternityDaysSingle: 84,
    maternityDaysMultiple: 100,
    paternityDays: 3,
  },
  notice: { firstMonthDays: 7, monthlyPaidDays: 28 },
  severance: { daysPerCompletedYear: 7, maxYears: 10, minMonthsService: 12 },
};

export const LABOUR_POLICIES: Record<string, LabourPolicy> = {
  [TZ_LABOUR_2024.id]: TZ_LABOUR_2024,
};

export function resolveLabourPolicy(isoDate?: string): LabourPolicy {
  const all = Object.values(LABOUR_POLICIES).sort((a, b) => a.effectiveFrom.localeCompare(b.effectiveFrom));
  if (!isoDate) return all[all.length - 1]!;
  let chosen = all[0]!;
  for (const p of all) if (p.effectiveFrom <= isoDate) chosen = p;
  return chosen;
}
