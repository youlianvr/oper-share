# Skills — the rule of the layer

> Status: normative for everything under `.agents/skills/`.
> Enforced by: `python _scripts/audit_skills_format.py` (header format only)
> plus the review discipline below. Nothing else checks content — this file
> is the content check.

## Why this rule exists

The layer grew to 333 skills and rotted in predictable ways: one topic
shredded into 55 micro-contracts, a vendor bundle that shipped broken
machine-translation and references to files that never existed, stubs
passing the format audit because the audit only reads frontmatter. The
2026-09-13 review cut it to ~180 by merging families into routers with
parts. This file keeps the next batch from regrowing the same rot.

## The layer's shape

- **A skill is a contract**: trigger (when to load), procedure (what to do),
  and verification (how you know it worked). Prose in English. No filler.
- **One topic = one skill.** Variants of a topic are **parts** under a
  router (`parts/<name>/SKILL.md` + assets), never sibling top-level
  skills. The router's table is generated from the parts' own frontmatter
  descriptions, one line each — so the table cannot drift from reality.
- **Data keeps its language.** Post templates, transcripts, sample payloads
  and captions stay in the language of the artifact itself. Only prose is
  English.
- **Translation is rewriting, never substitution.** Past commits replaced
  single letters inside Russian words with English words
  (`и`→`and`, `в`→`in`) and produced text in no language. Any mass
  translation must go through meaning-level rewrite, reviewed per file.

## Intake rule (before creating a new skill)

1. **Repeatability** — the pattern already repeated, or will clearly repeat,
   ≥ 2–3 times. One-off findings go to `knowledge/`, personal facts to
   `_memory/`.
2. **No coverage** — `find-skills` catalog query confirms nothing covers
   it. Check `related_skills` for near-misses before deciding.
3. **A place, not a pile** — if a router for the topic exists, the new
   material becomes a **part** of it (and the router table gets a row),
   not a new top-level skill.
4. **Trigger + procedure** — the description states when to load it; the
   body is executable, not an essay.
5. **Self-sufficiency** — every file the contract references must exist on
   disk the same commit. A skill referencing a missing file is broken on
   arrival (the megapack shipped 22 of these).

## Merge rule (when the layer drifts back toward a pile)

Merge when two skills answer the same trigger, or when a family passes
~5 top-level skills on one topic. Keep as separate skills only what has
independent triggers and independent verification.

## Archive, never delete

Skills leave the layer through `_scripts/trash.sh` / `_archive/`
(R100 renames, nothing destroyed). References to an archived skill die in
the same commit that archives it.

## Checks

- Format: `python _scripts/audit_skills_format.py` — must report 0
  violations. Note its blind spot: it reads headers, not content; a 0-byte
  SKILL.md can pass.
- Pointers: `python _scripts/workspace_audit.py` — no new broken refs from
  skills-layer changes.

## Invocation map and tags

`docs/Skill-Invocation.md` is the teaching layer: ten task zones, entry
skills, and real chains from workspace history. Skills carry a short tag
block (uses / not-for) matching it; the catalog remains the machine source
of truth, the map is a projection with the same freshness duty — a layer
change updates its zone row and tags in the same commit.

## Review history

Batched verdicts with per-batch commits live in
`workspace_rebuild_task_plan.md` (batches 1–8, 2026-09-13). The pattern
that worked, for reuse: full fact-gathering per family → owner verdict via
questions → `git mv` whole directories (R100 preserves history and
relative links) → repoint live name-references same commit → format audit
+ broken-refs delta → one commit per batch.
