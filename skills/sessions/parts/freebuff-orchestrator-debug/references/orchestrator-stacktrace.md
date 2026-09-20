# Orchestrator Stack Trace Analysis

## shell-lifetime Mechanism

From `orchestrator.js` source analysis (position ~8.5M chars):

```typescript
// Shell creation
let shell = shellCommand()
let child = Bun.spawn(shell.argv, {
  cwd,
  env: { ...process.env, TERM: "xterm-256color", ...shell.env },
  terminal: { cols: 100, rows: 28, data: (...) }
})

// Shell auth
let shellToken = await new Promise((resolve) => {
  // Reads from stdin until newline or 5s timeout
})

if (!shellToken) {
  console.error("[shell-lifetime] missing authentication token")
  process.exit(1)
}

// Watch shell lifecycle
watchShellLifetime({
  port: SHELL_LIFETIME_PORT,
  token: shellToken,
  onGone: () => { handleShellGone() }
})
```

## Root Cause Analysis

Shell dies immediately → orchestrator shuts down.

Likely causes:
1. **Bash not found** - `findWindowsBash()` returns null
2. **Terminal PTY unavailable** - `child.terminal` is null
3. **Auth timeout** - No token received within 5s
4. **Socket bind failure** - Can't connect to SHELL_LIFETIME_PORT

## Diagnostic Steps

```powershell
# Check bash path
where.exe bash
Get-ChildItem 'C:\Program Files\Git\bin\bash.exe' -ErrorAction SilentlyContinue

# Check if PTY works
$proc = Start-Process -FilePath 'bun.exe' -ArgumentList '-e', 'console.log("test")' -PassThru -Wait
$proc.ExitCode
```

## Session Evidence (2026-08-13)

Log excerpt:
```
[2026-08-13T15:37:30.040Z] Starting Freebuff orchestrator
freebuff-desktop orchestrator listening on http://127.0.0.1:8766
[shell-lifetime] the Freebuff shell is gone; shutting down
```

Port was 8766 (dynamic, not fixed). Shell never connected.

## Fix Applied

Full restart cleared state. Shell may have been blocked by:
- Zombie processes from previous session
- Environment pollution from mitmdump proxy
- Stale socket bindings
