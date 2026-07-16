import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api.js";
import { PageHeader } from "../components/PageHeader.js";

export function AuditPage() {
  const events = useQuery({ queryKey: ["auditEvents"], queryFn: api.auditEvents });
  const verify = useQuery({ queryKey: ["auditVerify"], queryFn: api.auditVerify });

  const v = verify.data?.data;

  return (
    <>
      <PageHeader
        title="Audit ledger"
        subtitle="Append-only, hash-chained, tamper-evident"
        actions={
          v ? (
            <span className={`tag ${v.ok ? "tag-ok" : "tag-err"}`}>
              {v.ok ? `Chain intact · ${v.count} events` : `Chain broken: ${v.reason}`}
            </span>
          ) : null
        }
      />
      <div className="content">
        <div className="card">
          <table className="tbl">
            <thead>
              <tr>
                <th>#</th>
                <th>Action</th>
                <th>Entity</th>
                <th>When</th>
                <th>Hash</th>
              </tr>
            </thead>
            <tbody>
              {events.isLoading && (
                <tr>
                  <td colSpan={5} className="muted">
                    Loading…
                  </td>
                </tr>
              )}
              {events.data?.data.map((e) => (
                <tr key={e.seq}>
                  <td className="num">{e.seq}</td>
                  <td>{e.action}</td>
                  <td>
                    {e.entity}
                    {e.entityId ? ` · ${e.entityId.slice(0, 8)}` : ""}
                  </td>
                  <td className="muted">{new Date(e.createdAt).toLocaleString()}</td>
                  <td className="num mono-ellipsis" title={e.hash}>
                    {e.hash.slice(0, 12)}…
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
