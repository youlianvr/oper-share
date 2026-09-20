# BOOT.md — session entry point

Read this at session start. It is short on purpose: health only, then work.

## 1. Where am I

- Re-read `AGENTS.md` (constitution) — do not trust memory of it after a
  restart or compaction.
- Read `MEMORY.md` at the root if it exists: owner identity, language,
  autonomy level, danger zones. If it does **not** exist, `BIRTH.md` does:
  the workspace is not initialized — run the birth interview first.
- Read `knowledge/INDEX.md` and the relevant zones of `docs/` — indexes
  before greps.

## 2. Session start checklist

1. `git status` — know what you inherited before you touch anything.
2. If MEMORY.md defines an autonomy level, honor it; otherwise default to
   asking on substantive decisions.
3. Open indexes you will need (knowledge, catalog) — not everything, only
   what the first task touches.

## 3. Health checks — on smell, not ritual

Run checks when something smells off, not as ceremony:

- `python _scripts/validate_skills_catalog.py` — catalog ↔ disk drift
  (expects `skills/` at repo root in this package).
- `git log --oneline -5` — what the last sessions actually did.
- Uncommitted foreign changes — work with them as your own, never destroy,
  never commit blindly (constitution: Working With Pre-Existing Changes).

## 4. Session close

- Units of work close as commits; report lets the owner reconstruct state
  from chat alone: what changed, where, committed vs pending, what is next.
- A confirmed decision lands on disk in the same session (MEMORY.md, plan
  file, ADR) — survival across restarts beats memory.
