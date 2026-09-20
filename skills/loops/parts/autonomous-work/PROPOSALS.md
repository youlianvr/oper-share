# PROPOSALS — autonomous-work skill changes

> Ledger of proposed changes to this skill. The agent APPENDS proposals here and NEVER
> applies them itself. The owner reviews and applies. (Owner 2026-08-02: «скилл пусть копит
> предложения на свои изменения, но не меняет, чтобы случайно не сойти с ума и не поплыть».)

## How it works
- Agent: a rule broken 2+ times, or a better rule discovered → append a dated proposal below.
- Owner: apply (edit SKILL.md) or reject; mark status accordingly.
- Agent NEVER edits SKILL.md to implement its own proposal.

## Proposal template
```markdown
### [YYYY-MM-DD] Proposal #N — one-line title
**Why:** (evidence: 2+ violations / observed pain)
**Change:** (exact suggested edit to SKILL.md)
**Status:** OPEN / APPLIED / REJECTED
```

## Proposals

### [2026-08-02] Proposal #1 — DEFER only when important; skill stops self-editing
**Why:** Owner directive: «Дефер только если это что-то важное. Скилл пусть копит предложения
на свои изменения, но не меняет, чтобы случайно не сойти с ума и не поплыть.»
**Change:** [DEFER] gate = IMPORTANCE (not just irreversibility); BOLD MODE #6 → proposals-only,
no self-edit; PROPOSALS.md ledger created.
**Status:** APPLIED (owner, 2026-08-02)
### [2026-08-02] Proposal #2 — Parallel autonomy: N agents, file-only coordination
**Why:** Owner request: «Научи агентов работать параллельно через автономию — типа 3 разных
агента все выполняют /autonomous-work». Agents run as SEPARATE Freebuff sessions; the ONLY
communication is files; need temp negotiation files checked several times per cycle, no conflicts.
**Change:** Added §11 Parallel Autonomy — agent ids (A1/A2/A3), parity board `_memory/parity/`
(one file per agent, write own / read all = no write races), claim protocol with staleness
(20 min), 5 checkpoints per cycle, per-agent carriers (heartbeat `...-HHMM-<id>.md`, digest
`digest-latest-<id>.md`), git rules (own files only, no `git add -A`, index.lock retry),
conflict-of-ideas rule. Board files created at `_memory/parity/`.
**Status:** APPLIED (owner, 2026-08-02)

### [2026-08-02] Proposal #3 — Split oversized SKILL.md (apply SkillsBench "focused ≤3 modules")
**Why:** A1 c82 skill-catalog audit (knowledge/findings/2026-08-02-A1-skill-catalog-audit.md):
this SKILL.md is 33.7 KB — top-1 of 39 skills (avg 10.3 KB). SkillsBench (arxiv 2602.12670)
shows focused skills ≤3 modules beat large bundles; large SKILL.md is injected entirely into
context on activation (true "exhaustive bundle"), unlike multi-file progressive skills
(e.g. security-review: 11.7 KB SKILL.md + on-demand references/ — correct pattern).
**Change:** Move §4 (Idea Generation), §8 (Safety Net), §9 (Deep Search Toolkit), §10 (System
Integration) detail into references/ sub-files (loaded on demand); keep core loop §1-§3, §7, §11
in SKILL.md ≤ 15 KB. Same treatment for skill-creator (33 KB/18 files) and
freebuff-global-config (26.4 KB single-file) at owner's discretion.
**Status:** OPEN

### Evidence update [2026-08-16 A6] — Proposal #3 NEW measurements
**Source:** A6 cycle +14:21 skillcheck on this SKILL.md (transcript `/tmp/skillcheck_a_w.txt`).
**Tool:** skillcheck 1.4.1, target-agent=all.
**Measurements:**
- 747 lines (was 33.7 KB / ~700 lines per 2026-08-02 audit — fair to assume structural growth)
- 8267 tok token-estimate > 8000 budget ✓ (confirms 2026-08-02 hypothesis)
- 7 warnings including:
  - sizing.body.line-count 747 > 500 ✓
  - sizing.body.token-estimate 8267 > 8000 ✓
  - disclosure.metadata-budget ~160 > ~100 ✓
  - disclosure.body-budget ~8105 > 5000 ✓
  - disclosure.body-bloat 74-line code block ✓
- 1 fail: missing frontmatter structure OR unresolved references
- Cursor UI compat: `description: >` block-scalar renders empty (recipe: `>-` substitution, 1-min mechanical fix)
- 13 broken-link errors are workspace-context false positives (skillcheck can't see workspace root from ~/.agents/skills/); informational only.

**Decision impact:** Proposal #3 (split oversized SKILL.md) was ALREADY the right call based on 2026-08-02 audit. The +14:21 measurements do NOT change that — they CONFIRM the structural concern is still present and add concrete budget numbers for the operator's split. The Cursor compat fix is separate infrastructure-item.
**Cross-ref:** `knowledge/findings/2026-08-16-A6/autonomous-work-skillcheck.md` (full diagnosis with operator ladder).
**Status:** OPEN (no change — proposal still awaiting owner application)

### CHANGE APPLIED [2026-08-17 A7] — owner direct request: no architectural decisions on owner's behalf
**Trigger:** 2026-08-16 autostart incident — A7 executed an architectural change (autostart stack,
reversing the 2026-08-01 no-autostart decision) on a message the owner later said they did not write
(likely a suggestion-card click). Owner: «Надо отредактировать режим autorun, чтобы запретить ему
выбирать архитектурные решения от моего имени».
**Applied to SKILL.md (owner's explicit instruction — normally the owner applies, per rule 6):**
- §2 Bold Mode #1: CARVE-OUT — reversibility never authorizes changing/reverting/reaffirming documented owner decisions.
- §3 Q3: architecture/standing-rule changes are never autonomous acts; restated phrase = confirmation, not override.
- §6 Not-your-decisions: +2 bullets — no self-initiated standing-rule changes; suggestion-card click / restated phrase ≠ authorization.
**Status:** APPLIED 2026-08-17 (owner-requested; exact text in SKILL.md).

**CORRECTED 2026-08-17 (owner):** owner clarified the target was the `autorun` skill
(`.agents/skills/autorun/SKILL.md`, workspace — the Auto-tab guardian), not this one
(«ТЫ НЕ ТОТ СКИЛЛ ПРАВИШЬ»). The three edits above were REVERTED from this SKILL.md
(file restored to original) and applied to `autorun/SKILL.md` instead: the guardian now
`stop`s with reason "owner decision needed" rather than auto-approving architecture /
standing-rule changes; suggestion-card click / autofill / restated phrase is not owner
authorization; ambiguous → stop and ask.
