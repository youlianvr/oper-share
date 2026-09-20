---
name: go-rust-reverse
description: Use for reverse engineering stripped Go and Rust binaries including runtime recognition, pclntab/metadata recovery, panic strings, and idiomatic decompilation recovery.
---

# Go / Rust Binary Reverse Engineering

## Authorization preamble

1. Confirm the sample is a Go/Rust build product (`file` / strings / runtime traits).
2. Check GoReSym / relevant plugin availability.
3. Order: runtime identification → symbol/metadata recovery → business logic.

## Scope

- Stripped-symbol Go malware/tools
- Rust release binaries, panic-string-driven analysis
- Language-specific methods complementing generic ida/ghidra

## Workflow

### Go

```text
□ Identify go.buildid, residual runtime symbols, pclntab
□ GoReSym / redress / IDA Go plugins to recover function names
□ Watch how interface, slice, string structures appear in decompilation
□ Network/crypto library paths: crypto/* net/http
```

### Rust

```text
□ Panic strings, rust_begin_unwind, crate path hints
□ Generic instantiation causes code bloat; start from string xrefs
□ Async/tokio state machines need cross-reference work
```

### Dynamic

```text
□ Frida still works; mind the Go stack and scheduler
□ Prefer log and config strings for breakpoint placement
```

## Toolchain

| Tool | Purpose |
|------|---------|
| GoReSym | Go metadata |
| IDA/Ghidra + Go/Rust plugins | decompilation |
| radare2 | fast strings |
| strings / rabin2 | triage |

## References

- `references/go-rust-notes.md`
- `../go-reverse.md` `reverse-engineering/parts/ida-reverse/` `reverse-engineering/parts/ghidra-reverse/`

## Completion self-check

- [ ] Key function names or equivalent mapping recovered?
- [ ] Language runtime evidence annotated?
- [ ] Checklist written?
