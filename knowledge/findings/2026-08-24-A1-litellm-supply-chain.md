# LiteLLM supply-chain attack — validates our removal (2026-08-24, A1)

> Source: RECON (queue step 6), web search 2026-08-24.
> Canon for this fact; GRAVEYARD litellm section updated to link here.

## What happened (facts)

- March 24/27, 2026: threat actor **TeamPCP** published backdoored `litellm`
  PyPI releases **1.82.7 and 1.82.8** (three-stage backdoor, installed via
  `.pth` files, exfiltrated env/credentials; C2 via blockchain DNS).
  PyPI credentials stolen; same campaign hit `telnyx`. (Sources: PyPI
  incident report 2026-04-02, Datadog Security Labs, Cycode, Snyk, Trend Micro.)
- Later releases and the official Docker image were cleared, but the event
  fractured trust in the package ecosystem (many 2026 articles evaluate
  alternatives — Inworld Router, Portkey, OpenRouter, Kong AI Gateway,
  Bifrost, Helicone, TrueFoundry).

## Our status (verified by running, 2026-08-24)

- `litellm` / `litellm_enterprise` / `litellm_proxy_extras` removed from
  user site-packages on 2026-08-24 (GRAVEYARD section) — before this recon.
- Verified clean NOW: `pip show litellm` → absent; `import litellm` → fails;
  `pip list | grep litellm` → empty; no `*.pth` mentioning litellm.
- HiveProxy (`_scripts/proxy.py` + `proxy_router.py`) never imported litellm —
  it is a pure FastAPI/httpx implementation with its own routing, health
  checks, rate limiting, circuit breakers (1100+ tests).
- All `.pth` files in Python314 site-packages audited — only legitimate:
  editable installs (canaryarchiver, freelance_claw, ssb2 worktree),
  `future_annotations`, `pywin32`.

## Decision-relevant takeaway

- Our removal was already right (dead weight + broken half-install); the
  supply-chain event adds **security** justification post-hoc: the exact
  package we dropped is the one that was weaponised. Do NOT re-add litellm;
  if a gateway gap ever appears, evaluate the alternative ecosystem, and pin
  with hash verification whatever is chosen.
- General rule reinforced: unused packages in site-packages are a supply-chain
  liability, not just disk waste — periodic `pip list` hygiene is cheap
  insurance.
