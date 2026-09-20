---
name: osint
description: >-
  OSINT (Open Source Intelligence) — full profiling protocol.
  Level 0 (local data) → Level 1 (free tools) → Level 2 (verification) → Level 3 (API).
  Principles: Confidence Scoring, username decomposition, contradiction search, contact correlation.
  Use when: "profile someone", "OSINT", "find info on", "intel", "investigate".
---

# OSINT — Full profiling protocol

## Tools

### Built-in (always available)
- **researcher-web** — web-search (Brave Search)
- **read_url** — page reading
- **browser_check / preview_*** — screenshots, UI interaction
- **basher** — terminal, CLI-tools
- **code-searcher** — grep across project files

### CLI (via basher)
| Tool | Command | Purpose |
|---|---|---|
| **Sherlock** | `sherlock <username>` | Username across 400+ socials |
| **Maigret** | `maigret <username> --all --json` | Username across 2500+ sites |
| **Holehe** | `holehe <email>` | Email registration check |
| **TheHarvester** | `theharvester -d <domain> -b all` | Email/subdomains/hosts |
| **PhoneInfoga** | `phoneinfoga scan -n <number>` | Phone number analysis |

### MCP
| Server | Purpose |
|---|---|
| **osint-tools** | Sherlock/Holehe/Maigret/TheHarvester via MCP |
| **exa-mcp** | Semantic search |
| **open-websearch** | DuckDuckGo search |

### Telegram tools
| Tool | Access | Purpose |
|---|---|---|
| **Telethon session** | `_scripts/*.session` + `_scripts/telegram_watcher.json` | Direct access to account, dialogs, contacts |
| **Funstat API** | `.env` → `FUNSTAT_JWT`, client `pip install funstat-api` | Telegram statistics (messages, groups, activity) |

---

## Profiling protocol

### Level 0: Local Data First (MANDATORY before web)

The project may already have the needed information. Check BEFORE web-search:

```bash
# 1. Scripts — send_to_*.py, config watcher
ls _scripts/ | grep -E "send_to|watcher"

# 2. Dossier in archive
find _archive/ -name "*.md" -path "*/dossiers/*" 2>/dev/null | head

# 3. Telethon session
ls _scripts/*.session 2>/dev/null

# 4. .env — API keys, tokens
cat .env 2>/dev/null | grep -E "TOKEN|KEY|JWT|API_ID|HASH"

# 5. Telegram: client.get_dialogs() → all dialogs
# 6. Funstat: get_balance(), stats_min(user_id)
```

**Critical rule:** If the project has a dossier or scripts linking the target to someone — that is the primary source, not web-guessing.

### Level 0 Principles

**Username Decomposition:**
Decompose username into constituent parts:
- `@Leshasid1` = Lesha + Sid + 1 = Lyosha Sidorenko
- `@ivanpetrov2005` = Ivan Petrov, born 2005

Search by parts, not as a whole.

**"Fake Name" Rule:**
If the name is fake — do NOT search for the person with that name on the web. LinkedIn/Twitter with that name = different person. Search by what cannot be faked: phone number, ID, intersections, patterns.

**Contradiction Rule:**
Contradictions = evidence, not noise. Record and dig deeper:
- Virtual phone ≠ LinkedIn profile location → something is off
- Fake name ≠ real location → anonymization
- Different numbers → possibly two accounts

**Correlation Rule:**
If the target has two accounts — they will:
- Be in the same chats
- Have similar speech patterns
- Share IRL contacts
- One username may contain part of the other's username

Use the filter "which of the contacts recurs across all known aliases", not "new person".

### Confidence Scoring (per fact)

| Level | Description | Example |
|---|---|---|
| 🟢 A | 2+ independent identities | Telethon ID + Funstat stats |
| 🔵 B | One reliable identity | Telethon profile |
| 🟡 C | Found, not confirmed | LinkedIn with same name (no intersections) |
| 🔴 D | Assumption | "Looks like them" |
| ⚫ E | Contradictory data | Canada number ≠ NY LinkedIn |

**Never present C/D as fact.**

### Level 1: Quick Scan (seconds, free)

Launch ALL in parallel, ONLY after Level 0:

```bash
sherlock <username> 2>&1 | grep -E "\[\+\]|\[-\]"
maigret <username> --all --json 2>&1 | head -50
holehe <email> 2>&1
theharvester -d <domain> -b all 2>&1 | head -30
researcher-web "<name> biography OR portfolio OR linkedin"
```

### Level 2: Source Verification (minutes)

Check found URLs via `read_url`. Cross-verification: each fact from at least 2 sources.

### Level 3: Deep Research (API keys)

```bash
researcher-web "<query>"   # deep research via web-search tools
# Perplexity/Exa/Tavily API wrappers are NOT bundled (scripts/ would need them).
# Add your own API keys to _agent/env.md and call the APIs directly if needed.
```

---

## Full protocol (step by step)

```
1. Gather Level 0: scripts, dossier, Telethon, .env, Funstat
2. Find FACTS (ID, phone, username, shared chats)
3. Find CONTRADICTIONS (what doesn't fit)
4. Decompose username into parts
5. Check ALL contacts via intersection filter
6. Launch Level 1 in parallel
7. Verify Level 2
8. Build dossier with confidence score per fact
```

---

## API keys (optional)

| Service | Variable | Status |
|---|---|---|
| Tavily | `TAVILY_API_KEY` | ✅ In .env |
| Exa | `EXA_API_KEY` | ✅ In mcp.json |
| Funstat | `FUNSTAT_JWT` | ✅ In .env (63 tokens) |
| Perplexity | `PERPLEXITY_API_KEY` | ❌ Needed |
| Apify | `APIFY_API_TOKEN` | ❌ Needed |
| Bright Data | `BRIGHTDATA_MCP_URL` | ❌ Needed |

---

## Lessons (from real failures)

1. **Start with Level 0**, not with web-search
2. **Do not take LinkedIn as truth** — name match ≠ same person
3. **Try username variants** — `emersoncarlson` vs `emerson_carlson`
4. **Decompose username** — `@Leshasid1` = Lesha + Sid
5. **Search contact intersections**, not "another person"
6. **Contradictions = evidence**, not noise
7. **Do not dig into personal data** as OSINT-result — that is not investigation, that is reading correspondence
