---
name: freebuff-orchestrator-debug
description: Diagnose and fix Freebuff desktop "Couldn't reach server" / connection dropping issues
---

# Freebuff Orchestrator Debug

## Trigger
- User reports "Couldn't reach the server after retrying" in Freebuff UI
- Connection keeps dropping mid-response
- Orchestrator process dying with `[shell-lifetime]` errors
- Port conflicts or binding issues

## Quick Diagnostic Flow

### 1. Check if orchestrator is running
```powershell
Get-CimInstance Win32_Process | Where-Object {$_.Name -eq 'bun.exe' -and $_.CommandLine -like '*orchestrator*'} | Select-Object ProcessId,StartTime,CommandLine
```

### 2. Check listening port
```powershell
# Port changes every restart - find dynamically
netstat -ano | findstr ":LISTENING" | findstr "127.0.0.1"
# OR
Get-NetTCPConnection -State Listen | Where-Object {$_.OwningProcess -in (Get-Process -Name bun,Freebuff).Id} | Select-Object LocalPort,OwningProcess
```

### 3. Read orchestrator logs
```powershell
Get-Content 'C:\Users\pc\AppData\Roaming\Freebuff\logs\orchestrator-stderr.log' -Tail 50
```

### 4. Check for proxy env var contamination
```powershell
# CRITICAL: mitmdump/MITM sessions leave proxy vars that kill connections
reg query "HKCU\Environment" /v HTTPS_PROXY /v HTTP_PROXY /v NODE_EXTRA_CA_CERTS
```

If proxy vars point to a dead port (e.g., 127.0.0.1:8082), report the exact variables and ask the owner to remove them. Do not mutate HKCU from this diagnostic skill; use a temporary child-process environment override for a safe probe.
```powershell
$env:HTTPS_PROXY = $null
$env:HTTP_PROXY = $null
$env:NODE_EXTRA_CA_CERTS = $null
```

### 5. Check shell-lifetime crashes
Pattern:
```
[shell-lifetime] the Freebuff shell is gone; shutting down
```
This means the terminal shell process died. Shell is created via `Bun.spawn` with `terminal: true`.

Fix: request an owner-authorized full Freebuff restart. Do not force-stop processes from this diagnostic skill; first capture PID/start time/log evidence and use the normal application shutdown path.

## Common Error Patterns

| Error | Cause | Fix |
|-------|-------|-----|
| `Couldn't reach server` | Orchestrator dead or port wrong | Restart Freebuff |
| `Connection kept dropping` | MITM proxy vars in HKCU | Re-run the target check in a child process with proxy variables explicitly cleared; do not mutate HKCU from this skill |
| `shell-lifetime` crash | Terminal shell died | Check bash availability, restart |
| `port already in use` | Another process owns the port | Identify the owning PID, preserve evidence, and use the normal owner-authorized shutdown/restart path; never mass-kill processes |

## Known Issues

### Git Bash vs System Bash
Freebuff expects `C:\Program Files\Git\bin\bash.exe`. If using different bash, set:
```powershell
$env:CODEBUFF_GIT_BASH_PATH = 'C:\path\to\bash.exe'
```

### Port Changes Every Restart
Orchestrator picks random ephemeral port. Never hardcode. Find via:
```powershell
Get-NetTCPConnection -State Listen | Where-Object {$_.OwningProcess -eq <orchestrator_pid>}
```

## Reference
- See `references/orchestrator-stacktrace.md` for code analysis of shell-lifetime mechanism
