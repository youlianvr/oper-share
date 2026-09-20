---
name: skill-hub
description: "Map of the local MCP ecosystem: BrowseMCP (86 browsing tools that act \"as a human\"), SearchMCP (web research in one call) and the mcp-repair skill (repairing MCP connections). The learned → done chain: research → navigate → extract_*. Plus the map of harnesses (skill and rules paths), the skill inventory with canonical sources, the farm lifecycle (skills_install.py, --inventory audit), and the MCP tool-prefix table per client. Use when you need to know which server to use, what is visible in which harness, where a given skill came from, or how to chain research into browsing."
license: MIT
compatibility: opencode, Claude Code, Cursor, OpenAI Codex, VS Code (Copilot), Gemini CLI, Antigravity CLI, Crush, Pi, Kimi Code CLI, Hermes Agent, oh-my-pi, Windsurf
metadata:
  category: ecosystem-map
  complexity: intermediate
  author: t.me/aidvizh_hub · t.me/aidvizhenie
  version: "1.2.0"
---

# Skill Hub — map of the MCP ecosystem

One glance: which servers exist, how to combine them, how to repair them.

## Servers

| Server | What it does | Key tools | When |
|---|---|---|---|
| mcp__browsermcp__ | Browsing "as a human" (Camoufox, persistent logins, 2FA, stealth) | navigate, snapshot, click, fill_form, extract_text, screenshot, sessions_*, mail_*, webmcp_* | "do it on the site", "log in", "extract from the page" |
| mcp__searchmcp__ | Web research: several search engines + parallel extraction → a digest | research | "find / compare / what do people say", fresh news, fact-checking |
| mcp-repair (skill) | Universal MCP repair: ✗ tool failures, Connection closed, moves, environment | — | any MCP client |

## Harnesses: what is visible where

| Harness | Skill paths | "Spec mode" rules | Notes |
|---|---|---|---|
| opencode / opencode2 | `~/.config/opencode/skills` + `.claude`/`.agents` | `~/.config/opencode/AGENTS.md` | `/spec*` commands, agents, spec-guard |
| claude / cursor / codex / gemini / agy | `~/.claude/skills`, `~/.cursor/skills`, `~/.codex/skills`, `~/.gemini/skills` (agy shares gemini's) | CLAUDE.md, `~/.codex/AGENTS.md`, `~/.gemini/GEMINI.md` | — |
| crush | `~/.config/crush/skills`, `~/.config/agents/skills`, `~/.agents/skills` | `~/.config/AGENTS.md` + `CRUSH.md` | `user:` skills (ctrl+p) |
| pi | `~/.pi/agent/skills` + `~/.agents/skills` | `~/.pi/agent/AGENTS.md` | `/skill:*` |
| omp (oh-my-pi) | discovery (claude/codex/gemini/cursor) | `~/.omp/agent/AGENTS.md` | inherits MCP/skills |
| hermes | `~/.hermes/skills` (copies) | `~/.hermes/SOUL.md` | `/skills` |
| kimi | brand `~/.kimi/skills`→`.claude`→`.codex`; generic `.config/agents`→`.agents` | — | `/skill:*`, merge_all |
| cline | `~/.cline/skills` (+ project `.cline/skills`) | — | `/skill-name` |
| copilot / windsurf | `~/.copilot/skills` / `~/.windsurf/skills` | — | — |
| dsh | (plugin `dsh-plugin-aggg4`) | via the plugin | bundle `id: aggg4` |
| universal | `~/.agents/skills` (+ `~/.config/agents/skills`) | — | the cross-agent path |

## MCP tool prefixes per client

| Client | Format | Example |
|---|---|---|
| opencode / opencode2 | `tools.<server>.<tool>` | `tools.browsermcp.navigate` |
| Claude Code, Cursor, Codex, Copilot, Kimi, Hermes | `mcp__<server>__<tool>` | `mcp__browsermcp__navigate` |
| Gemini CLI, Antigravity (agy), Crush | `mcp_<server>_<tool>` (FQN; no `_` inside a server name) | `mcp_browsermcp_navigate` |
| Pi / omp | whatever the MCP extension exposes — read the real name | — |

Rule: the real tool name comes from the available-tools list (search by substring),
never from memory.

## Which skill comes from where

- Canonical sources hold the skill; every client copy is derived. Answer "where did
  this skill come from?" with the audit:
  `python scripts/skills_install.py --inventory` (read-only; `--json` for
  machine-readable output; `--strict` fails on a foreign skill; exit 1 on
  missing/stale).

| Skill | Canonical source (edit only here) |
|---|---|
| browsermcp-automation | `mcps/BrowserMCP/skills/` |
| searchmcp-research | `mcps/SearchMCP/skills/` |
| mcp-repair, skill-hub | `skills/` |
| ai-prompting | `AGGG4/skills/` |
| computer-use, find-skills, orca-cli, orchestration | **not ours** — the Orca harness installs them into `~/.agents/skills`; the audit reports them as `foreign`, leave them alone |

The Kiro-spec half of that source tree (spec-driven-development, spec-mode,
spec-locus, requirements-engineering, design-documentation, task-breakdown,
quality-assurance, create-steering-documents, troubleshooting) was archived on
2026-09-13: it taught a `.kiro/specs` layout this workspace does not use and
duplicated the plan skills already present. The upstream sources stay intact.

## The farm lifecycle

The farm = canons in the source repositories + per-client derivatives + symlinks in
the CLI paths.

```bash
python scripts/skills_install.py --validate      # check the canons
python scripts/skills_install.py --report        # what lives where (before/after)
python scripts/skills_install.py --inventory     # audit: skill → source → status (read-only)
python scripts/skills_install.py --inventory --strict   # audit that fails on a foreign skill (exit 1)
python scripts/skills_install.py --dry-run       # plan without changes
python scripts/skills_install.py                 # install/update (symlinks + copies)
python scripts/skills_install.py --prune         # drop farm orphans (never touches foreign skills)
python scripts/skills_install.py --minimal       # only ~/.agents + ~/.claude
python scripts/skills_install.py --copy          # real copies (isolated environment)
```

Where to look: canons in `mcps/BrowserMCP/skills/*`, `mcps/SearchMCP/skills/*`,
`skills/*`, `AGGG4/skills/*` (external). Derivatives in
`~/.config/skills-adapters/<client>/<skill>/`. CLI paths (overridable with the
`SKILLS_*_DIR` env vars): `~/.agents/skills`, `~/.claude/skills` (copies),
`~/.cursor/skills`, `~/.config/opencode/skills`, `~/.copilot/skills`,
`~/.gemini/skills`. On Windows without Developer Mode the farm falls back to copies
automatically.

## Specs and diagnostics

- Feature specs: `.kiro/specs/<feature>/` (requirements/design/tasks + QA evidence).
- Steering: `.kiro/steering/` (context, standards, git workflow).
- Any MCP breakage (✗ tools, Connection closed, after a move) → the `mcp-repair`
  skill (ladder: status → logs → CLI → stdio probe → fix by category).
- Moving to another OS → `PORTABILITY.md` (path table, checklist) +
  `scripts/platform_check.py`.
- Server docs: `BrowserMCP/docs/` (API-REFERENCE, USAGE-GUIDE, TROUBLESHOOTING,
  SECURITY, STEALTH, ARCHITECTURE), `SearchMCP/README.md`.

## The learned → done chain

```
mcp__searchmcp__research("what does the industry say about X", sources=10)   # 1. learned
mcp__browsermcp__navigate("https://site-of-interest/page")                   # 2. acted
mcp__browsermcp__extract_cards()                                             # 3. took the data
mcp__browsermcp__snapshot() → mcp__browsermcp__click(ref="e3")               # 4. left a trace (or signed up)
```

Rules:
- Research → **one** `research` call (not 10 webfetches); take URLs from `sources[]`.
- Browser → `snapshot` **first**, then act by `ref`; refs reset after navigation.
- If the site supports WebMCP (`mcp__browsermcp__webmcp_list()` / call), use it
  instead of parsing (deterministic, −89% tokens).

## Activation triggers

"what MCP servers do we have", "how do I chain search and browsing", "update the
farm skills", "check the skills", "where did this skill come from / skill inventory /
what's wrong with the farm", "what do I do about Connection closed".
