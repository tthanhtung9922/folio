# Folio — Kiến trúc kỹ thuật

> **Last updated:** 2026-04-03 · **Version:** 1.2
> **Constraint:** Toàn bộ stack phải free & open source. Target deployment: personal VPS.

---

## Tổng quan

Folio là một **monorepo với hai workspaces tách biệt hoàn toàn**: backend API và frontend web. Hai phần giao tiếp qua HTTP/REST, deploy độc lập trên cùng một VPS thông qua Docker Compose, với Caddy làm reverse proxy tự động xử lý HTTPS.

```
folio/                            ← root monorepo
├── api/                          ← ASP.NET Core backend
│   ├── src/
│   │   ├── Folio.Api/            ← Presentation (Controllers, Middleware)
│   │   ├── Folio.Application/    ← Application (Commands, Queries, DTOs)
│   │   ├── Folio.Domain/         ← Domain (Entities, Value Objects, Events)
│   │   └── Folio.Infrastructure/ ← Infrastructure (EF Core, Repos, Services)
│   ├── tests/
│   │   ├── Folio.UnitTests/
│   │   └── Folio.IntegrationTests/
│   ├── Folio.slnx
│   └── Dockerfile
│
├── web/                          ← Next.js frontend
│   ├── src/
│   │   ├── app/                  ← App Router
│   │   │   ├── (public)/         ← showcase, tools, lab, blog, journal
│   │   │   └── (admin)/          ← content management
│   │   ├── components/
│   │   ├── lib/                  ← API client, utilities
│   │   └── styles/
│   ├── public/
│   ├── package.json
│   └── next.config.ts            ← output: 'standalone' bắt buộc
│
├── infra/                        ← Infrastructure config (tất cả ở đây)
│   ├── docker-compose.yml        ← Production
│   ├── docker-compose.dev.yml    ← Dev overrides
│   ├── Caddyfile                 ← Reverse proxy + HTTPS
│   └── postgres/
│       └── init.sql
│
├── .github/
│   └── workflows/
│       ├── api.yml               ← CI/CD cho backend
│       └── web.yml               ← CI/CD cho frontend
│
├── DESIGN.md
├── .gitignore
└── README.md
```

---

## Tech Stack Audit

> **Tiêu chí:** free to use + open source license. Không managed service, không vendor lock-in.

### Backend — `api/`

| Thành phần | Công nghệ | License |
|-----------|-----------|---------|
| Runtime | .NET 10 LTS | MIT ✅ |
| Web framework | ASP.NET Core | MIT ✅ |
| ORM | EF Core 10 | MIT ✅ |
| Database | **PostgreSQL 17** (self-hosted) | PostgreSQL OSS ✅ |
| CQRS | MediatR 14.x | Apache 2.0 ✅ |
| Validation | FluentValidation | Apache 2.0 ✅ |
| Formatter | CSharpier | MIT ✅ |
| Unit test | xUnit + FluentAssertions | Apache 2.0 ✅ |
| Integration test | Testcontainers | MIT ✅ |
| Auth | ASP.NET Identity + JWT | MIT ✅ |

### Frontend — `web/`

| Thành phần | Công nghệ | License |
|-----------|-----------|---------|
| Framework | Next.js 16 | MIT ✅ |
| Language | TypeScript 5.x | Apache 2.0 ✅ |
| Styling | Tailwind CSS 4.1 | MIT ✅ |
| UI components | shadcn/ui | MIT ✅ |
| Linting | Biome | MIT ✅ |
| Markdown editor | Novel | MIT ✅ |
| MD renderer | react-markdown + remark | MIT ✅ |
| Syntax highlight | Shiki | MIT ✅ |
| OG image gen | **Satori** | MPL 2.0 ✅ — thay thế `@vercel/og` |
| E2E test | Playwright | MIT ✅ |
| Unit test | Vitest + Testing Library | MIT ✅ |

### Infrastructure — VPS

| Thành phần | Công nghệ | License |
|-----------|-----------|---------|
| Container runtime | Docker Engine + Compose | Apache 2.0 ✅ |
| Reverse proxy | **Caddy** | Apache 2.0 ✅ |
| TLS certificate | Let's Encrypt (qua Caddy) | Free ✅ |
| Image registry | **GitHub Container Registry (ghcr.io)** | Free for public repo ✅ |
| CI/CD | GitHub Actions | Free for public repo ✅ |
| Monitoring | **Uptime Kuma** | MIT ✅ — self-hosted |
| VPS OS | Ubuntu 24.04 LTS | Free ✅ |

### Đã loại bỏ

| Bỏ | Lý do | Thay bằng |
|----|-------|-----------|
| Neon | Managed service, proprietary | PostgreSQL 17 trong Docker |
| Render | Managed hosting, proprietary | Docker Compose trên VPS |
| Vercel | Managed hosting, proprietary | Next.js standalone + Docker trên VPS |
| `@vercel/og` | Vercel-specific | Satori (MPL 2.0) |

### ⚠️ Flag — Không hoàn toàn free

| Thành phần | Vấn đề | Phương án |
|-----------|--------|-----------|
| **Anthropic API** | Commercial, tính phí theo token | Giai đoạn đầu bỏ qua Lab AI feature. Sau này xem xét **Ollama** (MIT) tự host model nhỏ trên VPS nếu RAM đủ (≥8GB), hoặc chấp nhận chi phí nhỏ khi Lab feature đủ chín. |

---

## Infrastructure trên VPS

### Topology

```
Internet
    │
    ▼
Caddy (port 80/443)              ← Reverse proxy + Auto-HTTPS
    ├── folio.dev        → folio-web:3000
    ├── api.folio.dev    → folio-api:8080
    └── status.folio.dev → folio-kuma:3001

Docker internal network
    ├── folio-web     (Next.js standalone)    ← exposed qua Caddy
    ├── folio-api     (ASP.NET Core)          ← exposed qua Caddy
    ├── folio-db      (PostgreSQL 17)         ← internal only, không expose ra ngoài
    └── folio-kuma    (Uptime Kuma)           ← exposed qua Caddy
```

### `infra/docker-compose.yml`

```yaml
services:
  db:
    image: postgres:17-alpine
    container_name: folio-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: folio
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./postgres/init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - internal

  api:
    image: ghcr.io/${GITHUB_REPOSITORY}/folio-api:latest
    container_name: folio-api
    restart: unless-stopped
    ports:
      - "127.0.0.1:5000:8080"      # chỉ bind localhost, Caddy proxy vào
    environment:
      ASPNETCORE_ENVIRONMENT: Production
      ConnectionStrings__Default: Host=db;Database=folio;Username=${DB_USER};Password=${DB_PASSWORD}
      Jwt__Secret: ${JWT_SECRET}
    depends_on:
      - db
    networks:
      - internal
      - external

  web:
    image: ghcr.io/${GITHUB_REPOSITORY}/folio-web:latest
    container_name: folio-web
    restart: unless-stopped
    ports:
      - "127.0.0.1:3000:3000"      # chỉ bind localhost
    environment:
      NEXT_PUBLIC_API_URL: https://api.folio.dev
      NODE_ENV: production
    networks:
      - external

  kuma:
    image: louislam/uptime-kuma:1
    container_name: folio-kuma
    restart: unless-stopped
    ports:
      - "127.0.0.1:3001:3001"
    volumes:
      - kuma_data:/app/data
    networks:
      - external

volumes:
  postgres_data:
  kuma_data:

networks:
  internal:
    internal: true      # folio-db không thể truy cập từ ngoài
  external:
```

### `infra/Caddyfile`

```caddyfile
folio.dev {
    reverse_proxy folio-web:3000
}

api.folio.dev {
    reverse_proxy folio-api:8080

    header {
        Access-Control-Allow-Origin  "https://folio.dev"
        Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
        Access-Control-Allow-Headers "Authorization, Content-Type"
    }
}

status.folio.dev {
    reverse_proxy folio-kuma:3001
}
```

Caddy tự động:
- Xin và gia hạn TLS certificate từ Let's Encrypt
- Redirect HTTP → HTTPS
- Không cần cấu hình gì thêm cho HTTPS

---

## Docker — Image Build

### `api/Dockerfile`

```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY . .
RUN dotnet restore Folio.slnx
RUN dotnet publish src/Folio.Api/Folio.Api.csproj \
    --configuration Release \
    --output /app/publish \
    --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "Folio.Api.dll"]
```

### `web/Dockerfile`

```dockerfile
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Next.js standalone — image nhỏ, không cần node_modules đầy đủ
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

`next.config.ts` bắt buộc có:
```ts
const config: NextConfig = {
  output: 'standalone',
}
```

---

## CI/CD — GitHub Actions → VPS

### Flow tổng quát

```
git push main
    │
    ├── api.yml  (trigger: paths: ['api/**'])
    │   ├── 1. dotnet test
    │   ├── 2. docker build folio-api
    │   ├── 3. docker push ghcr.io/.../folio-api:latest
    │   └── 4. SSH → docker compose pull api && docker compose up -d api
    │
    └── web.yml  (trigger: paths: ['web/**'])
        ├── 1. biome check + vitest
        ├── 2. docker build folio-web
        ├── 3. docker push ghcr.io/.../folio-web:latest
        └── 4. SSH → docker compose pull web && docker compose up -d web
```

### `.github/workflows/api.yml`

```yaml
name: API — CI/CD

on:
  push:
    branches: [main]
    paths: ['api/**']

env:
  IMAGE: ghcr.io/${{ github.repository }}/folio-api

jobs:
  test-and-deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '10.x'

      - name: Run tests
        run: dotnet test api/Folio.slnx --configuration Release

      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - uses: docker/build-push-action@v5
        with:
          context: ./api
          push: true
          tags: ${{ env.IMAGE }}:latest

      - name: Deploy to VPS
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd ~/folio/infra
            docker compose pull api
            docker compose up -d --no-deps api
```

### Secrets cần setup trong GitHub repo

```
VPS_HOST      — IP hoặc domain của VPS
VPS_USER      — SSH user (ví dụ: ubuntu)
VPS_SSH_KEY   — Private SSH key để login VPS
```

Database credentials và JWT secret đặt trong file `.env` trên VPS, không commit vào repo.

---

## Backend — DDD + Clean Architecture

```
Folio.Domain/
├── Common/              ← Entity, ValueObject, AggregateRoot, DomainEvent, Result
├── Showcase/            ← Project aggregate
├── Tools/               ← Tool aggregate
├── Blog/                ← Post, TilEntry, ChangelogEntry aggregates
└── Journal/             ← DecisionRecord aggregate

Folio.Application/
├── Common/              ← Behaviours: Logging, Validation, Transaction
├── Showcase/            ← Commands + Queries + DTOs
├── Tools/
├── Blog/
└── Journal/

Folio.Infrastructure/
├── Persistence/         ← FolioDbContext, EF Migrations, Repository impl
├── Identity/            ← ASP.NET Identity config
└── Services/            ← RSS feed, OG image (Satori via JS interop hoặc API), Email

Folio.Api/
├── Controllers/         ← REST endpoints, grouped by section
├── Middleware/          ← Global error handler, request logging
└── Program.cs
```

---

## Frontend — Route Structure

### Cấu trúc hiện tại (Đợt 1)

```
web/src/
├── app/
│   ├── icon.svg                ← Favicon (ink bg + terracotta dot)
│   ├── layout.tsx              ← Root layout: fonts, LayoutProvider, Navigation, CustomCursor
│   ├── globals.css             ← Tailwind v4 @theme inline + design tokens + animations
│   ├── page.tsx                ← Landing (client component, uses useLayout + home.json)
│   └── tools/
│       ├── page.tsx            ← Tools listing — 2-col grid (reads tools.json)
│       └── jwt-decoder-encoder/
│           └── page.tsx        ← JWT Decoder · Encoder (decode tab + encode tab)
├── components/
│   ├── Navigation.tsx          ← Sticky nav + // preferences panel
│   ├── CustomCursor.tsx        ← 10px terracotta dot, expands on hover
│   ├── GridBackground.tsx
│   ├── CodeHighlight.tsx       ← Shiki syntax highlighter (async)
│   └── ui/
│       ├── badge.tsx           ← Badge component (available/soon/default/verified/error)
│       └── button.tsx          ← shadcn/ui Button
├── context/
│   └── LayoutContext.tsx       ← isWide, isCustomCursor — persisted to localStorage
├── data/
│   ├── home.json               ← status, sections[], connect[] — edit here, not in code
│   └── tools.json              ← tools[] — enabled flag controls visibility
└── lib/
    └── utils.ts                ← cn() helper
```

### Cấu trúc kế hoạch (Đợt 2+)

```
web/src/app/
├── layout.tsx
├── page.tsx
├── (public)/
│   ├── showcase/
│   │   ├── page.tsx            ← Project list
│   │   └── [slug]/page.tsx     ← Project detail
│   ├── tools/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx     ← Dynamic tool routes
│   ├── lab/page.tsx
│   ├── blog/
│   │   ├── page.tsx            ← TIL + Post + Changelog feed
│   │   └── [slug]/page.tsx
│   └── journal/
│       ├── page.tsx
│       └── [slug]/page.tsx
└── (admin)/
    ├── layout.tsx              ← Auth guard
    └── dashboard/...           ← Content management UI
```
