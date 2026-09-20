---
name: ux-ui-kit
description: >
  Senior-design-architect kit vendored from plugin87/ux-ui-agent-skills
  (v2.5.1, @2ffb677). 17 runnable skills, 138 design-system briefs, DTCG
  design tokens (primitive→semantic→component), WCAG 2.2 AA/AAA gate
  scripts, anti-slop doctrine. Use for ANY frontend/UI work: building
  pages, components, design systems, a11y audits, design review, or when
  the owner asks for a non-generic ("not like everyone else's") interface.
license: MIT (claimed in README + npm metadata; no LICENSE file upstream —
  attribution kept in tools/ux-ui-agent-skills/PROVENANCE.md)
---

# UX/UI Kit

Vendored library lives at `tools/ux-ui-agent-skills/` (owner decision
2026-09-12: vendor whole). This wrapper routes you into it.

## Layout

- `tools/ux-ui-agent-skills/.claude/skills/` — 17 runnable skills:
  a11y-audit, apply-aesthetic, brandkit, design-code, design-component,
  design-qa, design-review, design-tokens, figma-integration, governance,
  image-to-code, migrate-design-system, performance, prototype, redesign,
  token-build, ux-writing. Each dir has its own SKILL.md — read the one
  you need.
- `tools/ux-ui-agent-skills/.claude/rules/` — 7 rule files (accessibility,
  tokens-and-color, typography-and-spacing, components, frameworks,
  review-and-research, brand-and-operations). Load the relevant rule when
  doing that class of work.
- `tools/ux-ui-agent-skills/design-systems/library/` — 138 brand-grade
  design-system briefs (apple, airbnb, ant, linear, vercel, brutalism,
  swiss...). Reference material: pick 1–3 matching the target aesthetic,
  never blend more.
- `tools/ux-ui-agent-skills/components/` + `evals/` — component specs and
  golden eval briefs.

## Routing

- Build/redesign UI → read `design-code` or `redesign` skill first.
- Need a distinct look → `apply-aesthetic` + pick briefs from
  `design-systems/library/` by category.
- Audit existing UI → `a11y-audit` (P0/P1/P2 findings) and/or
  `design-qa` (gates: contrast, focus-trap, RTL, target size,
  reduced-motion, overflow).
- Tokens → `design-tokens` / `token-build` (DTCG JSON, 3-tier).
- Copy in UI → `ux-writing`.

## House rules (Oper layer, on top of the kit)

1. Workspace docs English; owner chat Russian — kit outputs follow the
   task language.
2. Our `antislop` skills remain the first gate for AI-slop text/phrasing;
   this kit's taste/slop audits cover visual slop. Run both on frontend
   tasks.
3. Gate scripts under `.claude/skills/*/scripts/` (validators, axe-core
   runners) are plain node/py — run them directly, no install needed.
4. Upstream updates: re-clone, diff, port deltas (same recipe as AGGG
   updates). Record provenance in `tools/ux-ui-agent-skills/PROVENANCE.md`.

## References

- tools/ux-ui-agent-skills/README.md (full capability table)
- tools/ux-ui-agent-skills/CLAUDE.md (integration manifest)
- knowledge/findings/2026-09-11-tg-favorites-batch2.md (license analysis)
