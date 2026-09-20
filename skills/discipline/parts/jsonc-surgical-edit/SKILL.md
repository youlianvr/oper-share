---
name: jsonc-surgical-edit
description: 'Edit JSON/JSONC configs programmatically, WITHOUT losing comments, external content, and formatting: surgical edits by offsets (the pattern microsoft/node-jsonc-parser uses for VS Code settings.json) instead of rewriting the entire file. Use when a script/installer adds, updates, or removes entries in a config (mcp sections, settings, server blocks) and the file contains comments or external (manual) entries that must not be overwritten; when after running an installer "comments/settings disappear." Covers: JSONC parsing (strings/comments/brackets), key map with offsets, edits in source text coordinates, end-of-file application, comma-aware removal (first/last element), insertion before closing bracket, indentation of inserted blocks, stale cleanup only on full install (clean_stale).'
compatibility: Python 3, any JSONC configs (opencode.jsonc, settings.json, .claude.json)
metadata:
  author: AGGG2.0 (t.me/aidvizhenie, t.me/hilartem)
---


# Surgical JSONC editing: preserve comments and external content

Industry pattern (Microsoft `node-jsonc-parser`, which VS Code uses to edit its
settings.json): config is edited via **text edits by offsets** — only the needed
section is replaced, everything else (comments, external entries, indentation,
key order) remains untouched. Don't rewrite the file through
`json.dump` — that erases comments and reformats everything.

Verified on AGGG2.0 bugs: agent partial MCP install script wiped
external core servers, scripts/install/install_mcp.py lost
opencode.jsonc comments. Implementation: `scripts/jsonc_edit.py` (used by `scripts/install/install_mcp.py` and `scripts/install/install_proshivka.py`)
(`_jsonc_key_map`, `_edit_mcp_section`, `_server_value`, `_server_block`).

## When it's needed

- Script/installer writes to a config that may contain **comments** (`//`, `/* */`) — they must not be lost.
- Config has **external entries** (added manually or by another script) — they must not be touched when delivering only your own.
- Repeated runs — result must be **idempotent** (two runs = same file).

## How jsonc-parser works (VS Code)

1. `parseTree(text)` builds an AST where each node has `offset` and `length` in the ORIGINAL text.
2. `setProperty`/`removeProperty` return `Edit[]` — edits `{offset, length, content}`:
   - **update**: `{offset: existing.offset, length: existing.length, content: newValue}` — ONLY value replaced; key, commas, and nearby comments untouched;
   - **removal**: not first element — from `end of previous node` (takes the comma) to end of deleted; first — from `parent.offset + 1`, if next exists — to start of next (takes its comma);
   - **insertion**: after last node: `{offset: end of last, length: 0, content: ',' + newProperty}`; in empty object — `parent.offset + 1`.
3. `applyEdits` applies edits to text; formatting (`withFormatting`) only formats the edit range, `keepLines: false` — rest of file not reformatted.

## Our implementation (same pattern, no dependencies)

| Function | What it does |
|----------|-------------|
| `_jsonc_key_map(text, want_depth, base, limit)` | scanner: keys at needed depth with `(key_start, value_start, value_end)`; ignores strings, `//` and `/* */`, counts brackets; also returns `root_end` (position after final `}`) |
| `_skip_string` / `_skip_comments` / `_skip_value` | primitives: strings with escaping, comments, paired brackets |
| `_server_value` / `_server_block` | format value/entry with indentation like `json.dumps(indent=2)` |
| `_edit_mcp_section(raw, servers, known, clean_stale)` | edits in ORIGINAL text coordinates, applied end-first; doesn't touch external; `clean_stale=True` cleans stale known entries |
| `_parse_jsonc(text)` | parse JSONC TEXT to object (extracted from `load_jsonc(path)`) |
