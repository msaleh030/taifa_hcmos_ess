import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./lib/auth.js";
import { AppShell } from "./components/AppShell.js";
import { LoginPage } from "./pages/Login.js";
import { DashboardPage } from "./pages/Dashboard.js";
import { EmployeesPage } from "./pages/Employees.js";
import { PayrollPage } from "./pages/Payroll.js";
import { LeavePage } from "./pages/Leave.js";
import { AttendancePage } from "./pages/Attendance.js";
import { PerformancePage } from "./pages/Performance.js";
import { OrgPage } from "./pages/Org.js";
import { HseqPage } from "./pages/Hseq.js";
import { TrainingPage } from "./pages/Training.js";
import { KpiPage } from "./pages/Kpi.js";
import { AuditPage } from "./pages/Audit.js";
import type { ReactElement } from "react";

function Protected({ children }: { children: ReactElement }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="center-note">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <Protected>
            <AppShell />
          </Protected>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="/employees" element={<EmployeesPage />} />
        <Route path="/leave" element={<LeavePage />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/performance" element={<PerformancePage />} />
        <Route path="/org" element={<OrgPage />} />
        <Route path="/hseq" element={<HseqPage />} />
        <Route path="/training" element={<TrainingPage />} />
        <Route path="/kpi" element={<KpiPage />} />
        <Route path="/payroll" element={<PayrollPage />} />
        <Route path="/audit" element={<AuditPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
