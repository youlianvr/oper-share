# Bench: zvec-grep (zg) vs KB-RAG on this workspace (2026-09-07)

Owner request: "index the workspace with zvec-grep and measure real search
quality against the current KB-RAG". This is the follow-up to
`2026-09-06-zvec-grep-research.md` (was NOT-INSTALLED, NOT-BENCHMARKED).

## Setup

- **zg**: `@zvec/zvec-grep` 0.2.1, local embeddings
  `local/potion-code-16m-v2`. Indexed the workspace root: **8,667 files,
  847 MB index, ~10 min build** (02:32→02:42), respecting .gitignore
  (node_modules excluded). Query mode: default positional = hybrid
  FTS+vector, `--limit 5`. Vector layer was LIVE (`matchedBy=fts+vector`).
- **KB-RAG**: workspace MCP server (`_scripts/kb-rag-server.py`), corpus
  `knowledge, docs, _archive/projects, _memory, _archive/experiments`
  (per `docs/KB-RAG.md` + live config). **Semantic layer was DISABLED**
  (`semantic_status: disabled` → hybrid degraded to pure BM25) — stale
  vector cache, exactly the documented failure mode.
- 12 queries with hand-verified ground-truth files; scoring = hit@1/3/5 +
  MRR on file path. Raw data: `experiments/zvec-bench/` (queries.json,
  zg-results.json, answers/*.txt; gitignored by convention).

## Head-to-head on the 9 queries where both corpora contain the GT

| Q | Query | GT | zg rank | KB rank |
|---|-------|----|---------|---------|
| Q1 | MCP client registration AGENTS | docs/MCPRegistry.md | miss (0/5) | 3 |
| Q2 | godogen windows feasibility babylon | findings/…godogen-windows-audit.md | 1 | 1 |
| Q3 | hyperframes check lint render demo | findings/…tg-favorites-execution.md | 2 | 3 |
| Q4 | OpenBiliClaw install.sh audit verdict | findings/…tg-favorites-execution.md | 5 | miss |
| Q5 | zvec-grep open questions index freshness | findings/…zvec-grep-research.md | 1 | 1 |
| Q6 | agent learning model harness context | findings/…agent-learning-audit.md | 1 | 1 |
| Q7 | trash only rule never destroy data | docs/Data-Safety.md | 4 | 1 |
| Q11 | vision pro avatar chatgpt virtual colleague | findings/…virtual-colleague-mechanics.md | 1 | 1 |
| Q12 | mfg unlock rtx 40 dlss risks | findings/…tg-favorites-execution.md | 1 | 1 |

- **zg**: hit@1 5/9, hit@3 6/9, hit@5 8/9, **MRR 0.66**
- **KB-RAG (BM25)**: hit@1 6/9, hit@3 8/9, hit@5 8/9, **MRR 0.74**

Verdict on markdown Q&A: **near parity, KB slightly ahead** — despite KB
running WITHOUT semantics while zg ran full hybrid. Well-titled,
well-structured markdown is BM25's home turf; KB's heading-chunking wins.

## zg-only ground (GT outside KB corpus: code, skills, scripts)

| Q | Query | GT | zg result | KB |
|---|-------|----|-----------|-----|
| Q8 | telegram watcher telethon script | _scripts/telegram_watcher.py | pointer #3 (wiki) + #5 (findings) | pointer #3 (wiki) |
| Q9 | dashi ppt goal validator pptx export | .agents/skills/dashi-ppt/ | pointer #5 (share/skills/pptx) | miss |
| Q10 | dot cascade ranked comparison template | .agents/skills/lieflat-charts/templates/lupi-gallery.html | pointer #4 (execution report) | miss |

zg never surfaced the actual code files in top-5 (semantic code embeddings
of potion-16m are small-model quality), but it was the only engine that
could even see `.agents/`, `_scripts/`, `tools/`, `mcp_hub/` — KB is
structurally blind there (not a quality failure, a scope boundary).

## Operational costs observed

- zg: 847 MB persistent index, ~10 min full build, first query after boot
  pays ~30 s model load, subsequent queries fast. Index has a refresh
  policy (`--refresh background|wait|off`; background default in server
  mode) — answers the brief's open question about freshness.
- KB-RAG: no persistent index (in-memory BM25, ~80 s rebuild per docs),
  warm answers fast; observed 2 MCP timeouts this session (cold start).
- zg ranking pollution: `share/` mirror duplicates outrank originals
  (Q7: share/AGENTS.md + share/docs/* above docs/*) — fixable with
  `-g '!share/**'` excludes at index time.

## Verdict

1. **Keep KB-RAG as the knowledge/Q&A router** — it matches or beats zg on
   markdown ground, costs nothing to maintain, no 847 MB index.
2. **Adopt zg as the workspace-wide/code layer**, not a replacement: only
   player with access to code/skills/scripts; hybrid FTS+vector works;
   memory + onboarding cost is real but one-time. Wire via MCP
   (`zg install --target …`) so mcp-first routing can pick it for
   code questions.
3. If adopted: exclude `share/**` (and consider `mcp_hub/catalogs/**`)
   from the index to stop mirror-catalog noise.

## Caveats

- N=12, hand-picked GT, single run — directional, not statistical.
- KB was BM25-only this session; with a healthy semantic cache its hybrid
  could score higher (or not — untested).
- Both engines were never given file-type hints or scope filters; real
  agent usage can steer both much better.
- zg numeric MRR counts strict file-path hits; "pointer" hits (wiki/docs
  mentioning the path) scored 0.5 credit in Q8 only if listed as rank —
  they were scored as misses in the headline numbers, pointers reported
  separately.

Verification status: benchmark run locally 2026-09-07 02:30–02:55;
raw outputs preserved in `experiments/zvec-bench/`.

## Status update (2026-09-07, later the same day)

zg is now **registered as an MCP launcher** (`zvec-grep` in `~/.agents/mcp.json`,
stdio transport via `zg server --stdio --mcp-toolset agent`; registry role
Workspace Retrieval in `docs/MCPRegistry.md`; evidence in `docs/MCPRuntime.md`).
Index was rebuilt with `-g '!share/**'` — the mirror-pollution finding above is
fixed and verified live over the MCP transport: query Q7 now returns the
AGENTS.md Trash-Only pointer at #1 and the real `docs/Data-Safety.md` at #2/#3,
with no `share/` copies in the top-5. Single exposed tool:
`zvec_grep_search(root, query, limit)` (requires explicit `root`).
