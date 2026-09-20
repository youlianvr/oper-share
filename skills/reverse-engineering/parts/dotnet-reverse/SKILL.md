---
name: dotnet-reverse
description: .NET / C# binary reverse engineering. Use when the target is a .NET assembly (PE header with CLR, .exe/.dll managed program), C# compilation product (including NativeAOT), red team Sharp* tools (Rubeus / SharpHound / SharpHound etc.), .NET obfuscated programs (ConfuserEx / SmartAssembly / Babel / Eazfuscator), .NET loader / info-stealer / packed malware. Prioritize dnSpyEx + de4dot; when AI direct operation is needed, integrate dnSpy MCP. Not for pure native binaries (use reverse-engineering / ida-reverse).

license: MIT
compatibility: Requires a filesystem-based code agent or CLI with shell access, Windows host preferred (dnSpyEx is Windows GUI); Linux/macOS can use ILSpy/de4dot CLI + mono/dotnet runtime.

allowed-tools: Bash Read Write Edit Glob Grep Task WebFetch WebSearch
metadata:
  user-invocable: "false"
---

# .NET / C# Reverse Engineering Specification

## ACTION REQUIRED (execute immediately after reading)

1. `NOW`: Use DIE/`file`/CLR header to confirm target is .NET managed (otherwise SWITCH to `ida-reverse/` / `reverse-engineering/`)
2. `NOW`: If suspected obfuscated → first `de4dot` to unpack, produce `*-clean.exe`, keep original sample
3. `NEXT`: dnSpyEx (or dnSpy MCP / `ilspycmd`) static: C# browsing + **IL view** for key decisions
4. `ACT`: When plaintext/C2 is needed, use dynamic debugging; when logic changes are needed, **IL patch** takes priority over C# recompilation
5. At phase end give user a 3-6 item next-step menu (including export report)

## Scope

Prioritize this skill when the task falls into these scenarios:

- Identify and reverse engineer .NET / C# compilation products (managed PE / .exe / .dll)
- Analyze red team Sharp* toolchains (Rubeus, SharpHound, SharpShell, etc.)
- Deobfuscate ConfuserEx / SmartAssembly / Babel / Eazfuscator / .NET Reactor etc. packers
- Reverse engineer .NET loader / info-stealer / RAT decryption and C2 logic
- Patch C# programs (change decisions, change constants, keygen)
- Analyze Mono/Unity managed layer before IL2CPP (note: after IL2CPP compilation it's native, use `reverse-engineering/` + seed-014)

If the target is pure native binary (C/C++/Go/Rust compiled, no CLR), use `reverse-engineering/`, `ida-reverse/` or `radare2/` instead.

## Core principles

- **Identify before acting**: first confirm it's a .NET managed program (PE header CLR + `#~` / `#Strings` stream + mscoree `_CorExeMain`), then decide to use dnSpy not IDA
- **IL over C#**: dnSpyEx's C# decompiler loses/distorts information (compiler-generated state machines, async/await, yield), key decisions and patches must switch to **IL editor**, C# view only for quick browsing
- **de4dot first**: when encountering obfuscator, first run `de4dot` to deobfuscate before static analysis, otherwise strings/control flow are all garbled
- **MCP integration**: if dnSpy MCP (`dnspy_*` tools) is registered in environment, prioritize MCP surface for decompile / IL inspection, avoid switching GUI back and forth
- **Evidence-based output**: deobfuscation products, extracted config/C2/key, patch diff all need to be saved to disk

## Toolchain mapping

| Capability | First choice | Notes |
|------------|-------------|-------|
| Decompile + debug + patch | **dnSpyEx** | Ace, only GUI with IL editor; old dnSpy is unmaintained, use Ex branch |
| Lightweight CLI / headless decompiler | **ILSpy** (`ilspycmd`) | Suitable for batch, scripting, Linux/macOS |
| Deobfuscation | **de4dot** | Default solution for ConfuserEx family, SmartAssembly etc. mainstream packers |
| Obfuscator identification | **Detect It Easy (DIE)** / **file** | First determine packer type then decide de4dot params |
| Programmatic IL manipulation | **dnlib** | Write C# scripts to batch modify metadata / string decryptors |
| AI direct operation | **dnSpy MCP** | `dnspy_decompile` / `dnspy_inspect_il` etc. tool surface |

> Prerequisite: Windows host install dnSpyEx + de4dot (choco or release); Linux/macOS use `ilspycmd` + `dotnet runtime`. See `references/sharp-tools.md` install matrix.

## Six-phase workflow

### 1. Identify (identify .NET)

Confirm target is managed program, don't analyze native PE as .NET:

```powershell
# Windows
file target.exe                       # "PE32 executable ... for MS Windows" is not enough
# Key: look for CLR
powershell -c "[System.Reflection.AssemblyName]::GetAssemblyName('target.exe')"
# Or
dnSpyEx just drag it in — if it opens, it's managed

# General
strings target.exe | grep -iE "mscoree|_CorExeMain|mscorlib|System\."
```

**.NET identification markers:**
- PE header `Data Directory[14]` (CLR Runtime Header) non-zero
- `mscoree.dll` import / `_CorExeMain` entry
- `#~`, `#Strings`, `#US`, `#GUID`, `#Blob` metadata streams
- `mscorlib` / `System.Private.CoreLib` strings

**NativeAOT exception:** compiled as native, no CLR header, but has `System.Private.CoreLib` strings and reconstructed type metadata — these go through `reverse-engineering/` (IDA/r2), this skill only provides identification hint.

### 2. Detect (detect obfuscator)

```powershell
# DIE quick identification
diec target.exe                        # Detect It Easy CLI
# Or drag into dnSpyEx, see if there are lots of garbled class names / control flow deformation
```

Common obfuscators → unpacking strategy (see `references/obfuscators.md` for details):

| Obfuscator | Characteristics | de4dot handling |
|-----------|-----------------|----------------|
| ConfuserEx (1.0.0 / 2.x) | `<module>` anti-tamper, control flow deformation, string encryption | `de4dot target.exe` usually auto-detects |
| SmartAssembly | `circular`/`string encoding`, resource compression | `de4dot target.exe` |
| Babel.NET | Method body encryption, control flow | `de4dot target.exe` |
| Eazfuscator.NET | String/resource encryption | `de4dot`, some versions need manual |
| .NET Reactor | anti-tamper + necrobit | `de4dot`, newer versions may fail need manual |

### 3. Deobfuscate

```powershell
# de4dot auto-detects most packers by default
de4dot target.exe -o target-clean.exe

# Specify type (when auto-detect fails)
de4dot --type cfze target.exe          # ConfuserEx
de4dot --type sa target.exe            # SmartAssembly

# Multi-layer obfuscation / de4dot reports unknown
de4dot --detect target.exe             # See what it identifies as
# May need to patch anti-tamper first then de4dot (see references/obfuscators.md)
```

Output: `target-clean.exe`, use it for subsequent analysis. **Keep original sample** for comparison.

### 4. Static Analyze

dnSpyEx loads deobfuscated sample:

- **C# view**: quickly browse class structure, method signatures, strings (for localization)
- **IL view**: key decisions, encryption logic, state machines must look at IL (right-click → Edit IL or IL view)
- Find entry: `Main` / `Startup` / module initializer (`Module .cctor`)
- Find key logic: search `flag`, `password`, `verify`, `check`, `encrypt`, `http`, `Config`

```text
Locate string → reverse reference → find method using it → IL view to see decision logic
```

### 5. Dynamic (dynamic debugging)

dnSpyEx debugger: attach process / start debugging, set breakpoints at key methods, observe runtime:
- Decrypted plaintext strings (many obfuscators' strings only decrypt at runtime)
- C2 addresses, config decryption results
- Exception-driven control flow (anti-debug often uses `try/catch` to hide real path)

> .NET dynamic debugging is much friendlier than native — can directly see object values, string contents. Prioritize dynamic over grinding static.

### 6. Patch (modify as needed)

```text
dnSpyEx → right-click method → Edit Method (C#) or Edit IL
  - Change decision: ldc.i4.0 → ldc.i4.1 (false→true)
  - Change constant: directly edit string/number
  - Delete check: nop out entire section
File → Save Module → replace original file
```

**IL patch reliability > C# patch**: C# recompilation may fail (missing references, syntax errors), IL editing almost never distorts. See `references/common-workflow.md`.

## Trigger scenario routing

User says these to enter this skill:
- ".NET / C# binary reverse" / "C# program decompile"
- "dnSpy analysis" / "dnSpyEx patch"
- "ConfuserEx / SmartAssembly / Babel deobfuscation / unpacking"
- "Sharp* tools analysis" (Rubeus / SharpHound / SharpShell)
- ".NET malware / loader / info-stealer reverse"
- "C# program patch / keygen / modify decision"

## When to switch out

- IL2CPP compiled Unity game → `reverse-engineering/` + `seed-014_unity-il2cpp-reverse.md` (IL2CPP is native, don't use dnSpy)
- NativeAOT product → `reverse-engineering/` (same, native)
- Pure native PE (no CLR) → `reverse-engineering/` / `ida-reverse/`
- Need symbol/function batch migration to another version → `binary-diff/`
- Need to draw attack path / call chain diagram → `diagram-generator/`

## Routing context

**Upstream entry**: `skills/SKILL.md` (master control), `routing.md`
**Downstream exits:**
- IL2CPP / NativeAOT (native) → `reverse-engineering/`
- Deep native .so/.dll analysis → `ida-reverse/` / `radare2/`
- Need AI to directly operate dnSpy → register and integrate dnSpy MCP (see `references/sharp-tools.md`)

**Sibling modules:**
- `reverse-engineering/languages-compiled.md` (.NET intro points to this module)
- `apk-reverse/` (Xamarin/MAUI Android reverse can switch back to this module for C# layer)

## Reference docs

- [references/obfuscators.md](references/obfuscators.md) — ConfuserEx / SmartAssembly / Babel / Eazfuscator / .NET Reactor deobfuscation details + anti-tamper bypass
- [references/common-workflow.md](references/common-workflow.md) — Complete workflow, IL patch reliability, string decryptor extraction, state machine identification
- [references/sharp-tools.md](references/sharp-tools.md) — Red team Sharp* tools analysis, tool install matrix, dnSpy MCP integration, community resource index

## Task completion self-check

- [ ] Confirmed CLR / managed identity (or already SWITCHED out of this skill)?
- [ ] Obfuscated sample de4dot'd / equivalent deobfuscated before deep analysis?
- [ ] Key logic verified in IL view (not just C# pseudocode)?
- [ ] Products (clean sample / config / patch diff) saved to disk and reproducible?
- [ ] Provided next-step menu or report exit?
