import type {
  StatutoryTable,
  EmployeeStatutoryInput,
  EmployeeStatutoryResult,
  EmployerStatutoryResult,
  PayslipStatutory,
  TZS,
} from "./types.js";
import { resolveTable } from "./tables/tz-2024.js";

const round = (n: number): TZS => Math.round(n);
const clampNonNeg = (n: number): number => (n < 0 ? 0 : n);

/**
 * Progressive PAYE on a taxable amount, using the table's marginal bands.
 * Bands must be ascending; the final band has `upTo: null`.
 */
export function computePaye(taxable: TZS, table: StatutoryTable): TZS {
  const base = clampNonNeg(taxable);
  let tax = 0;
  let lower = 0;
  for (const band of table.paye.bands) {
    const upper = band.upTo ?? Infinity;
    if (base <= lower) break;
    const inBand = Math.min(base, upper) - lower;
    if (inBand > 0) tax += inBand * band.rate;
    lower = upper;
  }
  return round(tax);
}

/** Employee-side deductions and net pay. */
export function computeEmployee(
  input: EmployeeStatutoryInput,
  table: StatutoryTable,
): EmployeeStatutoryResult {
  const gross = clampNonNeg(input.gross);
  const preTax = clampNonNeg(input.otherPreTaxDeductions ?? 0);
  const postTax = clampNonNeg(input.otherPostTaxDeductions ?? 0);

  const nssfEmployee = round(gross * table.nssf.employeeRate);
  const deductibleBeforePaye = table.nssf.employeeContributionDeductibleForPaye
    ? nssfEmployee
    : 0;
  const taxablePay = clampNonNeg(gross - deductibleBeforePaye - preTax);
  const paye = computePaye(taxablePay, table);

  const totalEmployeeDeductions = nssfEmployee + paye + preTax + postTax;
  const netPay = clampNonNeg(gross - totalEmployeeDeductions);

  return {
    gross,
    nssfEmployee,
    taxablePay,
    paye,
    otherPostTaxDeductions: postTax,
    totalEmployeeDeductions,
    netPay,
  };
}

/**
 * Employer-side contributions. SDL only applies when the employer meets the
 * minimum headcount threshold, so the caller passes `employerHeadcount`.
 */
export function computeEmployer(
  gross: TZS,
  table: StatutoryTable,
  employerHeadcount: number,
): EmployerStatutoryResult {
  const g = clampNonNeg(gross);
  const nssfEmployer = round(g * table.nssf.employerRate);
  const sdl = employerHeadcount >= table.sdl.minEmployees ? round(g * table.sdl.rate) : 0;
  const wcf = round(g * table.wcf.rate);
  return {
    nssfEmployer,
    sdl,
    wcf,
    totalEmployerContributions: nssfEmployer + sdl + wcf,
  };
}

export interface PayslipInput extends EmployeeStatutoryInput {
  /** Headcount of the employing tenant — decides SDL applicability. */
  employerHeadcount: number;
  /** Optional period date (ISO) to pick the effective statutory table. */
  periodDate?: string;
}

/** Full statutory computation for one payslip line. */
export function computePayslip(input: PayslipInput): PayslipStatutory {
  const table = resolveTable(input.periodDate);
  const employee = computeEmployee(input, table);
  const employer = computeEmployer(input.gross, table, input.employerHeadcount);
  const statutoryTotal =
    employee.nssfEmployee + employee.paye + employer.totalEmployerContributions;
  return { tableId: table.id, employee, employer, statutoryTotal };
}
