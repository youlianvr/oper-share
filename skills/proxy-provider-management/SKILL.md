---
name: proxy-provider-management
description: "Manage providers for the local OpenAI-compatible proxy: add/edit providers, keep secrets in .env only, assign tiers/comments, recover from outages."
version: 1.0.0
---

# Proxy Provider Management

> Operational playbook for the local proxy in `_scripts/`.
> Goal: never store API keys in `providers.json`, always in `.env`.
> **Safety gate:** all writes to `.env`/`providers.json`, provider discovery, external
> health/chat requests, and proxy restart/kill actions require explicit user
> authorization. Without it, use read-only validation/help or an isolated fixture;
> never place a real key in a command line, JSON body, shell history, logs, or chat.

## 1. Files

| File | Purpose |
|------|---------|
| `_scripts/providers.json` | Provider groups + models. **No secrets.** |
| `_scripts/proxy_state.py` | State, persistence, env helpers. |
| `_scripts/proxy_ui.py` | Web UI + API routes. |
| `_scripts/proxy_router.py` | MODEL_MAP, health checks, dispatch. |
| `.env` (repo root) | API keys only. |

## 2. Secret rule: `.env` only, one key per provider

`providers.json` stores only the env var name in `api_key_env`. The actual key lives in `.env` and is shared by every model in that provider group:

```bash
API_HCNSEC_CN_KEY=sk-...
APIHUB_AGNES_AI_COM_KEY=sk-...
FREEINFERENCE_ORG_KEY=sk-...
```

- One provider group = one `api_base` + one `api_key_env`.
- All models inside the group use the same key.
- Never store a literal `api_key` inside `providers.json`.
- Never commit `.env`.

## 3. Tier convention

| Tier | Meaning | When to use |
|------|---------|-------------|
| S | Primary workhorse | Reliable, credits available, low error rate |
| A | Strong secondary | Reliable but limited credits or newer/untested |
| B | Fallback | Quota-heavy, occasional errors, or moderate reliability |
| C | Testing / last resort | Local mocks, unstable, or embedding-only |
| D | Disabled / broken | Keep off; explicit user disable |

## 4. Provider form flow

When adding a provider through the UI (`/ui/providers/add`) or editing one:

1. **API Base URL** — OpenAI-compatible endpoint, usually ends in `/v1`.
2. **API Key** — pasted once; proxy writes it to `.env` under `api_key_env`.
3. **Model** — either type manually or use **Discover** to fetch `/v1/models`.
4. **Tier** — set using the convention above.
5. **Comment** — one-line note about reliability/credits/quirks.
6. **Advanced** — priority, timeout, aliases, switches.

The server auto-generates `api_key_env` as `{PROVIDER_ID_UPPER}_KEY` if left blank.

## 5. Emergency recovery checklist

Proxy misbehaving or all models failing:

1. Open dashboard: `http://127.0.0.1:4000/ui/dashboard`
2. Check health status per provider (alive/degraded/dead/unknown).
3. Check env keys: `curl http://127.0.0.1:4000/api/providers/env-check`
4. If a key is missing:
   - Edit provider → paste key → Save (writes to `.env` automatically).
   - Or manually edit `.env` and restart proxy.
5. If a provider is flaky:
   - Lower its tier to `B`/`C`.
   - Disable `in_chain` to keep direct alias but remove from fallback.
   - Enable `no_degrade` only if you want it always tried.
6. If a provider is dead:
   - Disable it or set tier `D`.
   - Move a reliable provider to tier `S`/`A`.
7. Restart proxy if needed:
   ```bash
   cd _scripts && python restart_proxy_clean.py
   ```
8. Test:
   ```bash
   curl -X POST http://127.0.0.1:4000/v1/chat/completions \
     -H "Content-Type: application/json" \
     -d '{"model":"<alias>","messages":[{"role":"user","content":"hi"}],"max_tokens":10}'
   ```

## 6. Adding a new provider (agent workflow)

1. Get `api_base` and `api_key` from user.
2. Choose a short `id` (slug, lowercase, hyphens).
3. Decide on `api_key_env` name: `{ID_UPPER}_KEY`.
4. Append to `.env`:
   ```bash
   echo "MY_PROVIDER_KEY=sk-..." >> .env
   ```
5. Add group to `_scripts/providers.json` (or use UI `/ui/providers/add`).
6. Set `tier` and `comment`.
7. Save/validate JSON.
8. Restart proxy.
9. Test with `curl`.

## 7. Discovery from an OpenAI endpoint

Use the dashboard **Auto-Discover** card or:

```bash
curl -X POST http://127.0.0.1:4000/api/proxy/discover \
  -H "Content-Type: application/json" \
  -d '{"api_base":"https://api.example.com/v1","api_key":"sk-...","prefix":"EXAMPLE"}'
```

The proxy writes `EXAMPLE_KEY=sk-...` to `.env` and adds a provider group.

## 8. Validation commands

```bash
cd _scripts
python -m py_compile proxy_state.py proxy_ui.py proxy_router.py
python -c "import json; json.load(open('providers.json'))"
python check_provider_env.py  # verify no literal keys in providers.json + env present
```

## 9. Common mistakes

- **Putting `api_key` inside `providers.json`.** Fix: remove the literal key, write it to `.env`, keep only `api_key_env`.
- **Duplicate `api_key_env`.** UI rejects this; check manually if editing JSON.
- **Wrong `api_base`.** Must be OpenAI-compatible and include `/v1`.
- **Forgetting to restart proxy** after `.env` changes.
- **Setting every provider to tier S.** Tier S is only for primary, reliable providers.

## 10. Current provider tiers (snapshot 2026-07-31)

> Treat this table as a snapshot. Live status is in the dashboard or via `curl http://127.0.0.1:4000/api/providers/env-check`.

| Provider | Tier | in_chain | Comment |
|----------|------|----------|---------|
| api-hcnsec-cn | S | yes | Frontier reasoning model. **05.08: REGRESSION — degraded again ×3** (was RECOVERED 02.08: alive 25 in a row; 500 in live run 03:05; timeout in A2 run 03:31). Candidate for tier B. |
| api-boltch-cloud | S | yes | Free aggregator. **05.08: 2 models, both degraded ×3** (glm-5-2, qwen-3-8-max; 429 rate-limit in live run 03:05; «circuit open» in A2 run 03:31). Not a «zombie with 0 models» — models exist, all sick. Candidate for tier B. |
| freeinference-org | S | yes | Cheap and fast; reasoning quality may vary by endpoint. **05.08: alive** (deepseek-v4-flash, glm-5-1, bge-m3, minimax-m3). A2 run 03:31: deepseek-v4-flash 200 OK. |
| apihub-agnes-ai-com | A | yes | **05.08: DEAD ×3** (403 in live run 03:05, 20/20 dead in trend). Candidate for tier D / disable in_chain. |
| inference-api-nousresearch-com | A | yes | Free Nous Research endpoint. **05.08: alive ×3 both models** (laguna 1908ms, step-3.7-flash 2899ms) — 20/20 in trend. **A2 run 03:31: `stepfun/step-3.7-flash:free-inference-api-nousresearch-com` = 200 OK (provider StepFun)** — this is the current analog of the daily-newspaper model (see ERROR_LOG:992). |
| inference-dahl-global | A | **no** | Solid multimodal option. dahl-kimi not checked (in_chain off — expected). |
| baaaai-com | B | yes | General-purpose provider. **05.08: still degraded** (gpt-5-6-terra/sol degraded ×3, gpt-image-2 dead; 503 in live run) — NOT dead, do not remove. |
| token-sensenova-ai | C | **no** | Disabled by user — unreliable. Keep off (tier C + in_chain off). **05.08: model sensenova-6-7-flash-lite alive ×2** — alive, but switched off by owner's decision. |

> 📌 Health status 2026-08-05 03:10 (health_history.json, last 3 checks per model): alive — nousresearch ×2, freeinference ×4 (incl. minimax-m3), sensenova ×1; degraded — hcnsec ×1, boltch ×2, baaaai ×2; dead — agnes ×1, baaaai gpt-image-2, boltch/minimax legacy keys; dahl-kimi not checked (in_chain off). Live run 03:05 (13 models, max_tokens=5): 5/13 OK. 8 providers total.

Update this table whenever provider status changes.
