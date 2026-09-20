# Lesson: MCP in Freebuff Desktop — How to Fix Properly (2026-08-15)

> Runbook for "future self." Scenario: MCP tools (`<server>__<tool>`) are not in
> the session, even though `~/.agents/mcp.json` is valid and checkers passed before.
> Full canon: `knowledge/findings/2026-08-15-mcp-retroactive-bridge.md` +
> `knowledge/findings/2026-08-14-freebuff-mcp-orchestrator-patch.md`.

## How It Works (Minimum to Remember)

- Desktop runtime builds the agent SYNTHETICALLY: `CodebuffHarness.runTurn` →
  `client3.run({agent: threadAgentDefinition(...)})` — `~/.agents/*.ts` templates
  are NOT involved in this path (loaded by `loadLocalAgents`, but not for desktop runtime).
- `threadAgentDefinition` is called on EVERY turn. If it doesn't carry `mcpServers`,
  the agent's zod schema gives default `{}` → `getMCPToolData` gets empty list →
  MCP tools are completely absent, SILENTLY (no errors in UI).
- The patch (2026-08-15) hangs `mcpServers: desktopMcpServers()` in
  `threadAgentDefinition`; the helper re-reads `~/.agents/mcp.json` every turn.
  New server → new config hash → fresh client → tools visible on NEXT
  turn of a live thread. Retro-loading.

## Diagnostics (Strictly in This Order)

1. **Log first, then code.** `grep -n "mcp-bridge\|Failed to load tools from MCP"`
   `C:/Users/pc/AppData/Roaming/Freebuff/logs/orchestrator-stderr.log`.
   `[mcp-bridge] failed to load ...` = helper fell and silently returned `{}` — this is
   the root, no need to dig into code further.
2. `python _scripts/check-freebuff-mcp-patch.py` — bridge markers + retro-wiring
   (`function desktopMcpServers`, `mcpServers: desktopMcpServers()`).
3. **Verify the process was actually restarted AFTER file edit:**
   `powershell Get-CimInstance Win32_Process -Filter "Name='bun.exe'" | Select CreationDate,CommandLine`
   vs `stat -c '%y' <orchestrator.js>`. Old process = old code in memory,
   no matter how many file edits.
4. Helper in isolation: extract `desktopMcpServers` from bundle → run in bun with
   same imports. Cheap and catches all traps below BEFORE restart.

## Traps We've Already Fallen Into (Don't Step Again)

1. **`fs12` is `fs/promises`!** In the bundle `import { promises as fs12 } from "fs"` —
   there is NO `readFileSync`. For synchronous reading use namespace alias:
   `fs4` (`import * as fs4 from "fs"`) or any other alias that actually
   uses `.readFileSync(` in the bundle. Check the import line, not the name.
2. **Escaping gets eaten by layers.** Editing bundle via heredoc/JSON:
   `\s` → `s` in JS string (regex silently breaks), `\\` lost at each layer.
   Rule: write patches as files (write_file), NOT inline-heredoc with
   backslashes; after writing EXTRACT code back from file and run it — don't
   trust what you "intended to write."
3. **try/catch in helper swallows everything** (ReferenceError, TypeError) and
   returns `{}` with one console.error. That's why step 1 of diagnostics is the log.
4. **Bridge markers ≠ working wiring.** Two `mcpServers: agentTemplate.mcpServers`
   can be in place, but `threadAgentDefinition` without mcpServers → schema gives `{}`
   → silence. Old checker didn't see this — now it does (retro-wiring markers).
5. **Restart is mandatory after every bundle edit** — code is already in memory.
   One restart = one verification cycle. Run helper in bun first, then ask
   for restart.
6. **zod strictObject:** stdio record = only `{type?, command, args?, env?}`,
   remote = `{type? http|sse, url, params?, headers?}`. Any extra key drops
   agent validation. Check mcp.json conformance with script before edits.
7. **`read_timeout_seconds` in mcp 1.26.0 expects `timedelta`, not number** (client
   `mcp-call.py`), and `npx` on Windows = `npx.cmd`.

## What to Use Instead of "Fix and Restart Blindly"

- **Right now, without restart:** `python _scripts/mcp-call.py <server> <tool> [json-args]`
  — official SDK client, any stdio server from config can be called from a live
  session. These are not native `server__tool` tools, but working capability.
- **Natively:** patch in `threadAgentDefinition` (see canon). After restart —
  retro-loading: mcp.json changes are picked up by live threads on next turn.
- **Honesty:** "patch on disk" ≠ "working in session." Labels: `CONFIGURED` /
  `VERIFIED-LIVE` (rules in `docs/MCPRuntime.md`). Only advance label after
  a real successful call in the current session.

## After Freebuff Desktop Update (Overwrites resources/)

1. `python _scripts/check-freebuff-mcp-patch.py` → FAIL = reapply by meaning
   (anchors: `function threadAgentDefinition`, `mcpServers: desktopMcpServers()`),
   backup before editing.
2. Grep stderr log for `[mcp-bridge]`.
3. Check process mtime vs file after restart.
