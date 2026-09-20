---
name: agent-refactor-safety
description: 'Use when the agent (or user) is about to: refactor/split a monolith, extract modules, merge two project versions, delete imports/functions, move changes between projects, or when after an edit "a line/feature disappeared" and it is unclear what broke. Covers: map before cut, import-and-lint loop, safe extraction order, compatibility facade, bind namespace + _LOCAL_NAMES guard, diff before copy, non-git merge protocol, regression protection (edits eat neighboring lines, verification AFTER the last edit). Do not use for incident debugging (debug-incident-protocol) and test writing (testing-discipline).'
compatibility: any language; refactoring, merge, monolith splitting
metadata:
  author: AGGG2.0 (t.me/aidvizhenie, t.me/hilartem)
---
Source: tg t.me/aidvizhenie | t,me/hilartem | aidvizh_hub — channel and gig on TG


# Agent refactor safety: how to safely edit and merge code

Distillation of monolith refactoring session + hardening & merge +
agent self-regressions. Source: `docs/patterns/GLAV-PATTERNS.md`,
blocks L, M.1-3/23-24/44-46/60; `UNIVERSAL-PATTERNS.md`.

## 1. Before editing: map and plan

1. **MAP BEFORE CUT** — first, a code map: functions, classes, imports, tests (Read + Grep for key symbols). First 5-10 actions — reading and searching, zero Edits. Otherwise — circular imports.
2. **GREP FIRST, READ SECOND** — Grep "^(async )?def " → Read only needed lines. Don't read 2500 lines for 5 functions.
3. **AST ANALYSIS BEFORE SURGERY** — ast.parse + iteration over FunctionDef/ClassDef = module map before Edit.
4. **PARALLEL TOOL CALLS** — Read 3 files + Grep 2 searches in one response — don't waste rounds gathering data one at a time.
5. **TOKEN BUDGET MANAGEMENT** — read large files with offset/limit, not entirely.

## 2. Refactoring order (safe)

- **SAFE LAYER FIRST** — extract from least dependent to most: runtime/config/utilities (pure functions) → then handlers with I/O dependencies.
- **IMPORT-AND-LINT LOOP** — Edit → ruff/compileall → fix → repeat. Don't write 500 lines, then get 50 errors. Cycle 2-3 iterations per module.
- **THREE-STEP VERIFICATION** — ruff → compileall → pytest, always in this order, don't skip.
- **ONE SYMBOL AT A TIME REMOVAL** — removed import → ran ruff → error → restored. Not 10 imports at once.
- **TEST-PRESERVING REFACTOR** — after each major step, pytest: failing → fix wiring, not functionality.
- **TWO-PHASE IMPORT CLEANUP** — first obviously unnecessary → ruff → F401 remainder → remove → ruff.
- **VALUE SLICE ORDER** — core → money → UX → growth: pipeline → billing → history → admin → referrals.
- **LAZY ARCHITECTURE (YAGNI)** — no abstractions until the second consumer. No AbstractRepository "for growth."
- **SHARED ROOT OVER COPY-PASTE** — one guard in shared function > 10 patches in callers.
- **RECURSIVE SELF-DEBUG** — stuck → change strategy (debugging skill), don't continue the wrong path.
- **ERROR RECOVERY BY ROLLBACK** — fix didn't help → revert Edit → different approach. Don't deepen the wrong fix.
- **COMMAND FAILURE RETRY WITH SIMPLIFICATION** — command failed on syntax → simplify (remove pipeline, split steps).

## 3. Monolith splitting: compatibility patterns

- **COMPATIBILITY FACADE** — old public names preserved: bot.py remains the assembly point with re-exports and adapters. Tests and external imports don't break.
- **ALIAS RENAMING FOR SAFE ADAPTER** — `from bot_ui import edit_html as _edit_html` — extracted functions with _ prefix.
- **BIND NAMESPACE PATTERN** — handlers receive shared namespace via bind() — avoids circular imports.
- **_LOCAL_NAMES GUARD** — `_LOCAL_NAMES = set(globals())` at module start; bind() writes only what's not in _LOCAL_NAMES. Otherwise external names overwrite your own.
- **EXPLICIT CROSS-MODULE WIRING** — `namespace.update({"cmd_history": history.cmd_history, ...})` — explicit dictionary, not globals().update blindly.
- **MODULE-LEVEL STATE ALIAS** — `media._pending = _pending` — reference to the same object, NOT a copy (`dict(_pending)` — state diverges).
- **CROSS-MODULE REFERENCE INSPECTION** — check identity: `bot._pending is media._pending` — don't assume.
