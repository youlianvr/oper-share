# Example entries

Weak/good pairs from real cases. The difference is always the same: the
good version contains what the code does not.

---

## Example 1. Interface behaviour change

**Weak:**
> - Changed the list-row component

**Good:**
> **Right-click instead of the hover popup.** Copying a link out of text
> moved into the context menu; with several links in the text, each gets
> its own item with the domain. The first take was a hover micro-menu,
> but the cursor never reached the button in time — the context menu
> matches native text-field behaviour and requires racing nothing.

What was added: the reason for the decision, the rejected option and
**why** it was rejected. Six months later this prevents "improving" it
back.

---

## Example 2. An optimization

**Weak:**
> - Optimized saving

**Good:**
> **Saving no longer writes the file on every keystroke.** Writes became
> deferred: a pause in typing — and only then does the file hit the disk.
> Previously every character produced a write, which caused stutter on
> long texts and extra disk wear.

What was added: what the problem actually was (i.e. **why** the
optimization happened) and how it behaved before.

---

## Example 3. A bug fix

**Weak:**
> - Fixed the list-marker bug

**Good:**
> **The list marker is visible immediately.** The marker (`1.`, `•`,
> checkbox) moved out of custom drawing over the text into the text
> itself — it now appears right after the prefix is typed, before the
> first letter. It used to be drawn on a separate layer and never showed
> for an empty item. The bug survived nine debugging sessions: everyone
> looked in the rendering, while the cause was in the storage model.

What was added: the fix mechanics, the previous behaviour and **where
people looked in the wrong place** — the last one saves the next person
entering this area.

---

## Example 4. An architectural change

**Weak:**
> - Added a token layer

**Good:**
> **A design-token layer.** Spacing, radius, typography and duration
> scales appeared. The values are not invented — they were measured from
> production by frequency of use and compressed into reference steps:
> there used to be 17 distinct spacing values and 13 radii. The old set
> was not a scale — the choice between 6 and 7 had no basis. Each file
> header records where the values came from and how to choose between
> adjacent steps, so the scale doesn't drift back.

What was added: the **method** for deriving the values (the key
decision), the scale of the problem in numbers, and the rollback guard.

---

## Example 5. A minor fix

Minor changes get recorded too — briefly, but recorded.

**Weak:** (no entry)

**Good:**
> **The panel counter got quieter.** The numbers pulled attention away
> from the labels — now a tone lighter and smaller.

One line. But six months later it's clear this was a decision, not an
accident, and why reverting to "bigger" is a bad idea.

---

## Example 6. A release summary

Four fields together:

> ### List markers in text, live links, and a layout that survives switching
>
> - **What:** the list marker moved from custom drawing into the text
>   itself — visible right after the prefix is typed. Links in notes come
>   alive while typing. Focus mode and layout no longer reset when
>   switching between sections.
> - **Where:** `NotesFormatting`, `RichNotesCommands`, `RichNotesEditor`,
>   `WorkspaceState`, tests `ListMarkerTests`, `LinkDetectorTests`.
> - **Why:** kill the invisible-marker bug that survived nine debugging
>   sessions, and bring links and layout to a state fit for daily use.
> - **Before:** the previous version drew the marker over the text (it
>   never appeared for an empty item), links only became clickable after
>   leaving and re-entering a section, and switching reset the layout.

Reads in half a minute and answers all four questions: what now, where to
look, why it was done, how it was.
