# tools/ sweep — 15 clones recycled, 2 untracked to _archive (2026-09-20)

Owner-verified verdicts after a live-reference sweep (grep across skills,
docs, memory): every tool below had **zero live references**. All gitlinks
carry upstream remotes — restorable with one `git clone`. Recycled via
`_scripts/trash.sh`, not deleted.

## Recycled (13 clones + 2 utility dirs)

| Tool | Size | What it was | Restore |
|---|---|---|---|
| `va-venv` | 378M | Python venv for Vision-Agents launcher (`tools/va.sh`) — recreated in minutes by the script | `bash tools/va.sh --init` (script kept) |
| `OpenBiliClaw` | 110M | Bilibili automation fork, trial clone (whiteguo233/OpenBiliClaw) | clone + `git checkout` gitlink SHA |
| `codex-host` | 47M | Harness runner inside Codex Desktop (BytePioneer-AI, zh README) | clone |
| `claude-skills-megapack` | 37M | Source of the 229-skill megapack — fully reviewed in 9 batches; skills live in `.agents/skills/` | clone |
| `claude-code-tips` | 40M | Content repo of Claude Code articles | clone |
| `nodriver` | 32M | Webdriver-less async browser lib (ultrafunkamsterdam); browser layer moved to playwright/browsermcp | clone |
| `graphify` | 22M | Diagram generation (Graphify-Labs); mermaid covers our diagram needs | clone |
| `NtWarden` | 11M | Windows forensics audit (mrT4ntr4) | clone |
| `browser-harness` | 3.1M | Test harness from browser-use team | clone |
| `captcha-solver`-related: kept — see below | — | — | — |
| `caveman-dvizh-skills` | 1.1M | Skill pack from "caveman" selection | clone/source |
| `CanaryArchiver` | 398K | Archiver clone from aidvizhhub | clone |
| `ai-copywriter` | 514K | AI copywriter clone | clone |
| `anti-slop` | 847K | AI-slop text detector, never invoked | clone |

## Untracked to `_archive/2026-09/` (no remote — recycle = permanent loss)

- `OpenViking` (155M, 3970 tracked files) — "context DB as filesystem"; source
  of finding 2026-07-31 and vibecoding posts. `git rm --cached` — repo sheds
  its largest tracked ballast; body preserved on disk.
- `computer` (11M, 647 files) — Cloudflare Computer (virtual FS in Durable
  Object). Same treatment.

## Kept (owner verdicts)

- `hyperframes` (1.4G) — HeyGen HTML→MP4 experiment, still untested; owner
  wants a look before any verdict. The biggest remaining disk consumer.
- `browser-use` (14M) — agent-browser fallback kept outside the MCP stack.
- `captcha-solver` (4.8M) — kept by owner.
- `web_scrapping` (OpenSERP, live), `mcp-cyber`, `tradingview-mcp`,
  `reverse-api-engineer`, `aliens-eye`, `routed`, `sqlite-mcp-server-local`,
  `upstream/*` — all referenced by live skills/docs.
