# ADR-0003: Cron × Telegram replanning

Status: Proposed (design agreed, phased implementation)
Date: 2026-08-03

## Context

7 Hermes crons are silently disabled (02.08 05:07, incident c14), the TG inbox
has been dead for 13 days (last_fetch = 2026-07-20), and `telegram_watcher.py` —
the only live collector — is called by nobody. Crons are organized by script
(someone added them at some point), not by purpose: three LLM crons read the
same 49 groups with similar filters, sends are duplicated, and some scripts are
banned (send_telegram.py / send_to_telegram.py — Telethon user-session,
ban risk).

This ADR redesigns the whole system from scratch: who goes into TG, what they
read, how they analyze, where and how they deliver, and how the pipeline does
not die.

## Decisions by survey rounds (5 rounds, owner)

### R1 — Content
- Current digests are "all crap"; we rework quality, not frequency.
- Three separate digests: freebies (own cron), tools (own cron), news
  (newspaper ×2/day, as today 04/16).
- Digest format: mixed — a quick list + one deep dive.
- Freebies: top-5 of the fattest only + "how to claim" instructions, deadline
  tracking.
- Freebies must be DEEP: abuses, schemes, non-obvious stuff — not the first
  page of a browser.

### R2 — Automation
- opentask-autobid: do not touch, but add a daily bid summary (currently it
  goes silent — if it breaks you never find out).
- Automate: junk cleanup, health checks, backups.
- Integrations: git + TG only, do not force new ones.
- Alerts: serious (gateway died, key exhausted, inbox stalled) + a daily short
  health summary.
- Backup: once a week.
- Autonomy: medium — everything on schedule, monitoring exists, nothing 24/7.

### R3 — Sources
- TG groups only. RSS/web — NOT added.
- Filter — BY MEANING (LLM decides), not by keywords.
- Real-time freebie pushes — NO, everything goes into the 21:00 evening digest.
- Browser — only to dig deeper into what was already seen, not to monitor
  pages in advance.
- Full layout of the 49 groups — below.

### R4 — Delivery
- Everything to the AI group (`-1004303414688`), the only deliver target.
- Newspaper: long, "a bit of everything", WITHOUT links.
- Freebies: top-5 fattest + instructions, WITH links.
- Tools: separate cron (default 13:00).
- No length limits, but structured.
- Tone: Russian, no water, headline + substance.

### R5 — Reliability
- daily-integrity (11:00) extended: fetch freshness + gateway + disk + ERROR_LOG,
  PLUS a separate no-agent cron pinging gateway/proxy :4000 every 30 min.
- Backup: weekly snapshot `jobs.json + watcher.json + .env + session`
  → `_archive/` + git, keep the last 4.
- Push monitoring: daily summary + alerts on problems.
- Post-reboot recovery script checklist — started MANUALLY (no autostart —
  owner decision "the less that starts, the more control").
- `telegram_poll.py` → archive, do not fix (a duplicate of the watcher).
- New cron composition — below.

## Group layout by zone (final)

### 📰 NEWS → newspaper (04:00 and 16:00)
1. Светлый Уголок | ии (insights, rumors)
13. Пекарня · 14. CodeCamp · 15. Рестарт · 16. Провод · 17. в IT и выйти
18. Топор+ · 19. Python Developer · 22. Jeteed
30. Only Hack · 40. Отдел К: кибербез · 41. Вайб-кодинг
43. ИИ тебя заменит · 46. Вайбкодинг с нуля

### 🛠 TOOLS → cron 13:00
3. AI CODE COMMUNITY (few freebies — tools)
5. Vibe GIG Мастерская (tools, articles)
23. **Kylo chat** (rename from «Халява (добавлено вручную)» — abuses+tools)
24. **Kylo AI** (rename from «Чекаю реже (добавлено вручную)» — abuses+tools)
plus a share from 30/40/41/43/46 (newspaper and tools each filter their own)

### 🔥 FREEBIES/ABUSES → evening digest (21:00)
7. Абузыч (lots of abuses and freebies)
25. Free promotion · 27. MOD PREMIUM · 28. RajaRedx · 29. Hackingum
31. ADITYA X OFFICIAL · 32. ADITYA RE-DIRECT · 33. Zedox Prime
34. UNDER WORLD · 35. TAG_ALPHA7 · 36. Globexomart · 37. ADITYA Files
38. Tag_Maxx · 39. ADITYA RE-DIRECT 2 · 42. Sky Plus notify
47. ADITYA x OFFICAL DISCUSSE
**+ NEW No AGI** (https://t.me/no_agi — free trials, ChatGPT Plus for free)
**+ NEW KeyCrop** (https://t.me/keycrop — Claude key giveaways)
**+ Kylo AI / Kylo chat** (abuses — shared zone with tools)

### 🌀 GIG ECOSYSTEM → folds into 48 (main hub of abuses/tools/freebies)
4. GIG AI Forum · 6. GIG DEBI PREMIUM · 8. Вайбкодинг комьюнити
9. GIG FREE PRIVATE · 20. GIG AI · 45. AI DVIZH (tied to 48)
48. AI Движ | Hub — triple classification

### 👤 PERSONAL
2. Коллекция Нико (personal channel) · 10. Agent-freebuff (forwards of
"things I liked")
11. Chat Коллекции Нико (comments)

### 🗑 REMOVE FROM CONFIG
12. LLМповый чат — left (id dead, does not resolve server-side)
21. Отзывы GIG — useless · 26. Коллекция Нико Messages — useless
44. Токены Claude/Tessera — excluded by owner decision
49. Sky Plus 交流群 — archival (absent from fresh dialogs; default: remove)

### ❌ DO NOT TAKE (new channels, reviewed — visual/off-topic)
Moonlight AI, The After Times, TrendTech (+Chat), Corporation GUWO,
Жертвы нейросетей (+чат), Iris | Чат-менеджер, AyuGram Releases,
Gameoverse, Айти мемы, За минуту до созвона, MURDER DRONES,
Пакет IT-Мемов, Found Club (+Chat), Международный трек, Студи Хаб,
Ускорение интернета, Великий Монолит, ᎴᏒᎧᏁᎩ, OneShot cf,
LOLZ NEWS (forum news — weak), ерливижн (blog — off-topic),
Вайбкодеры продают (chatter), Логово Волка (art)

## New cron composition (to-be)

| Job | Schedule | Mode | Zone | What it does |
|---|---|---|---|---|
| **tg-fetch** (NEW) | `*/30 * * * *` | no-agent | all live | `telegram_watcher.py fetch`, silent when empty. THE ONLY one going into TG |
| **health-ping** (NEW) | `*/30 * * * *` | no-agent | — | ping gateway + proxy :4000, silent when OK |
| **daily-newspaper** | `0 4,16` | LLM | news | overnight/day newspaper, long, no links |
| **daily-tools** (NEW) | `0 13` | LLM | tools | tool list with "why", 1 deep dive |
| **evening-freebies** | `0 21` | LLM | freebies/abuses | top-5 fattest + instructions + links + deadlines |
| **opentask-autobid** | `0 */6` | no-agent | — | as-is + daily bid summary |
| **daily-integrity** | `0 11` | LLM | — | EXTEND: fetch freshness + gateway + disk + ERROR_LOG + final summary |
| **weekly-report** (NEW) | `0 18 * * 0` | LLM | — | weekly summary across all domains |
| **tg-backup** (NEW) | weekly | no-agent | — | snapshot jobs.json+watcher.json+.env+session → _archive/ + git, keep 4 |

BURIED: nightly-research (replaced by daily-tools), skill-maintenance,
nightly-experiments (zombie), telegram_poll.py (to archive).
BANNED forever: send_telegram.py / send_to_telegram.py (Telethon user-session
sends — already banned the account once; delivery ONLY through Hermes Bot API).

## Hard rules
1. Fetch — only via the dedicated no-agent cron. The "run fetch" instruction
   is removed from LLM cron prompts entirely.
2. Sending — only Hermes Bot API (`deliver: telegram:` → AI group).
3. Each cron — its own group zone. No triple-parsing of one inbox.
4. Content filter — by meaning (LLM), not by words.
5. Telethon session — read-only fetch. No writes/sends through it.

## Infrastructure facts (verified 03.08)
- Session updated: @TheWorld_Machine (id 5094569795), alive.
- Config reconciliation: 47/49 records in dialogs; LLМповый чат and
  Sky Plus 交流群 — left.
- 236 dialogs total (93 channels/groups + 143 private chats/bots).
- Kylo AI / Kylo chat found in config under the names «Чекаю реже» /
  «Халява (добавлено вручную)» — rename.
- `hermes cron list` returned "No scheduled jobs", although jobs.json has 7
  jobs (all disabled). CLI vs file discrepancy — verify in Phase 0.

## Implementation phases
- **Phase 0** — verification: hermes cron CLI vs jobs.json, jobs.json backup,
  all jobs.json changes ONLY through CLI, not manual edits (c19).
- **Phase 1** — tg-fetch: create cron via CLI, shim script, initial fetch.
- **Phase 2** — watcher config: rename Kylo, add No AGI/KeyCrop, remove
  12/21/26/44/49; cut fetch from the 3 cron prompts.
- **Phase 3** — consolidation: telegram_poll.py → _archive, cron-sources.md
  docs brought in line with reality (remove send_telegram.py from instructions).
- **Phase 4** — observability: health-ping, last_fetch freshness in
  check_cron_health, post-reboot recovery script checklist.
- **Phase 5** — full 24h run, reconcile against newspaper/freebies/tools.

## Alternatives
- Alternative A: keep as-is, resume 5 crons.
  Pros: zero work. Cons: inbox dead, triple parsing, spam, blind spots
  (no backup, no fetch monitoring). Rejected: "all crap".
- Alternative B: point fixes (fetch in the daily-newspaper prompt).
  Cons: LLM-dependent fetch — races/duplicates/model whims, the other crons
  read a stale inbox. Rejected: we treat the cause, not the symptom.
- Alternative C (ACCEPTED): dedicated collector + zones + new composition.

## Trade-offs
+ One deterministic collector instead of three LLM-dependent ones
+ Zones eliminate triple parsing
+ Backup and monitoring close real holes (c26, c14)
+ Fewer digests, higher quality (5 → 3 digests per day)
- More crons in the registry (9 vs 7) — but half are silent no-agent ones
- Kylo rename touches inbox file names (archive stays)
- Removing 44/12/49/21/26 loses their inbox archive (content itself lives in TG)

## Consequences
- jobs.json: new cron composition (9), old LLM prompts rewritten.
- telegram_watcher.json: rename Kylo, +No AGI/+KeyCrop, −12/21/26/44/49.
- New scripts: health-ping, weekly-report, tg-backup, check-checklist, tg-fetch shim.
- telegram_poll.py + send_telegram.py/send_to_telegram.py → _archive.
- knowledge/cron-sources.md rewritten to match reality.
- CRON-REGISTRY.md updated after implementation.

## Rollback
- All jobs.json changes via CLI: `hermes cron disable` / `remove`.
- Watcher config: git checkout / trash + restore the list from this ADR.
- Kylo inbox archive: old files stay in _archive (rename does not delete).

## Review Date
2026-08-10 — after a full 24h run (Phase 5) and the weekly report.
