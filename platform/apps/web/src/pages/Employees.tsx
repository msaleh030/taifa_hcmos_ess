import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api.js";
import { useAuth } from "../lib/auth.js";
import { PageHeader } from "../components/PageHeader.js";

const TZS = new Intl.NumberFormat("en-TZ", { style: "currency", currency: "TZS", maximumFractionDigits: 0 });

export function EmployeesPage() {
  const { can } = useAuth();
  const { data, isLoading, error } = useQuery({ queryKey: ["employees"], queryFn: api.employees });
  const showConfidential = can("employee:read:confidential");

  return (
    <>
      <PageHeader title="Employees" subtitle="Single source of truth · TMCL-<LOC>-<SEQ>" />
      <div className="content">
        <div className="card">
          <table className="tbl">
            <thead>
              <tr>
                <th>Employee no.</th>
                <th>Name</th>
                <th>Job title</th>
                <th>Site</th>
                <th>Contract</th>
                <th>Status</th>
                {showConfidential && <th className="ta-r">Basic salary</th>}
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={showConfidential ? 7 : 6} className="muted">
                    Loading…
                  </td>
                </tr>
              )}
              {error && (
                <tr>
                  <td colSpan={showConfidential ? 7 : 6} className="form-err">
                    Failed to load employees.
                  </td>
                </tr>
              )}
              {data?.data.map((e) => (
                <tr key={e.id}>
                  <td className="num">{e.employeeNo}</td>
                  <td>
                    {e.firstName} {e.lastName}
                  </td>
                  <td>{e.jobTitle}</td>
                  <td>{e.locationCode}</td>
                  <td>{e.contractType}</td>
                  <td>
                    <span className={`tag ${e.status === "active" ? "tag-ok" : ""}`}>{e.status}</span>
                  </td>
                  {showConfidential && (
                    <td className="num ta-r">{e.basicSalary != null ? TZS.format(e.basicSalary) : "—"}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!showConfidential && (
          <p className="muted" style={{ marginTop: 12 }}>
            Salary is not shown — your role lacks <code>employee:read:confidential</code>. Per the design contract the
            field is absent, not masked: the client never receives it.
          </p>
        )}
      </div>
    </>
  );
}
