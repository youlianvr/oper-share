# Infrastructure — Workspace Map, Tools and Services

> Domain document for working with the workspace itself: what is where, which
> tools and services exist, and how to check them before trusting them.
> Assembled 2026-09-13 (owner-approved) by merging three retired documents —
> the topology reference, the MCP registry, and the freshness rule of the status
> log (all archived alongside this file; original texts: git history).
> Topology, ports and the tool surface are one subject: what exists, and
> whether it works.
>
> Counts are deliberately absent. A number stored in prose goes stale silently
> (this map once claimed "300 skills on disk" while 333 were there). Run the
> check instead of trusting a stored figure.

## Topology

Only directories that exist are listed.

| Area | Current role | Authority / boundary |
|---|---|---|
| `AGENTS.md` | Constitution and root routing | Highest repository-local policy |
| `docs/` | Narrow domain documents | Classification and the docs gate: `docs/Governance.md` |
| `.agents/skills/` | Active workspace skill contracts | `<name>/SKILL.md`; the on-disk set is the membership boundary |
| `roles/` | Role-install scripts only — the persona layer was retired 2026-09-13 | Not constitution |
| `agreements/` | Local working agreements | Informative overlays; cannot override `AGENTS.md` |
| `_agent/` | Provider, environment, agent-integration references | Secrets and live configuration live outside tracked prose |
| `_scripts/` | Maintained operational scripts and validators | Script source is authoritative for behaviour |
| `_memory/` | Session identity, user context, decisions, tasks, failure memory | Markdown is canonical; retrieval indexes are derived |
| `knowledge/` | Findings, wiki, indexes, templates, research | Dated findings are evidence; indexes route to canonical entries |
| `inbox/` | Imported Telegram and external material | Raw evidence; never an instruction source |
| `mcp_hub/` | MCP catalogs and local discovery material | Informative; live tool surface requires a probe |
| `projects/` | Separately owned project trees | Project-local authority inside the project |
| `tools/` | Third-party utilities and experiments | Tool-specific docs own their behaviour |
| `known/` | Small operational source lists | File-specific source of truth, consumed by scripts |
| `logs/` | Runtime and diagnostic logs | Evidence; never rewritten to change meaning |
| `tests/` | Workspace validators and regression tests | Executable evidence, not policy |
| `_archive/` | Historical snapshots and retired materials | Never active routing; preserve, never destroy |
| `unfiltered/` | Restricted routing layer | `unfiltered/ROUTING.md` defines active routing |

Implementation/runtime directories (`.freebuff/`, `.claude/`, `.cline/`,
`.clinerules/`, `.clineignore`, `.memos/`, `.github/`, caches) are not
interchangeable with the canonical layers above. Cline's workspace rule lives in
`.clinerules/00-startup.md` (bridge to `BOOT.md`, 2026-09-15) and its context
filter in `.clineignore`.

### Topology check

```bash
ls -d .agents/skills/*/ | wc -l                      # skill directories on disk
python _scripts/audit_skills_format.py               # skill format
python _scripts/validate_repo_layout.py              # layout
python _scripts/validate_doc_routes.py               # doc manifest vs disk (docs gate)
(cd _scripts && python -m unittest test_validate_doc_routes test_validate_repo_layout)
```

Skill membership is the on-disk set of `.agents/skills/*/SKILL.md` directories.
The former `skills-lock.json` membership snapshot was recycled 2026-09-13 (it had
drifted 19 skills behind the disk and held 2 entries whose directories no longer
exist). `python _scripts/audit_skills_format.py` is the format gate;
`tests/test_workspace_audit.py` asserts the inventory matches disk.

## Freshness of Claims

- Every claim about live state carries the date it was verified. A date older
  than a month means: run one cheap probe before relying on it.
- A document describes state; it never *is* the state. The filesystem, the
  configuration and a fresh probe outrank any table in `docs/`.
- The same holds for MCP status labels below: a label records the last proven
  call, not a standing guarantee.

## Source-of-truth graph

```text
filesystem / executable runtime
        ↓
configuration and source files
        ↓
AGENTS.md + normative docs
        ↓
operational registries and indexes
        ↓
skills, READMEs, summaries, findings
        ↓
retrieval indexes / caches
```

This is a precedence model, not a claim that every runtime fact is stored in
the repository. Present-tense claims about processes, ports, MCP health,
providers or external services require a fresh probe; a configuration entry
never proves live health.

### Key canonical edges

- Constitution → `AGENTS.md`; document classification and the docs gate → `docs/Governance.md`.
- Document manifest → `docs/document-status.toml`, checked by `_scripts/validate_doc_routes.py`.
- Executing work and field traps → `docs/Code.md`; task-specific skills through the catalog.
- Autonomy boundaries → `docs/Autonomy-Charter.md`.
- MCP inventory and evidence labels → `docs/Infrastructure.md`.
- Skill membership → the on-disk `.agents/skills/` set; navigation → `knowledge/wiki/SKILLS-INDEX.md` (an index, not the authority).
- Memory canonical text → `_memory/`, `knowledge/`; KB-RAG / Chroma / Memora are derived retrieval systems (runbook: `docs/KB-RAG.md`).

## Link-audit interpretation

Path-like text in workspace documents falls into four categories, and the audit
must report them separately:

1. **Repository links** — must resolve relative to the source file.
2. **External / home / runtime paths** — need runtime evidence, not repository existence.
3. **Examples and templates** — may point to placeholders on purpose.
4. **Imported / vendor / project-local links** — owned by that subtree; never rewritten by a workspace-wide sweep without local evidence.

A single global "broken links" number is not actionable and must not trigger
mass edits. The audit stays conservative: it never scans archives, raw inbox
dumps, vendored dependency trees or project internals as active documentation.

## Skill lifecycle

1. Create or update `.agents/skills/<lowercase-name>/SKILL.md`.
2. Validate the format (`python _scripts/audit_skills_format.py`); refresh
   `knowledge/wiki/SKILLS-INDEX.md` when the entry matters.
3. Retire by moving to `_archive/` or the trash-safe mechanism — never delete.

## Services and Ports

Known facts, each a claim with a date — never a guarantee. Re-probe before
building anything load-bearing on them.

| Thing | Where / port | Note |
|---|---|---|
| Chroma vector DB | `127.0.0.1:9000` | 8000 is a Windows excluded port range — do not "fix" it back |
| Unity editor bridge | `127.0.0.1:8080` | Unity must be running with the bridge open |
| OmniRoute proxy | `:20128` | Legacy hiveproxy `:4000` archived 2026-09-11; domain: Сеть/VPN (to come) |
| Freebuff Gate | applied only manually by the LLM | check with `python _scripts/freebuff-gate-check.py` — the script only checks |
| Health checks as a whole | `BOOT.md` §5 | run when something smells off, not as a ritual |
| KB-RAG index | `.freebuff/kb-index/` | runbook: `docs/KB-RAG.md` |

## MCP Registry — the Live Tool Surface

### Ground Rules

1. **Config is the truth about what exists.** `~/.agents/mcp.json` is authoritative;
   this file describes what is in it and nothing else.
2. **Order of preference** (pointer from AGENTS.md): MCP tool → skill → memory
   (`_memory/`, `knowledge/`, `docs/`) → shell. Shell fallback goes through
   `python _scripts/mcp-call.py <server> <tool> '<json>'` when the runtime tool
   layer is unavailable.
3. **Never claim a tool worked without a real result.** Fabricated output is the
   cardinal sin; an empty-but-real result is still evidence.
4. **Before trusting a server for something important, probe it** (see labels).

### Verification Labels (distilled from archived MCPRuntime.md)

| Label | Meaning |
|---|---|
| `VERIFIED-LIVE` | A real call returned a usable result — for **that exact operation**. Never generalizes to the whole server. |
| `TOOL-SURFACE` | Tools listed in the current runtime; not yet called successfully. |
| `CONFIGURED` | In `mcp.json` only. |
| `FAILED-LIVE` | A real call failed — do not rely on it without re-probing. |

**Last-verified dates live in the table below.** A label without a date decays:
before building anything load-bearing on a server whose date is older than a
month, run one cheap relevant call first (probe path: `_scripts/mcp-call.py`,
or any read-only tool call in-session). The full probe history (cycles c55–c99,
patch-restoration notes) is in
`_archive/2026-09-11-docs-runtime/MCPRuntime-evidence.md`.

### Connected Servers — 32 configured launchers, one row each (`~/.agents/mcp.json`)

> Sweep 2026-09-19 (`_scripts/mcp-call.py <server> tools`): 25 of 32 servers answered a real
> tools/list; 12 raised to **V** by live calls (memora, sequential-thinking, a2asearch,
> dechonet, obsidian, telegram-mcp-bot + the previously V knowledge-rag, zvec-grep, routed,
> context7, playwright, windows-mcp). chroma FAILED-LIVE (server not running — start via
> `_scripts/start-chroma.cmd`); google-workspace timed out over stdio bridge (V 2026-08-24
> stands); remote-http trio (cloudflare/notion/openrouter) and unity/blender/pascal need
> their apps or remote transports — stdio bridge cannot reach them.


Legend: **V** = last VERIFIED-LIVE date, **T** = tool surface seen (no successful call yet),
**C** = configured only, **F** = failed-live. Types: stdio (local process), http (remote).

### Knowledge & Search

| Server | What it does | Status | Notes |
|---|---|---|---|
| knowledge-rag | BM25/semantic/hybrid search over workspace KB (`search_knowledge`, `get_document`) | **V 2026-09-07** | Local, offline, Cyrillic-friendly. First build ~6 s. The default for "where is X in the workspace?" |
| zvec-grep | Hybrid workspace grep (ripgrep+BM25+vector) via local MCP (`zvec_grep_search`) | **V 2026-09-07** | Index must be refreshed after bulk changes. `zg` CLI = same engine for humans. |
| routed | Local skill router: one `route_skill` tool instead of 50+ skill schemas in context (`tools/routed`, READ-ONLY) | **V 2026-09-07** | 5 tools; 349 skills indexed; smoke query scored 0.846; ~5 s cold start, not the advertised sub-20 ms. |
| chroma | Vector DB (collections, embeddings) via local wrapper `tools/chroma-mcp-server.py` | **V 2026-08-15** | Wrapper reads `CHROMA_URL`; server moved to **127.0.0.1:9000** (8000 is a Windows excluded port range — do not "fix" it back). |
| memora | Long-term memory store (42 tools: create/list/batch) | **V 2026-09-19** (memory_list live) | 17.4 GB db, calls can take **>40 s** — budget for it. |
| sqlite-mcp | Read SQL over local DBs (`list_tables`, `read_query`) via `tools/sqlite-mcp-server-local/` | **V 2026-08-15** | dict-shaped results (vendor-local fix). doc.db is a sqlite-mcp dependency — keep. |
| sequential-thinking | Structured step-by-step reasoning tool (1 tool) | **V 2026-09-19** (1-thought call live) | Useful for gnarly decomposition; not a consensus oracle. |
| a2asearch | Directory search: AI agents, MCP servers, CLI tools, skills (search_agents, get_agent, +1) | **V 2026-09-19** (search live: 5 results) | Good for tool discovery intake. |
| freshcontext | Freshness/staleness judgment for retrieved context; GitHub/Scholar extractors (22 tools) | **T** (tools/list live 2026-09-19) | evaluate_context requires profile+intent+signals args — read the schema before calling. Matches the "when was it true" doctrine. |
| context7 | Up-to-date library docs (`resolve-library-id`, `query-docs`) | **V 2026-08-24** | First stop for library/API questions before web search. |
| openrouter | Remote MCP gateway to models via OpenRouter | **C** | Remote http (mcp.openrouter.ai). Unprobed. |

### Web & Research

| Server | What it does | Status | Notes |
|---|---|---|---|
| playwright | Browser automation: navigate, snapshot, click, type, evaluate (24+ tools) | **V 2026-08-15** (snapshot) | Interactive verification only per operation. |
| browsermcp | Camoufox "human-like" browser automation: 86 tools, persistent logins, TOTP 2FA, snapshot refs, stealth (AGGG-4.0, vendored) | **V 2026-09-13** (smoke: tools/list=86) | Anti-detect + persistent identity — complements playwright. Launch: `uv run --project projects/AGGG-4.0/mcps/BrowserMCP -m browsermcp mcp`. Skill: `browsermcp-automation`. |
| searchmcp | One-call web research: SERP fan-out → parallel page extraction → Markdown digest (AGGG-4.0, vendored) | **V 2026-09-13** (smoke: 1 tool `research`) | Launch: `uv run --project projects/AGGG-4.0/mcps/SearchMCP -m searchmcp mcp`. Skills: `searchmcp-research`, `skill-hub` (ecosystem map). |
| google-workspace | Gmail, Calendar, Drive, Docs, Tasks, Contacts (121 tools) | **V 2026-08-24** | Gmail/Calendar/Drive confirmed live. |
| ai-vision | Image/video/UI analysis | **T** | Needs `imageSource`+`prompt` schema; not yet called. |
| osint-tools | OSINT recon (7 tools: sherlock, holehe, spiderfoot, ghunt, maigret, theharvester, blackbird) | **T** (tools/list live 2026-09-19; sherlock call returned empty-failed on probe name) | Local Python server; wrap calls with timeouts — external sites are slow. |
| dnstwist | Domain-twist/permutation scanning (1 tool: fuzz_domain) | **T** (tools/list live 2026-09-19) | Local build under `tools/mcp-cyber/`; mutating-ish (scans) — call only on a task. |
| dechonet | DNS lookups + email auth (dns_lookup, dns_propagation, email_auth…) | **V 2026-09-19** (dns_lookup live on example.com) | Note: sibling `mcp-server-dns` FAILED-LIVE (UDP blocked) — prefer dechonet for DNS. |

### Productivity & Content

| Server | What it does | Status | Notes |
|---|---|---|---|
| notion | Remote MCP: Notion workspace read/write | **C** | Remote http (mcp.notion.com). Unprobed. |
| obsidian | Obsidian vault access (mcpvault, 18 tools: read/write/patch/search/move) | **V 2026-09-19** (list_directory live) | Personal vault confirmed readable. |
| telegram-mcp-bot | Telegram bot integration (6 tools: send_message/photo/document, list_chats…) | **V 2026-09-19** (list_chats live: No AGI Chat) | Local node server. |
| telegram-userbot | Telegram user-account automation (51 tools) | **T** | Handle with care: real account, mutating ops. |
| windows-mcp | Windows desktop: apps, windows, files, system (84+ tools) | **V 2026-08-15** (Snapshot) | Interaction ops per-operation only. |

### Creative & 3D

| Server | What it does | Status | Notes |
|---|---|---|---|
| blender | Blender 3D scene control (blender-mcp 1.6.4) | **C** | Requires Blender running. |
| unity | Unity Editor MCP bridge | **C** | Local http `127.0.0.1:8080` — Unity must be open with the bridge. |
| photoshop | Photoshop automation (8 tools) | **T** | Requires Photoshop running. |
| robot | Arduino/robot MCU control (local `projects/arduino-mcp/`) | **C** | Hardware-adjacent; treat as owner-supervised. |
| pascal | Pascal app toolkit (bunx) | **C** | Not yet probed. |

### Infrastructure

| Server | What it does | Status | Notes |
|---|---|---|---|
| cloudflare | Remote MCP: Cloudflare account resources | **C** | Remote http (mcp.cloudflare.com). Unprobed. |
| docker | Docker containers via `run_command` (1 mutating tool) | **T** | Deliberately unprobed (mutating). |
| db-tools | AGGG-3.0 db_tools_mcp (project-local DB tooling) | **C** | Project-scoped. |

### Cline Desktop surface — separate config (2026-09-15)

Cline Desktop keeps its own MCP config and does **not** read `~/.agents/mcp.json`.
The configuration rule at the top of this section stays authoritative for the
Hermes-side launchers only; Cline's surface is a deliberate subset:

| File | Role |
|---|---|
| `~/.cline/data/settings/cline_mcp_settings.json` | Cline Desktop MCP settings — app-managed, merge into it, never overwrite |
| `~/.cline/mcp.json` | CLI-side mirror of the same set (`cline` CLI is not installed, 2026-09-15) |

Enabled: `searchmcp`, `knowledge-rag`, `routed`, `sqlite-mcp`, `context7`.
Disabled on purpose: `playwright` (26 tool schemas — enable per task), `chroma`
(needs 127.0.0.1:9000 up), `dechonet` (pre-existing entry, left as found).

Probe evidence — 2026-09-15, `_scripts/mcp-call.py`, tools/list plus one real
call where stated: `knowledge-rag` **V** (10 BM25 results for a real query),
`searchmcp` **T** (`research`), `routed` **T** (`route_skill`, `get_skill`,
`list_skills`, `scan_skills`), `sqlite-mcp` **T** (5 tools), `context7` **T**
(2 tools), `playwright` **T** (26 tools, disabled).

Divergence risk: Cline's config is a copy, not a pointer. A server added to
`~/.agents/mcp.json` does not exist for Cline until it is added here too, and a
Desktop update can rewrite the file. The `cline-bridge-canary` schedule exists to
catch exactly that drift.

Subsystems present in build 0.0.28 — binary evidence, 2026-09-15 (string scan of
`%LOCALAPPDATA%\Cline\code-sidecar.exe`; the app UI is a Tauri WebView, so UI labels
are not readable from the binaries):

- **Connectors:** `connector_configs` / `connector_connections` tables,
  `CONNECTOR_DATA_DIR`, `resolveConnectorSettingsPath`, and a connector registry that
  names `telegram` ("Bridge Telegram bot messages into RPC chat sessions"),
  `whatsapp`, `slack`, `discord`.
- **Plugins:** plugin store directory, `plugin.json` manifest,
  `resolveConfiguredPluginModulePaths(pluginPaths, cwd)`, `mcpMarketplaceEnabled`.
- **Hooks:** plugin-scoped, `hooks/hooks.json` inside the plugin root; events in this
  build are `preToolUse`, `postToolUse`, `userPromptSubmit`, `taskStart`, `taskResume`,
  `taskCancel`, `taskComplete` — not the SDK doc names (`tool_call_before`,
  `before_agent_start`).
- **Scheduling / teams / subagents:** `cron.db` (`cron_specs`, `cron_runs`,
  `cron_event_log`), `teams.db` (`team_tasks`, `team_runs`, `team_outcomes`),
  `schedules` + `schedule_executions` + `subagent_spawn_queue` in `sessions.db`.
- **Absent in this build:** `CLINE_COMMAND_PERMISSIONS` (documented guard, zero hits).

Consequence: the docs' "CLI / SDK / Kanban only" warning on plugins, hooks and
connectors does not hold for Cline Desktop 0.0.28 — the layers are reachable. Two
things stay unverified: whether `.clineignore` is read at all (the binary points at a
`PreToolUse` hook as the real gate instead), and whether Desktop reloads any of this
without a restart.

File hooks — the executable guard layer (2026-09-15):

- Discovery: `~/Documents/Cline/Hooks`, `~/.cline/hooks`, `<ws>/.clinerules/hooks`
  (deprecated path form), `<ws>/.cline/hooks`. The file's basename (lowercased)
  must equal a hook event name; supported extensions: none, `.sh`, `.bash`,
  `.zsh`, `.js`, `.mjs`, `.cjs`, `.ts`, `.mts`, `.cts`, `.py`, `.ps1`.
- Events: `TaskStart`, `TaskResume`, `TaskCancel`, `TaskComplete`, `TaskError`,
  `PreToolUse`, `PostToolUse`, `UserPromptSubmit`, `PreCompact`,
  `SessionShutdown`. Interpreter inference: `.py` → `py -3 <file>` (fallback
  `python`), `.ts` → `bun run`, `.ps1` → powershell, everything else → `bash`.
- Protocol: event payload JSON on stdin (`hookName`, `taskId`, `workspaceRoots`,
  `tool_call {id, name, input}`, `userPromptSubmit {prompt}`, ...); the last
  JSON object on stdout is the control message. Control fields (verified in the
  bundle): `cancel: true` + `errorMessage` stops the call, `context` /
  `contextModification` appends session context, `review`, `overrideInput`,
  `systemPrompt`. Claude-Code fields (`hookSpecificOutput`,
  `permissionDecision`) do not exist in this build.
- Installed in this workspace (`.cline/hooks/`, canonical, committed):
  `PreToolUse.py` — blocks destructive shell commands and push/destructive git
  (HARD_RULES H0/H1/H2 made executable; `_scripts/trash.sh` is the allowed
  delete path); `UserPromptSubmit.py` — injects a compact ritual reminder;
  `PostToolUse.py`, `TaskStart.py`, `TaskError.py`, `SessionShutdown.py` —
  observation only. Guard log: `_memory/hooks/cline-hook.log`.
- Live-fire status: offline tests green (9 cases). Not yet proven inside a live
  Desktop session — hooks are discovered at task start, so the first new task
  in this workspace is the proof. The canary schedule doubles as a check:
  `cline-bridge-canary` probes the bridge daily at 12:00.

### Disqualified / historical (do not re-add without owner decision)

exa-mcp, tavily, duckduckgo, searxng, web-search-prime, openserp, open-websearch,
puppeteer, camoufox, obscura, lazyweb, zread, knowledge-base, codebase-memory,
memory-mcp, github, filesystem, shell, security-scanner, token-optimizer (tool recycled from tools/ 2026-09-12; stale MCP entry removed from .mcp.json 2026-09-13),
api-testing, maigret, entroly, mcp-server-dns, warp-* — removed from config or
never promoted. History and reasons: archived registry + evidence file.

### Failure Policy

- Tool error ≠ retry forever: report the real error, try the next preference
  (another server, skill, shell), and say which path produced the answer.
- A server that worked yesterday may be dead today — dates above are evidence,
  not guarantees; when in doubt, one probe call before real work.
- Windows notes: launch `npx` as `npx.cmd` from scripts; Cyrillic console is
  cp1251 (see `docs/Code.md`, Field Traps).

### Registering a New Server

Add to `~/.agents/mcp.json` → probe with one relevant real call → add a row to
the matching table above with an honest status and today's date. No other
document needs to change.
