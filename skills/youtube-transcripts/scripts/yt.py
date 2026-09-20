#!/usr/bin/env python3
"""youtube-transcripts skill helper — local, keyless YouTube transcript access.

Commands:
  list   <video>                list available caption tracks
  fetch  <video> [--lang a,b] [--out FILE]   print/save timestamped transcript
  search <video> <phrase> [--lang a,b]       search inside the transcript

<video> accepts a raw ID or any youtube.com/youtu.be URL.
"""
from __future__ import annotations

import argparse
import re
import sys

try:
    from youtube_transcript_api import YouTubeTranscriptApi
except ImportError:
    sys.exit(
        "youtube-transcript-api is not installed. Run: "
        "pip install --user youtube-transcript-api"
    )

URL_RE = re.compile(
    r"(?:v=|youtu\.be/|shorts/|embed/)([A-Za-z0-9_-]{11})"
)


def video_id(value: str) -> str:
    value = value.strip()
    m = URL_RE.search(value)
    if m:
        return m.group(1)
    if re.fullmatch(r"[A-Za-z0-9_-]{11}", value):
        return value
    sys.exit(f"Cannot parse video id/url: {value!r}")


def get_api() -> YouTubeTranscriptApi:
    return YouTubeTranscriptApi()


def list_tracks(v: str) -> None:
    tr = get_api().list(v)
    for t in tr:
        gen = "auto" if t.is_generated else "human"
        print(f"{t.language_code:8s} {gen:5s} {t.language}")


def fetch(v: str, langs: str | None, out: str | None) -> None:
    lang_list = [l.strip() for l in langs.split(",")] if langs else None
    if lang_list:
        t = get_api().fetch(v, languages=lang_list)
    else:
        t = get_api().fetch(v)
    lines = [f"[{s.start:.1f}s] {s.text.replace(chr(10), ' ')}" for s in t]
    text = "\n".join(lines)
    if out:
        with open(out, "w", encoding="utf-8") as f:
            f.write(text)
        print(f"saved {len(lines)} segments -> {out}")
    else:
        print(text)


def search(v: str, phrase: str, langs: str | None) -> None:
    lang_list = [l.strip() for l in langs.split(",")] if langs else None
    t = (
        get_api().fetch(v, languages=lang_list)
        if lang_list
        else get_api().fetch(v)
    )
    needle = phrase.lower()
    hits = [
        f"[{s.start:.1f}s] {s.text.replace(chr(10), ' ')}"
        for s in t
        if needle in s.text.lower()
    ]
    if not hits:
        print("no matches")
        return
    print("\n".join(hits))


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__)
    sub = p.add_subparsers(dest="cmd", required=True)

    pl = sub.add_parser("list")
    pl.add_argument("video")

    pf = sub.add_parser("fetch")
    pf.add_argument("video")
    pf.add_argument("--lang", default=None, help="comma-separated language codes")
    pf.add_argument("--out", default=None, help="save to file instead of stdout")

    ps = sub.add_parser("search")
    ps.add_argument("video")
    ps.add_argument("phrase")
    ps.add_argument("--lang", default=None)

    args = p.parse_args()
    v = video_id(args.video)
    if args.cmd == "list":
        list_tracks(v)
    elif args.cmd == "fetch":
        fetch(v, args.lang, args.out)
    elif args.cmd == "search":
        search(v, args.phrase, args.lang)


if __name__ == "__main__":
    main()
