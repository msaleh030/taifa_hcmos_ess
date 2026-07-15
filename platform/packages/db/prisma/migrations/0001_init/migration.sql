-- HCMOS initial schema + per-tenant Row-Level Security + tamper-evident audit chain.
-- Applied by `prisma migrate deploy` as the owner/admin (DIRECT_DATABASE_URL).
-- The runtime app connects as the non-owner role `hcmos_app`, against which RLS
-- is enforced. Owners bypass RLS, so migrations and seeds run unfiltered.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ── Runtime application role ────────────────────────────────────────────────
-- Non-superuser, NOBYPASSRLS. Password is set out-of-band (see infra/DEPLOY.md);
-- created here only if absent so a fresh database is self-bootstrapping.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'hcmos_app') THEN
    CREATE ROLE hcmos_app LOGIN NOSUPERUSER NOBYPASSRLS PASSWORD 'change-me';
  END IF;
END$$;

-- ── Tenant scoping helper ───────────────────────────────────────────────────
-- Reads the per-transaction GUC the API sets with `SET LOCAL app.current_tenant`.
-- Returns NULL when unset (missing_ok = true), so every RLS policy denies by
-- default until a tenant is bound.
CREATE OR REPLACE FUNCTION app_current_tenant() RETURNS uuid
LANGUAGE sql STABLE AS $$
  SELECT NULLIF(current_setting('app.current_tenant', true), '')::uuid
$$;

-- ── Tables ──────────────────────────────────────────────────────────────────
CREATE TABLE tenant (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug       text NOT NULL UNIQUE,
  name       text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE app_user (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     uuid NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
  email         text NOT NULL,
  password_hash text NOT NULL,
  display_name  text NOT NULL,
  mfa_secret    text,
  mfa_enabled   boolean NOT NULL DEFAULT false,
  disabled      boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, email)
);
CREATE INDEX app_user_tenant_idx ON app_user (tenant_id);

CREATE TABLE user_role (
  user_id   uuid NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL,
  role_code text NOT NULL,
  PRIMARY KEY (user_id, role_code)
);
CREATE INDEX user_role_tenant_idx ON user_role (tenant_id);

CREATE TABLE refresh_token (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  tenant_id  uuid NOT NULL,
  token_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX refresh_token_user_idx ON refresh_token (user_id);
CREATE INDEX refresh_token_tenant_idx ON refresh_token (tenant_id);

CREATE TABLE department (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
  name      text NOT NULL,
  parent_id uuid REFERENCES department(id)
);
CREATE INDEX department_tenant_idx ON department (tenant_id);

CREATE TABLE employee (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     uuid NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
  employee_no   text NOT NULL,
  first_name    text NOT NULL,
  last_name     text NOT NULL,
  job_title     text NOT NULL,
  location_code text NOT NULL,
  department_id uuid REFERENCES department(id),
  contract_type text NOT NULL,
  status        text NOT NULL DEFAULT 'active',
  start_date    date NOT NULL,
  basic_salary  integer,
  bank_account  text,
  national_id   text,
  medical_notes text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, employee_no)
);
CREATE INDEX employee_tenant_idx ON employee (tenant_id);
CREATE INDEX employee_tenant_dept_idx ON employee (tenant_id, department_id);

CREATE TABLE payroll_run (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
  period      text NOT NULL,
  status      text NOT NULL DEFAULT 'draft',
  table_id    text NOT NULL,
  created_by  uuid NOT NULL,
  approved_by uuid,
  gross_total bigint NOT NULL DEFAULT 0,
  net_total   bigint NOT NULL DEFAULT 0,
  stat_total  bigint NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  approved_at timestamptz,
  UNIQUE (tenant_id, period),
  -- Segregation of duties: the approver may not be the creator.
  CONSTRAINT payroll_sod CHECK (approved_by IS NULL OR approved_by <> created_by)
);
CREATE INDEX payroll_run_tenant_idx ON payroll_run (tenant_id);

CREATE TABLE payslip (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       uuid NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
  run_id          uuid NOT NULL REFERENCES payroll_run(id) ON DELETE CASCADE,
  employee_id     uuid NOT NULL REFERENCES employee(id),
  gross           integer NOT NULL,
  nssf_employee   integer NOT NULL,
  paye            integer NOT NULL,
  net_pay         integer NOT NULL,
  employer_total  integer NOT NULL,
  statutory_total integer NOT NULL
);
CREATE INDEX payslip_tenant_idx ON payslip (tenant_id);
CREATE INDEX payslip_run_idx ON payslip (run_id);

CREATE TABLE audit_event (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      uuid NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
  seq            bigint NOT NULL,
  actor_user_id  uuid,
  action         text NOT NULL,
  entity         text NOT NULL,
  entity_id      text,
  data           jsonb,
  prev_hash      text NOT NULL,
  hash           text NOT NULL,
  created_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, seq)
);
CREATE INDEX audit_event_tenant_idx ON audit_event (tenant_id);

CREATE TABLE exact_connection (
  tenant_id     uuid PRIMARY KEY REFERENCES tenant(id) ON DELETE CASCADE,
  access_token  text,
  refresh_token text,
  expires_at    timestamptz,
  division      text,
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- ── Audit chain enforcement ─────────────────────────────────────────────────
-- BEFORE INSERT assigns the per-tenant sequence and links each row to the prior
-- row's hash. An advisory lock serialises concurrent inserts per tenant so the
-- chain cannot fork. The hash covers the linked prev_hash, so any retro-edit of
-- an earlier row (were UPDATE even permitted) breaks every subsequent hash.
CREATE OR REPLACE FUNCTION audit_event_chain() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  last_seq  bigint;
  last_hash text;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended(NEW.tenant_id::text, 0));

  SELECT seq, hash INTO last_seq, last_hash
  FROM audit_event
  WHERE tenant_id = NEW.tenant_id
  ORDER BY seq DESC
  LIMIT 1;

  NEW.seq       := COALESCE(last_seq, 0) + 1;
  NEW.prev_hash := COALESCE(last_hash, repeat('0', 64));
  NEW.hash := encode(
    digest(
      NEW.prev_hash
        || '|' || NEW.tenant_id::text
        || '|' || NEW.seq::text
        || '|' || COALESCE(NEW.actor_user_id::text, '')
        || '|' || NEW.action
        || '|' || NEW.entity
        || '|' || COALESCE(NEW.entity_id, '')
        || '|' || COALESCE(NEW.data::text, '')
        || '|' || NEW.created_at::text,
      'sha256'
    ),
    'hex'
  );
  RETURN NEW;
END$$;

CREATE TRIGGER audit_event_chain_trg
  BEFORE INSERT ON audit_event
  FOR EACH ROW EXECUTE FUNCTION audit_event_chain();

-- ── Row-Level Security ──────────────────────────────────────────────────────
ALTER TABLE tenant           ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_user         ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_role        ENABLE ROW LEVEL SECURITY;
ALTER TABLE refresh_token    ENABLE ROW LEVEL SECURITY;
ALTER TABLE department       ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee         ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_run      ENABLE ROW LEVEL SECURITY;
ALTER TABLE payslip          ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_event      ENABLE ROW LEVEL SECURITY;
ALTER TABLE exact_connection ENABLE ROW LEVEL SECURITY;

-- The tenant row is visible only to itself.
CREATE POLICY tenant_isolation ON tenant
  USING (id = app_current_tenant())
  WITH CHECK (id = app_current_tenant());

-- Every other table is scoped by tenant_id.
CREATE POLICY t_iso ON app_user         USING (tenant_id = app_current_tenant()) WITH CHECK (tenant_id = app_current_tenant());
CREATE POLICY t_iso ON user_role        USING (tenant_id = app_current_tenant()) WITH CHECK (tenant_id = app_current_tenant());
CREATE POLICY t_iso ON refresh_token    USING (tenant_id = app_current_tenant()) WITH CHECK (tenant_id = app_current_tenant());
CREATE POLICY t_iso ON department       USING (tenant_id = app_current_tenant()) WITH CHECK (tenant_id = app_current_tenant());
CREATE POLICY t_iso ON employee         USING (tenant_id = app_current_tenant()) WITH CHECK (tenant_id = app_current_tenant());
CREATE POLICY t_iso ON payroll_run      USING (tenant_id = app_current_tenant()) WITH CHECK (tenant_id = app_current_tenant());
CREATE POLICY t_iso ON payslip          USING (tenant_id = app_current_tenant()) WITH CHECK (tenant_id = app_current_tenant());
CREATE POLICY t_iso ON exact_connection USING (tenant_id = app_current_tenant()) WITH CHECK (tenant_id = app_current_tenant());

-- Audit: tenant-scoped read + insert, but never update or delete (append-only).
CREATE POLICY audit_select ON audit_event FOR SELECT USING (tenant_id = app_current_tenant());
CREATE POLICY audit_insert ON audit_event FOR INSERT WITH CHECK (tenant_id = app_current_tenant());

-- ── Login bootstrap ─────────────────────────────────────────────────────────
-- Before authentication no tenant is bound, so RLS would hide the tenant/user
-- rows the login needs. This SECURITY DEFINER function runs as the owner (RLS
-- bypassed) but is deliberately narrow: it matches only on tenant slug + email,
-- returns exactly one candidate, and never enumerates across tenants. Roles and
-- all subsequent data are still read tenant-scoped via app_current_tenant().
CREATE OR REPLACE FUNCTION auth_lookup(p_slug text, p_email text)
RETURNS TABLE (
  user_id       uuid,
  tenant_id     uuid,
  tenant_slug   text,
  email         text,
  password_hash text,
  display_name  text,
  mfa_secret    text,
  mfa_enabled   boolean,
  disabled      boolean
)
LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public
AS $$
  SELECT u.id, u.tenant_id, t.slug, u.email, u.password_hash,
         u.display_name, u.mfa_secret, u.mfa_enabled, u.disabled
  FROM app_user u
  JOIN tenant t ON t.id = u.tenant_id
  WHERE t.slug = p_slug AND u.email = p_email
$$;

-- ── Grants to the runtime role ──────────────────────────────────────────────
GRANT USAGE ON SCHEMA public TO hcmos_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON
  tenant, app_user, user_role, refresh_token, department, employee,
  payroll_run, payslip, exact_connection
  TO hcmos_app;
-- Audit is append-only for the app: SELECT + INSERT only, no UPDATE/DELETE.
GRANT SELECT, INSERT ON audit_event TO hcmos_app;
GRANT EXECUTE ON FUNCTION app_current_tenant() TO hcmos_app;
GRANT EXECUTE ON FUNCTION auth_lookup(text, text) TO hcmos_app;
