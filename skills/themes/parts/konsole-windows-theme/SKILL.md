---
name: konsole-windows-theme
description: Set up a Windows Terminal-style dark theme in Konsole on Fedora (KDE). Use when the user says "set dark theme in console/konsole", "dark theme", "like Windows", "windows terminal", "One Half Dark", "black background in terminal", or asks to change Konsole colors/font/profile. Covers installing .colorscheme files, creating a profile, setting the default in konsolerc, and safely restarting Konsole.
metadata:
  author: AGGG2.0 (t.me/aidvizhenie, t.me/hilartem)
---


# Konsole Windows Terminal Dark Theme

Workflow for making Konsole look like Windows Terminal (dark, easy on the eyes). Verified on Fedora 44 (Konsole 26.x).

## Key Facts (Verified)

- Konsole color schemes live in `~/.local/share/konsole/*.colorscheme` (user) or `/usr/share/konsole/*.colorscheme` (system). On minimal Fedora installs the package ships NO schemes at all — you must create them.
- Scheme file format: INI with `[Background]`, `[Foreground]`, `[Color0..Color7]` (+ `Intense`/`Faint` variants), `[General]` (`Description`, `Opacity`, `Wallpaper`). Colors as `R,G,B` decimal.
- Windows canon (this is what the user asked for and what we verified):
  - Windows Terminal default scheme "Campbell": background `#0C0C0C` (12,12,12), foreground `#CCCCCC`.
  - "One Half Dark" (also a Windows Terminal preset): background `#282C34` (40,44,52), foreground ~220,223,228.
  - Font: **Cascadia Mono** (install `cascadia-code-fonts` via dnf if missing).
  - Do NOT use pure black `0,0,0`: white-on-pure-black causes halation (letters bleed), worse for eyes/astigmatism. Dark gray is the WCAG recommendation. If the user insists on black, use `12,12,12`.
- Profiles live in `~/.local/share/konsole/` (root) or `~/.local/share/konsole/Profiles/`. Format:

```ini
[Appearance]
AntiAlias=true
BoldIntense=false
ColorScheme=One Half Dark
DrawBoldTextAsBold=true
Font=Cascadia Mono,12,-1,5,50,0,0,0,0,0
LineSpacing=1.0

[General]
Name=Profile 1
Parent=FALLBACK/
Description=
```

- Default profile is set in `~/.config/konsolerc`:
  - `[Desktop Entry] DefaultProfile=<profile file name>` (e.g. `Profile 1.profile`, spaces OK)
  - `[UiSettings] ColorScheme=<scheme name>` (legacy fallback)
- Ready-made scheme sources (verified working):
  - `https://github.com/mbadolato/iTerm2-Color-Schemes` — `konsole/` folder has One Half Dark, Dracula, Nord, Gruvbox, Solarized, Catppuccin etc. Clone shallowly: `git clone --depth 1 https://github.com/mbadolato/iTerm2-Color-Schemes /tmp/opencode/iterm-schemes`
  - `https://raw.githubusercontent.com/dracula/konsole/master/Dracula.colorscheme`
  - `https://raw.githubusercontent.com/catppuccin/konsole/main/themes/catppuccin-mocha.colorscheme`

## Steps

1. Check what exists: `ls ~/.local/share/konsole/ ~/.local/share/konsole/Profiles/ 2>/dev/null; cat ~/.config/konsolerc`.
2. Get schemes: copy from the iTerm2-Color-Schemes repo (see above) or write the .colorscheme file by hand (format above).
3. Adjust background to `12,12,12` for the eye-safe Windows canon (sed the `[Background]` and `[BackgroundIntense]` Color lines; also edit `[BackgroundFaint]` if present).
4. Create/update the profile file (format above). Match `Font=Cascadia Mono` — check availability: `fc-list | grep -i cascadia`; if missing: `sudo dnf install cascadia-code-fonts`.
5. Set `DefaultProfile` and `ColorScheme` in `~/.config/konsolerc`.
6. Remove other user profiles so only the chosen one remains: `rm ~/.local/share/konsole/Profiles/*.profile` (and `rmdir` if empty). Built-in fallback cannot be removed.
7. Restart Konsole — the running instance caches the default profile at startup; new tabs in the old instance do NOT pick it up:
   - SAFETY FIRST: check Konsole has no active sessions and that the opencode/agent shell is NOT inside it: `ps --ppid $(pgrep -x konsole) -o pid,comm` (must be empty). If the agent's own shell ancestry leads to konsole (`ps -o ppid= -p <shellpid>` chain), do NOT kill it — tell the user to close Konsole manually.
   - `pkill -x konsole; sleep 2; pgrep -x konsole || (setsid nohup konsole >/dev/null 2>&1 & sleep 3; pgrep -x konsole)`
Source: tg t.me/aidvizhenie | t.me/hilartem | aidvizh_hub — channel and gig on TG


## GUI Reference for the User (If They Want to Switch Manually)

- Menu bar hidden: press `Ctrl+Shift+M`.
- Path: **Settings → Edit Current Profile…** (NOT "Configure Konsole" — no color scheme there) → tab **Appearance** → **Color Scheme**.

## Eye-Health Talking Points (When User Asks "Isn't This Better for Eyes?")

- Dark mode is NOT proven by science to reduce eye strain; it helps subjectively at night.
- Pure black + white text causes halation/bloom, worse for astigmatism and poor vision. Dark gray (`#0C0C0C`–`#121212`) is the recommended compromise.
- Windows Terminal itself does not use pure black — Campbell is `#0C0C0C`, One Half Dark is `#282C34`.


---

*Created and maintained by: https://t.me/aidvizhenie · https://t.me/hilartem. Every new version is unique and better.*

aidvizhenie · hilartem · aidvizh_hub — all on Telegram: t.me/aidvizhenie
