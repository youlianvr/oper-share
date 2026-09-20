---
name: self-reflection
description: >-
  Self-reflection layer for AGGG: at the end of a session/feature/phase,
  extract lessons, anonymize (no IP/countries/providers/names), decide
  where — RAG note, update existing skill, or new skill (pattern: vpn-stack-fix).
  Cycle: "tried → observable check → kept or deleted". Senior test:
  does the feature help? is it a proven pattern or neuro-slop? does the
  button press and vibrate? Russian design with green accents.
  Triggers: "what did we learn", "format a lesson", "make a skill",
  "self-reflection", "did it work?", "delete the extra",
  "neuro-slop or pattern", "summarize the session".
invocation: model+user
---
# Self-Reflection — AGGG self-reflection layer

> Memory of experience. Each session leaves a trace: RAG note, skill update,
> or new skill. A skill = a proven repeatable pattern, not neuro-slop.

## When to use

- End of session / feature / phase: something non-trivial happened (bug, workaround, surprise, discovered pattern)
- Request "what did we learn", "format as a skill", "write a lesson", "summarize the session"
- Doubt "is this a feature or slop?" — the check cycle from this skill activates
- Before deleting a feature: first record the lesson, then delete

## Core idea

Memory of experience — three layers, by decreasing weight:

| Layer | Where | When |
|---|---|---|
| 1. RAG / note | `aggg note` / `storeDocument` | single fact, minor, "why we deleted" |
| 2. Existing skill | add a section to it | topic already covered — don't duplicate |
| 3. New skill | `.skills/<name>/SKILL.md` | new repeatable pattern (2+ cases or high complexity) |

Value criterion: **it can be repeated**. General phrases ("be more careful",
"check more thoroughly") — not a lesson, doesn't go into skills, at most RAG.

## Step cycle: tried → checked → kept or deleted

Work one feature/module at a time, step ≤ ~15 lines, one file:

1. **PLAN** — one sentence: "Step N: doing X in Y, to get Z".
2. **ACTION** — minimal change. Nothing "while at it".
3. **CHECK** — observable: test, launch, grep, curl, health. "Looks like it works" doesn't count.
4. **DECISION** — worked (check is green AND useful to user) → keep;
   no → delete, lesson "why it didn't work" → RAG (protection from repeating the same mistake).
5. **RECORD** — "Step N: OK/FAIL — check showed …".

### Senior test questions before "keep"

- [ ] Useful to user? Intuitive from first glance, without instructions?
- [ ] Is this a proven pattern / human thinking — or neuro-slop / feature for the sake of a feature?
- [ ] Russian design: tests and interface in Russian; "green" lights where success should be?
- [ ] Button presses AND visually confirms press (active/pressed state)?
- [ ] Function justified without over-engineering? Simplified/removed excess?
- [ ] No personal data in files: history, configs — runtime, not on disk — only generalizations?

## How to format a lesson (step by step)

### Step 1. Extract
Answer 4 factual questions, without judgment:
- What actually happened?
- What worked (can be repeated)?
- What broke and why (root cause, not symptom)?
- What was surprising (expectation ≠ reality)?

### Step 2. Anonymize (strictly)
NEVER in skills and notes: IP addresses, countries, providers, names, keys, tokens,
real user identifiers, absolute paths (`C:\`, `D:\`, `/home/<name>`).
Instead — generalizations: "foreign IP", "client wrapper", "subscription config", `~`.
Anonymization check:
```bash
grep -rE "([0-9]{1,3}\.){3}[0-9]{1,3}|C:\\\\|D:\\\\|/home/" .skills/<name>/   # → empty
```

### Step 3. Decide where the lesson goes
| Situation | Where |
|---|---|
| Single fact, minor, "why we deleted" | RAG: `aggg note "..."` or `storeDocument` |
| Topic already covered by a skill | add a section "Self-reflection" to the existing skill |
| New repeatable pattern | new skill `.skills/<name>/SKILL.md` |
| Lesson clarifies/contradicts old skill | UPDATE the old one (don't create a second) |

Before creating — verify the topic doesn't exist: `find-skills` / grep `.skills` by key words.

### Step 4. New skill structure (pattern: vpn-stack-fix, vpn-gui-setup)

Frontmatter:
```yaml
---
name: <kebab-case>
description: <description WITH TRIGGERS: "fix X", "X doesn't work", "how to do Y">
invocation: model+user
---
```
Body sections (in order):
1. **When to use** — concrete situations and user phrases
2. **Core idea** — essence in 3–5 lines
3. **Steps** — how it's done, each step with observable check
4. **What NOT to do** — lessons/gotchas, often more valuable than steps
5. **Success check** — checklist `[ ]`, by which "kept" is visible

Commands — cross-platform (Windows/Linux/macOS): `~`, no absolute paths;
where needed — both wrappers (.cmd/.sh) or universal syntax.

### Step 5. Check that the skill "took"
- [ ] `aggg health` / `aggg status`: skill count grew by 1
- [ ] description contains triggers by which the skill is found in time of need
- [ ] grep for personal data (IP, paths, names) → empty
- [ ] each step has an observable check
- [ ] "What NOT to do" section is not empty

### Step 6. Propagation: a skill that changes the protocol goes to ALL agents

Edit only `AGGG.txt` (single source) → `aggg prompt_sync` distributes full copies:
- claude → `~/.claude/CLAUDE.md`
- cline → `~/Documents/Cline/Rules/AGENTS.md`
- jcode → `~/.jcode/swarm-prompt.md`
- opencode → link `{file:AGENTS.md}` — edit `AGENTS.md` MANUALLY (no generator)
- omp / pi → read project `AGENTS.md` (agent standard)

Propagation check (mandatory):
```bash
grep -c "SectionName" ~/.claude/CLAUDE.md ~/Documents/Cline/Rules/AGENTS.md ~/.jcode/swarm-prompt.md AGENTS.md
# expected: 1 1 1 1
```
+ `aggg verify` → "3b. Prompt integrity" PASS.

Lesson → RAG (`storeDocument` / `aggg note`), so it comes up at the start of the next task (`aggg recall`).

Rule: a skill without propagation = a skill of one agent. If it changes the work protocol —
it's DEAD until the section gets into AGGG.txt and its copies.

## Skill lifecycle

- **Growth**: only from proven cases. One case = a note; 2+ or high complexity = skill.
- **Update**: lesson clarifies old skill → patch it, with "updated: <date>".
- **Deletion**: skill never worked in a month / feature didn't justify itself → delete, lesson → RAG.
- **Duplicate**: found a second skill on the same topic → merge into one, delete the extra.

## What NOT to do

- Don't write a skill "for the future" without a tested case — that's neuro-slop
- Don't duplicate an existing skill topic — first grep/find-skills `.skills`
- Don't store personal data (IP, names, keys, paths) in skills, notes and configs — only generalizations
- Don't hardcode absolute paths — `~` and cross-platform commands
- Don't say "works/green" without observable checks — "looks like it works" doesn't count
- Don't delete a feature without recording the lesson "why we deleted it" — otherwise it returns in a month

## Code editing gotchas (updated: 2026-08-03 — 4 duplicates in one session)

- **One edit per file per editor call.** Two edits of one file in one call:
  the second gets remapped to inline line numbers → duplicate `def`, `<script>` inside `<style>`,
  double `return`. Caught 4 times in one day.
- **After EACH edit, re-read the entire changed block** to avoid drift; before the next edit
  of the same file — new read with fresh line numbers.
- **INSERT.POST into if/elif chain**: code may end up INSIDE the nearest function (before its return)
  — check that you didn't break the function's return.
- **Multi-line literals** (dict/help-text): edit the entire block as one SWAP, not line by line.
- After any code edit — syntax check (py_compile/node --check) + guard initialization + tests.

## Success check (of the layer itself)

- [ ] Each completed session left a trace: RAG note or skill update
- [ ] Skills grow only from proven cases, no duplicates
- [ ] No personal data in skills and configs (grep-check clean)
- [ ] Cycle "tried → checked → kept/deleted" actually works on each feature
