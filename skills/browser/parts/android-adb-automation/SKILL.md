---
name: android-adb-automation
description: >-
  Dump+parse UI hierarchy, tap/type/swipe, handle MIUI security restrictions, read SMS from inbox, open incognito tabs. Use when the user wants to automate, control, or drive an Android phone/tablet via USB (form filling, app flows, SMS codes, signup flows), or when adb shell input fails with SecurityException/INJECT_EVENTS on MIUI/Xiaomi devices.
Triggers: >-
  phone automation", "drive a phone over ADB", "adb input not working MIUI", "dump UI hierarchy android
version: 1.0.0
---
# Android ADB Automation

> Playbook for driving an Android phone from the PC over USB ADB.
> Historical recipe reported on a Redmi 9T (MIUI 14) in 2026-08; no current
> device is connected or operation is live-verified in this workspace.
> Reusable as a procedure template for phone UI automation, subject to a fresh
> device-specific probe and explicit authorization for mutations.

## 1. Basics

```bash
export MSYS_NO_PATHCONV=1
ADB="/c/Users/pc/AppData/Local/Android/Sdk/platform-tools/adb.exe"  # configured path; verify existence before use
S="<serial>"        # adb devices — show serials
$ADB -s $S shell dumpsys window | grep mCurrentFocus   # what's on screen
$ADB -s $S shell svc power stayon true                 # keep screen on
```

- `export MSYS_NO_PATHCONV=1` — REQUIRED on Git Bash/Windows, else paths get mangled.
- **MIUI pull trap:** `adb pull /sdcard/ui.xml ui.xml` from the project root mangles the dest
  path. `cd` into the target dir FIRST, then pull with a relative name.
- MIUI dumps print a warning to stderr ("Broadcast queue..." / "error: buffer overflow") —
  harmless, ignore it.

## 2. Dump + parse UI (the core loop)

```bash
$ADB -s $S shell uiautomator dump /sdcard/ui.xml >/dev/null 2>&1
cd <target_dir> && $ADB -s $S pull /sdcard/ui.xml ui.xml >/dev/null 2>&1
```

Parse the XML for actionable nodes. A stable helper exists:
`_scripts/phone-tools/phone_ui.py` — run it with the serial, it dumps + prints
text/class/content-desc/bounds/clickable rows (webview-inclusive):

```bash
python _scripts/phone-tools/phone_ui.py <serial> [outfile.xml]
```

Fallback one-liner (Windows console-safe: write to file, don't print UTF-8 to console):

```python
# python -c "..." → regex over the xml file, print text + bounds for non-empty nodes
import re; xml=open('ui.xml',encoding='utf-8').read()
for m in re.finditer(r'<node[^>]*?text="([^"]*)"[^>]*?class="([^"]*)"[^>]*?bounds="(\[[^"]+\])"', xml):
    t,c,b=m.groups()
    if t: print(repr(t), c.split('.')[-1], b)
```

**Finding tap coordinates:** for a node with bounds `[x1,y1][x2,y2]`, tap center =
`((x1+x2)//2, (y1+y2)//2)`. Compute the center yourself; bash arithmetic on the two
bracketed pairs often breaks — do it in Python or hardcode the center.

## 3. Input injection (device mutation; explicit authorization required)

```bash
$ADB -s $S shell input tap X Y
$ADB -s $S shell input text 'Hello%sspace'    # %s = space
$ADB -s $S shell input keyevent 111           # ESC — hide keyboard
$ADB -s $S shell input keyevent 61            # TAB
$ADB -s $S shell input keyevent 4             # BACK
$ADB -s $S shell input swipe X1 Y1 X2 Y2 300  # swipe (notifications shade)
```

### ⚠️ MIUI blocker — INJECT_EVENTS / WRITE_SECURE_SETTINGS denied

On Xiaomi/MIUI `adb shell input` throws `SecurityException` and `settings put` throws
WRITE_SECURE_SETTINGS deny until the user enables:
**Settings → Advanced Settings → Developer Options → "USB Debugging (Security Settings)".**

- This single toggle unlocks BOTH input injection AND settings writes.
- Until it's on: taps silently no-op (or throw), `settings put global mobile_data 1` is denied.
- Ask the owner to flip it — there is NO software workaround.

## 4. Reading SMS (device data; explicit authorization and privacy review required)

```bash
$ADB -s $S shell content query --uri content://sms/inbox --projection address,body,date
```

Filter for the sender you need (e.g. Google) and take the newest `body` containing
`G-XXXXXX`. The code arrives on the physical SIM; the app/URL you're verifying stays
live on screen — read the inbox, extract the code, type it into the form.

## 5. Forms — the real-world pitfalls

- **Autofill sabotage:** Chrome autofill injects junk into fields (typed text lands wrong,
  suggestions overlay the field). Fix: tap exactly the field center, clear via
  select-all+delete (`keyevent 29` etc. is unreliable — clear manually), retype.
- **Keyboard covers the button:** buttons get bounds `[0,0][0,0]` while the keyboard is up.
  Hide keyboard (keyevent 111 / 4), re-dump, THEN tap the button at its now-visible center.
- **Spinners (month, gender):** tap the spinner, the option list opens; pick the option by
  center coords from the fresh dump. Re-dump after every open.
- **Session expiry:** web signup flows die after long idle ("Session expired / retry").
  Just re-fill from the first step — don't fight it.
- **Password confirm field:** often covered by the autofill overlay; clear field 1 fully,
  then fill both fields with precise taps after re-layout.

## 6. Incognito on mobile Chrome

- Programmatic incognito (intents, CDP `Target.createBrowserContext`) FAILS on mobile
  Chrome — all return `ctx=None`.
- Only path: tap the tab-switcher button (top-right, `tab_switcher_button`), then
  "New Incognito Tab" in the switcher UI. This is a USER-tap flow via input.
- Use incognito for anything that must NOT touch the owner's logged-in profile (signups,
  testing) — the normal profile has the owner's accounts.

## 7. Hygiene

- Do not run `svc power stayon true` automatically: it changes device state. Use only with explicit owner authorization.
- Don't reboot or otherwise mutate the owner's router/phone without explicit permission; network/device changes are outside read-only verification.
- Don't touch the owner's normal Chrome profile — use incognito for experiments.

## 8. Reference implementation

Full working example of a phone-driven Google signup (every step above, 40+ taps):
`projects/gmail-unlimited/ACCOUNT_userktf8mdw.md` (recipe section).
Tooling home: `_scripts/phone-tools/` (README inside). Canon:
`knowledge/findings/2026-08-03-A2-mission-experience.md` §3-4.
