---
name: mic-noise-suppression
description: 'Use when the user wants to fix a noisy microphone on Fedora/Linux with PipeWire: background noise, hum, muddiness, or make the voice clearer. Sets up EasyEffects + RNNoise (neural noise suppression) with the community NPR voice preset and a virtual "Easy Effects Source" microphone, with autostart.'
metadata:
  author: AGGG2.0 (t.me/aidvizhenie, t.me/hilartem)
---


# Microphone noise suppression (EasyEffects + RNNoise)

Scheme for Fedora/PipeWire: neural noise suppressor RNNoise (Discord/NVIDIA Broadcast technology) + community voice preset.
Result: virtual microphone **Easy Effects Source**.

## What it does

- Installs `easyeffects` (dnf) and applies **npr** preset (jtrv "Masc NPR Voice", wiki easyeffects → Community Presets): RNNoise → Gate → EQ → Compressor → De-Esser → Limiter (6 plugins; deepfilternet not in dnf — installed via LADSPA plugin, see section below)
- Creates virtual source **Easy Effects Source** + service autostart

## DeepFilterNet (optional alternative to RNNoise — better noise suppression)

DeepFilterNet v0.5.6 LADSPA — next-generation neural network: by measurement
gives speech/noise SNR **+65dB** vs +31dB for npr and
+8.8dB for raw microphone; residual noise ~700x lower, speech almost
not cut. Installed manually (not in dnf):

```bash
curl -LO https://github.com/Rikorose/DeepFilterNet/releases/download/v0.5.6/libdeep_filter_ladspa-0.5.6-x86_64-unknown-linux-gnu.so
sudo mkdir -p /usr/lib64/ladspa
sudo cp libdeep_filter_ladspa.so /usr/lib64/ladspa/
pkill -x easyeffects   # AS SEPARATE COMMAND
nohup easyeffects --service-mode >/dev/null 2>&1 & disown
```

Preset `deepfilter_asr` (DeepFilterNet → Autogain -18 LUFS) — already in
`~/.local/share/easyeffects/input/`. Plugin keys (8.x, from
deepfilternet_preset.cpp): attenuation-limit=70, min-processing-threshold=-25,
max-erb-processing-threshold=25, max-df-processing-threshold=20,
min-processing-buffer=0, post-filter-beta=0.05. On easyeffects update
verify plugin is alive: `easyeffects -a input` + test recording.

⚠️ For CALLS/recordings — deepfilter_asr; NOT for sherpa-voice
recognition the preset doesn't matter (see "Speech recognition bundle": GTCRN cleans itself).
