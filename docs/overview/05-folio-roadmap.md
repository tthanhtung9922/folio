# Folio — Lộ trình phát triển

> **Last updated:** 2026-04-04 · **Version:** 1.6
> **Triết lý:** Local-first. Build và dùng trên máy cá nhân trước, ổn định rồi mới lên VPS.

---

## Tổng quan

```
Đợt 1 — POC (local)   Landing + Tools. Chạy hoàn toàn trên máy local. Không VPS, không CI/CD.
Đợt 1 — Deploy        Khi POC đã ổn định: đưa lên VPS, setup CI/CD.
Đợt 2 — Backend       Nền móng API + Database. Blog + Auth. Vẫn dev local-first.
Đợt 3 — Showcase      Project portfolio.
Đợt 4 — Lab           Communication & learning.
Đợt 5 — Journal       Decision records.
```

**Nguyên tắc xuyên suốt:** Mọi đợt đều bắt đầu bằng dev local, chạy ổn rồi mới deploy lên VPS. VPS chỉ là đích đến cuối, không phải môi trường dev.

**Bắt đầu:** Q2/2026 (tháng 4)

---

## Đợt 1 — POC: Landing + Tools (local)

> **Mục tiêu:** Có landing page và tools chạy được trên máy local. Không backend, không VPS, không CI/CD.
> **Target:** 2–3 tuần

### 1A. Frontend setup ✅

- [x] Khởi tạo `web/` — Next.js 16 + TypeScript 5.x + Tailwind 4.x + shadcn/ui + Biome
- [x] `output: 'standalone'` trong `next.config.ts` — chuẩn bị cho Docker sau
- [x] Áp dụng Terracotta Mono design system từ `DESIGN.md`
- [x] UI polish — global dashed border-ink, canonical Tailwind classes, overline labels 11px/medium
- [x] Vitest setup

Chạy local bằng dev server thông thường:

```bash
cd web
pnpm dev          # http://localhost:3000
```

### 1B. Landing page ✅

- [x] Hero section — giới thiệu bản thân và Folio
- [x] Danh sách 5 sections (Showcase, Tools, Lab, Blog, Journal)
- [x] Links tới GitHub, LinkedIn, email
- [x] Responsive (mobile-first)
- [x] SEO cơ bản — metadata, Open Graph

### 1C. Tools (đang thực hiện)

Tất cả chạy **hoàn toàn client-side**, không gọi bất kỳ API nào:

- [x] **JWT Decoder · Encoder** — decode (read-only parts), encode (editable header/payload/secret, algorithm selector HS256/384/512, copy button), verify signature, expiry warning. Route: `/tools/jwt-decoder-encoder`
- [x] **Tools listing page** — `/tools` với 2-col grid, available/coming-soon status, category tags
- [x] **Data layer** — `src/data/home.json` + `src/data/tools.json`: tách content khỏi code, `enabled` flag để bật/tắt từng item
- [x] **Source control** — repo khởi tạo, push lên GitHub private
- [x] **JSON Formatter** — format / beautify, compare 2 JSONs, tree view. Route: `/tools/json-formatter`
- [x] **Text Compare** — line-by-line diff (inline + side-by-side modes), copy diff to clipboard. Route: `/tools/text-compare`
- [x] **Dark / Light theme** — Tailwind v4 CSS var cascade, `.dark` class toggle, persisted to localStorage, flash prevention script
- [x] **Vietnamese / English i18n** — `LocaleContext` + flat translation maps, language toggle in preferences panel, persisted to localStorage
- [x] **Base64 Codec** — encode/decode text và file. Route: `/tools/base64-codec`
- [ ] **Hash Generator** — MD5, SHA-1, SHA-256
- [ ] **URL Encoder** — encode/decode, parse query strings
- [ ] **Regex Tester** — live highlighting, match groups

### 1D. Kiểm tra với Docker local ✅

Trước khi lên VPS, chạy thử bản build production trên máy local để xác nhận Docker hoạt động đúng:

```bash
# Build image
docker build -t folio-web ./web

# Chạy container local
docker run -p 3000:3000 folio-web

# Mở http://localhost:3000 và kiểm tra
```

**Điểm dừng:** POC hoạt động đúng trên local — cả `npm run dev` lẫn Docker build đều OK.

**Kết quả:** `web/Dockerfile` multi-stage (deps → builder → runner, non-root user). Xác nhận `/`, `/tools`, `/tools/base64-codec` trả về HTTP 200 từ container.

---

## Đợt 1 — Deploy lên VPS

> **Điều kiện:** POC đã ổn định trên local. Không rush.
> **Target:** 1–2 ngày khi sẵn sàng
> **Trạng thái:** ⏸ Tạm hoãn — chưa mua tên miền, chưa thuê VPS. Chuyển sang Đợt 2.

- [x] Viết `web/Dockerfile` đầy đủ (multi-stage, standalone output)
- [x] Viết `infra/docker-compose.poc.yml` — chỉ một service `web` (+ `docker-compose.local.yml` để test local)
- [ ] Viết `infra/Caddyfile` — chỉ một domain `folio.dev`
- [ ] Setup VPS: cài Docker Engine + Caddy, trỏ DNS
- [ ] Deploy lần đầu thủ công:

```bash
# Trên VPS
docker compose -f docker-compose.poc.yml up -d

# Kiểm tra
curl https://folio.dev
```

- [ ] Xác nhận HTTPS tự động từ Let's Encrypt hoạt động
- [ ] Setup `.github/workflows/web.yml` — CI/CD tự động sau lần đầu đã ổn
- [ ] Setup GitHub Secrets: `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`

`infra/docker-compose.poc.yml`:
```yaml
services:
  web:
    image: ghcr.io/${GITHUB_REPOSITORY}/folio-web:latest
    container_name: folio-web
    restart: unless-stopped
    ports:
      - "127.0.0.1:3000:3000"
    environment:
      NODE_ENV: production
```

**Output:** `folio.dev` live với HTTPS, CI/CD tự động khi push `main`.

---

## Đợt 2 — Backend + Blog + Auth

> **Mục tiêu:** Xây nền móng API + database. Blog hoạt động.
> **Target:** Q2–Q3/2026 (6–8 tuần)
> **Dev workflow:** Local trước, ổn định rồi mới merge và deploy VPS.

### 2A. Backend foundation (2–3 tuần)

**Dev local với Docker Compose:**

```bash
# Khởi động db ở local
docker compose -f infra/docker-compose.dev.yml up -d db

# Chạy api với hot reload
cd api
dotnet watch run --project src/Folio.Api

# Chạy web (song song, terminal khác)
cd web
npm run dev
```

`infra/docker-compose.dev.yml`:
```yaml
services:
  db:
    image: postgres:17-alpine
    ports:
      - "5432:5432"          # expose ra localhost để dev tools (DBeaver, etc.) kết nối
    environment:
      POSTGRES_DB: folio_dev
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev
    volumes:
      - postgres_dev_data:/var/lib/postgresql/data

volumes:
  postgres_dev_data:
```

- [ ] Khởi tạo `api/` — `Folio.slnx` với 4 projects
- [ ] DDD + Clean Architecture skeleton
- [ ] EF Core 10 + PostgreSQL + migration đầu tiên
- [ ] Health check endpoint (`GET /health`)
- [ ] `api/Dockerfile` multi-stage
- [ ] Unit tests + Integration tests với Testcontainers (CI dùng real PostgreSQL)
- [ ] Khi ổn định: thêm `api` vào `infra/docker-compose.yml` production và update `Caddyfile`

### 2B. Auth (1–2 tuần)

- [ ] ASP.NET Identity + JWT Bearer + Refresh Token (HttpOnly cookie)
- [ ] `POST /auth/login`, `POST /auth/refresh`
- [ ] Login page trên Next.js
- [ ] Protected routes trong `(admin)/`

### 2C. Blog Engine (2–3 tuần)

- [ ] Domain: `Post` aggregate — `type`: `til` / `post` / `changelog`
- [ ] API: CRUD endpoints
- [ ] Admin UI: Markdown editor (Novel), preview, publish
- [ ] Public feed: timeline TIL + Post + Changelog
- [ ] `react-markdown` + Shiki syntax highlight
- [ ] Tag/category, sitemap, RSS, OG image (Satori)

**Output:** Backend + database chạy cạnh frontend. Blog hoạt động.

---

## Đợt 3 — Showcase

> **Target:** Q3–Q4/2026 (4–6 tuần)
> Dev local → ổn định → deploy VPS.

- [ ] Domain: `Project` aggregate
- [ ] API: CRUD projects
- [ ] Admin UI: form tạo/sửa project
- [ ] Public: project card list, filter theo tech stack và trạng thái
- [ ] Trang chi tiết: kiến trúc, bài học, liên kết Blog
- [ ] **Folio chính là project đầu tiên**

---

## Đợt 4 — Lab

> **Target:** Q1/2027 (6–8 tuần)

- [ ] Flashcard từ vựng IT + spaced repetition (SM-2)
- [ ] Nhật ký viết tiếng Anh hàng ngày
- [ ] AI grammar check — hoãn, xem xét lại khi có budget

---

## Đợt 5 — Journal

> **Target:** Q1–Q2/2027 (4–6 tuần)

- [ ] Domain: `DecisionRecord` aggregate
- [ ] Template: Context / Options / Decision / Outcome / Retrospective
- [ ] Public: timeline view, liên kết Showcase và Blog
- [ ] **Entry đầu tiên: tại sao chọn Next.js thay vì Blazor**

---

## Dev workflow — Local → VPS

Quy trình áp dụng cho mọi đợt:

```
1. Dev & test trên local
   pnpm dev / dotnet watch / docker compose -f docker-compose.dev.yml up

2. Chạy thử Docker build local
   docker build + docker run → xác nhận production build OK

3. Merge vào main
   GitHub Actions build image → push ghcr.io

4. Deploy lên VPS
   SSH → docker compose pull → docker compose up -d
```

Không bao giờ push thẳng lên VPS code chưa chạy được ở local.

---

## Nguyên tắc

1. **Local-first** — mọi thứ chạy được trên máy cá nhân trước
2. **VPS là đích đến, không phải môi trường dev** — không debug trực tiếp trên VPS
3. **Frontend-first** — landing + tools trước, backend đến sau
4. **Deploy thủ công lần đầu** — hiểu rõ từng bước trước khi tự động hoá
5. **CI/CD đến sau khi đã ổn định** — không setup CI/CD khi chưa chắc chắn flow
6. **Viết về quá trình** — mỗi đợt xong là có content cho Blog
