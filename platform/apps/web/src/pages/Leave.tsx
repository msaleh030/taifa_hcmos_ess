import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "../lib/api.js";
import { useAuth } from "../lib/auth.js";
import { PageHeader } from "../components/PageHeader.js";

const TZS = new Intl.NumberFormat("en-TZ", { maximumFractionDigits: 0 });
const statusClass = (s: string) =>
  s === "approved" ? "tag-ok" : s === "rejected" ? "tag-err" : s === "pending" ? "tag-warn" : "";

export function LeavePage() {
  const { can } = useAuth();
  const qc = useQueryClient();
  const requests = useQuery({ queryKey: ["leaveRequests"], queryFn: api.leaveRequests });
  const liability = useQuery({ queryKey: ["leaveLiability"], queryFn: api.leaveLiability, enabled: can("leave:read") });

  const [type, setType] = useState("annual");
  const [startDate, setStart] = useState("");
  const [endDate, setEnd] = useState("");
  const [error, setError] = useState<string | null>(null);

  const create = useMutation({
    mutationFn: () => api.createLeave({ type, startDate, endDate }),
    onSuccess: () => {
      setStart("");
      setEnd("");
      setError(null);
      void qc.invalidateQueries({ queryKey: ["leaveRequests"] });
    },
    onError: (e) => setError(e instanceof ApiError ? e.message : "Could not submit"),
  });

  const decide = useMutation({
    mutationFn: ({ id, decision }: { id: string; decision: "approve" | "reject" }) => api.decideLeave(id, decision),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["leaveRequests"] });
      void qc.invalidateQueries({ queryKey: ["leaveLiability"] });
    },
  });

  function submit(e: FormEvent) {
    e.preventDefault();
    create.mutate();
  }

  return (
    <>
      <PageHeader title="Leave & Liability" subtitle="ELRA entitlements · maker ≠ checker approval" />
      <div className="content">
        {can("leave:read") && (
          <div className="kpi-grid" style={{ marginBottom: 16 }}>
            <div className="card kpi">
              <div className="kpi-label">Monetised leave liability</div>
              <div className="kpi-value num">
                {liability.data ? `TZS ${TZS.format(liability.data.data.monetisedTZS)}` : "…"}
              </div>
              <div className="kpi-sub">
                {liability.data
                  ? `${liability.data.data.accruedDays} accrued days · cycle ${liability.data.data.cycleYear}`
                  : ""}
              </div>
            </div>
          </div>
        )}

        {can("leave:request") && (
          <form className="card leave-form" onSubmit={submit}>
            <h2 className="sec-h">Request leave</h2>
            <div className="leave-fields">
              <label className="field">
                <span>Type</span>
                <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="annual">Annual</option>
                  <option value="sick">Sick</option>
                  <option value="maternity">Maternity</option>
                  <option value="paternity">Paternity</option>
                  <option value="unpaid">Unpaid</option>
                </select>
              </label>
              <label className="field">
                <span>From</span>
                <input className="input" type="date" value={startDate} onChange={(e) => setStart(e.target.value)} required />
              </label>
              <label className="field">
                <span>To</span>
                <input className="input" type="date" value={endDate} onChange={(e) => setEnd(e.target.value)} required />
              </label>
              <button className="btn btn-primary" disabled={create.isPending}>
                {create.isPending ? "Submitting…" : "Submit"}
              </button>
            </div>
            {error && <div className="form-err">{error}</div>}
          </form>
        )}

        <div className="card" style={{ marginTop: 16 }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Type</th>
                <th>From</th>
                <th>To</th>
                <th className="ta-r">Days</th>
                <th>Status</th>
                {can("leave:approve") && <th className="ta-r">Action</th>}
              </tr>
            </thead>
            <tbody>
              {requests.isLoading && (
                <tr>
                  <td colSpan={6} className="muted">
                    Loading…
                  </td>
                </tr>
              )}
              {requests.data?.data.length === 0 && (
                <tr>
                  <td colSpan={6} className="muted">
                    No leave requests.
                  </td>
                </tr>
              )}
              {requests.data?.data.map((r) => (
                <tr key={r.id}>
                  <td style={{ textTransform: "capitalize" }}>{r.type}</td>
                  <td className="num">{r.startDate.slice(0, 10)}</td>
                  <td className="num">{r.endDate.slice(0, 10)}</td>
                  <td className="num ta-r">{r.days}</td>
                  <td>
                    <span className={`tag ${statusClass(r.status)}`}>{r.status}</span>
                  </td>
                  {can("leave:approve") && (
                    <td className="ta-r">
                      {r.status === "pending" ? (
                        <span className="row-actions">
                          <button className="btn btn-sm" onClick={() => decide.mutate({ id: r.id, decision: "approve" })}>
                            Approve
                          </button>
                          <button className="btn btn-sm" onClick={() => decide.mutate({ id: r.id, decision: "reject" })}>
                            Reject
                          </button>
                        </span>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
