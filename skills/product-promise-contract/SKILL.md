---
name: product-promise-contract
description: 'Use when the user wants to: understand/change product terms ("how much do you give?", "what if a discount?", "why did minutes run out"), fix marketing texts/promises/copy, add a button or hide a command in /help, or when UI must not promise more than code does. Covers: promises = code, product rules as tests, user input escaping, message status lifecycle, buttons vs commands, user communication. Do not use for navigation/returns/menu (ux-navigation-context), content delivery by type (content-delivery-format), and money (money-path-safety).'
compatibility: bots, web, desktop — any UI with user-facing text
metadata:
  author: AGGG2.0 (t.me/aidvizhenie, t.me/hilartem)
---
Source: tg t.me/aidvizhenie | t,me/hilartem | aidvizh_hub — channel and gig on TG


# Product promise contract: promises, copy, safe output, communication

Distillation from production sessions (UX fix, promo & value ops).
Source: `docs/patterns/GLAV-PATTERNS.md`, blocks B (11-20), J (67-70).

## Workflow (application order)

1. **Collect product promises.** List all numbers and promises from UI/marketing: "50% off", "instantly", "free", "N minutes." Each must have a code line + test. No code behind promise → remove or implement (PROMISE ONLY WHAT CODE DOES).
2. **Translate product rules into named tests.** `test_free_spent_first`, `test_cannot_buy_while_paid_remains`. Spec lives in tests, not in chat.
3. **Check the math.** Formula (30+50=80 first day; monthly only 30) spoken aloud in UI/docs once, clearly. No "bonus minutes" without renew/bucket/expiry.
4. **Check the funnel.** Promo doesn't hide Buy; can_buy after promo == true. Trust gates (username/email/KYC) at handler start, before expensive work.
5. **Check the output.** One render path for all surfaces (raw → escape → format → send). User input escaped BEFORE own markup. Input `<b>x` doesn't break or inject.
6. **Check messages.** To user — short and calm ("Didn't work"), to self — stack/ids/provider. "Loading..." statuses removed before final. 2-4 primary buttons; commands for power/admin.
7. **Check the copy.** User-facing texts covered by tests (`assert "..." in WELCOME`); lengths within platform limits (assert len <= LIMIT before deploy).
8. **Respond to user.** First line = what was done, last line = what to press (smoke steps). One clarifying question at money/abuse fork instead of guessing.

## Patterns (brief)

Source: tg t.me/aidvizhenie | t,me/hilartem | aidvizh_hub — channel and gig on TG


1. **PROMISE ONLY WHAT CODE DOES** — no "50% off" without coupon engine. Every number/promise in UI has a code line + test.
2. **PRODUCT RULES AS NAMED TESTS** — spec in test_*.py: `test_free_spent_first`. New developer reads tests = understands product.
3. **EXPLICIT PRODUCT MATH** — formula spoken aloud in UI/docs: "30+50=80 first day; then 30/month."
4. **SEPARATE PROMO FROM PURCHASE IN UX** — gift doesn't break funnel: can_buy after promo == true.
5. **TRUST BOUNDARY GATES EARLY** — require_X() at handler start; no X means no storage side-effects.
6. **ONE RENDER PATH FOR ALL SURFACES** — one converter for all screens: raw → escape → format → send.
7. **ESCAPE USER INPUT, THEN ADD YOUR MARKUP** — sanitize first, decorate after. Never HTML mode on raw user text.
8. **MINIMAL USER ERRORS, RICH INTERNAL LOGS** — user gets "Didn't work", self gets stack/ids/provider. Prod UI without vendor names/paths/tokens.
9. **STATUS LIFECYCLE** — "loading..." doesn't live next to the answer: created → updated → DELETED → final.
10. **KEYBOARD/PRIMARY ACTIONS > HIDDEN COMMANDS** — 2-4 primary buttons; commands for power/admin.
11. **USER-FACING COPY AS REGRESSION TESTS** — `assert "E-transcriber" in WELCOME`; copy change = breaking change in CI.
12. **PRE-DEPLOY CONTENT VALIDATION** — `len(WELCOME)`, `len(short_description)` ≤ platform limits, fail on overflow.
13. **OBSERVABILITY IS PART OF THE FEATURE** — log/metric goes with feature in the same PR.

## User communication (J)

- **LEAD WITH ACTION, END WITH NEXT ACTION** — first line = what was done, last line = what to press. No "if anything, write."
