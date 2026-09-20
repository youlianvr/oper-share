---
name: skill-meta
description: >-
  Meta-skills about the skills layer itself: creating new skills (scaffold +
  evals), validating and scoring skill quality, the authoring spec
  (frontmatter, folder structure, checklists), installing community skills,
  the local MCP-ecosystem map, and plugin bundles. Use when the task is
  about skills themselves — "create a skill", "test this skill", "install a
  community skill", "audit skill quality". The layer's rules live in
  docs/Skills.md; this router is the tooling that implements them.
---

# skill-meta — skills-about-skills

> Layer constitution: `docs/Skills.md` (one topic = one skill, parts under
> routers, archive never delete). Entry points `find-skills` and
> `relevance-scan` stay top-level — they are used every task, not themes.

## Choosing a part

| Situation | Part |
|---|---|
| Create a new skill from scratch, with evals and benchmarking | `parts/skill-creator/` (525K — read the sections you need) |
| Validate / score / grade a skill (structure, scripts, quality tiers) | `parts/skill-tester/` (562K — sectioned) |
| The authoring spec: frontmatter rules, structure, quality checklist | `parts/skill-authoring/` |
| Install or update a community skill from GitHub / local folder | `parts/skill-installer/` |
| Local MCP ecosystem map (BrowseMCP, SearchMCP) | `parts/skill-hub/` |
| Scaffold a plugin bundle with versioned manifest + trust review | `parts/plugin-creator/` |

## Rules

- Creating a skill starts with the intake rule in `docs/Skills.md`
  (repeatability, no-coverage via find-skills, a place not a pile) — the
  parts here are the how, not the whether.
- After creating or editing a skill: run
  `python _scripts/audit_skills_format.py` (0 violations required) and the
  skill-tester validation if scripts are involved.
- Triggers must survive: a skill whose description does not match its body
  will never fire — that was the August translation incident.
