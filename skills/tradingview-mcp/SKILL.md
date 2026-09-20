---
name: tradingview-mcp
description: >-
  Connect a coding agent to a locally running TradingView Desktop app over the
  Chrome DevTools Protocol: switch tickers/timeframes, read prices, indicators
  and chart data, take chart screenshots, and read Pine Script — AI-assisted
  chart analysis, not automated trading. Use when the user mentions TradingView,
  chart analysis, or asks the agent to look at / capture a chart. Not for
  placing orders — the server deliberately has no trade execution.
license: MIT
metadata:
  source: https://github.com/tradesdontlie/tradingview-mcp
  runtimeClone: tools/tradingview-mcp
  installedAt: 2026-09-06
  restriction: READ-ONLY profile per owner decision 2026-09-06
---

# tradingview-mcp (wrapper skill, READ-ONLY profile)

Runtime is a real MCP server, not a prompt skill. Source clone:
`tools/tradingview-mcp/`. ~84 tools total; **this workspace uses it in
read-only profile** — navigation, reading, and screenshots only.

## Allowed tool families (whitelist)

- Chart navigation: switch ticker, timeframe, layouts (harmless UI control)
- Reading: prices, indicators, chart data, drawing/line inspection
- Screenshots: `screenshot`-family tools
- Bar Replay: allowed for analysis playback
- Pine Script: READ only (view existing scripts). Do not write/compile
  without an explicit user request in that session.

## Do NOT use without explicit per-session approval

- Creating/deleting alerts
- Writing or compiling Pine Script
- Any multi-chart mutation beyond navigation

## Setup (first use, on the machine running TradingView Desktop)

1. Read `tools/tradingview-mcp/README.md` and `SETUP_GUIDE.md` — flags change,
   never trust memory.
2. Enable Chrome DevTools Protocol in TradingView Desktop (per SETUP_GUIDE).
3. Register the MCP server with the agent runtime (config differs per agent —
   follow the repo's current instructions).
4. Verify with one safe call: take a chart screenshot.

## Boundaries

- Requires local TradingView Desktop running; there is no cloud mode.
- Read-only is an owner decision (2026-09-06) — do not silently widen it.
