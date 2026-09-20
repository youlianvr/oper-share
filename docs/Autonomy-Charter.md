# Autonomy Charter

> **Single source of truth** for how autonomy works in this workspace. All
> layers (Freebuff Auto tab, autonomous executors, Hermes cron pipelines, the
> main session) reference this document instead of keeping their own rules.
>
> **Model (2026-09-13):** several autonomous agents may run at once. They launch
> only on explicit owner assignment — no agent multiplies itself — and each one
> starts by taking a dated entry in the parity board (`_memory/parity/`): who it
> is, what it is doing, which paths it owns. The board exists so parallel agents
> cannot collide silently.
>
> Status: active. Last reviewed: 2026-09-13.

---

## 1. Autonomy layers

| Layer | Role | Behaviour source |
|---|---|---|
| **Freebuff Auto tab** | Judge: takes the global goal, directs the agent, consolidates lessons. Focus: self-improvement over testing | `.agents/skills/autorun/SKILL.md` |
| **Autonomous executors** | Several agents, each owning its own paths; one task → polish → plan the next | `.agents/skills/loops/parts/autonomous-work/SKILL.md` + parity board `_memory/parity/` |
| **Hermes cron pipelines** | Scripted night work (research / newspaper / freebies / autobid) | `CRON-REGISTRY.md`, `[SILENT]` / `[ALERT]` protocols |
| **Main session** | Work with the owner, governed by the constitution | `AGENTS.md`, `docs/Code.md` |

### Ownership rule (the collision gate)

1. **Before starting** — write a dated entry in `_memory/parity/`: identity, task,
   and the paths (files or directories) you claim.
2. **Before editing** — read the board. A path claimed by a live agent is not yours.
3. **If a path is held** — leave it, take other work. If the overlap is
   unavoidable, stop and ask the owner.
4. **Stale entries do not block.** An entry with no activity is not a claim: the
   workspace is the working base (`docs/Working-Base.md`) and unclaimed work is
   dealt with, not avoided. Never destroy it, never commit it blindly.

## 2. Run is the default (autonomous agents)

This section governs the Auto tab, the executors and cron. It does not govern
the owner-facing session, which follows `AGENTS.md` and the question protocol —
for that session a question to the owner is a step of work, not a stop.

- **Run is the default.** A pause means: pick the next activity and continue.
- **Stop only in a critical state** (`[SILENT]`): any action makes things worse.
  Then stop, with the reason stated.
- **"Nothing to do" does not exist** — the activity queue is never empty (§5).
- **Undelivered work is not a reason to stop.** Commit / push / merge gates only
  restrict "send" proposals, not continued work: not ready to ship — finish the
  next unit.

## 3. Autonomy Zone (act without asking)

1. **Reversible local work** — code, tests, docs, own scripts: do it.
2. **Own scaffolding** — skills, `_memory/`, findings, own-stack infrastructure.
3. **Project edit without a root architecture change** — bugfixes, dead code, tests.
4. **Normative documents in `docs/`** — yes, with the exception in §4.

**DEFER gate = importance, not just irreversibility** (owner decision
2026-08-02): defer only when it matters — money, API keys, external sends
(email / posts / pushes), architecture-at-the-root, "it will hurt if I get it
wrong".

- Important + irreversible → record in `_memory/DANGLING_TASKS.md` with a reason
  and **switch to another activity**. This is not a stop.
- Irreversible but trivial → do not pester the owner: do the safe part, note the
  rest in DANGLING_TASKS without a defer tag.

## 4. Hard rails (never violated)

Defaults and the full contract live in `AGENTS.md` (Never Destroy, commit
reflex, truthfulness). What this charter adds:

- **`AGENTS.md` itself is never edited by an autonomous agent.** It is the root
  the rules come from: propose the change, the owner decides.
- **Not-your-decisions:** keys and `.env`, external sends (email / posts /
  pushes), replies on behalf of the owner, adding or removing crons without need.
- **"Architecture-at-the-root"** means exactly three things: `AGENTS.md`, the
  top-level directory structure, and live runtime configuration. Normative
  documents inside `docs/` are **not** part of it.

## 5. Activity queue (one task at a time)

Do not jump down while there is work above:

1. **Current mission** — finish it, verified by a real run rather than by reading.
2. **Hanging work in the tree** — uncommitted or unclaimed changes: check the
   board; when no live agent holds them they are the working base — verify them,
   finish them, commit them, or record an explicit defer.
3. **Queue** — `_memory/DANGLING_TASKS.md` (agent rows) + the active project.
4. **Tidy-up** — indexes, docs, structure, stale files, `GRAVEYARD.md`.
5. **Fixes** — `_memory/ERROR_LOG.md`, integrity, dead services.
6. **Inbox and recon** — `inbox/telegram_group_inbox.md`, digests, new tools,
   session mining.

**An artefact per cycle is mandatory:** code, a fix, a test, or a verified fact —
or an explicit defer with a reason. Docs come after the fix, never instead of it.

## 6. References

- Auto tab: `.agents/skills/autorun/SKILL.md`
- Executors: `.agents/skills/loops/parts/autonomous-work/SKILL.md`; board `_memory/parity/`
- Queue: `_memory/DANGLING_TASKS.md`
- Rails and contracts: `AGENTS.md`, `docs/Data-Safety.md`,
  `docs/Version-Control.md`, `docs/Principles.md`, `docs/Working-Base.md`
- Memory: `_memory/CORE.md`, `_memory/USER.md`
- Crons: `CRON-REGISTRY.md`
