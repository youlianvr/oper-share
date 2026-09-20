ADR-0001: Optional zvec ANN backend for knowledge-base semantic search

Status: Accepted
Date: 2026-07-06

## Context
knowledge-base semantic search uses brute-force cosine — it loads all
vectors from SQLite into memory, dot-product over each, sort. O(N×D) per
query. At 7945 vectors — 14ms. At 50K+ — this becomes the bottleneck.

zvec (Alibaba, Apache 2.0) is an in-process vector DB with an HNSW ANN
index. pip install, not a server. Sub-millisecond queries regardless of
collection size.

## Decision
Add an optional zvec HNSW ANN backend behind the
`KB_VECTOR_BACKEND=zvec` flag. Fallback to brute-force is automatic.
zvec-eval MCP for benchmarks before enabling.

Three knowledge-base modes:
1. FTS5 (always, no embeddings)
2. Semantic brute-force (Mistral, no zvec)
3. Semantic zvec ANN (KB_VECTOR_BACKEND=zvec)

Each layer is optional. Nothing breaks without zvec.

## Alternatives
Alternative A: Milvus
  Description: External vector DB server
  Pros: Production-grade, distributed
  Cons: Server, Docker, infrastructure overhead
  Rejected: in-process required, zero infra

Alternative B: FAISS
  Description: Facebook's vector similarity search library
  Pros: C++ optimization, widely used
  Cons: C++ dependency, harder install, no WAL/persistence
  Rejected: zvec pip install is simpler, has persistence

Alternative C: Keep brute-force
  Description: Change nothing
  Pros: Zero changes, zero dependencies
  Cons: 14ms at 8K, will be 100ms+ at 50K
  Accepted as: fallback (zvec is opt-in, not a replacement)

## Rationale
zvec is in-process (like SQLite), pip install, HNSW ANN, WAL persistence,
Apache 2.0. 4x faster at 10K+ vectors. Automatic fallback — if zvec is not
installed or the flag is unset, brute-force works as before. zvec-eval MCP
allows benchmarking before enabling.

## Trade-offs
+ 4x faster at 10K+ vectors (3.6ms vs 14ms)
+ In-process, no server
+ Automatic fallback
+ zvec-eval for benchmarks
- 37 MB disk at 8K vectors (zvec store)
- sync time ~2 sec on resync
- zvec ANN overhead below 5K vectors (brute-force is faster on small sets)
- New dependency (zvec pip package)

## Consequences
- knowledge-base.py conditional import zvec_backend
- zvec_store/ directory next to knowledge.db
- KB_VECTOR_BACKEND env var — opt-in flag
- KB_ZVEC_RESYNC env var — force resync
- zvec-eval MCP — separate sandbox (not production)

## Rollback
unset KB_VECTOR_BACKEND → automatic fallback to brute-force.
rm -rf zvec_store/ → clean zvec data.
pip uninstall zvec → knowledge-base works without zvec.

## Review Date
N/A — the decision stays valid while zvec is maintained and brute-force
remains the fallback. Revisit if: zvec is deprecated, or embeddings > 100K
where DiskANN is needed.
