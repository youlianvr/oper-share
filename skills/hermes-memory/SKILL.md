---
name: hermes-memory
description: Manage the global Hermes memory system at AppData/Local/hermes/. Read/write SOUL.md identity, MEMORY.md system memory, USER.md user profile, DANGLING_TASKS.md active tasks, cron jobs in jobs.json, config.yaml. Use when working with Hermes global state, updating memories, managing cron jobs, or checking Hermes health.
---

# Hermes Memory — Global Hermes System

> Hermes lives outside the repo. All paths below are relative to `C:\Users\pc\AppData\Local\hermes\`.

---

## 1. Root Structure

```
hermes/
├── SOUL.md                  # Hermes identity — immutable contracts, routes
├── config.yaml              # Runtime configuration (model, tools, security)
├── state.db                 # Full state (432 MB SQLite) — DO NOT TOUCH
├── memories/
│   ├── MEMORY.md            # System memory — facts, rules, incidents
│   ├── USER.md              # User profile — Niko's preferences, rules
│   └── _archive/            # Previous versions
├── _memory/
│   ├── DANGLING_TASKS.md    # Active/in progress/closed tasks
│   └── INDEX.md             # Memory index (if exists)
├── cron/
│   ├── jobs.json            # All cron jobs with full config
│   ├── executions.db        # Execution history
│   ├── output/              # Job output files
│   ├── ticker_heartbeat     # Timestamp of last ticker pulse
│   ├── ticker_last_error    # Last ticker error message
│   └── ticker_last_success  # Last successful tick
├── skills/                  # Hermes-specific skills
├── sessions/                # Session data
├── logs/                    # Hermes logs
├── .env                     # Hermes secrets (Bot API token, etc.)
├── auth.json                # Authentication state
└── config.yaml              # Full config (model, delegation, moa, tg)
```

---

## 2. Memory Files — What They Hold

### SOUL.md
**Path:** `C:\Users\pc\AppData\Local\hermes\SOUL.md`

Immutable boot identity. Contains:
- Mission statement (single-paragraph)
- Truthfulness contract
- Default role (CJ)
- Communication rules (user, internal files)
- Navigation routes (AGENTS.md, _memory/INDEX.md)
- Risk posture auto-detect rules
- Hygiene rules (no rm, no destructive ops)
- Hardware info

**Rules:** NEVER rewrite SOUL.md. Append only for new routes/contracts.

### MEMORY.md
**Path:** `C:\Users\pc\AppData\Local\hermes\memories\MEMORY.md`

System memory — append-only log of facts, incidents, corrections. Each entry starts with `§`:
```
§ PRIMARY WORKDIR: C:\Users\pc\.openclaw\workspace\ (infrastructure workspace)
§ PROXY: custom proxy.py on port 4000
§ TG AUTOMATION BAN RISK: Niko's TG account can be banned...
```

**Rules:**
- READ on session start — load the whole file
- WRITE after incidents, corrections, new system facts
- Append new entries at the END
- NEVER delete or edit existing entries
- Use format: `§ TOPIC: fact or rule`
- Mark outdated info with `[DEPRECATED]`

### USER.md
**Path:** `C:\Users\pc\AppData\Local\hermes\memories\USER.md`

Niko's profile — preferences, rules, behavioral corrections. Each entry starts with `§`:
```
§ Niko. UTC+3, Belarus. Prices ALWAYS in BYN/USD.
§ For maintenance tasks Niko expects autonomous work with verified one-session execution; this workspace batches independent lookups instead of spawning worker agents.
§ TG-send policy: NEVER auto-send. Only on explicit "send to TG" command.
```

**Rules:**
- READ on session start
- WRITE when Niko gives new preferences or corrects behavior
- Append at END, never edit existing entries
- Use `§` prefix

### DANGLING_TASKS.md
**Path:** `C:\Users\pc\AppData\Local\hermes\_memory\DANGLING_TASKS.md`

Active task tracker. Sections:
```
## 🔥 IN PROGRESS
## 👀 NEEDS REVIEW
## ✅ CLOSED
```

Each task: `- [ ] Task description — status, context. Added: YYYY-MM-DD`

**Rules:**
- Move tasks between sections, don't delete
- Add new tasks at the END of the section
- When Niko confirms task done: move to `✅ CLOSED`
- Keep closed tasks for reference

---

## 3. Cron System

**Config file:** `C:\Users\pc\AppData\Local\hermes\cron\jobs.json`

### Historical job snapshot (2026-07-28; verify live before relying on it)

| Job | Schedule | Status | Description |
|-----|----------|--------|-------------|
| nightly-research | 1,3,5 * * * | ✅ Active | AI tools search from TG + web |
| daily-newspaper | 4,16 * * * | ✅ Active | News digest with cover image |
| evening-freebies | 21 * * * | ✅ Active | Freebies roundup |
| daily-integrity | 11 * * * | ✅ Active | System health check |
| skill-maintenance | 4 * * 0 | ⏸ Paused | Skill & memory maintenance |
| nightly-experiments | 2 * * * | ⏸ Paused | Night experiments |

### How to check cron health

```bash
# Read jobs.json
cat /c/Users/pc/AppData/Local/hermes/cron/jobs.json

# Quick health check
grep -E '"last_status"|"last_error"|"last_run_at"|"next_run_at"' /c/Users/pc/AppData/Local/hermes/cron/jobs.json

# Check ticker health
cat /c/Users/pc/AppData/Local/hermes/cron/ticker_heartbeat
cat /c/Users/pc/AppData/Local/hermes/cron/ticker_last_error 2>/dev/null || echo "No errors"
cat /c/Users/pc/AppData/Local/hermes/cron/ticker_last_success 2>/dev/null || echo "No success record"

# View recent output (last 20 lines of latest output file)
ls -t /c/Users/pc/AppData/Local/hermes/cron/output/ | head -3 | while read f; do echo "=== $f ==="; tail -20 "/c/Users/pc/AppData/Local/hermes/cron/output/$f"; done
```

### Editing jobs

**To pause a job:** Edit `jobs.json`, set `"enabled": false` and add `"paused_at"` / `"paused_reason"`.

**To enable:** Set `"enabled": true`, clear pause fields.

**To change schedule:** Edit `"schedule"` → `"expr"`.

**To change model:** Edit `"model"` and `"provider"`.

**Delivery:** All jobs deliver to `telegram:-1004303414688` (AI group) via Bot API — safe from ban.

### Ticker diagnostics

| File | Meaning |
|------|---------|
| `ticker_heartbeat` | Last ticker activity timestamp |
| `ticker_last_error` | Error message if ticker failed |
| `ticker_last_success` | Last successful tick |

If ticker is down but heartbeat is recent — may be a stale `.tick.lock`. Rename to `.tick.lock.bak` to clear.

---

## 4. Config

**Path:** `C:\Users\pc\AppData\Local\hermes\config.yaml`

Key sections:
```yaml
model:                        # Primary model config
  provider: custom
  default: custom
  base_url: http://localhost:4000/v1

agent:                        # Agent behavior
  max_turns: 90
  reasoning_effort: ultra

delegation:                   # Optional worker-agent config; verify the current runtime exposes it before relying on it
  provider: custom
  max_iterations: 50
  max_concurrent_children: 15

moa:                          # Mixture-of-agents (DISABLED)
  enabled: false

memory:                       # Memory size limits
  memory_char_limit: 220000
  user_char_limit: 137500

telegram:                     # TG integration
  require_mention: true
```

**NEVER change:** `model.provider`, `agent.max_turns`, `terminal.timeout` without asking Niko.

---

## 5. Common Operations

### Read Hermes memory on session start
```bash
cat /c/Users/pc/AppData/Local/hermes/SOUL.md
cat /c/Users/pc/AppData/Local/hermes/memories/MEMORY.md
cat /c/Users/pc/AppData/Local/hermes/memories/USER.md
cat /c/Users/pc/AppData/Local/hermes/_memory/DANGLING_TASKS.md
```

### Write a new fact to MEMORY.md
Append at the end:
```
§ YYYY-MM-DD: New system fact or rule learned
```

### Write a correction to USER.md
Append at the end:
```
§ YYYY-MM-DD: Niko's new preference or behavioral correction
```

### Update DANGLING_TASKS.md
```markdown
## 🔥 IN PROGRESS
- [ ] **Task name** — Description. Added: YYYY-MM-DD

## 👀 NEEDS REVIEW
[move from IN PROGRESS when done]

## ✅ CLOSED
- [x] Task — resolved YYYY-MM-DD
```

---

## 6. Safety Rules

- **NEVER** delete or rewrite Hermes memory files — append only
- **NEVER** modify `state.db` — it's Hermes' internal SQLite database
- **NEVER** touch `.env` or `auth.json` unless Niko explicitly asks
- **NEVER** kill python processes by name (`killall python`) — use specific PID only
- **NEVER** start long-running processes in foreground — use `background=true`
- **ALWAYS** read files as read-only (`?mode=ro` for SQLite)
- **ALWAYS** use forward slashes in Windows paths when writing to memory files
