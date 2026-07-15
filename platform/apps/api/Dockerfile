# Build context is the `platform/` directory (the pnpm workspace root).
# ── Build stage ─────────────────────────────────────────────────────────────
FROM node:22-slim AS build
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
RUN corepack enable
WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml tsconfig.base.json ./
COPY packages ./packages
COPY apps/api ./apps/api

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @hcmos/db generate
RUN pnpm --filter @hcmos/shared build \
  && pnpm --filter @hcmos/statutory build \
  && pnpm --filter @hcmos/db build \
  && pnpm --filter @hcmos/api build

# Prune dev dependencies for a lean runtime.
RUN pnpm --filter @hcmos/api --prod deploy /out

# ── Runtime stage ───────────────────────────────────────────────────────────
FROM node:22-slim AS runtime
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /out /app
# Ship the generated Prisma client + migrations for `migrate deploy` at boot.
COPY --from=build /app/packages/db/generated /app/node_modules/@hcmos/db/generated
COPY --from=build /app/packages/db/prisma /app/prisma
COPY apps/api/docker-entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 4000
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["node", "dist/server.js"]
