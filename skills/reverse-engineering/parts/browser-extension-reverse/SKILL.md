---
name: browser-extension-reverse
description: Use for authorized reverse engineering of browser extensions (Chrome/Firefox) including manifest analysis, background workers, and extension-based credential or traffic logic recovery.
---

# Browser Extension Reverse Engineering

## Authorization preamble

1. Confirm the target is a **browser extension** (crx/xpi/unpacked dir), not ordinary web JS (plain JS → `js-reverse/`).
2. Unpack the extension; read the manifest.
3. Order: permission surface → background scripts → network/storage hooks.

## Scope

- Chrome/Edge MV2/MV3 extension analysis
- Firefox extensions
- Malicious extension IOCs, extension supply-chain poisoning investigation
- Recovering signing/crypto/proxy logic implemented in extensions

## Workflow

### 1. Package

```text
□ Unpack crx / take the extension dir from the profile
□ manifest.json: permissions, host_permissions, background, content_scripts
□ Assess excessive permissions (<all_urls>, webRequest, debugger)
```

### 2. Logic

```text
□ service_worker / background entry points
□ content_script injection points and worlds (isolated)
□ chrome.storage / IndexedDB keys
□ Like js-reverse: observe network and messaging (runtime.sendMessage)
```

### 3. Dynamic

```text
□ Developer-mode load of the unpacked dir
□ chrome://extensions error checks
□ DevTools attach to the service worker
□ Frida / browser CDP when necessary
```

## Toolchain

| Tool | Purpose |
|------|---------|
| unzip / jq | manifest |
| Chrome DevTools | worker debugging |
| js-reverse toolchain | deep JS |
| YARA | malicious extension rules |

## References

- `references/extension-analysis.md`
- `reverse-engineering/parts/js-reverse/` `security/parts/malware-analysis/`

## Completion self-check

- [ ] Permission surface and entry scripts listed?
- [ ] Key data flows recovered?
- [ ] Checklist written?
