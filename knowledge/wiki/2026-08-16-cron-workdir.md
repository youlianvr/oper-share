# Lesson: Cron Without `workdir` — Relative Paths Don't Exist

**Date:** 2026-08-16
**Context:** `general-news` at 08:02 reported `[ALERT] telegram watcher: script file
_scripts/telegram_watcher.py not found, no fresh data`. The file was in place,
watcher alive (`last_fetch` fresh), night jobs dvizh/keys fetched successfully that same night.
The alert was false, but diagnostics uncovered a real configuration problem.

## What Happened

The "narrow crons" batch (09–10.08) was created without `workdir` — `general-news`,
`nightly-ai-dvizh`, `nightly-keys` in `jobs.json` had `workdir: null`, while
the other 11 jobs had `C:\Users\pc\.openclaw\workspace`. The default `terminal.cwd`
in hermes `config.yaml` was the workspace parent (`C:\Users\pc\.openclaw`), and it also
had a leading space (`' C:\Users\pc\.openclaw'`) — a typo. Without explicit
workdir the agent job terminal starts outside the repo root, step 0
`python _scripts/telegram_watcher.py fetch` fails "file not found", and the ALERT-guard
from 15.08 honestly triggers. Jobs without workdir behave unstably: dvizh/keys
guessed cwd correctly this time, general-news did not.

## Fix

- `hermes cron edit <id> --workdir "C:\Users\pc\.openclaw\workspace"` — all three
  jobs (`c124048b1555`, `f8fc04d34d4f`, `27ea23ef9d00`).
- Removed leading space in hermes config `terminal.cwd`.
- Documented in `CRON-REGISTRY.md` (narrow crons section).

## Lesson

- **Every new agent cron job must receive an explicit `--workdir` when
  created.** Relative paths (`python _scripts/...`) silently depend on it.
- "File not found" from an agent job ≠ missing file — first check which
  directory the agent actually started from (`workdir` in jobs.json vs
  default `terminal.cwd`).
- ALERT-guard works: it correctly shouts about failure, but doesn't distinguish
  "file missing" from "file missing in my cwd". That's fine — false alarm is cheaper than silent stale data.
