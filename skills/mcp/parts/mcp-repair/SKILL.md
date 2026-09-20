---
name: mcp-repair
description: "Universal repair of the MCP ecosystem: tool-call failures (✗ tools.x, tool failed internally), MCP server failed / Connection closed, disappeared tools, a project moved to another path or OS, a relocated venv, junk printed into stdio, skill-farm problems. Method: split client / server / environment first, then a 5-step ladder (status → logs → CLI reproduction → stdio probe → fix by category). Step 0: resolve the real tool name from the client table (opencode: tools.*, Claude family: mcp__*, Gemini/AGY/Crush: mcp_*). Use for any \"MCP is broken\", \"research fell over\", \"the browser tool is not being called\", \"everything broke after the move\"."
license: MIT
compatibility: opencode, opencode2, Claude Code, Cursor, VS Code, Windsurf, Gemini CLI, OpenAI Codex, Antigravity CLI, Crush, Pi, Kimi Code CLI, Hermes Agent
metadata:
  category: troubleshooting
  complexity: advanced
  author: t.me/aidvizh_hub · t.me/aidvizhenie
  version: "1.1.0"
---

# MCP-Repair — fix MCP the way we fixed it

A verified method for taking apart any MCP breakage. Built from real incidents
(opencode2 beta-18743, 2026-08/09): "Connection closed", `✗ tools.searchmcp.research`,
relocated directories, broken venvs.

**The main principle:** first **split** — is the client, the server or the
environment broken — then fix. 80% of the time goes into fixing the wrong one.

## When to use

- `✗ tools.<server>.<tool> [...]` — a tool call failed.
- `MCP server failed: Connection closed` in `/mcps` or `opencode2 mcp list`.
- The model says "tool not found" while the tool should exist.
- After moving or renaming the project directory, or reinstalling the system.
- "research fell over for no reason", "the browser tool does not answer".

## The ladder: steps 0–5

### Step 0 — Resolve the real tool name (never from memory)

The tool prefix depends on the client — do not repair against an assumed name:

| Client | Format | Example |
|---|---|---|
| opencode / opencode2 | `tools.<server>.<tool>` | `tools.searchmcp.research` |
| Claude Code, Cursor, Codex, Copilot, Kimi, Hermes | `mcp__<server>__<tool>` | `mcp__searchmcp__research` |
| Gemini CLI, Antigravity (agy), Crush | `mcp_<server>_<tool>` | `mcp_searchmcp_research` |

Take the real name from the session's tool list (search by substring: `research`,
`navigate`, …). If an error log hardcodes the wrong prefix, the symptom is
"this skill was read on the wrong client" — not a server problem.

### Step 1 — Server status (is the client alive?)

```bash
opencode2 mcp list                       # status for the CURRENT directory only
opencode2 api GET /api/debug/location    # which locations the service knows about
opencode2 api GET "/api/mcp?location%5Bdirectory%5D=$(pwd)"   # the honest per-location status
```

- `✓ connected` → go to step 2.
- `✗ failed: Connection closed` → **client fix** below (reconnect for this location), then verify step 3.
- "No MCP servers configured" → the client cannot see the config: check `~/.config/orca/opencode-hooks/shared/opencode.json` (opencode2) / `~/.config/opencode/opencode.json` (V1).

### Step 2 — Logs (what actually happened)

```bash
grep -iE "error|failed|timeout" ~/.local/share/opencode/log/opencode.log | tail -30
tail -50 <server-dir>/err.log            # if it exists
```

Read the error **type**: `-32000 Connection closed` (client/process), `status=500`
(request failure), `UnexpectedStatus` (transport), `NotFound: <old path>`
(**leftover from a move** — refresh the paths).

### Step 3 — Reproduce outside the client (is the server alive?)

```bash
# server CLI path (workspace convention: uv — one runner on every OS)
uv run --project <abs>/mcps/<server> -m <server> research "test" --sources 3
uv run --project <abs>/mcps/BrowserMCP python -m browsermcp doctor
```

- **CLI works** → server and request are fine → the problem is the client or the
  transport (steps 4–5).
- **CLI fails** → the server: read the trace, and look at the raw exceptions first
  (see the server fix).

### Step 4 — stdio probe (is the protocol clean?)

Verify the server does not print junk into stdout (that breaks JSON-RPC):

```bash
(sleep 3; echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-11-25","capabilities":{},"clientInfo":{"name":"p","version":"1"}}}'; sleep 3) \
  | timeout 15 uv run --project <abs>/mcps/<server> -m <server> mcp | head -c 300
```

- You see `{"jsonrpc":"2.0",...,"result":...}` → the protocol is clean; go to the
  category fix.
- Junk or nothing → the **startup wrapper** writes into stdout: `uv run` with quiet
  flags, `python - <<` probes, a top-level `print()` in the module (look for a
  `print` outside `def main`).

### Step 5 — Fix by category

**Client fix (Connection closed / "per location"):** MCP status is stored **per
directory**; reconnect:

```bash
opencode2 api POST "/api/mcp/<name>/disconnect?location%5Bdirectory%5D=$(pwd)"
opencode2 api POST "/api/mcp/<name>/connect?location%5Bdirectory%5D=$(pwd)"
```

Do NOT kill processes by hand (`kill`). To restart a location, just restart the TUI.

**Server fix (raw exceptions):** if a tool catches only "its own" errors while
something raw (sqlite, network, a broken page) escapes into the protocol, wrap it in
a broad except and return a readable error:

```python
except ResearchError as exc:
    raise ValueError(str(exc)) from exc
except Exception as exc:  # noqa: BLE001 — a readable error instead of tearing down stdio
    raise ValueError(f"<tool> failed internally: {type(exc).__name__}: {exc}") from exc
```

Plus the rule: **storage degrades gracefully** (a sqlite error → cache-less mode plus
a warning, not a crash). The connection stays alive, so the next call can run
immediately.

**Environment fix (after a move / migration):**
1. Editable installs break first: `site-packages/*.pth` and
   `*.dist-info/direct_url.json` hold **absolute** paths → `sed` them to the new
   path (telltale sign: `ImportError` while `python -c "import sys"` works).
2. Console scripts in `bin/` (Windows: `Scripts/`) — a shebang with an absolute path
   → `sed` or `uv sync`.
3. `pyvenv.cfg` / `bin/python` usually **do not break** (they point at the system
   python) — check those first, then the .pth files.
4. Client configs holding absolute paths (`uv run --project ...` is
   platform-independent).

**Farm fix (skills):**
```bash
python scripts/skills_validate.py --all    # are the canons valid?
python scripts/skills_install.py --report  # what lives where
python scripts/skills_install.py --prune   # drop orphans (foreign skills untouched)
```

## Diagnosis vs recovery (do not confuse them)

| Symptom | First action |
|---|---|
| `✗ tool` with "internally failed" | server: broad except + storage degradation; retry |
| `-32000 Connection closed` | client: reconnect per location; then step 3 |
| The tool "returned" but the result is empty | server logs / err.log; CLI reproduction with the same arguments |
| Everything fine in the CLI, broken from the client | transport: stdio probe, response size (large → truncation/limits), timeouts |
| After `mv` of the project | .pth/direct_url → sed; client configs; reconnect |

## Checks after the fix

1. `opencode2 mcp list` → `✓ connected` (in the right directory).
2. A live call: `mcp__searchmcp__research("check", sources=3)` → `ok`.
3. `mcp__browsermcp__browser_status()` → `ok`.
4. Repeat the failing request — the error must become readable (not a bare `✗`).

## References

- `PORTABILITY.md` — directories/paths per OS; `scripts/platform_check.py` — environment check.
- `scripts/skills_install.py --prune` — the farm; `skills/skill-hub` — the ecosystem map.
- Incident history: `.kiro/specs/cross-platform-v1` (move/venv), `mcps/SearchMCP`
  (research resiliency: cache degradation + broad except).
