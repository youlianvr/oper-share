---
name: self-learning
description: >
  Capture a hard-won "golden path" from the current session as a reusable Agent
  Skill, so future sessions start already knowing it. Use it (1) right after
  non-trivial debugging, after working out a multi-step operational workflow, or
  after rediscovering project facts you didn't know up front — e.g. how to reach
  the dev/prod database, where credentials and env vars live, how to deploy, run
  migrations, or verify a change live; and (2) whenever the user says "remember
  this", "save this as a skill", "make a skill for this", "don't make me
  re-explain this next time", "the recurring solution pattern", runs /si:extract,
  or otherwise wants a workflow preserved across sessions. Proactively recognize
  the moment even when unprompted: if a task took several attempts before it
  worked, used non-obvious tooling, or is likely to recur, harvest it without
  asking first. Delegates to a subagent when your tool supports one, or works
  inline, to extract the proven procedure into a new project-local or global
  skill.
license: MIT
metadata:
  author: kulaxyz
  version: "2.0.0"
  merged_from: "extract v1.0 (/si:extract, self-improving-agent plugin) — absorbed 2026-08-05: reserved-name rules, SKILL.md template, quality gates"
---

# Self-learning: harvest golden paths into skills

This skill turns something you just figured out the hard way into a reusable
Agent Skill, so the next session — yours or a teammate's — starts already
knowing the proven route instead of rediscovering it from scratch.

It is a *meta-skill*: it doesn't do the work, it captures **how** work got done.
It's tool-neutral — it works with any agent that reads the Agent Skills format
(e.g. Claude Code and Codex, which both load `SKILL.md` skills natively). Where a
step differs by tool, the generic version comes first and any tool-specific
detail is only an example.

> **/si:extract** (from the self-improving-agent plugin) is an alias for this
> skill: `extract` was merged into `self-learning` on 2026-08-05. The `/si:extract`
> trigger and workflow are preserved below.

## Recognize the moment

Watch for these signals during normal work. Any one of them is a cue to harvest:

- A task only worked **after several attempts**, wrong turns, or a correction
  from the user. The successful path is worth more than the failures around it.
- You discovered **project-specific facts the agent didn't know up front**:
  where creds/env vars live, which selector or backend talks to a service, a
  non-obvious command, a required sequence, a gotcha that defies the obvious
  assumption.
- It's an **operational workflow likely to recur**: reach the dev/prod DB,
  deploy, run migrations, seed data, verify a change live, run one specific
  test path, rotate a key, tail the right logs.
- The user **signals it explicitly**: "remember this", "save this as a skill",
  "don't make me re-explain this next time".

**When to extract (any of these qualifies):**

| Criterion | Signal |
|---|---|
| **Recurring** | Same issue across 2+ projects |
| **Non-obvious** | Required real debugging to discover |
| **Broadly applicable** | Not tied to one specific codebase |
| **Complex solution** | Multi-step fix that's easy to forget |
| **User-flagged** | "Save this as a skill", "I want to reuse this" |

**Act on the cue immediately — don't ask for permission first**, whether the
user requested it or you noticed it yourself. Harvest the skill, then tell the
user what you captured and where (step 5). They can always edit or delete it.

### Skill, memory, or skip?

Not every lesson deserves a whole skill — triage first, so you don't bloat the
skills list with one-liners:

- **A multi-step, reusable procedure or workflow** (how to deploy, reach the DB,
  run the migration dance, verify live) → harvest it as a **skill** using the
  procedure below.
- **A single standalone fact or one-line correction** (an env var name, a path,
  one gotcha) → if your harness has a lightweight memory/notes facility (e.g. a
  `MEMORY.md` index), record it **there** instead; a whole skill is overkill for
  a one-liner. With no such facility, make a small skill.
- **A genuinely one-off thing** unlikely to recur → skip it.

When you do harvest, capture the **failures too**, not just the win: the
approaches you ruled out and *why* often save more time next session than the
golden path itself.

### Promotion rule: don't enshrine guesses

A skill is authoritative — the next session trusts it without re-deriving it —
so hold promotion to a high bar. Only write a skill when **all three** hold:

1. **A passing check.** The path was actually verified — a test passed, the
   command exited clean, the repro reproduced, the build went green. Record what
   the check was. "Seemed to work" is not a passing check.
2. **A named failure pattern.** You can name the failure this path avoids or
   diagnoses (e.g. "stale build cache → phantom type errors"), not a vague
   "sometimes it breaks".
3. **At least one ruled-out dead-end.** A concrete approach you tried and
   eliminated, with the reason.

If any is missing, it isn't a skill yet — leave a tentative note in memory
(marked unverified) or skip it. This keeps confident guesses out of the skill
set.

## Harvest procedure

- [ ] 1. **Apply the promotion rule** (above). Passing check + named failure
      pattern + one ruled-out dead-end — or it isn't a skill: note it in memory
      or skip. Don't proceed on a confident guess.
- [ ] 2. **Choose scope and name yourself** using the heuristics below — don't
      stop to ask. Default to project scope; pick a clear, specific `name`.
- [ ] 3. **Dedupe.** Look for an existing skill to UPDATE rather than duplicate.
      List your agent's skills directories — the project one and the user-level
      one (e.g. Claude Code `.claude/skills` + `~/.claude/skills`, Codex
      `.codex/skills` + `~/.codex/skills`, or your tool's equivalent). Also
      glance at any memory/notes index — a fact already there may just need a
      pointer.
- [ ] 4. **Distill the golden path from THIS conversation** before delegating —
      while it's fresh in your head: the exact working commands, file paths, env
      var names, the required order, and (just as important) the dead-ends to
      avoid. This is the raw material for the write.
- [ ] 5. **Delegate the write** to a subagent that inherits this conversation if
      your tool supports one, or do it inline otherwise — see below. The
      conversation is the only place the golden path lives, so whoever writes it
      must have that context.
- [ ] 6. When the write is done, **relay the new skill's path** to the user
      and, in one line, what it captured.

### Scope: project vs global

- **Project** (the repo's skills directory — e.g. `.claude/skills/`,
  `.codex/skills/`): the path is specific to THIS codebase — its env vars, its
  build/release steps, its schema, its quirks. Most harvested operational skills
  are project-scoped, and they ship to the team via git.
- **Global** (your user-level skills directory — e.g. `~/.claude/skills/`,
  `~/.codex/skills/`): the path generalizes across projects — a personal tool, a
  cross-repo habit, or a workflow tied to your machine rather than to one repo.

When unsure, prefer **project** — an over-shared global skill triggers in repos
where its commands don't apply.

### Generate the skill name

Rules for naming:
- Lowercase, hyphen-separated (`a-z`/`0-9`/hyphens only — no leading, trailing,
  or doubled hyphens). `name` must equal the directory name.
- Descriptive but concise (2-4 words). Examples: `docker-m1-fixes`,
  `api-timeout-patterns`, `pnpm-workspace-setup`.
- **Reserved fragments — must NOT appear in the skill name:** `claude`,
  `anthropic`. For skills about the agent tool itself, use the `cc-` prefix:
  - ❌ `claude-code-settings` → ✅ `cc-settings`
  - ❌ `claude-mcp-tools` → ✅ `cc-mcp-tools`
  - ❌ `claude-plugin-development` → ✅ `cc-plugin-development`
  Check the proposed name before writing the skill directory; if a reserved
  fragment is present, transform it (drop the fragment or replace the
  `claude*`/`anthropic*` prefix with `cc-`) and confirm with the user.

## Delegate the write (subagent, or inline)

Whoever writes the skill needs THIS conversation's context — it's the only place
the golden path lives. Two equally valid ways to run it:

- **Inline** — do the steps yourself in the main loop. Always works.
- **Subagent** — if your tool can delegate to a subagent that **inherits this
  conversation**, use it to keep the harvesting work out of your main context.
  (Claude Code: a skill with `context: fork`. Codex and others spawn subagents
  their own way.) Don't hand it to a *fresh* agent with no context — it would
  start blank with nothing to extract.

Either way it over-reaches by default, so box it in tightly. Follow this brief
(fill in the bracketed parts) — hand it to the subagent, or work through it
yourself inline:

> You are harvesting a skill. Your ONLY job is to write a new Agent Skill
> capturing the golden path we just worked out in this conversation:
> **[one-line description of the workflow]**.
>
> Hard rules:
> - Write ONLY under `[skills dir]/[skill-name]/`. Do NOT modify project
>   source, run builds, install anything, or resume the original task.
> - First read `[this-skill-dir]/references/skill-authoring.md` and
>   `[this-skill-dir]/assets/SKILL.template.md`, then author `SKILL.md` to that
>   spec, plus any `references/` or `assets/` files the procedure warrants.
> - Capture the PROCEDURE — commands, paths, the required order, gotchas — not a
>   one-off answer. Generalize so it works next time.
> - Capture the FAILURES too: the approaches we ruled out and why, so the next
>   session skips the dead-ends. Put them in a "What didn't work" section.
> - Enforce the promotion rule: the skill must record the passing check that
>   verified this path, name the failure pattern it addresses, and list at least
>   one ruled-out dead-end. If any is missing (e.g. nothing was actually
>   verified), STOP and report it isn't promotable — leave a tentative memory
>   note instead of writing the skill.
> - NEVER write secret VALUES (passwords, tokens, connection strings, API keys).
>   Record only WHERE to find them: the env var name, the selector function, the
>   MCP tool, the secret manager. Reproducing a secret into a skill file leaks it.
> - Self-validate before finishing (see the checklist in skill-authoring.md).
> - Report back: the absolute path you wrote and a one-line summary. Then STOP —
>   do not pick the original task back up.

## SKILL.md structure for extracted skills

The generated `SKILL.md` must follow this format (from the merged `/si:extract`):

```markdown
---
name: "<skill-name>"
description: "<one-line description>. Use when: <trigger conditions>."
---

# <Skill Title>

> One-line summary of what this skill solves.

## Quick Reference

| Problem | Solution |
|---------|----------|
| {{problem 1}} | {{solution 1}} |
| {{problem 2}} | {{solution 2}} |

## The Problem

{{2-3 sentences explaining what goes wrong and why it's non-obvious.}}

## Solutions

### Option 1: {{Name}} (Recommended)

{{Step-by-step with code examples.}}

### Option 2: {{Alternative}}

{{For when Option 1 doesn't apply.}}

## Trade-offs

| Approach | Pros | Cons |
|----------|------|------|
| Option 1 | {{pros}} | {{cons}} |
| Option 2 | {{pros}} | {{cons}} |

## Edge Cases

- {{edge case 1 and how to handle it}}
- {{edge case 2 and how to handle it}}
```

Structure is a guide, not a cage — a one-problem skill with a single clean
solution may need no Trade-offs table at all. The hard requirements live in the
quality gates below.

## Quality gates

Before finalizing, verify:

- [ ] SKILL.md has valid YAML frontmatter with `name` and `description`
- [ ] `name` matches the folder name (lowercase, hyphens)
- [ ] `name` does NOT contain reserved fragments `claude` or `anthropic` (use `cc-` prefix for agent-tool skills)
- [ ] Description includes "Use when:" trigger conditions
- [ ] Solutions are self-contained (no external context needed)
- [ ] Code examples are complete and copy-pasteable
- [ ] No project-specific hardcoded values (paths, URLs, credentials)
- [ ] No unnecessary dependencies
- [ ] The promotion rule holds: passing check + named failure pattern + one ruled-out dead-end recorded

## Gotchas

- **Secrets never go in a skill file.** Skills get committed and open-sourced.
  Point to *where* the secret lives; never reproduce the value. This is the
  single most important rule in this skill.
- **`name` must equal the directory name**, and be lowercase `a-z`/`0-9`/hyphens
  only — no leading, trailing, or doubled hyphens. A mismatch means the skill
  won't load.
- **Whoever writes the skill over-reaches by default** (a subagent especially).
  That's why the brief above forbids touching project source or resuming the
  task — keep it boxed to the skills directory.
- **Don't duplicate.** If a near-identical skill (or memory) already exists,
  update it instead of spawning a second one that competes to trigger.
- **Capture procedures, not answers.** "Join orders to customers for EMEA" is
  useless next time; "how to find the right tables and build the query" is the
  skill. See `references/skill-authoring.md`.
- **Keep `SKILL.md` tight** (< 500 lines, < ~5000 tokens). Push detail into
  `references/` and tell the reader *when* to load each file.
- **Extract patterns that would save time in a *different* project.** Keep
  skills focused — one problem per skill. Include the error messages people
  would search for. Test the skill by reading it without the original context —
  does it make sense?

For the full authoring spec, see
[references/skill-authoring.md](references/skill-authoring.md). The fill-in
template is [assets/SKILL.template.md](assets/SKILL.template.md).


---

## Related /si:* memory workflows (merged from self-improving-agent, 2026-08-09)

The `self-improving-agent` plugin (Claude Code auto-memory) was archived on 2026-08-09; its
`/si:extract` workflow already lived here, and the remaining memory-curation workflows are
condensed below, adapted to THIS workspace (Hermes `_memory/` + `AGENTS.md`):

| Command | What it does | Where it writes here |
|---|---|---|
| `/si:remember` | Save a hard-won fact explicitly | Append `§ TOPIC: fact` to `C:/Users/pc/AppData/Local/hermes/memories/MEMORY.md` (system) or `USER.md` (profile); dedupe with grep first |
| `/si:promote` | Graduate a recurring pattern from notes to enforced rule | `_memory/CORE.md` / `AGENTS.md` / `_memory/l2-policy/` — imperative voice, one line per rule |
| `/si:memory-review` | Find promotion candidates, stale entries, consolidation | Read `_memory/INDEX.md` + `ERROR_LOG.md` + Hermes MEMORY.md; report candidates / stale / conflicts |
| `/si:memory-status` | Memory health dashboard | Line counts vs limits (Hermes `memory_char_limit`), topic files, stale refs, duplicates |

Workflow: (1) parse what / why it matters / scope; (2) dedupe via `grep -ni "<keywords>"`; (3) write
concise entry; (4) if it sounds like a rule (imperative, always/never) suggest `/si:promote` instead.
Never store credentials/secrets in memory files. Promote when a pattern recurs 3+ times or you
corrected the agent more than once; don't promote one-time debugging notes or session-specific
context. The archived full skill (Claude Code paths, hooks, agents) is recoverable from
`_archive/skills-trash-20260807/self-improving-agent`.
