-- Modules: Leave & Liability, Attendance. Also links a login to its employee
-- record so Employee Self-Service (ESS) can scope "my" leave/attendance.

-- ── Link users to employees (ESS identity) ─────────────────────────────────
ALTER TABLE app_user
  ADD COLUMN employee_id uuid REFERENCES employee(id) ON DELETE SET NULL;

-- ── Leave ──────────────────────────────────────────────────────────────────
CREATE TABLE leave_request (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    uuid NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
  employee_id  uuid NOT NULL REFERENCES employee(id) ON DELETE CASCADE,
  type         text NOT NULL, -- annual | sick | maternity | paternity | unpaid
  start_date   date NOT NULL,
  end_date     date NOT NULL,
  days         integer NOT NULL,
  status       text NOT NULL DEFAULT 'pending', -- pending | approved | rejected | cancelled
  reason       text,
  requested_by uuid NOT NULL, -- app_user.id
  decided_by   uuid,          -- app_user.id (must differ from requester)
  decided_at   timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT leave_dates_valid CHECK (end_date >= start_date),
  CONSTRAINT leave_sod CHECK (decided_by IS NULL OR decided_by <> requested_by)
);
CREATE INDEX leave_request_tenant_idx ON leave_request (tenant_id);
CREATE INDEX leave_request_emp_idx ON leave_request (tenant_id, employee_id);

CREATE TABLE leave_balance (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    uuid NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
  employee_id  uuid NOT NULL REFERENCES employee(id) ON DELETE CASCADE,
  cycle_year   integer NOT NULL,
  entitled_days integer NOT NULL DEFAULT 28,
  taken_days    integer NOT NULL DEFAULT 0,
  UNIQUE (tenant_id, employee_id, cycle_year)
);
CREATE INDEX leave_balance_tenant_idx ON leave_balance (tenant_id);

-- ── Attendance ─────────────────────────────────────────────────────────────
CREATE TABLE attendance_record (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES employee(id) ON DELETE CASCADE,
  work_date   date NOT NULL,
  clock_in    timestamptz NOT NULL,
  clock_out   timestamptz,
  minutes     integer,      -- worked minutes, set on clock-out
  source      text NOT NULL DEFAULT 'manual', -- kiosk | gps | biometric | manual
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, employee_id, work_date)
);
CREATE INDEX attendance_tenant_idx ON attendance_record (tenant_id);
CREATE INDEX attendance_emp_idx ON attendance_record (tenant_id, employee_id);

-- ── RLS ────────────────────────────────────────────────────────────────────
ALTER TABLE leave_request     ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_balance     ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_record ENABLE ROW LEVEL SECURITY;

CREATE POLICY t_iso ON leave_request     USING (tenant_id = app_current_tenant()) WITH CHECK (tenant_id = app_current_tenant());
CREATE POLICY t_iso ON leave_balance     USING (tenant_id = app_current_tenant()) WITH CHECK (tenant_id = app_current_tenant());
CREATE POLICY t_iso ON attendance_record USING (tenant_id = app_current_tenant()) WITH CHECK (tenant_id = app_current_tenant());

-- ── Grants ─────────────────────────────────────────────────────────────────
GRANT SELECT, INSERT, UPDATE, DELETE ON leave_request, leave_balance, attendance_record TO hcmos_app;
