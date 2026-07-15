/**
 * All monetary amounts are whole Tanzanian Shillings (TZS). TZS has no minor
 * unit in practice, so we work in integers and round each statutory line to the
 * nearest whole shilling.
 */
export type TZS = number;

export interface PayeBand {
  /** Upper bound of the band (inclusive), or null for the top open band. */
  upTo: TZS | null;
  /** Marginal rate applied within the band, 0..1. */
  rate: number;
}

export interface StatutoryTable {
  /** Table version id, e.g. "TZ-2024-07". */
  id: string;
  jurisdiction: "TZ-mainland";
  /** ISO date the table takes effect. */
  effectiveFrom: string;
  /**
   * Source note — every rate MUST be traceable to a Finance Act / GN before it
   * is used to pay real people. See the disclaimer in the table file.
   */
  source: string;
  paye: {
    /** Progressive monthly bands, ascending. */
    bands: PayeBand[];
  };
  nssf: {
    /** Employee contribution rate on gross (statutory pension). */
    employeeRate: number;
    /** Employer contribution rate on gross. */
    employerRate: number;
    /** Whether the employee contribution is deductible before PAYE. */
    employeeContributionDeductibleForPaye: boolean;
  };
  sdl: {
    /** Skills & Development Levy — employer only, on gross emoluments. */
    rate: number;
    /** Minimum employee count at which SDL becomes payable. */
    minEmployees: number;
  };
  wcf: {
    /** Workers Compensation Fund — employer only, on gross. */
    rate: number;
  };
}

export interface PayeInput {
  /** Monthly gross emoluments in TZS. */
  gross: TZS;
}

export interface EmployeeStatutoryInput {
  gross: TZS;
  /** Other pre-tax deductions the employer runs (e.g. voluntary pension). */
  otherPreTaxDeductions?: TZS;
  /** Other post-tax deductions (e.g. loan, union dues). */
  otherPostTaxDeductions?: TZS;
}

export interface EmployeeStatutoryResult {
  gross: TZS;
  nssfEmployee: TZS;
  taxablePay: TZS;
  paye: TZS;
  otherPostTaxDeductions: TZS;
  totalEmployeeDeductions: TZS;
  netPay: TZS;
}

export interface EmployerStatutoryResult {
  nssfEmployer: TZS;
  sdl: TZS;
  wcf: TZS;
  totalEmployerContributions: TZS;
}

export interface PayslipStatutory {
  tableId: string;
  employee: EmployeeStatutoryResult;
  employer: EmployerStatutoryResult;
  /** Total statutory remitted to authorities for this employee (NSSF both sides + PAYE + SDL + WCF). */
  statutoryTotal: TZS;
}
