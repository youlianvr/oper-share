---
name: tool-claims-verification
description: >
  Verify an advertised CLI/GitHub/PyPI tool for malware and inflated claims
  before recommending or installing it. Use when a promo message, Telegram
  channel post, or ad claims a tool "scans 375+ platforms", "installs in
  seconds", or otherwise needs fact-checking — check the repo, the code, the
  PyPI package, and the numbers behind the marketing.
---

# Tool Claims Verification

> Verify a hyped tool end-to-end in ~10 minutes: repo → code → package → claims.

## Quick Reference

| Problem | Solution |
|---------|----------|
| Is the tool real? | Check repo + PyPI + release history, not just the README |
| Is it malware? | Clone, grep red flags, enumerate external hosts |
| Is the PyPI package poisoned? | Diff PyPI sdist against the GitHub clone |
| Are the numbers real? | Count actual modules / scan vectors |
| "Smart auto-update" — safe? | Read the update code: pip uninstall/install = benign |

## The Problem

Advertised tools (especially OSINT/automation ones in TG channels) are a
classic malware vector. GitHub can look clean while the PyPI package is
poisoned, or the tool is real but the claims are inflated. Trusting either
the README or the repo alone is how you get burned.

## Solutions

### 1. Existence + activity check

- `web_search` for the repo name — confirm it exists, has release history,
  and isn't a brand-new one-shot dump.
- Check PyPI page: version, upload date, maintainer. Author on PyPI should
  match the GitHub author. Long release history = actively maintained.

### 2. Clone and inspect

```bash
git clone --depth 1 <repo> <isolated-temp-dir>
# Read metadata with the repository/file tools; do not execute untrusted code.
find <pkg> -name "*.py" | wc -l   # verify claimed module counts
```

Use an isolated temporary directory and preserve the workspace Trash-Only rule;
never use destructive cleanup commands in the workspace.

### 3. Red-flag grep

```bash
grep -rn -E "base64\.b64decode|eval\(|exec\(|compile\(|pickle\.loads|marshal" <pkg> --include="*.py"
grep -rn -E "subprocess|os\.system|os\.popen|socket\." <pkg> --include="*.py"
grep -rhoE "https?://[a-zA-Z0-9.-]+" <pkg> --include="*.py" | sort | uniq -c | sort -rn
```

- All hosts must be the target platforms themselves. ANY unknown domain or
  IP = telemetry/exfiltration suspect.
- `subprocess` requires context review; never execute an advertised tool merely to test its update path. Treat any uninstall/install behavior as a mutation requiring explicit approval.
- base64 is fine when used for tokens/hashing; base64 of executable payloads is not.

### 4. THE key check: PyPI vs GitHub (poisoned package test)

GitHub-clean does NOT mean PyPI-clean. Compare hashes of every shared file:

```python
# Use the actual isolated temporary directory for the current OS.
base = pathlib.Path('<isolated-temp-dir>')
def h(p): return hashlib.md5(p.read_bytes().replace(b'\r\n', b'\n')).hexdigest()
```

- Content drift of a few files = normal release-lag (module updates). Fine.
- If the sdist contains files/URLs/patterns NOT in the repo — investigate hard.

### 5. Check the "smart" features

- Auto-update: reads `pypi.org/pypi/<name>/json`, then pip reinstall — benign.
- Third-party API claims (e.g. Hudson Rock): verify it's the official public
  endpoint, not a fake proxy that receives your queries.

## What didn't work (dead-ends)

- **Trusting GitHub alone.** Proved wrong: user-scanner's PyPI sdist differed
  from main in 42/433 files. GitHub-clean ≠ PyPI-clean.
- **Shell hash loops over hundreds of files** (`find -exec md5sum`): too slow
  on Windows FS — use one Python script instead.
- **Path portability:** do not assume `/tmp` or a Windows-specific temp path; obtain the actual isolated temp directory for the current runtime and verify it exists.
- **Reading only the README** to judge malware — the README is marketing.

## Trade-offs

| Approach | Pros | Cons |
|----------|------|------|
| Full sdist-vs-repo hash diff | Catches poisoned packages definitively | ~2 min extra; minor drift noise |
| Repo-only review | Fast | Misses poisoned PyPI uploads |
| Running the tool to test | Real behavior | Executes untrusted code — never do this first |

## Edge Cases

- **403s during the tool's own scans** — expected: mass scanners hit rate
  limits and ToS-gray areas. Report as caveat, not as tool failure.
- **Numbers slightly over/under advertised** (e.g. 380 vs "375+") — verify by
  counting modules; report the real number.
- **Repo clean, sdist has MORE files** — usually new modules added post-tag;
  verify each extra file's content before clearing.
- **Yanked PyPI releases** — check the yank reason; a data-loss bug fix is a
  sign of honest maintenance, not malware.
