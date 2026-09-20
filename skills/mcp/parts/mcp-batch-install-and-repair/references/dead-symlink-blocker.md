# Dead Symlink Blocker — gws-gmail

## Problem
Dead symlink `C:\Users\pc\AppData\Local\hermes\skills\gws-gmail` (target missing) breaks ALL skill operations:
- `skill_view(name)` → FileNotFoundError
- `skill_manage(action='patch'/'create'/'edit')` → FileNotFoundError
- Every call dies before reaching target skill

## Root Cause
Hermes skill indexer scans ALL entries in `AppData/Local/hermes/skills/`. When it hits a broken symlink, YAML parsing aborts before reaching the requested skill.

## Fix
```powershell
Use the approved reversible trash/recycle procedure for `C:\Users\pc\AppData\Local\hermes\skills\gws-gmail` only after ownership and authorization are confirmed; do not run `Remove-Item` directly.
Use the approved reversible trash/recycle procedure for `C:\Users\pc\AppData\Local\hermes\skills\gws-gmail-read` only if it exists and is authorized; do not run `Remove-Item` directly.
Use the approved reversible trash/recycle procedure for `C:\Users\pc\AppData\Local\hermes\skills\gws-gmail-reply` only after authorization; do not run `Remove-Item` directly.
Use the approved reversible trash/recycle procedure for `C:\Users\pc\AppData\Local\hermes\skills\telegram-mcp-setup` only after authorization; do not run `Remove-Item` directly.
```

## Workaround (if cannot delete)
Write skill files directly:
```python
# Direct write to ~/.agents/skills/<name>/SKILL.md
write_file(path="C:\\Users\\pc\\.agents\\skills\\<name>\\SKILL.md", content="...")
```

## Detection
```powershell
# List all symlinks and check for dead ones
Get-ChildItem "C:\Users\pc\AppData\Local\hermes\skills\" -Force | Where-Object {$_.LinkType -ne $null} | ForEach-Object {
    $target = $_.Target
    $exists = Test-Path $target
    [PSCustomObject]@{Name=$_.Name; Target=$target; Exists=$exists}
}
```

## Session Reference
- 2026-08-13: User reported "Connection kept dropping" in Freebuff. Diagnosis revealed proxy env vars left in HKCU\Environment from mitmdump session.
- 2026-08-13: Dead symlink blocked skill operations during investigation.
- Lesson: Always check for dead symlinks before declaring "skill tools broken".
