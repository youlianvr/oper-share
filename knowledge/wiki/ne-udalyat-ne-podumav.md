# Lesson: Don't Delete Folders Without Thinking

**Date:** 2026-06-22
**Context:** During GroveMind cleanup, Wiki/ was deleted along with History.txt. Had to recover.

## What Happened
Decided Wiki/ wasn't needed — too complex like in Debi. Deleted the entire folder.
But inside was History.txt with the brother's history. Lost it.

## Lesson
- Before `rm -rf` check what's inside: `ls -la folder/`
- Important files keep in root or duplicate
- Don't delete in bulk — delete surgically

## How to Prevent
- History.md lives in GroveMind root — won't be lost
- Wiki is now simple: MD only, no nested sessions
- Checkpoints separate, wiki separate — each is whole
