# Dusting tools audit — what we keep forgetting (2026-09-12)

Trigger: owner asked "какие инструменты так и остаются пылиться, потому что
мы о них забываем". Autonomous pass; nothing archived/deleted (that is
explicitly outside auto-authorization), verdicts + use recipes only.
Owner will interrogate on return — every row is demonstrable.

## Meta-findings (why dust accumulates)

1. **Cron fleet is OFF — 0/8 jobs enabled.** `~/AppData/Local/hermes/cron/
   jobs.json` (mtime 2026-09-03 23:52): every job `enabled=false`. Ticker
   alive (heartbeat 48s). daily-newspaper's last run errored
   (Connection error). Nothing has fired for 9 days — this is the single
   biggest dust generator: evening-freebies, nightly-research,
   daily-integrity, skill-maintenance all idle. Resume = owner decision:
   `hermes cron resume <id>` (NEVER the stale "restart Freebuff" advice —
   see standing rule).
2. **sync.db is dead since 2026-08-18.** `_scripts/sync_db/sync.db`
   (1.08 GB, messages 2026-07-06→2026-08-18, 122.6k) stopped ingesting.
   Usage evidence below is from the dead DB (older era) + git dates +
   live registry. Fix = owner decision (already an Info row: rebuild via
   `migrate.py` or retire).
3. **No LICENSE-file convention in vendored trees** keeps tripping us
   (ux-ui kit now; Draco precedent). PROVENANCE.md pattern started
   2026-09-12 — apply it to every future vendor.

## tools/ — identified, with dust verdicts

| Tool | What it is (verified) | Dust verdict |
|---|---|---|
| adb-mcp | AI control of Adobe Photoshop/Premiere via MCP (PoC) | DUSTED — we run a separate `photoshop` MCP; this PoC is redundant. Candidate for trash after owner look |
| aliens-eye | OSINT username/email search CLI (GitHub arxhr007) | DUSTED — osint-tools MCP (sherlock/maigret/holehe/blackbird) covers it |
| browser-harness | LLM→real browser via thin CDP harness (browser-use family) | DUSTED — playwright + camoufox + browser-use cover the niche; kept as fallback for "complete freedom" CDP tasks |
| browser-use | browser automation lib | LIVE (referenced by skills; 24 mentions/30d in dead-DB era) |
| captcha-solver | captcha service wrapper | DUSTED since 08-15 era; touch only when a scraping task hits captcha wall |
| claude-skills-megapack | 362 production skills for 13 coding tools | DUSTED reference shelf — mine for skills before writing new ones from scratch |
| CloakBrowser | stealth Chromium (anti-bot) | LIVE core of web_scraping stack |
| copybara | Google's repo-to-repo code transformer (Bazel/Java) | DUSTED, heavy (never used); relevant only if we mirror repos with transforms. Trash candidate |
| enoch | self-improving agent reference | DUSTED — read-only reference, findings exist (2026-09-07) |
| godogen | autonomous game-dev agent (Godot/Bevy/Babylon) | DUSTED — Windows-unsupported (audit 2026-09-06); lightest path = Babylon.js/Node if ever revived |
| hyperframes | programmatic video/animation (npm) | Field-tested 09-06 (hf-demo PASS). Usable, not habitual — remember for motion graphics |
| lieflat-charts | Lupi chart templates | Field-tested 09-06 (dot cascade). Use for data-viz asks |
| dashi-ppt-skill | PPTX generator | Field-tested 09-06 (deck PASS, upstream bug known). Use for slides |
| mcp-cyber | local cyber MCP bundle: dnstwist, maigret, nuclei, shodan, virustotal | HALF-DUSTED — dnstwist+maigret also live as separate MCP servers; nuclei/shodan/virustotal untapped. OSINT/security tasks should route here first |
| needle | Needle 2: 45M-param tool-calling model, 14MB binary, 28MB RAM | DUSTED — interesting for cheap structured extraction; never wired |
| NtWarden | Windows guardian utility (owner-side) | Owner zone, low touch |
| nodriver | undetected-chromedriver successor | Kept as scraping fallback; light touch |
| OpenBiliClaw | interest-profile content agent | Installed 09-06, manual owner steps pending; untouched since |
| OpenViking | knowledge/docs engine reference | Reference; findings exist |
| osint-tools-mcp-server | the MCP server behind `osint-tools` (33+ tools) | LIVE server, UNDERUSED surface: ghunt, holehe, blackbird, spiderfoot_scan etc. — see usage note below |
| qwen-client | Python venv + client (historical provider experiments) | DUSTED junk-ish; trash candidate after owner look |
| reverse-api-engineer | wrapper skill (installed 09-06) | Unused since install |
| routed | skill-router MCP (installed 09-07) | Registered, verified-live; smoke-test only since — should be asked on every "which tool/skill" question |
| token-optimizer | node tool w/ search+vector indexes | DUSTED, overlapping headroom/zg territory; trash candidate |
| user-scanner | only a venv inside | HOLLOW — no code visible; trash candidate |
| va-venv | uv-managed Python 3.14 venv | INFRA — do not trash blindly; check who references it |
| tradingview-mcp | read-only runbook skill (safe tools) | Unused since install; market-data tasks should use it |
| web_scrapping | openserp + CloakBrowser stack | LIVE (89 mentions/30d era) |
| ai-copywriter / ai-image-prompts-skill / anti-slop* | skills installed 09-06 | SLOW DUST — copywriter & prompts never invoked after field tests; antislop referenced in chat only |
| graphify | AST knowledge graph (5.3k nodes local) | One-shot 09-06; semantic layer needs Gemini (geo-blocked). Dust with potential |

## MCP servers — loaded vs. ever-called

30 registered in `~/.agents/mcp.json`. Called in the dead-DB era:
obsidian (207), sequential-thinking (104), exa_mcp (51) — and nothing
else, because post-08-18 usage is not captured anywhere (sync.db dead).
Live-session evidence (this thread): knowledge-rag, osint-tools,
telegram-userbot called; windows-mcp absent (new plan replaced it).

Never-called-anywhere-in-evidence, likely dust:
- **chroma** (workspace vector DB) — KB-RAG + zg + memora outrank it. Retire candidate.
- **docker** (mcp-server-docker) — no container ops in evidence. Keep only if owner starts container work.
- **unity / blender / pascal / photoshop / robot (arduino)** — DCC/creative MCPs; unused since registration. Keep = owner's creative plans decide.
- **cloudflare / notion / openrouter / google-workspace** — unused in evidence; google-workspace is the key enabler for the newspaper revival, so keep.
- **a2asearch** — directory search; useful before installing NEW MCPs; train the habit, not the axe.
- **dechonet / dnstwist** — deliverability/DNS probes; periodic value, natural cron material (currently impossible — cron off).
- **memora** — memory MCP with lineage; zero calls in evidence despite being our memory layer. The `Memory` native tool (505 calls) is what actually gets used. Decide which one is canonical, or wire memora into cron-written workflows.
- **freshcontext / context7** — doc freshness reads; unused. Cheap to try before deep-dives.

## Skills — 322 installed, dust classes

- Whole vendored kits never opened after install: ai-copywriter,
  ai-image-prompts-skill, reverse-api-engineer, tradingview-mcp,
  bento-slides (used once 09-07), youtube-full (superseded by
  youtube-transcripts but kept as paid alternative).
- Duplicates/overlap clusters worth consolidation (owner call):
  antislop (6 modules) vs ux-ui-kit taste/slop audits; wcag-accessibility
  vs ux-ui-kit a11y-audit; ui-ux-pro-max vs web-design-toolkit vs
  web-design-guidelines vs ux-ui-kit; youtube-full vs youtube-transcripts.
- Windows/Linux mismatch leftovers from AGGG 3.0 vendoring: wine-setup,
  zram-optimize, windows-* — mostly fine, but wine/zram are Linux-only
  noise on this stack.

## Execution log (2026-09-12, owner-ticked via ask_questions)

- Recycled (owner approved): copybara (11M), adb-mcp (152M), qwen-client
  (78M), user-scanner (46M), token-optimizer (73M+indexes). ~360 MB freed.
- **Twist discovered:** token-optimizer was not inert dust — it was a
  LIVE hermes MCP server (`config.yaml` L681, enabled: true), running
  since whenever, called ZERO times. Locked `better-sqlite3` exposed it.
  Disabled in hermes config (backup `config.yaml.bak-20260912-tokenopt`),
  hermes-node PID 26568 killed, no respawn after 20s. Lesson: hermes
  spawns long-lived MCP servers from its own config — `git log`/usage
  scans don't see them; enumerate dust from BOTH registries.
- aliens-eye + chroma: kept (owner asked which is better / undecided).
- UX-skill cluster: untouched (owner: separate review session later).
- API_KEYS.md: stays tracked (owner decision).
- Cron fleet: stays off (owner decision).

## Recovery plan (proposed, needs owner tick)

1. Resume cron selectively (not all 8): evening-freebies, daily-integrity,
   skill-maintenance, nightly-research — the four with proven value;
   decide newspaper fate separately (its recipe is queued in batch2 findings).
2. Fix or retire sync.db (single Info row → real task; without it,
   usage audits like this one are half-blind).
3. Trash candidates (owner-confirmed, via trash.sh): qwen-client,
   user-scanner, copybara, token-optimizer, adb-mcp, aliens-eye, chroma MCP.
4. Habit patch: route "which tool for X" questions through routed MCP
   (installed, verified, zero usage since).
5. Consolideate UX skill cluster around ux-ui-kit (wrapper registered
   2026-09-12); keep antislop as the text gate.

## Sources

- check_cron_health.py run 2026-09-12 11:02 UTC (0/8 enabled, ticker 48s).
- jobs.json read 2026-09-12 (all enabled=false, mtime 2026-09-03 23:52).
- sync.db rollup query results (dead-era data, honesty noted): mcp__ tool
call rollup — obsidian 207, sequential-thinking 104, exa_mcp 51, all
others zero; content-mention scan per tool name (see transcript).
- git log last-touch dates per tools/ dir (many pre-08-08; 11 dirs
  untracked → 0 commits).
- ~/.agents/mcp.json (30 servers), docs/MCPRegistry.md (roles).
