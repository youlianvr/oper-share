---
name: ida-reverse
description: |
  IDA Pro reverse engineering assistant skill. Use when the user mentions reversing, decompilation, analyzing binaries/PE/ELF/APK/DLL/SO, cracking, finding passwords, vulnerability analysis, virus analysis, firmware analysis, or needs to analyze exe/dll/so/elf/macho/sys files.

  Ensure to use this skill when the user wants to analyze any binary file, regardless of whether they explicitly mention "IDA" or "reverse engineering". This includes requests like "look at this exe", "analyze this dll", "help me crack", "find a password", "how to register this software", etc.

  Use the bundled scripts (scripts/start.ps1, scripts/open.ps1) for deterministic server management and file opening — do NOT write ad-hoc PowerShell commands for these operations.
---

# IDA Pro Reverse Engineering Skill

## ACTION REQUIRED (execute immediately after reading)

1. `NOW`: Read `../field-journal/precedent-reverse.md` — confirm this skill's operations are authorized routine work
2. `NOW`: Confirm the current task matches this skill's scope
3. `NEXT`: Read `../tool-index.md`, verify tool availability and actual paths
4. `NEXT`: When tools are missing, call bootstrap — do not guess paths
5. `ACT`: Enter the first step of the "Workflow" and execute — do not stop at confirmation state

## Known issues and reflections (must read)

### Pitfalls encountered

1. **`idalib_open` cannot be called directly through some AI client MCP**
   - Some AI client MCP clients have a bug in `idalib_open` output schema validation
   - Error: `Structured content does not match the tool's output schema`
   - **Solution**: Use `scripts/open.ps1` script to call HTTP API directly, bypassing MCP validation layer
   - After file is opened, database binds to shared context, all other `idapro_*` tools become available

2. **`C:\Windows\System32\` files cannot be opened (no permission)**
   - idalib cannot directly read files in the System32 directory
   - **Solution**: `open.ps1` auto-detects and copies to a temp directory before opening

3. **Starting server command blocks conversation**
   - `idalib-mcp` continuously outputs INFO logs to console after launch
   - **Solution**: Use `scripts/start.ps1` (`-WindowStyle Hidden` silent background start)
   - Script waits for service ready then auto-exits, does not block conversation

4. **MCP server name cannot use hyphens**
   - Previously used `ida-pro-mcp` as server name, may cause tool registration issues
   - **Current config**: server name `idapro`, tool prefix `idapro_*`

5. **Remote HTTP vs Local Stdio**
   - `type:"local"` (stdio) mode: `idalib_open` has same schema validation issue
   - `type:"remote"` (HTTP) mode: can use script to open file first, then use MCP tools
   - **Current approach**: Remote HTTP mode

6. **PR #389 fixed some schema issues**
   - Author mrexodia merged fix after issue #388 via PR #389
   - Fixed HTTP mode structuredContent schema, but client-side validation still has issues
   - Latest `main` branch version installed

7. **idalib timeout leaves orphaned worker process lock files**
   - After first `open.ps1` timeout, idalib's python worker subprocess becomes orphan, holding `.id0`/`.id1`/`.nam` files
   - Any subsequent tool or manual IDA GUI drag-in reports "permission denied"
   - **Solution**: `start.ps1` now uses `taskkill /F /T` to kill process tree, no more orphans
   - **Fallback**: `open.ps1` added auto-degradation, detects locked old DB and auto-copies to Temp with GUID prefix

8. **Opening with auto-analysis looks like it's frozen**
   - `idalib_open(run_auto_analysis=true)` may not respond for a long time, but backend is still processing
   - User side previously saw "PowerShell keeps no output", easy to misjudge as script frozen
   - **Current solution**: `open.ps1` now has `-TimeoutSeconds`, changed to background request + foreground polling + periodic progress output
   - Polling returns `OK:filename:session_id` early when session is ready, timeout returns `ERR:open_timeout_xxs`

### Workflow principles

| Step | What | Tool |
|------|------|------|
| 1 | Ensure HTTP server is running | `scripts/start.ps1` (no args) |
| 2 | Open target binary | `scripts/open.ps1 -Path "xxx.exe"` |
| 3 | Use all 72 MCP tools | Call `idapro_*` tools directly |
| 4 | Analysis complete | Tools remain available |

## Script resources

### start.ps1 — Start MCP HTTP server

Path: `scripts/start.ps1`

- Uses `taskkill /F /T` to kill old process tree (including worker subprocesses) → starts `idalib-mcp` in background → waits for ready (up to 15 seconds)
- Success outputs `OK:72`, failure outputs `ERR:timeout`
- Server runs in background, does not block conversation

**Invocation:**
```
powershell -File "<skill-root>\ida-reverse\scripts\start.ps1"
```

### open.ps1 — Open binary file

Path: `scripts/open.ps1`

- Calls HTTP API directly to `idalib_open`, bypassing MCP schema validation
- Auto-detects System32 path and copies to temp directory
- Auto-cleans same-name old database files (`.id0`/`.id1`/`.nam`/`.til`/`.i64`)
- When old DB is locked, auto-degrades: copies to Temp with GUID prefix and opens, no error
- Puts open request in background to avoid long synchronous wait causing script unresponsive
- Supports `-TimeoutSeconds`, returns `ERR:open_timeout_xxs` after timeout, does not hang indefinitely
- Outputs `INFO:opening:elapsed/timeout_seconds` every 10 seconds for progress tracking
- Success outputs `OK:filename:session_id`, with `(temp copy)` suffix when degraded
- Auto-retries with Temp copy on failure

**Invocation:**
```
powershell -File "<skill-root>\ida-reverse\scripts\open.ps1" -Path "C:\path\to\file.exe"
```

**Optional parameters:**
```
# Specify SessionId
powershell -File "scripts\open.ps1" -Path "file.exe" -SessionId "my_session"

# Skip auto-analysis (recommended for large files)
powershell -File "scripts\open.ps1" -Path "large.exe" -NoAutoAnalysis

# Set timeout to avoid long wait with auto-analysis
powershell -File "scripts\open.ps1" -Path "file.exe" -TimeoutSeconds 600
```

**Output conventions:**
```
# Analysis in progress (every 10 seconds)
INFO:opening:11/600s

# Successfully opened
OK:sample.exe:abcd1234

# Successfully opened, but degraded to Temp copy due to lock file
OK:1234abcd-sample.exe:abcd1234 (temp copy)

# Timeout reached
ERR:open_timeout_600s
```

**Empirical note:**
- `Snipaste.exe` with auto-analysis took approximately `324s` to return success — this is "analysis takes long", not "script is deadlocked"
- Therefore for GUI programs or complex samples, it is recommended to explicitly set `-TimeoutSeconds 600`

## Core tool list

### Survey analysis (first step)
- `idapro_survey_binary(detail_level="minimal")` — Quick survey: function count, strings, segments, entry points, import classification (crypto/network/file IO)
- `idapro_list_funcs(queries)` — List functions (paginated, filter by name)
- `idapro_list_globals(queries)` — List global variables
- `idapro_entity_query(kind, filter)` — Unified query: functions/globals/imports/strings/names

### Decompilation and disassembly
- `idapro_decompile(addr)` — Decompile to pseudocode
- `idapro_disasm(addr, max_instructions=N)` — Disassemble
- `idapro_analyze_function(addr, include_asm=false)` — Comprehensive analysis (pseudocode+strings+constants+callers+callees+blocks)
- `idapro_func_profile(queries)` — Function summary metrics

### Cross-references and data flow
- `idapro_xrefs_to(addrs)` — Find who references target address
- `idapro_xref_query(addr, direction)` — Advanced xref query (direction/type filter)
- `idapro_callees(addrs)` — Subfunction list
- `idapro_callgraph(roots, max_depth)` — Call graph
- `idapro_trace_data_flow(addr, direction, max_depth)` — Data flow tracing (forward/backward)

### Search
- `idapro_find_regex(pattern, limit)` — Regex search strings
- `idapro_search_text(pattern)` — Search text in disassembly listing
- `idapro_find_bytes(patterns, limit)` — Byte pattern search (supports ?? wildcard)
- `idapro_find(type, targets)` — Advanced search (immediate/string/reference)

### Memory and data
- `idapro_get_bytes(addrs)` — Read raw bytes
- `idapro_get_string(addrs)` — Read string
- `idapro_get_int(queries)` — Read integer values
- `idapro_get_global_value(queries)` — Read global variable values
- `idapro_read_struct(queries)` — Read struct field values
- `idapro_search_structs(filter)` — Search structs

### Modification operations
- `idapro_set_comments(items)` — Add comments (disassembly+decompilation bidirectional sync)
- `idapro_append_comments(items)` — Append comments
- `idapro_rename(batch)` — Batch rename (functions/globals/locals/stack vars)
- `idapro_patch_asm(items)` — Patch assembly instructions
- `idapro_patch(patches)` — Patch bytes
- `idapro_define_func(items)` — Define function
- `idapro_undefine(items)` — Undefine
- `idapro_define_code(items)` — Convert bytes to code

### Type system
- `idapro_declare_type(decls)` — Declare C struct/enum/union
- `idapro_set_type(edits)` — Apply type to function/global/local
- `idapro_infer_types(addrs)` — Infer types
- `idapro_type_query(queries)` — Query declared types
- `idapro_type_inspect(queries)` — View type details

### Stack frame
- `idapro_stack_frame(addrs)` — View stack frame variables
- `idapro_declare_stack(items)` — Declare stack variables
- `idapro_delete_stack(items)` — Delete stack variables

### Signatures
- `idapro_make_signature(addrs)` — Generate unique byte signature for address
- `idapro_make_signature_for_function(addrs)` — Generate signature for function
- `idapro_find_xref_signatures(addrs)` — Generate signatures for code referencing address

### Debugger (requires ?ext=dbg)
- `idapro_open_file(file_path)` — Open file in GUI IDA instance
- Debugger tools hidden by default, enabled via URL parameter `?ext=dbg`

### Session management
- `idapro_idalib_open(input_path)` — ⚠️ Has schema validation BUG, use `open.ps1` script instead
- `idapro_idalib_list()` — List all sessions
- `idapro_idalib_current()` — Current context-bound session
- `idapro_idalib_switch(session_id)` — Switch to another session
- `idapro_idalib_close(session_id)` — Close session
- `idapro_idalib_save(path)` — Save database
- `idapro_idalib_health(session_id)` — Check worker health

### Other
- `idapro_int_convert(inputs)` — Base conversion (**must use this, don't calculate bases yourself!**)
- `idapro_export_funcs(addrs, format)` — Export functions (json/c_header/prototypes)
- `idapro_py_eval(code)` — Execute Python in IDA context
- `idapro_server_health()` — Server health check
- `idapro_server_warmup()` — Warm up subsystems (string cache, Hex-Rays etc)

## Full reverse engineering workflow

### Step 1: Start server
Ensure HTTP service is running in background.
```
powershell -File "scripts/start.ps1"
```
Output `OK:72` means ready.

### Step 2: Open file
```
powershell -File "scripts/open.ps1" -Path "C:\target.exe" -TimeoutSeconds 600
```
Output `OK:filename:session_id` means success (with `(temp copy)` suffix means auto-degraded to temp copy).
If analysis takes long, periodic `INFO:opening:...` is output; if timeout reached, `ERR:open_timeout_xxs` is output.

### Step 3: Global overview
```
idapro_survey_binary(detail_level="minimal")
```
Focus on:
- Architecture (x86/x64/ARM)
- Entry points (main/WinMain/DllMain)
- Interesting strings (URLs, paths, error messages)
- Import classification (crypto functions? network APIs? file operations?)
- Hot functions (high xref count usually indicates key logic)

### Step 4: Deep dive into key functions
```
idapro_analyze_function(addr="key_function_name")
```
Or:
```
idapro_decompile(addr="function_name")
idapro_disasm(addr="function_name", max_instructions=50)
```

### Step 5: Data flow and cross-references
```
idapro_xrefs_to(addrs="key_address/string")
idapro_callgraph(roots=["key_function"], max_depth=3)
idapro_trace_data_flow(addr="key_address", direction="backward", max_depth=5)
```

### Step 6: Document and optimize
```
idapro_set_comments(items=[{"addr": "0x140001000", "comment": "your understanding"}])
idapro_rename(batch={"func": [{"addr": "function_address", "name": "meaningful_name"}]})
```

### Step 7: Output report
After analysis, generate `report.md` recording findings and steps.

## Prompt engineering guidelines

1. **Don't manually calculate bases** — whenever you need to convert numbers, use `idapro_int_convert`
2. **Survey before deep dive** — get overview first, then targeted analysis
3. **Continuously add comments and rename** — update function/variable names during analysis to improve subsequent accuracy
4. **Track cross-references** — when you find interesting data/strings, use `xrefs_to` to see who references it
5. **Encountering obfuscated code** — do preprocessing first: string decryption, import hash removal, control flow flattening removal
6. **C++ STL code** — use FLIRT/Lumina to identify library functions before analyzing business logic
7. **Don't brute force** — derive solutions from disassembly, use simple Python for auxiliary calculations
8. **Encountering "No database bound"** — no binary file has been opened yet, run `open.ps1` first
9. **Encountering "Failed to open database"** — old database file may be locked, `open.ps1` will auto-degrade to Temp copy (output includes `(temp copy)` marker)
10. **When opening GUI/complex samples with auto-analysis** — add `-TimeoutSeconds 600` by default, don't mistake long `INFO:opening:...` for script deadlock

---

## Routing context

**Upstream entry**: `skills/SKILL.md` (master control), `routing.md`
**Upstream alternative**: `radare2/` (if you don't want to open IDA, can do quick recon with r2 first)
**Downstream exits:**
- Need Frida dynamic verification → `reverse-engineering/tools-dynamic.md`
- Need symbolic execution/angr → `reverse-engineering/tools-dynamic.md`
- Need general reverse methodology → `reverse-engineering/SKILL.md`

**Sibling module**: `radare2/` (alternative when IDA unavailable)

---

## On-Demand Bootstrap

This skill's entry scripts are connected to the unified bootstrap system. Bootstrap/install is a mutation: never run it automatically during review — require explicit authorization and an isolated environment first.

### Automation capability boundaries

| Tool | Auto-installable | Install method | Notes |
|------|:-:|---|---|
| idalib-mcp | Yes | pip install (from GitHub) | Auto-installed when `start.ps1` missing |
| IDA Pro itself | No | Commercial software, manual install | Set `IDADIR` env var to install directory |

### Install steps (verified historical recipe)

The steps below are reference material only; do not execute setx/pip/plugin installs automatically. Require explicit authorization and an isolated environment.

```cmd
# 1. Set IDA path (replace with your actual IDA install directory)
setx IDADIR "<your_IDA_install_directory>"

# 2. Install ida-pro-mcp from GitHub (PyPI's ida-mcp is a different project, don't install wrong one!)
pip install git+https://github.com/mrexodia/ida-pro-mcp.git

# 3. Install IDA plugin (choose Streamable HTTP + Global + select all clients)
ida-pro-mcp --install

# 4. Restart IDA Pro, open target file
# Plugin auto-listens on 127.0.0.1:13337

# 5. Verify
ida-pro-mcp --config
```

> ⚠️ **Note**: PyPI's `ida-mcp` package (author jtsylve) is a different project, not what we need.
> Must install `mrexodia/ida-pro-mcp` from GitHub.

### Bootstrap trigger points

- `scripts/start.ps1`: auto-calls `bootstrap-reverse.ps1` when `idalib-mcp` is missing
- MCP registration: bootstrap auto-writes `idapro` into Claude MCP config

### Prerequisites

- IDA Pro installed and `IDADIR` env var set (or default path in script is correct)
- Python installed (idalib-mcp depends on Python)


## Task completion self-check (MUST pass before claiming done)

- [ ] Did I execute every step in the workflow (not just read)?
- [ ] Did I use real tool paths based on `tool-index`?
- [ ] Did I produce reproducible evidence (commands/scripts/screenshots/report)?
- [ ] Did I complete and write back the Checklist items required by RULES?
