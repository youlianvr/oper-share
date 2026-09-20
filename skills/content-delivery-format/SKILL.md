---
name: content-delivery-format
description: 'Use when the user wants to: deliver results in different formats (text/rich/PDF/HTML), split a long response into messages, add fallback for a new delivery format, implement a new API method not supported by the library, or gradually enable a new format. Covers: rendering by content type, line-aware split, try-new→fallback-old, native API call, incremental rollout, payload validation, rich delivery in history. Do not use for promises/copy (product-promise-contract), navigation (ux-navigation-context), and money (money-path-safety).'
compatibility: bots/messengers, web — anywhere content is delivered in multiple formats
metadata:
  author: AGGG2.0 (t.me/aidvizhenie, t.me/hilartem)
---


# Content delivery & format: rendering, splitting, fallback, rollout

Distillation of Rich Messages & multi-format delivery session.
Source: `docs/patterns/GLAV-PATTERNS.md`, block P (1-20).

## Workflow (application order)

1. **Determine content types.** What kinds exist (coding/voice/article/transcription)? Each — its own delivery format: `if kind == "coding": ... elif kind == "voice": ...`. Not one-size-fits-all (CONTENT-TYPE-SPECIFIC RENDERING).
2. **Extract splitting into a pure function.** `_split_coding_body(body) -> list[str]` without API dependencies. Split on whole lines (`splitlines(keepends=True)`), not bytes — otherwise `<b>`/`<code>` break → broken rendering.
3. **Plan the fallback.** New format first, on ANY error — old proven: `try: rich_send(...); return` → `except: log.warning; send_regular(...)`. reply_markup built BEFORE branching — fallback preserves ALL buttons.
4. **Check limits before sending.** `assert len(body.encode("utf-8")) <= PLATFORM_LIMIT` in tests and before sending. Don't learn about the limit from 400 Bad Request in prod.
5. **Explore new API by protocol.** 1) documentation, 2) library version, 3) endpoint test (getMe → method with chat_id=0), 4) real smoke + cleanup (deleteMessage). Library doesn't support method → HTTP directly to API, separate module (P4).
6. **Enable per kind, gradually.** New format — flag per content type, not global. Rollout: coding → summary → article → history. Separate PR/deploy for each kind.
7. **Check formatting edge cases.** Custom emoji replaced ONLY outside `<pre>`/`<code>`/backtick. History renders same as fresh (Rich on creation → Rich in history, with nested fallback).
8. **Model prompt.** Conciseness instruction in system prompt ("1-2 messages", "pick 5-10 affected patterns"), not post-processing.

## Patterns (brief)

1. **CONTENT-TYPE-SPECIFIC RENDERING** — coding/voice/article get different formats; separate branch per kind.
2. **LINE-AWARE SPLITTING** — split on lines (`splitlines(keepends=True)`), boundary between lines, tags don't break.
3. **SPLIT AS PURE FUNCTION** — no update/context/bot inside — testable without mocks.
4. **TRY-NEW → FALLBACK-OLD** — on any error of new format — old proven, UX doesn't degrade.
5. **NATIVE API CALL WHEN LIBRARY LACKS SUPPORT** — HTTP directly to API (httpx.AsyncClient → POST /bot{token}/{method}) separate module, without Telegram library.
6. **NEW API RESEARCH PROTOCOL** — docs → lib version → endpoint test → real smoke → cleanup.
7. **FEATURE FLAG PER CONTENT TYPE** — new format per kind, not globally.
8. **INCREMENTAL ROLLOUT** — one kind at a time, separate PR for each.
9. **CUSTOM EMOJI SKIP INSIDE CODE BLOCKS** — replacement only in plain parts, not in `<pre>`/`<code>`.
10. **HISTORY VIEW USES SAME RENDERING AS FRESH** — Rich in history = Rich on creation (or fallback with buttons).
11. **PRE-SEND PAYLOAD VALIDATION** — assert on size before sending.
12. **REAL API SMOKE TEST + CLEANUP** — test message → ok=true → deleteMessage. No garbage.
13. **FALLBACK PRESERVES ALL UI ELEMENTS** — reply_markup before Rich/fallback branching.
14. **LLM OUTPUT COMPACTNESS INSTRUCTION** — in prompt, not post-processing.
15. **RICH DELIVERY FOR HISTORY WITH NESTED FALLBACK** — two levels: Rich failed → HTML; Rich API rejected → HTML on top.
16. **LAUNCHER ENVIRONMENT HYGIENE** — PYTHONPATH without paths to deleted directories (P12).
17. **PAYLOAD PREFIX CONVENTION** — `f"{pfx}:{uid}:{int(time.time())}"` for payment routing (P.43/M43).

