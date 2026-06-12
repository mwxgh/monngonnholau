FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# ── Build ──────────────────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app
# Copy manifests only → pnpm install gets its own cached layer
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/ ./packages/
COPY apps/api/package.json ./apps/api/package.json
RUN pnpm install --frozen-lockfile
# Copy source after deps are cached, then build
COPY apps/api/ ./apps/api/
RUN DATABASE_URL=postgres://x:x@localhost:5432/x pnpm --filter=api exec prisma generate
RUN pnpm --filter=api build

# ── Runner ─────────────────────────────────────────────────────────────────────
FROM base AS runner
WORKDIR /app
# Only the files pnpm deploy actually needs
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/ ./packages/
COPY apps/api/package.json    ./apps/api/package.json
COPY apps/api/prisma/         ./apps/api/prisma/
COPY apps/api/prisma.config.ts ./apps/api/prisma.config.ts

ARG DATABASE_URL=postgres://x:x@localhost:5432/x
ENV DATABASE_URL=$DATABASE_URL
RUN pnpm --filter=api deploy --prod /deploy \
    && cp -r apps/api/prisma /deploy/prisma \
    && cp apps/api/prisma.config.ts /deploy/prisma.config.ts \
    && cd /deploy && node_modules/.bin/prisma generate
ENV DATABASE_URL=

COPY --from=builder /app/apps/api/dist /deploy/dist
COPY apps/api/entrypoint.sh /deploy/entrypoint.sh
RUN chmod +x /deploy/entrypoint.sh

WORKDIR /deploy
EXPOSE 3001
ENTRYPOINT ["/deploy/entrypoint.sh"]
