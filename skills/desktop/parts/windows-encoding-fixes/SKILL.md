---
name: windows-encoding-fixes
description: 'Use when working with Windows (cmd/PowerShell console, MINGW64, script installation): stdout encoding (cp1251 vs UTF-8, UnicodeEncodeError on ✓/Cyrillic), CRLF/LF when writing files (md5 mirror checks), UTF-8 BOM for PowerShell 5.1, npm.cmd instead of npm, venv Scripts vs bin, PYTHONIOENCODING/PYTHONUTF8, subprocess child output encoding. Verified on Windows 10 bug reports (2 installs + v2.4 BUG-1/4).'
compatibility: Windows (win32), PowerShell 5.1, MINGW64, Python 3.12
metadata:
  author: AGGG2.0 (t.me/aidvizhenie, t.me/hilartem)
---


# Windows: encoding, console, cross-platform

Experience from two AGGG2.0 Windows 10 install bug reports (research.db
id=141, 146) plus the v2.4 bug report (subprocess encoding, BUG-1/4). Each
gotcha — symptom, cause, fix. Apply to ANY script/file that must work on
Windows.

## 1. stdout encoding: cp1251 kills Russian output

**Symptom:** `UnicodeEncodeError: '\u2713' ... codec can't encode` — crashes
on printing `✓`/`✗`/Cyrillic. Manifests when redirecting output
(`script > log 2>&1`) and in the cp1251 console.

**Cause:** Windows console defaults to cp1251; Python 3.12 when redirecting
takes the console encoding, Unicode doesn't fit.

**Fix (mandatory in every CLI script):**
```python
try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")
except Exception:  # noqa: S110,BLE001 — reconfigure is optional
    pass
```
In AGGG2.0 — the single `scripts/_compat.py: fix_encoding()` instead of copying.

**Fix for bash wrappers (run_tests.sh):**
```bash
export PYTHONIOENCODING="${PYTHONIOENCODING:-utf-8}"
```

**System fix (recommendation in SETUP.md):**
```powershell
[Environment]::SetEnvironmentVariable("PYTHONUTF8", "1", "User")
```

## 2. File writing: CRLF breaks md5 checks

**Symptom:** `Path.write_text()` on Windows writes `\r\n`; canonical is `\n`.
Any md5 check of mirrors/copies falsely fails: "files diverged".

**Fix when writing:** `newline="\n"` + byte comparison:
```python
dst.write_text(content, encoding="utf-8", newline="\n")
# freshness check:
if dst.read_bytes() == content.encode("utf-8"): ...
```

**Fix when checking (bash, md5 with normalization):**
```bash
first=$(tr -d '\r' < "${MIRRORS[0]}" | md5sum | cut -d' ' -f1)
```

## 3. PowerShell 5.1: UTF-8 without BOM reads as cp1251

**Symptom:** `bootstrap.ps1` ignores `--check`, outputs mojibake, fails on
the dash "—" in comments.

**Cause:** Windows PowerShell 5.1 decodes a .ps1 without BOM as cp1251;
Cyrillic and dashes break parsing (up to argument logic).

**Fix:** save the .ps1 as UTF-8 **with BOM** (EF BB BF at the file start).
```python
if not data.startswith(b"\xef\xbb\xbf"):
    p.write_bytes(b"\xef\xbb\xbf" + data)
```
Check: `head -c 3 file.ps1 | od -An -tx1` → `ef bb bf`.

## 4. npm on Windows is npm.cmd

**Symptom:** `subprocess.run(["npm", "install", ...])` →
`FileNotFoundError: [WinError 2]`.

**Cause:** CreateProcess (without shell) doesn't run .cmd files; on Windows
npm is npm.cmd.

**Fix:** look for `npm.cmd` first on Windows:
```python
def _npm_cmd():
    if os.name == "nt":
        for name in ("npm.cmd", "npm"):
            p = shutil.which(name)
            if p:
                return p
    return "npm"
```

## 5. venv: bin vs Scripts, .exe

**Symptom:** the script looks for `venv/bin/python` — on Windows it's not
there; the venv lives at `venv\Scripts\python.exe`.

**Fix (single resolver, `_compat.py`):**
```python
VENV_BIN = VENV / ("Scripts" if os.name == "nt" else "bin")
# binary on Windows — with .exe:
# d / "Scripts" / f"{name}.exe"  vs  d / "bin" / name
```
In bash: iterate candidates `Scripts/python.exe` and `bin/python`.

## 6. winget puts binaries outside PATH

**Symptom:** `shutil.which("clangd")` finds nothing — but clangd is installed.

**Cause:** winget puts links in `%LOCALAPPDATA%\Microsoft\WinGet\Links\`
(not always in the process PATH).

**Fix:** search there too:
```python
win_get = Path(os.environ.get("LOCALAPPDATA", HOME)) / "Microsoft" / "WinGet" / "Links"
extra = [str(win_get / "clangd.exe")] if os.name == "nt" else []
```

## 7. GitHub releases: different asset formats per platform

**Symptom:** the script looks for `win32-x64.tar.gz`, the project ships only
`.zip` for Windows (LuaLS), or the reverse.

**Fix:** pick the asset format by platform:
```python
ext = r"\.zip" if IS_NT else r"\.tar\.gz"
m = re.search(rf'https://[^"]*{key}-{variant}{ext}', json)
# unpack: zipfile.ZipFile (NT) vs tarfile.open (posix)
```

## 8. bash in Windows PATH is a WSL stub, not Git Bash

**Symptom:** `C:\Windows\System32\bash.exe` prints "to enumerate
distributions use wsl.exe --list" and fails.

**Cause:** the system bash.exe is a WSL stub, not Git Bash.

**Fix:** docs require Git for Windows (`C:\Program Files\Git\bin\bash.exe`)
or PowerShell wrappers. Don't rely on `bash` from PATH.

## 9. Camoufox on Windows: three bug classes (research 08.2026)

Verified against daijro/camoufox issues (#282, #614, #624, #650):

- **9a. Microsoft Store Python sandboxes AppData\Local (#282).** `camoufox
  fetch` says "successfully installed" but `camoufox.exe` is not found: the
  Store build redirects `AppData\Local` into
  `Packages\PythonSoftwareFoundation...\LocalCache`. Fix: python.org Python
  (not MS Store). Check: `sys.executable` contains `WindowsApps` → warn.
- **9b. headless crashes with STATUS_BREAKPOINT 0x80000003 (#614).** On some
  Windows builds headless launch crashes instantly (headed works). Fix:
  fallback `headless=False, windows_hide=True` — the window is hidden from
  the user. In our worker (`mcp/camoufox_worker.py`) — automatic in
  `_launch()`: try headless → except (NT only) → headed+hidden.
- **9c. SxS mozglue / missing MSVC CRT (#624/#650).** "The application has
  failed to start because its side-by-side configuration is incorrect" /
  Playwright `spawn UNKNOWN` on clean systems. Causes: the embedded manifest
  declares mozglue as an SxS dependency; an AppContainer SID from
  Edge/Chrome in AppData\Local enables strict mode; the package may lack
  VCRUNTIME140.dll. Fixes: install VC++ Redistributable (x64) outside
  AppData\Local (`CAMOUFOX_INSTALL_DIR=C:\Users\...\.camoufox`), update to
  v152+.

**Diagnostics:** `python3 scripts/tools/update_camoufox.py --check` —
checks all of the above and updates the package/browser. See also
`mcp/README.md`, "Camoufox on Windows".

## 10. subprocess: child output encoding (BUG-1/4, v2.4 bug report)

**Symptom:** `UnicodeDecodeError: 'charmap' codec can't decode byte 0x98`
in subprocess reader threads (part of the output is lost; for the LuaLS
download `stdout` became None → "asset not found") or mojibake
`Џа®ўҐапо §ҐаЄ` instead of "Проверяю зеркала" (doctor.py).

**Cause:** `subprocess.run(..., text=True)` without an explicit encoding
takes the ANSI code page (`locale.getencoding()` — cp1251), while console
children write in the OEM page (cp866, `GetConsoleOutputCP`). Two different
encodings; there will not be one (CPython issue #105312).

**Fix from both sides (shared helper + children write UTF-8):**
```python
# parent: scripts/_compat.py run() — decodes utf-8 + errors=replace,
# passes PYTHONUTF8=1 to python children (they write UTF-8). NEVER crashes
# on a foreign encoding:
r = _compat.run(cmd, timeout=120)          # instead of subprocess.run(text=True)
```
```powershell
# child: PowerShell 5.1 writes to pipes in the OEM page — switch at the
# start of the .ps1 (about_Character_Encoding):
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [Console]::OutputEncoding
```

**Rejected:** `encoding='oem'` — only in Python 3.13+ (we support 3.12);
decoding via `GetOEMCP()` in the parent only — doesn't fix python children
that write UTF-8 themselves (after `fix_encoding()`), and still loses output
on a broken encoding; `errors="strict"` — one foreign byte drops the whole
capture.

## Checklist "script is Windows-ready"

- [ ] `fix_encoding()` (or reconfigure) at the start — stdout utf-8
- [ ] child output — via `_compat.run()` (not `subprocess.run(text=True)`
      without encoding) — section 10; .ps1 children — `[Console]::OutputEncoding`
- [ ] file writes with `newline="\n"`, byte comparison
- [ ] venv via resolver (Scripts vs bin, .exe)
- [ ] npm → npm.cmd (or shell=True), winget links as an extra path
- [ ] .ps1 files — UTF-8 with BOM (EF BB BF)
- [ ] GitHub assets — format chosen per platform (zip vs tar.gz)
- [ ] paths — only pathlib/Path.home(), no hardcoded `/` and `\`
- [ ] files read/written with explicit `encoding="utf-8"` (PEP 686-ready)
- [ ] temp files — `tempfile.gettempdir()`, not `/tmp`
- [ ] run `python3 scripts/doctor/doctor.py` on Windows (0 errors)

## References

- Upstream canon: `docs/patterns/GLAV-PATTERNS.md` (block G), the v2.4
  Windows bug report in the AGGG channel (BUG-1/4), daijro/camoufox issues.
- Related: `cross-platform-gotchas` (path/runner gotchas), `workspace-setup`
  (PYTHONUTF8, doctor), `web-research-camoufox` (Camoufox usage).

