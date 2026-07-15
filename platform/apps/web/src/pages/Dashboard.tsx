import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api.js";
import { useAuth } from "../lib/auth.js";
import { PageHeader } from "../components/PageHeader.js";
import { ROLES, type RoleCode } from "@hcmos/shared";

export function DashboardPage() {
  const { user, can } = useAuth();
  const employees = useQuery({ queryKey: ["employees"], queryFn: api.employees, enabled: can("employee:read") });
  const runs = useQuery({ queryKey: ["payrollRuns"], queryFn: api.payrollRuns, enabled: can("payroll:read") });

  const headcount = employees.data?.data.length ?? 0;
  const latestRun = runs.data?.data[0];

  return (
    <>
      <PageHeader title="Dashboard" subtitle={`Signed in as ${user?.displayName} · ${(user?.roles ?? []).map((r) => ROLES[r as RoleCode]?.title).join(", ")}`} />
      <div className="content">
        <div className="kpi-grid">
          {can("employee:read") && (
            <div className="card kpi">
              <div className="kpi-label">Active employees</div>
              <div className="kpi-value num">{employees.isLoading ? "…" : headcount}</div>
              <div className="kpi-sub">Tenant: {user?.tenantSlug}</div>
            </div>
          )}
          {can("payroll:read") && (
            <div className="card kpi">
              <div className="kpi-label">Latest payroll</div>
              <div className="kpi-value num">{latestRun ? latestRun.period : "—"}</div>
              <div className="kpi-sub">{latestRun ? `Status: ${latestRun.status}` : "No runs yet"}</div>
            </div>
          )}
          <div className="card kpi">
            <div className="kpi-label">Your permissions</div>
            <div className="kpi-value num">{user?.permissions.length ?? 0}</div>
            <div className="kpi-sub">Role-scoped access</div>
          </div>
        </div>

        <div className="card" style={{ padding: "var(--pad)", marginTop: 16 }}>
          <h2 className="sec-h">Access summary</h2>
          <p className="muted">
            This build enforces the design contract's rules server-side: per-tenant row-level security, confidential
            fields <strong>absent, not masked</strong> without the grant, and segregation of duties on payroll
            (the maker cannot approve their own run). Navigation is scoped to what your roles permit.
          </p>
          <div className="chips">
            {(user?.permissions ?? []).map((p) => (
              <span key={p} className="tag">
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
