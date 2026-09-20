# Oper — AI Coding Agent Constitution + Skills Library

A self-contained package containing a complete **AI coding agent operating system**:

- **Constitution & global rules** (AGENTS.md) — mission, owner priority ladder, task cycle, trash-only data safety, index-first tool discovery, communication contract
- **Normative docs** (10 + ADRs) — Principles, Governance, Code, Data-Safety, Version-Control, Working-Base, Autonomy Charter, KB-RAG, Skills, Infrastructure
- **97 agent skills** — routers with parts, covering browser automation, web research, design, security review, OSINT, debugging, git, documents, decks, Telegram, MCP tooling, and more; each tagged with zone / uses / not-for
- **Knowledge base** — hand-picked tool-research findings and wiki lessons (clean subset)

## What is this

This is the **oper** framework: an engineering agent constitution plus a curated
skill library, packaged so it can be shared, forked, and reused. The agent
operates from a written constitution (global rules + normative docs), starts
every task from indexes (skill catalog, MCP registry, knowledge index, memory),
and loads skills on demand via semantic discovery.

Personal content, credentials, and owner-specific infrastructure are excluded
by design (see `MANIFEST.md` for the exact exclusion policy).

## Layout

```
AGENTS.md          # constitution (root entry point)
BIRTH.md           # first-run onboarding: agent reads it, personalizes, deletes it
docs/              # normative documents + ADRs
_scripts/          # trash.sh (never-destroy recycle) + mcp-call.py (MCP probe)
skills/            # 97 skill routers (SKILL.md + parts/)
knowledge/         # tool-research findings + wiki subset
SKILLS.md          # generated skills index
MANIFEST.md        # what's included / excluded and why
LICENSE            # CC BY 4.0
```

## Getting started (fresh clone)

1. Clone this repo and point your agent platform at the folder.
2. The agent will see `BIRTH.md` at the root: the pass itself is mandatory,
   the content is optional. It walks through an introduction of the system
   (the reference structure offered as a starting point, adapted per user),
   probes the machine itself, walks the MCP server catalog with install and
   verification guidance, then interviews the user in iterative blocks
   (identity, platform, autonomy level, task profile, git habits, agent
   persona, danger zones — plus anything the user raises) until they say
   "enough", and finally deletes itself and commits the first personalized
   change.
3. Done: the workspace is yours, and `BIRTH.md` never returns.

## License

**CC BY 4.0** — you can share and adapt, just give attribution. See `LICENSE`.
