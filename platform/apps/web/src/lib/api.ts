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
  headers.set("content-type", "application/json");
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
};

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
