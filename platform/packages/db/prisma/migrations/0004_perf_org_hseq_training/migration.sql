-- Modules: Performance appraisals, Organization (department heads), HSEQ
-- (incidents, PPE, medicals), Training & competency.

-- ── Organization: department head ──────────────────────────────────────────
ALTER TABLE department
  ADD COLUMN code       text,
  ADD COLUMN manager_id uuid REFERENCES employee(id) ON DELETE SET NULL;

-- ── Performance appraisals ─────────────────────────────────────────────────
CREATE TABLE performance_review (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      uuid NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
  employee_id    uuid NOT NULL REFERENCES employee(id) ON DELETE CASCADE,
  cycle          text NOT NULL,               -- e.g. 2026-Q2
  reviewer_id    uuid NOT NULL,               -- app_user.id
  rating         integer,                     -- 1..5 once submitted
  strengths      text,
  improvements   text,
  status         text NOT NULL DEFAULT 'draft', -- draft | submitted | acknowledged
  submitted_at   timestamptz,
  acknowledged_at timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, employee_id, cycle),
  CONSTRAINT review_rating_range CHECK (rating IS NULL OR (rating BETWEEN 1 AND 5))
);
CREATE INDEX perf_review_tenant_idx ON performance_review (tenant_id);
CREATE INDEX perf_review_emp_idx ON performance_review (tenant_id, employee_id);

-- ── HSEQ: incidents ────────────────────────────────────────────────────────
CREATE TABLE hseq_incident (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     uuid NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
  employee_id   uuid REFERENCES employee(id) ON DELETE SET NULL, -- null = site-level
  location_code text NOT NULL,
  category      text NOT NULL, -- injury | near_miss | property | environmental
  severity      text NOT NULL, -- low | medium | high | lti
  description   text NOT NULL,
  occurred_on   date NOT NULL,
  status        text NOT NULL DEFAULT 'open', -- open | investigating | closed
  reported_by   uuid NOT NULL, -- app_user.id
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX hseq_incident_tenant_idx ON hseq_incident (tenant_id);

-- ── HSEQ: PPE issue / compliance ───────────────────────────────────────────
CREATE TABLE ppe_issue (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES employee(id) ON DELETE CASCADE,
  item        text NOT NULL, -- helmet | boots | hi_vis | gloves | respirator
  issued_on   date NOT NULL,
  expires_on  date,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ppe_issue_tenant_idx ON ppe_issue (tenant_id);

-- ── HSEQ: medical validity ─────────────────────────────────────────────────
CREATE TABLE medical_record (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES employee(id) ON DELETE CASCADE,
  type        text NOT NULL, -- osha | pre_employment | periodic
  valid_from  date NOT NULL,
  valid_to    date NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX medical_record_tenant_idx ON medical_record (tenant_id);

-- ── Training & competency ──────────────────────────────────────────────────
CREATE TABLE training_record (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    uuid NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
  employee_id  uuid NOT NULL REFERENCES employee(id) ON DELETE CASCADE,
  course       text NOT NULL,
  provider     text,
  status       text NOT NULL DEFAULT 'planned', -- planned | completed | expired
  completed_on date,
  expires_on   date,
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX training_record_tenant_idx ON training_record (tenant_id);

-- ── RLS ────────────────────────────────────────────────────────────────────
ALTER TABLE performance_review ENABLE ROW LEVEL SECURITY;
ALTER TABLE hseq_incident      ENABLE ROW LEVEL SECURITY;
ALTER TABLE ppe_issue          ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_record     ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_record    ENABLE ROW LEVEL SECURITY;

CREATE POLICY t_iso ON performance_review USING (tenant_id = app_current_tenant()) WITH CHECK (tenant_id = app_current_tenant());
CREATE POLICY t_iso ON hseq_incident      USING (tenant_id = app_current_tenant()) WITH CHECK (tenant_id = app_current_tenant());
CREATE POLICY t_iso ON ppe_issue          USING (tenant_id = app_current_tenant()) WITH CHECK (tenant_id = app_current_tenant());
CREATE POLICY t_iso ON medical_record     USING (tenant_id = app_current_tenant()) WITH CHECK (tenant_id = app_current_tenant());
CREATE POLICY t_iso ON training_record    USING (tenant_id = app_current_tenant()) WITH CHECK (tenant_id = app_current_tenant());

-- ── Grants ─────────────────────────────────────────────────────────────────
GRANT SELECT, INSERT, UPDATE, DELETE ON
  performance_review, hseq_incident, ppe_issue, medical_record, training_record
  TO hcmos_app;
