#!/usr/bin/env bash
# trash.sh — Never Destroy: deletion is a move to the trash folder, never rm.
# Usage: bash _scripts/trash.sh <path> [<path>...]
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TRASH="$ROOT/_trash/$(date +%Y-%m-%d)"
mkdir -p "$TRASH"

if [ $# -eq 0 ]; then
  echo "usage: bash _scripts/trash.sh <path> [<path>...]" >&2
  exit 1
fi

for p in "$@"; do
  if [ ! -e "$p" ]; then
    echo "trash: not found, skipping: $p" >&2
    continue
  fi
  dest="$TRASH/$(basename "$p")"
  # avoid clobbering same-named trashes: suffix with time
  if [ -e "$dest" ]; then
    dest="$dest.$(date +%H%M%S)"
  fi
  mv "$p" "$dest"
  echo "trashed: $p -> $dest"
done
