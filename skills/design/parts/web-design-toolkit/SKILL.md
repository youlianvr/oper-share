---
name: web-design-toolkit
description: >-
  Use when creating a UI/web interface, layout, selecting colors/components/animations, generating DESIGN.md from someone else's site, cloning a style. Covers: design token generation from URL, UI component libraries, animations, inspiration, 3D mockups. Do not use for bot navigation (ux-navigation-context) and content delivery (content-delivery-format).
compatibility: web development (HTML/CSS/React/Next.js/Tailwind), browser for inspiration
metadata:
  author: Buffy (collected from @aidvizh_hub 2026-08-22)
---
# Web Design Toolkit — web design tools

Collection of verified web design tools from the AI Dvizh community.

## 1. DESIGN.md generators — extracting tokens from other sites

Working pattern: find a site you like → generate DESIGN.md → adapt for your project.

| Tool | What it does | When to use |
|------|-------------|-------------|
| **refero** | Database of 2000+ DESIGN.md, Tailwind v4, CSS variables, design tokens | Need a ready design system |
| **designmd** | URL → DESIGN.md with tokens, typography, component patterns | Quickly extract system from a site |
| **designmd supply** | Same, accepts any public domain | Alternative to designmd |
| **getdesignmd** | Generates design specifications and configurations | Detailed site analysis |
| **design-md-chrome** | Chrome extension for generating DESIGN.md directly from browser | Fast, no URL copying |

**Workflow:**
1. Find a reference site (see inspiration section)
2. Open design-md-chrome or paste URL in designmd/getdesignmd
3. Get DESIGN.md with tokens (colors, fonts, spacing, component patterns)
4. Adapt tokens for your project
5. Use components as a base, don't write from scratch

## 2. UI components — ready building blocks

| Resource | What | Count |
|----------|------|-------|
| **ui.watermelon.sh** | Free open-source UI components | 600+ |
| **smoothui.dev** | Animated React components for ShadCN | — |
| **sv-blocks.vercel.app** | Ready blocks for web | — |
| **sv-table.vercel.app** | Table components | — |

**Priority:** check watermelon.sh first (600+ items), then smoothui.dev if ShadCN/React is needed.

## 3. Animations and micro-interactions

| Resource | Type | Note |
|----------|------|------|
| **motion.dev** | Animation library for web | API-friendly, React/Vue |
| **sv-animations.vercel.app** | Animation examples | Ready patterns |
| **Loadmo.re** | Micro-interactions | Small UX effects |
| **Animos.app** | Design in motion showcase | Visual inspiration |
