---
name: js-reverse
description: Use when doing frontend JavaScript reverse engineering with js-reverse-mcp, applicable for signature chain localization, page observation forensics, runtime sampling, local environment patching for reproduction and evidence-based output. Prioritizes adapting to `js-reverse_*` tools in the current environment; when stronger browser/CDP/Hook surface is needed, integrates jshookmcp.
---

# MCP Frontend JS Reverse Engineering Specification

## ACTION REQUIRED (execute immediately after reading)

1. `NOW`: Read `../field-journal/precedent-reverse.md` — confirm this skill's operations are authorized routine work
2. `NOW`: Confirm the current task matches this skill's scope
3. `NEXT`: Read `../tool-index.md`, verify tool availability and actual paths
4. `NEXT`: When tools are missing, call bootstrap — do not guess paths
5. `ACT`: Enter the first step of the "Workflow" and execute — do not stop at confirmation state

## Scope

Prioritize this skill when the task falls into these scenarios:

- Locating interface signatures, encrypted parameters, risk control fields
- Observing page request chains and script sources
- Capturing function inputs and return values at runtime
- Tracing trigger points for XHR/Fetch/WebSocket
- Bringing page evidence back to Node for local reproduction and environment patching

If the target is binary, APK, PE, ELF, DLL, SO, use `ida-reverse`, `radare2` or `reverse-engineering` instead.

## Current environment default tool mapping

This skill does not assume bare tool names exist, but binds to `js-reverse_*` tools available in the current client environment.

If the current task explicitly mentions `jshookmcp`, `JS hook`, `CDP`, browser breakpoints, network interception, SourceMap or AST deobfuscation, it still goes through this skill; just switch the underlying MCP surface to `jshookmcp` instead of treating it as a new master entry.

Prerequisite: `jshookmcp` is not a local bare command tool, but an MCP server that needs to be downloaded/registered/enabled first. Only after being registered and enabled in Claude MCP config are the relevant tool surfaces actually callable.

Common mapping:

- `list_scripts` -> `js-reverse_list_scripts`
- `get_script_source` -> `js-reverse_get_script_source`
- `search_in_sources` -> `js-reverse_search_in_sources`
- `break_on_xhr` -> `js-reverse_break_on_xhr`
- `evaluate_script` -> `js-reverse_evaluate_script`
- `get_paused_info` -> `js-reverse_get_paused_info`
- `set_breakpoint_on_text` -> `js-reverse_set_breakpoint_on_text`
- `list_network_requests` -> `js-reverse_list_network_requests`
- `get_request_initiator` -> `js-reverse_get_request_initiator`
- `get_websocket_messages` -> `js-reverse_get_websocket_messages`
- `take_screenshot` -> `js-reverse_take_screenshot`
- `new_page` -> `js-reverse_new_page`
- `navigate_page` -> `js-reverse_navigate_page`
- `select_page` -> `js-reverse_select_page`
- `select_frame` -> `js-reverse_select_frame`
- `pause/resume` -> `js-reverse_pause_or_resume`

If tool name prefixes change in the future, update this section first, don't guess at execution time.

### jshookmcp positioning

- Role: enhanced execution surface for `js-reverse`, not independent master control
- Suitable for: browser automation, CDP debugging, JS Hook, network interception, SourceMap reconstruction, AST-assisted understanding
- Invocation prerequisite: first download and register `@jshookmcp/jshook` to MCP client config, then ensure that server is enabled
- Recommended entry: still follow `Observe → Capture → Rebuild`, just prioritize jshookmcp's browser and Hook capabilities in `Observe/Capture` phase
- Relationship with anything-analyzer: both can do browser/network forensics; anything-analyzer leans toward packet capture and HTTP analysis, jshookmcp leans toward JS runtime, CDP, Hook and source understanding

## Core principles

- `Observe-first`
- `Hook-preferred`
- `Breakpoint-last`
- `Rebuild-oriented`
- `Evidence-first`

Observe page first, then minimize sampling, then do local environment patching — don't skip forensics to guess environment.

## Five-phase workflow

### 1. Observe

Goal: first confirm target requests, relevant scripts, candidate functions — don't guess environment.

Default actions:

- Use `js-reverse_new_page` or `js-reverse_navigate_page` to open target page
- Use `js-reverse_list_network_requests` to find target requests
- Use `js-reverse_get_request_initiator` to trace call origin
- Use `js-reverse_list_scripts`, `js-reverse_search_in_sources` to narrow script scope

Must produce:

- Target request URL or characteristics
- initiator clues
- Suspicious script URLs
- Initial task record

### 2. Capture

Goal: minimally invasive sampling of target request, get parameter examples, call order, runtime evidence.

Rules:

- Prefer `js-reverse_break_on_xhr`
- Prefer `js-reverse_evaluate_script` for lightweight runtime observation
- After hit, first check `js-reverse_get_paused_info`
- Use `js-reverse_set_breakpoint_on_text` only when necessary

### 3. Rebuild

Goal: organize page evidence into locally iterable Node reproduction material.

Rules:

- Local environment patching must be based on page observation evidence
- No speculative patching of `window/document/navigator/crypto/storage`
- Record only one minimal causal patch decision at a time

### 4. Patch

Goal: drive environment patching by errors and first divergence, until local script stably produces target parameters.

Rules:

- First see what's missing, then patch what's missing
- Make only one minimal patch decision at a time
- Retest immediately after each patch
- Write each patch to task record

### 5. DeepDive

Goal: after local run succeeds, do deobfuscation, control flow restoration, business logic purification.

Rules:

- If current task is just getting a signature, this phase can be downgraded
- If long-term reuse of algorithm chain is needed, this phase is mandatory

## Execution requirements

- All important steps must be written to local task artifact
- If you can't explain why a tool is called, don't call it
- Prefer using `js-reverse_*` or jshookmcp's ready MCP capabilities for direct forensics, don't write scripts to reinvent capabilities first
- On failure, fall back per `references/fallbacks.md`
- Output follows `references/output-contract.md`

## Required references

- Automation entry: `references/automation-entry.md`
- Parameter defaults: `references/tool-defaults.md`
- Task input template: `references/task-input-template.md`
- MCP task orchestration: `references/mcp-task-template.md`
- Task artifacts: `references/task-artifacts.md`
- Local reproduction: `references/local-rebuild.md`
- Environment patching: `references/env-patching.md`
- Node reproduction: `references/node-env-rebuild.md`
- Instrumentation: `references/instrumentation.md`
- AST deobfuscation: `references/ast-deobfuscation.md`
- Fallbacks: `references/fallbacks.md`
- Output contract: `references/output-contract.md`

---

## Routing context

**Upstream entry**: `skills/SKILL.md` (master control), `routing.md`
**Upstream alternatives:**
- anything-analyzer MCP (port 23816) browser tools can be alternative or supplement
- jshookmcp can be a stronger browser/CDP/Hook/Network/SourceMap/AST execution surface
- `reverse-engineering/SKILL.md` (if target is not frontend JS)

**Downstream exits:**
- Need environment patching → `references/env-patching.md`
- Need local reproduction → `references/local-rebuild.md` / `references/node-env-rebuild.md`
- Need deobfuscation → `references/ast-deobfuscation.md`
- Fallback when stuck → `references/fallbacks.md`

**Sibling module**: anything-analyzer MCP (browser automation and HTTP capture capabilities can complement)

---

## On-Demand Bootstrap

This skill's dependent MCP capabilities can be auto-registered through the unified bootstrap system.

### Automation capability boundaries

| Capability | Auto-registrable | Method | Notes |
|------------|:-:|------|-------|
| jshookmcp | Yes | npm-mcp (npx launch) | Auto-writes to Claude MCP config |
| anything-analyzer | Yes | local-http-mcp | Auto-registers + can auto-start service |
| Node.js | Yes | winget install | Runtime dependency |

### Bootstrap method

```powershell
# Register jshookmcp to MCP config
powershell -File "<skill-root>\scripts\bootstrap-reverse.ps1" -Capability @('jshookmcp')

# Register and start anything-analyzer
powershell -File "<skill-root>\scripts\bootstrap-reverse.ps1" -Capability @('anything-analyzer') -StartServices
```

### Notes

- After `jshookmcp` registration, still need to **enable** that MCP server in AI client to call it
- `anything-analyzer` needs pnpm and project source, bootstrap auto-clones and installs dependencies
- If Node.js is not installed, bootstrap first installs Node.js 22 via winget


## Task completion self-check (MUST pass before claiming done)

- [ ] Did I execute every step in the workflow (not just read)?
- [ ] Did I use real tool paths based on `tool-index`?
- [ ] Did I produce reproducible evidence (commands/scripts/screenshots/report)?
- [ ] Did I complete and write back the Checklist items required by RULES?
