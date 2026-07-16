import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "../lib/api.js";
import { useAuth } from "../lib/auth.js";
import { PageHeader } from "../components/PageHeader.js";

const statusClass = (s: string) => (s === "acknowledged" ? "tag-ok" : s === "submitted" ? "tag-warn" : "");

export function PerformancePage() {
  const { can } = useAuth();
  const qc = useQueryClient();
  const isReviewer = can("performance:write");
  const reviews = useQuery({ queryKey: ["reviews"], queryFn: api.reviews });
  const employees = useQuery({ queryKey: ["employees"], queryFn: api.employees, enabled: isReviewer });

  const [employeeId, setEmployeeId] = useState("");
  const [cycle, setCycle] = useState("2026-Q3");
  const [error, setError] = useState<string | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["reviews"] });

  const create = useMutation({
    mutationFn: () => api.createReview({ employeeId, cycle }),
    onSuccess: () => { setError(null); void invalidate(); },
    onError: (e) => setError(e instanceof ApiError ? e.message : "Could not create review"),
  });
  const rate = useMutation({ mutationFn: (v: { id: string; rating: number }) => api.updateReview(v.id, { rating: v.rating }), onSuccess: invalidate });
  const submit = useMutation({ mutationFn: (id: string) => api.submitReview(id), onSuccess: invalidate, onError: (e) => setError(e instanceof ApiError ? e.message : "Submit failed") });
  const ack = useMutation({ mutationFn: (id: string) => api.acknowledgeReview(id), onSuccess: invalidate });

  function onCreate(e: FormEvent) {
    e.preventDefault();
    if (employeeId) create.mutate();
  }

  return (
    <>
      <PageHeader title="Performance" subtitle="Appraisal cycles · draft → submit → acknowledge" />
      <div className="content">
        {isReviewer && (
          <form className="card leave-form" onSubmit={onCreate}>
            <h2 className="sec-h">Open an appraisal</h2>
            <div className="leave-fields">
              <label className="field">
                <span>Employee</span>
                <select className="input" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} required>
                  <option value="">Select…</option>
                  {employees.data?.data.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.firstName} {e.lastName} · {e.employeeNo}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Cycle</span>
                <input className="input" value={cycle} onChange={(e) => setCycle(e.target.value)} placeholder="2026-Q3" />
              </label>
              <button className="btn btn-primary" disabled={create.isPending}>Create draft</button>
            </div>
            {error && <div className="form-err">{error}</div>}
          </form>
        )}

        <div className="card" style={{ marginTop: 16 }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Cycle</th>
                <th className="ta-r">Rating</th>
                <th>Status</th>
                <th className="ta-r">Action</th>
              </tr>
            </thead>
            <tbody>
              {reviews.isLoading && <tr><td colSpan={4} className="muted">Loading…</td></tr>}
              {reviews.data?.data.length === 0 && <tr><td colSpan={4} className="muted">No reviews yet.</td></tr>}
              {reviews.data?.data.map((r) => (
                <tr key={r.id}>
                  <td className="num">{r.cycle}</td>
                  <td className="num ta-r">{r.rating ?? "—"}</td>
                  <td><span className={`tag ${statusClass(r.status)}`}>{r.status}</span></td>
                  <td className="ta-r">
                    {isReviewer && r.status === "draft" && (
                      <span className="row-actions">
                        <select
                          className="input"
                          style={{ width: 64, padding: "4px 6px" }}
                          defaultValue={r.rating ?? ""}
                          onChange={(e) => rate.mutate({ id: r.id, rating: Number(e.target.value) })}
                        >
                          <option value="" disabled>—</option>
                          {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
                        </select>
                        <button className="btn btn-sm" onClick={() => submit.mutate(r.id)}>Submit</button>
                      </span>
                    )}
                    {!isReviewer && r.status === "submitted" && (
                      <button className="btn btn-sm btn-primary" onClick={() => ack.mutate(r.id)}>Acknowledge</button>
                    )}
                    {(r.status === "acknowledged" || (isReviewer && r.status === "submitted")) && <span className="muted">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
