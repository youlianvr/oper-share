---
name: testing-discipline
description: >-
  Use when the user wants to: add/fix tests, understand what's covered, determine "is it done", reproduce a bug with a test, verify limits/rate-limit/rejections, or when tests write to a real DB/network. Covers: isolation from prod storage, domain-first tests, test names as spec, edge cases, money/limits/UI/copy tests, DoD (parse + import + test + live process). Do not use for debugging strategy (debug-incident-protocol) and refactoring (agent-refactor-safety).
compatibility: pytest, jest and analogs; applicable to any language
metadata:
  author: AGGG2.0 (t.me/aidvizhenie, t.me/hilartem)
---
Source: tg t.me/aidvizhenie | t,me/hilartem | aidvizh_hub — channel and gig on TG


# Testing discipline: tests as spec and "done" definition

Distillation from production sessions. Source: `docs/patterns/GLAV-PATTERNS.md`,
blocks D (31-37), O.8, M.30-32, N.22-23, P.7/18; UNIVERSAL-PATTERNS.md.

## 1. Isolation and structure

1. **NEVER TOUCH PROD STORE IN TESTS** — tests on throwaway storage: env path override + temp file + fresh import. After suite, prod row count unchanged.
2. **FRESH IMPORT FOR MODULE-LEVEL SIDE EFFECTS** — import-time connect/migrate breaks isolation: `sys.modules.pop` + importlib for each test/fixture.
3. **UNIT DOMAIN FIRST, HANDLER WIRING SECOND** — business rules without framework; handlers — thin glue with fakes for I/O. Domain suite green offline in <2s.
4. **FAKE THE EDGES, NOT THE CORE** — mock Telegram/HTTP/API; DON'T mock your own business logic "for convenience" (mock grant_minutes → test green, prod empty). Handler test changes real temp DB.

## 2. Names and boundaries

- **TEST NAMES ARE THE SPEC** — `test_referral_no_self`, `test_crypto_idempotent` — name = rule. `pytest --collect-only` reads like a product checklist. NOT test_1, test_works.
- **PRODUCT RULES AS NAMED TESTS** — spec lives in tests: `test_free_spent_first`, `test_cannot_buy_while_paid_remains`. New developer reads tests = understands product.
- **ASSERT THE BOUNDARY CASES** — minimum per function: happy + one edge + one abuse. free→0, paid edge, self-ref, double credit, empty username, overflow.
- **WRITE THE ABUSE CASE WHEN YOU WRITE THE GROWTH CASE** — referral/promo written with anti-fraud test in the same PR.

## 3. Specific tests

- **MONEY PATH**: double-submit → balance +X not +2X; provider error injection → balance unchanged; reject → `assert not user_exists(...)` (no side effects).
- **LIMITS (cap)**: test before implementation: cap exhausted → False, user not created; monkeypatch.setenv; `assert cap and invited >= cap`.
- **RATE LIMIT**: two calls in succession → second blocked without external API: mock API → assert len(calls) <= 1 + alert text.
- **UI: PRESENCE + ROUTING** — for each UI addition: test_X_exists + test_X_routes_to_Y. FakeMessage preserves reply_markup → assert button layout.
- **USER-FACING COPY AS REGRESSION TESTS** — `assert "E-transcriber" in WELCOME` — copy change = breaking change, caught in CI.
- **PAYLOAD VALIDATION** — `assert len(body.encode("utf-8")) <= PLATFORM_LIMIT` before deploy; texts within limits.
- **NAVIGATION REGRESSION** — fresh-back returns to content, not list.
- **ENV DEFAULTS** — tests monkeypatch env; bonus/limit constants checked across all surfaces (DB/UI/share).

## 4. DoD — "done" definition

**"Committed" ≠ "works at runtime."** 4-item checklist before "done":

1. **Parse** — `python -m compileall -q` / syntax (catches SyntaxError instantly, before pytest)
2. **Import** — module imports without errors
3. **Test** — pytest green (domain offline; integration with fakes)
4. **One live process** — real entrypoint launch, log OK, single instance
