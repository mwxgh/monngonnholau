# Món Ngon Nhớ Lâu

E-commerce site (handmade nut butters, snacks) — a storefront for customers and an admin dashboard for admin/staff.

## Architecture

Turborepo monorepo, managed with pnpm workspaces.

```
apps/
  api/    NestJS + Prisma (PostgreSQL) — REST API, admin, payments (PayOS), upload (S3-compatible)
  web/    Next.js (App Router) + Tailwind CSS — storefront & admin pages
packages/
  ui/                 Shared React components
  eslint-config/       Shared ESLint config
  typescript-config/   Shared tsconfig
  nest-decorators/     Custom NestJS decorators (DTO validation, ...)
```

**API** uses Prisma v7 with `@prisma/adapter-pg` (driver adapter — no `url` configured directly in `schema.prisma`; see `prisma.config.ts`). Online payments via PayOS, COD via the SPX shipping carrier (with an Excel export feature matching SPX's required order format). Images/static files are stored on S3-compatible storage (MinIO/RustFS).

**Web** is a Next.js 16 app (App Router), Tailwind v4, using `@base-ui/react` for interactive components (dialog, sheet, ...).

## Requirements

- Node.js >= 18
- pnpm 9
- PostgreSQL
- S3-compatible storage (MinIO, RustFS, ...) for image/file uploads

## Getting started

```sh
pnpm install

# copy the example env files and fill in real values
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# sync the schema to the DB (dev/staging — use db:migrate for production)
pnpm --filter api db:push
pnpm --filter api db:generate

pnpm dev
```

- API runs by default at `http://localhost:4000`
- Web runs by default at `http://localhost:3000`

## Common commands

| Command                       | Description                                    |
| ----------------------------- | ---------------------------------------------- |
| `pnpm dev`                    | Run api + web in parallel in dev mode          |
| `pnpm build`                  | Build all apps/packages                        |
| `pnpm lint`                   | ESLint across the monorepo                     |
| `pnpm check-types`            | Type-check the whole monorepo (`tsc --noEmit`) |
| `pnpm format`                 | Format code with Prettier                      |
| `pnpm --filter api db:studio` | Open Prisma Studio                             |
| `pnpm --filter api db:push`   | Sync Prisma schema to the DB (dev/staging)     |

## Git convention

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/), auto-validated with commitlint + Husky:

```
<type>(<optional scope>): <description>
```

Valid `type` values: `feat`, `fix`, `chore`, `refactor`, `revert`, `docs`, `style`, `perf`, `test`, `ci`, `build`.

Examples:

```
feat: add order excel export
fix(orders): fix COD amount calculation
```

Git hooks (via Husky):

- `commit-msg` — validates the message against the convention above
- `pre-push` — runs `format` + `lint` + `check-types` across the whole monorepo, blocks the push on error

## CI/CD

GitHub Actions (`.github/workflows/deploy.yml`) on push to `master`:

1. **build-push** — builds Docker images for `api` and `web`, pushes to GHCR
2. **deploy** — SSHes into the VPS, `git pull` + `docker compose up -d` to roll out the new version

Lint/type-check only run in the `pre-push` hook (local); they are not repeated in CI to keep the pipeline fast.

## Manual deploy

See `apps/api/Dockerfile`, `apps/web/Dockerfile`, and `docker-compose.yml` on the VPS.
