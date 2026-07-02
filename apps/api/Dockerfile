FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# ── Prune ──────────────────────────────────────────────────────────────────────
FROM base AS pruner
WORKDIR /app
RUN npm install -g turbo
COPY . .
# Trims the monorepo down to just api + the workspace packages it actually depends on
RUN turbo prune api --docker

# ── Build ──────────────────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app
# Pruned manifests only → pnpm install gets its own cached layer
COPY --from=pruner /app/out/json/ ./
RUN pnpm install --frozen-lockfile
# workspace deps ship as compiled dist/ (gitignored + dockerignored), build before api
COPY --from=pruner /app/out/full/ ./
RUN pnpm --filter=@repo/nest-decorators build
RUN DATABASE_URL=postgres://x:x@localhost:5432/x pnpm --filter=api exec prisma generate
RUN pnpm --filter=api build

# ── Runner ─────────────────────────────────────────────────────────────────────
FROM base AS runner
WORKDIR /app
# Only the files pnpm deploy actually needs
COPY --from=pruner /app/out/json/ ./
COPY --from=builder /app/packages/nest-decorators/dist ./packages/nest-decorators/dist
COPY --from=pruner /app/out/full/apps/api/prisma/         ./apps/api/prisma/
COPY --from=pruner /app/out/full/apps/api/prisma.config.ts ./apps/api/prisma.config.ts

ARG DATABASE_URL=postgres://x:x@localhost:5432/x
ENV DATABASE_URL=$DATABASE_URL
RUN pnpm --filter=api deploy --prod /deploy \
    && cp -r apps/api/prisma /deploy/prisma \
    && cp apps/api/prisma.config.ts /deploy/prisma.config.ts \
    && cd /deploy && node_modules/.bin/prisma generate
ENV DATABASE_URL=

COPY --from=builder /app/apps/api/dist /deploy/dist
COPY --from=pruner /app/out/full/apps/api/entrypoint.sh /deploy/entrypoint.sh
RUN chmod +x /deploy/entrypoint.sh

WORKDIR /deploy
EXPOSE 3001
ENTRYPOINT ["/deploy/entrypoint.sh"]
