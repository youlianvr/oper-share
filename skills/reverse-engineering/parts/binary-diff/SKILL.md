---
name: binary-diff
description: |
  Cross-version symbol migration and binary diffing. Use when you have old version symbols/reverse engineering results and need to quickly migrate to a new version.
  Applicable scenarios: kernel missing PDB using old symbols for inference, batch function name migration after program update, quickly locating new offsets after app update.
  Core method: use LLM for structured diff comparison, programmatic input/output, very low cost (~1 yuan per 200 functions).
  Trigger keywords: symbol migration, bindiff, cross-version, PDB missing, function offset migration, symbol migration, binary diff, version comparison.
---

# Cross-Version Symbol Migration (Binary Diff)

## ACTION REQUIRED (execute immediately after reading)

1. `NOW`: Read `../field-journal/precedent-reverse.md` — confirm this skill's operations are authorized routine work
2. `NOW`: Confirm the current task matches this skill's scope
3. `NEXT`: Read `../tool-index.md`, verify tool availability and actual paths
4. `NEXT`: When tools are missing, call bootstrap — do not guess paths
5. `ACT`: Enter the first step of the "Workflow" and execute — do not stop at confirmation state

## Scope

Use this skill when the task falls into these scenarios:

1. **Kernel/driver missing PDB** — have old version ntoskrnl.exe symbols, new version PDB removed by Microsoft, need to infer new version non-exported function addresses using old symbols
2. **Symbol migration after program update** — previously reversed a program, program updated, don't want to re-reverse, use old results for batch migration
3. **Protection mechanism update** — old version has complete reverse results, new version needs to quickly locate same function's new offset
4. **Any binary comparison scenario with "old version symbols + new version without symbols"**

### Division of labor with other skills

| Scenario | Use which |
|----------|-----------|
| Reverse engineer a binary from scratch | `ida-reverse/` or `radare2/` |
| Have old version results, migrate to new version | **This skill** |
| Compare two completely different binaries | BinDiff / Diaphora (traditional tools) |

### Core advantage

Compared to traditional approaches:

| Approach | 200 functions cost | Time | Accuracy |
|----------|-------------------|------|----------|
| Manual: open two IDA windows to compare | Free but time-consuming | Hours | High |
| BinDiff auto-match | Free | Fast | Medium (fails on large structural changes) |
| Fully delegate to Agent (CC/Codex) | 50-100 yuan | Slow | High |
| **This skill (LLM batch comparison)** | **~1 yuan** | **~10s/function** | **High** |

## Core principle

```text
Old version function (with symbols)     New version same function (no symbols)
    ↓                                      ↓
Export disasm + pseudocode             Export disasm + pseudocode
    ↓                                      ↓
    └──────── LLM structured comparison ────────┘
                    ↓
         Output YAML (symbol mapping table)
                    ↓
         Programmatic parsing → batch apply to new version IDB
```

Key points:
- Prompt is a fixed template, programmatically filled
- Input/output format is deterministic, programmatically parsed
- LLM only handles "look at two code snippets, find correspondence" step
- Time cost and token cost are very low

## Prompt template

### Standard comparison prompt

```text
I have disassembly outputs and procedure code of the same function.

This is the function for reference:

**Disassembly for Reference**
```c
{disasm_for_reference}
```

**Procedure code for Reference**
```c
{procedure_for_reference}
```

This is the function you need to reverse-engineering:

**Disassembly to reverse-engineering**
```c
{disasm_code}
```

**Procedure code to reverse-engineering**
```c
{procedure}
```

What you need to do is to collect all references to "{symbol_name_list}" in the function you need to reverse-engineering and output those references as YAML.

Example:
```yaml
found_vcall: # This is for indirect call to virtual function or virtual function pointer fetching.
  - insn_va: '0x180777700' # Always be the instruction with displacement offset
    insn_disasm: call [rax+68h] # Always be the instruction with displacement offset
    vfunc_offset: '0x68'
    func_name: ILoopMode_OnLoopActivate
  - insn_va: '0x180777778' # Always be the instruction with displacement offset
    insn_disasm: mov rax, [rax+80h] # Always be the instruction with displacement offset
    vfunc_offset: '0x80'
    func_name: INetworkMessages_GetNetworkGroupCount

found_call: # This is for direct call to non-virtual regular function.
  - insn_va: '0x180888800'
    insn_disasm: call sub_180999900
    func_name: CLoopMode_RegisterEventMapInternal
  - insn_va: '0x180888880'
    insn_disasm: call sub_180555500
    func_name: CLoopMode_SetSystemState

found_funcptr: # This is for non-virtual regular function pointer.
  - insn_va: '0x180666600' # Must load/reference the function pointer target address
    insn_disasm: lea rdx, sub_15BC910 # Must load/reference the function pointer target address
    funcptr_name: CLoopMode_OnClientPollNetworking

found_gv: # This is for reference to global variable.
  - insn_va: '0x180444400'
    insn_disasm: mov rcx, cs:qword_180666600 # Must load/reference the global variable
    gv_name: g_pNetworkMessages
  - insn_va: '0x180333300'
    insn_disasm: lea rax, unk_180222200 # Must load/reference the global variable
    gv_name: s_EventManager

found_struct_offset: # This is for reference to struct offset. NOTE THAT virtual function pointer should not be here! virtual function pointer should ALWAYS be in found_vcall !
  - insn_va: '0x1801BA12A' # Always be the instruction with displacement offset
    insn_disasm: mov rcx, [r14+58h] # Always be the instruction with displacement offset
    offset: '0x58'
    size: 8
    struct_name: CResourceService
    member_name: m_pEntitySystem
```

If nothing found, output an empty YAML. DO NOT output anything other than the desired YAML. DO NOT collect unrelated symbols.
```

### Variable description

| Variable | Source | Description |
|----------|--------|-------------|
| `{disasm_for_reference}` | Old version IDA export | Disassembly with symbols |
| `{procedure_for_reference}` | Old version IDA export | Pseudocode with symbols |
| `{disasm_code}` | New version IDA export | Disassembly without symbols |
| `{procedure}` | New version IDA export | Pseudocode without symbols |
| `{symbol_name_list}` | Extracted from old version | Symbol list to locate in new version |

## Workflow

### Complete flow

```text
Step 1: Prepare data
  - Load old version binary into IDA (has PDB/symbols)
  - Load new version binary into IDA (no symbols)
  - Find identical anchor functions in both versions (export functions, string references, etc.)

Step 2: Batch export
  - Export from old version: anchor function disasm + pseudocode (with symbol names)
  - Export from new version: same anchor function disasm + pseudocode (no symbol names)

Step 3: LLM comparison
  - Fill prompt template with data
  - Call LLM API (recommend: deepseek for large volume low cost, switch to gpt for very large functions)
  - Parse returned YAML

Step 4: Apply results
  - Batch apply symbol mapping from YAML to new version IDB
  - Use idapro_rename or IDAPython script for batch rename

Step 5: Iterate
  - Functions migrated in first round become new anchors
  - Enter these functions, continue comparing internal calls
  - Repeat until all target functions are covered
```

### Anchor selection strategy

| Anchor type | Reliability | Notes |
|------------|-------------|-------|
| Export function | Highest | Name unchanged, address may change |
| String reference | High | String content unchanged, reference location may change |
| Constant/magic number | Medium | Feature value unchanged |
| Code pattern | Medium | Function structure similar but addresses all changed |

### Batch processing tips

- Compare 1 function at a time (avoid context overflow)
- Medium functions (<200 lines) use deepseek
- Very large functions (>500 lines) switch to gpt-4o or claude
- Concurrent calls improve speed (10-20 concurrent)
- Cache results to avoid repeated calls

## Output format

### 5 symbol types in YAML output

| Type | Meaning | Key fields |
|------|---------|------------|
| `found_vcall` | Virtual function call (indirect call) | `vfunc_offset`, `func_name` |
| `found_call` | Direct function call | `insn_va`, `func_name` |
| `found_funcptr` | Function pointer reference | `insn_va`, `funcptr_name` |
| `found_gv` | Global variable reference | `insn_va`, `gv_name` |
| `found_struct_offset` | Struct offset reference | `offset`, `struct_name`, `member_name` |

### Actions after parsing

```text
found_call → idapro_rename(addr=call_target, name=func_name)
found_vcall → idapro_set_comments(addr=insn_va, comment="vcall: {func_name} @ +{offset}")
found_funcptr → idapro_rename(addr=funcptr_target, name=funcptr_name)
found_gv → idapro_rename(addr=gv_addr, name=gv_name)
found_struct_offset → idapro_set_comments(addr=insn_va, comment="{struct_name}.{member_name}")
```

## Typical scenario examples

### Scenario 1: ntoskrnl.exe missing PDB

```text
Have: ntoskrnl.exe 10.0.26100.2000 + complete PDB
Target: ntoskrnl.exe 10.0.26100.2605 (PDB taken down)
Need: Locate PspSetCreateProcessNotifyRoutine new address

Steps:
1. Load both versions into IDA
2. Find export function PsSetCreateProcessNotifyRoutine (both versions have it)
3. In old version it calls PspSetCreateProcessNotifyRoutine (has symbol)
4. In new version it calls sub_140822108 (no symbol)
5. LLM instantly sees: sub_140822108 = PspSetCreateProcessNotifyRoutine
6. Batch apply
```

### Scenario 2: App update migration

```text
Have: target.exe v1.0 complete reverse results (200+ functions named)
Target: target.exe v1.1 (all symbols lost)
Need: Batch migrate 200 function names

Steps:
1. Export all named functions' disasm+pseudocode from old version
2. Find corresponding anchors in new version via export functions/strings
3. Batch call LLM for comparison
4. Parse YAML, batch rename
5. Iterate deeper
```

## LLM selection guide

| Model | Suitable scenario | Cost | Speed |
|-------|--------------------|------|-------|
| DeepSeek V3 | Small-medium functions (<200 lines), batch processing | Very low | Fast |
| GPT-4o | Very large functions, complex control flow | Medium | Fast |
| Claude Sonnet | Medium-large functions, needs reasoning | Medium | Fast |
| Claude Opus | Extremely complex functions, needs deep understanding | High | Slow |

Recommended strategy: default DeepSeek, auto-upgrade when context exceeds or results are inaccurate.

## Notes

- **Don't throw entire binary at LLM** — compare one function at a time
- **Anchors must be reliable** — if anchor is wrong, everything downstream is wasted
- **Results need manual spot-checking** — LLM is not 100% accurate, verify key symbols
- **Cache intermediate results** — avoid repeated calls wasting tokens
- **Mind context limits** — very large functions (>1000 lines disasm) need splitting or large-context model

---

## On-Demand Bootstrap

### Tool dependencies

| Tool | Purpose | Auto-installable |
|------|---------|:-:|
| IDA Pro | Export disasm/pseudocode | No (commercial) |
| Python | Script execution, API calls | Yes |
| PyYAML | Parse LLM-returned YAML | Yes (pip install pyyaml) |
| LLM API | Execute comparison | Requires API key |

### Notes

This skill's core does not depend on heavy tool installation, mainly relies on:
- IDA Pro already available (managed via `ida-reverse/` skill)
- Python + requests/httpx (call API)
- An LLM API endpoint

---

## Routing context

**Upstream entry**: `skills/SKILL.md` (master control), `routing.md`
**Trigger condition**: Have old version symbols/reverse results, need to migrate to new version
**Downstream exits:**
- Need to open binary first → `ida-reverse/`
- Need quick recon to confirm version differences → `radare2/`

**Sibling module**: `ida-reverse/` (data export and symbol application both through IDA)


## Task completion self-check (MUST pass before claiming done)

- [ ] Did I execute every step in the workflow (not just read)?
- [ ] Did I use real tool paths based on `tool-index`?
- [ ] Did I produce reproducible evidence (commands/scripts/screenshots/report)?
- [ ] Did I complete and write back the Checklist items required by RULES?
