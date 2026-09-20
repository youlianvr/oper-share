---


name: firefox-optimization
description: 'Optimize Firefox on Fedora/Linux for performance and stability ("no glitches, but holds up"): about:config tweaks via user.js (Betterfox/Fastfox verified list), hardware acceleration, WebRender check, uBlock Origin, profile location gotchas, slow-video diagnosis (VA-API/NVIDIA, Flatpak GOTCHA). Use when the user asks to speed up Firefox, fix browser glitches/lag/video freezes/stuttering streams, or apply Firefox performance tweaks.'
metadata:
  author: AGGG2.0 (t.me/aidvizhenie, t.me/hilartem)
---


# Firefox performance optimization (Fedora / Linux)

Goal: make Firefox fast and stable — "no glitches, but holds up". Sources: Betterfox
(yokoffing/Betterfox, actively maintained, 10.7k stars, last check 2026-08-07,
Fastfox.js version 152) + general performance guide (SysAdminSage 2026-06).

## Profile location GOTCHA (this box, updated 2026-08-10)

Firefox was Flatpak → migrated to RPM; profiles now live in
`~/.mozilla/firefox/` (system Firefox, NOT flatpak sandbox dirs):
- `9ud3litf.default-release` = ACTIVE profile (migrated from Flatpak 2026-08-10).
- `j3z6402p.default-release` = old system profile, preserved.
- `profiles.ini` marks `9ud3litf` as Default; `[Install...] Default=` = active.
- Flatpak profiles lived in `~/.var/app/org.mozilla.firefox/config/mozilla/firefox/`
  (XDG_CONFIG_HOME override) — if a "missing" profile hunt starts, check there
  first when the process runs from `/app/` via `bwrap` (flatpak).
- If no profile dir exists at all: Firefox was never launched — run
  `firefox -CreateProfile default` or just start Firefox once.

## SLOW VIDEO — diagnosis method & treatment (case 2026-08-10)

Symptom: streams/movies stutter, "everything is slow, it's the browser".
How to find the real cause (do NOT guess — measure, in this order):

1. **Is it even a system package?** `pgrep -af firefox` → if paths start with
   `/app/` and `bwrap` is in the cmdline → it's **Flatpak** (this matters, see GOTCHA).
2. **Does the GPU work at all?** `nvidia-smi` while playing a video:
   near-0% GPU util + ~11W idle → video is NOT decoded by GPU.
3. **Which codec path?** `grep vaapi ~/.mozilla/firefox/*/prefs.js` — empty means
   software decode (CPU chokes on 1080p60, i5-9400F has NO iGPU — 'F' suffix).
4. **Is the VA-API driver installed?** `vainfo` — missing `nvidia_drv_video.so`
   and "VA-API NVDEC driver" line → hardware decode unavailable.
5. **Research first** (not memory): README elFarto/nvidia-vaapi-driver (Firefox
   Integration section), Fedora wiki `Hardware_Video_Acceleration`,
   discourse.flathub.org. Details saved in research.db (findings id=65, id=69).

### Treatment (NVIDIA + Fedora, verified)

- System Firefox: `sudo dnf install firefox` (RPM — canonical for Fedora).
- `nvidia-vaapi-driver` is NOT packaged for Fedora (pkgs.org verified) — build:
  `git clone https://github.com/elFarto/nvidia-vaapi-driver` →
  `sudo dnf install meson libva-devel gstreamer1-plugins-bad-freeworld libdrm-devel`
  → `meson setup build && sudo meson install -C build`
  (ffnvcodec-headers pulled via meson wrap automatically).
- user.js in profile (Firefox 137+ requires `force-enabled`):

  | Pref | Value | Why |
  |---|---|---|
  | `media.ffmpeg.vaapi.enabled` | true | VA-API on |
  | `media.hardware-video-decoding.force-enabled` | true | REQUIRED since FF137 |
  | `media.rdd-ffmpeg.enabled` | true | decode in RDD process |
  | `widget.dmabuf.force-enabled` | true | DMA-BUF for NVIDIA |
  | `media.av1.enabled` | false | 1660 SUPER has no AV1 |

- Environment (system-wide, `/etc/environment`):
  `MOZ_DISABLE_RDD_SANDBOX=1`, `LIBVA_DRIVER_NAME=nvidia`, `NVD_BACKEND=direct`
  (EGL backend is broken on NVIDIA drivers 525+).
- Verify: `vainfo` shows `VA-API NVDEC driver [direct backend]` with
  H264/HEVC/VP8 profiles; `nvidia-smi` during playback shows non-zero decode.
- **1660 SUPER has NO VP9/AV1 NVDEC** (vainfo list) → YouTube will still
  software-decode VP9 → install `your-codecs` extension (see firefox-extensions
  skill) to force H.264.

## How to apply tweaks (user.js)

1. Firefox MUST be closed (user.js is read at startup; it overrides prefs every start).
2. Write `user.js` into the profile root:
   `~/.config/mozilla/firefox/<profile>/user.js`
3. Values are applied on next launch; `about:config` shows them (search the pref name).
4. Rollback: delete user.js + restart.

## Applied set (2026-08-07, machine: 16 GB RAM, GTX 1660 SUPER, Fedora 44)

Verified, non-breaking tweaks from Betterfox Fastfox.js (uncommented section):

| Pref | Value | Why |
|---|---|---|
| `gfx.content.skia-font-cache-size` | 20 | font render cache (MB), default 5 |
| `gfx.canvas.accelerated.cache-size` | 512 | GPU Canvas2D cache, default 256 |
| `content.notify.interval` | 100000 | page reflow timer (.10s), default 120000 |
| `javascript.options.baselinejit.threshold` | 50 | fewer dropped frames, default 100 |
| `network.buffer.cache.size` | 65535 | bigger packets, default 32768 |
| `network.buffer.cache.count` | 48 | default 24 |
| `network.http.max-connections` | 1800 | default 900 |
| `network.http.max-persistent-connections-per-server` | 10 | default 6 |
| `network.http.max-urgent-start-excessive-connections-per-host` | 5 | default 3 |
| `network.http.request.max-start-delay` | 5 | default 10 |
| `network.dnsCacheExpiration` | 3600 | DNS cache 1h, default 60 |
| `media.cache_readahead_limit` | 3600 | video buffer 10 min, default 60 |
| `media.cache_resume_threshold` | 1800 | video resume 5 min, default 30 |
| `image.mem.decode_bytes_at_a_time` | 32768 | default 16384 |
| `browser.tabs.min_inactive_duration_before_unload` | 300000 | unload inactive tabs after 5 min, default 600000 |
| `browser.low_commit_space_threshold_mb` | 13107 | 4/5 of 16 GB RAM (4GB=3276, 8GB=6553, 16GB=13107, 32GB=25698) |
| `dom.ipc.processPrelaunch.fission.number` | 1 | fewer preallocated processes, default 3 |

Full current Fastfox.js reference:
`https://raw.githubusercontent.com/yokoffing/Betterfox/main/Fastfox.js`
(some entries there are commented out = DEFAULTS, do not enable blindly).

## GUI settings (do once, manual)

- Settings → Performance → uncheck "Use recommended performance settings" →
  keep "Use hardware acceleration when available" CHECKED (NVIDIA proprietary
  driver + Wayland: WebRender works, no need for software fallback).
- Install **uBlock Origin** (biggest single speedup — blocks heavy ads/trackers).
- Check rendering: `about:support` → "Compositing" line must be **WebRender**
  (NOT "Software WebRender" — that means GPU accel is broken → check driver,
  `sudo dnf install akmod-nvidia`, see fedora-warm-colors skill §GPU).

## Do NOT touch (breaks stability)

- `gfx.webrender.software` / `gfx.webrender.all` — forces CPU rendering
- `fission.*` (webContentIsolationStrategy) — process isolation, Fission is default
- `network.http.pacing.requests.enabled` — network pacing, marginal gain
- `browser.cache.memory.capacity` — auto (32 MB) is fine for 16 GB machines
- `dom.ipc.processCount*` — process count is auto-managed since Fission

## Verify

- `about:support` → Compositing: WebRender; GPU #1: NVIDIA... (or software — bad)
- `about:processes` → resource usage per tab
- `about:config` → search any pref from the table above, value must match

