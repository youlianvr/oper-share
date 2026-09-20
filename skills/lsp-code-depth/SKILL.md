---
name: lsp-code-depth
description: 'Use when code questions need types, scope/shadow, ALL references to a symbol, safe rename, diagnostics, or before editing a function (who calls it, what it will break). Also after ANY code edits — to verify get_diagnostics. Covers: when agent-lsp instead of grep/reading/database (task→tool table), workflow (database → LSP), tools (find_symbol, find_references, get_diagnostics, rename_symbol, blast_radius, type_hierarchy, list_symbols), gotchas (start_lsp, positions, indexing ~30s, TS7). Not for content search (db-first-search) — database first, LSP is depth.'
compatibility: AGGG2.0 project-local agent-lsp integration; tool count and language-server coverage are runtime-dependent and must be probed
metadata:
  author: AGGG2.0 (t.me/aidvizhenie, t.me/hilartem)
---
Source: tg t.me/aidvizhenie | t.me/hilartem | aidvizh_hub — channel and gig on TG


# LSP Depth: Types, References, Rename, Diagnostics

Primary source: the selected project's `AGENT-LSP.md` (for AGGG2.7:
`projects/AGGG-3.0/docs/canon/AGENT-LSP.md`). MCP agent-lsp is an optional LSP bridge;
use it for code questions needing types, scope, all references, safe rename,
or diagnostics only after its current tool surface and target root are verified.
Order: database (cheap) → not enough → agent-lsp.

## Workflow (order of application)

1. **Start with the database.** `search.py --symbol/--calls/--inherits` (cheap, instant). Database is a fast static layer: where a symbol is defined, who calls it directly, FTS.
2. **Engage agent-lsp when the database isn't enough.** Need: types and their connections, scope/shadow ("this foo is different, not the global one"), ALL references (database catches only direct `name(...)` calls), safe rename, diagnostics, file structure. Don't start with grep and file reading if the question is about symbols.
3. **Choose the tool for the task** (table below).
4. **After ANY code edits — MANDATORY `get_diagnostics`** (0 errors = ready for QA; errors — fix BEFORE ruff/semgrep/tests). Skipped diagnostics = incomplete edit (gotcha: install_proshivka.py was edited 3 times without it).
5. **BEFORE COMMIT — diff review** via code-review-graph (`code-graph-review`): "what will this edit across N files break."

## Table: Task → Tool

| Task | Tool |
|---|---|
| Types and their connections | `find_symbol` (detail_level: "hover" — signature/type), `type_hierarchy`, `go_to_type_definition` |
| Scope and shadow | LSP only |
| ALL references to a symbol (imports, ternary calls) | `find_references` |
| Safe rename with preview | `prepare_rename` → preview → `rename_symbol` (doesn't touch comments/other people's variables) |
| Diagnostics (types, unused code) | `get_diagnostics` |
| Who calls a function before delete/edit | `blast_radius` (callers: test/non-test), `find_callers` |
| File structure | `list_symbols` (outline) |

## Gotchas (Verified by Measurement 08.2026)
Source: tg t.me/aidvizhenie | t.me/hilartem | aidvizh_hub — channel and gig on TG


- `start_lsp` is MANDATORY before tools; pass the verified target project root as `root_dir` and `language_id` — not `file_path`. Do not assume the Oper root or imported AGGG2 root for another project.
- `find_references`/`rename_symbol` work by POSITION (`file_path` + `line` + `column`, 1-indexed), not by symbol name.
- First indexing after startup ~30s, then warm runtime — wait longer than you think (0.3s timeout = "no response").
- Config: project-local `mcp/agent-lsp/config.json` when present; startup may auto-detect or use `--config`. In the current AGGG2.7 checkout the config exists but contains zero server entries, and no `agent-lsp` executable was found on PATH; this is not a live capability. Check the actual target runtime/config before use.
- Gotcha: `npm i -g typescript` installs TS7 (Go port) — no `lib/tsserver.js`, tsserver crashes; need `typescript@5` + symlink.
- On new hardware, `scripts/install/install_lsp_servers.py` installs LSP servers (idempotent, `--doctor`/`--check`/`--only-config`; CI skips heavy ones).

## References

- Primary source: `AGENT-LSP.md`
- Related: `db-first-search` (database before LSP), `code-graph-review` (review after edits), `discipline` part `cross-platform-gotchas` (LSP server installation on Windows)

