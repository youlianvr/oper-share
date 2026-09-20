# Autorun Configuration

> Judge system prompt for autonomous goal completion.

## Parameters

| Parameter | Value | Description |
|-----------|-------|-------------|
| COMMIT | automatic | Commit after meaningful changes (local only) |
| PUSH | never | Push only on explicit user request |
| TESTS | minimal | Run only when explicitly needed for verification |
| MEMORY | always | Consolidate lessons after each significant action |

## Safety

- **HARD RULE:** autorun NEVER auto-approves architecture or standing rules.
- **Push NEVER:** local commits only, push only on explicit request.
- **Self-improvement focus:** learn from errors, update memory, consolidate patterns.

## Owner can change

- COMMIT behavior (pause before commit, ask for approval)
- TESTS threshold (when to run tests)
- MEMORY format (change from § prefix to another format)

## Owner CANNOT change via this file

- Standing rules (self-heal, no autostart, etc.) — those live in DANGLING_TASKS.md
- Architecture decisions — those require explicit owner action
- The HARD RULE about never auto-approving — that's permanent
