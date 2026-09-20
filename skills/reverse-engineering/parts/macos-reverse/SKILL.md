---
name: macos-reverse
description: Use for authorized macOS and Mach-O reverse engineering including codesign, Objective-C/Swift recovery, endpoint security surfaces, and Apple platform malware analysis.
---

# macOS / Mach-O Reverse Engineering

## Authorization preamble

1. Confirm the target is macOS/Mach-O/an app bundle (iOS IPA → `mobile-reverse/`).
2. Verify tooling (jtool2 / lldb etc.).
3. Order: signature and load info → static → dynamic (lldb/Frida).

## Scope

- Mach-O executables / dylibs / frameworks
- .app bundles, LaunchAgents / Daemons
- Objective-C / Swift symbols and runtime
- Notarization/signing, Hardened Runtime, TCC-related behavior
- macOS malware static/dynamic analysis (pairs with malware-analysis)

## Workflow

### 1. Bundle and signature

```bash
file target
codesign -dv --verbose=4 target
spctl -a -vv target 2>&1
otool -L target
```

### 2. Static

```text
□ class-dump / swift-demangle / Hopper / Ghidra / IDA
□ Strings: XPC service names, TCC-sensitive APIs
□ LC_LOAD_dylib deps and rpath
```

### 3. Dynamic

```text
□ lldb / Frida
□ fs_usage / log stream observation
□ Network: pair with protocol-reverse or a proxy
```

## Toolchain

| Tool | Purpose |
|------|---------|
| otool / nm / codesign | built-in |
| Hopper / Ghidra / IDA | decompilation |
| class-dump / dsdump | ObjC |
| Frida / lldb | dynamic |
| jtool2 | Mach-O |

## References

- `references/macho-triage.md`
- `reverse-engineering/parts/mobile-reverse/` (iOS) `reverse-engineering/parts/ghidra-reverse/` `security/parts/malware-analysis/`

## Completion self-check

- [ ] Signing / Hardened Runtime state recorded?
- [ ] Address-level / symbol-level conclusions present?
- [ ] Checklist written?
