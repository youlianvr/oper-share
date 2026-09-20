---
name: architecture-simplicity
description: 'Use when the user wants to: design/redesign modules and layers, choose between a library and own code, understand why a project became a god-file, add an abstraction "for growth," update a DB schema without data loss, or during architecture review. Covers: YAGNI until second need, stdlib-first, modules by change reason, shared core + thin adapters, config outside repo + defaults in code, schema evolution without DROP, provider fallback chain, non-representable invalid states, dead code removal. Do not use for money (money-path-safety), hardening (hardening-observability), or refactoring (agent-refactor-safety).'
compatibility: any language and stack, design/architecture review stage
metadata:
  author: AGGG2.0 (t.me/aidvizhenie, t.me/hilartem)
---


# Architecture & simplicity: design principles

Distillation from production sessions. Source:
`docs/patterns/GLAV-PATTERNS.md`, blocks C (21-30), K (71-90).

## 1. Simplicity and dependency

1. **YAGNI UNTIL SECOND NEED** — an abstraction with one consumer is debt, not architecture. Inline until the second consumer; then extract. You should be able to remove the layer — same behavior, less code.
2. **STD LIB / PLATFORM BEFORE DEPENDENCY** — a new dependency costs more than 30 lines of your own code (often). First stdlib/native; dep only if the pain is measurable. moment.js for one format = no.
3. **SEPARATE MODULES BY CHANGE REASON** — generators.py, payments.py, access.py, bot.py — different axes of change. PDF feature doesn't require touching billing. NOT a 3000-line god file.
4. **SHARED CORE, THIN ADAPTERS** — business logic is one; Telegram/CLI/desktop — wrapper (I/O + auth + UX). Bug in polish fixed in one place, both clients OK.
5. **STOP WHEN THE NEXT ABSTRACTION DOESN'T PAY RENT THIS WEEK** — abstraction must pay off now, not "someday."

## 2. Config and evolution

- **CONFIG OUTSIDE REPO, DEFAULTS IN CODE** — secrets and ops tuning not in git; safe defaults in code (FREE_MINUTES=30); override env. Clone without secrets doesn't leak.
- **SCHEMA EVOLUTION MUST NOT WIPE PROD** — deploy doesn't require DROP TABLE: CREATE IF NOT EXISTS + ALTER ADD COLUMN ignore-if-exists. Old DB file opens with new code.
- **FEATURE FLAG/ENV DEFAULT > REWRITE** — ops tuning via flag/env, not rewriting.
- **DETERMINISTIC REBUILD > STALE CACHE** — for documents/artifacts: deterministic rebuild is better than living with stale cache.
- **CACHE BY STABLE KEY, REBUILD VIEWS** — expensive (LLM) cache by PK; cheap rebuild. Second click = 0 external calls.

## 3. Code patterns

- **EXPLICIT SPEND/PRIORITY ORDER IN ONE FUNCTION** — debit order (free→bonus→paid) — one algorithm in one place, not smeared across handlers and SQL triggers. Test for each bucket boundary.
- **FALLBACK CHAIN FOR PROVIDERS** — one vendor = SPOF: ordered list; next on timeout/5xx; fail only when all dead. Mock first provider down → second succeeds.
- **CALLBACK/API MINI-PROTOCOL** — short prefixes + versionable fields > free JSON in button: `hl:page`, `ho:id:back`; regex router; back_context always carried. Deep navigation returns to same offset.
- **PURE FUNCTIONS FOR ASSEMBLE/EXPORT; IMPURE AT THE EDGES** — assembly/export — pure functions; I/O at boundaries.
- **MAKE ILLEGAL STATES UNREPRESENTABLE** — separate fields > boolean soup: `status: active|finished` instead of flags that can be set to contradictory combinations.
- **COMMENTS EXPLAIN WHY AND CEILING** — not what the line does, but why and what ceiling (limit/assumption).
- **DELETE DEAD CODE; DON'T COMMENT IT OUT FOREVER** — dead code is deleted, not preserved.
- **NAMING: VERBS THAT MEAN $** — charge_seconds, apply_referral, can_afford — verb names with monetary meaning.
- **TIME ZONES AND MONTHS: STORE YYYY-MM EXPLICITLY** — period keys as YYYY-MM strings.
- **FLOAT MONEY IS EVIL LONG-TERM** — money is not float; minutes can be, if consistent + tests.

## 4. Other from meta-principles

