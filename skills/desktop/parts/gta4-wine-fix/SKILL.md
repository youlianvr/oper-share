---
name: gta4-wine-fix
description: 'Playbook for fixing GTA IV (repack/Complete Edition) under Wine: RGL error, FusionFix, DXVK, shaders, windowed. Diagnostics + verified fixes.'
metadata:
  author: AGGG2.0 (t.me/aidvizhenie, t.me/hilartem)
---


# Fixing GTA IV (repack / Complete Edition) under Wine — verified playbook

Verified in practice (Fedora, wine-staging 11 wow64, NVIDIA GTX 1660 SUPER, proprietary driver, prefix `~/.wine`, game in `~/DATA/Games/Grand Theft Auto IV`).

> **How to read this playbook.** GTA IV launch is a chain of layers:
> `Launcher → GTAIV.exe → ASI loader (dinput8) → FusionFix → d3d9 wrapper → DXVK → Wine Vulkan → NVIDIA driver`.
> Each fixed error opens the next — "fix one, another appears" is normal, not a regression.
> Section 1 — **invariants** (what to prove; long-lived methodology). Sections 2–4 — **current version implementations** (may become outdated: Wine, DXVK, FusionFix, repacks change).

---

## 1. INVARIANTS — what needs proving (methodology, version-independent)

Diagnostics always boil down to proving four facts about the ACTUAL state, not the assumed one:

| # | Invariant | How to prove (directly, not indirectly) |
|---|-----------|----------------------------------------|
| 1 | **Which exe launches** | Launch log/processes: `GTAIV.exe` (game) ≠ `PlayGTAIV.exe`/`Launcher.exe` (RGL bootstrap redirector). If redirector launched — RGL error is inevitable without installed RGL |
| 2 | **Which DLL is actually loaded** | `WINEDEBUG=+loaddll wine GTAIV.exe 2>&1 \| grep -iE "d3d9\|dinput8\|vulkan"` — look for `Loaded L"D:\Games\...\d3d9.dll" ... native` (local from game folder), not `system32`. "Mod installed" ≠ "mod active" |
| 3 | **Which renderer is active** | Log has `wined3d_*` fixme/err → rendering on wined3d (not DXVK). DXVK log starts with `info: DXVK: vX.Y.Z` |
| 4 | **Which GPU DXVK selected** | Line `info: Device : NVIDIA GeForce ...` in log = ENTIRE stack working (Vulkan present, ICD found, 32-bit Vulkan present, DXVK loaded, driver responding). Stronger than vulkaninfo/lsmod — checks exactly the stack the game uses. `llvmpipe` = GPU not visible |

**Diagnostics order is always top-down** (along the layer chain): until the previous invariant is proven, fixing the next layer is pointless (game doesn't reach it).

---

## 2. IMPLEMENTATIONS (current version — may change)

### 2.1 Diagnostics by error message

| Symptom | Source | Fix |
|---------|--------|-----|
| "Unable to locate the Rockstar Games Launcher, please verify your game data" | `PlayGTAIV.exe`/`Launcher.exe` — "Rockstar Games Launcher Redirector": looks for RGL at `\\Rockstar Games\\Launcher\\Launcher.exe` and registry `SOFTWARE\\WOW6432Node\\Rockstar Games\\Launcher` | Launch **GTAIV.exe directly** (RGL doesn't check). Don't play through PlayGTAIV/Launcher |
| Crash/black screen, log has `wined3d_get_format` / `context_choose_pixel_format` | Rendering went to wined3d instead of DXVK | Enable DXVK: `d3d9.cfg` → `[MAIN] API=1` |
| `err:d3dcompiler:assemble_shader Asm reading failed` | Wine's d3dcompiler_43 doesn't understand FusionFix asm shaders | `winetricks -q d3dcompiler_43` (native Microsoft DLL) + override `d3dcompiler_43=n` |
| `info: Device not reset` (DXVK), crash on fullscreen switch | Vulkan device lost on mode switch | Windowed mode: `-windowed` in `commandline.txt` |
| GPU not used (log has llvmpipe/lavapipe, no "Device : NVIDIA") | No `/dev/dri` in sandbox OR no 32-bit Vulkan stack | Check: `vulkan-loader.i686`, `nvidia_icd.i686.json`, `/usr/lib/libvulkan.so.1`; run outside sandbox with GPU |

