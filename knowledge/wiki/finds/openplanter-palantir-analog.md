# OpenPlanter — Historical Note and Extracted OSINT-Fetchers

**Date:** 2026-07-25; status revised 2026-08-06
**Context:** Found by homie (Niko's Collection / Nightly-Useful)
**Source:** https://github.com/ShinMegamiBoson/OpenPlanter

---

## Essence

OpenPlanter was an open-source AI agent for investigations. Per local audit it was a useful but immature experimental project, not a full Palantir replacement. Standalone public registry loaders were saved to `_scripts/osint/fetchers/`; the project itself was removed from the working tree reversibly via the Recycle Bin.

The saved fetchers require separate verification of sources, keys, limits, and usage rights. They don't build graphs or prove connections on their own.

## How It Works

1. **Recursive Analysis** — agent breaks investigation into subtasks, spawns sub-agents
2. **Knowledge Graph** — automatically builds ontology from data (company registries, finance, real estate, PDF, email, WhatsApp)
3. **Continuous Monitoring** — monitors incoming data, alerts on patterns
4. **Operational Actions** — auto-fill SARs (Suspicious Activity Reports), notifications
5. **19 domain-specific tools** — shell, web search (Exa), file system, data transformation

## Model Support

OpenAI, Anthropic, OpenRouter, Cerebras, **local models via Ollama**

## GUI

Tauri 2 desktop — three panels: session management, chat, graph visualization (Cytoscape.js)

## What Was Saved

- 12 stdlib-only fetchers in `_scripts/osint/fetchers/`.
- Offline smoke tests in `_scripts/osint/tests/test_fetchers_smoke.py`.
- License and provenance in `_scripts/osint/LICENSE` and `_scripts/osint/README.md`.

Original upstream commit: `81d75620ff50a69f576bc19a8bb17738e952387a`.

## How to Use the Saved Set

```bash
python _scripts/osint/fetchers/fetch_sec_edgar.py --help
python -m pytest _scripts/osint/tests -q
```

## Summary

OpenPlanter as a standalone project is no longer part of the working stack. Needed parts were saved separately; the source was sent to the Recycle Bin, without irreversible deletion.
