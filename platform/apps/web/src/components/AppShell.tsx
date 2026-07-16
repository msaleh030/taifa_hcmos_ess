import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../lib/auth.js";
import { ROLES, type RoleCode } from "@hcmos/shared";

interface NavEntry {
  to: string;
  label: string;
  requires?: Parameters<ReturnType<typeof useAuth>["can"]>[0];
}

const NAV: NavEntry[] = [
  { to: "/", label: "Dashboard" },
  { to: "/employees", label: "Employees", requires: "employee:read" },
  { to: "/leave", label: "Leave & Liability", requires: "leave:read" },
  { to: "/attendance", label: "Attendance" },
  { to: "/performance", label: "Performance", requires: "performance:read" },
  { to: "/org", label: "Organization", requires: "employee:read" },
  { to: "/hseq", label: "HSEQ", requires: "hseq:read" },
  { to: "/payroll", label: "Payroll", requires: "payroll:read" },
  { to: "/audit", label: "Audit", requires: "audit:read" },
];

export function AppShell() {
  const { user, can, logout } = useAuth();
  const roleTitles = (user?.roles ?? []).map((r) => ROLES[r as RoleCode]?.title ?? r).join(", ");

  return (
    <div className="shell">
      <aside className="side">
        <div className="brand">
          <div className="bs-mark">
            HCMOS<sup>™</sup>
          </div>
          <div className="bs-desc">Human Capital Management OS</div>
        </div>
        <nav className="navlist">
          {NAV.filter((n) => !n.requires || can(n.requires)).map((n) => (
            <NavLink key={n.to} to={n.to} end={n.to === "/"} className={({ isActive }) => `navitem${isActive ? " on" : ""}`}>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="sideft">
          <div className="userchip">
            <div className="avatar">{initials(user?.displayName ?? "?")}</div>
            <div style={{ minWidth: 0 }}>
              <div className="uc-name">{user?.displayName}</div>
              <div className="uc-role" title={roleTitles}>
                {roleTitles}
              </div>
            </div>
          </div>
          <button className="btn" style={{ width: "100%", marginTop: 8 }} onClick={() => void logout()}>
            Sign out
          </button>
        </div>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}
