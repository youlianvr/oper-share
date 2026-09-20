ADR-0002: Parallel Mistral API key pool for embedding generation

Status: Accepted
Date: 2026-07-06

## Context
knowledge-base embed generates Mistral 1024-dim embeddings for all
chunks. Mistral free tier: 1 request/sec per API key. 7945 chunks /
32 per batch = 248 batches × 1.1s = 4.5 minutes. This is a one-time
operation, but slow.

The Mistral limit is per-key (per account), not per-IP. N keys = N
independent 1 req/sec limits = N parallel streams.

## Decision
Multi-key parallel embedding: N Mistral API keys → ThreadPoolExecutor,
round-robin across workers. Each worker holds the per-key 1 req/sec.
Nx faster (7 keys = 7x = 39 sec instead of 4.5 min).

Keys:
- `~/.mistral_keys.txt` (one per line)
- `MISTRAL_API_KEYS=key1:key2:...` env var
- Single key backward compat: `MISTRAL_API_KEY` env / `~/.mistral_key.txt`

## Alternatives
Alternative A: Single key, sequential
  Description: Current approach, 4.5 min
  Pros: Zero changes
  Cons: Slow, 4.5 min at 8K chunks
  Rejected: too slow for iterative development

Alternative B: Mistral paid tier (higher rate limit)
  Description: Buy a paid plan for >1 req/sec
  Pros: One key, simpler
  Cons: Money, dependence on a single account
  Rejected: free tier + multi-key = free + faster

Alternative C: Async/asyncio instead of ThreadPoolExecutor
  Description: asyncio event loop instead of threads
  Pros: More efficient for I/O-bound
  Cons: More complex, urllib sync API, needs aiohttp
  Rejected: ThreadPoolExecutor is simpler, I/O-bound works anyway

## Rationale
Mistral free tier = 1B tokens/month, 1 req/sec per key. 7 keys = 7
req/sec parallel, free. Not abuse — each key stays within the free tier.
ThreadPoolExecutor + round-robin is a simple, proven scheme.
Backward compatible — 1 key works as before.

## Trade-offs
+ 7x faster (39 sec instead of 4.5 min at 8K chunks)
+ Free (free tier keys)
+ Backward compatible (1 key = sequential)
+ Not abuse (per-key rate limit respected)
- Needs N Mistral accounts (free)
- ThreadPoolExecutor: N threads, slightly more RAM
- Result order may differ (merge in batch order)

## Consequences
- `~/.mistral_keys.txt` — multi-key file
- `MISTRAL_API_KEYS` env var — alternative
- `_embed_all_keys()` — detection function
- `_embed_batch_parallel()` — parallel implementation
- `embed_code_db()` / `embed_db()` — use parallel if >1 key

## Rollback
Delete `~/.mistral_keys.txt` → fall back to `MISTRAL_API_KEY` /
`~/.mistral_key.txt` → single key sequential mode. Zero data changes.

## Review Date
N/A — the decision stays valid while the Mistral free tier exists.
Revisit if: Mistral removes the free tier, or changes rate limit policy.
