# 2026-08-20 — `happ_config_guard` audit (cleanup deferred)

## Context
During freebuff-proxy deprecation session, Freebuff background attempted to
launch `_scripts/happ_config_guard.py` and failed with `[Errno 2] No such file
or directory`. The script had already been archived earlier in the day to
`_archive/2026-08-20-happ-config-cruft/` as part of a kludge retirement, but
**3 PS1 scripts still call it**, and one of them fires on every Happ reconnect.

## What the guard did (294 lines, 7 functions)
1. `strip_routing_bom()` — strip UTF-8 BOM from `routing.json` (Happ parser fix).
2. `enforce_dns_proxy()` — `dns.servers[*].detour = proxy`.
3. `enforce_final_direct()` — `route.final = "direct"` (no global tunnelling).
4. `inject_config_rule()` — merge ALL `proxySites` from `routing.json` (UI list,
   280+ domains) into `config.json` proxy domain rule.
5. `enforce_process_path_proxy()` — keep Freebuff stack (freebuff.exe, bun.exe,
   Freebuff.exe, python.exe, CloudflareWARP.exe) in proxy `process_path` rule.
6. `enforce_rule_order()` — rules: hijack-dns → sniff → domain.
7. `set_read_only(CONFIG)` — freeze config.json so Happ cannot overwrite.

## What calls it (3 PS1 scripts, line-numbered)
- `_scripts/happ-force-reload.ps1:75` — after kill-switch + Happ restart.
- `_scripts/home-happ.ps1:42` — after registry edits + Happ reconnect.
- `_scripts/school-happ.ps1:60` — after registry edits + Happ reconnect.

## Current runtime state (2026-08-20 19:11 audit)
- `%LOCALAPPDATA%\Happ\config.json`: 4558 bytes, **NOT read-only** (`-rw-r--r--`).
  Guard did not run after last reload → `config.json` lacks user domains and
  Freebuff process_path rules. **Freebuff may be leaking direct.**
- `%LOCALAPPDATA%\Happ\routing.json`: not found via `find` (escaping issue or
  alternate path; verify via PowerShell before refactor).
- `_scripts/__pycache__/happ_config_guard.cpython-314.pyc`: orphan bytecode.

## New approach (per `_archive/2026-08-20-happ-config-cruft/README.md`)
Happ's real config surface — **never edit `config.json`** (Happ rewrites on connect):

| Concern | Location | Editable offline? |
|---------|----------|-------------------|
| Domain lists (`proxySites`/`directSites`) | `routing.json` | ✅ |
| Per-app process list | Registry `HKCU\Software\Happ\…\PerAppProxy\appList` | ✅ |
| DNS strategy (home/school toggle) | Registry `HKCU\…\AdvancedSettings\localDns` etc | ✅ |
| uTLS fingerprint | Registry `HKCU\…\TunnelSettings\Noises` | ✅ |

The new approach maps guard functions to:
- (1) BOM strip → still needed, applies to `routing.json`.
- (2) DNS proxy → registry `AdvancedSettings` (already partially in PS1).
- (3) `route.final = direct` → no equivalent (Happ default; verify).
- (4) `inject_config_rule()` → direct edit of `routing.json` `proxySites`.
- (5) `enforce_process_path_proxy()` → registry `PerAppProxy.appList`.
- (6) rule order → N/A (`routing.json` is a flat list, no rules).
- (7) `set_read_only(CONFIG)` → **drop entirely** (no longer editing config.json).

## Dependency graph (pre-fix)
```
home-happ.ps1 / school-happ.ps1 / happ-force-reload.ps1
        │
        │ (registry edits + URL-scheme reconnect)
        ▼
   Happ regenerates config.json (wipes proxySites + process_path)
        │
        │ (same PS1: calls python happ_config_guard.py)
        ▼
   guard restores 7 things → set_read_only
        │
        ▼
   config.json correct + RO → reconnect → sing-box starts with right config
```

## Fix options (owner deferred choice)
| Option | Scope | Reversibility | Time |
|--------|-------|---------------|------|
| (a) Quick fix | Repoint 3 PS1 to `_archive/2026-08-20-happ-config-cruft/happ_config_guard.py` | ✅ git revert | 5 min |
| (b) Proper refactor | New module edits `routing.json` + registry directly; rewrite 3 PS1; delete guard from `_archive/` after smoke test | ✅ git revert | 30-60 min + tests |
| (c) Audit-only | No change. Defer until Freebuff leak actually bites. | — | now |

**Owner decision (2026-08-20):** audit-only, deferred. Trigger condition
for revisiting: Freebuff session visibly leaks direct OR user adds a new
proxy-only domain that needs Happ routing.

## Action item if leak observed before refactor
Run `python _archive/2026-08-20-happ-config-cruft/happ_config_guard.py`
manually — it still works, just archived.
