---
name: freebuff-session-logs
description: "Recover logs and conversation history from an interrupted Freebuff Desktop session. Covers SQLite conversation store (with ask_questions answers!), app stderr logs, and installed app paths. Verified 2026-09-12."
---

# Freebuff Session Logs — Interrupted Session Recovery

> Freebuff Desktop stores the conversation in a per-project SQLite DB. **Tool calls — including `ask_questions` with the user's rendered answers — are saved in the DB**, so decisions from a crashed session can always be recovered. This skill gives the exact paths, schema, and ready-to-run queries.

---

## When to apply this skill

1. **User refers to past work** — "as we discussed yesterday", "continue that task", "what did we decide about X?".
2. **User reports lost context** — "context is lost", "where were we?", "the session was interrupted".
3. **Agent cannot see prior context** — current conversation started fresh, user expects continuity.
4. **User explicitly asks for logs** — "find the previous session", "where are the logs?", "dump our chat".
5. **ask_questions answers were lost to a restart** — the DB stores the *rendered* question + the chosen answers as the tool `output`. Recover them verbatim instead of re-asking. This is the #1 use case in this workspace.

**Decision rule:** topic mentioned? → keyword search across ALL project DBs (`1b`). No topic, just "continue from last time"? → dump the latest thread (`1a`). Need answers to a specific question set? → `1c` (ask_questions recovery).

---

## WHERE the sessions live (verified 2026-09-12)

The **live store** is one SQLite file per project under the global config dir:

```
~/.config/freebuff-desktop/projects/<project-slug>/desktop-v2.db
```

Windows example:

```
C:\Users\pc\.config\freebuff-desktop\projects\workspace_personal-06c8da53-3fec-4305-a4eb-69a5a5bdc77c\desktop-v2.db
```

Each project folder has a `project.json` with `projectPath` — this maps folder → workspace on disk. Example mapping:

| DB folder | projectPath |
|---|---|
| `workspace-36e8284b-…` | `C:\Users\pc\.openclaw\workspace` |
| `workspace_personal-06c8da53-…` | `C:\Users\pc\.openclaw\workspace_personal` |
| `FreebuffHealthcheck-…` | `C:\Users\pc\AppData\Local\FreebuffHealthcheck` |

**Stale copies (do NOT treat as live, but useful as history):**
- `<project-root>/.freebuff/desktop-v2.db` and `desktop.db` — frozen snapshots inside the workspace. Their mtime stops at the moment the workspace moved (e.g. 2026-08-24); they hold old threads in an **older schema** (threads: `id/title/created_at/last_prompt_at`; messages had no `parts_json` in the earliest format). Only fall back to them if the global store has nothing on the topic.
- `C:\Users\pc\AppData\Local\FreebuffHealthcheck\.freebuff\` — another stale snapshot.

**Rule: highest mtime wins.** Search global DBs first; fall back to stale copies only if the topic predates them.

### 0a. List all candidate DBs, live first

```bash
python << 'PY'
import sqlite3, glob, os, datetime
for p in sorted(glob.glob(os.path.expanduser('~/.config/freebuff-desktop/projects/*/desktop-v2.db')), key=os.path.getmtime, reverse=True):
    try:
        con = sqlite3.connect(f'file:{p}?mode=ro', uri=True)
        cur = con.cursor()
        n_msgs = cur.execute('SELECT COUNT(*) FROM messages').fetchone()[0]
        last = cur.execute('SELECT MAX(ts) FROM messages').fetchone()[0]
        last_s = datetime.datetime.fromtimestamp(last/1000).strftime('%Y-%m-%d %H:%M') if last else '-'
        # project path this DB belongs to
        pj = os.path.join(os.path.dirname(p), 'project.json')
        path = json.load(open(pj, encoding='utf-8')).get('projectPath', '?') if os.path.exists(pj) else '?'
        print(f'{last_s} | msgs={n_msgs} | {path}\n    {p}')
        con.close()
    except Exception as e:
        print(f'ERROR {p}: {e}')
PY
```

(Add `import json` at top.) The workspace you're in now → its DB is the first hit; use that DB for all queries below.

---

## Schema (v2, current)

| Table | Columns | Notes |
|---|---|---|
| `threads` | `id`, `project_id`, `project_path`, `title`, `status`, `model`, `created_at`, `last_prompt_at`, `updated_at`, `archived_at`, … | One row per chat thread. Use `updated_at` for recency. |
| `messages` | `seq`, `thread_id`, `request_id`, `input_id`, `role` (`user`/`assistant`), `parts_json`, `attachments_json`, `ts`, `metrics_json` | **No `text` column.** All content is in `parts_json` (JSON array of parts). `ts` is epoch **milliseconds**. |

**`parts_json` part kinds** (observed 2026-09-12):

| kind | key fields | What it is |
|---|---|---|
| `text` | `text` | Visible chat prose (assistant reply or user message) |
| `reasoning` | `text` | Hidden reasoning — skip for context recovery |
| `tool` | `toolName`, `input`, `output` (when finished) | **Tool call. This is the gold mine**: `ask_questions` `output` contains the rendered question AND the user's chosen answers; `str_replace`/`write_file` have the exact edits; `run_terminal_command` has commands + output |
| `notice` | `notice` (`turn-resumed`, …), `text` | Session restart/interruption markers — use them to find where sessions broke |
| `changes` | `files[]` (`path`, `status`, `adds`, `dels`, `patch`) | Per-turn file-change summary with diffs |
| `ad` | — | Advertising noise — always skip |

So searching `messages.text` returns **nothing** — always search `parts_json LIKE '%kw%'` and parse JSON parts when dumping. When dumping for context, keep only `text` + `tool` (with `toolName in ('ask_questions','str_replace','write_file')`) + `changes` parts; drop `reasoning` and `ad`.

---

## 1a. Dump a thread (latest by default, or by ID)

Writes a readable markdown transcript (text + tool calls, reasoning excluded):

```bash
python << 'PY'
import sqlite3, glob, os, json
from pathlib import Path

thread_id = None  # or a thread id string from 1b
db_path = max(glob.glob(os.path.expanduser('~/.config/freebuff-desktop/projects/*/desktop-v2.db')), key=os.path.getmtime)
print('DB:', db_path)
con = sqlite3.connect(f'file:{db_path}?mode=ro', uri=True)
cur = con.cursor()

if thread_id is None:
    row = cur.execute("SELECT id, title FROM threads WHERE archived_at IS NULL ORDER BY updated_at DESC LIMIT 1").fetchone()
else:
    row = cur.execute("SELECT id, title FROM threads WHERE id = ?", (thread_id,)).fetchone()
if not row:
    raise SystemExit('thread not found')
thread_id, title = row
print(f'Thread: {thread_id} | {title}\n')

KEEP_TOOLS = {'ask_questions', 'str_replace', 'write_file', 'run_terminal_command'}
out = Path('.freebuff/session_dump.md'); out.parent.mkdir(exist_ok=True)
with out.open('w', encoding='utf-8') as f:
    f.write(f'# Session dump: {thread_id} — {title}\n\n')
    for seq, ts, role, pj in cur.execute(
        'SELECT seq, ts, role, parts_json FROM messages WHERE thread_id = ? ORDER BY seq', (thread_id,)):
        lines = [f'## [{seq}] {ts} | {role}']
        try:
            parts = json.loads(pj or '[]')
        except Exception:
            parts = []
        for p in parts:
            k = p.get('kind')
            if k == 'text' and p.get('text'):
                lines.append(p['text'])
            elif k == 'tool' and p.get('toolName') in KEEP_TOOLS:
                inp = json.dumps(p.get('input'), ensure_ascii=False)
                lines.append(f'**tool: {p["toolName"]}** input: `{inp[:500]}`')
                if p.get('output'):
                    lines.append(f'  output: {str(p["output"])[:800]}')
            elif k == 'notice':
                lines.append(f'*notice: {p.get("notice")} — {p.get("text","")}*')
        f.write('\n\n'.join(lines) + '\n\n---\n\n')
print(f'Dumped to {out}')
PY
```

---

## 1b. Keyword search across ALL project DBs (use FIRST when a topic is named)

```bash
python << 'PY'
import sqlite3, glob, os, json
KW = 'Calce'  # <-- the topic keyword (substring, case-insensitive via LIKE)
like = f'%{KW}%'
for db in sorted(glob.glob(os.path.expanduser('~/.config/freebuff-desktop/projects/*/desktop-v2.db')), key=os.path.getmtime, reverse=True):
    con = sqlite3.connect(f'file:{db}?mode=ro', uri=True)
    cur = con.cursor()
    rows = cur.execute("""
        SELECT t.id, t.title, COUNT(*) AS hits, MAX(m.ts) AS last_ts
        FROM messages m JOIN threads t ON t.id = m.thread_id
        WHERE m.parts_json LIKE ?
        GROUP BY t.id ORDER BY hits DESC LIMIT 8
    """, (like,)).fetchall()
    if rows:
        print(f'== {db}')
        for tid, title, hits, last_ts in rows:
            print(f'   {tid} | hits={hits} | last_ts={last_ts} | {title}')
    con.close()
PY
```

Then dump the best thread with `1a` (set `thread_id`). Cross-DB by default — this covers "wrong workspace" mistakes too.

---

## 1c. Recover ask_questions answers (THE killer feature)

After a restart, decisions answered in a crashed session are NOT lost. Each completed `ask_questions` tool part stores the rendered question + chosen answers in `output`:

```
output: "Снаряжение, пункт 6 — «a long outer coat»…\n→ Оставить\n\nСнаряжение, пункт 7 — …\n→ Удалить"
```

Recover every Q&A of the current thread, newest first:

```bash
python << 'PY'
import sqlite3, glob, os, json
db_path = max(glob.glob(os.path.expanduser('~/.config/freebuff-desktop/projects/*/desktop-v2.db')), key=os.path.getmtime)
THREAD_ID = None  # None = latest thread
con = sqlite3.connect(f'file:{db_path}?mode=ro', uri=True)
cur = con.cursor()
if THREAD_ID is None:
    THREAD_ID = cur.execute("SELECT id FROM threads ORDER BY updated_at DESC LIMIT 1").fetchone()[0]
rows = cur.execute(
    "SELECT seq, parts_json FROM messages WHERE thread_id = ? AND parts_json LIKE '%ask_questions%' ORDER BY seq DESC",
    (THREAD_ID,)).fetchall()
for seq, pj in rows:
    for p in json.loads(pj or '[]'):
        if p.get('kind') == 'tool' and p.get('toolName') == 'ask_questions':
            out = p.get('output')
            if out:  # completed = user answered
                print(f'=== [{seq}] ===\n{out}\n')
            else:
                print(f'=== [{seq}] (unanswered/timeout) ===\n{json.dumps(p.get("input"), ensure_ascii=False)[:400]}\n')
PY
```

This also works for *this very session*: if the user asks "what did I just answer?" — read the DB instead of re-asking.

---

## 2. Application stderr log

`%APPDATA%/Freebuff/logs/orchestrator-stderr.log` (Windows: `C:\Users\<user>\AppData\Roaming\Freebuff\logs\orchestrator-stderr.log`). Small; holds the last fatal error. `cat "$APPDATA/Freebuff/logs/orchestrator-stderr.log"`.

---

## 3. Installed Freebuff Desktop files

App install: `%LOCALAPPDATA%/Programs/@codebufffreebuff-desktop/`; engine: `resources/orchestrator/orchestrator.js` (grep for `DB_FILENAME = "desktop-v2.db"` to confirm naming/schema if a future update changes it).

---

## 4. Safety rules

- Open SQLite **read-only** (`file:...?mode=ro`, `uri=True`).
- Never delete or move the DB / `-wal` / `-shm` while Freebuff is running.
- Dumps go to `.freebuff/session_dump.md` (that dir is git-excluded from vault commits).

---

## Quick checklist

1. Find the DB for this workspace → `0a` (highest `MAX(ts)` among global DBs).
2. Topic named? → `1b` keyword search on `parts_json` across all DBs → pick thread.
3. "Continue from last time"? → `1a` default (latest non-archived thread).
4. Lost question answers? → `1c` — ask_questions `output` has them verbatim.
5. Crash diagnosis → `%APPDATA%/Freebuff/logs/orchestrator-stderr.log`.
6. Old topic that predates the global store → fall back to `<project>/.freebuff/desktop-v2.db` / `desktop.db` (stale snapshots, older schema).

> **Trap:** `messages` has **no `text` column** — searching it silently returns nothing. Content is in `parts_json` (JSON array; kinds: `text`, `reasoning`, `tool`, `notice`, `changes`, `ad`). Tool calls with `output` are the most valuable part: they contain every ask_questions answer and every file edit.
