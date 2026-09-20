# Knowledge Index

Entry point for the knowledge layer: dated findings with verdicts, wiki
lessons, finds and code reverse-specs. Discovery rule: read this index
before grepping — it exists so you never guess what the workspace holds.

**Freshness rule:** a new finding in this layer updates this index in the
same commit. A stale index is a lie told to the next session.

## Findings (dated, with verdicts)

| Date | File | What it settles |
|------|------|-----------------|
| 2026-08-24 | `findings/2026-08-24-A1-litellm-supply-chain.md` | LiteLLM supply-chain risk and what it means for proxy reliance |
| 2026-09-06 | `findings/2026-09-06-design-ten-resources.md` | Curated design resources worth keeping |
| 2026-09-06 | `findings/2026-09-06-zvec-grep-research.md` | zvec-grep hybrid search: what it is, when it beats rg |
| 2026-09-07 | `findings/2026-09-07-bento-vs-dashi-slides.md` | Slide tooling comparison (Bento vs dashi) |
| 2026-09-07 | `findings/2026-09-07-enoch-evolve-reference.md` | Enoch self-evolution architecture as reference reading |
| 2026-09-07 | `findings/2026-09-07-lore-vs-git.md` | Epic's Lore VCS vs git for binary-heavy repos |
| 2026-09-07 | `findings/2026-09-07-zg-vs-kb-rag-bench.md` | Benchmarks: zg vs KB-RAG retrieval |
| 2026-09-12 | `findings/2026-09-12-dusting-tools-audit.md` | Tool audit verdicts (what stays, what goes) |
| 2026-09-13 | `findings/2026-09-13-aggg-4.0-selective-adoption.md` | AGGG-4.0: which parts adopted, which rejected |
| 2026-09-20 | `findings/2026-09-20-tools-sweep.md` | tools/ sweep: removals, keeps, archive moves |

## Wiki lessons

`wiki/` holds 15 dated lessons — short postmortem-style writeups (proxy bugs,
cron quirks, MCP loading, Windows process handling). Read the filename first;
open only what the current task touches.

## Finds and code specs

- `wiki/finds/` — one-off discoveries (cloudflare block, competitor analysis,
  openplanter/Palantir analog).
- `wiki/code/` — reverse-engineering specs (bundle analysis, character-ai,
  freebuff global skills, skills-lock).

## Skills catalog

`wiki/skills-catalog.json` — semantic index of all 97 skills (schema
`oper-skills-catalog/v2`). Query it via the `find-skills` skill; validate
with `python _scripts/validate_skills_catalog.py` (paths in the script assume
`skills/` for this package layout).
