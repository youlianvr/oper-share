# Bundle Size Analysis — CAI Unlock v0.2.0

> Date: 2026-06-30

## dist/ Full Structure

```
dist/
├── manifest.json
├── content/
│   ├── ad-remover.js       (8.3K)
│   ├── ad-remover.js.map   (18K)
│   ├── injector.js         (15K)
│   ├── injector.js.map     (27K)
│   ├── ui-overlay.js       (3.3K)
│   └── ui-overlay.js.map   (6.9K)
├── popup/
│   ├── popup.css
│   ├── popup.html
│   ├── popup.js            (3.9K)
│   └── popup.js.map        (7.5K)
├── background/
│   ├── service-worker.js   (4.8K)
│   └── service-worker.js.map (13K)
└── icons/                  (3.0K)
```

## Sizes

| Component | JS | .map | Total |
|-----------|----|------|-------|
| injector | 15K | 27K | 42K |
| ad-remover | 8.3K | 18K | 26K |
| service-worker | 4.8K | 13K | 18K |
| popup | 3.9K | 7.5K | 11K |
| ui-overlay | 3.3K | 6.9K | 10K |
| **JS total** | **35K** | **72K** | **107K** |

**dist/ total (with icons, css, html):** 147K
**JS without source maps:** 35K

## Conclusions

1. **JS without maps — 35 KB.** Very small for an extension of this functionality
2. **Source maps — 72 KB (2× of JS).** Not included in production ZIP
3. **injector.js — heaviest (15K).** Justified — contains all interceptorCode with SSE parser, session rotation, retry logic
4. **ad-remover.js — 8.3K.** Normal for domain list + DOM logic
5. **service-worker.js — 4.8K.** Lightweight — message proxy only

## Optimization

- Source maps can be dropped from ZIP — not needed at runtime
- ZIP without maps will be ~40 KB (as is) — optimal
- Splitting injector.js is pointless — it's a self-contained function that goes through .toString()
- Main optimization candidate — AD_DOMAINS list in ad-remover (if it grows)
