---
name: thick-client
description: Use for authorized security testing of desktop thick clients including local storage, update channels, IPC, traffic, and client-side trust boundaries.
---

# Thick Client Security Testing

## Authorization preamble

1. Confirm the target is a **desktop thick client** (Win/macOS/Linux GUI or service companion), not plain web.
2. Open a case; record installer provenance and test accounts in scope.
3. Tools: Burp upstream proxy, process monitoring, RE tooling.
4. Order: trust-boundary map → local surface → network surface → update/supply chain.

## Scope

- C/S architecture clients, Electron / Qt / .NET WinForms / WPF
- Local config/credential storage, IPC, named pipes
- Client-side validation bypass research (authorized)
- Auto-update channels and code-signing verification

## Workflow

### 1. Draw the boundary

```text
□ Process tree, child processes, drivers/services
□ Listening ports and outbound domains
□ Local sensitive paths: %APPDATA%, Keychain, registry
```

### 2. Local attack surface

```text
□ Plaintext configs, hardcoded keys, debug switches
□ DLL hijacking / search order (Windows)
□ Database files (SQLite) permissions and encryption
□ IPC: who can connect? Is it authenticated?
```

### 3. Network surface

```text
□ System proxy / app-custom TLS
□ Certificate pinning → pair with mobile/js methodology or Frida
□ API authz: client-hidden admin endpoints
```

### 4. RE verification

```text
□ .NET → dotnet-reverse; native → ida/ghidra; Electron → asar + js-reverse
```

## Toolchain

| Tool | Purpose |
|------|---------|
| Process Monitor / API Monitor | behavior |
| Burp / mitmproxy | traffic |
| dnSpy / IDA / Ghidra | RE |
| Sysinternals | Windows surface |
| asar / nexe detection | Electron |

## References

- `references/thick-client-checklist.md`
- `reverse-engineering/parts/dotnet-reverse/` `reverse-engineering/parts/ida-reverse/` `reverse-engineering/parts/js-reverse/` `security/parts/api-security/`

## Completion self-check

- [ ] Trust boundary drawn?
- [ ] Local + network surfaces both covered?
- [ ] Checklist written?
