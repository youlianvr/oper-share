# KB-RAG — Knowledge Base Retrieval-Augmented Generation Server

> **Local RAG MCP server with hybrid search.**
>
> Indexes the project's markdown files, builds a BM25 index and, when a local
> `sentence-transformers` is available, adds semantic search. Everything runs
> locally; if the optional backend fails, BM25 remains automatically.
>
> **Runtime evidence (2026-09-13, `status` probe): live.** 4962 files,
> 59 451 chunks, six indexed directories (including `projects/AGGG-3.0/Wiki`),
> `semantic_status: disabled` — the BM25 path only. An older probe (2026-08-14)
> had returned `Connection closed`.
> Configuration and tool surface still never prove live availability: re-probe
> before claiming health. Labels and fallback rules live in
> [`docs/Infrastructure.md`](Infrastructure.md).

---

## Architecture

```
User query → search_knowledge(method=hybrid|bm25|semantic)
                ↓
           _ensure_index()          [lazy init, once]
                ↓
           _build_index()
                ↓
   Tokenizer → BM25 ───────────────┐
   Local encoder → cosine ─────────┴→ normalized weighted ranking → JSON
```

### Components

| Component | File | Purpose |
|-----------|------|------------|
| **MCP Server** | `_scripts/kb-rag-server.py` | MCP server, runs over stdio transport |
| **MCP Config** | `~/.agents/mcp.json` | Server registration in the agent ecosystem |
| **Knowledge Base** | Code default: `knowledge/`, `docs/`, `_archive/projects/`, `_memory/`; the live config adds `_archive/experiments` and `projects/AGGG-3.0/Wiki` | Indexed directories |

### Principles

- **BM25 without dependencies** — Python stdlib + the `mcp` SDK are enough for
  the base mode.
- **Optional semantics** — `sentence-transformers` + `numpy` load lazily; a
  model failure does not break BM25.
- **Lazy init** — the server starts instantly, the index is built on first
  access to any tool.
- **BM25** — proven ranking algorithm for keyword search. k1=1.5, b=0.75
  (defaults).
- **Hybrid tokenizer** — ASCII + Cyrillic, Russian and English stop words.
- **Markdown-aware chunking** — split by headings and sentences with a 1200
  character limit; long units are cut at a word boundary.
- **Scope filtering** — results can be narrowed by path prefix (e.g.
  `knowledge/ssb2`).
- **Thread safety** — the index is replaced atomically on rebuild.

---

## Installation

### 1. Install the `mcp` SDK

```bash
pip install mcp
```

The MCP SDK is confirmed in the interpreter referenced by the active config
`~/.agents/mcp.json` (`_scripts/.venv-kb-rag/Scripts/python.exe`, verified
2026-08-14). Do not mix this venv with another `python` from `PATH`.

### 2. Check the MCP configuration

File: `~/.agents/mcp.json`

```json
{
  "mcpServers": {
    "knowledge-rag": {
      "command": "C:/Users/pc/.openclaw/workspace/_scripts/.venv-kb-rag/Scripts/python.exe",
      "args": [
        "C:/Users/pc/.openclaw/workspace/_scripts/kb-rag-server.py"
      ],
      "env": {
        "KB_DIRS": "knowledge,docs,_archive/projects,_memory,_archive/experiments"
      }
    }
  }
}
```

### 3. Restart Freebuff

Configured MCP servers are picked up at session start. After changing
`knowledge-rag` in `mcp.json`, restart Freebuff, then run a fresh relevant
probe; see [`docs/Infrastructure.md`](Infrastructure.md). A restart alone is not proof
that the server started successfully.

---

## MCP tools

Once the server is connected, the agent gets 5 tools:

### `search_knowledge(query, top_k, method, scope)`

The main search tool.

| Parameter | Type | Default | Description |
|----------|-----|--------|----------|
| `query` | `string` | — | Search query (keywords, natural language) |
| `top_k` | `int` | `10` | Number of results (1–50) |
| `method` | `string` | `hybrid` | `hybrid`, `bm25` or `semantic` |
| `scope` | `string` | `None` | Optional path prefix (e.g. `knowledge/ssb2`) |

Returns JSON with results, each containing:
- `score` — normalized BM25, semantic or hybrid score
- `path` — relative path to the file
- `title` — document title (from `# Title`)
- `chunk_index` — chunk number in the document
- `content` — first 1500 characters of the chunk
- `content_length` — full chunk length
- `search_method` — the actually used mode; `bm25` when the model is unavailable
- `semantic_status` — state of the local embedding backend

**Scope filter:** if `scope` is given, results are filtered by path prefix
after the search. For narrow scopes there may be fewer results than `top_k`.

### `list_indexed()`

Lists all indexed files with statistics.

Returns JSON. The shape below is the format; the totals are the 2026-09-13
probe (they move as the indexed directories change):
```json
{
  "total_files": 4962,
  "total_chunks": 59451,
  "files": [
    {"path": "knowledge/ssb2/01-overview.md", "title": "SSB2 Overview", "size": 1234, "chunks": 3}
  ]
}
```

### `reindex(method="full")`

Force-rebuilds the index. `full` builds BM25 and the semantic cache,
`bm25` skips the semantic backend. Useful after adding/changing files.

### `status()`

Index statistics:
- `files` — number of indexed files
- `chunks` — number of chunks
- `dirs` — indexed directories
- `unique_terms` — unique terms in the vocabulary
- `avg_chunk_tokens` — average chunk length in tokens
- `last_indexed` — timestamp of the last indexing
- `age_seconds` — how many seconds ago the index was built

### `get_document(path)`

Full document content by relative path.

| Parameter | Type | Description |
|----------|-----|----------|
| `path` | `string` | Relative path (e.g. `knowledge/ssb2/01-overview.md`) |

---

## Configuration

### Environment variables (env)

| Variable | Default | Description |
|------------|--------|----------|
| `KB_DIRS` | `knowledge,docs,_archive/projects,_memory` | Directories to index, comma-separated |
| `KB_TOP_K` | `10` | Default number of results |
| `KB_SEARCH_METHOD` | `hybrid` | Default mode: `hybrid`, `bm25`, `semantic` |
| `KB_HYBRID_WEIGHT` | `0.5` | Weight of the semantic score in hybrid mode |
| `KB_SEMANTIC` | `auto` | `auto` uses only a valid cache; stale/missing cache gives the BM25 fallback; `on` builds the model; `off` disables the backend |
| `KB_EMBEDDING_MODEL` | `all-MiniLM-L6-v2` | Local sentence-transformers model |
| `KB_MAX_CHUNK_CHARS` | `1200` | Max characters per chunk per measured optimum |
| `KB_INDEX_DIR` | `.freebuff/kb-index` | Ignored `.npy` cache + metadata |
| `KB_EMBEDDING_BATCH_SIZE` | `64` | Batch size for local encoding |
| `PROJECT_ROOT` | auto (parent directory of `_scripts/`) | Project root |

### What gets indexed

| Directory | Content | Size |
|------------|------------|--------|
| `knowledge/` | Findings, wiki, templates, ssb2, gig-network | ~250+ files |
| `docs/` | Constitution depth, ADRs, runbooks | 16 files |
| `_archive/projects/` | Completed projects, dossiers | ~500+ files |
| `_memory/` | Session memory, MemOS | ~100+ files |

### BM25 parameters

| Parameter | Value | Description |
|----------|----------|----------|
| `K1` | `1.5` | Term frequency saturation control |
| `B` | `0.75` | Document length control |
| `MAX_CHUNK_CHARS` | `1200` | Max chunk length (chars; sentence-based optimizer) |
| `MIN_CHUNK_CHARS` | `80` | Min chunk length (chars; shorter is merged into the previous) |

---

## Usage examples

### Basic search

```
search_knowledge: reverse engineering SSB2 bot
```

Finds all documents about SSB2 reverse engineering.

### Scope-limited search

```
search_knowledge: telegram bot architecture, scope: knowledge/tg-channels
```

Finds only within the Telegram channels directory.

### List indexed files

```
list_indexed:
```

### Index status

```
status:
```

### Reindex

```
reindex(method="full")
```

### Get a document

```
get_document: knowledge/ssb2/01-overview.md
```

---

## Performance and the documented snapshot

Current probe (2026-09-13): 4962 files, 59 451 chunks, 109 188 unique terms,
`semantic_status: disabled`. The live config indexes six directories:
`knowledge`, `docs`, `_archive/projects`, `_memory`, `_archive/experiments`
and `projects/AGGG-3.0/Wiki`.

The snapshot below is historical (2026-08-08, `KB_DIRS=knowledge,docs` only) —
an evidence record, not a claim about the current runtime.

| Metric | Value |
|---------|----------|
| Files in the index | 364 |
| Chunks | 12 764 |
| Vector cache | Old cache: 12 740 × 384, `all-MiniLM-L6-v2` |
| Cache state | `deferred: cache stale`; rebuild required after documentation updates |
| BM25 build | about 2.7–4 seconds |
| Server start | instant until first access (lazy init) |

`KB_DIRS` may include larger areas, so the historical numbers are not a
universal limit. Vectors live in `.freebuff/kb-index/`. With the semantic
backend disabled — `KB_SEMANTIC=off`, or a stale/missing cache under `auto` —
search runs the guaranteed BM25 path; set `KB_SEMANTIC=on` for an explicit
full build.

---

## Algorithms

The implementation is the authority: the tokenizer, BM25 (`k1=1.5`, `b=0.75`)
and the markdown-aware chunking (`MAX_CHUNK_CHARS=1200`, minimum 80) live in
`_scripts/kb-rag-server.py`. Everything an operator tunes is listed under
Configuration above.

---

## Debugging

### Logs

Example of historical server output (not a current health check):
```
[kb-rag] Starting knowledge-rag MCP server (lazy init)
[kb-rag] Root: C:\Users\pc\.openclaw\workspace
[kb-rag] Dirs: ['knowledge', 'docs', '_archive/projects', '_memory']
[kb-rag] Indexed 3927 files, 31337 chunks (84722 terms) in 82.3s
```

### Common problems

| Problem | Cause | Fix |
|----------|---------|---------|
| Server does not start | `mcp` SDK not installed | `pip install mcp` |
| Server crashes at start | Error in Python/mcp | Run manually: `python _scripts/kb-rag-server.py`, watch stderr |
| Empty index | Directories do not exist | Check `KB_DIRS`; paths must be relative to `PROJECT_ROOT` |
| No results | Query too specific | Try other keywords |
| `UnicodeEncodeError` in terminal | `cp1251` encoding | Not a server error — terminal output only. The MCP transport (`stdio`) works cleanly. |
| Slow first semantic indexing | Local CPU model encoding | Do not run monolithically without a dedicated budget; use a ready cache or incremental rebuild. |

---

## Comparison with alternatives

| Solution | Dependencies | Semantics | Persistence | Complexity |
|---------|-------------|-----------|-----------------|-----------|
| **`kb-rag-server`** (this one) | stdlib + mcp; semantic optional | BM25 + optional hybrid | BM25 in-memory; vectors in ignored `.npy` cache | Medium |
| `knowledge-rag` (PyPI) | numpy, ONNX, fastembed | Semantic + BM25 | none (in-memory) | Medium |
| `mcp-local-rag` (npm) | Node.js, ChromaDB | TF-IDF | yes (SQLite) | Medium |
| ChromaDB MCP | numpy, onnxruntime | Semantic | yes (SQLite) | High |

**Why optional:** BM25 must work even if the Python/model stack cannot load
`numpy` or `sentence-transformers`. The semantic mode is verified separately;
on a problem the server reports `semantic_status` and falls back to BM25.

---

## Related documents

- `_scripts/kb-rag-server.py` — server source code
- `~/.agents/mcp.json` — MCP configuration
- `docs/Infrastructure.md` — MCP registry (server inventory, labels, policy)
