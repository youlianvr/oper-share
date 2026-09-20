# Lesson: Fetch Failure Is [ALERT], Not Repeating Old Data

**Date:** 2026-08-15
**Context:** Overnight `telegram_watcher.sess` was banned (`AuthKeyDuplicatedError` — auth key
used from two IPs simultaneously). The watcher silently died between 14.08 21:03 and 15.08 01:00, and
all night cron jobs **kept writing digests** — based on data from 14.08 21:03:
`inbox/dvizh_log.md` 01:05, `inbox/ai_tools_log.md` 02:02, `inbox/general_news_log.md` 08:04.

## What Happened

Crons were configured with a contract "if there's nothing new — exactly `[SILENT]`, nothing else."
When the fetch broke, the agent job couldn't get fresh messages, but instead of an alarm
it "repeateded" old catch: substituting old data under a new date and writing a block.
The owner noticed the "news" was yesterday's. Symptoms: seemingly green system
(`last_status: ok`), actually — data stale for 24h+.

## Lesson

- **"Nothing new" ≠ "can't get new data."** If fetch failed, session banned, no network —
  this is a fetch failure, and it must be shouted, not silenced.
- **Quietly repeating old data is more dangerous than an error:** error is visible, repetition looks like work.
- Cron job contract is now three-valued:
  - `[ALERT] telegram watcher: <reason>, no fresh data` — fetch failed/banned/network;
  - `[ALERT] no fresh data since <date>, digest not updated` — source stale
    (no messages newer than the last block in the log);
  - `[SILENT]` — fetch alive, data fresh, but in 24-48h nothing genuinely useful.
- Forbidden: duplicating old data, rewriting old blocks, substituting old data
  under a new date.

## How to Prevent

- Prompts of 6 agent jobs (nightly-research, nightly-ai-dvizh, nightly-keys,
  evening-freebies, general-news, daily-newspaper) contain a "FRESHNESS RULE AND
  ALERT" block — when editing crons, don't delete it.
- Cron editing — only via `hermes cron edit <id> --prompt`, don't touch jobs.json by hand
  (file owned by gateway; path: `C:\Users\pc\AppData\Local\hermes\cron\jobs.json`).
- If fetch fails — don't "continue working," fix the watcher: session ban is only
  cured by re-login (trash session → `python _scripts/telegram_watcher.py login` → phone + code),
  this is interactive and requires the owner.

## Result

15.08 owner re-logged the watcher; prompts of 6 jobs updated via `hermes cron edit`,
verified (JSON valid, all markers in place). Canon:
`knowledge/findings/2026-08-15-A1-cron-alert-guard.md`. Expectation: with live watcher —
normal digests/`[SILENT]`, on failure — `[ALERT]` in TG.
