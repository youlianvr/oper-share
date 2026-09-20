---
name: ghidra-reverse
description: Use for free/open reverse engineering with Ghidra (headless or GUI), including decompile, cross-refs, and optional Ghidra MCP workflows when IDA is unavailable.
---

# Ghidra Reverse Engineering

## Authorization preamble

1. Confirm Ghidra is the right tool (no IDA license / open-source preference / batch headless).
2. Look up ghidra / ghidra-mcp paths; if missing, install per the manual steps.
3. Order: import sample → auto-analysis → export key function decompilations.

## Scope

- Primary RE entry when no IDA license
- Batch headless analysis / decompilation in CI
- Ghidra scripts (Java / Python Jython / PyGhidra) automation
- ghidriff pairing with binary-diff / patch-diff workflows

## Division of labor with IDA

| Need | Prefer |
|------|--------|
| Existing IDA MCP deep-dive | `ida-reverse/` |
| Open source / batch / teaching | **this skill** |
| CLI-only quick recon | `radare2/` |

## Workflow

### 1. Project and auto-analysis

```text
□ New Project → Import file → Analyze (default analyzers)
□ Record language/compiler identification and base address
□ Mark entry points, export tables, string xrefs
```

### 2. Key functions

```text
□ Work backwards from strings / imported APIs
□ Decompile window → recover algorithms
□ Rename functions/variables; write plate comments
□ When dynamic work is needed, hand off to Frida/GDB (reverse-engineering dynamic chapter)
```

### 3. Headless (batch)

```bash
# analyzeHeadless path varies by install — verify before use
analyzeHeadless /path/to/project Proj -import sample.bin -postScript ExportDecomp.py
```

### 4. MCP (if configured)

```text
□ Confirm the ghidra MCP port (commonly 8765) — never guess
□ Use MCP tools to pull decompilation / xrefs
```

## Toolchain

| Tool | Purpose | Bootstrap |
|------|---------|-----------|
| Ghidra | main decompiler | manual release / package manager |
| ghidra-mcp | AI bridge | bootstrap capability name `ghidra-mcp` |
| ghidriff | patch diffing | see `patch-diff-exploit` |

## References

- `references/ghidra-cheatsheet.md`
- `reverse-engineering/parts/ida-reverse/` `reverse-engineering/parts/radare2/` `reverse-engineering/parts/binary-diff/`

## Completion self-check

- [ ] Real Ghidra/tool paths used?
- [ ] Function addresses and renames annotated?
- [ ] Reproducible steps present?
- [ ] Checklist / journal written?
