import type { SessionUser } from "@hcmos/shared";

const BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
const ACCESS_KEY = "hcmos.access";
const REFRESH_KEY = "hcmos.refresh";

export const tokens = {
  get access(): string | null {
    return localStorage.getItem(ACCESS_KEY);
  },
  get refresh(): string | null {
    return localStorage.getItem(REFRESH_KEY);
  },
  set(access: string, refresh: string) {
    localStorage.setItem(ACCESS_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

async function attemptRefresh(): Promise<boolean> {
  const refresh = tokens.refresh;
  if (!refresh) return false;
  const res = await fetch(`${BASE}/api/auth/refresh`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ refreshToken: refresh }),
  });
  if (!res.ok) return false;
  const body = (await res.json()) as { accessToken: string; refreshToken: string };
  tokens.set(body.accessToken, body.refreshToken);
  return true;
}

export async function apiFetch<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const headers = new Headers(init.headers);
  // Only declare a JSON content-type when we actually send a body — Fastify
  // rejects an empty body that claims to be application/json.
  if (init.body != null) headers.set("content-type", "application/json");
  if (tokens.access) headers.set("authorization", `Bearer ${tokens.access}`);

  const res = await fetch(`${BASE}/api${path}`, { ...init, headers });

  if (res.status === 401 && retry && (await attemptRefresh())) {
    return apiFetch<T>(path, init, false);
  }
  if (!res.ok) {
    let code = "error";
    let message = res.statusText;
    try {
      const body = (await res.json()) as { error?: string; message?: string };
      code = body.error ?? code;
      message = body.message ?? message;
    } catch {
      /* non-JSON error */
    }
    throw new ApiError(res.status, code, message);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

// ── Typed endpoints ────────────────────────────────────────────────────────
export type LoginResponse =
  | { status: "mfa_required"; mfaToken: string }
  | { status: "mfa_setup_required"; setupToken: string }
  | { status: "ok"; accessToken: string; refreshToken: string; user: SessionUser };

export const api = {
  login: (tenantSlug: string, email: string, password: string) =>
    apiFetch<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ tenantSlug, email, password }),
    }),
  mfaVerify: (mfaToken: string, code: string) =>
    apiFetch<{ status: "ok"; accessToken: string; refreshToken: string; user: SessionUser }>(
      "/auth/mfa/verify",
      { method: "POST", body: JSON.stringify({ mfaToken, code }) },
    ),
  // MFA enrollment uses the restricted setup token as the bearer.
  mfaEnroll: (setupToken: string) =>
    apiFetch<{ secret: string; otpauthUri: string }>("/auth/mfa/enroll", {
      method: "POST",
      headers: { authorization: `Bearer ${setupToken}` },
    }),
  mfaEnrollVerify: (setupToken: string, code: string) =>
    apiFetch<{ status: string; mfaEnabled: boolean }>("/auth/mfa/enroll/verify", {
      method: "POST",
      headers: { authorization: `Bearer ${setupToken}` },
      body: JSON.stringify({ code }),
    }),
  me: () => apiFetch<SessionUser>("/auth/me"),
  logout: () => apiFetch<{ status: string }>("/auth/logout", { method: "POST" }),
  employees: () => apiFetch<{ data: EmployeeDto[] }>("/employees"),
  payrollRuns: () => apiFetch<{ data: PayrollRunDto[] }>("/payroll/runs"),
  auditEvents: () => apiFetch<{ data: AuditEventDto[] }>("/audit/events?limit=50"),
  auditVerify: () => apiFetch<{ data: { ok: boolean; count: number; reason?: string } }>("/audit/verify"),

  leaveRequests: () => apiFetch<{ data: LeaveRequestDto[] }>("/leave/requests"),
  leaveLiability: () => apiFetch<{ data: LeaveLiabilityDto }>("/leave/liability"),
  createLeave: (body: { type: string; startDate: string; endDate: string; reason?: string }) =>
    apiFetch<{ data: LeaveRequestDto }>("/leave/requests", { method: "POST", body: JSON.stringify(body) }),
  decideLeave: (id: string, decision: "approve" | "reject") =>
    apiFetch<{ data: LeaveRequestDto }>(`/leave/requests/${id}/decide`, { method: "POST", body: JSON.stringify({ decision }) }),

  attendance: () => apiFetch<{ data: AttendanceDto[] }>("/attendance"),
  clockIn: () => apiFetch<{ data: AttendanceDto }>("/attendance/clock-in", { method: "POST", body: JSON.stringify({ source: "manual" }) }),
  clockOut: () => apiFetch<{ data: AttendanceDto }>("/attendance/clock-out", { method: "POST", body: JSON.stringify({}) }),

  reviews: () => apiFetch<{ data: ReviewDto[] }>("/performance/reviews"),
  createReview: (body: { employeeId: string; cycle: string }) =>
    apiFetch<{ data: ReviewDto }>("/performance/reviews", { method: "POST", body: JSON.stringify(body) }),
  updateReview: (id: string, body: { rating?: number; strengths?: string; improvements?: string }) =>
    apiFetch<{ data: ReviewDto }>(`/performance/reviews/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  submitReview: (id: string) => apiFetch<{ data: ReviewDto }>(`/performance/reviews/${id}/submit`, { method: "POST", body: JSON.stringify({}) }),
  acknowledgeReview: (id: string) => apiFetch<{ data: ReviewDto }>(`/performance/reviews/${id}/acknowledge`, { method: "POST", body: JSON.stringify({}) }),

  departments: () => apiFetch<{ data: DeptDto[] }>("/org/departments"),
  createDept: (body: { name: string; code?: string; parentId?: string; managerId?: string }) =>
    apiFetch<{ data: DeptDto }>("/org/departments", { method: "POST", body: JSON.stringify(body) }),

  training: () => apiFetch<{ data: TrainingDto[] }>("/training"),
  trainingSummary: () => apiFetch<{ data: TrainingSummaryDto }>("/training/summary"),
  createTraining: (body: { employeeId: string; course: string; provider?: string; status?: string; completedOn?: string; expiresOn?: string }) =>
    apiFetch<{ data: TrainingDto }>("/training", { method: "POST", body: JSON.stringify(body) }),
  updateTraining: (id: string, body: { status?: string; completedOn?: string; expiresOn?: string }) =>
    apiFetch<{ data: TrainingDto }>(`/training/${id}`, { method: "PATCH", body: JSON.stringify(body) }),

  kpiScorecard: () => apiFetch<{ data: KpiDto[] }>("/kpi/scorecard"),

  hseqIncidents: () => apiFetch<{ data: IncidentDto[] }>("/hseq/incidents"),
  hseqSummary: () => apiFetch<{ data: HseqSummaryDto }>("/hseq/summary"),
  reportIncident: (body: {
    locationCode: string;
    category: string;
    severity: string;
    description: string;
    occurredOn: string;
    employeeId?: string;
  }) => apiFetch<{ data: IncidentDto }>("/hseq/incidents", { method: "POST", body: JSON.stringify(body) }),
  updateIncident: (id: string, status: string) =>
    apiFetch<{ data: IncidentDto }>(`/hseq/incidents/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),
};

export interface ReviewDto {
  id: string;
  employeeId: string;
  cycle: string;
  rating: number | null;
  status: string;
  strengths: string | null;
  improvements: string | null;
  createdAt: string;
}

export interface DeptDto {
  id: string;
  name: string;
  code: string | null;
  parentId: string | null;
  managerId: string | null;
  managerName: string | null;
  headcount: number;
}

export interface IncidentDto {
  id: string;
  employeeId: string | null;
  locationCode: string;
  category: string;
  severity: string;
  description: string;
  occurredOn: string;
  status: string;
  createdAt: string;
}

export interface HseqSummaryDto {
  daysSinceLti: number | null;
  incidentsMtd: number;
  ltiYtd: number;
  openIncidents: number;
  validMedicalPct: number;
  ppeCompliancePct: number;
}

export interface TrainingDto {
  id: string;
  employeeId: string;
  course: string;
  provider: string | null;
  status: string;
  completedOn: string | null;
  expiresOn: string | null;
  createdAt: string;
}

export interface TrainingSummaryDto {
  total: number;
  completed: number;
  planned: number;
  expired: number;
  expiringSoon: number;
  compliancePct: number;
}

export interface KpiDto {
  category: string;
  key: string;
  label: string;
  value: number;
  unit?: string;
  target?: number;
  goodDirection?: "up" | "down";
  sub?: string;
}

export interface LeaveRequestDto {
  id: string;
  employeeId: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  status: string;
  reason: string | null;
  requestedBy: string;
  decidedBy: string | null;
  createdAt: string;
}

export interface LeaveLiabilityDto {
  cycleYear: number;
  employees: number;
  accruedDays: number;
  monetisedTZS: number;
}

export interface AttendanceDto {
  id: string;
  employeeId: string;
  workDate: string;
  clockIn: string;
  clockOut: string | null;
  minutes: number | null;
  source: string;
}

export interface EmployeeDto {
  id: string;
  employeeNo: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  locationCode: string;
  status: string;
  contractType: string;
  startDate: string;
  basicSalary?: number;
}

export interface PayrollRunDto {
  id: string;
  period: string;
  status: string;
  tableId: string;
  grossTotal: string;
  netTotal: string;
  statTotal: string;
  createdAt: string;
  approvedAt: string | null;
}

export interface AuditEventDto {
  seq: number;
  action: string;
  entity: string;
  entityId: string | null;
  hash: string;
  createdAt: string;
}
