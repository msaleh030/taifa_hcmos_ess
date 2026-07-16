import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api.js";
import { PageHeader } from "../components/PageHeader.js";

const TZS = new Intl.NumberFormat("en-TZ", { maximumFractionDigits: 0 });

export function PayrollPage() {
  const { data, isLoading } = useQuery({ queryKey: ["payrollRuns"], queryFn: api.payrollRuns });

  return (
    <>
      <PageHeader title="Payroll" subtitle="NSSF · PAYE · SDL · WCF — computed by the statutory engine" />
      <div className="content">
        <div className="card">
          <table className="tbl">
            <thead>
              <tr>
                <th>Period</th>
                <th>Status</th>
                <th>Statutory table</th>
                <th className="ta-r">Gross (TZS)</th>
                <th className="ta-r">Net (TZS)</th>
                <th className="ta-r">Statutory (TZS)</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={6} className="muted">
                    Loading…
                  </td>
                </tr>
              )}
              {data?.data.length === 0 && (
                <tr>
                  <td colSpan={6} className="muted">
                    No payroll runs yet.
                  </td>
                </tr>
              )}
              {data?.data.map((r) => (
                <tr key={r.id}>
                  <td className="num">{r.period}</td>
                  <td>
                    <span className={`tag ${r.status === "approved" ? "tag-ok" : r.status === "run" ? "tag-warn" : ""}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="num">{r.tableId}</td>
                  <td className="num ta-r">{TZS.format(Number(r.grossTotal))}</td>
                  <td className="num ta-r">{TZS.format(Number(r.netTotal))}</td>
                  <td className="num ta-r">{TZS.format(Number(r.statTotal))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="muted" style={{ marginTop: 12 }}>
          Runs are created by a Payroll Officer (<code>payroll:run</code>) and approved by a different Finance role
          (<code>payroll:approve</code>). Segregation of duties is enforced by the API and a database constraint.
        </p>
      </div>
    </>
  );
}
