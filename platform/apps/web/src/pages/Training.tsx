import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "../lib/api.js";
import { useAuth } from "../lib/auth.js";
import { PageHeader } from "../components/PageHeader.js";

const statusClass = (s: string) => (s === "completed" ? "tag-ok" : s === "expired" ? "tag-err" : "tag-warn");

export function TrainingPage() {
  const { can } = useAuth();
  const qc = useQueryClient();
  const canWrite = can("training:write");
  const rows = useQuery({ queryKey: ["training"], queryFn: api.training });
  const summary = useQuery({ queryKey: ["trainingSummary"], queryFn: api.trainingSummary, enabled: can("training:read") });
  const employees = useQuery({ queryKey: ["employees"], queryFn: api.employees, enabled: canWrite });

  const [form, setForm] = useState({ employeeId: "", course: "", provider: "", expiresOn: "" });
  const [error, setError] = useState<string | null>(null);
  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["training"] });
    void qc.invalidateQueries({ queryKey: ["trainingSummary"] });
  };

  const create = useMutation({
    mutationFn: () => api.createTraining({ employeeId: form.employeeId, course: form.course, provider: form.provider || undefined, expiresOn: form.expiresOn || undefined }),
    onSuccess: () => { setForm({ ...form, course: "", provider: "", expiresOn: "" }); setError(null); invalidate(); },
    onError: (e) => setError(e instanceof ApiError ? e.message : "Could not add"),
  });
  const complete = useMutation({
    mutationFn: (id: string) => api.updateTraining(id, { status: "completed", completedOn: new Date().toISOString().slice(0, 10) }),
    onSuccess: invalidate,
  });

  function onCreate(e: FormEvent) {
    e.preventDefault();
    if (form.employeeId && form.course) create.mutate();
  }

  const s = summary.data?.data;

  return (
    <>
      <PageHeader title="Training & Competency" subtitle="Courses · certifications · expiry" />
      <div className="content">
        {can("training:read") && (
          <div className="kpi-grid" style={{ marginBottom: 16 }}>
            <div className="card kpi"><div className="kpi-label">Compliance</div><div className="kpi-value num">{s ? `${s.compliancePct}%` : "…"}</div><div className="kpi-sub">{s ? `${s.completed}/${s.total} completed` : ""}</div></div>
            <div className="card kpi"><div className="kpi-label">Planned</div><div className="kpi-value num">{s?.planned ?? "…"}</div></div>
            <div className="card kpi"><div className="kpi-label">Expiring ≤ 60d</div><div className="kpi-value num">{s?.expiringSoon ?? "…"}</div></div>
            <div className="card kpi"><div className="kpi-label">Expired</div><div className="kpi-value num">{s?.expired ?? "…"}</div></div>
          </div>
        )}

        {canWrite && (
          <form className="card leave-form" onSubmit={onCreate}>
            <h2 className="sec-h">Add training</h2>
            <div className="leave-fields">
              <label className="field">
                <span>Employee</span>
                <select className="input" value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} required>
                  <option value="">Select…</option>
                  {employees.data?.data.map((e) => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                </select>
              </label>
              <label className="field" style={{ flex: 1, minWidth: 180 }}>
                <span>Course</span>
                <input className="input" value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} placeholder="Working at Heights" required />
              </label>
              <label className="field"><span>Provider</span><input className="input" value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} placeholder="OSHA" /></label>
              <label className="field"><span>Expires</span><input className="input" type="date" value={form.expiresOn} onChange={(e) => setForm({ ...form, expiresOn: e.target.value })} /></label>
              <button className="btn btn-primary" disabled={create.isPending}>Add</button>
            </div>
            {error && <div className="form-err">{error}</div>}
          </form>
        )}

        <div className="card" style={{ marginTop: 16 }}>
          <table className="tbl">
            <thead>
              <tr><th>Course</th><th>Provider</th><th>Status</th><th>Completed</th><th>Expires</th>{canWrite && <th className="ta-r">Action</th>}</tr>
            </thead>
            <tbody>
              {rows.isLoading && <tr><td colSpan={6} className="muted">Loading…</td></tr>}
              {rows.data?.data.length === 0 && <tr><td colSpan={6} className="muted">No training records.</td></tr>}
              {rows.data?.data.map((t) => (
                <tr key={t.id}>
                  <td>{t.course}</td>
                  <td>{t.provider ?? "—"}</td>
                  <td><span className={`tag ${statusClass(t.status)}`}>{t.status}</span></td>
                  <td className="num">{t.completedOn ? t.completedOn.slice(0, 10) : "—"}</td>
                  <td className="num">{t.expiresOn ? t.expiresOn.slice(0, 10) : "—"}</td>
                  {canWrite && <td className="ta-r">{t.status !== "completed" ? <button className="btn btn-sm" onClick={() => complete.mutate(t.id)}>Mark complete</button> : <span className="muted">—</span>}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
