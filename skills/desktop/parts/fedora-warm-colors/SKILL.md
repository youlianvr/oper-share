---
name: fedora-warm-colors
description: Make a Fedora GNOME (Wayland) display look warm and pleasant like Windows instead of cold/washed out. Use when the user asks to fix cold colors, set up gamma, night light, color temperature, or "make it like Windows" on Fedora/GNOME/Wayland.
metadata:
  author: AGGG2.0 (t.me/aidvizhenie, t.me/hilartem)
---


# Fedora warm display colors (GNOME + Wayland)

Goal: replicate the pleasant, warm Windows-like display look on Fedora Workstation
(GNOME + Wayland). Windows drivers apply gamma/color corrections; Linux does not,
so the panel often looks cold and flat.

Environment: Fedora, GNOME + Wayland, NVIDIA GPU (proprietary driver — DDC/CI over
i2c works; with nouveau it does NOT respond), external monitor on DP-1. Tested on
GNOME 45–50 (50.3). Color work is driver-agnostic (colord VCGT + Mutter).
Mutter's Wayland does not expose wlr-gamma-control, so gammastep/wl-gammactl will
NOT work. Night Light is one gamma path, plus colord ICC profiles via VCGT.

The single biggest "cold/flat" fix is usually the MONITOR's own color preset —
many ship at 7500 K (bluish); set it to 6500 K via DDC (§4).

**Windows 11 look beyond colors** (dark theme, Segoe UI, cursors, sounds,
extensions, terminals, passwordless sudo) — `references/windows-look-extras.md`,
load only when the task needs it.

## 1. Night Light (warmth) — built-in, no packages

```bash
gsettings set org.gnome.settings-daemon.plugins.color night-light-enabled true
gsettings set org.gnome.settings-daemon.plugins.color night-light-schedule-automatic false
gsettings set org.gnome.settings-daemon.plugins.color night-light-temperature 4200
```

- `temperature`: 6500 = neutral, lower = warmer. 4000–4200 = comfortable warm.
- GUI alternative: Settings → Displays → Night Light → always on + slider.
- GOTCHA (observed): gsd-color may silently set `night-light-enabled` back to
  `false` when the other keys change. Always re-verify and set it LAST.
- Prefer the VCGT temperature from §2 instead — same warmth, no Night Light
  flakiness, survives reboots.

## 2. gnome-gamma-tool (gamma / temperature / contrast / brightness) — persistent via VCGT

Works on GNOME Wayland by cloning the active ICC profile and adding a VCGT gamma
table; survives reboot and stacks with Night Light. Does NOT change saturation or
hue (VCGT limitation). Re-running the tool on GNOME 50 works (it replaces the
active profile with a new UUID and re-applies via colord).

```bash
git clone --depth 1 https://github.com/zb3/gnome-gamma-tool ~/gnome-gamma-tool
cd ~/gnome-gamma-tool
./gnome-gamma-tool.py -g 0.95 -t 5200   # FINAL (2026-08-06): warm 5200K via VCGT, night light OFF
```

- `-g 0.95` — gamma (0.9 = brighter/softer midtones but washed out; 0.95 is the
  sweet spot; 1.0 = neutral). Per channel: `-g 0.95:0.95:0.95`.
- `-t 5200` — color temperature (warm, "Windows feel", works WITHOUT Night Light).
  Tuning history on this setup: 4800–5300 all tested, user landed at 5200.
- `-c 1.05` — contrast (1 = default; `-1` inverts).
- `-b 0.7` — brightness (decrease only, max output; 1 = neutral). `-bm 0.05` — minimum black level.
- `-a` — apply to all monitors; `-d N` — display index (same order as Settings → Color).

Prerequisite check (Fedora):
```bash
python3 -c "import gi; gi.require_version('Colord','1.0'); from gi.repository import Colord"
```
(Debian/Ubuntu needs `gir1.2-colord-1.0`, openSUSE `typelib-1_0-Colord-1_0`.)

## 3. Verify the profile is active

```bash
colormgr get-devices
```
The active profile should show `gnome-gamma-tool-<uuid>.icc` under `Profile 1`
(original EDID profile under `Profile 2`).


## 4. Monitor OSD + DDC/CI (brightness/color) — needs proprietary NVIDIA driver

STATUS: with the proprietary NVIDIA driver DDC/CI works; with nouveau it is dead
(no monitor responds on any i2c bus). Find the display's bus:
`ddcutil detect` → note the `I2C bus: /dev/i2c-N` next to `Display 1`.
GOTCHA: `ddcutil` always prints "Device /dev/i2c-0 ... EACCES" — that bus is the
GPU adapter with no display; IGNORE it, the display bus works fine.

Findings + fixes (the REAL cause of the cold/flat look):
- **Color preset was 7500 K** (cold!) → set to **6500 K**: `ddcutil setvcp 14 0x05`.
  Available presets (VCP 0x14): 01=sRGB, 05=6500K, 06=7500K, 08=9300K, 0b=User 1.
- **Contrast was 50/100** (flat, washed out) → set to **75**: `ddcutil setvcp 12 75`.
- **Brightness was 99/100** (max — harsh white) → set to **80**: `ddcutil setvcp 10 80`.
- After the 6500K preset, per-channel video gain (VCP 16/18/1A) auto-adjusted to
  R > B (warmer at hardware level).
- Save into monitor EEPROM: `ddcutil setvcp 0C 1` (also via OSD menu save).
- GOTCHA: switching the color preset (0x14) RESETS contrast back to 50 and the
  gains — always re-apply in this order: preset → contrast → brightness → save.
  After saving, values persist across power cycles.
- Other commands: `ddcutil getvcp 14` (check preset), `ddcutil capabilities`
  (list features). Works on Wayland. Permissions: Fedora ships 60-ddcutil-i2c.rules
  with uaccess tag (works for the logged-in user without sudo).
- Manual OSD options (monitor buttons): RGB range = **full** (not limited), picture
  mode "Warm"/"sRGB", saturation/vivid control — the only way to get
  "Digital Vibrance" punch (VCGT cannot change saturation).

## 5. Verify after relogin / next session

One command checks everything at once (windows-look parts — see the reference):

```bash
echo "== Night Light (expect false or user-chosen)"; gsettings get org.gnome.settings-daemon.plugins.color night-light-enabled; \
gsettings get org.gnome.settings-daemon.plugins.color night-light-temperature; \
gsettings get org.gnome.settings-daemon.plugins.color night-light-schedule-automatic
echo "== Gamma profile (expect gnome-gamma-tool-*.icc under Profile 1)"; \
colormgr get-devices | grep -E 'Profile 1|Profile 2'
echo "== Monitor via DDC (expect 6500 K / 75 / 80)"; ddcutil getvcp 14 2>/dev/null | grep -iE 'current'; \
ddcutil getvcp 12 2>/dev/null | grep -iE 'current'; ddcutil getvcp 10 2>/dev/null | grep -iE 'current'
echo "== UI (expect Segoe UI 11 / Cascadia Mono 11 / Fluent-dark / win11-aero / prefer-dark / appmenu:minimize,maximize,close / blue / 1.1 / Windows-10-Fluent-Dark)"; \
gsettings get org.gnome.desktop.interface font-name; gsettings get org.gnome.desktop.interface monospace-font-name; \
gsettings get org.gnome.desktop.interface icon-theme; gsettings get org.gnome.desktop.interface cursor-theme; \
gsettings get org.gnome.desktop.interface color-scheme; gsettings get org.gnome.desktop.wm.preferences button-layout; \
gsettings get org.gnome.desktop.interface accent-color; gsettings get org.gnome.desktop.interface text-scaling-factor; \
gsettings get org.gnome.desktop.interface gtk-theme
echo "== Wallpaper (expect solid black)"; gsettings get org.gnome.desktop.background primary-color; \
gsettings get org.gnome.desktop.background picture-uri-dark; gsettings get org.gnome.desktop.background color-shading-type
echo "== Sounds (expect win11)"; gsettings get org.gnome.desktop.sound theme-name
echo "== Fonts installed"; fc-list | grep -ci segoe; fc-list | grep -ci cascadia
echo "== Extensions (expect State: ACTIVE for all 4)"; \
for u in dash-to-panel@jderose9.github.com arcmenu@arcmenu.com blur-my-shell@aunetx ding@rastersoft.com; do \
  echo "$u: $(gnome-extensions info "$u" 2>/dev/null | grep -i -E 'state' | head -1)"; done
echo "== Extension schemas visible to gsettings"; gsettings list-schemas | grep -E 'dash-to-panel|arcmenu|blur-my-shell|ding' | wc -l
```

Expected results / what each check means:
- Night Light: `false` by user choice (2026-08-06) — do NOT force it on; if user
  enabled it and it flipped back to `false` (known gsd-color behavior — flips
  coincide with gsd-color service restarts), re-set it LAST (see §1).
- Extensions: `INITIALIZED` = shell scanned them but not enabled → enable via the
  gdbus call (see reference §4); `ACTIVE` = running. Empty output = extension dir
  not scanned → relogin needed (shell only scans at startup).
- `accent-color` returns nothing on GNOME < 47 (fine).
- Schema count should be 4+ (includes blur sub-schemas). If 0 → recreate
  `~/.local/share/glib-2.0/schemas/` from the extensions' `schemas/*.xml` (reference §4).
- Fonts count ≥ 1 each (Segoe UI / Cascadia). If 0 → re-run the fc-cache/install steps (reference §3).
- DDC lines: `6500 K (sl=0x05)` / contrast `75` / brightness `80`. `ddcutil` prints
  an EACCES warning about /dev/i2c-0 — harmless noise, the display is on another bus.

## Rollback

- Night Light: `gsettings set org.gnome.settings-daemon.plugins.color night-light-enabled false`
- Gamma: re-run tool with neutral values (`-g 1.0`) or remove the profile via
  `colormgr delete-profile <profile-id>` (list ids with `colormgr get-profiles`).
- The tool itself can be deleted after applying; the profile persists.
- Windows-look rollbacks (cursors, sounds, extensions, dark theme, sudo) —
  `references/windows-look-extras.md` §Rollback.

## Notes

- GPU matters: with NVIDIA proprietary driver, `nvidia-settings` color controls
  are X11-only and do nothing under GNOME Wayland. The proprietary driver is also
  required for DDC/CI to work (nouveau: no i2c response).
- The single biggest "cold/flat" fix is the monitor's own color preset (7500 K → 6500 K).
  Combined stack: 6500K preset × VCGT 5000K × gamma 0.95 × DDC brightness 80 × contrast 75.
- Everything here is user-scope (gsettings, `~/.local/share/icc/`), no sudo needed
  except for package installs and system-extension installs.

