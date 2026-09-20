# Environment Contamination Pattern

## Problem
External tools (mitmdump, Charles, Fiddler, corporate proxies) set system-wide proxy environment variables that persist in registry/user env. When the tool dies, the vars point to dead ports → all subsequent network calls fail silently.

## Symptoms
- Application "can't reach server" but ping/curl to same host works
- Specific apps fail while system-wide tools work
- Intermittent failures after using MITM proxy tool
- "Connection refused" to 127.0.0.1:8082 (or other local ports)

## Diagnostic Steps

### 1. Check HKCU\Environment
```powershell
reg query "HKCU\Environment" /v HTTP_PROXY
reg query "HKCU\Environment" /v HTTPS_PROXY
reg query "HKCU\Environment" /v NODE_EXTRA_CA_CERTS
```

### 2. Check current process env
```powershell
$env:HTTP_PROXY
$env:HTTPS_PROXY
```

### 3. Verify target port is actually listening
```powershell
netstat -ano | findstr ":8082"
```

## Remediation

Remove contaminated vars:
```powershell
reg delete "HKCU\Environment" /v HTTP_PROXY /f
reg delete "HKCU\Environment" /v HTTPS_PROXY /f
reg delete "HKCU\Environment" /v NODE_EXTRA_CA_CERTS /f
```

**Note:** Some apps read registry at startup. Must restart app after removal.

## Pattern Recognition

| Tool | Proxy Port | Cert Location |
|------|-----------|---------------|
| mitmdump | 8080/8081/8082 | ~/.mitmproxy/mitmproxy-ca-cert.pem |
| Charles | 8888 | ~/Library/Application Support/Charles/charles-proxy-ca.crt |
| Fiddler | 8888 | %USERPROFILE%\Documents\Fiddler2\Certs |
| corporate proxy | varies | varies |

## Session Reference
- 2026-08-13: User reported "connection kept dropping" in Freebuff. Root cause: mitmdump left HTTP_PROXY=127.0.0.1:8082 in HKCU\Environment, port was dead. Fix: reg delete + restart.
