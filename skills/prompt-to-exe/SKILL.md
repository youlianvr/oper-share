---
name: prompt-to-exe
description: >
  Turn a natural-language app idea ("an app that...") into a working,
  double-clickable Windows .exe — with ZERO git, GitHub, terminal, or build
  knowledge required from the user. Covers stack choice (default:
  Python + Tkinter + PyInstaller; alternatives: pywebview/Tauri, .NET
  WinForms), Python bootstrap via winget/py launcher, minimal project
  scaffold, implementation rules, PyInstaller onefile build, smoke test,
  antivirus false-positive caveats, and delivery of the finished exe to the
  user's Desktop. Use when the user asks to "make an app from my prompt",
  "create an exe", "build a Windows app", "build an app from a prompt",
  "assemble the exe", or reports that a generated app "didn't work" / "won't
  open on Windows".
compatibility: Windows 10/11 host; Python 3.11-3.13; PyInstaller >= 6
metadata:
  author: Oper (Buffy)
  created: 2026-09-05
---

# prompt-to-exe — from one-line prompt to double-clickable .exe

Mission: the user describes an app in plain language; the task is complete
only when a verified .exe is sitting in a folder the user knows how to reach.
The user is assumed to know NOTHING about git, terminals, or packaging — the
agent runs every command; the user only receives the finished file.

## 0. Non-negotiables

- DONE means: exe exists on disk AND was smoke-launched successfully.
  A project folder without a built exe is NOT done (No Fake Completeness).
- Never make the user run commands or edit files. The agent does it all.
- Never advise disabling antivirus globally. A targeted folder exclusion is
  offered only after a false positive is actually observed.
- Ask at most ONE clarifying question (GUI vs console, or the one missing
  core feature). Everything else: pick sensible defaults and STATE them.

## 1. Stack decision (default covers ~95% of cases)

| Case | Stack | Why |
|---|---|---|
| Default: small GUI tool, one window | Python 3.12 + Tkinter (stdlib) + PyInstaller | no node/npm, no .NET SDK; most robust single-exe path |
| Web-style UI demanded (HTML/CSS) | Python + pywebview | Tauri only if the Rust toolchain is ALREADY present |
| User explicitly wants C#/native | .NET 8 WinForms, `dotnet publish -r win-x64 --self-contained -p:PublishSingleFile=true` | check `dotnet --version` first; skip if absent |

Do NOT offer Electron for simple tools — 150-300 MB for a to-do list is a
failure of judgment, not a feature.

## 2. Environment check (agent runs; handle every failure branch)

```bash
py -3 --version          # py launcher ships with python.org installers
```
- If `py` is missing, try `python --version`. Beware the WindowsApps store
  stub: `python` may open the Microsoft Store instead of running (known trap).
- If neither works: `winget install -e --id Python.Python.3.12 --silent`.
  After a winget install the CURRENT shell has no updated PATH — use the
  full path `%LOCALAPPDATA%\Programs\Python\Python312\python.exe` for this
  session instead of re-reading stale PATH.

## 3. Scaffold (minimal; NO git anywhere in the flow)

```
<project>/
  main.py           # the whole app (single file unless it truly needs more)
  requirements.txt  # third-party deps only (often empty for Tkinter)
  build.bat         # one-click rebuild, see §5
  README.txt        # plain text: what it is, double-click to run, who built it
```

## 4. Implementation rules

- One window, one obvious action. Boring is beautiful.
- GUI apps: no console — build with `--windowed` later; keep all output
  inside the window (message boxes, labels, log pane).
- Console apps that print non-ASCII must set UTF-8 explicitly
  (`sys.stdout.reconfigure(encoding="utf-8")` — see windows-encoding-fixes).
- No network calls, no secrets, no telemetry unless the user asked for them.
- App must exit cleanly when the window closes (Tkinter `mainloop` returns).

## 5. Build + smoke test

```bash
<venv-python> -m pip install pyinstaller
<venv-python> -m PyInstaller --noconfirm --onefile --windowed --name AppName main.py
# console app: drop --windowed
```

- Create the venv INSIDE the project (`python -m venv .venv`); on Windows the
  interpreter is `.venv\Scripts\python.exe` (never `bin/`).
- Verify: `dist\AppName.exe` exists; a Tkinter onefile build is typically
  10-15 MB. A 1-2 MB exe means the runtime was not bundled — recheck.
- Smoke test (agent runs): `Start-Process dist\AppName.exe`, wait ~4 s
  (onefile self-extraction is slow on first run), then confirm via
  `Get-Process AppName` that it is alive, then `Stop-Process` the test
  instance. Start implies cleanup.

## 6. Antivirus false positives (tell the user BEFORE delivery)

PyInstaller onefile exes are frequently flagged by Defender/SmartScreen as
"unrecognized app" — a known packaging limitation, not malware. Say this
up front. If a flag actually happens:
- targeted fix: Windows Security → Virus & threat protection → Exclusions →
  add the project folder (2 clicks, or elevation via request_elevation);
- NEVER suggest turning off protection system-wide.

## 7. Delivery

- Resolve the real Desktop first — OneDrive redirect is common:
  `reg query "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\User Shell Folders" /v Desktop`
- Copy `dist\AppName.exe` there (plain copy — never overwrite an older exe:
  rename the old one to `AppName-old.exe` first; the working version dies
  only after the new one is verified).
- Final message template (plain language): where the exe is → "Desktop,
  file `AppName.exe`", double-click to run, first start takes a few seconds,
  and "tell me what to change and I rebuild it — no reinstalling needed".

## 8. Iterate

Any change request = edit `main.py` → rebuild → re-smoke-test → re-deliver.
Keep `build.bat` in sync with the exact PyInstaller command used.

## Related skills

- `desktop` part `windows-encoding-fixes` — Windows console/venv/UTF-8 traps
