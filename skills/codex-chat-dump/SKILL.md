---
name: codex-chat-dump
description: >
  Dump all Codex Desktop / ChatGPT Desktop chat sessions into readable Markdown
  transcripts. Use whenever the user asks to export, view, or browse their Codex
  chat history, mentions "export chats", "past sessions", "fresh export",
  "codex chats", "chatgpt desktop chats", wants to see what was discussed in past
  Codex sessions, or needs a session transcript from ~/.codex. Re-run after new
  Codex sessions appear to refresh the dump.
license: MIT
metadata:
  author: oper
  version: "1.0"
---

# Codex chat dump — Codex Desktop sessions → readable Markdown

**Failure pattern:** Codex Desktop stores sessions as rollout JSONL in
`~/.codex/sessions/` — raw, interleaved, full of system injections and replay
duplicates. Reading them directly is unusable; sessions also get spread across
multiple files, so counting files ≠ counting chats.

**Verified by:** `python _scripts/dump_codex_chats.py` ran clean on 2026-07-31
(22 rollout files → 3 sessions), output validated: correct user/assistant
counts, no duplicate user blocks, INDEX.md links case-match disk files.

## When to use this

- User asks to export/view Codex or ChatGPT Desktop chat history (or "future
  sessions").
- User asks to browse what was done in past Codex sessions.
- New Codex sessions appeared and the existing dump in `_archive/codex-chats/`
  needs refreshing.

## Procedure

- [ ] 1. Run the dump script from the repo root:
      `python _scripts/dump_codex_chats.py`
      It scans `~/.codex/sessions/**/*.jsonl` + `~/.codex/archived_sessions/`,
      groups by session id, dedupes, and writes one `.md` per session plus
      `INDEX.md` into `_archive/codex-chats/`.
- [ ] 2. Verify the run output: expected line per session, e.g.
      `-> 2026-07-31_019fb6e4_improve_project_structure.md (3 user, 154 assistant, 858 tool calls)`.
      Check `grep -c "^## User"` and `grep -c "^### Assistant"` on the biggest
      file — counts must be > 0 and reasonable for the session.
- [ ] 3. Confirm `_archive/codex-chats/INDEX.md` lists every session with a
      working link. Optionally verify case-sensitivity: every filename in the
      links must match the on-disk name exactly (works on GitHub/Linux, not
      just case-insensitive Windows).
- [ ] 4. Tell the user where the transcripts are (`_archive/codex-chats/`).
      Do NOT commit them — `_archive/` is gitignored by design.

### Example

```
$ python _scripts/dump_codex_chats.py
Found 22 rollout file(s)
  -> 2026-07-31_019fb6e2_create_morning_brief.md  (1 user, 0 assistant, 1 tool calls)
  -> 2026-07-31_019fb6e4_improve_project_structure.md  (3 user, 154 assistant, 858 tool calls)
Done. Output in C:\Users\pc\.openclaw\workspace\_archive\codex-chats
```

## Gotchas

- **Multiple rollout files per session.** A single Codex thread spans several
  `rollout-*.jsonl` files, each replaying the full history. The script dedupes
  by stable item ids and by sha1 of normalized text — never "count files to
  count chats".
- **System injections in user messages.** `response_item/role=user` blocks
  carry injected context (AGENTS.md, plugin lists, `<tag>` blocks) mixed with
  the real prompt, often in the same content block. The clean user text lives
  in `event_msg/user_message`. The script strips injections and renders a
  `response_item` user message only when its text is not covered by an event
  message.
- **Console mojibake is a lie.** `event_msg/user_message` printed to a Windows
  console looks like `�����` (cp1251 output). The file bytes are valid UTF-8 —
  judge content by writing to a file, not by console display.
- **`~/.codex/logs_2.sqlite` (37 MB) is a trap.** It looks like the chat store
  but only contains `_sqlx_migrations`. Real chat data is in the rollout
  JSONL files.
- **Cleanup rule (Never Destroy):** stale dump files from older runs are moved
  to trash with `bash _scripts/trash.sh <file>`, never `rm`.
- **`_archive/` is gitignored.** The script and this skill commit; the dumps
  do not.

## What didn't work

- **Reading chats from `logs_2.sqlite` / `state_5.sqlite`** — only migration
  tables exist there; the SQLite DBs hold internal state, not conversations.
- **Per-session gate on `has_event_user`** (render `response_item/role=user`
  only for sessions lacking event messages) — silently dropped real prompts
  that existed only in response_item form. Replaced by per-message
  `covered_by_event` dedup (exact normalized match or superset containing an
  event text), which keeps every real prompt while collapsing injection
  duplicates.
- **Raw `sha1(text)` dedup keys** — trailing newlines / join artifacts made
  identical messages hash differently, producing duplicate blocks. Fixed by
  keying on `sha1(normalize(text))` (whitespace-collapsed) while rendering the
  original text.
