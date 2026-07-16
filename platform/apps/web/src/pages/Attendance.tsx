import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "../lib/api.js";
import { useAuth } from "../lib/auth.js";
import { PageHeader } from "../components/PageHeader.js";
import { useState } from "react";

function fmtMinutes(m: number | null): string {
  if (m == null) return "—";
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${h}h ${String(min).padStart(2, "0")}m`;
}

export function AttendancePage() {
  const { can } = useAuth();
  const qc = useQueryClient();
  const records = useQuery({ queryKey: ["attendance"], queryFn: api.attendance });
  const [msg, setMsg] = useState<string | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["attendance"] });
  const onErr = (e: unknown) => setMsg(e instanceof ApiError ? e.message : "Action failed");

  const clockIn = useMutation({ mutationFn: api.clockIn, onSuccess: () => { setMsg("Clocked in."); void invalidate(); }, onError: onErr });
  const clockOut = useMutation({ mutationFn: api.clockOut, onSuccess: () => { setMsg("Clocked out."); void invalidate(); }, onError: onErr });

  return (
    <>
      <PageHeader
        title="Attendance"
        subtitle={can("attendance:read") ? "Site roster · GPS · biometric · kiosk" : "Clock in and out"}
        actions={
          can("attendance:clock") ? (
            <span className="row-actions">
              <button className="btn" onClick={() => clockIn.mutate()} disabled={clockIn.isPending}>
                Clock in
              </button>
              <button className="btn btn-primary" onClick={() => clockOut.mutate()} disabled={clockOut.isPending}>
                Clock out
              </button>
            </span>
          ) : null
        }
      />
      <div className="content">
        {msg && <div className="form-note" style={{ marginBottom: 12 }}>{msg}</div>}
        <div className="card">
          <table className="tbl">
            <thead>
              <tr>
                <th>Date</th>
                <th>Clock in</th>
                <th>Clock out</th>
                <th className="ta-r">Worked</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              {records.isLoading && (
                <tr>
                  <td colSpan={5} className="muted">
                    Loading…
                  </td>
                </tr>
              )}
              {records.data?.data.length === 0 && (
                <tr>
                  <td colSpan={5} className="muted">
                    No attendance records yet.
                  </td>
                </tr>
              )}
              {records.data?.data.map((r) => (
                <tr key={r.id}>
                  <td className="num">{r.workDate.slice(0, 10)}</td>
                  <td className="num">{new Date(r.clockIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td>
                  <td className="num">
                    {r.clockOut ? new Date(r.clockOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                  </td>
                  <td className="num ta-r">{fmtMinutes(r.minutes)}</td>
                  <td>
                    <span className="tag">{r.source}</span>
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
