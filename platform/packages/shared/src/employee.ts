import { z } from "zod";

/**
 * Employee number format from the design contract: `TMCL-<LOC>-<SEQ>`
 *   TMCL  — Taifa Mining & Civil Ltd
 *   LOC   — 2–4 char uppercase site/location code (e.g. MWD, DAR)
 *   SEQ   — zero-padded sequence, ≥ 4 digits
 */
export const EMP_NO_RE = /^TMCL-[A-Z]{2,4}-\d{4,}$/;

export const employeeNumber = z.string().regex(EMP_NO_RE, "Expected TMCL-<LOC>-<SEQ>");

export function makeEmployeeNumber(locationCode: string, seq: number): string {
  const loc = locationCode.toUpperCase();
  if (!/^[A-Z]{2,4}$/.test(loc)) throw new Error(`Invalid location code: ${locationCode}`);
  if (!Number.isInteger(seq) || seq < 1) throw new Error(`Invalid sequence: ${seq}`);
  return `TMCL-${loc}-${String(seq).padStart(4, "0")}`;
}

export const EMPLOYMENT_STATUS = ["active", "on_leave", "suspended", "terminated", "dormant"] as const;
export type EmploymentStatus = (typeof EMPLOYMENT_STATUS)[number];

export const CONTRACT_TYPE = ["permanent", "fixed_term", "casual", "consultant"] as const;
export type ContractType = (typeof CONTRACT_TYPE)[number];

/** Fields flagged confidential are omitted (not masked) for roles lacking the grant. */
export const CONFIDENTIAL_FIELDS = ["basicSalary", "bankAccount", "nationalId", "medicalNotes"] as const;

export const employeeCreateSchema = z.object({
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  locationCode: z.string().regex(/^[A-Z]{2,4}$/),
  jobTitle: z.string().min(1).max(120),
  departmentId: z.string().uuid().optional(),
  contractType: z.enum(CONTRACT_TYPE),
  startDate: z.string().date(),
  // Confidential — only accepted/returned with employee:read:confidential.
  basicSalary: z.number().int().nonnegative().optional(),
  bankAccount: z.string().max(34).optional(),
  nationalId: z.string().max(30).optional(),
});
export type EmployeeCreate = z.infer<typeof employeeCreateSchema>;

export const employeeUpdateSchema = employeeCreateSchema.partial();
export type EmployeeUpdate = z.infer<typeof employeeUpdateSchema>;

export interface EmployeePublic {
  id: string;
  employeeNo: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  locationCode: string;
  departmentId: string | null;
  contractType: ContractType;
  status: EmploymentStatus;
  startDate: string;
  // Present only when the caller holds employee:read:confidential.
  basicSalary?: number;
  bankAccount?: string;
  nationalId?: string;
}
