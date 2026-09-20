---
name: ru-tts-fallback
description: >-
  Reliable Russian text-to-speech with voice. edge-tts (Microsoft, free Russian neural voice) flaps — returns empty stream or NoAudioReceived, ~1 in 3 requests fail with 30s+ pause; fallback gTTS (Google) often unavailable or rate-limited (429). Retry with timeout, empty answer = failure, synchronous call timeout via Thread(daemon)+join (NOT asyncio.to_thread — infinite hang), sha1 cache, clean error with cause. Triggers: "tts", "listen", "text-to-speech", "edge-tts", "gTTS", "No audio was received", "speech synthesis".
invocation: model+user
---
# RU TTS Fallback — reliable Russian text-to-speech with voice

Self-reflection of real behavior (2026-08): the "Listen" feature was designed
(retry + fallback + cache + toggle of intent), but dead in practice — dozens of
`tts | No audio was received` + `tts_fallback | google busy` in logs per day.
User waited 30s+ for "services busy" errors.

## When to use

- Need TTS of a result with a Russian voice; paid Russian voice APIs unavailable or costly
- Logs full of "No audio was received" / "google busy" — TTS is periodically dead
- "Listen"/"Synthesize" button hangs or fails with unclear error

## Core idea

Three reliability levels: **edge-tts (main) → gTTS (fallback) → clean error with cause**.
edge-tts gives Russian neural voice (male/female) free, but Microsoft throttles by IP:
~1 in 3 requests fail — either raising `NoAudioReceived`, or **silently with empty stream**,
translation pause 30s+. gTTS (Google) from this tier is often unavailable (SSL EOF) or busy (429),
but sometimes is the only live option — hence the fallback.

## Steps (verified, with observable check)

### 1. Diagnosis — live run, not mock

Mocks do not catch real flags (tests were green, production failed). A series of 3 runs
in a row with timing determines the taxonomy:

```python
async for c in edge_tts.Communicate('Test.', 'ru-RU-DmitryNeural').stream():
    if c['type'] == 'audio': chunks.append(c['data'])
```

- Failure after 30-40s = translation → timeout attempt 12s (do not wait 30s+ pause — retry is faster)
- Fast failures → retry with 1.5s pause

### 2. Retry edge-tts: empty answer = failure

Translation returns empty stream **WITHOUT exception**. `if not chunks: raise` — INSIDE the retry loop:
otherwise silent empty answer immediately returns error and does not reach fallback.
3 attempts × 12s, pause 1.5s. For async timeout `asyncio.wait_for` is safe.

### 3. Synchronous call timeout — Thread(daemon=True) + join(timeout)

**NOT `asyncio.to_thread`**: `asyncio.run()` at the end waits for `shutdown_default_executor` —
if to_thread-flow hangs (network without timeout), TimeoutError from wait_for arrives,
but `asyncio.run` DOES NOT return — request hangs forever, access-log is silent
(paradox: TimeoutError at 5s, process hangs and kills by timeout).

```python
t = threading.Thread(target=gTTS(text, lang='ru').write_to_fp, args=(buf,), daemon=True)
t.start(); t.join(timeout=8)
if t.is_alive():
    raise TimeoutError('gTTS silent — connection to Google does not respond')
```

The thread-runner dies in the background (daemon) and dies on its own — request completes.

### 4. gTTS fallback — 2 attempts with pause

"google busy" (429) — rate limit, often passes in 1.5-2s. One attempt = guaranteed fail.

### 5. Cache and clean error

- Key `sha1(text)`, LRU ~8 entries — repeat TTS is instant (0.000s)
- Both failed → "Synthesis services busy (Edge and Google) — check internet or VPN" — cause, not "try again"
- Packages not installed → "run: pip install edge-tts gtts" — action, not vague
- Button gives immediate feedback: "…" + disabled on hover, status "Synthesizing…" during synthesis

## What NOT to do

- Do not use `asyncio.to_thread` for synchronous call timeout — infinite hang (Step 3)
- Do not trust green tests with mocks — a live run is mandatory (Step 1)
- Do not wait for the translation pause inside one attempt — retry with timeout is faster
- Do not return "try again" without a cause — the user must know what to fix
- Do not leave the button without feedback: the user decides "wait or it works" based on feedback

## Success check

- [ ] Live run: usually OK in 3-7s, flags absorbed by retries, all requests complete
- [ ] Unit tests repeat: empty stream → retry; 429 → retry gTTS; hanging gTTS → error in ~20s (not infinite); edge unresponsive → TTS via gTTS
- [ ] Access-log of server is written after response — unresponsive stream = request hangs (hang diagnosis)
- [ ] No personal data, keys, IP addresses, absolute paths in the skill
