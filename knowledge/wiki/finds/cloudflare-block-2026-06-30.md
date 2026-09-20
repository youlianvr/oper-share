# Cloudflare Protection on Character.AI

**Date:** 2026-06-30
**Context:** Attempting automated reverse engineering of c.ai SSE format via browser-use

## Essence

Attempting to open `beta.character.ai` via browser-use (Chrome DevTools Protocol) — **immediate 403 Forbidden** from Cloudflare. Page doesn't load, content inaccessible.

## Why This Matters

1. **c.ai uses Cloudflare** — basic DDoS protection, but it also blocks all non-browser and automated requests
2. **Only a live browser with a real user** can open c.ai — CAI Unlock content scripts work because they're embedded in a page the user opened themselves
3. **SSE reverse requires manual testing** — must open c.ai in browser, enable interception, and read captured data from `chrome.storage` or logs

## Conclusions for Development

- **Automated tests on c.ai are impossible** — browser-use and any headless approaches are blocked
- **Only research method:** manually open c.ai, enable `debugMode` in the extension, watch logs
- **Cloudflare is not a production problem** — users access normally, extension works in their browser

## Potential Bypasses (For Research Purposes)

- Use a real browser profile with cookies (not headless)
- Use Camoufox with proxy (L4 level from the toolchain)
- Use an existing Chrome profile with an active c.ai session

---

*Recorded in Grove Street Library. Fact, not a bug.*
