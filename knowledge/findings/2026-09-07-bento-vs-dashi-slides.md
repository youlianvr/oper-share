# Brief: Bento vs Dashi vs HyperFrames — our presentation stack (2026-09-07)

All three installed as of 2026-09-07. They are different niches, not rivals:

| | **Bento** (bento-slides skill) | **Dashi PPT** | **HyperFrames** |
|---|---|---|---|
| What | ONE self-contained .bento.html = app + viewer + editor + document (plain JSON in `#bento-doc` block) | Agent generates HTML deck (1020 layouts, 12 themes) → browser editor → exports editable PPTX/PDF | HTML+CSS → deterministic MP4 video for agents |
| Output | living web deck (morph transitions, live charts, video/audio embeds) | classic deck for PowerPoint people | video file |
| AI model | agent edits only the JSON block; guide = bento.page/agents.md; fetches fresh app itself | goal.json → render pipeline (v0.4.5 scaffold bug on copy.t* themes, worked around) | AGENTS.md composition contract; npm run check + render |
| Storage | the file IS the product; saves itself; no account | PPTX 11.6MB example in experiments/dashi-demo | renders/ git-ignored |
| Best for | shareable modern deck that "works forever" (email, archive); AI-native editing | when the receiver needs real PowerPoint/PDF | when the deliverable is video |

## Audit verdict (bento-slides skill, installed)
Clean: 136 lines, only bento.page/nyblnet URLs, no exec/eval, no third-party
endpoints. Notable security-conscious touches: warns the agent to tell the user
if a deck carries `doc.collab` live-session keys (the file is the invitation),
recommends rotating keys before sharing. Install: `.agents/skills/bento-slides/`.

## Routing rule
- "make me a deck" (web-native, self-contained) → **Bento** (auto-triggers on
  slides requests per its skill).
- "presentation from document, need PPTX" → **Dashi**.
- "video of it" → **HyperFrames**.
