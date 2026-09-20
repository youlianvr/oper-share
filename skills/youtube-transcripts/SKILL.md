---
name: youtube-transcripts
description: >-
  Fetch YouTube transcripts locally with timestamps — no API key, no paid
  third-party service, no yt-dlp. Use when the user wants a video transcript,
  a summary of a YouTube video, quotes with timecodes, or needs to search
  inside a video's spoken content. Trigger phrases: "transcript of this video",
  "summarize this YouTube video", "what does this video say about X",
  "find the moment when", or any YouTube URL/video ID involving spoken content.
  Do NOT use for downloading video/audio files, engagement data (likes,
  comments), or channel analytics.
license: MIT
metadata:
  source: built in-workspace 2026-09-06 as a free local alternative to the
    TranscriptAPI-backed youtube-full skill (100-credit paywall)
  dependency: youtube-transcript-api (pip install --user youtube-transcript-api)
  verified: live fetch test passed 2026-09-06 (61 segments, dQw4w9WgXcQ)
---

# youtube-transcripts — local, free, keyless YouTube transcripts

Python library `youtube-transcript-api` pulls YouTube's own caption tracks
directly. Nothing leaves the machine except YouTube itself. Pair with the
existing `youtube-full` skill when its TranscriptAPI budget is acceptable;
default to this skill for unlimited free use.

## Setup (first use)

```bash
pip install --user youtube-transcript-api
```

## Usage

### 1. List available caption languages

```bash
python skills/youtube-transcripts/scripts/yt.py list <video_id_or_url>
```

### 2. Fetch transcript with timestamps

```bash
python skills/youtube-transcripts/scripts/yt.py fetch <video_id_or_url>
python skills/youtube-transcripts/scripts/yt.py fetch <video_id_or_url> --lang ru,en
python skills/youtube-transcripts/scripts/yt.py fetch <video_id_or_url> --out transcript.txt
```

Output format: `[123.4s] text` — one caption segment per line.

### 3. Search inside a transcript

```bash
python skills/youtube-transcripts/scripts/yt.py search <video_id_or_url> "search phrase"
```

Returns matching segments with their timestamps (jump points).

## Agent workflow

1. `list` to see what captions exist (auto-generated vs human, languages).
2. `fetch` the best language (`--lang` preference order).
3. For "summarize video": read the fetched transcript, summarize in the
   user's language, cite `[time]` marks for key claims.
4. For "find X": use `search`, then quote surrounding segments.

## Limitations (honest)

- Only videos with captions/subtitles (auto-generated counts).
- YouTube rate-limits aggressive bulk fetching — for whole-channel sweeps,
  pace requests or fall back to `youtube-full` (paid API).
- Search is plain substring matching on this transcript, not semantic.
