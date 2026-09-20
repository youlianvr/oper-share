# The heuristics that get violated most

Nielsen's heuristics help diagnose interface problems. Start with the four
violations below.

---

## The diagnostic question

> **How does a person know their action worked — and what to do if it didn't?**

It hits the two most common violations at once: a system that stays silent,
and an error that doesn't help. A full-screen walkthrough covers the rest.

---

## 1. The system is silent while something is happening

The most common violation: state changed, but nothing tells the person.

**What it looks like:**
- a click, and nothing changed — was the action accepted at all?
- an operation is running while the screen appears frozen
- data updated, but the person was looking elsewhere
- a disabled button — silent about why

**Diagnosis:** click everything, and after each press answer "what was I just
told?". No answer — violation found.

**Sneaky variant:** the result only appears after scrolling or navigating.
Formally there is an answer; in practice the person never saw it.

---

## 2. The interface speaks system language, not human language

Labels and structure reflect the internals, not the user's task.

**What it looks like:**
- internal jargon, error codes, code entity names in the text
- order and grouping mirror the data model, not the action's logic
- an icon that makes sense to the developer but not the user

**Diagnosis:** reread every label on the screen in a row and mark the ones
that require knowing the internals.

---

## 3. The person cannot leave or undo

Ended up in the wrong place — and there is no way out.

**What it looks like:**
- an irreversible action goes through without confirmation
- a reversible one asks for confirmation (slows the normal path and trains
  people to hit "yes" without reading)
- a modal with no visible exit
- a long operation with no way to interrupt

**Principle:** undo is almost always better than confirmation — it doesn't
block the normal path and saves you from accidents. Confirmation only for
irreversible actions, and it should name the consequence ("12 records will
be deleted"), not "are you sure?".

---

## 4. The error states a fact but doesn't help

The person learns something went wrong — but not what to do.

**What it looks like:**
- "Something went wrong"
- an error code with no explanation
- "failed" with no next step
- an error surfacing after form submit, though it could have been caught
  at input time

**Formula:** what happened → what to do → what happens next.

**Better — prevent it:** a field accepts only one format — validate at
input time, not after submission.

---

## The other six — rarer, but keep them in mind

- **Consistency:** the same action looks and is called the same everywhere
- **Error prevention:** better to make the mistake impossible than to
  report it beautifully
- **Recognition over recall:** don't make people hold in their head what
  can be shown
- **Flexibility:** a fast path for experienced users — shortcuts, repeat
  last action
- **Minimalism:** every extra element steals attention from the needed one
- **Help:** if an explanation is needed, it lives next to the action, not
  in a separate section

---

## How not to turn this into a ritual

Working cycle: the one question above per action + a full-screen walkthrough
when something "behaves strangely".
