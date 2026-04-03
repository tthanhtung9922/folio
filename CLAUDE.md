# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

```
folio/
├── web/        # Next.js application (primary codebase)
└── docs/       # Design documentation (DESIGN.md, progress/, overview/)
```

All development work happens in `web/`.

## Commands (run from `web/`)

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build
npm run lint     # Biome check (lint + format check)
npm run format   # Biome format --write (auto-fix formatting)
```

No test suite is configured yet.

## Next.js Version Warning

This project uses Next.js 16.2.2 — **breaking changes exist from prior versions**. Before writing Next.js-specific code, read the relevant guide in `web/node_modules/next/dist/docs/`. Do not assume App Router APIs match your training data.

## Key Technical Choices

- **Linter/Formatter:** Biome (not ESLint/Prettier). Config at [web/biome.json](web/biome.json). Indentation: 2 spaces.
- **Styling:** Tailwind CSS v4 with `@theme inline` in [web/src/app/globals.css](web/src/app/globals.css). No `tailwind.config.ts` file — all config is in CSS.
- **React Compiler:** Enabled (`reactCompiler: true` in next.config.ts). This affects memoization behavior.
- **Output:** Standalone (Docker-ready).

## Architecture

### Path aliases
`@/` maps to `web/src/`.

### App structure (`web/src/`)
- `app/` — Next.js App Router pages. Tools live at `app/tools/<tool-name>/page.tsx`.
- `app/icon.svg` — Custom favicon (replaces default Next.js favicon). SVG with ink background + terracotta dot.
- `components/` — Shared UI components. `components/ui/` holds shadcn primitives.
- `components/ui/badge.tsx` — `Badge` component with variants: `available`, `soon`, `default`, `verified`, `error`. Use for all status labels across the app.
- `components/CodeHighlight.tsx` — Shiki-powered syntax highlighter. Wraps `codeToHtml` with `github-light-default` theme. Use this for any code/token output inside tools.
- `components/GridBackground.tsx` — Fixed full-viewport grid overlay (z-[-1], pointer-events-none). Already rendered in `RootLayout`; do not add another instance.
- `context/LayoutContext.tsx` — Global layout state, persisted to localStorage.
- `data/` — JSON content files. All hardcoded page data lives here, not in components.
  - `data/home.json` — `status`, `sections[]`, `connect[]` for the landing page.
  - `data/tools.json` — `tools[]` for the tools directory.
  - Each item has an `enabled` boolean — set `false` to hide without deleting.
- `lib/utils.ts` — `cn()` helper (clsx + tailwind-merge).

### Language
The site targets Vietnamese users. All UI copy, tool descriptions, and in-app messages are written in Vietnamese. The HTML `lang` attribute is `"vi"` and both fonts include Vietnamese subsets.

### Layout system

`LayoutContext` exposes:
- `maxWidthClass` / `transitionClass` — container width + animation class, consumed by every page and Navigation
- `isWide` / `toggleWide` — switches max-width between `1080px` (standard) and `2560px` (wide)
- `isCustomCursor` / `toggleCustomCursor` — toggles the custom cursor on/off

Pages must wrap content with:
```tsx
const { maxWidthClass, transitionClass } = useLayout();
<section className={`${maxWidthClass} ${transitionClass} mx-auto`}>
```

Both toggles are persisted to localStorage (`folio-wide-mode`, `folio-custom-cursor`) and survive page refresh.

### Navigation

The `//` button (top-right) opens a `// preferences` panel with:
- **layout** — standard / wide toggle
- **cursor** — custom / default toggle

All interactive elements (`<button>`, `<Link>`) must have `cursor-pointer` class so the system pointer shows correctly when custom cursor is off.

### Custom cursor

`CustomCursor` component renders a 10px terracotta circle that expands (×2.8, opacity 0.25) when hovering clickable elements. The system cursor is hidden via `.custom-cursor-active * { cursor: none !important }` on `<html>`. This class is toggled by `LayoutContext`.

When custom cursor is disabled, `cursor-pointer` on interactive elements restores the default browser pointer.

### Sections

| Route | Status | Notes |
|---|---|---|
| `/` | Done | Landing page |
| `/tools` | Done | Tool directory — 2-col grid |
| `/tools/jwt-decoder-encoder` | Done | JWT decode / encode / verify — tab UI, HS256/384/512 |
| `/showcase` | Planned | — |
| `/lab` | Planned | — |
| `/blog` | Planned | — |
| `/journal` | Planned | — |

## Design System (Terracotta Mono)

Full spec in `docs/DESIGN.md`. Critical rules:

**Colors** (Tailwind tokens in `globals.css`):
- `parchment` (#FBF8F4) — primary bg
- `ink` (#2C2420) — primary text, structural borders
- `faded-ink` (#6B5A4E) — secondary/supporting text
- `ghost-ink` (#B8A898) — metadata, timestamps, muted labels
- `terracotta` (#C4622D) — **the only accent** (hover, overline, active state)
- `terracotta-pale` (#F2E0D4) — accent surfaces
- `parchment-border` (#E4D8CC) — content dividers
- `warm-canvas` (#F5EDE0) — secondary surfaces, hover backgrounds

**Typography:**
- `font-display` → Playfair Display (h1–h6, display text). Italic variant used for emphasis/contrast.
- `font-mono` → Montserrat (body, nav, labels, metadata). Default body is `font-mono font-light`.
- All nav items, labels, overlines: **lowercase**
- Overline convention: `{"// section-name"}` prefix, `text-[11px] font-medium tracking-[0.15em] text-terracotta lowercase`
- `//` is a JSX text pattern — always wrap in `{"// ..."}` to avoid Biome's `noCommentText` lint error

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
className="group ... hover:bg-warm-canvas/40 transition-colors duration-200"
// title inside:
className="group-hover:text-terracotta transition-colors duration-200"
// arrow inside:
className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200"
```

## Adding a New Tool

1. Create `web/src/app/tools/<tool-name>/page.tsx` as a `"use client"` component.
2. Add an entry to `web/src/data/tools.json` with `available: true, enabled: true`.
3. Use `useLayout()` for the container. Header pattern:
```tsx
<div className="text-terracotta text-[11px] font-medium tracking-[0.15em] lowercase mb-4">
  {"// tools · tool-name"}
</div>
<h1 className="font-display text-[44px] leading-tight mb-4">Tool Name</h1>
<p className="text-sm text-faded-ink border-l-2 border-terracotta pl-4 max-w-xl">
  Tool description.
</p>
```
4. Keep all logic client-side — no server calls from tools.

Reference: [web/src/app/tools/jwt-decoder-encoder/page.tsx](web/src/app/tools/jwt-decoder-encoder/page.tsx)
