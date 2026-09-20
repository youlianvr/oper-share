---
name: firefox-extensions
description: >-
  Verified Firefox extension bundle for speed boost and eye protection: YourCodecs (force YouTube to serve H.264 when GPU can't handle VP9/AV1), uBlock Origin (ads/trackers), Dark Background and Light Text (dark mode), RedDarkMode theme. Use when the user asks about Firefox extensions for speed/video codecs/dark mode, YouTube stutters despite hardware decoding, or to add/review this bundle. GOTCHA: install only via the AMO button — sideload and policies do NOT work.
metadata:
  author: AGGG2.0 (t.me/aidvizhenie, t.me/hilartem)
---
aidvizhenie · hilartem · aidvizh_hub — all on Telegram: t.me/aidvizhenie


# Firefox extensions: speed boost + eye protection bundle

Verified 2026-08-10 (machine: Fedora 44, NVIDIA GTX 1660 SUPER, RPM Firefox 153).
Two purposes: **speed boost** (faster, less CPU/RAM) and **eye protection** (dark mode).

## Installation — ONLY via AMO button (GOTCHA)

The most reliable path is the "Add to Firefox" button on addons.mozilla.org
(user does it themselves, or open the page via `xdg-open`).

What does NOT work (verified on Fedora 44, Firefox 153):
- **Sideload xpi to profile folder** (`extensions/{id}.xpi`) — Firefox ignores it,
  `extensions.json` not updated. Don't waste time.
- **policies.json** (`/usr/lib64/firefox/distribution/` or `/etc/firefox/policies/`,
  `ExtensionSettings` with `normal_installed`/`force_installed`) — didn't work.
- `firefox --install-extension` — flag not in --help (unconfirmed).

## Bundle (for speed and eyes)

### YourCodecs — video boost (mandatory for NVIDIA without VP9/AV1)
- What: h264ify fork (0.2.0, 2024, MIT), selectively blocks AVC/VP8/VP9/AV1
  on YouTube. Needed when GPU can't handle VP9/AV1 (1660 SUPER: VP9/AV1 not in
  NVDEC — verified with vainfo) — YouTube defaults to VP9, and Firefox
  decodes it on CPU → stuttering on streams.
- Link: https://addons.mozilla.org/en-US/firefox/addon/your-codecs/
- ID: `{08146168-5720-4ebb-b6cb-e85b4f9c5d45}`
- After install — **Ctrl+F5** on YouTube (otherwise old format persists).
- Gotcha: blocking ALL codecs at once = "Your browser cannot play
  video" (by design); for forced AV1 — don't block VP9 and AV1.
- Don't use original h264ify (1.1.0, 2019, unmaintained) — YourCodecs
  is fresher and more flexible.

### uBlock Origin — speed boost (ads/trackers)
- What: lightest effective blocker, 10.5M users, recommended,
  1.73.0. Less ads/trackers = less CPU, RAM, traffic — main
  "speed boost" for the browser.
- Link: https://addons.mozilla.org/ru/firefox/addon/ublock-origin/
- ID: `uBlock0@raymondhill.net`
- Already installed in user profile (1.73.0) — don't duplicate.
