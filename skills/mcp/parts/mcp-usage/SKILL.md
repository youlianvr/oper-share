---
name: mcp-usage
description: >
  Using MCP (Model Context Protocol) servers to extend agent capabilities.
  Read the configured MCP source for the current server list — never hardcode it.
  Use when: add MCP, MCP server, connect MCP, mcp tool, any MCP available,
  why is my MCP not working, MCP config.
---

# mcp-usage — MCP Server Reference

> MCP servers extend agent capabilities. Use the runtime's configured MCP source; `docs/Infrastructure.md` defines evidence labels.

## When to Use

Read the runtime-selected MCP configuration to discover currently installed servers and tools.
The list changes — never hardcode it. Use this skill for:
- Finding which MCP tool to use for a task
- Adding a new MCP server
- Troubleshooting MCP connection issues
- Understanding the loader order

## Discover current servers

```bash
# Inspect the runtime-selected MCP configuration using the host's file reader
read_file("<runtime MCP config>")
python3 -c "
import json,sys
cfg = json.load(sys.stdin)
for name, srv in cfg.get('mcpServers', {}).items():
    print(f'  {name} — {srv.get(\"command\",\"?\")} {\" \".join(srv.get(\"args\",[]))}')
"
```
**In session:** inspect the current tool surface and exact schemas. Tool names
are host-specific; a visible definition is only `TOOL-SURFACE`. Consult
`docs/Infrastructure.md` and make a relevant successful call before claiming
`VERIFIED-LIVE`.


## Common use cases

Choose the server by role, then inspect the current tool surface and schema.
Do not infer availability from the server name alone.

## Configuration

Configuration source: the runtime's configured MCP source; inspect the actual path before editing.

```json
{
  "mcpServers": {
    "server-name": {
      "command": "npx",
      "args": ["-y", "package-name", "optional-args"],
      "env": { "API_KEY": "$ENV_VAR_NAME" }
    }
  }
}
```

### Adding a new server

1. Add an entry to the runtime-selected MCP configuration
2. Use `$ENV_VAR_NAME` for secrets (resolved from `process.env` on load)
3. Use forward slashes in Windows paths (JSON-safe)
4. Restart session for changes to take effect

### Loader order

Do not assume a loader order from this skill. Inspect the current runtime configuration and `docs/Infrastructure.md`; configuration alone does not prove a live server.

## Troubleshooting

| Symptom | Likely cause |
|---------|-------------|
| Tool not appearing | Binary not installed (`npx`/`uvx`/`python` missing) |
| Env var not resolving | `$VAR_NAME` must exist in `process.env` or it won't load |
| Transport mismatch | Server uses `stdio` but config says `sse` (or vice versa) |
| Windows path issues | Use forward slashes in JSON paths |
| Server silently fails | Check stderr: `npx -y pkg 2>/tmp/mcp-err.log` |

## Task → tool mapping (skill ↔ MCP ↔ script)

The workspace's three tool layers per domain. Read left to right for your task;
a dash means the layer adds nothing for that domain. Router names are skills in
`.agents/skills/<name>/`; servers are rows in `docs/Infrastructure.md` § MCP Registry
(status labels there are evidence-dated — trust them over this table's presence).

| Domain | Skill router | MCP servers | Scripts / tools |
|---|---|---|---|
| Security & pentest (authorized) | `security` (+ `security-review`) | osint-tools (T), dnstwist (T), dechonet (V) | `tools/mcp-cyber/`, src-hunter payload/playbook refs |
| Reverse engineering | `reverse-engineering` (+ `reverse-api-engineer`) | — | ghidra/ida/radare2 CLIs per parts |
| Browser automation & scraping | `browser` | playwright (V), browsermcp (V: 86 tools) | CloakBrowser, browser-harness (`tools/`) |
| Web research & SERP | `research` | searchmcp (V: 1 `research`), a2asearch (V), context7 (V), freshcontext (T) | agent-reach channels (`tools/`) |
| OSINT | `osint` | osint-tools (T: sherlock/holehe/spiderfoot/ghunt/maigret/theharvester/blackbird) | agent-reach, `tools/aliens-eye` |
| Knowledge & workspace search | `relevance-scan` (entry) | knowledge-rag (V: 4640 files), zvec-grep (V), chroma (F — start `start-chroma.cmd`), sqlite-mcp (V) | `grep`/`rg` first, `_scripts/` validators |
| Documents (docx/pdf/charts) | `documents`, `decks` | — | python-docx, dashi-ppt project, lieflat-charts |
| Presentations | `decks` | — | bento-slides, dashi-ppt, pptx parts |
| Images / vision | `ai-image-prompts-skill`, `multimodal-vision` | ai-vision (T: analyze/compare) | photoshop (T, app required) |
| 3D & game engines | — | blender (C, app required), unity (C, bridge :8080) | — |
| Telegram (bot + user) | `telegram-rich-messages`, `email` | telegram-mcp-bot (V: 6 tools), telegram-userbot (T: 52 tools, real account — care) | `_scripts/tgsend.py`, `rich_poster.py` |
| Email & calendar | `email` | google-workspace (V 2026-08-24: 121 tools) | — |
| Notes & long-term memory | `sessions` (parts) | obsidian (V: 18 tools), memora (V: 42 tools, slow >40 s), notion (C) | `_memory/` layer |
| Windows desktop control | `desktop` | windows-mcp (V: 20 tools) | `_scripts/*.ps1` |
| Databases & SQL | `db-first-search` | sqlite-mcp (V: 5 tools, doc.db), db-tools (T: 13 tools — dbs need `build.py` first) | — |
| VPN & network | `vpn` | dechonet (V) for DNS | `_scripts/vpn-tools/`, happ tooling |
| Dev workflow (git, CI, deploy) | `dev`, `ship` | cloudflare (C, remote) | gh CLI, vercel/wrangler CLIs, docker (T: run_command) |
| Reasoning support | — | sequential-thinking (V: 1 tool) | — |
| Tool discovery (find new agents/MCP) | `skill-meta` parts | a2asearch (V) | web research routers |
| MCP itself (add/repair/build) | `mcp` (this router) | all | `_scripts/mcp-call.py` bridge (works mid-session, no restart) |
| Robot / Arduino | — | robot (T: 23 tools) | `projects/arduino-mcp/` |

## Related Skills

- `desktop` part `windows-env` — Windows environment patterns
- `docs/Infrastructure.md` — MCP registry: policy, schema, evidence labels, fallback rules
