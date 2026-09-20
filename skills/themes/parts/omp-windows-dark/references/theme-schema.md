# omp theme schema (Oh My Pi TUI)

Source: omp's internal documentation (`omp://theme.md`, v17). A theme file is
JSON validated at runtime (`themeJsonSchema` in `src/modes/theme/theme.ts`).

## Files and settings
- Custom themes: `~/.omp/agent/themes/<name>.json` (directory overridable via
  `PI_CODING_AGENT_DIR/themes`).
- Settings: `~/.omp/agent/config.yml` → `theme.dark` (default `titanium`),
  `theme.light` (default `light`), `symbolPreset` (default `unicode`),
  `colorBlindMode`.
- CLI: `omp config get|set <key> <value>` (e.g.
  `omp config set theme.dark windows-dark`).
- Built-in themes: `dark`, `light`, `defaults/*` — take priority over custom
  themes with the same name.

## Top-level JSON fields
- `name` (required) — must match the file name.
- `colors` (required) — all tokens below.
- `vars` (optional) — colour variables; values: hex / 256-index / a reference
  to another var.
- `export` (optional) — `pageBg`, `cardBg`, `infoBg` for HTML export.
- `symbols` (optional) — `preset: unicode|nerd|ascii`, `overrides`,
  `spinnerFrames`.

## Required colors tokens (66 + 1 optional)

### Core text and frames (11)
`accent`, `border`, `borderAccent`, `borderMuted`, `success`, `error`,
`warning`, `muted`, `dim`, `text`, `thinkingText`

### Background blocks (7)
`selectedBg`, `userMessageBg`, `customMessageBg`, `toolPendingBg`,
`toolSuccessBg`, `toolErrorBg`, `statusLineBg`

### Message/tool text (5)
`userMessageText`, `customMessageText`, `customMessageLabel`, `toolTitle`,
`toolOutput`

### Markdown (10)
`mdHeading`, `mdLink`, `mdLinkUrl`, `mdCode`, `mdCodeBlock`,
`mdCodeBlockBorder`, `mdQuote`, `mdQuoteBorder`, `mdHr`, `mdListBullet`

### Diff + syntax (12)
`toolDiffAdded`, `toolDiffRemoved`, `toolDiffContext`,
`syntaxComment`, `syntaxKeyword`, `syntaxFunction`, `syntaxVariable`,
`syntaxString`, `syntaxNumber`, `syntaxType`, `syntaxOperator`,
`syntaxPunctuation`

### Modes/thinking (8 + 1 optional)
`thinkingOff`, `thinkingMinimal`, `thinkingLow`, `thinkingMedium`,
`thinkingHigh`, `thinkingXhigh`,
`thinkingMax` (optional, falls back to `thinkingXhigh`),
`bashMode`, `pythonMode`

### Status line (13)
`statusLineSep`, `statusLineModel`, `statusLinePath`, `statusLineGitClean`,
`statusLineGitDirty`, `statusLineContext`, `statusLineSpend`,
`statusLineStaged`, `statusLineDirty`, `statusLineUntracked`,
`statusLineOutput`, `statusLineCost`, `statusLineSubagents`


## Colour values
- hex: `"#RRGGBB"`
- 256-index: `0..255` (converted to `38;5`/`48;5`)
- a `vars` reference: `"myvar"` — resolved recursively; cyclic references are
  an error
- an empty string `""` — terminal default (`\x1b[39m` fg / `\x1b[49m` bg)

## Error behaviour
- A missing required token / bad type / unknown variable → a validation error
  with the JSON path.
- `setTheme` on error falls back to the built-in `dark` (returns
  `{success:false, error}`).
- `previewTheme` (live preview in Settings) on error does NOT replace the
  current theme.
- Unknown theme name: `Theme not found: <name>`.
- Watcher: watches only the CURRENT custom theme's file; reload errors keep
  the last good state.

## Validator (python3, dependency-free)
```python
import json, sys
required = """accent border borderAccent borderMuted success error warning muted dim text thinkingText
selectedBg userMessageBg customMessageBg toolPendingBg toolSuccessBg toolErrorBg statusLineBg
userMessageText customMessageText customMessageLabel toolTitle toolOutput
mdHeading mdLink mdLinkUrl mdCode mdCodeBlock mdCodeBlockBorder mdQuote mdQuoteBorder mdHr mdListBullet
toolDiffAdded toolDiffRemoved toolDiffContext
syntaxComment syntaxKeyword syntaxFunction syntaxVariable syntaxString syntaxNumber syntaxType syntaxOperator syntaxPunctuation
thinkingOff thinkingMinimal thinkingLow thinkingMedium thinkingHigh thinkingXhigh bashMode pythonMode
statusLineSep statusLineModel statusLinePath statusLineGitClean statusLineGitDirty statusLineContext statusLineSpend statusLineStaged statusLineDirty statusLineUntracked statusLineOutput statusLineCost statusLineSubagents""".split()
t = json.load(open(sys.argv[1]))
missing = [k for k in required if k not in t.get("colors", {})]
print("missing:", missing or "NONE")
print("name:", t.get("name"))
```
