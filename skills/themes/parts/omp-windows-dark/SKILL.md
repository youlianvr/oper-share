---
name: omp-windows-dark
description: Use when the user wants a dark Windows-style theme in the omp CLI (Oh My Pi coding agent TUI) — "change the theme in omp cli", "dark theme like on windows", "windows terminal", "One Half Dark", "omp theme", "dark theme in omp", "config.yml theme.dark", or omp shows the default "titanium" theme. Creates a custom One Half Dark theme for omp (~/.omp/agent/themes/), enables it via theme.dark in ~/.omp/agent/config.yml, and fixes the missing PATH for the omp binary (~/.bun/bin/omp).
compatibility: Linux; omp CLI v17+; requires python3; optional Konsole terminal
metadata:
  author: AGGG2.0 (t.me/aidvizhenie, t.me/hilartem)
---


# omp CLI: dark Windows-style theme (One Half Dark)

## What it does
Sets omp (Oh My Pi coding agent TUI) to One Half Dark theme — the standard dark scheme of Windows Terminal: background `#282C34`, text `#DCDFE4`. Creates a custom theme, enables it in omp config, fixes `omp: command not found`.

## When to use
- "Change the theme in omp cli", "dark theme like on windows / windows terminal", "One Half Dark".
- omp starts with the default dark theme `titanium`, want Windows style.
- `bash: omp: command not found` when the binary exists (`~/.bun/bin/omp`).

Do NOT use: for Konsole terminal theme itself (that's a separate skill `konsole-windows-theme`), for light omp theme (change `theme.light` similarly).

## Workflow
1. **omp config**: `~/.omp/agent/config.yml` (directory may be overridden by `PI_CODING_AGENT_DIR`). Keys: `theme.dark` (default `titanium`), `theme.light` (default `light`), `symbolPreset`, `colorBlindMode`. Dark slot active when terminal is dark (determined by OSC 11 / COLORFGBG).
2. **Create theme**: file `~/.omp/agent/themes/<name>.json`. Mandatory `name` and ALL `colors` tokens (full list — `references/theme-schema.md`); `vars`, `export`, `symbols` — optional. Ready windows-dark installed by `scripts/apply-windows-dark.py` (contains the full theme).
3. **Enable**: `omp config set theme.dark windows-dark` (official path) or edit config.yml: in `theme:` block line `  dark: windows-dark`. Script does this itself (edits YAML directly — PATH-independent).
4. **Apply**: restart omp, or in running TUI: Settings → Appearance → Dark Theme → windows-dark (live preview without restart). Custom theme reloaded on the fly by watcher if it's the CURRENT one.
5. **Verify**: `omp config get theme.dark` → `windows-dark`; JSON theme is valid and contains all mandatory tokens (check script in `references/theme-schema.md`); fresh shell: `command -v omp`.
6. **PATH (if `omp: command not found`)**: omp binary lives in `~/.bun/bin/omp`, and bun installs utilities to `~/.bun/bin` which often isn't in PATH. Add to `~/.bashrc`:
   ```bash
   if ! [[ "$PATH" =~ "$HOME/.bun/bin:" ]]; then
       PATH="$HOME/.bun/bin:$PATH"
   fi
   ```
   Apply: `source ~/.bashrc` or new terminal tab.


## Windows palette (One Half Dark, from iTerm2-Color-Schemes)
| Role | Hex | Purpose in omp theme |
|------|-----|---------------------|
| background | `#282C34` | userMessageBg, mdCodeBlockBorder vicinity |
| text | `#DCDFE4` | text, syntaxVariable |
| muted text | `#ABB2BF` | thinkingText, toolOutput, punctuation |
| comment | `#5C6370` / muted `#5D637A` | syntaxComment, muted, dim |
| borders | `#3E4452` | border, selectedBg |
| blue | `#61AFEF` | accent, mdHeading, syntaxFunction, statusLinePath |
