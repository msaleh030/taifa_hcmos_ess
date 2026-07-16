# HCMOS Platform

The production build of **HCMOS™ — Taifa Human Capital Management Operating
System**. This is the real product foundation; the HTML prototypes and design
spec at the repository root are the **design contract** it is built against, not
code that gets extended.

> Status: **foundation**. Every pillar below has a working, tested reference
> implementation with clearly marked seams (certified statutory rates, live Exact
> credentials, penetration testing) that must be completed before paying real
> people. See `packages/statutory` for the compliance disclaimer and
> `infra/DEPLOY.md` for the go-live security checklist.

## Architecture

pnpm monorepo, TypeScript throughout.

```
platform/
├─ apps/
│  ├─ api/         Fastify API — auth/MFA, RLS binding, employees, payroll, audit, Exact
│  └─ web/         Vite + React SPA — real component files, design tokens, router, i18n-ready
├─ packages/
│  ├─ shared/      Domain types, roles/permissions, Zod schemas, design tokens, password hashing
│  ├─ statutory/   Tanzania PAYE/NSSF/SDL/WCF engine — versioned, table-driven, unit-tested
│  └─ db/          Prisma schema + SQL migrations (RLS + audit-chain trigger) + seed
└─ infra/          nginx edge config + Hostinger VPS deploy runbook
```

### How the pillars map to the request

| Requested | Where it lives |
|---|---|
| Front-end stack + bundler + real component files | `apps/web` (Vite, React, TS, per-file components) |
| Backend + database | `apps/api` (Fastify) + `packages/db` (Postgres/Prisma) |
| Per-tenant row-level security | `packages/db/prisma/migrations/0001_init/migration.sql` — Postgres RLS keyed on `app.current_tenant`, bound per request by `withTenant()` |
| Authentication / MFA | `apps/api/src/routes/auth.ts`, `lib/jwt.ts`, `lib/mfa.ts` (JWT access/refresh rotation + TOTP) |
| Exact / payroll integration | `apps/api/src/integrations/exact` (adapter interface + live OAuth client + stub) |
| Statutory engine | `packages/statutory` (progressive PAYE bands, NSSF/SDL/WCF, versioned tables) |
| Tamper-evident audit store | DB `audit_event` table + `audit_event_chain()` trigger (per-tenant hash chain, append-only grants); verified by `lib/audit.ts` |
| Tests | `packages/statutory/test`, `apps/api/test`, plus CI DB integration |
| CI/CD | `.github/workflows/ci.yml` (Postgres service, migrate, seed, build) + Dockerfiles |

### Design-contract rules enforced server-side

- **Tenant isolation** — every tenant table has an RLS policy; the API can only
  read/write within the tenant bound by `withTenant()`. A missing/wrong tenant id
  yields zero rows, never another tenant's data.
- **Confidentiality "absent, not masked"** — salary/bank/national-id are omitted
  from API responses entirely unless the caller holds `employee:read:confidential`.
- **Segregation of duties** — a payroll run's approver must differ from its
  creator, enforced in the route **and** by a DB `CHECK` constraint.
- **Role-scoped access** — 13 roles (R01–R13) mirrored from the prototype, with
  an explicit least-privilege permission map.

## Local development

Prereqs: Node 20+, pnpm 10+, a local Postgres (or `docker compose up db`).

```bash
cd platform
pnpm install
cp .env.example .env                     # then edit DATABASE_URL / DIRECT_DATABASE_URL / JWT secrets

pnpm --filter @hcmos/db generate         # Prisma client
pnpm --filter @hcmos/db migrate:deploy   # tables + RLS + audit chain  (uses DIRECT_DATABASE_URL)
pnpm --filter @hcmos/db seed             # demo Taifa tenant

pnpm dev:api                             # http://localhost:4000
pnpm dev:web                             # http://localhost:5173
```

Demo login: tenant `taifa`, e.g. `payroll@taifamining.tz` / `Passw0rd!`
(see `packages/db/src/seed.ts` for all seeded roles).

## Test & typecheck

```bash
pnpm -r typecheck
pnpm -r test          # statutory + api unit tests
```

## Deploy

See [`infra/DEPLOY.md`](infra/DEPLOY.md) — Docker Compose on a Hostinger VPS with
nginx + Let's Encrypt for `taifamining.tz`.
