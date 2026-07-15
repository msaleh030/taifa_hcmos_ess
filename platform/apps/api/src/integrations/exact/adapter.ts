/**
 * Exact Online integration boundary. The rest of the platform depends only on
 * this interface, never on Exact's HTTP shapes — so the live client and the
 * stub are interchangeable, and Exact can be swapped for another GL/payroll
 * system by writing a new adapter.
 */

export interface PayrollJournalLine {
  glAccount: string;
  description: string;
  /** Whole TZS; positive = debit, negative = credit. */
  amount: number;
}

export interface PayrollJournal {
  period: string; // YYYY-MM
  reference: string; // HCMOS payroll run id
  currency: "TZS";
  lines: PayrollJournalLine[];
}

export interface ExactAdapter {
  readonly mode: "live" | "stub";
  /** Whether a usable connection (tokens/division) is configured. */
  isConnected(tenantId: string): Promise<boolean>;
  /** Build the OAuth2 authorization URL to begin the consent flow. */
  authorizationUrl(tenantId: string, state: string): string;
  /** Exchange an authorization code for tokens and persist them. */
  handleCallback(tenantId: string, code: string): Promise<void>;
  /** Post a payroll journal to Exact's General Journal. Returns the remote id. */
  postPayrollJournal(tenantId: string, journal: PayrollJournal): Promise<{ remoteId: string }>;
}

/**
 * Map a completed payroll run into a balanced GL journal. Statutory liabilities
 * and net pay are credited; the wage/statutory expense is debited. GL account
 * codes are placeholders to be mapped to the tenant's Exact chart of accounts.
 */
export function buildPayrollJournal(input: {
  period: string;
  runId: string;
  grossTotal: number;
  netTotal: number;
  payeTotal: number;
  nssfEmployeeTotal: number;
  employerTotal: number;
}): PayrollJournal {
  // Debit total labour cost (gross + employer contributions); credit each
  // liability. By construction net + PAYE + employee NSSF = gross, and the
  // employer contributions are credited to their payable, so the journal nets
  // to zero.
  const wageExpense = input.grossTotal + input.employerTotal;
  const lines: PayrollJournalLine[] = [
    { glAccount: "6100", description: "Wages & salaries expense", amount: wageExpense },
    { glAccount: "2400", description: "Net pay payable", amount: -input.netTotal },
    { glAccount: "2410", description: "PAYE payable (TRA)", amount: -input.payeTotal },
    { glAccount: "2420", description: "NSSF payable (employee)", amount: -input.nssfEmployeeTotal },
    { glAccount: "2430", description: "Employer statutory payable (NSSF/SDL/WCF)", amount: -input.employerTotal },
  ];
  // Defensive rounding guard — surface any residual rather than posting unbalanced.
  const balance = lines.reduce((s, l) => s + l.amount, 0);
  if (balance !== 0) {
    lines.push({ glAccount: "2490", description: "Rounding / other payable", amount: -balance });
  }
  return { period: input.period, reference: input.runId, currency: "TZS", lines };
}
