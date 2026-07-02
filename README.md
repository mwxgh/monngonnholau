# Món Ngon Nhớ Lâu

Website bán hàng (bơ hạt, đồ ăn vặt handmade) — gồm storefront cho khách và trang quản trị cho admin/staff.

## Kiến trúc

Turborepo monorepo, quản lý bằng pnpm workspaces.

```
apps/
  api/    NestJS + Prisma (PostgreSQL) — REST API, admin, thanh toán (PayOS), upload (S3-compatible)
  web/    Next.js (App Router) + Tailwind CSS — storefront & trang admin
packages/
  ui/                 Component React dùng chung
  eslint-config/       Cấu hình ESLint dùng chung
  typescript-config/   Cấu hình tsconfig dùng chung
  nest-decorators/     Custom decorator cho NestJS (DTO validation, ...)
```

**API** dùng Prisma v7 với `@prisma/adapter-pg` (driver adapter, không cấu hình `url` trực tiếp trong `schema.prisma` — xem `prisma.config.ts`). Thanh toán online qua PayOS, COD qua đơn vị vận chuyển SPX (có tính năng xuất Excel đơn hàng theo đúng format mẫu của SPX). Ảnh/file tĩnh lưu trên storage tương thích S3 (MinIO/RustFS).

**Web** là ứng dụng Next.js 16 (App Router), Tailwind v4, dùng `@base-ui/react` cho các component tương tác (dialog, sheet, ...).

## Yêu cầu

- Node.js >= 18
- pnpm 9
- PostgreSQL
- Storage tương thích S3 (MinIO, RustFS, ...) cho upload ảnh/file

## Bắt đầu

```sh
pnpm install

# copy env mẫu và điền giá trị thật
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# đồng bộ schema vào DB (dev/staging — dùng db:migrate cho production)
pnpm --filter api db:push
pnpm --filter api db:generate

pnpm dev
```

- API mặc định chạy ở `http://localhost:4000`
- Web mặc định chạy ở `http://localhost:3000`

## Lệnh thường dùng

| Lệnh                          | Mô tả                                        |
| ----------------------------- | -------------------------------------------- |
| `pnpm dev`                    | Chạy song song api + web ở chế độ dev        |
| `pnpm build`                  | Build toàn bộ apps/packages                  |
| `pnpm lint`                   | ESLint toàn bộ monorepo                      |
| `pnpm check-types`            | Type-check toàn bộ monorepo (`tsc --noEmit`) |
| `pnpm format`                 | Format code bằng Prettier                    |
| `pnpm --filter api db:studio` | Mở Prisma Studio                             |
| `pnpm --filter api db:push`   | Đồng bộ schema Prisma vào DB (dev/staging)   |

## Git convention

Commit message theo [Conventional Commits](https://www.conventionalcommits.org/), được validate tự động bằng commitlint + Husky:

```
<type>(<scope tuỳ chọn>): <mô tả>
```

`type` hợp lệ: `feat`, `fix`, `chore`, `refactor`, `revert`, `docs`, `style`, `perf`, `test`, `ci`, `build`.

Ví dụ:

```
feat: thêm export excel đơn hàng
fix(orders): sửa lỗi tính tiền COD
```

Git hooks (qua Husky):

- `commit-msg` — validate message theo convention trên
- `pre-push` — chạy `lint` + `check-types` toàn bộ monorepo, chặn push nếu có lỗi

## CI/CD

GitHub Actions (`.github/workflows/deploy.yml`) khi push lên `master`:

1. **validate** — cài dependencies, generate Prisma client, chạy `lint` + `check-types`
2. **build-push** — build Docker image cho `api` và `web`, push lên GHCR
3. **deploy** — SSH vào VPS, `git pull` + `docker compose up -d` để triển khai bản mới

## Deploy thủ công

Xem `apps/api/Dockerfile`, `apps/web/Dockerfile` và `docker-compose.yml` ở VPS.
