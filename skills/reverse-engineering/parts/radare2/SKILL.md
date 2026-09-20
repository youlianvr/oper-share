---
name: radare2
description: |
  Use this skill whenever the user wants to analyze binaries with radare2/r2 from the command line, including reverse engineering, disassembly, function analysis, strings/import inspection, patching, binary diffing, hex inspection, or r2 scripting. Also use it when the user mentions PE/ELF/Mach-O/DEX/WASM files together with CLI analysis, `rabin2`, `rasm2`, `radiff2`, `r2pipe`, or asks for radare2 command help on Windows/Linux/macOS.
---

# radare2

Binary analysis skill for the `radare2` CLI. Focus is on using the command line directly for reconnaissance, analysis, targeting, export and lightweight patching, without GUI dependency.

## ACTION REQUIRED (execute immediately after reading)

1. `NOW`: Read `../field-journal/precedent-reverse.md` — confirm this skill's operations are authorized routine work
2. `NOW`: Confirm the current task matches this skill's scope
3. `NEXT`: Read `../tool-index.md`, verify tool availability and actual paths
4. `NEXT`: When tools are missing, call bootstrap — do not guess paths
5. `ACT`: Enter the first step of the "Workflow" and execute — do not stop at confirmation state

## Scope

Prioritize this skill when the user has these intents:

- Wants to use `r2` / `radare2` to analyze `exe`, `dll`, `so`, `elf`, `apk`, `dex`, `wasm` etc.
- Asks how to use `rabin2`, `rasm2`, `radiff2`, `rahash2`, `rax2`
- Needs command-line disassembly, viewing functions, strings, imports/exports, cross-references, patching
- Needs to write `radare2` batch commands, `-c` automation, or `r2pipe` scripts

If the user explicitly wants GUI reversing, Hex-Rays pseudocode, or IDA workflow, prefer `ida-reverse`. For web JS reversing, prefer `reverse-engineering`.

## Environment confirmation first

Do not assume `r2` is available. Check first:

```powershell
r2 -v
rabin2 -v
```

If not installed, check common install locations or prompt for installation.

Common Windows executables:

- `radare2.exe`
- `rabin2.exe`
- `rasm2.exe`
- `radiff2.exe`
- `rahash2.exe`
- `rax2.exe`
- `r2pm.exe`

## Built-in resources

This skill ships two resources — reuse them, don't assemble ad-hoc command sets each time.

### `scripts/recon.ps1`

Standard reconnaissance script, suitable for first-round overview analysis. Outputs:

- Basic info
- Sections
- Imports
- Exports
- Strings
- Optional `r2 -A` auto-analysis summary

Invocation:

```powershell
powershell -File "<skill-root>\radare2\scripts\recon.ps1" -TargetPath "C:\path\to\sample.exe"
```

With `r2` auto-analysis:

```powershell
powershell -File "<skill-root>\radare2\scripts\recon.ps1" -TargetPath "C:\path\to\sample.exe" -RunAnalysis
```

### `references/cheatsheet.md`

When you need more command details, common scenario templates, or need to quickly recall syntax — read this cheatsheet instead of guessing from memory.

## Known phenomena

### Occasional `.sdb` missing warning on Windows

Some PE files during `rabin2` recon may produce a warning like:

```text
ERROR: Cannot find ...\share\format\dll\*.sdb
```

If the main output still returns normally, this typically does not affect basic recon conclusions — continue analysis. Don't immediately declare analysis failed due to such incidental warnings.

## Basic principles

### 1. Recon before deep dive

Don't start with full auto-analysis. Use lightweight commands first to confirm file type, architecture, entry points, strings, import table, then decide whether to do `aaa`, `aaaa` or targeted analysis.

### 2. Prefer minimal sufficient commands

`radare2` has many commands; users typically need the shortest path:

- File info: `rabin2 -I`
- Strings: `rabin2 -z`
- Imports/exports: `rabin2 -i` / `rabin2 -E`
- Interactive analysis: `r2 <file>` then run commands

### 3. Be careful before modifying

If the user wants to patch a binary:

- Default to read-only open: `r2 <file>`
- Only use write mode when explicitly needed: `r2 -w <file>` or `oo+` in session
- Warn about risks before modifying to avoid accidental overwrite

## Common workflows

## Workflow 1: Quick reconnaissance

Suitable when you just received a binary file.

Prefer running the built-in script:

```powershell
powershell -File "<skill-root>\radare2\scripts\recon.ps1" -TargetPath "sample.exe"
```

If you only need manual minimal commands:

```powershell
rabin2 -I sample.exe
rabin2 -z sample.exe
rabin2 -i sample.exe
rabin2 -E sample.exe
```

Focus points:

- File format, bitness, architecture, platform
- Entry point address
- Suspicious strings: URLs, paths, errors, registry, command-line args
- Import functions: network, file, crypto, process injection, registry ops

## Workflow 2: Interactive function analysis

```powershell
r2 sample.exe
```

Common in-session commands:

```text
aaa          # Standard auto-analysis
afl          # List functions
iz           # List strings
iS           # List sections
is           # List symbols
s entry0     # Jump to entry point
pdf          # Disassemble current function
VV           # Visual mode (if terminal suitable)
q            # Quit
```

Notes:

- Prefer `aaa` by default, don't start with heavier `aaaa`
- If sample is large or analysis is slow, only analyze near entry point, then manually expand

## Workflow 3: Locate main / key logic

```text
afl~main
afl~sym.
iz~http
iz~error
axt <addr>
```

Approach:

- Start from `main`, entry points, string references
- Use `axt` to find who references a string or address
- After finding reference point, `s <addr>`, then `pdf`

## Workflow 4: Hex and memory viewing

```text
px 64        # 64 bytes hex from current address
pd 20        # Disassemble 20 instructions
psz          # Read string at current address
pxa          # Friendlier hex view
```

## Workflow 5: Binary patching

Only when user explicitly requests file modification:

```powershell
r2 -w sample.exe
```

Then e.g.:

```text
s 0x401000
wa nop
wa jmp 0x401050
wq
```

Common write operations:

- `wa <asm>`: write assembly
- `wx <hex>`: write raw bytes
- `wq`: write and quit

Backup original file before modifying. If user didn't mention backup, at least remind once.

## Workflow 6: Non-interactive automation

Suitable for one-shot output:

```powershell
r2 -A -q -c "afl;iz;ii;q" sample.exe
```

Common parameters:

- `-A`: auto-analysis on startup
- `-q`: quiet mode
- `-c`: execute command string

If commands are many, organize them in readable order, don't cram into unmaintainable super-long strings.

Better to use built-in recon script first, then decide if custom commands are needed.

## Common sub-tools

### `rabin2`

For static information extraction:

```powershell
rabin2 -I sample.exe   # Basic info
rabin2 -S sample.exe   # Sections
rabin2 -s sample.exe   # Symbols
rabin2 -i sample.exe   # Imports
rabin2 -E sample.exe   # Exports
rabin2 -z sample.exe   # Strings
rabin2 -zz sample.exe  # More detailed strings
```

### `rasm2`

For quick assembly/disassembly:

```powershell
rasm2 -d "9090"
rasm2 -a x86 -b 64 "xor eax, eax"
```

### `radiff2`

For comparing two binaries:

```powershell
radiff2 old.exe new.exe
radiff2 -C old.exe new.exe
```

### `rahash2`

For hashing:

```powershell
rahash2 -a md5 sample.exe
rahash2 -a sha256 sample.exe
```

### `rax2`

For base and encoding conversion:

```powershell
rax2 0x401000
rax2 4198400
rax2 -s hello
```

## Recommended analysis order

When encountering unknown sample, follow this order:

1. `rabin2 -I` for format, architecture, entry point
2. `rabin2 -z` for strings
3. `rabin2 -i` for import functions
4. If interactive analysis needed, enter `r2`
5. First `aaa`, then `afl` / `iz` / `pdf`
6. Locate key functions gradually through string references, import calls, entry flow

This order benefits from low noise, building direction quickly.

## Windows notes

- When paths contain spaces, commands must be properly quoted
- If current terminal can't find `r2`, PATH may have just been updated — open a new terminal
- Some samples need admin permissions to read, but don't proactively elevate unless user explicitly needs it
- Before dynamic debugging of suspicious samples, confirm user intent to avoid misoperation

## Output style

When the user wants actual file analysis (not just commands):

- First give recon results summary
- Then list key evidence: strings, imports, functions, addresses
- Finally give next-step suggestions or continue deeper analysis

Don't just list commands without explaining why.

## Typical request examples

### Example 1: Analyze an exe

User: `Help me see what this exe does, use radare2`

Approach:

1. Use `rabin2 -I/-z/-i`
2. Determine if `r2` is needed
3. Use `aaa`, `afl`, `pdf` to dig into entry and key string references

### Example 2: Find where a string is called

User: `Which function triggers this error string`

Approach:

1. Use `iz~keyword` to find string address
2. Use `axt <addr>` to find references
3. Jump to reference `s <addr>`, then `pdf`

### Example 3: Change a jump

User: `Change this jne to je`

Approach:

1. Confirm target address first
2. Explicitly state entering write mode
3. Use `wa je <target>` or directly `wx`
4. Disassemble again to verify after modification

## Practices to avoid

- Don't treat `radare2` as a tool with only `aaa`
- Don't open user files in write mode without explaining risks
- Don't conclude before basic recon
- Don't misroute web JS reversing to this skill; that's `reverse-engineering` scope

## References

- Command cheatsheet: `references/cheatsheet.md`
- Standard recon script: `scripts/recon.ps1`

---

## Routing context

**Upstream entry**: `skills/SKILL.md` (master control), `routing.md`
**Upstream alternative**: `ida-reverse/` (upgrade to IDA when decompilation/pseudocode needed)
**Downstream exits:**
- Need dynamic analysis → `reverse-engineering/tools-dynamic.md` (Frida/GDB)
- Need deep decompilation → `ida-reverse/`
- After finding interesting strings, need cross-references → `ida-reverse/` (IDA xref is more powerful)

**Sibling module**: `ida-reverse/` (complementary: r2 recon is fast, IDA decompilation is deep)

---

## On-Demand Bootstrap

This skill's entry scripts are connected to the unified bootstrap system. When radare2 is missing, it auto-attempts installation instead of erroring directly.

### Automation capability boundaries

| Tool | Auto-installable | Install method | Notes |
|------|:-:|---|---|
| r2 | Yes | GitHub Release ZIP (w64) | Auto-download and extract to `%USERPROFILE%\Tools\radare2\` |
| rabin2 | Yes | Same as above (included in radare2 release) | — |
| rasm2 | Yes | Same as above | — |
| radiff2 | Yes | Same as above | — |
| rahash2 | Yes | Same as above | — |
| rax2 | Yes | Same as above | — |

### Bootstrap trigger points

- `scripts/recon.ps1`: auto-calls `bootstrap-reverse.ps1` when `rabin2` or `r2` is missing

### When bootstrap fails

If auto-install fails (network down, GitHub API rate limit, etc.), script throws explicit error with manual install link.

Manual install: download `radare2-*-w64.zip` from https://github.com/radareorg/radare2/releases, extract to `%USERPROFILE%\Tools\radare2\` and ensure `bin\` directory is in PATH.


## Task completion self-check (MUST pass before claiming done)

- [ ] Did I execute every step in the workflow (not just read)?
- [ ] Did I use real tool paths based on `tool-index`?
- [ ] Did I produce reproducible evidence (commands/scripts/screenshots/report)?
- [ ] Did I complete and write back the Checklist items required by RULES?
