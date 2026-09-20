---
name: tg-check
description: >
  Telegram inbox analysis: read per-group files in inbox/, extract findings
  (API keys, tools, services, freebies, attachments) and report to the user.
  Triggered by "check tg", "what's new in tg". This is the READ
  side: the fetcher is not run, only already-downloaded messages are analyzed.
---

# tg-check — Telegram inbox analysis

> ⚠️ **Automation gets you banned very often.** Telethon/user-session — **a
> reserve only, not the base**: priority is reading already-downloaded files,
> official/web paths without a user session. No write operations through a
> user-session without an explicit owner command.

> **Important:** this skill is the read side. Fetch runs regularly on its own
> via `python _scripts/telegram_watcher.py fetch`.
> Here we only **read** per-group files and **hand over** a digest to the user.

## Briefly

1. Look at `inbox/.fetch_stats.json` — what arrived in the last fetch.
2. Read the matching `inbox/<safe_title>.md` (per-group files).
3. Optionally look into `inbox/attachments/<safe_group>/` if there were attachments.
4. Extract findings (API keys, tools, services, promocodes, freebies, files).
5. Report to the user per group + a general "what is worth checking".

---

## Step 0. Fetcher architecture (for reference)

The project has three independent TG scripts. The canonical one is `telegram_watcher.py`.

| Script | API | What it does | Per-group? |
|---|---|---|---|
| `_scripts/telegram_watcher.py` | Telethon, user-session | Monitors selected groups/PMs, writes **per-group** to `inbox/<safe_title>.md` + dashboard `telegram_group_inbox.md` + private DMs to `_signal.md` + attachments to `attachments/<group>/` | ✅ |
| `_scripts/telegram_poll.py` | Bot API | One PM + one channel via the bot, writes to `_scripts/telegram_inbox.md`. Not per-group. | ❌ |
| `_scripts/telegram_bridge_daemon.py` | Bot API, daemon | Remote control of Buffy via TG (`!help`, `!status`, `!read`, `!run`, `!daemon` ...). Not per-group. | ❌ |

**`telegram_watcher.py` config** lives in `_scripts/telegram_watcher.json`
(NOT in the project root). Contains:
- `groups` — array of tracked dialogs (id, title, username, last_message_id, is_pm, fetch_limit).
- `last_fetch` — ISO time of the last run.
- `api_id`, `api_hash` — take from `my.telegram.org/apps`, fill in via
  `python telegram_watcher.py setup`.
- `discovered_topics`, `topic_names`, `topics` — forum groups only.
- `archive_hash_<name>` — service hashes against double archiving.

Session: `_scripts/telegram_watcher.session` (Telethon, SQLite format;
**do not share, do not commit, in `.gitignore`**).

---

## Step 1. What is fresh

```bash
# Config freshness
python _scripts/telegram_watcher.py status

# Freshness of specific files
ls -lh inbox/*.md inbox/attachments/ 2>/dev/null
```

Look at:

- `_scripts/telegram_watcher.json` → the `last_fetch` field (ISO).
- `inbox/.fetch_stats.json` → dict `{group_title: new_messages}` of the last fetch.
- `inbox/<safe_title>.md` → last write time in `tail`.
- `inbox/attachments/<safe_group>/` → fresh files (by mtime).

If `last_fetch` is more than 1 hour ago — the fetcher may be stuck. Not our
business in this skill, just mention it to the user.

---

## Step 2. Per-group inbox files

Each file is `inbox/<safe_title>.md`. The name is lowercased, underscores
instead of spaces, special characters stripped. One file per group/channel/DM.
**This is the canonical source of truth for a group.**

Real name examples in this project:
- `inbox/Abuzych.md`
- `inbox/Freebies_manual_install.md`
- `inbox/𝙁𝘳𝘦𝘦_𝘱𝘳𝘰𝘮𝘰𝘵𝘪𝘰𝘯 _.md`
- `inbox/CodeCamp.md`, `inbox/Jeteed.md`, `inbox/Topor.md`
- `inbox/telegram_group_inbox.md` — dashboard aggregator (NOT per-group; a merge of ALL groups).
- `inbox/_signal.md` — private messages via the bot (NOT per-group; PMs in one pile).

Format of each record in a per-group file:
```

---
**{group_title}** | {YYYY-MM-DD HH:MM:SS} | ot @{sender}:
{text}
[📎 saved: `inbox/attachments/{group}/...`]

```

**Algorithm:**

1. From `inbox/.fetch_stats.json` take the list of groups with `count > 0`.
2. For each group:
   - `tail -100 inbox/<safe_title>.md` (or `read_files`).
   - Extract findings.
3. If `.fetch_stats.json` is absent or empty — read the tails of all
   `inbox/*.md` where `last_fetch` is fresh.

---

## Step 3. Attachments

Media (photos, documents, voice, video) is downloaded by the fetcher **if size
≤ 50 MB**. Folder:

```
inbox/attachments/<safe_group>/<original_filename>
```

`<safe_group>` is the per-group folder name (NOT per-topic; all topics of one
group share the folder). In markdown the record is marked:

```
[📎 saved: `inbox/attachments/<safe_group>/<file>`]
```

If the file is > 50 MB — the fetcher just skips it, marking `[SKIP]`.

**Attachment search priority (ALWAYS in this order):**

1. **`~/Downloads/Telegram Desktop/`** — where Telegram Desktop puts files the
   user downloaded manually. **LOOK HERE FIRST.** The user often downloads
   files themselves (via the app), and they do not land in `inbox/attachments/`
   — only here. The file name usually matches the original (`AGGGv1.8.2-dist.zip`).
2. `inbox/attachments/<safe_group>/` — what the fetcher downloaded (≤50 MB).
3. `~/Downloads/` — general downloads (if the file was downloaded from a
   browser, not from TG).

If a file is being searched by name/context from TG — first
`ls ~/Downloads/Telegram Desktop/`, then `inbox/attachments/`. Do not write
Telegram download scripts until the file has been checked in the Telegram
Desktop downloads.

**What to do with attachments:**
- `.md`, `.txt`, `.json`, `.csv`, `.py`, `.sh` — read and distill the essence
  into the report.
- `.pdf` — mention the file name, do not try to parse.
- `.jpg/.png/.webp` — mention, do not analyze without an explicit request.
- `.zip/.7z/.tar.gz` — ask the user to confirm extraction, do not do it yourself.

---

## Step 4. Analysis and categorization

| Type | What to look for | Action |
|-----|-----------|----------|
| API keys | `sk-...`, `hf_...`, `AIza...`, `ghp_...`, `glpat-...`, `xoxb-...` | Tell the user immediately. **Do not write the full key into the report or logs** — only a mask like `sk-...AbCd`. |
| Tools | GitHub links (`github.com/...`), npm packages, bots | If new — briefly propose: "worth a look" |
| Free services | Free APIs, promocodes, trial credits | Check the deadline/terms, mention in "worth checking" |
| System prompts / jailbreaks | Large texts with model instructions | Save to `knowledge/wiki/code/` or `unfiltered/jb-archive/` |
| `.md/.txt` attachments with content | Save locally (the fetcher already did) | Read and distill the essence |
| Scam | Template "$1 ChatGPT Plus", "KYC method", indo-pack flood | Warn, **do not recommend paying** |

---

## Step 5. Report to the user

Format (SHORT, not a wall of text):

```
📬 TG snapshot at <last_fetch>

<Group 1> (<N> new):
  • <finding 1 briefly>
  • <finding 2 briefly>

<Group 2> (<N> new):
  • <finding>
  • attachment: inbox/attachments/<group>/<file>

🔥 Most interesting:
  • <what to check first>
```

If `last_fetch` is recent and `.fetch_stats.json` is empty/absent — write "nothing
new, the fetcher is silent since <time>". Do not make things up.

---

## Exceptions and gotchas

- **Do not run the fetcher from this skill.** It is the read side. If you want
  fresh messages — let the user say "fetch" separately.
- **Do not send messages to TG** from this skill. Read only. Sending is
  `send_telegram.py` or `send_to_telegram.py` on explicit request.
- **Do not delete** old inbox files — they are needed for history/context.
  Archiving is a separate command `python telegram_watcher.py archive`.
- **If a group is not in `telegram_watcher.json.groups`** — its per-group file
  is stale. Look for data in `telegram_group_inbox.md`, **but mark** it as
  "probably stale".
- **`inbox/Freebies_*.md`, `inbox/_GIG_*.md`, `inbox/Abuzych.md`** — landing
  zones for manual inserts (NOT watcher-generated; the user puts things there
  by hand).
- **If fetch failed with an error** (403, FloodWait, etc.) — record it in the
  notes, continue with the next group.
- **This skill must not be autonomous** (see heartbeat/oper-workflow) — heavy
  actions (archive extraction, paying for something) always belong to the user.

---

## Hands and feet: how to read files without pain

| Need | Command |
|---|---|
| Tail of a per-group file (last 50 lines) | `powershell -Command "Get-Content 'inbox/<file>.md' -Tail 80"` |
| Freshness of all per-group files | `ls -lt inbox/*.md` |
| Freshness of attachments | `ls -lt inbox/attachments/<group>/` |
| Size of the whole inbox | `du -sh inbox/` |
| Archive all inbox files (hash-dedup) | `python _scripts/telegram_watcher.py archive` |
| Clean the inbox | Do not run from the read-side skill; archiving and data deletion require separate owner authorization |
