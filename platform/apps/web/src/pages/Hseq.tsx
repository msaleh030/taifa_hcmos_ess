import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "../lib/api.js";
import { useAuth } from "../lib/auth.js";
import { PageHeader } from "../components/PageHeader.js";

const sevClass = (s: string) => (s === "lti" || s === "high" ? "tag-err" : s === "medium" ? "tag-warn" : "");

export function HseqPage() {
  const { can } = useAuth();
  const qc = useQueryClient();
  const canWrite = can("hseq:write");
  const summary = useQuery({ queryKey: ["hseqSummary"], queryFn: api.hseqSummary });
  const incidents = useQuery({ queryKey: ["hseqIncidents"], queryFn: api.hseqIncidents });

  const [form, setForm] = useState({ locationCode: "MWD", category: "near_miss", severity: "low", description: "", occurredOn: "" });
  const [error, setError] = useState<string | null>(null);
  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["hseqIncidents"] });
    void qc.invalidateQueries({ queryKey: ["hseqSummary"] });
  };

  const report = useMutation({
    mutationFn: () => api.reportIncident(form),
    onSuccess: () => { setForm({ ...form, description: "", occurredOn: "" }); setError(null); invalidate(); },
    onError: (e) => setError(e instanceof ApiError ? e.message : "Could not report incident"),
  });
  const setStatus = useMutation({ mutationFn: (v: { id: string; status: string }) => api.updateIncident(v.id, v.status), onSuccess: invalidate });

  function onReport(e: FormEvent) {
    e.preventDefault();
    if (form.description && form.occurredOn) report.mutate();
  }

  const s = summary.data?.data;

  return (
    <>
      <PageHeader title="HSEQ" subtitle="Safety, Health, Environment & Quality" />
      <div className="content">
        <div className="kpi-grid" style={{ marginBottom: 16 }}>
          <div className="card kpi">
            <div className="kpi-label">Days since LTI</div>
            <div className="kpi-value num">{s ? (s.daysSinceLti ?? "—") : "…"}</div>
            <div className="kpi-sub">Lost-time injury free</div>
          </div>
          <div className="card kpi">
            <div className="kpi-label">Incidents (MTD)</div>
            <div className="kpi-value num">{s?.incidentsMtd ?? "…"}</div>
            <div className="kpi-sub">{s ? `${s.ltiYtd} LTI YTD · ${s.openIncidents} open` : ""}</div>
          </div>
          <div className="card kpi">
            <div className="kpi-label">PPE compliance</div>
            <div className="kpi-value num">{s ? `${s.ppeCompliancePct}%` : "…"}</div>
          </div>
          <div className="card kpi">
            <div className="kpi-label">Medicals valid</div>
            <div className="kpi-value num">{s ? `${s.validMedicalPct}%` : "…"}</div>
          </div>
        </div>

        {canWrite && (
          <form className="card leave-form" onSubmit={onReport}>
            <h2 className="sec-h">Report an incident</h2>
            <div className="leave-fields">
              <label className="field">
                <span>Site</span>
                <input className="input" style={{ width: 90 }} value={form.locationCode} onChange={(e) => setForm({ ...form, locationCode: e.target.value.toUpperCase() })} />
              </label>
              <label className="field">
                <span>Category</span>
                <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  <option value="injury">Injury</option>
                  <option value="near_miss">Near miss</option>
                  <option value="property">Property</option>
                  <option value="environmental">Environmental</option>
                </select>
              </label>
              <label className="field">
                <span>Severity</span>
                <select className="input" value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="lti">LTI</option>
                </select>
              </label>
              <label className="field">
                <span>Date</span>
                <input className="input" type="date" value={form.occurredOn} onChange={(e) => setForm({ ...form, occurredOn: e.target.value })} required />
              </label>
              <label className="field" style={{ flex: 1, minWidth: 200 }}>
                <span>Description</span>
                <input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
              </label>
              <button className="btn btn-primary" disabled={report.isPending}>Log</button>
            </div>
            {error && <div className="form-err">{error}</div>}
          </form>
        )}

        <div className="card" style={{ marginTop: 16 }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Date</th>
                <th>Site</th>
                <th>Category</th>
                <th>Severity</th>
                <th>Description</th>
                <th>Status</th>
                {canWrite && <th className="ta-r">Action</th>}
              </tr>
            </thead>
            <tbody>
              {incidents.isLoading && <tr><td colSpan={7} className="muted">Loading…</td></tr>}
              {incidents.data?.data.length === 0 && <tr><td colSpan={7} className="muted">No incidents logged.</td></tr>}
              {incidents.data?.data.map((i) => (
                <tr key={i.id}>
                  <td className="num">{i.occurredOn.slice(0, 10)}</td>
                  <td>{i.locationCode}</td>
                  <td style={{ textTransform: "capitalize" }}>{i.category.replace("_", " ")}</td>
                  <td><span className={`tag ${sevClass(i.severity)}`}>{i.severity.toUpperCase()}</span></td>
                  <td>{i.description}</td>
                  <td><span className={`tag ${i.status === "closed" ? "tag-ok" : ""}`}>{i.status}</span></td>
                  {canWrite && (
                    <td className="ta-r">
                      {i.status !== "closed" ? (
                        <span className="row-actions">
                          {i.status === "open" && <button className="btn btn-sm" onClick={() => setStatus.mutate({ id: i.id, status: "investigating" })}>Investigate</button>}
                          <button className="btn btn-sm" onClick={() => setStatus.mutate({ id: i.id, status: "closed" })}>Close</button>
                        </span>
                      ) : <span className="muted">—</span>}
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
