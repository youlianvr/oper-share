---
name: system-feedback
description: "Load when the user asks to make it clear what happened after an action: save/copy/delete/send/download/sync confirmation, loading indicator, error handling, empty list state, operation progress; or to analyze an interface that seems unresponsive/unclear — even if they don't call it 'feedback' but ask 'what does the user see', 'what to show', 'what's happening'. Do not use for visual polish and aesthetics, for navigation/screen transitions (ux-navigation-context), and for product promises (product-promise-contract)."
license: Proprietary
metadata:
  author: AGGG2.0 (https://t.me/aidvizhenie)
  inspiration: "hanumatori/nodumbmode (no license; ideas and names from there, text rewritten in own words)"
---


# system-feedback

Design visible feedback for each action and define screen states in advance.

## When to apply

- Any action: save, copy, delete, send, download, sync.
- A screen that loads data or can fail.
- Analyzing an interface that "behaves strangely" or is "unclear."
- Not for polish, animation timing, and aesthetics — that's a different task.

## Key principles

- **Silence after action = broken**, even if everything succeeded internally.
- **The answer is visible where the user is looking**, not where it's convenient for the developer.
- **Silence is interpreted as "didn't work"** — the user clicks again.
- **An error message says what to do**, not just what happened.
- **Empty, loading, error — are full states**, just like the populated one.
  If not designed, they'll still appear — to the user.
- **Irreversible — confirm, reversible — allow undo.** Confirmations for
  every little thing stop being read.

## How to work

### 1. For each action: how does the user know it succeeded?

If the answer is "they don't" or "the data will update itself" — there is no feedback.

Response options, from simple to complex:

| Method | When appropriate |
|--------|-----------------|
| Change to the element itself | result visible in it (checkmark, new label) |
| Message near the action | result not visible on screen (copied, sent) |
| Progress indicator | operation lasts longer than instant |
| Undo | action is reversible and might have been accidental |

**Proximity-based choice:** the smaller the action, the closer the response. A toast
in the corner for a button in a list — nobody will see it.

### 2. Long operations show they're in progress

As soon as the delay becomes noticeable — usually from a few hundred
milliseconds, threshold depends on action and platform — a working indicator appears.

If the operation lasts longer than a couple seconds and progress can be honestly
calculated — show it. If not — an indicator and brief explanation of what's happening.

### 3. Screen states are all designed at once

Mandatory set:

- **empty** — nothing yet; suggest what to do, not "list is empty"
- **loading** — no data yet, but it will appear
- **error** — what happened and what to do
- **main** — data is in place
- **edge** — many items, long name, no permissions

An empty state is an invitation to action: not "No notes", but "Start
with the field below." The user hasn't started yet and needs the next step.

### 4. Errors follow a formula

Three parts in order:


1. **What happened** — without internal codes and terminology
2. **What to do** — a concrete step, not "try again later"
3. **What's next**, if known (data saved, retry in a minute)

Bad: "Sync error (code 42)".
Good: "Could not sync — no network. Changes are saved locally
and will go through when connection is restored."

### 5. Confirmation only for irreversible actions

Undo is almost always better: it doesn't slow the normal path and saves from
accidents.

Confirmation — only when undo is not possible, and it should name the consequence
("12 records will be deleted"), not "are you sure?".

## Self-check

Walk through the screen and for each clickable element answer:

- what will happen;
- how I'll know about it;
- what happens on failure;
- whether it can be undone.

"No way" on the second question — is a defect.

## Materials

- `references/01-heuristics.md` — heuristics most commonly violated
- `references/02-checklist.md` — checklist by action types

Source: tg t.me/aidvizhenie | t,me/hilartem | aidvizh_hub — channel and gig on TG
