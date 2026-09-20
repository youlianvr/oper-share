# Postmortem of a stuck debugging session

When you get stuck, what needs reviewing is not the bug but **the method
used to fix it**. The bug is unique and won't return. The method will
return, guaranteed.

---

## What exactly to record

The concrete case is useless:

> "It turned out the value was stored elsewhere, so it rendered wrong."

That bug is gone for good; the record teaches nothing.

The valuable output is about process:

> "Of nine attempts, eight went into reading code. The answer was the
> first search result once we finally searched. Rule: go search on the
> second failure, not the ninth."

That records a method — and methods always reproduce.

---

## Three postmortem questions

### 1. What produced the answer — and why wasn't it first?

The answer almost always comes from an action that **hadn't been taken
before**: the first log, the first search, the first probe, the first
look at someone else's solution.

Key question: why was that action postponed?

### 2. What kept us on the wrong path?

Frequent culprits:

- **The check couldn't refute the hypothesis** — "verification" gave a
  green light no matter what
- **Other people's words taken as fact** — documentation, an article, a
  comment
- **False sense of control** — "one more edit and it's done" repeated in
  circles
- **Edit sprawl** — several things changed at once, and it's unclear
  what worked

### 3. What measurable signal would have stopped us earlier?

This is the main result of the postmortem. Not the conclusion "we should
have realized sooner" but a concrete counter: number of attempts, number
of user complaints, a specific signal type.

Without a number the rule is dead: the feeling of "everything under
control" holds exactly until the seventh attempt.

---

## Where to put the result

A postmortem with no storage address is lost work. Two addresses:

- **A rule** — where the agent will see it next time (memory, project
  instructions, a skill).
- **A case write-up** — the repository's docs, if the details are tied
  to a specific system.

A general rule (no language, framework or product named) goes into the
shared skill set. A project-specific one (with specifics) goes into the
project's memory. One criterion: **does the rule mention a specific
language, framework or product**.

---

## Anatomy of a working rule

A rule in three parts:

1. **Trigger** — measurable, fires mechanically
2. **Action** — concrete, not "be more careful"
3. **Cause** — which case it was derived from, so in six months it's
   visible whether it's stale

Without a trigger, the rule can't be recognized in the moment.
Without an action, it's a wish.
Without a cause, it can't be revised.
