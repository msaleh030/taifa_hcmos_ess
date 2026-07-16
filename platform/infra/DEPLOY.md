# Deploying HCMOS to a Hostinger VPS (taifamining.tz)

This is the production runbook. It assumes an Ubuntu 22.04+ VPS with a public IP,
and DNS for `taifamining.tz` (and `www`) pointing at it.

## 1. Point DNS

In Hostinger's DNS zone for `taifamining.tz`:

| Type | Name | Value |
|------|------|-------|
| A    | `@`  | your VPS IPv4 |
| A    | `www`| your VPS IPv4 |
| AAAA | `@`  | your VPS IPv6 (optional) |

## 2. Prepare the VPS

```bash
sudo apt update && sudo apt install -y docker.io docker-compose-plugin nginx certbot python3-certbot-nginx
sudo usermod -aG docker "$USER" && newgrp docker
git clone https://github.com/msaleh030/taifa_hcmos_ess.git
cd taifa_hcmos_ess/platform
```

## 3. Configure secrets

```bash
cp .env.example .env
```

Edit `.env` and set, at minimum:

- `POSTGRES_PASSWORD` — the superuser/owner password.
- `DIRECT_DATABASE_URL` — owner role, used for migrations/seed, e.g.
  `postgresql://postgres:<POSTGRES_PASSWORD>@db:5432/hcmos?schema=public`
- `DATABASE_URL` — the **runtime** role `hcmos_app` (RLS is enforced against it):
  `postgresql://hcmos_app:<APP_PASSWORD>@db:5432/hcmos?schema=public`
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` — `openssl rand -base64 48` each.
- `WEB_ORIGIN=https://taifamining.tz`

> The migration creates the `hcmos_app` role with a placeholder password. Set a
> real one after the first migrate:
> `ALTER ROLE hcmos_app PASSWORD '<APP_PASSWORD>';` (must match `DATABASE_URL`).

Exact Online (optional — leave blank to run the integration in stub mode):
`EXACT_CLIENT_ID`, `EXACT_CLIENT_SECRET`, `EXACT_REDIRECT_URI`, `EXACT_DIVISION`.

## 4. Bring up the stack

```bash
docker compose up -d --build
```

- `db` starts and becomes healthy.
- `api` runs `prisma migrate deploy` at boot (creates tables, RLS policies, the
  audit-chain trigger, `hcmos_app`, and `auth_lookup`), then serves on `:4000`.
- `web` (nginx) serves the SPA and proxies `/api`, published on `127.0.0.1:8080`.

Seed the demo tenant (optional):

```bash
docker compose exec api npx prisma db seed --schema=/app/prisma/schema.prisma \
  || docker compose run --rm api node --import tsx packages/db/src/seed.ts
```

## 5. TLS at the edge

```bash
sudo cp infra/nginx/taifamining.tz.conf /etc/nginx/sites-available/taifamining.tz
sudo ln -s /etc/nginx/sites-available/taifamining.tz /etc/nginx/sites-enabled/
sudo mkdir -p /var/www/certbot
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d taifamining.tz -d www.taifamining.tz
```

certbot installs the certificate and enables auto-renewal (`certbot.timer`).
Visit <https://taifamining.tz>.

## 6. Updates

```bash
git pull
docker compose up -d --build   # migrations re-run idempotently at API boot
```

## Security checklist before go-live

- [ ] `hcmos_app` role has a strong password and is **NOSUPERUSER NOBYPASSRLS**
      (the migration creates it that way — verify with `\du` in psql).
- [ ] The Postgres port is **not** published to the host (compose only `expose`s it).
- [ ] Real, unique `JWT_*` secrets; rotate on staff changes.
- [ ] The statutory table in `packages/statutory` has been reconciled against the
      current TRA/NSSF/SDL/WCF schedules and signed off (see the disclaimer there).
- [ ] Enforce MFA enrollment for privileged roles (HR head, Payroll, Finance, IT).
- [ ] Off-VPS, encrypted backups of the `pgdata` volume (`pg_dump` on a schedule).
- [ ] Review CORS `WEB_ORIGIN` — only the production origin(s).
```
