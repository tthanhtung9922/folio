---
name: new-tool
description: Scaffold a new tool page for the Folio project — creates page.tsx and updates tools.json
---

You are scaffolding a new tool page for the Folio project. The Next.js app lives at `d:\Dev\Projects\Personal\folio\web\`.

## Step 1: Gather information

Ask the user for:
1. **Tool name** (kebab-case, e.g. `base64-codec`) — used for the directory name and href
2. **Display name** (title case, e.g. `Base64 Codec`) — used in the h1 and tools.json
3. **Short description in Vietnamese** (1–2 sentences) — used as the italic subtitle and in tools.json
4. **Category** (one of: `auth`, `encode`, `format`, `crypto`, `web`, `text`)

If all four are provided in the user's prompt, skip asking and proceed directly.

## Step 2: Create the page file

Create `web/src/app/tools/<tool-name>/page.tsx` with this exact template (substitute values):

```tsx
"use client";

import { useLayout } from "@/context/LayoutContext";

export default function <PascalCaseName>() {
  const { maxWidthClass, transitionClass } = useLayout();

  return (
    <main
      className={`${maxWidthClass} ${transitionClass} mx-auto py-12 md:py-16`}
    >
      {/* ── Header ── */}
      <div className="mb-10 border-b-2 border-ink pb-8">
        <div className="text-terracotta text-[11px] font-medium tracking-[0.15em] lowercase mb-4">
          {"// tools · <kebab-case-name>"}
        </div>
        <h1 className="text-[44px] font-display leading-tight mb-4">
          <Display Name>
        </h1>
        <p className="text-[15px] text-ink font-normal italic border-l-2 border-terracotta pl-4 max-w-xl">
          <Vietnamese description>
        </p>
      </div>

      {/* ── Tool content ── */}
      <div className="flex flex-col gap-8">
        <div className="text-[11px] font-medium tracking-[0.15em] lowercase text-terracotta">
          {"// coming soon"}
        </div>
        <p className="text-sm text-ink font-normal">
          Tool chưa được triển khai.
        </p>
      </div>
    </main>
  );
}
```

**Naming rules:**
- Component function name: PascalCase from kebab (e.g. `base64-codec` → `Base64Codec`)
- Overline text: `{"// tools · <kebab-case-name>"}` — always JSX expression syntax, never bare comment

**Design rules — always enforce:**
- Colors: only `text-ink`, `text-terracotta`, `text-faded-ink`, `text-ghost-ink`, `bg-warm-canvas`, `bg-parchment` — never hex values
- Radius: max `rounded-xs` — never `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-full`
- Overlines: always `{"// ..."}` JSX expression — never `// ...` as plain text
- Body copy `<p>`: always `font-normal` (400) — never `font-light` (300)
- Interactive elements: always include `cursor-pointer`

## Step 3: Update tools.json

Read `web/src/data/tools.json`. Append a new entry:

```json
{
  "name": "<Display Name>",
  "desc": "<Vietnamese description>",
  "category": "<category>",
  "href": "/tools/<kebab-case-name>",
  "available": false,
  "enabled": true
}
```

`available` starts as `false` because the tool is a placeholder. The developer must flip it to `true` once the tool has real functionality.

## Step 4: Confirm

Report:
- File created: `web/src/app/tools/<name>/page.tsx`
- tools.json entry added (show the entry)
- Reminder: run `cd web && npm run dev` to verify the page renders at `/tools/<name>`
- Reminder: set `available: true` in tools.json when the tool is fully implemented
