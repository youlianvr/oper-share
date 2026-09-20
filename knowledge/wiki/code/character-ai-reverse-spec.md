# character-ai-reverse-spec.md

> Reverse engineering character.ai — bypassing limits, ads, model access.
> Community tool. GroveMind Edition.

**Date:** 2026-06-30
**Status:** Phase 0 (Reconnaissance pending), Phase 1 implemented (Chrome extension + Tampermonkey userscript)
**Author:** CJ for Niko

---

## 1. Context and Motivation

character.ai imposes strict limits on free users: daily message limit, ads in the interface, downgraded model. Users have no leverage — feedback is ignored. The project's goal: return control to users through technical means.

**Position:** Not vandalism. Not DDoS. Not data theft. Purely restoring access to what the platform took from its own users.

---

## 2. Goals (What We Must Get)

| # | Goal | Priority | Success |
|---|------|----------|---------|
| G1 | Bypass daily message limit | 🔴 P0 | Send >N messages per day without blocking |
| G2 | Remove ads from interface | 🟡 P1 | Clean UI without banners and inserts |
| G3 | Access to premium model (c.ai+) | 🟡 P1 | Answer quality = c.ai+ on a free account |
| G4 | Easy to use for non-tech users | 🟡 P1 | Install in 2 clicks, works out of the box |
| G5 | Minimal ban risk | 🟢 P2 | Methods don't trigger automatic detection systems |

---

## 3. Target Audience

- **Who:** character.ai users frustrated with limits
- **Technical level:** Low. "Phone users, know nothing about development"
- **Platform:** Desktop (Chrome/Firefox extension) + Mobile (Firefox Android + Violentmonkey userscript)
- **Account:** Free (free tier)

### Mobile Strategy

**Problem:** Chrome for Android doesn't support extensions. iOS is a closed ecosystem (Safari doesn't allow extensions with custom JS).

**Solution:** Three paths for mobile users:

| Path | Platform | Difficulty | What You Get |
|------|----------|-----------|-------------|
| **Firefox Android + Violentmonkey + Userscript** | Android | Medium (3 steps) | Full functionality: ads + limits + model |
| **Orion Browser (iOS) + extension** | iOS | Medium | Full functionality (Chrome/Firefox extensions on iOS) |
| **Safari iOS + Userscripts App** | iOS | Medium | Userscript via "Userscripts" app (App Store) |
| **Private DNS (AdGuard/NextDNS)** | Android + iOS | Minimal (3 taps / config profile) | Ad blocking only at DNS level |

**Recommendation:** Everyone gets Private DNS for ads. Those who want limit bypass:
- Android → Firefox + Violentmonkey
- iOS → Orion Browser (load extension) or Safari + Userscripts App

**iOS Instructions (Orion Browser):**
1. Install Orion Browser from App Store
2. Settings → Extensions → enable Chrome/Firefox extension support
3. Load the `dist/` folder as unpacked extension
4. Done

**iOS Instructions (Safari + Userscripts App):**
1. Install "Userscripts" from App Store (free, open-source)
2. In Safari → Share → Userscripts → enable
3. Copy the contents of `cai-unlock.user.js` into the app
4. Done

**iOS Instructions (Private DNS):**
1. Download config profile from https://adguard-dns.io/en/public-dns.html
2. Settings → General → VPN & Device Management → install profile
3. Done — ads blocked system-wide

---

## 4. Architecture — Browser Extension (Manifest V3)

### 4.1 Why Extension, Not Proxy/Client/Script

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| Browser Extension (MV3) | Zero Cloudflare bypass needed, auto token extraction, easy install, Firefox extensions work on Android | Manifest V3 limits webRequest | ✅ Chosen |
| Proxy Server | Full traffic control | Hard for non-tech users, TLS issues | ❌ |
| Standalone CLI | Full control | Non-tech users won't install, needs Python/Node.js | ❌ |
| UserScript (Tampermonkey) | Simpler than extension | No Service Worker access, weaker interception | ⬜ Fallback |

### 4.2 Tech Stack

```
Language:    TypeScript → compiled to JS
Runtime:     Browser Extension API (Manifest V3)
Build:       esbuild (fast, minimal config)
Dependencies: Zero external libraries. Only browser APIs.
Tests:       Jest + chrome-mock (Chrome API emulation)
```

### 4.3 Extension Structure

```
cai-unlock/
├── manifest.json              # MV3 manifest
├── src/
│   ├── background/
│   │   └── service-worker.ts  # Service Worker (background)
│   ├── content/
│   │   ├── injector.ts        # document_start — patches fetch/XHR
│   │   ├── ad-remover.ts      # DOM observer — removes ads
│   │   └── ui-overlay.ts      # Status indicator in corner
│   ├── interceptors/
│   │   ├── rate-limit.ts      # Message limit bypass
│   │   ├── model-switch.ts    # Model substitution (override_* fields)
│   │   └── ad-block.ts        # Ad request blocking
│   ├── lib/
│   │   ├── api-payloads.ts    # Known payloads and fields
│   │   ├── token-extractor.ts # Auto-extract char_token
│   │   └── logger.ts          # Logging (local only)
│   ├── popup/
│   │   ├── popup.html         # Extension popup window
│   │   ├── popup.ts           # Popup logic
│   │   └── popup.css          # Styles
│   └── shared/
│       ├── types.ts           # Shared types
│       └── constants.ts       # URLs, selectors, constants
├── icons/                     # Extension icons
├── tests/
│   ├── unit/
│   │   ├── api-payloads.test.ts
│   │   ├── model-switch.test.ts
│   │   └── ad-remover.test.ts
│   └── integration/
│       └── extension.test.ts
├── docs/
│   ├── INSTALL.md             # Step-by-step guide with screenshots
│   ├── FAQ.md                 # Frequently asked questions
│   └── DEV.md                 # For developers
├── DECISIONS.md
├── TODO.md
├── ARCH.md
├── CHANGELOG.md
└── README.md
```

### 4.4 Data Flow

```
character.ai server
       ↕ HTTPS (native browser TLS — Cloudflare is not a problem)
Browser (fetch / XHR on c.ai page)
       ↕ [content/src/injector.ts intercepts]
Interceptors:
  - model-switch.ts: modifies payload → override_prefix, override_rank
  - rate-limit.ts: modifies requests/responses to bypass limit
  - ad-block.ts: blocks ad requests
       ↕
Original character.ai code (unchanged)
       ↕
DOM (page)
       ↕ [content/src/ad-remover.ts: MutationObserver]
Clean UI without ads
```

---

## 5. Attack Vectors — Detailed Breakdown

### 5.1 Ads (P1 — Quick Win)

**How it works:** character.ai inserts ad blocks into DOM and makes ad requests to third-party servers.

**Method:**
1. Content script (`ad-remover.ts`) starts MutationObserver on document.body
2. When ad elements appear (known CSS selectors) — removes them
3. `ad-block.ts` intercepts fetch/XHR to known ad hosts — blocks them

**Risks:** Minimal. DOM modification is not detected by the server.
**Bypass:** If c.ai starts checking for ad elements via JS — use CSS-only hiding instead of removal (`display: none !important`).

### 5.2 Limits (P0 — Main Goal)

**How it works (known from user):** Two types of limits:
1. **Swipe limit** — model response regeneration. ~100 swipes, then stop.
2. **Go-on limit** — continue model response without new input. ~400 go-on, then stop.

**Hypothesis about mechanism:** Counter on server, tied to session/token/chat. Possibly client-side UI block when limit reached, but main counters are server-side.

**Methods (by escalation level):**

| # | Method | What We Do | Ban Risk |
|---|--------|-----------|----------|
| A | Client-side bypass | If counter is in localStorage/variable — reset. If UI block — remove. | Low |
| B | Session reset | If counter tied to session — new guest session = new 100/400 | Medium |
| C | Intercept and substitute counter in response | If server returns remaining swipes in API response — substitute "infinite" | Medium |
| D | Multi-token / account rotation | Token pool — exhausted limit → switched | High |
| E | Request modification | Fields `staging: true`, `mock_response: true` may not be counted | Low |

**Testing plan:**
1. Send messages until hitting the limit — record server response
2. Compare payload of successful vs rejected request
3. Test hypotheses A→E in ascending risk order
4. Document the exact limit mechanism

### 5.3 Model (P1 — Maximum Profit)

**Status:** No c.ai+ account — direct A/B comparison unavailable.

**What's known:**
- node_characterai has `.usePlus` property — switches c.ai+ mode
- API payload contains fields: `override_prefix`, `override_rank`, `model_server_address`, `model_server_address_exp_chars`, `model_properties_version_keys`, `staging`
- c.ai+ presumably uses a different model (better quality, longer answers, faster)
- Without a reference c.ai+ account, quality must be assessed subjectively or via community benchmarks

**Method:**
1. Intercept POST to `/chat/streaming/`
2. Modify payload:
   - `staging: true` (possibly enables test mode with better model)
   - `override_prefix: <c.ai+ value>`
   - `override_rank: <c.ai+ value>`
   - `model_server_address: <premium model address>`
   - `model_properties_version_keys: <model version keys>`
3. Compare responses (length, quality, speed) with reference c.ai+ account

**Testing plan:**
1. If access to c.ai+ account — capture reference responses (same prompts, same characters)
2. Iterate field combinations in payload on free account
3. Compare responses byte-by-byte: length, latency, quality (subjective)
4. Find minimal field set for model switching
5. If purely server-side check (token tied to tier) — move to methods B/C/D from limits section

---

## 6. Implementation Phases

### Phase 0 — Reconnaissance

| Task | Tool | Expected Result |
|------|------|-----------------|
| 0.1 Capture exact API endpoints and payloads | Chrome DevTools, browser on beta.character.ai | Full API map |
| 0.2 Determine limit mechanism | Stress test — document server response | Exact knowledge: server or client limit |
| 0.3 Compare free vs c.ai+ responses | Two accounts, same prompts | Differences in payload/response fields |
| 0.4 Find ad selectors | DOM inspection | CSS selector list for blocking |
| 0.5 Study WebSocket/SSE streaming | Network tab | Response streaming protocol |

### Phase 1 — Ad Removal (Quick Win)

| Task | Depends On |
|------|-----------|
| 1.1 Create extension skeleton (manifest.json, icons, build) | — |
| 1.2 Implement content script with MutationObserver | 0.4 |
| 1.3 Implement ad-block interceptor (fetch/XHR) | 0.4 |
| 1.4 Add UI-overlay: status indicator | 1.1 |
| 1.5 Write unit tests for ad-remover | 1.2 |
| 1.6 Manual testing on beta.character.ai | 1.2, 1.3 |

### Phase 2 — Rate Limit Bypass (Main Goal)

| Task | Depends On |
|------|-----------|
| 2.1 Implement fetch/XHR interceptor in content script | 1.1 |
| 2.2 Implement rate-limit module (method A: client-side bypass) | 0.2, 2.1 |
| 2.3 Test method A | 2.2 |
| 2.4 If A doesn't work → method B (ID substitution) | 0.2 |
| 2.5 If B doesn't work → method C (guest sessions) | 0.2 |
| 2.6 If C doesn't work → method D (multi-token) — needs UI for tokens | 0.2 |

### Phase 3 — Model Switch (Premium Model)

| Task | Depends On |
|------|-----------|
| 3.1 Collect reference data (free vs c.ai+) | 0.3 |
| 3.2 Implement model-switch interceptor | 2.1 |
| 3.3 Iterate field combinations (see 5.3) | 3.1, 3.2 |
| 3.4 Document working combination | 3.3 |

### Phase 4 — Polish & Release

| Task | Depends On |
|------|-----------|
| 4.1 Popup UI: settings, status, info | 1.1 |
| 4.2 Popup UI: token management (if Phase 2 method D) | 2.6 |
| 4.3 Write documentation (INSTALL.md with images) | 1.1–3.4 |
| 4.4 Write FAQ.md | 4.3 |
| 4.5 Build production bundle | 1.1–4.2 |
| 4.6 Prepare for publication (GitHub release) | 4.5 |

### Phase 5 — Android APK Reverse (Future)

| Task | Depends On |
|------|-----------|
| 5.1 Download APK (from trusted source) | — |
| 5.2 Decompile via JADX/Apktool | 5.1 |
| 5.3 Find API endpoints, keys, secrets | 5.2 |
| 5.4 Document findings in wiki/ | 5.3 |

---

## 7. Extension Manifest (manifest.json Schema)

```json
{
  "manifest_version": 3,
  "name": "CAI Unlock",
  "version": "0.1.0",
  "description": "Removes character.ai limits and ads. For the neighborhood.",
  "permissions": ["storage", "scripting"],
  "host_permissions": [
    "*://beta.character.ai/*",
    "*://plus.character.ai/*",
    "*://old.character.ai/*"
  ],
  "background": {
    "service_worker": "background/service-worker.js"
  },
  "content_scripts": [
    {
      "matches": [
        "*://beta.character.ai/*",
        "*://plus.character.ai/*",
        "*://old.character.ai/*"
      ],
      "js": ["content/injector.js"],
      "run_at": "document_start"
    },
    {
      "matches": [
        "*://beta.character.ai/*",
        "*://plus.character.ai/*",
        "*://old.character.ai/*"
      ],
      "js": ["content/ad-remover.js", "content/ui-overlay.js"],
      "run_at": "document_end"
    }
  ],
  "action": {
    "default_popup": "popup/popup.html",
    "default_title": "CAI Unlock"
  },
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}
```

---

## 8. Key API Endpoints (From Reverse Engineering)

| Method | URL | Purpose |
|-------|-----|---------|
| GET | `https://beta.character.ai/chat/curated_categories/characters/` | Character list |
| POST | `https://beta.character.ai/chat/character/info/` | Character info → tgt |
| POST | `https://beta.character.ai/chat/history/create/` | Create chat history → history_external_id |
| POST | `https://beta.character.ai/chat/streaming/` | Send message and stream response |
| GET | `https://plus.character.ai/chat/user/public/following/` | User data (with `Authorization: Token ...` header) |

### Payload Fields for Sending Messages (`/chat/streaming/`):

```typescript
interface ChatStreamingPayload {
  history_external_id: string;
  character_external_id: string;
  text: string;
  tgt: string;
  ranking_method: string;
  staging: boolean;
  model_server_address: string | null;
  model_server_address_exp_chars: string | null;
  override_prefix: string | null;
  override_rank: string | null;
  rank_candidates: string | null;
  filter_candidates: string | null;
  unsanitized_characters: string | null;
  prefix_limit: string | null;
  prefix_token_limit: string | null;
  stream_params: string | null;
  model_properties_version_keys: string;
  enable_tti: string | null;
  initial_timeout: string | null;
  insert_beginning: string | null;
  stream_every_n_steps: number;
  chunks_to_pad: number;
  is_proactive: boolean;
  image_rel_path: string;
  image_description: string;
  image_description_type: string;
  image_origin_type: string;
  voice_enabled: boolean;
  parent_msg_uuid: string | null;
  seen_msg_uuids: string[];
  retry_last_user_msg_uuid: string | null;
  num_candidates: number;
  give_room_introductions: boolean;
  mock_response: boolean;
}
```

**Fields of interest for attack:** `staging`, `model_server_address`, `model_server_address_exp_chars`, `override_prefix`, `override_rank`, `model_properties_version_keys`, `mock_response`.

---

## 9. Cloudflare Bypass Strategy

**Problem:** character.ai is protected by Cloudflare. Direct HTTP requests from Python/Node.js are blocked.

**Extension solution:** The extension **does not make its own HTTP requests**. It intercepts requests that the character.ai page itself makes via native browser `fetch`/`XMLHttpRequest`. Since requests go through the user's browser with their own TLS handshake — Cloudflare sees no difference.

**Interception technique (injector.ts):**
```typescript
// document_start — BEFORE c.ai scripts load
const origFetch = window.fetch;
window.fetch = async function(input: RequestInfo, init?: RequestInit) {
  const url = typeof input === 'string' ? input : input.url;
  
  // Modify payload for model-switch / rate-limit
  if (url.includes('/chat/streaming/') && init?.body) {
    init.body = modifyPayload(init.body);
  }
  
  const response = await origFetch.call(window, input, init);
  
  // Modify response to bypass client-side limits
  if (url.includes('/chat/streaming/')) {
    return modifyResponse(response);
  }
  
  return response;
};
```

---

## 10. Risks and Mitigations

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| c.ai patches API — extension breaks | High | Medium | Monitor API changes, auto-update extension |
| Cloudflare updates protection | Medium | High | Extension uses browser TLS — Cloudflare protection irrelevant |
| Account ban | Medium | High | Minimize anomalous activity, don't spam requests, warn user |
| Extension detection via JS | Low | Medium | Inject at document_start before c.ai scripts load; avoid globals |
| Legal risks | Low | Medium | Extension only modifies client side, doesn't affect server operation. Open-source — user responsibility |
| Token leak | Low | Critical | Tokens only in local extension storage, never sent to third-party servers |

---

## 11. Testing

### 11.1 Manual Testing (Primary)

- Load extension as unpacked in Chrome
- Full cycle: login → chat → limit → verify operation
- Compare with control browser without extension

### 11.2 Automated (Unit)

- `api-payloads.test.ts` — payload modification verification
- `model-switch.test.ts` — all field combinations
- `ad-remover.test.ts` — DOM manipulation with JSDOM

### 11.3 Integration (Future)

- Puppeteer + extension — real usage simulation
- Metric collection: latency, response length, ad presence

---

## 12. Community Documentation

**INSTALL.md** — step-by-step guide with screenshots:
1. How to download the extension (GitHub Releases)
2. How to load in Chrome (chrome://extensions → Developer mode → Load unpacked)
3. How to load in Firefox
4. How to get the token (if needed — DevTools → Application → Local Storage)
5. How to verify it works (no ads, no limit, longer answers)

**FAQ.md:**
- "Will I get banned?" — honest answer about risks
- "Why is it free?" — project manifesto
- "How to update?" — instructions
- "Not working — what to do?" — debug instructions

---

## 13. Out of Scope

- ❌ Modifying character.ai server-side
- ❌ DDoS / server load
- ❌ Stealing user data
- ❌ Copyright bypass
- ❌ Commercialization (tool is open-source and free)
- ❌ Mobile app (phase 5, not now)

---

## 14. Manual Limit Testing Protocol (Phase 0.2)

> For Niko. You do this yourself, send the results.

### Preparation

1. Open Chrome → go to beta.character.ai → log in
2. F12 → DevTools → **Network** tab
3. In filter write `streaming` (shows only chat requests)
4. **Application** tab → **Local Storage** → `beta.character.ai` — check keys (especially `char_token`, counters)

### Test A — Swipe Limit

1. Start chat with any character
2. Send a message
3. **Without closing DevTools**, press "swipe" (right arrow → different response)
4. Watch Network: each swipe = new POST to `/chat/streaming/`
5. Keep swiping until you hit the limit
6. When limit hit — **immediately screenshot**:
   - **Network** tab — last request (Request Payload + Response)
   - **Console** tab — errors
   - What the UI shows (what message/dialog)
7. Copy **Response** of last SUCCESSFUL swipe and first REJECTED one

### Test B — Go-on Limit

1. In same or new chat — send a message
2. When model responds — press "continue" (go-on)
3. Keep pressing go-on until you hit it
4. Same screenshots: Network (Request + Response), Console, UI

### What I Need Back

```
Test A (swipes):
- How many swipes before limit: ___
- Error text in UI: ___
- HTTP status of rejected request: ___
- Response body on rejection: ___
- Is there a counter in Local Storage: ___

Test B (go-on):
- How many go-on before limit: ___
- Error text in UI: ___
- HTTP status of rejected request: ___
- Response body on rejection: ___
```

---

## 15. Open Questions (Need Answers Before Implementation)

| # | Question | How to Find Out |
|---|----------|-----------------|
| Q1 | Is the limit enforced server-side or client-side? | Phase 0.2 — stress test |
| Q2 | Which fields exactly switch the model? | Phase 0.3 — A/B comparison free vs c.ai+ |
| Q3 | Do we have access to a c.ai+ account for reference tests? | ❌ Only free. A/B via community benchmarks or subjective assessment |
| Q4 | Does Cloudflare check header order / TLS fingerprint? | Phase 0.1 — analysis via extension |
| Q5 | How often does c.ai change the API? | Monitoring after Phase 0 |

---

## 15. References

- GitHub Gist (acheong08): https://gist.github.com/acheong08/be0b43bb89f9f4797079e5948c48738c — original API reverse engineering guide
- PyCharacterAI: https://github.com/Xtr4F/PyCharacterAI — Python wrapper (curl-cffi)
- node_characterai: https://github.com/realcoloride/node_characterai — Node.js wrapper (Puppeteer)
- Splx.ai: https://splx.ai/blog/jailbreaking-content-filters-in-character-ai — filter analysis
- GreasyFork: https://greasyfork.org/en/scripts/569906 — userscript with bypass (historical)

---

*Spec is ready. Brother decides — I execute.*
