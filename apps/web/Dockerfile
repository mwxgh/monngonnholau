FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# ── Prune ──────────────────────────────────────────────────────────────────────
FROM base AS pruner
WORKDIR /app
RUN npm install -g turbo
COPY . .
# Trims the monorepo down to just web + the workspace packages it actually depends on
RUN turbo prune web --docker

# ── Build ──────────────────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app
# Pruned manifests only → pnpm install gets its own cached layer
COPY --from=pruner /app/out/json/ ./
RUN pnpm install --frozen-lockfile
# Pruned source, copied after deps are cached, then build
COPY --from=pruner /app/out/full/ ./
ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_API_URL=https://api.monngonnholau.online
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_STORAGE_URL=https://media.monngonnholau.online/mnnl
ENV NEXT_PUBLIC_STORAGE_URL=$NEXT_PUBLIC_STORAGE_URL
ARG NEXT_PUBLIC_TAWK_PROPERTY_ID=6a19d3dda95f821c31805409
ENV NEXT_PUBLIC_TAWK_PROPERTY_ID=$NEXT_PUBLIC_TAWK_PROPERTY_ID
ARG NEXT_PUBLIC_TAWK_WIDGET_ID=1jpqe76l4
ENV NEXT_PUBLIC_TAWK_WIDGET_ID=$NEXT_PUBLIC_TAWK_WIDGET_ID
RUN pnpm --filter=web build

# ── Runner (Next.js standalone — no dev deps, minimal size) ────────────────────
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static     ./apps/web/.next/static
COPY --from=builder /app/apps/web/public           ./apps/web/public
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
CMD ["node", "apps/web/server.js"]
