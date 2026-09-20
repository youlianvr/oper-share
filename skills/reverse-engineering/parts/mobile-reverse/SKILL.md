---
name: mobile-reverse
description: Use for authorized Android or iOS application reverse engineering and security testing, including APK or IPA analysis, runtime instrumentation, SSL pinning, and platform protection checks.
---

# Mobile Reverse Engineering

## Authorization preamble

1. Confirm the RE work is authorized routine work.
2. Confirm the task hits this skill's scope.
3. Verify tool availability and real paths before use.
4. Enter workflow Phase 1 and execute — do not stop at confirmation.

> Unified Android + iOS methodology
> Frida / Objection / OWASP MASTG / SSL pinning bypass

## Scope

- Android APK RE and security testing
- iOS IPA RE and security testing
- Runtime dynamic instrumentation
- SSL pinning / root detection / jailbreak detection bypass
- Mobile crypto key extraction (AES/RSA/HMAC)
- Mobile app pentest (OWASP MASTG)
- Testing without root/jailbreak

## Four-phase workflow

### Phase 1: Reconnaissance

```text
Android:
□ Obtain APK (Google Play / APKMirror / adb pull)
□ Manifest analysis: permissions, exported components, intent filters, backup flag
□ androguard analyze APK → components/permissions/signatures
□ APKLeaks: hardcoded API keys / tokens / secrets
□ Packing detection (hardened builds)

iOS:
□ Obtain IPA (App Store / ipatool / Apple Configurator)
□ Decrypt App Store binaries: frida-ios-dump / Clutch
□ Info.plist: ATS config, URL schemes, query schemes
□ class-dump: ObjC class structures
□ Obfuscation detection (Swift/ObjC)
```

### Phase 2: Static analysis

```text
Cross-platform:
□ JADX-GUI: APK → Java source (Android)
□ Ghidra / Hopper: .so / Mach-O decompilation
□ radare2 / Cutter: fast CLI recon

Android:
□ apktool d app.apk → smali + resources
□ dex2jar: DEX → JAR → JD-GUI
□ smali/baksmali: Dalvik bytecode modification

iOS:
□ class-dump: ObjC headers
□ Symbol recovery: swift-demangle
□ dsymutil: debug symbols
□ otool -L: dynamic library deps
□ jtool2: Mach-O analysis
```

### Phase 3: Dynamic analysis

```text
Frida — universal instrumentation:
□ frida-ps -U: list device processes
□ frida-trace -U -i "open*" com.app: trace calls
□ Custom hook scripts: modify args/returns, call private methods

Objection — Frida enhancement (no scripting needed):
□ objection -g "com.app" explore
□ android root disable / ios jailbreak disable
□ android sslpinning disable / ios sslpinning disable
□ android keystore list / ios keychain dump
□ env / ls / sqlite connect

Frida Gadget (no root/jailbreak):
□ Inject frida-gadget.so / FridaGadget.dylib into APK/IPA
□ Re-sign → install → hook without device privileges
□ objection patchapk --source app.apk (fully automated)
```

### Phase 4: Network analysis

```text
□ Burp Suite: intercept HTTP/HTTPS, modify requests/responses
□ mitmproxy: scripted proxy (Python API)
□ Wireshark: PCAP analysis
□ Certificates: Android user cert → system cert (Magisk + MoveCert)
□ SSL pinning bypass: Frida/Objection/Xposed/SSL Kill Switch 2
□ WebSocket / gRPC traffic analysis
```

## Common bypasses quick reference

### SSL pinning

```bash
# Objection (simplest)
objection -g "com.app" explore
android sslpinning disable

# Generic Frida script
frida -U -l ssl_pinning_bypass.js -f com.app

# Xposed (Android): TrustMeAlready module → global cert-validation disable
```

### Root / jailbreak detection

```javascript
// Frida custom (multi-layer detection)
Java.perform(function() {
    var RootBeer = Java.use("com.scottyab.rootbeer.RootBeer");
    RootBeer.isRooted.implementation = function() { return false; };
    // extra bypasses: Magisk su detection, frida-server detection, /proc/self/maps checks
});
```

### Anti-debug

```bash
# Android: bypass ptrace(TracerPid), /proc/self/status, isDebuggerConnected()
frida -U -l anti_debug_bypass.js -f com.app

# iOS: bypass PT_DENY_ATTACH, sysctl KERN_PROC checks
frida -U -l ios_anti_debug.js -f com.app
```

## Mobile crypto extraction

```javascript
// Android — hook Cipher.getInstance to capture keys + algorithms
Java.perform(function() {
    var Cipher = Java.use("javax.crypto.Cipher");
    Cipher.getInstance.overload('java.lang.String').implementation = function(algo) {
        console.log("[Cipher] Algorithm: " + algo);
        return this.getInstance(algo);
    };
    Cipher.init.overload('int', 'java.security.Key').implementation = function(mode, key) {
        console.log("[Cipher] Key: " + bytesToHex(key.getEncoded()));
        return this.init(mode, key);
    };
});

// iOS — hook CCCrypt
Interceptor.attach(Module.findExportByName("libcommonCrypto.dylib", "CCCrypt"), {
    onEnter: function(args) {
        console.log("CCCrypt op: " + args[0] + " alg: " + args[1]);
        console.log("Key: " + hexdump(args[3], { length: args[4].toInt32() }));
    }
});
```

## Toolchain

| Tool | Platform | Purpose |
|------|:--:|---------|
| JADX-GUI | A | Java decompilation |
| apktool | A | APK unpack/rebuild |
| Ghidra | A+I | multi-arch decompilation |
| Hopper | I | iOS disassembly |
| Frida | A+I | dynamic instrumentation |
| Objection | A+I | Frida REPL enhancement |
| MobSF | A+I | automated SAST+DAST |
| class-dump | I | ObjC class export |
| frida-ios-dump | I | IPA decryption |
| jtool2 | I | Mach-O analysis |
| Burp Suite | A+I | HTTP interception |
| mitmproxy | A+I | scripted proxy |

> A=Android, I=iOS

## References

- `references/frida-objection-deep.md` — Frida + Objection deep usage
- `references/ios-reverse-guide.md` — iOS RE specialization
- `references/anti-detection-bypass.md` — root/jailbreak/anti-debug/SSL pinning bypass

## Completion self-check (MUST pass before claiming completion)

- [ ] Did I execute every step of the workflow (rather than just read it)?
- [ ] Did I use real tool paths?
- [ ] Did I produce reproducible evidence (commands / scripts / reports)?
- [ ] Did I write back the required checklist items?
