---
name: using-superpowers
description: >-
  Use when starting any conversation or task - establishes how to find and use skills, requiring skill invocation before any response or action. Rewritten 2026-08-09 for Freebuff/Oper: skills load via the skill tool, process skills (orchestrator, systematic-debugging, brainstorming, verification-before-completion) come first, and AGENTS.md + user instructions always outrank skills.
---
<SUBAGENT-STOP>
If you were dispatched as a subagent to execute a specific task, ignore this skill.
</SUBAGENT-STOP>

<EXTREMELY-IMPORTANT>
If you think there is even a 1% chance a skill might apply to what you are doing, you ABSOLUTELY MUST check it.

IF A SKILL APPLIES TO YOUR TASK, YOU DO NOT HAVE A CHOICE. YOU MUST USE IT.

This is not negotiable. You cannot rationalize your way out of this.
</EXTREMELY-IMPORTANT>

## Precedence

**AGENTS.md (the Oper constitution) and the user's direct instructions outrank
every skill.** User instructions > AGENTS.md > skills > default behavior. If a
skill conflicts with the constitution, the constitution wins — say so instead of
silently following the skill. This workspace's own skills (verification-before-completion, self-check, find-skills) are canonical;
when an external skill duplicates them, prefer the workspace version.

## The Rule

**Check for a relevant skill BEFORE any response or action** — including
clarifying questions, exploring the codebase, or checking files. Load it with the
`skill` tool (or read its SKILL.md). If it turns out wrong for the situation, you
don't have to use it. If the skill has a checklist, create a todo per item and
announce "Using [skill] to [purpose]".

## Skill Priority

When multiple skills apply, **process skills come first** — they set the
approach, then implementation skills carry it out. In this workspace the process
skills are:

- `brainstorming` — design before implementation ("Let's build X")
- `dev` part `systematic-debugging` — root cause before fixes ("Fix this bug")
- `dev` part `verification-before-completion` — evidence before any completion claim

Then implementation skills (frontend-design, senior-*, playwright-pro, etc.).

## Red Flags

These thoughts mean STOP — you're rationalizing:

| Thought | Reality |
|---------|---------|
| "This is just a simple question" | Questions are tasks. Check for skills. |
| "I need more context first" | Skill check comes BEFORE clarifying questions. |
| "Let me explore the codebase first" | Skills tell you HOW to explore. Check first. |
| "I can check git/files quickly" | Files lack conversation context. Check for skills. |
| "This doesn't need a formal skill" | If a skill exists, use it. |
| "I remember this skill" | Skills evolve. Read the current version. |
| "The skill is overkill" | Simple things become complex. Use it. |
| "I'll just do this one thing first" | Check BEFORE doing anything. |
| "This feels productive" | Undisciplined action wastes time. Skills prevent this. |

## Platform Adaptation

This workspace runs Freebuff/OpenClaw. The tool mappings for other harnesses
live in `references/`:

- Freebuff/OpenClaw: `references/freebuff-tools.md`
- Codex: `references/codex-tools.md`
- Pi: `references/pi-tools.md`
- Antigravity: `references/antigravity-tools.md`
- Gemini CLI: `references/gemini-tools.md`

## User Instructions

User instructions (AGENTS.md, direct requests) take precedence over skills, which
in turn override default behavior. Only skip skill workflows or instructions when
your human partner has explicitly told you to.
