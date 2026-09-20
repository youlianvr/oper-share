---
name: ux-navigation-context
description: 'Use when the user wants to: go "back" after viewing/action, understand why the wrong screen opened, rework menu/buttons (many commands in /help), remove emoji from buttons, add "Cancel" to input mode, or when navigation breaks on reopen (fresh vs history). Covers: states and return context, context flags through layers, inline menu, two-tier navigation, button semantics, emoji discipline, callback delegation, pagination with context, UI tests presence+routing. Do not use for promises/copy (product-promise-contract), format delivery (content-delivery-format), and money (money-path-safety).'
compatibility: bots, web, desktop — any UI with navigation and states
metadata:
  author: AGGG2.0 (t.me/aidvizhenie, t.me/hilartem)
---


# UX navigation & context: states, returns, buttons

Distillation of UX fix + UX consolidation sessions. Source:
`docs/patterns/GLAV-PATTERNS.md`, block N (1-43) + B.19-20.

## 1. States and context (core)

1. **VIEW STATE SEPARATION** — fresh result and saved record (history) — DIFFERENT states. Separate return route for each ("‹ To result" vs "‹ To list"). One route for both = user suddenly in list.
2. **CONTEXT FLAG PROPAGATION** — context (fresh/stale, edit/read, preview/export) passed as flag through ALL layers: UI → actions → generators → callbacks. No layer loses context.
3. **ROUTE NAMESPACE BY SCENARIO** — each return scenario — its own route prefix (back-to-result, back-from-edit, back-to-list). Routes don't intersect.
4. **NAVIGATION TARGET COMPUTED ONCE** — `backTarget = isFresh ? "fresh" : page` — one variable, N uses (link text + callback + button). Don't duplicate the string in 5 places.
5. **CONTEXT PRESERVATION IN DEEP ACTIONS** — child actions (generation/export/transformation) carry parent context: `context = isFresh ? "fresh" : pageNumber`.
6. **FULL CONTEXT CHAIN THROUGH ALL ACTIONS** — all action buttons carry full return context, not just object id.
7. **NON-DESTRUCTIVE NAVIGATION FIX** — navigation fix = new routes + handlers, NOT data schema change (don't add isFresh to DB for return).

## 2. Menu structure and buttons

- **COMMAND CONSOLIDATION HUB** — scattered commands → one primary button → compact inline menu. All related actions in 2 taps.
- **TWO-TIER NAVIGATION** — keyboard = top-level sections (3-5 buttons), inline = actions within section (2-6). Never mix levels.
- **BUTTON STYLE BY SEMANTICS** — primary=navigation, success=purchase/positive, danger=destructive. Not aesthetics.
- **EMOJI DISCIPLINE** — buttons: TEXT ONLY, no emoji. Emoji — in read-only content (statuses, headers). Callback data never contains emoji. Grep labels for emoji = 0.
- **CALLBACK DELEGATION, NOT DUPLICATION** — new entry points delegate to existing handlers via adapter (<5 lines routing + adapter, zero business logic). One source of truth per action.
- **NAME FOR FUNCTION, NOT NOVELTY** — label answers "what's inside?"/"what will happen?". New user guesses in <3 seconds.
- **POST-REFINEMENT LABEL AUDIT** — before final deploy: grep labels → remove decorative emoji → update tests.
- **INLINE MENU GRID LAYOUT** — 4+ items = 2×N grid with semantic pairs ("Auto-brief / Context"). Test: `assert [len(row) for row in markup] == [2, 2, 2]`.
- **CONSISTENT NAMING ACROSS ALL SURFACES** — one mode named the same everywhere: settings/result/history/button.

## 3. Content and states in UI

- **ENTRY EXISTENCE GUARD** — `entry = getEntry(id); if not entry: return error(...)` — before any `entry.field`.
- **IMMEDIATE FEEDBACK + CONTENT UPDATE** — protocol: 1) action confirmation (toast/alert), 2) content update.
- **TEMPORARY STATUS LIFECYCLE** — "loading..." removed before final result.
- **UI CLEANUP EXCEPTION IS SAFE** — `catch {}` acceptable ONLY for UI-cleanup (status removal), not business logic.
- **EMPTY CONTENT HIDES SECTION** — `if content:` before adding block; empty section doesn't show header.
- **VISIBLE TRUNCATION MARKER** — truncated → added marker "...not all shown".
- **FIRST-VIEW vs REVISIT-VIEW** — first show: full buttons; repeat: compact view + list navigation. Function accepts isFirstView/isFresh.
- **MUTATE IN PLACE vs CREATE NEW** — view/detail → edit in place; new generation/export → create new. Don't create duplicates.
- **EXPLICIT SOURCE LABELS** — auto-generated vs manually-requested — different icons/prefixes. Three tag states: auto/manual/none.
