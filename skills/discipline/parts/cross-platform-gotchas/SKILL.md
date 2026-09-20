---
name: cross-platform-gotchas
description: 'Use when writing/editing cross-platform scripts and installers (Python/bash, Linux/macOS/Windows): platform.system() vs sys.platform, regex in raw strings (r"\\.zip" matches literal backslash), FileNotFoundError from subprocess.run, package manager fallback (winget→scoop→choco), Windows registry PATH (fresh binaries not visible to process), bash = WSL stub on Windows (need Git Bash), single source of truth instead of copies. Verified on Windows install bug report.'
compatibility: Python 3.7+, bash, Windows/macOS/Linux
metadata:
  author: AGGG2.0 (t.me/aidvizhenie, t.me/hilartem)
---


# Cross-platform gotchas in scripts and installers

Universal set of errors from the AGGG2.0 Windows install bug report
(2026-08-11). Each gotcha — symptom → cause →
fix. Check your code against this checklist if it needs to work
on multiple OSes (especially Windows).

## 1. platform.system() and sys.platform are DIFFERENT things

**Symptom:** platform dictionary built on one API, lookup on
another; key not found (`None`), code silently goes wrong or crashes.

**Cause:** on Windows `platform.system()` returns `"Windows"`,
while `sys.platform` returns `"win32"`. On Linux: `"Linux"` vs `"linux"`.
Mixing in one expression gives a miss.

**Fix:** don't mix. One source for all dictionaries:
```python
# bad: keys for sys.platform, lookup by platform.system()
key = {"win32": "win32", "linux": "linux"}.get(platform.system().lower())  # None on Windows!

# good: explicit key for platform.system() OR use sys.platform everywhere
key = {"windows": "win32", "linux": "linux", "darwin": "darwin"} \
    .get(platform.system().lower())
# or: key = sys.platform, if dict is based on it
```

## 2. Regex in raw strings: double backslash matches NOT what you want

**Symptom:** `re.search(rf'...{ext}', url)` never finds a match,
even though the data contains it.

**Cause:** in a raw string `r"\\.zip"` is TWO characters: `\\` (literal
backslash) + `.` (wildcard "any character"), so it searches for `\\.` in the URL text —
but you need one escaped backslash `\\.` (dot). In raw strings, backslash
is not doubled for escaping — it's already literal.

**Fix:** in raw strings, one backslash:
