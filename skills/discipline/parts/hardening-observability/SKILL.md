---
name: hardening-observability
description: 'Use when the user wants to: harden service limits/protection ("so it cannot be farmed", "add rate limit"), add metrics/logs/alerts, figure out why metrics lie, fix "database is locked", configure log files without conflicts, conduct a security audit (secrets, admin privileges, mass mailings). Covers: env-limits with safe defaults, metrics (newly_credited, upsert, snapshot), three-tier logging and audit logs, SQLite busy_timeout+WAL, rate-limit at the edge with monotonic, non-blocking event loop, secrets and token fingerprinting. Do not use for incident debugging (debug-incident-protocol) and refactoring (agent-refactor-safety).'
compatibility: services with limits, metrics, logs, DB, rate-limit
metadata:
  author: AGGG2.0 (t.me/aidvizhenie, t.me/hilartem)
---


# Hardening & observability: limits, metrics, logs, processes

Distillation of hardening & merge session. Source:
`docs/patterns/GLAV-PATTERNS.md`, blocks M (4-22, 25-29, 33-43, 47-59),
G (51-55), F (45-50).

## 1. Limits and caps

- **SAFE DEFAULT ESCALATION** — default limit is restrictive: REFERRAL_MONTHLY_CAP=20, not 0. Admin raises via env.
- **ENV-CONFIGURABLE LIMITS WITH DEFAULTS** — each limit: `_env_int("NAME", default)` with meaningful non-zero default. 0 = unlimited — explicit semantics.
- **CAP ZERO = UNLIMITED** — `if cap and invited >= cap` — cap=0 skips the check. `if invited >= cap` without check blocks everyone at 0.
- **PRE-CAP SIDE-EFFECT GUARD** — check cap BEFORE _ensure()/INSERT; rejected leaves no garbage in DB.
- **MONTHLY ROTATION KEY** — monthly limits keyed by YYYY-MM; `UNIQUE(referrer_id, month)`; no cron resets.
- **CAP WARNING LOG** — on reaching cap — `log.warning("... cap reached referrer=%s month=%s cap=%s")` — admin knows the limit is choking growth.
- **RATE LIMIT CHEAPLY AT THE EDGE** — simple per-user window BEFORE expensive logic: in-memory `dict[uid] = last_call`; N per minute; 0 = off; message "please wait." Don't bring Redis for one handler.
- **RATE LIMIT ALERT TEXT** — reject contains a user-friendly message with wait time: "You can check once every 10 seconds." Not a silent return.
- **monotonic() FOR RATE LIMITS** — intervals — `time.monotonic()` (time.time() can go backwards); absolute timestamps — time().

## 2. Metrics

- **METRIC ON ACTUAL STATE CHANGE** — mutator function returns `newly_credited=True`; metric_inc ONLY on first change. Otherwise the metric lies N times.
- **INVOICE IDEMPOTENCY MARKER** — `out["newly_credited"] = True/False`; caller checks the flag.
- **METRIC TABLE: UPSERT PATTERN** — `name TEXT PRIMARY KEY, value INTEGER, updated REAL` + `INSERT ... ON CONFLICT DO UPDATE SET value=value+excluded.value` — atomic, no race.
- **METRICS SNAPSHOT FUNCTION** — `metrics_snapshot() -> dict[str, int]` in one query — for /admin and debugging.
- **METRIC AT POINT OF ACTION** — metric_inc right in the handler, at the event point; not in a separate reporting function that gets forgotten.
- **CACHE HIT METADATA** — cache result logs `cost=0; isCached=true` — otherwise metrics lie.

## 3. Logging

- **THREE-TIER LOGGING** — INFO = audit (charge/invoice/referral), DEBUG = diagnostics (provider bookkeeping), ERROR = alerts (cap reached, conflict). Everything at one level = no gradation.
- **CHARGE AUDIT TRAIL** — `log.info("charge uid=%s seconds=%.3f from_free=%.3f from_bonus=%.3f from_paid=%.3f")` — grep by uid restores history.
- **INVOICE AUDIT LOG** — `invoice_created invoice=%s uid=%s` + `invoice_paid invoice=%s uid=%s added=%s`.
- **REFERRAL AUDIT LOG** — `referral new=%s referrer=%s bonus=%s month=%s`.
- **PROVIDER EXCEPTION NARROWING** — except: pass → `except Exception as exc: debug-log` with provider, key_index, error. Not silent pass, but not log.error (floods prod with harmless failures).
- **PREMIUM CHARGE SHORT CIRCUIT** — premium doesn't go through cart math: early return with separate log `charge ... premium=%s`.
- **LOG LEVEL PER HANDLER** — each handler with explicit .setLevel(): stdout=INFO, bot_err.log=ERROR.
- **TWO-PHASE ERROR LOG SETUP** — RotatingFileHandler (INFO+) + separate RotatingFileHandler (ERROR only), different maxBytes/backupCount.
- **LAUNCHER STDERR SEPARATION** — launcher writes to launcher_out.log/launcher_err.log, NOT to code's RotatingFileHandler files (`>> bot.log 2>&1` with own RotatingFileHandler = PermissionError on Windows).
