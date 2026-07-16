import { useQuery } from "@tanstack/react-query";
import { api, type KpiDto } from "../lib/api.js";
import { PageHeader } from "../components/PageHeader.js";

const TZS = new Intl.NumberFormat("en-TZ", { maximumFractionDigits: 0 });

function formatValue(k: KpiDto): string {
  if (k.unit === "TZS") return `TZS ${TZS.format(k.value)}`;
  if (k.unit === "%") return `${k.value}%`;
  if (k.unit === "/5") return `${k.value}/5`;
  if (k.unit === "days") return `${k.value} days`;
  if (k.unit === "staff") return `${k.value}`;
  return String(k.value);
}

/** Red/amber/green vs target, honouring whether higher or lower is better. */
function rag(k: KpiDto): "ok" | "warn" | "err" | "none" {
  if (k.target == null || !k.goodDirection) return "none";
  if (k.goodDirection === "up") {
    if (k.value >= k.target) return "ok";
    if (k.value >= k.target * 0.9) return "warn";
    return "err";
  }
  if (k.value <= k.target) return "ok";
  if (k.value <= k.target * 1.1) return "warn";
  return "err";
}

const dot = { ok: "var(--green)", warn: "var(--yellow)", err: "var(--red)", none: "var(--border)" } as const;

export function KpiPage() {
  const { data, isLoading } = useQuery({ queryKey: ["kpiScorecard"], queryFn: api.kpiScorecard });
  const kpis = data?.data ?? [];
  const categories = [...new Set(kpis.map((k) => k.category))];

  return (
    <>
      <PageHeader title="KPI Scorecard" subtitle="Group operating picture · computed live across modules" />
      <div className="content">
        {isLoading && <div className="muted">Loading…</div>}
        {categories.map((cat) => (
          <section key={cat} style={{ marginBottom: 22 }}>
            <h2 className="sec-h" style={{ marginBottom: 10 }}>{cat}</h2>
            <div className="kpi-grid">
              {kpis.filter((k) => k.category === cat).map((k) => {
                const status = rag(k);
                return (
                  <div key={k.key} className="card kpi" style={{ position: "relative" }}>
                    <span style={{ position: "absolute", top: 16, right: 16, width: 9, height: 9, borderRadius: "50%", background: dot[status] }} title={status === "none" ? "no target" : status} />
                    <div className="kpi-label">{k.label}</div>
                    <div className="kpi-value num">{formatValue(k)}</div>
                    <div className="kpi-sub">
                      {k.sub ?? ""}
                      {k.target != null && (
                        <span style={{ marginLeft: k.sub ? 8 : 0 }}>
                          target {k.unit === "TZS" ? TZS.format(k.target) : k.target}{k.unit === "%" ? "%" : ""}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
