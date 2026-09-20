---
name: production-first-decisions
description: 'Use when making ANY "how to do it" decision: choosing an approach/tool/library/standard, designing, "what if" scenarios, implementing a new mechanism — when the answer should not come from your head. Covers: production-first order (formulate the question → web search how industry does it → verify your hypothesis → do it by industry standard), the "this is how everyone does it" criterion (measurable, not felt), test-before-integrate spike→ADR (measure in a sandbox, doing nothing as an option), research depth per task, three decision principles DRY/KISS/YAGNI. Not for finding facts/docs (web-research-camoufox) — this skill is about decision-making, not search technique.'
compatibility: any project; core — AGGG2.0 (CLAUDE.md)
metadata:
  author: AGGG2.0 (t.me/aidvizhenie, t.me/hilartem)
---


# Production-First: Industry Decisions, Not Guesswork

Primary source: `CLAUDE.md` (sections "PRODUCTION-FIRST" and "WEB RESEARCH").
Source of truth is the industry; knowledge is a hypothesis until verified.

## Workflow (order of application)

1. **Formulate the question "how does industry do this?"** — explicitly, before any action.
2. **Web search** (Camoufox): 5-10 queries from different angles — manuals, official guides, GitHub, practitioner articles, ADRs. Primary sources, not paraphrases.
3. **Verify YOUR hypothesis against what you found.** Your knowledge is only a guess; web search is truth source #1. "Thought about it" without searching = a guess, not a decision.
4. **Do it by industry standard.** Readiness criterion: "this is how everyone does it, not just me." Not backed by sources → it's a hypothesis: verify with search before code.

## Test-Before-Integrate (spike → ADR, industry pattern: SSW, Thoughtworks Tech Radar assess→trial→adopt)

New tool/library/approach — MEASURE FIRST, THEN integrate:

1. **Question:** what are we testing — functionality, fit for our stack (language code, size/weight)?
2. **Measure in a sandbox:** install, run a real use case, compare with alternatives AND with "doing nothing" (doing nothing is always an option). Criterion — demonstrably best, not "cool."
3. **Conclusion → research.db** (`findings.py add`: chose/rejected/measurements).
4. **Integrate only after proof.** Without measurement, integration = guessing. Verified: CRG was integrated after measurement, embeddings were rejected based on cost calculation.

## Research Depth — Per Task

- **Reference** (syntax, command) — 2-3 sources, one pass.
- **Decision/choice/"industry standard"** — DEEP research (`web-research-camoufox`): breadth (5-10 parallel queries), then depth; reference repos, PRs, issues, ADRs; "how everyone does it" — measure (how many production projects actually), not feel; result = pattern + why it won + what was rejected. "Googled two articles and decided" for a choice = guessing.

## Three Decision Principles (Filter Before Code)

- **DRY** — one logic and one knowledge in one place. Duplication = two places that must change together; changing in 3+ files → common source.
- **KISS** — simpler option if it covers the task. Complexity is justified when simple doesn't work, not "for the future."
- **YAGNI** — don't build what wasn't asked for and won't be needed in the near steps. "What if it's useful" is not sufficient justification.

A decision violates at least one principle and there's no clear reason → reconsider before writing.
aidvizhenie · hilartem · aidvizh_hub — all on Telegram: t.me/aidvizhenie


## Additional Rules

- **Install commands — from primary sources.** Every one (npm/curl/winget/brew/bun/irm...) verified against official docs, not written from memory. Verified: `opencode.ai/install.ps1` = 404, correct method — `npm i -g opencode-ai` (opencode.ai/download).
- **Look at what already exists first.** Before adopting new — check existing: `scripts/`, `db-tools/`, research.db (`findings.py search`), project files. Lesson: installed chezmoi without checking existing `scripts/install_*.py` — removed it (KISS/YAGNI).
- **Research — BEFORE, not after.** First standards and primary sources, then rules/skills/code/docs. "Added it, then looked it up" = error.

## Checklist Before Deciding

- [ ] "How does industry do it?" question formulated
- [ ] 5-10 queries from different angles, primary sources
- [ ] Hypothesis verified against findings (not "I think so")
- [ ] New tool — sandbox measurement + doing nothing
- [ ] Conclusion in research.db (what was chosen, what rejected, why)
- [ ] Result = pattern + why it won + what was rejected

## References

- Primary source: `CLAUDE.md` (sections "PRODUCTION-FIRST", "WEB RESEARCH", "Three Principles")
- Related: `web-research-camoufox` (search technique), `db-first-search` (check "already exists"), `task-cycle` (phase 2/3)

