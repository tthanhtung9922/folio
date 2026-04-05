---
name: design-check
description: Audit a component against the Terracotta Mono design system — checks colors, radius, cursor, overlines, font weights
---

You are auditing a React/TSX component against the Folio "Terracotta Mono" design system.

## Input

The user will provide either:
- A file path (read it with the Read tool)
- Pasted component code

If neither is provided, ask: "Cung cấp file path hoặc paste code component cần kiểm tra."

## Design System Reference

**Allowed color tokens (Tailwind):**
- `text-ink` / `bg-ink` / `border-ink` — #2C2420
- `text-terracotta` / `bg-terracotta` / `border-terracotta` — #C4622D (only accent)
- `text-faded-ink` — #6B5A4E
- `text-ghost-ink` — #9A8878
- `bg-parchment` — #FBF8F4
- `bg-warm-canvas` — #F5EDE0
- `bg-terracotta-pale` — #F2E0D4
- `border-parchment-border` — #E4D8CC

**Typography:**
- Headings: `font-display` (Playfair Display)
- UI/body: `font-mono` (Montserrat) — default, no class needed
- Body copy `<p>` / `<span>` with readable text: must be `font-normal` (400)
- Labels, nav, overlines: `font-light` (300) or `font-medium` (500) are OK
- Overlines: `text-[11px] font-medium tracking-[0.15em] lowercase text-terracotta`

**Border radius:** Max `rounded-xs` (2px). Violations: `rounded-sm`, `rounded`, `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-full`, `rounded-2xl`

**Overline pattern:** Always `{"// section-name"}` as a JSX text expression. Bare text `// section-name` in JSX will trigger Biome's `noCommentText` lint error.

**Interactive elements:** Every `<button>`, `<a href>`, and clickable element with `onClick` must have `cursor-pointer` in className.

**Hover:** Prefer CSS `group`/`group-hover:` patterns. `onMouseEnter`/`onMouseLeave` state for purely visual effects is a violation.

**Known acceptable one-off hex colors in tool pages:**
- `text-[#8C6B77]` — JWT payload section color (semantic, no token exists)
- `text-[#5B7A70]` — JWT signature section color
Flag these as "advisory" only.

## Audit Checklist

Run through each check and collect findings:

1. **Hex colors in className** — scan for `#[0-9A-Fa-f]{3,8}` in className strings (excluding known JWT exceptions above)
2. **Border radius violations** — find `rounded-sm`, `rounded`, `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-full`, `rounded-2xl`, `rounded-3xl`
3. **Missing cursor-pointer** — find `<button`, `<a href`, or elements with `onClick` that lack `cursor-pointer` in className
4. **Overline syntax** — find overlines using bare `// ` text (not wrapped in `{"// ..."}`)
5. **font-light on body copy** — find `<p>` or `<span>` elements with readable text that use `font-light` instead of `font-normal`
6. **Hardcoded colors in style prop** — find `style={{ color: '...', background: '...' }}` with literal hex or rgb values
7. **Visual hover via JS state** — find `onMouseEnter`/`onMouseLeave` controlling purely visual CSS state changes

## Output Format

```
## Design Check: <filename or "Component">

| Check | Status | Details |
|-------|--------|---------|
| Hex colors | ✓ / ✗ | ... |
| Border radius | ✓ / ✗ | ... |
| cursor-pointer | ✓ / ✗ | ... |
| Overline syntax | ✓ / ✗ | ... |
| Font weight (body) | ✓ / ✗ | ... |
| Style prop colors | ✓ / ✗ | ... |
| Hover pattern | ✓ / ✗ | ... |

### Violations

For each violation:
- **What**: quoted className or code snippet
- **Line context**: surrounding JSX
- **Fix**: corrected version

### Advisory

Non-blocking notes (one-off semantic colors, deeply nested structures, etc.)
```

Be specific — quote the actual className string. Provide the corrected version for every violation.
