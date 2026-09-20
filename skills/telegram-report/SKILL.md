---
name: telegram-report
description: >
  Telegram reporting protocol — send progress/errors/questions to Youlian.
  Use after ANY task completion: ✅ success, ❌ error, ❓ question.
  Script: _scripts/telegram_notify.py, --reply-to for threading.
  Use when: report, report, send report, send report, done reporting,
  task complete, tell Youlian, tell Youlian.
---

> ⚠️ **DEPRECATED 2026-08-11** — Telegram reports are no longer used.
> Do NOT send auto-reports after tasks. This skill is historical/reference-only;
> it is not an active routing contract.

# Telegram Report — report to Telegram

> ⚠️ **Automation is frequently banned.** Sending via user-session/Telethon is **reserve only**, not primary: the official Bot API or manual sending is preferred. Minimum automated messages, no mass mailings.

> Buffy → Youlian. After each task — report.

## How it worked (historical reference only)

```
Youlian (Telegram)               Buffy (agent)
      │                               │
      │  "do X"                       │
      │──────────────────────────────►│
      │                               │  Execute task
      │                               │
      │  "✅ Done: X"                 │
      │◄──────────────────────────────│
      │     (via telegram_notify)     │
```

## Intended behavior (do NOT execute automatically)

**After each action:**
- ✅ Task done → what was done, which files
- ❌ Error → what went wrong, what was tried
- ❓ Need info → question, context, what is needed

## Templates

### Success
```
✅ Done: [task]
What: [what was done]
Files: [modified files]
Time: [duration]
```

### Error
```
❌ Failed: [task]
Error: [what went wrong]
Attempted: [what was tried]
Next: [proposed path]
```

### Question
```
❓ Question: [topic]
Context: [known info]
Need: [what is needed to proceed]
```

## How to send

```bash
# Simple message
python _scripts/telegram_notify.py "✅ Done X"

# Reply to a specific message (recommended!)
python _scripts/telegram_notify.py --reply-to 123 "✅ Done"
# 123 = message_id from Youlian's message you are replying to
```

## TELEGRAM_CHAT_ID

`telegram_notify.py` sends to `TELEGRAM_CHAT_ID` from `.env`.
This must be Youlian's chat. Check:

```bash
python _scripts/telegram_notify.py "Test — this is a test message"
```

If Youlian received it — still good. If not — fix `TELEGRAM_CHAT_ID` in `.env`.

## Automated reports

- **At session start:** verify daemon, inbox, answer Youlian
- **After update:** extract archive → restart → "✅ Update applied"
- **On error:** immediately, don't wait

## Rules

- **Reply to the same message** — quote Youlian's message you are replying to
- **Don't spam** — one report per task
- **Be concrete** — what was done, which files, result
- **Error → immediately** — don't wait to end of session
- **Long report → split** into multiple messages
- **--reply-to** always, when replying to Youlian's task
