---
name: session-log
description: >-
  Format and conventions for session logs in _archive/memory/YYYY-MM-DD.md.
  Use when: starting/ending a session, logging actions, running Dream consolidation.
---

# Session Log Format

## File Location
`_archive/memory/YYYY-MM-DD.md`

## Structure

```markdown
# Session Log — YYYY-MM-DD

## Summary
One-line summary of session purpose.

## Actions
- **HH:MM** — Action description
- **HH:MM** — Action description

## Discoveries
- Finding 1
- Finding 2

## Decisions
- Decision 1 (reasoning)

## Unfinished
- Task 1 (priority)

## Files Changed
- path/to/file.md — description
```

## Rules
- Timestamps in HH:MM format (local time)
- Keep entries concise (1-2 lines each)
- Mark unfinished tasks with priority
- List all modified files
