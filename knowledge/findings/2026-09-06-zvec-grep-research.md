# Research brief: zvec-grep (zg)

Researched 2026-09-06 (owner decision path: "study the docs first"). Sources:
zvec.org docs, GitHub zvec-ai/zvec-grep, npm, MarkTechPost (2026-09-02).

## What it is

Local workspace retrieval layer from the Qwen/Zvec team. Unifies four search
modes behind one CLI (`zg`) and a local MCP server:

- **exact** — ripgrep
- **lexical** — BM25
- **semantic** — vector search (local embeddings by default: Model2Vec
  potion-code-16m-v2 via ONNX/GGUF; remote Qwen embeddings only with consent)
- **hybrid** — the fusion mode, ranked evidence with paths/symbols/lines

Data never leaves the machine in the default configuration.

## Key facts verified

- Node.js 22+ required (we run 25.8 — OK).
- Install: `npm install -g @zvec/zvec-grep`; index via
  `zg index --embedding local/potion-code-16m-v2`; query via
  `zg query --human "..."`; agent wiring via `zg install --target codex
  --target claude --target cursor --yes`.
- Claimed benchmarks (their own A/B tests: SWE-QA-Bench 20 tasks with Claude
  Code + Opus 5; BrowseComp-Plus 100 cases with Codex): answer quality flat,
  input tokens / tool calls / wall time down. Vendor-run numbers — treat as
  directional, not proof.
- Positioning vs our stack: complements `mcp-first` (its MCP server would be
  another source the router can pick) and does NOT replace ripgrep — it
  wraps it. Graphify overlaps partially (both index the workspace) but
  graphify builds a symbolic graph, zg does statistical retrieval; they
  answer different questions.

## Open questions before installing

1. Index freshness: doc says index must be rebuilt on change; check whether
   `zg watch` exists and its CPU cost on idle.
2. Interaction with this 10k-file workspace (scan hit file limits during
   review) — will index build even complete, and how big is the index?
3. Whether the MCP server conflicts with the `db-first-search` skill's
   routing rules (two retrieval layers may fight for the same queries).

## Recommendation

Worth a sandbox trial (not a global install): index ONE project subtree
(e.g. `projects/ecogid` or `tools/graphify`), run 10 real questions we
actually asked this month, compare against rg + our current search flow.
Adopt only if the token/latency delta is visible. Revisit after Graphify's
local graph has had a week of real use — pick one retrieval winner.

Verification status: docs read 2026-09-06; NOT-INSTALLED, NOT-BENCHMARKED
locally.

**Update 2026-09-07:** installed (0.2.1), indexed (8,667 files / 847 MB /
~10 min), benchmarked against KB-RAG — see
`2026-09-07-zg-vs-kb-rag-bench.md`. Short version: near parity with KB-RAG
on markdown (KB slightly ahead, MRR 0.74 vs 0.66), zg unique on
code/skills/scripts ground. Recommendation changed: adopt zg as the
code-layer complement, exclude `share/**` from the index.
