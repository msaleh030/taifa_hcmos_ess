# Build context is the `platform/` directory (the pnpm workspace root).
# ── Build stage ─────────────────────────────────────────────────────────────
FROM node:22-slim AS build
RUN corepack enable
WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml tsconfig.base.json ./
COPY packages ./packages
COPY apps/web ./apps/web

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @hcmos/shared build
# API base is same-origin (/api) in production; nginx proxies it.
ENV VITE_API_URL=""
RUN pnpm --filter @hcmos/web build

# ── Runtime stage (nginx serves the SPA + proxies /api) ─────────────────────
FROM nginx:1.27-alpine AS runtime
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
