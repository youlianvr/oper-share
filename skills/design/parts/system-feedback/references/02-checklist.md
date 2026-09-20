# Feedback checklist: what the user must see after every action


## General rule

Check by grepping the code, not from memory. The "what we show" list is
built from the real action handlers.

Every user action must be closed by a system response: for example, a
save or submit confirmation.

## Instant action with a visible result

Examples: mark, collapse, toggle. The result is visible right in the
element the person touched.

- No separate response needed — the element itself showed what happened.
- Press feedback exists (pseudo-class, change, motion).
- State doesn't jump: the element doesn't twitch or shift its neighbours.

If the checkbox ticked — that's enough. Toasts and messages here are noise.

## Instant action with an invisible result

Examples: copy to clipboard, add to a hidden list. The result is not
visible, so without an explicit response the person never learns the
action worked.

- An explicit response is mandatory.
- The response sits next to the action site — not in a screen corner.
- Form: button label change ("Copy" → "Copied"), a checkmark, a short
  message.
- The response disappears on its own after a couple of seconds, with no
  user action.

## Delayed action

Examples: submit, upload, sync, export.

- A working indicator appears as soon as the delay becomes noticeable
  (roughly half a second).
- Longer than a couple of seconds — progress, if it can be counted
  honestly. If it can't — show the stage, not a "progress" bar from
  nowhere.
- Repeated presses are blocked while the action runs.
- A way to interrupt the action.
- An explicit outcome: both success and failure are reported.

## Destructive action

Examples: delete, overwrite, clear.

- Reversible action (can be restored) — offer "undo after", not
  "confirm before". Undo doesn't block; confirmation annoys.
- Irreversible action — confirmation with the consequence in numbers:
  "12 records will be deleted", not "Are you sure?".
- The button names the action: "Delete", not "OK".
- The button is visually distinct from the rest: colour, weight.

## Data entry

Forms, fields, editors.

- Validate at input time, not after submission.
- The error is shown next to the field it belongs to.
- Required fields are visible before submit (asterisk, label).
- Entered data is not lost on error: the person fixes one field, not
  retypes the whole form.
- For long input — autosave with a save indicator.

## Data screen

Five states, each with its own presentation:

- Loading — for a long load, a skeleton, not emptiness.
- Empty — not "nothing here" but an invitation to act: "Add the first
  record".
- Error — what happened, what to do, what is already saved.
- Main state — data at work.
- Edges: many records (pagination), long values (truncation), no access
  rights (an explanation, not a bare block).

Key rule: empty ≠ error ≠ loading. Three different states, three
presentations, three different texts.

## Background operation

Examples: autosave, sync.

- An unobtrusive indicator: a small chip, icon, corner status.
- Completion is visible: time or status ("Saved 12:04").
- An error is never lost silently: if a background operation failed, the
  person finds out explicitly.
- The operation doesn't block work: the person keeps going while the
  system is busy.

## Self-check

For every action, in writing, step by step:

- Success — how does the user learn it all worked?
- Error — what happened and what to do next?
- Long wait — what does the system show while waiting?
- Cancellation — how can the action be interrupted or undone?

If any question has no answer, the action is not finished. Check in code,
in writing, for every action.
