# BIRTH.md — read me first, then delete me

> You (the agent) have just been cloned into a fresh machine with this
> constitution. This file is your onboarding script. It exists exactly once:
> work through it with the user, then **delete this file in the same commit**
> as the first personalized change. If `BIRTH.md` is still here, the
> initialization has not happened.
>
> **The pass is mandatory; the content is optional.** You must run this
> interview, but nothing is adopted without the user's explicit "yes": not
> the structure, not an MCP server, not a demo. Every recommendation below is
> an option with a question attached.

---

## Step 1 — Introduce the system to the user

Explain, briefly and in plain language (no document quotes), how the workspace
is organized. This package ships a **reference structure** — the upstream
topology it was built from. It is a proven starting point, not a requirement:

- **`AGENTS.md`** (root) — the constitution: mission, the Owner Authority
  priority ladder (their chat words are rank 1; Never Destroy / trash-only is
  the one absolute), the Saniti-Check ("isn't there a ready-made tool?"),
  and the Task Cycle every task runs through.
- **`docs/`** — the normative layer each constitution section points to:
  Principles, Governance, Code, Data-Safety, Version-Control, Working-Base,
  Autonomy Charter, Skills, Infrastructure, KB-RAG. Plus `docs/adr/` for
  recorded decisions.
- **`skills/`** — the skill library: routers with `parts/`. Discovery runs
  through the semantic catalog (`knowledge/wiki/skills-catalog.json`, via the
  `find-skills` skill) — search it before authoring anything new.
- **`knowledge/`** — tool-research findings with verdicts and wiki lessons;
  `knowledge/INDEX.md` is the entry point; `knowledge/wiki/skills-catalog.json`
  is the semantic catalog of all 97 skills (query via `find-skills`, validate
  with `python _scripts/validate_skills_catalog.py`).
- **`_memory/`** — owner facts, dangling tasks, errors, wins. Ships as a
  structure index only; the birth interview creates the real files.
- **`BOOT.md`** — session entry point (health, where to read first).
- **`_scripts/`** — operational scripts: `_scripts/trash.sh` (deletion = move
  to trash, never `rm`), `_scripts/mcp-call.py` (probe an MCP server with a
  real call). These two ship with the package; anything else the workflow
  needs you create as it appears.
- **`MANIFEST.md`** — what this package includes and what was excluded on
  purpose.

Offer the upstream growth blocks as **options** (`projects/` for own work,
`projects/school/<name>/` for school/competition work, `tools/upstream/` for
third-party clones — never mixed with own projects, `_memory/` for session
identity and owner facts, `inbox/` for imported external material, `_archive/`
for retired materials). Adopt only what the user confirms; record what was
adopted vs skipped.

## Step 2 — Probe the machine yourself, then confirm

Do not interrogate the user about the environment — **check it yourself**:
OS, shell, git, node, python, package managers, free ports you would need,
existing MCP config (`~/.agents/mcp.json` or platform equivalent). Then
present findings for confirmation, not discovery: "I see Windows + git +
python 3.12, no node — correct?" Record the confirmed findings in
`MEMORY.md` — this is the first entry it gets.

## Step 3 — MCP servers: what exists and how to install

The package's `docs/Infrastructure.md` § MCP Registry documents the full
upstream set — 32 configured servers with per-server status and launch notes.
Most are launchers referencing local or vendored code that does **not** ship
in this package; treat the Registry as a menu, not a set of ready servers.
Walk the user through it by category (do not dump the whole table):

- **Knowledge & search**: knowledge-rag (workspace search, offline,
  Cyrillic-friendly), zvec-grep (hybrid grep), routed (skill router), chroma
  (vector DB on 127.0.0.1:9000), memora (long-term memory; slow — budget
  >40 s), sqlite-mcp, sequential-thinking, a2asearch (tool discovery),
  freshcontext (staleness judgment), context7 (library docs), openrouter
  (model gateway, remote).
- **Web & research**: playwright (browser automation), browsermcp
  (anti-detect browser, 86 tools), searchmcp (one-call web research),
  google-workspace (Gmail/Calendar/Drive/Docs), ai-vision, osint-tools,
  dnstwist, dechonet (DNS).
- **Productivity & content**: notion, obsidian, telegram-mcp-bot,
  telegram-userbot (real account — care), windows-mcp (desktop control).
- **Creative & 3D / infra**: blender, unity, photoshop, robot, pascal,
  cloudflare, docker, db-tools.

**Status labels matter** (see Registry): `VERIFIED-LIVE` means a real call
succeeded for that exact operation; `TOOL-SURFACE` = listed but not called;
`CONFIGURED` = in config only; `FAILED-LIVE` = do not trust without re-probe.
Install selectively: propose the categories the user actually needs, verify
each adopted server with one cheap real call (`_scripts/mcp-call.py <server>
tools` — ship this script; it is stdlib-only), and record the result with
today's date — statuses rot.

## Step 4 — The interview (iterative, until the user says "enough")

Ask in small batches, grouped by block. After each block ask: **"anything
else important you want to configure?"** The initialization closes only on an
explicit "enough / хватит" — not when your question list runs out.

Core blocks (each is a question area, not a form):

1. **Identity** — their name/handle, what to call them, response language
   (English documents by default; conversation language is theirs).
2. **Platform** — which agent platform runs this (Freebuff, OpenClaw,
   Claude Code, Codex, …); tool names differ per platform.
3. **Autonomy level** — default working mode: ask on every substantive
   decision, or minimal asks only for the irreversible? When may you stay
   silent, and when never?
4. **Task profile** — what this workspace is for: code, study, research,
   content? This decides which skills and MCP servers you propose first.
5. **Git habits** — commit frequency, message style, push policy (or leave
   it to the constitution defaults and note that).
6. **Agent persona** — do they want a name/character for the agent, or the
   neutral default?
7. **Danger zones** — directories the agent must never touch (credentials,
   live configs) and data types that never leave the machine. The package
   ships a starter `.gitignore` — extend it, and note the zones in this
   conversation.

Anything the user raises beyond these blocks is a valid block — ask it fully.

**Stop condition:** the interview closes only on the user's explicit
"enough / хватит" — never when your own question list runs out. If you have
blocks you have not yet asked, that is not "enough"; that is unfinished work.

## Step 5 — First-task demo (optional, on their yes)

Before any real task, offer one harmless demo so the user sees the mechanics:
a Saniti-Check firing ("wouldn't a ready-made tool be simpler?"),
`ask_questions` with self-contained options on a real fork, and the
trash-only rule (deletion goes to the trash path, never `rm`). Skip it if
they decline — nothing is forced.

## Step 6 — Verify and close

1. `MEMORY.md` exists at the root with the user's answers (create it fresh —
   the shipped package intentionally contains no personal memory), and the
   `_memory/` files named by its INDEX.md hold the per-topic entries
   (USER.md, HARD_RULES.md at minimum). Keep it short: facts, not prose.
2. Adopted structure and enabled MCP servers are recorded (in MEMORY.md and,
   for servers, in a dated note next to the local MCP config).
3. The user confirms they understand the priority ladder and can veto.
4. Delete `BIRTH.md` and commit: `birth: workspace initialized for <user>`.

After deletion, this workspace is no longer a template — it is theirs.
