# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

```
folio/
├── web/        # Next.js application (primary codebase)
└── docs/       # Design documentation (DESIGN.md, overview/)
```

All development work happens in `web/`.

## Hard Rules

### Backend code — TUYỆT ĐỐI KHÔNG TỰ CODE

Claude **KHÔNG ĐƯỢC** tự viết, scaffold, hoặc generate bất kỳ backend code nào (C#, ASP.NET, EF Core, migration, Dockerfile cho `api/`, v.v.).

Với mọi việc liên quan đến backend (`api/`, database, auth, v.v.):

- **Chỉ được hướng dẫn** — giải thích approach, đưa ra ví dụ tham khảo, chỉ ra bước cần làm
- **Không được tạo file**, không được edit file trong `api/`
- User sẽ tự viết toàn bộ backend code

### Tiêu chuẩn hướng dẫn backend

Hướng dẫn phải đủ chi tiết để một junior developer có thể làm theo mà không cần hỏi thêm. Cụ thể:

- **CLI:** Ghi đầy đủ lệnh, chạy từ thư mục nào, output kỳ vọng trông như thế nào
- **IDE (Visual Studio 2026):** Mô tả thao tác chuột — mở menu nào, click vào đâu, dialog nào hiện ra, điền gì vào field nào
- **PgAdmin:** Mô tả từng bước trong UI — expand tree nào, right-click object nào, chạy query ở đâu
- **Docker Desktop:** Chỉ rõ tab nào (Containers / Images / Volumes), nút nào cần bấm, trạng thái cần kiểm tra
- **Terminal (Windows Terminal / PowerShell):** Ghi rõ chạy ở đâu (thư mục gốc repo, `api/`, v.v.), dùng shell nào nếu quan trọng
- **Và một số tool khác nếu có**

Ví dụ đúng chuẩn:

> "Trong Visual Studio, click chuột phải vào project `Folio.Api` trong Solution Explorer → chọn **Add > New Item** → tìm **Class** → đặt tên `AppDbContext.cs` → click **Add**."

Ví dụ không đạt:

> "Tạo file `AppDbContext.cs` trong project."

### Bắt buộc đọc context trước khi hướng dẫn backend

Trước khi viết hoặc cập nhật bất kỳ hướng dẫn backend nào, Claude **PHẢI** đọc:

1. **Toàn bộ docs hướng dẫn backend hiện có** trong `docs/backend/` — để biết đã hướng dẫn đến đâu, tránh mâu thuẫn hoặc lặp lại
2. **Source code backend hiện tại** trong `api/` — đọc cấu trúc thư mục, xem những file nào đã tồn tại, packages nào đã cài, để hướng dẫn đúng với trạng thái thực tế của project

Chỉ sau khi nắm đủ context mới được bắt đầu viết hướng dẫn mới.

### Bắt buộc research web trước khi hướng dẫn backend

Trước khi viết hoặc cập nhật bất kỳ hướng dẫn backend nào, Claude **PHẢI** dùng `WebSearch` để tìm thông tin mới nhất. Không được dựa vào training data vì .NET / EF Core / ASP.NET Core thay đổi nhanh và có nhiều breaking changes giữa các phiên bản.

Checklist bắt buộc trước khi viết hướng dẫn:

- **CLI commands:** Search `dotnet new <template> .NET 10 options 2026` — flags hay thay đổi giữa các version (ví dụ: `--use-controllers`, `--format sln` vs `.slnx`)
- **NuGet packages:** Search tên package + `latest version 2026` — version number thay đổi, API có thể khác
- **Breaking changes:** Search `<technology> breaking changes .NET 10` — đặc biệt quan trọng khi upgrade major version
- **Default behaviors:** Search `<command> default .NET 10` — defaults hay bị đảo ngược giữa versions (ví dụ: `dotnet new sln` mặc định `.slnx` từ .NET 10)

Sau khi research xong mới được viết hướng dẫn. Nếu tìm thấy thông tin mâu thuẫn giữa các nguồn, ưu tiên: **learn.microsoft.com** > **devblogs.microsoft.com** > các nguồn khác.

Frontend (`web/`) hoạt động bình thường — không bị ảnh hưởng bởi rule này.

## Commands (run from `web/`)

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build
npm run lint     # Biome check (lint + format check)
npm run format   # Biome format --write (auto-fix formatting)
npm run test     # Vitest in watch mode
npm run test:run # Vitest single run (CI)
```

Tests live in `web/src/test/`. Config: [web/vitest.config.ts](web/vitest.config.ts).

## Next.js Version Warning

This project uses Next.js 16.2.2 — **breaking changes exist from prior versions**. Before writing Next.js-specific code, read the relevant guide in `web/node_modules/next/dist/docs/`. Do not assume App Router APIs match your training data.

## Key Technical Choices

- **Linter/Formatter:** Biome (not ESLint/Prettier). Config at [web/biome.json](web/biome.json). Indentation: 2 spaces.
- **Styling:** Tailwind CSS v4 with `@theme inline` in [web/src/app/globals.css](web/src/app/globals.css). No `tailwind.config.ts` file — all config is in CSS.
- **React Compiler:** Enabled (`reactCompiler: true` in next.config.ts). This affects memoization behavior.
- **Output:** Standalone (Docker-ready) — `output: 'standalone'` in next.config.ts.
- **Docker:** [web/Dockerfile](web/Dockerfile) — 3-stage multi-stage build (deps → builder → runner). Runner uses non-root `nextjs` user. Build: `docker build -t folio-web ./web`. Run: `docker run -p 3000:3000 folio-web`.

## Architecture

### Path aliases

`@/` maps to `web/src/`.

### App structure (`web/src/`)

- `app/` — Next.js App Router pages. Tools live at `app/tools/<tool-name>/page.tsx`.
- `app/icon.svg` — Custom favicon (replaces default Next.js favicon). SVG with ink background + terracotta dot.
- `components/` — Shared UI components. `components/ui/` holds shadcn primitives.
- `components/ui/badge.tsx` — `Badge` component with variants: `available`, `soon`, `default`, `verified`, `error`. Use for all status labels across the app.
- `components/CodeHighlight.tsx` — Shiki-powered syntax highlighter. Wraps `codeToHtml` with `github-light-default` / `github-dark-default` theme (auto-switches with dark mode). Use this for any code/token output inside tools.
- `components/GridBackground.tsx` — Canvas-based animated tile background (z-[-1], pointer-events-none). Already rendered in `RootLayout`; do not add another instance. Reads `isAnimated` from `LayoutContext`.
- `context/LayoutContext.tsx` — Global layout state (wide, cursor, animation, dark mode), persisted to localStorage.
- `context/LocaleContext.tsx` — Locale state (`"vi"` / `"en"`), `t(key)` translation function, persisted to `localStorage("folio-locale")`. Wrap consumer components with `useLocale()`.
- `i18n/vi.ts` / `i18n/en.ts` — Flat key-value translation maps. `vi.ts` exports `TranslationKey` type; `en.ts` implements `Record<TranslationKey, string>`. Add new strings to both files.
- `data/` — JSON content files. All hardcoded page data lives here, not in components.
  - `data/home.json` — `status`, `sections[]` (with `en`, `tags`, `status` fields), `connect[]` for the landing page.
  - `data/tools.json` — `tools[]` for the tools directory.
  - Each item has an `enabled` boolean — set `false` to hide without deleting.
- `lib/utils.ts` — `cn()` helper (clsx + tailwind-merge).

### Language

The site is bilingual (Vietnamese / English). Default locale is Vietnamese. A language toggle in the preferences panel switches to English and persists to `localStorage("folio-locale")`.

- All UI strings are defined in `i18n/vi.ts` and `i18n/en.ts` as flat key-value maps.
- Use `const { locale, t } = useLocale()` to access translations in any `"use client"` component.
- Data files (`home.json`, `tools.json`) store both `desc` (Vietnamese) and `desc_en` (English) fields.
- The HTML `lang` attribute is managed by `LocaleContext` (defaults to `"vi"` on the server, updated client-side).
- Both fonts include Vietnamese subsets.

### Layout system

`LayoutContext` exposes:

- `maxWidthClass` / `transitionClass` — container width + animation class, consumed by every page and Navigation
- `isWide` / `toggleWide` — switches max-width between `1080px` (standard) and `1600px` (wide)
- `isCustomCursor` / `toggleCustomCursor` — toggles the custom cursor on/off
- `isAnimated` / `toggleAnimated` — toggles the canvas background animation on/off
- `isDarkMode` / `toggleDarkMode` — toggles dark mode; adds/removes `.dark` class on `document.documentElement`; persisted to `localStorage("folio-dark-mode")`

Pages must wrap content with:

```tsx
const { maxWidthClass, transitionClass } = useLayout();
<section className={`${maxWidthClass} ${transitionClass} mx-auto`}>
```

All four toggles are persisted to localStorage and survive page refresh.

### Navigation

The `//` button (top-right) opens a `// preferences` panel (`top-[calc(100%+22px)]`) with:

- **layout** — standard / wide toggle
- **cursor** — custom / default toggle
- **background** — live / static toggle
- **theme** — light / dark toggle
- **language** — vi / en toggle

All interactive elements (`<button>`, `<Link>`) must have `cursor-pointer` class so the system pointer shows correctly when custom cursor is off.

### Custom cursor

`CustomCursor` component renders a 10px terracotta circle that expands (×2.8, opacity 0.25) when hovering clickable elements. The system cursor is hidden via `.custom-cursor-active * { cursor: none !important }` on `<html>`. This class is toggled by `LayoutContext`.

When custom cursor is disabled, `cursor-pointer` on interactive elements restores the default browser pointer.

### Background

`GridBackground` reads tile and glow colors from CSS custom properties (`--folio-parchment`, `--folio-terracotta`, `--folio-warm-canvas`) at effect initialization — so colors automatically adapt to dark mode. `isDarkMode` is included in the `useEffect` dependency array to trigger a re-read when the theme changes. Renders 88px tiles with 1.5px grout gaps; a terracotta radial glow shows through the gaps on cursor move. Controlled by `isAnimated` from `LayoutContext`; static mode draws the tile grid without animation.

### Scrollbar

Custom styled in `globals.css`: 6px width, `ghost-ink/50` thumb, darkens on hover. `::-webkit-scrollbar-*` pseudo-elements also set `cursor: none` when custom cursor is active.

### Sections

| Route                        | Status  | Notes                                                  |
| ---------------------------- | ------- | ------------------------------------------------------ |
| `/`                          | Done    | Landing page                                           |
| `/tools`                     | Done    | Tool directory — 2-col grid                            |
| `/tools/jwt-decoder-encoder` | Done    | JWT decode / encode / verify — tab UI, HS256/384/512   |
| `/tools/json-formatter`      | Done    | Format/beautify, compare 2 JSONs, tree view            |
| `/tools/text-compare`        | Done    | Line-by-line text diff — inline and side-by-side modes |
| `/tools/base64-codec`        | Done    | Encode/decode Base64 — text and binary file support    |
| `/showcase`                  | Planned | —                                                      |
| `/lab`                       | Planned | —                                                      |
| `/blog`                      | Planned | —                                                      |
| `/journal`                   | Planned | —                                                      |

## Design System (Terracotta Mono)

Full spec in `docs/DESIGN.md`. Critical rules:

**Colors** (Tailwind tokens in `globals.css`):

Light mode (default):

- `parchment` (#FBF8F4) — primary bg
- `ink` (#2C2420) — primary text, structural borders
- `faded-ink` (#6B5A4E) — secondary/supporting text
- `ghost-ink` (#9A8878) — metadata, timestamps, muted labels
- `terracotta` (#C4622D) — **the only accent** (hover, overline, active state)
- `terracotta-pale` (#F2E0D4) — accent surfaces
- `parchment-border` (#E4D8CC) — content dividers
- `warm-canvas` (#F5EDE0) — secondary surfaces, hover backgrounds

Dark mode (`.dark` class on `<html>`):

- `parchment` → #1A1614, `warm-canvas` → #241F1B, `ink` → #EBE5DE
- `faded-ink` → #A89888, `ghost-ink` → #7A6A5A
- `terracotta` → #D4723D, `terracotta-pale` → #3A2820, `parchment-border` → #3A3028

All Tailwind utilities auto-switch because `@theme inline` maps tokens to `var(--folio-*)` and the `.dark` class overrides those vars.

**Typography:**

- `font-display` → Playfair Display (h1–h6, display text). Italic variant used for emphasis/contrast.
- `font-mono` → Montserrat (body, nav, labels, metadata). Default body is `font-mono font-light`.
- All nav items, labels, overlines: **lowercase**
- Overline convention: `{"// section-name"}` prefix, `text-[11px] font-medium tracking-[0.15em] text-terracotta lowercase`
- `//` is a JSX text pattern — always wrap in `{"// ..."}` to avoid Biome's `noCommentText` lint error

**Font weight note:** Body default is `font-light` (300). Any descriptive/body text that needs to be clearly readable must explicitly set `font-normal` (400). `font-light` is appropriate only for labels, nav, and metadata.

**Borders:**

- Structural: `border-2 border-ink` — nav bottom, major section breaks. **Globally renders as dashed** via `.border-ink` rule in `globals.css` (`border-style: dashed; border-color: rgb(44 36 32 / 0.28)`).
- Section list dividers: `border-t border-dashed border-ghost-ink/40` — between list items
- Content: `border-t-[0.5px] border-parchment-border` — fine dividers inside components

**Radius:** Max `rounded-xs` (2px). No pill shapes.

**Animations:**

- Page entrance: `.animate-fade-up` class (defined in `globals.css`) — `opacity 0→1` + `translateY 20px→0`, `0.7s cubic-bezier(0.16,1,0.3,1)`
- Stagger with inline `style={{ animationDelay: "Xms" }}` (0ms, 80ms, 160ms, 200ms…)
- Layout transition: `transitionClass` from `LayoutContext` — `duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)]`
- Hover: `0.15s` color transitions only — no scale transforms

**Hover pattern (list/card items):**

```tsx
className = "group ... hover:bg-warm-canvas/40 transition-colors duration-200";
// title inside:
className = "group-hover:text-terracotta transition-colors duration-200";
// arrow inside:
className =
  "opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200";
```

## Adding a New Tool

Each tool uses a **server wrapper + client component** pattern so metadata can be exported from a Server Component:

1. Create `web/src/app/tools/<tool-name>/_client.tsx` — the full `"use client"` component with all logic.
2. Create `web/src/app/tools/<tool-name>/page.tsx` — a server component that exports `metadata` and renders `<ToolClient />`.
3. Add an entry to `web/src/data/tools.json` with `available: true, enabled: true, href: "/tools/<tool-name>"`.
4. Add i18n strings to both `web/src/i18n/vi.ts` and `web/src/i18n/en.ts`.
5. Keep all logic client-side in `_client.tsx` — no server calls from tools.

### `page.tsx` (server wrapper)

```tsx
import type { Metadata } from "next";
import ToolNameClient from "./_client";

export const metadata: Metadata = {
  title: "Tool Name",
  description: "Tool description for SEO.",
  openGraph: {
    title: "Tool Name · Folio",
    url: "https://folio.dev/tools/tool-name",
  },
};

export default function ToolNamePage() {
  return <ToolNameClient />;
}
```

### `_client.tsx` header pattern

```tsx
"use client";
// ... imports

export default function ToolNameClient() {
  const { maxWidthClass, transitionClass } = useLayout();
  const { t } = useLocale();

  return (
    <main
      className={`${maxWidthClass} ${transitionClass} mx-auto py-12 md:py-16`}
    >
      <div className="mb-10 border-b-2 border-ink pb-8">
        <div className="text-terracotta text-[11px] font-medium tracking-[0.15em] lowercase mb-4">
          {"// tools · tool-name"}
        </div>
        <h1 className="text-[44px] font-display leading-tight mb-4">
          Tool Name
        </h1>
        <p className="text-[15px] text-ink font-normal italic border-l-2 border-terracotta pl-4 max-w-xl">
          {t("toolName.description")}
        </p>
      </div>
      {/* tool content */}
    </main>
  );
}
```

Reference: [web/src/app/tools/base64-codec/](web/src/app/tools/base64-codec/)

## Claude Code Skills — Auto-Trigger Rules

**Invoke skills automatically** when the user's prompt matches. Do not ask the user to run them manually.

### Custom skills (this project)

| Trigger                                                      | Skill           |
| ------------------------------------------------------------ | --------------- |
| Tạo / scaffold / thêm tool mới                               | `/new-tool`     |
| Review / audit / kiểm tra design của component               | `/design-check` |
| Changelog / release notes / tổng kết thay đổi / what changed | `/changelog`    |
| Sẵn sàng deploy / kiểm tra trước deploy / pre-deployment     | `/deploy-check` |

### Plugin skills (installed)

| Trigger                                                                                               | Skill                                             |
| ----------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| Hỏi về docs / API / cách dùng library (React, Next.js, Tailwind, Shiki, jose, shadcn, Biome, lucide…) | `context7` — fetch live docs trước khi trả lời    |
| Tạo UI component / page / interface mới với design quality cao                                        | `frontend-design:frontend-design`                 |
| Simplify / dọn / refactor code vừa viết                                                               | `simplify`                                        |
| Review PR / code review pull request                                                                  | `code-review:code-review`                         |
| Tạo / sửa / cải thiện skill                                                                           | `skill-creator:skill-creator`                     |
| Setup Claude Code automations / recommend hooks, skills, MCP                                          | `claude-code-setup:claude-automation-recommender` |
| Test UI trên browser / chụp screenshot / kiểm tra render                                              | `playwright`                                      |
| Chạy task lặp lại theo interval / recurring                                                           | `loop`                                            |
| Schedule task / cron / chạy định kỳ                                                                   | `schedule`                                        |
| Cấu hình Claude Code settings / thêm hook / sửa settings.json                                         | `update-config`                                   |
| Đổi phím tắt / keyboard shortcut                                                                      | `keybindings-help`                                |
| Build app dùng Claude API / Anthropic SDK                                                             | `claude-api`                                      |

### Priority rule

When multiple skills could apply, prefer the **most specific** one. Example: user asks to create a new tool page → `/new-tool` (not `frontend-design`). User asks to build a generic UI component not in the tools pattern → `frontend-design`.
