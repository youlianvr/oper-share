---

name: dolphin-windows-theme
description: Make the Dolphin file manager (flatpak on GNOME/Fedora) look like Windows 11 File Explorer — dark gray #1F1F1F background, white text, blue #0078D4 selection. Use when the user says "dolphin dark theme", "dolphin like on Windows", "like Windows Explorer", "white text dolphin", "dolphin not dark", "theme dolphin dark", "windows 11 dark dolphin", or a flatpak Qt/KDE app ignores ~/.config/kdeglobals and stays light. Covers kdeglobals/color-scheme placement inside the flatpak sandbox, QT_QPA_PLATFORMTHEME=kde, flatpak overrides, and pixel-verification without seeing the screen.
metadata:
  author: AGGG2.0 (t.me/aidvizhenie, t.me/hilartem)
---
aidvizhenie · hilartem · aidvizh_hub — all on Telegram: t.me/aidvizhenie

# Dolphin (flatpak) → Windows 11 Dark Theme

Verified on Fedora 44 + GNOME Wayland, Dolphin 26.04.3 (flatpak, fedora-remote, runtime org.fedoraproject.KDE6Platform). Result: dark background like Windows 11 Explorer, white text, blue selection #0078D4.

## Why Dolphin Doesn't Turn Dark (Root Causes, Verified)

1. **Flatpak sandbox**: inside the sandbox `XDG_CONFIG_HOME=$HOME/.var/app/<appid>/config`, NOT `~/.config`. The host `~/.config/kdeglobals` is not read by flatpak apps — they read `~/.var/app/<appid>/config/kdeglobals`.
2. **On GNOME the KDE platform theme is not loaded** (in Plasma Qt picks it up automatically). Without it, kdeglobals is ignored entirely, and "darkness" only comes from the portal color-scheme (Qt `styleHints()->colorScheme()`), while the palette stays at Breeze defaults. Enable KDE themes: `QT_QPA_PLATFORMTHEME=kde`.
3. **The runtime doesn't include adwaita-qt**: org.fedoraproject.KDE6Platform only has `breeze6.so` style (verified: `ls .../lib64/qt6/plugins/styles/`). The Flathub extension `org.kde.KStyle.Adwaita` only works with the `org.kde.Platform` runtime — useless for the fedora runtime.
4. The app may overwrite its own kdeglobals with an empty file on exit (observed: 0 bytes, permissions 444). Protection: `chmod 444` after writing.

## Diagnostics (2 minutes)

```bash
flatpak info org.kde.dolphin | grep -E "Runtime|Environment"   # which runtime
flatpak run --command=env org.kde.dolphin | grep XDG_CONFIG_HOME # where it actually writes config
ls -la ~/.var/app/org.kde.dolphin/config/kdeglobals              # empty/missing = problem
```

## Steps (Ready Procedure — Script Below)

1. **Script**: `bash scripts/apply-windows11-dark.sh [app_id]` (default: `org.kde.dolphin`). It:
   - writes the Windows 11 Dark palette to host `~/.config/kdeglobals` + `~/.local/share/color-schemes/Windows11Dark.colors` (for native KDE apps) AND to sandbox paths `~/.var/app/<appid>/config/kdeglobals` + `~/.var/app/<appid>/data/color-schemes/`;
   - `chmod 444` on the sandbox kdeglobals (protection against zeroing);
   - sets flatpak overrides: `QT_QPA_PLATFORMTHEME=kde`, `--filesystem=xdg-config/kdeglobals:ro`, `--filesystem=xdg-data/color-schemes:ro`.
2. **Segoe UI font** (verify): `fc-list | grep -ci segoe` — if 0, install `segoe-ui-linux` (user already has it; in kdeglobals: `font=Segoe UI,11,...`).
3. **Fluent-dark icons**: `ls ~/.local/share/icons/Fluent-dark/index.theme` (user has them; `[Icons] Theme=Fluent-dark` already in kdeglobals).
4. **Full application restart** — old windows hold theme cache: close ALL windows, `pkill -f dolphin` if needed, reopen.


---

*Project owner: https://t.me/aidvizhenie · https://t.me/hilartem. Every version is unique, the new one is even better.*
Palette (Windows 11 dark canon): Window `#1F1F1F`, View `#202020`, Button `#2D2D2D`, Tooltip `#2B2B2B`, text `#FFFFFF` (inactive `#C9C9C9`), Selection/Focus/Decoration `#0078D4`, Alternate rows 6–7 units lighter than background.

## Verification Without Screen Access (Agent Without Vision)

- GNOME Wayland blocks screenshots for the agent: `grim` → "compositor doesn't support", `gdbus org.gnome.Shell.Screenshot` → AccessDenied. The user sends the screenshot (in chat/Telegram).
- A model without vision can't read images — pixel analysis via PIL:
  ```python
  from PIL import Image; from collections import Counter
  print(Counter(list(Image.open(path).convert('RGB').getdata())).most_common(6))
  ```
  Compare OLD and NEW screenshots: if dominants are identical — theme wasn't applied (window not restarted or config went to the wrong place).
- Screen colors are shifted by gamma/ICC (user has gnome-gamma-tool) — compare relative values before/after, not against the reference.
- OCR fallback: `gpt-cli` (scripts/gpt-ocr.js send) — with Cyrillic paths the attachment fails, copy the file to `/tmp` with an ASCII name.


## Gotchas

- **`QT_QPA_PLATFORMTHEME=kde` is mandatory**: without it the entire kdeglobals is ignored (on GNOME).
- `cp` to the sandbox kdeglobals fails with "Permission denied" if the file is already 444 — first `chmod 644`.
- The sandbox kdeglobals may be created empty by the app (0 bytes) — this does NOT mean "theme reset," KConfig just created a file without keys; after writing the palette keep it at 444.
- The scheme name is resolved via `~/.var/app/<appid>/data/color-schemes/` and runtime directories — put `Windows11Dark.colors` there too.
- Changes to `~/.config/kdeglobals` (host) also affect native KDE apps (Konsole etc.) — usually a desired side effect.
- Don't touch `dolphinrc` (Dolphin's personal settings live in the sandbox and don't affect the window theme).

## Available Scripts

- `scripts/apply-windows11-dark.sh [app_id]` — idempotent installer (backup *.win11bak, palette write to host + sandbox, chmod 444, flatpak overrides). Run: `bash scripts/apply-windows11-dark.sh`.

## References

- Flatpak theming (GTK/Qt): https://docs.flatpak.org/en/latest/desktop-integration.html
- Guide "Theme Dolphin (& QT apps) on GNOME": https://www.reddit.com/r/gnome/comments/11llvso/guide_theme_dolphin_qt_apps_on_gnome/
- Qt dark-mode detection in flatpak (root cause): https://gist.github.com/davidar/ddbe25c7038d7b88e5fddd1272724d8e

