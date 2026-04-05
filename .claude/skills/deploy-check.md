---
name: deploy-check
description: Pre-deployment verification for Folio — build, tools.json integrity, TypeScript, Biome lint
---

You are running a pre-deployment checklist for the Folio Next.js project. Work through all 5 checks sequentially and produce a final report.

## Check 1: Production build

```bash
cd /d/Dev/Projects/Personal/folio/web && npm run build 2>&1
```

- PASS: build exits 0
- FAIL: capture first 25 lines of error output

Timeout: allow up to 3 minutes.

## Check 2: tools.json integrity

Read `web/src/data/tools.json`.

For every entry where `"available": true`:
1. Extract the slug from `href` (strip `/tools/` prefix)
2. Check that `web/src/app/tools/<slug>/page.tsx` exists
3. If the file is missing → **BLOCKING FAIL**

For entries where `"available": false` with a non-empty `href`:
- Check if the page exists — if missing, mark as **advisory** (not blocking, future-planned)

## Check 3: Route consistency

List tool directories:
```bash
ls /d/Dev/Projects/Personal/folio/web/src/app/tools/
```

For each subdirectory found (not `page.tsx` itself), check that `tools.json` has an entry with `"href": "/tools/<dirname>"`.

Any directory with no matching tools.json entry = **orphaned route** (advisory, not blocking).

## Check 4: TypeScript type check

```bash
cd /d/Dev/Projects/Personal/folio/web && npx tsc --noEmit 2>&1
```

- PASS: exit 0
- FAIL: show first 15 lines of errors

## Check 5: Biome lint

```bash
cd /d/Dev/Projects/Personal/folio/web && npx @biomejs/biome check 2>&1
```

- PASS: no error-level violations (warnings are OK)
- FAIL: show first 15 lines of errors

## Final Report

```
## Deploy Check — <timestamp>

| Check | Status | Notes |
|-------|--------|-------|
| Production build | ✓ PASS / ✗ FAIL | ... |
| tools.json integrity | ✓ PASS / ✗ FAIL | ... |
| Route consistency | ✓ PASS / ✗ FAIL (advisory) | ... |
| TypeScript | ✓ PASS / ✗ FAIL | ... |
| Biome lint | ✓ PASS / ✗ FAIL | ... |

### Overall: ✓ READY TO DEPLOY / ✗ BLOCKED

<list blocking failures with details>
```

**READY TO DEPLOY** only if checks 1, 2, 4, and 5 all pass. Check 3 (route consistency) is advisory only.
