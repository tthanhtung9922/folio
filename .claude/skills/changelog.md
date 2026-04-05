---
name: changelog
description: Generate a Keep a Changelog entry from recent git commits in the Folio repo
---

You are generating a changelog entry for the Folio project using Keep a Changelog format (keepachangelog.com/en/1.1.0/).

## Step 1: Get commit range

Run from the repo root (`d:\Dev\Projects\Personal\folio`):

```bash
cd /d/Dev/Projects/Personal/folio && git describe --tags --abbrev=0 2>/dev/null || echo "no-tags"
```

- If a tag exists: get commits since that tag:
  ```bash
  cd /d/Dev/Projects/Personal/folio && git log <tag>..HEAD --oneline --format="%h %s"
  ```
- If no tags: get commits from the last 7 days:
  ```bash
  cd /d/Dev/Projects/Personal/folio && git log --oneline --since="7 days ago" --format="%h %s"
  ```

## Step 2: Categorize commits

Map commit subjects to Keep a Changelog sections:

| Commit prefix | Section |
|--------------|---------|
| `feat:` / `feat(*):` — new features, new pages, new tools | **Added** or **Changed** |
| `fix:` / `fix(*):` | **Fixed** |
| `refactor:` / `style:` — changes to existing behavior or appearance | **Changed** |
| `chore:` / `docs:` / `test:` | **Maintenance** |
| Mentions "remove", "delete", "drop", "deprecate" | **Removed** |

For ambiguous commits, read the diff summary:
```bash
cd /d/Dev/Projects/Personal/folio && git show --stat <hash>
```

## Step 3: Format the entry

Output in this exact format:

```markdown
## [Unreleased] — <today's date YYYY-MM-DD>

### Added
- <plain-English description of what was added>

### Changed
- <plain-English description of what changed>

### Fixed
- <plain-English description of what was fixed>

### Maintenance
- <chore/infra/config changes>
```

**Rules:**
- Write in plain English, not raw commit subjects. Example: `feat: custom scrollbar, wide layout ratio, animated grid background` → "Added custom scrollbar styling, wide layout mode (1600px), and animated canvas tile background"
- Each bullet describes user-visible or developer-visible impact, not implementation details
- Omit sections that have no entries
- If a single commit spans multiple categories, split it into multiple bullets

## Step 4: Offer to tag

After showing the changelog, ask: "Muốn tạo git tag cho release này không? Nếu có, cung cấp version number (ví dụ: v0.2.0)."

If yes:
```bash
cd /d/Dev/Projects/Personal/folio && git tag -a v<version> -m "Release v<version>"
```

Then confirm the tag was created:
```bash
cd /d/Dev/Projects/Personal/folio && git tag --list | tail -5
```
