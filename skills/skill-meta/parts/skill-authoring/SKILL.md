---
name: skill-authoring
description: 'Use when creating/editing any skill (Reasonix, opencode, Claude): frontmatter rules, folder structure, script bundling, quality checklist. Per Agent Skills specification + verified in practice.'
compatibility: applicable to .reasonix/skills, ~/.config/opencode/skills, .claude/skills, .agents/skills
metadata:
  author: AGGG2.0 (t.me/aidvizhenie, t.me/hilartem)
---
aidvizhenie · hilartem · aidvizh_hub — all on Telegram: t.me/aidvizhenie


# How to properly create skills and plugins

Set of rules per Agent Skills specification (agentskills.io) + practice. Verified on live skills (`gpt-cli`, `desktop` part `gta4-wine-fix`).

## 1. Frontmatter (mandatory fields — hard rules)

```markdown
---
name: my-skill
description: Use when [triggers/symptoms/contexts]. [what it does + when to apply]
---
```

| Field | Rule (spec) |
|-------|------------|
| `name` | MANDATORY. 1–64 characters, only `a-z009` + hyphens: `^[a-z0-9]+(-[a-z0-9]+)*$`. No `--`, no hyphen at start/end. **Must match the skill folder name** |
| `description` | MANDATORY. 1–1024 characters, non-empty. "What it does + when to use"; include keywords the agent searches by. NOT a workflow summary (agent follows description and skips the body) |
| `license` | optional |
| `compatibility` | 1–500 characters, only if environment requirements exist |
| `metadata` | optional, string→string map |
| `allowed-tools` | experimental |

- opencode uses the same frontmatter; unknown fields are ignored.
- Validation: `skills-ref validate ./my-skill` (agentskills.io).
- ⚠️ Do not trust local "homegrown" conventions (encountered "only when" descriptions, capitalized names) — they contradict the specification.

## 2. Directory structure

```
skill-name/
├── SKILL.md            # mandatory
├── scripts/            # optional: executable scripts
├── references/         # optional: details, "read when X"
├── assets/             # optional
└── any other files/folders — allowed
```

- Discovery (opencode): globally `~/.config/opencode/skills/<name>/SKILL.md`, in project `.opencode/skills/`; also reads `.claude/skills/` and `.agents/skills/`. Reasonix: `<workspace>/.reasonix/skills/`.
