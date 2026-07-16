import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "../lib/api.js";
import { useAuth } from "../lib/auth.js";
import { PageHeader } from "../components/PageHeader.js";

export function OrgPage() {
  const { can } = useAuth();
  const qc = useQueryClient();
  const canManage = can("org:manage");
  const depts = useQuery({ queryKey: ["departments"], queryFn: api.departments });

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const create = useMutation({
    mutationFn: () => api.createDept({ name, code: code || undefined }),
    onSuccess: () => { setName(""); setCode(""); setError(null); void qc.invalidateQueries({ queryKey: ["departments"] }); },
    onError: (e) => setError(e instanceof ApiError ? e.message : "Could not create department"),
  });

  function onCreate(e: FormEvent) {
    e.preventDefault();
    if (name) create.mutate();
  }

  const totalHeadcount = depts.data?.data.reduce((n, d) => n + d.headcount, 0) ?? 0;

  return (
    <>
      <PageHeader title="Organization" subtitle="Departments · reporting lines · headcount" />
      <div className="content">
        <div className="kpi-grid" style={{ marginBottom: 16 }}>
          <div className="card kpi">
            <div className="kpi-label">Departments</div>
            <div className="kpi-value num">{depts.data?.data.length ?? "…"}</div>
          </div>
          <div className="card kpi">
            <div className="kpi-label">Assigned headcount</div>
            <div className="kpi-value num">{totalHeadcount}</div>
          </div>
        </div>

        {canManage && (
          <form className="card leave-form" onSubmit={onCreate}>
            <h2 className="sec-h">Add department</h2>
            <div className="leave-fields">
              <label className="field">
                <span>Name</span>
                <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
              </label>
              <label className="field">
                <span>Code</span>
                <input className="input" value={code} onChange={(e) => setCode(e.target.value)} placeholder="OPS" />
              </label>
              <button className="btn btn-primary" disabled={create.isPending}>Add</button>
            </div>
            {error && <div className="form-err">{error}</div>}
          </form>
        )}

        <div className="card" style={{ marginTop: 16 }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Department</th>
                <th>Code</th>
                <th>Head</th>
                <th className="ta-r">Headcount</th>
              </tr>
            </thead>
            <tbody>
              {depts.isLoading && <tr><td colSpan={4} className="muted">Loading…</td></tr>}
              {depts.data?.data.map((d) => (
                <tr key={d.id}>
                  <td>{d.name}</td>
                  <td className="num">{d.code ?? "—"}</td>
                  <td>{d.managerName ?? <span className="muted">Unassigned</span>}</td>
                  <td className="num ta-r">{d.headcount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
