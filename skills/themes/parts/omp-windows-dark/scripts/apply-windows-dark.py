#!/usr/bin/env python3

"""Install the Windows-dark (One Half Dark) theme for the omp CLI.

Writes ~/.omp/agent/themes/<name>.json (full theme embedded) and sets
theme.dark=<name> in ~/.omp/agent/config.yml (creates the theme: block if absent).

Idempotent; does NOT restart omp (never kills live sessions).

Exit codes: 0 = ok, 1 = error, 2 = usage error.
"""
import argparse
import json
import os
import sys


THEME = {
    "name": "windows-dark",
    "vars": {
        "bg": "#282c34", "fg": "#dcdfe4", "fgDim": "#abb2bf",
        "comment": "#5c6370", "muted": "#5d637a", "border": "#3e4452",
        "blue": "#61afef", "green": "#98c379", "yellow": "#e5c07b",
        "red": "#e06c75", "magenta": "#c678dd", "cyan": "#56b6c2",
        "orange": "#d19a66",
    },
    "colors": {
        "accent": "blue", "border": "border", "borderAccent": "blue",
        "borderMuted": "muted", "success": "green", "error": "red",
        "warning": "yellow", "muted": "muted", "dim": "#4b5263",
        "text": "fg", "thinkingText": "fgDim",
        "selectedBg": "border", "userMessageBg": "bg", "userMessageText": "fg",
        "customMessageBg": "#2c323c", "customMessageText": "fg",
        "customMessageLabel": "blue", "toolPendingBg": "#23272f",
        "toolSuccessBg": "#23272f", "toolErrorBg": "#23272f",
        "toolTitle": "fg", "toolOutput": "fgDim",
        "mdHeading": "blue", "mdLink": "blue", "mdLinkUrl": "muted",
        "mdCode": "fg", "mdCodeBlock": "fgDim", "mdCodeBlockBorder": "border",
        "mdQuote": "fgDim", "mdQuoteBorder": "border", "mdHr": "muted",
        "mdListBullet": "blue",
        "toolDiffAdded": "green", "toolDiffRemoved": "red", "toolDiffContext": "muted",
        "syntaxComment": "comment", "syntaxKeyword": "magenta",
        "syntaxFunction": "blue", "syntaxVariable": "fg", "syntaxString": "green",
        "syntaxNumber": "orange", "syntaxType": "yellow", "syntaxOperator": "cyan",
        "syntaxPunctuation": "fgDim",
        "thinkingOff": "muted", "thinkingMinimal": "fgDim", "thinkingLow": "blue",
        "thinkingMedium": "cyan", "thinkingHigh": "magenta", "thinkingXhigh": "red",
        "thinkingMax": "orange",
        "bashMode": "cyan", "pythonMode": "magenta",
        "statusLineBg": "#21252b", "statusLineSep": "muted",
        "statusLineModel": "magenta", "statusLinePath": "blue",
        "statusLineGitClean": "green", "statusLineGitDirty": "yellow",
        "statusLineContext": "cyan", "statusLineSpend": "blue",
        "statusLineStaged": "green", "statusLineDirty": "yellow",
        "statusLineUntracked": "red", "statusLineOutput": "fgDim",
        "statusLineCost": "orange", "statusLineSubagents": "magenta",
    },
    "export": {"pageBg": "#282c34", "cardBg": "#21252b", "infoBg": "#23272f"},
}


def set_dark_theme(cfg_path, name):
    """Return new config.yml content with theme.dark=<name> set."""
    with open(cfg_path, "r", encoding="utf-8") as f:
        lines = f.read().splitlines(keepends=True)

    theme_idx = next((i for i, ln in enumerate(lines) if ln.strip() == "theme:"), None)
    if theme_idx is None:
        out = list(lines)
        if out and not out[-1].endswith("\n"):
            out.append("\n")
        out.append(f"\ntheme:\n  dark: {name}\n")
        return "".join(out)

    end = len(lines)
    for i in range(theme_idx + 1, len(lines)):
        if lines[i].strip() and not lines[i].startswith(" "):
            end = i
            break
    block = lines[theme_idx + 1 : end]
    new_block, replaced = [], False
    for ln in block:
        if ln.startswith("  dark:"):
            new_block.append(f"  dark: {name}\n")
            replaced = True
        else:
            new_block.append(ln)
    if not replaced:
        new_block.insert(0, f"  dark: {name}\n")
    return "".join(lines[: theme_idx + 1] + new_block + lines[end:])




def main():
    ap = argparse.ArgumentParser(
        prog="apply-windows-dark.py",
        description="Install the Windows-dark (One Half Dark) theme for the omp CLI.",
    )
    ap.add_argument("--name", default="windows-dark",
                    help="theme name (default: windows-dark)")
    ap.add_argument("--dry-run", action="store_true",
                    help="print what would change without writing")
    ap.add_argument("--agent-dir", default=os.path.expanduser("~/.omp/agent"),
                    help="omp agent dir (default: ~/.omp/agent)")
    args = ap.parse_args()

    theme = dict(THEME)
    theme["name"] = args.name
    themes_dir = os.path.join(args.agent_dir, "themes")
    theme_path = os.path.join(themes_dir, f"{args.name}.json")
    cfg_path = os.path.join(args.agent_dir, "config.yml")

    try:
        os.makedirs(themes_dir, exist_ok=True)
    except OSError as e:
        print(f"error: cannot create {themes_dir}: {e}", file=sys.stderr)
        return 1

    new_theme = json.dumps(theme, indent=2) + "\n"
    if os.path.isfile(theme_path):
        with open(theme_path, encoding="utf-8") as f:
            theme_changed = f.read() != new_theme
    else:
        theme_changed = True  # file missing — theme will change (will be written)

    if os.path.isfile(cfg_path):
        new_cfg = set_dark_theme(cfg_path, args.name)
        with open(cfg_path, encoding="utf-8") as f:
            cfg_changed = f.read() != new_cfg
    else:
        new_cfg = f"theme:\n  dark: {args.name}\n"
        cfg_changed = True

    if args.dry_run:
        print(f"would write theme: {theme_path}" + (" (changed)" if theme_changed else " (unchanged)"))
        print(f"would set theme.dark={args.name} in: {cfg_path}" + (" (changed)" if cfg_changed else " (unchanged)"))
        if theme_changed:
            print("--- theme json ---")
            print(new_theme, end="")
        if cfg_changed:
            print("--- config.yml ---")
            print(new_cfg, end="")
        return 0

    if theme_changed:
        with open(theme_path, "w", encoding="utf-8") as f:
            f.write(new_theme)
        print(f"wrote theme: {theme_path}")
    if cfg_changed:
        tmp = cfg_path + ".tmp"
        with open(tmp, "w", encoding="utf-8") as f:
            f.write(new_cfg)
        os.replace(tmp, cfg_path)
        print(f"set theme.dark={args.name} in {cfg_path}")

    if not theme_changed and not cfg_changed:
        print("no changes (already applied)")
    return 0


if __name__ == "__main__":
    sys.exit(main())

