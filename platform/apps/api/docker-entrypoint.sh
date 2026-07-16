#!/bin/sh
set -e

# Apply pending migrations (RLS + audit chain) as the admin/owner role before
# the API starts serving. Requires DIRECT_DATABASE_URL to be set.
if [ -n "$DIRECT_DATABASE_URL" ]; then
  echo "Applying database migrations…"
  npx --yes prisma migrate deploy --schema=/app/prisma/schema.prisma || {
    echo "migrate deploy failed" >&2
    exit 1
  }
else
  echo "DIRECT_DATABASE_URL not set — skipping migrations (assuming already applied)."
fi

exec "$@"
