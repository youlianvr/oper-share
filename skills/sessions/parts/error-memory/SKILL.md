---
name: error-memory
description: >
  MUST USE after ANY command error, ANY failure, ANY mistake — auto-logging
  errors in ERROR_LOG.md. Trigger: error, fail, crash, broken,
  403, 500, timeout, refused, ENOENT, command not found.
  On session start loads ERROR_LOG.md — knows what broke before and how to fix it.
version: 1.1.0
---

# Error Memory — learning from errors

## Trigger

1. **At session start** — load `ERROR_LOG.md`, remember all errors; also load `_memory/WINS_LOG.md` (positive counterpart — approaches that WORKED, globalized)
2. **After ANY error** — write to ERROR_LOG.md; if you then found a working approach for a previously-blocked task → write to WINS_LOG.md (globalized: universal rule + what you did + what you got)
3. **Before action** — verify this error was not already encountered; if a WINS entry covers the situation, use that approach FIRST

## File

**`C:\Users\pc\.openclaw\workspace\_memory\ERROR_LOG.md`**

> **Important:** The file is created automatically on the first error. If it doesn't exist — create it via `mkdir -p /c/Users/pc/.openclaw/workspace/_memory` and write a header.

Read on startup. Update after errors.

**Session start check:**
```bash
ls /c/Users/pc/.openclaw/workspace/_memory/ERROR_LOG.md 2>/dev/null || echo "ERROR_LOG.md not yet created"
```

## Write format

```markdown
## YYYY-MM-DD — Category: Brief description

**Problem:** What happened
**Cause:** Why (root cause)
**Solution:** How fixed / how to avoid
**Tool:** Which tool NOT to use / WHICH to use instead
**Signal:** How to recognize this error in future (keywords)

---
```

## When to log

### Categories:

- **browser** — captcha, block, Cloudflare, 404, datacenter IP
- **tool** — tool broke, not installed, wrong path
- **api** — API key, 403, rate limit, timeout
- **command** — wrong command, syntax, flag
- **proxy** — proxy, VPN, IP, DNS
- **telegram** — Telegram API, bot, sending, formatting
- **file** — path, encoding, permissions, size
- **cron** — cron job, schedule, delivery
- **proxy-server** — localhost:4000, OmniRoute, ConnectionResetError
- **apk** — APK, Android, decompilation, ADB
- **install** — pip, npm, uv, dependency
- **env** — environment: python vs python3, PATH, Windows quirks, jqAvailability
- **search** — search-specific: captcha_detected, engine failures, extract

## Mandatory error checklist

```
1. Error occurred
2. → Why? (root cause)
3. → How to fix? (solution)
4. → How to prevent? (prevention)
5. → Log to ERROR_LOG.md
6. → Update memory if critical
7. → If error relates to a new tool → update TOOLS_INDEX.md
8. → Dedup: is there already an entry for this gotcha? If yes — update it, don't duplicate
```

## Example errors to log

### Browser via Browserbase = captcha
```
Problem: Cloudflare/DDG/API block requests
Cause: IP 37.17.125.17 — datacenter A1 Minsk, all search engines ban
Solution: local browser + computer-use (local) OR search OR Happ VPN
Signal: Cloudflare, CAPTCHA, "blocked", 403 from search, "Attention Required"
```

### Tavily 403
```
Problem: web_search via Tavily returns 403
Cause: datacenter IP, Tavily blocks
Solution: search (self-hosted) OR local browser OR HN Algolia API
Signal: 403, Tavily, "Web tools are not configured"
```

### ConnectionResetError on proxy
```
Problem: proxy.py crashes with ConnectionResetError(10054)
Cause: Remote host resets connection (OmniRoute/upstream down)
Solution: Restart proxy.py OR check OmniRoute on localhost:4000
Signal: ConnectionResetError, 10054, proxy.py
```

## On session start

```python
# 1. Load ERROR_LOG
error_log = read_file("_memory/ERROR_LOG.md")

# 2. Read ALL errors — they're now in memory

# 3. Before each action:
#    "Has this problem happened before?" → search ERROR_LOG by keywords
```

## Daily cleanup: deduplication and archival

Once per session (on startup or at end) — run ERROR_LOG.md
through cleanup, so the log stays a tool, not a dump:

1. **Deduplication.** One gotcha = one entry. Match by meaning/signal
   merge into one representative entry (class), originals → archive.
   Most common duplicates: same tool gotcha from different sessions
   (example: BACKGROUND not supported ×2, trash-multipath ×4).
2. **Archive entries older than 3 days.** Entries with date older than 3 days from current —
   verbatim to `_archive/ERROR_LOG.<cleanup-date>.md` (precedents:
   `_archive/ERROR_LOG.2026-08-05.md`, `ERROR_LOG.2026-08-12.md`). In the fresh
   file — link header: "> Archive for <date> in _archive/ERROR_LOG.<date>.md.
   File recreated for fresh entries." Delete nothing — only move.
3. **Exception: live gotchas.** Age ≠ irrelevance. Entries about live
   infrastructure and reproducible environment gotchas (freebuff-importer, PORT, 401/429,
   BACKGROUND, Git Bash/PowerShell, trash, Preview, mcp.json,
   health-probes) keep in fresh log regardless of date.
4. **Sanitization.** Before commit/archive — mask personal data
   (email, IP, tokens): `user***@gmail.com`. Don't link side accounts
   to identity in git history.
5. **Append technique.** Append entries only via python by the exact
   last entry header (file is CRLF; str_replace anchors on tail
   break — see "append in ERROR_LOG" entry). During mass rebuild
   preserve verbatim text and line endings (`newline=""`).

## Anti-patterns

- ❌ Error occurred → continued working without logging
- ❌ Logged in thoughts — not in file (session dies, memory lost)
- ❌ Didn't read ERROR_LOG on startup — will repeat same errors
- ❌ Logged error without "Signal" — won't find it in search
- ❌ Logged "tool doesn't work" instead of "how to fix" — doesn't preserve the working fix
