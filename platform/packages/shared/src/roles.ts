/**
 * Canonical HCMOS role catalogue (R01–R13), mirrored from the design contract
 * (`roles.jsx` in the prototype). Codes are stable identifiers used by the API,
 * the RBAC layer and the audit log. Titles are display strings.
 */

export const ROLE_CODES = [
  "R01",
  "R02",
  "R03",
  "R04",
  "R05",
  "R06",
  "R07",
  "R08",
  "R09",
  "R10",
  "R11",
  "R12",
  "R13",
] as const;

export type RoleCode = (typeof ROLE_CODES)[number];

export interface RoleDef {
  code: RoleCode;
  /** Stable slug matching the prototype role id. */
  slug: string;
  title: string;
  /** Coarse scope the role operates at — drives default data visibility. */
  scope: "self" | "team" | "department" | "project" | "site" | "organization";
  /** Read-only roles can never be a "maker" or "checker" on a workflow. */
  readonly: boolean;
}

export const ROLES: Record<RoleCode, RoleDef> = {
  R01: { code: "R01", slug: "employee", title: "Employee (ESS)", scope: "self", readonly: false },
  R02: { code: "R02", slug: "supervisor", title: "Supervisor / Team Leader", scope: "team", readonly: false },
  R03: { code: "R03", slug: "super", title: "Superintendent / Manager", scope: "department", readonly: false },
  R04: { code: "R04", slug: "pm", title: "Project Manager", scope: "project", readonly: false },
  R05: { code: "R05", slug: "hod", title: "Head of Department", scope: "department", readonly: false },
  R06: { code: "R06", slug: "hrofficer", title: "HR Officer", scope: "organization", readonly: false },
  R07: { code: "R07", slug: "projhr", title: "Project HR Officer", scope: "project", readonly: false },
  R08: { code: "R08", slug: "hrhead", title: "Head of HR", scope: "organization", readonly: false },
  R09: { code: "R09", slug: "payroll", title: "Payroll Officer", scope: "organization", readonly: false },
  R10: { code: "R10", slug: "finance", title: "Finance Manager", scope: "organization", readonly: true },
  R11: { code: "R11", slug: "sheq", title: "SHEQ Manager", scope: "organization", readonly: false },
  R12: { code: "R12", slug: "ceo", title: "COO / CEO", scope: "organization", readonly: true },
  R13: { code: "R13", slug: "it", title: "IT Administrator", scope: "organization", readonly: false },
};

/**
 * Permission grammar: `<resource>:<action>`. Confidential fields (salary, bank,
 * medical, disciplinary) are gated separately by `confidential:view` — the
 * design rule is "absent, not masked", so lacking it removes the field entirely.
 */
export type Permission =
  | "employee:read"
  | "employee:write"
  | "employee:read:confidential"
  | "leave:read"
  | "leave:request"
  | "leave:approve"
  | "payroll:read"
  | "payroll:run"
  | "payroll:approve"
  | "audit:read"
  | "integration:manage"
  | "tenant:admin"
  | "user:admin";

const ALL: Permission[] = [
  "employee:read",
  "employee:write",
  "employee:read:confidential",
  "leave:read",
  "leave:request",
  "leave:approve",
  "payroll:read",
  "payroll:run",
  "payroll:approve",
  "audit:read",
  "integration:manage",
  "tenant:admin",
  "user:admin",
];

/**
 * Baseline permission grants per role. This is intentionally explicit rather
 * than hierarchical — least privilege, and easy to audit against the spec.
 * Segregation of duties (maker ≠ checker) is enforced at runtime, not here:
 * `payroll:run` and `payroll:approve` are granted to different roles.
 */
export const ROLE_PERMISSIONS: Record<RoleCode, Permission[]> = {
  R01: ["employee:read", "leave:read", "leave:request"],
  R02: ["employee:read", "leave:read", "leave:request", "leave:approve"],
  R03: ["employee:read", "leave:read", "leave:approve"],
  R04: ["employee:read", "leave:read", "leave:approve"],
  R05: ["employee:read", "leave:read", "leave:approve"],
  R06: ["employee:read", "employee:write", "employee:read:confidential", "leave:read", "leave:approve"],
  R07: ["employee:read", "employee:write", "leave:read", "leave:approve"],
  R08: [
    "employee:read",
    "employee:write",
    "employee:read:confidential",
    "leave:read",
    "leave:approve",
    "audit:read",
  ],
  R09: ["employee:read", "employee:read:confidential", "payroll:read", "payroll:run"],
  R10: ["employee:read", "payroll:read", "payroll:approve"],
  R11: ["employee:read", "leave:read"],
  R12: ["employee:read", "payroll:read", "audit:read"],
  R13: ["user:admin", "tenant:admin", "integration:manage", "audit:read"],
};

export function permissionsFor(roles: RoleCode[]): Set<Permission> {
  const out = new Set<Permission>();
  for (const r of roles) for (const p of ROLE_PERMISSIONS[r] ?? []) out.add(p);
  return out;
}

export function isReadonlyRole(code: RoleCode): boolean {
  return ROLES[code]?.readonly ?? false;
}

/**
 * Roles for which MFA is mandatory. Privileged access to confidential data,
 * payroll, audit or tenant administration must be behind a second factor.
 */
export const MFA_REQUIRED_ROLES: RoleCode[] = ["R06", "R08", "R09", "R10", "R12", "R13"];

export function requiresMfa(roles: RoleCode[]): boolean {
  return roles.some((r) => MFA_REQUIRED_ROLES.includes(r));
}

export const IS_ROLE_CODE = (v: unknown): v is RoleCode =>
  typeof v === "string" && (ROLE_CODES as readonly string[]).includes(v);
