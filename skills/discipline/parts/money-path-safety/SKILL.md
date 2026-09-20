---
name: money-path-safety
description: >-
  Use when the user wants to: pay/buy/subscribe, receive or spend a bonus/promo/referral, check balance or limit, get a refund, or when any debit/credit/quota logic changes — even if the request doesn't explicitly mention money ("give me more minutes", "why was it charged twice", "enter promo code"). Checks: idempotency, atomicity, mutation logging, separate buckets, hard gate before expensive work, charge after success, soft delete, compound PK, structured failure. Do not use for pure CRUD without value semantics and for incident debugging (that is debug-incident-protocol).
compatibility: any languages/stacks with balances, quotas, promo codes, limits
metadata:
  author: AGGG2.0 (t.me/aidvizhenie, t.me/hilartem)
---
Source: tg t.me/aidvizhenie | t,me/hilartem | aidvizh_hub — channel and gig on TG


# Money path safety: money and value — a special class of code

Distillation from production billing sessions (research.db; source:
`docs/patterns/GLAV-PATTERNS.md`, blocks A, O, I, H.56-57). Apply
to ANY path where debit/credit/payment/limiting occurs.

## 1. Money: iron rules

1. **MONEY PATH IS SACRED** — lock/transaction + idempotency + log on every event + double-submit test. Check: pressed "pay" twice → balance +X, not +2X.
2. **IDEMPOTENCY BY DEFAULT** — operation key (invoice_id, event_id) + credited flag + early return. Check: run handler twice — second is no-op.
3. **SEPARATE BUCKETS** — trial/promo/purchase/subscription = different entities, not one `balance` field. Explicit debit order: free → bonus → paid.
4. **HARD GATE BEFORE EXPENSIVE WORK** — check right/limit/money BEFORE external call (CPU/API/LLM). At zero balance, API is not called.
5. **CHARGE AFTER SUCCESS** — success → debit; error → no debit (+ log). Provider error injection → balance unchanged.
6. **LOG EVERY MUTATION** — one line per credit/debit/grant/refund: `charge uid=%s seconds=%.3f from_free=%.3f from_bonus=%.3f from_paid=%.3f`. grep by user_id restores history.
7. **NO SILENT EXCEPT ON SIDE EFFECTS** — except: pass acceptable on cleanup, UNACCEPTABLE on money/auth/data-loss. Money path: log + fallback or fail loud.
8. **READ-MODIFY-WRITE UNDER LOCK** — "read→calculate→write" without locking = lost update. Mutex/transaction for entire RMW.
9. **ONE SOURCE OF TRUTH** — UI/cache/log — derivatives. Truth — storage. Incident starts with reading storage, not theory.

## 2. Atomicity in SQL (no races)

- **Atomic check-and-increment**: `UPDATE ... SET used = used + 1 WHERE used < max` — one query, rowcount 0 = limit exhausted. NOT SELECT → IF → UPDATE.
- **Compound PK as idempotency**: `PRIMARY KEY (code, user_id)` — duplicate blocked at DB level, no SELECT before INSERT.
- **SQLite**: `connect(timeout=30.0)` + `PRAGMA busy_timeout=30000` + `journal_mode=WAL` — three settings together.
- **Metric upsert**: `INSERT ... ON CONFLICT DO UPDATE SET value=value+excluded.value` — no SELECT+UPDATE race.

## 3. Promo codes and value operations

- **SOFT DELETE**: never DELETE a business row — `UPDATE status='finished'`. Audit and FK survive.
- **INPUT NORMALIZATION AT BOUNDARY**: canonical form once at entry (upper/strip/charset); downstream trusts.
- **STRUCTURED FAILURE**: return `(ok, reason_code, value)` — "not_found", "already_used", "exhausted"; UI maps code to human message. NOT just False.
- **CREATOR-SCOPED ADMIN QUERIES**: `WHERE created_by=?` in all admin queries; mutations check owner.
- **SINGLE CONSTANT DRIVES ALL SURFACES**: REFERRAL_BONUS=30 — in DB, UI text, share message, tests. Grep the number finds only the definition.
- **PRE-CAP SIDE-EFFECT GUARD**: check cap BEFORE `_ensure()`/INSERT — otherwise rejected users leave garbage in DB. Reject → return without mutations.
- **MODAL INPUT WITH CANCEL**: input mode → awaiting_X flag → inline "Cancel" button → flag check in on_text. No locked users.

## 4. Referrals and abuse

- **REWARD ONCE PER UNIQUE RELATION**: claimed flag / unique (referrer, referred).
