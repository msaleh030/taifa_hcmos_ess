import type { StatutoryTable } from "../types.js";

/**
 * ⚠️ COMPLIANCE DISCLAIMER — READ BEFORE PRODUCTION USE ⚠️
 *
 * These rates reflect the *structure* of Tanzania mainland payroll statutory
 * deductions and are provided as a working reference. They are NOT a certified
 * tax table. Before this table is used to pay real employees it MUST be:
 *   1. reconciled against the current TRA monthly PAYE table (Income Tax Act,
 *      as amended by the latest Finance Act),
 *   2. confirmed with NSSF, the Skills & Development Levy schedule, and the
 *      Workers Compensation Fund tariff order in force, and
 *   3. signed off by a registered Tanzanian tax advisor.
 *
 * The engine is table-driven precisely so this file can be replaced with a
 * certified table — keyed by `effectiveFrom` — without touching calculation code.
 */
export const TZ_2024: StatutoryTable = {
  id: "TZ-2024-07",
  jurisdiction: "TZ-mainland",
  effectiveFrom: "2024-07-01",
  source: "Reference structure — TRA monthly PAYE bands; NSSF 10+10; SDL 3.5%; WCF 0.5%. VERIFY before use.",
  paye: {
    // Progressive monthly bands. Each band's `rate` is marginal within the band.
    bands: [
      { upTo: 270_000, rate: 0.0 },
      { upTo: 520_000, rate: 0.08 },
      { upTo: 760_000, rate: 0.2 },
      { upTo: 1_000_000, rate: 0.25 },
      { upTo: null, rate: 0.3 },
    ],
  },
  nssf: {
    employeeRate: 0.1,
    employerRate: 0.1,
    employeeContributionDeductibleForPaye: true,
  },
  sdl: {
    rate: 0.035,
    minEmployees: 10,
  },
  wcf: {
    rate: 0.005,
  },
};

export const TABLES: Record<string, StatutoryTable> = {
  [TZ_2024.id]: TZ_2024,
};

/** Returns the table effective on or before `isoDate` (defaults to the latest). */
export function resolveTable(isoDate?: string): StatutoryTable {
  const all = Object.values(TABLES).sort((a, b) => a.effectiveFrom.localeCompare(b.effectiveFrom));
  if (!isoDate) return all[all.length - 1]!;
  let chosen = all[0]!;
  for (const t of all) if (t.effectiveFrom <= isoDate) chosen = t;
  return chosen;
}
