# Plan format

A plan earns its keep when, before any code, two things are visible:
where we're going and what it costs. If neither is visible, it's not a
plan.

## What goes in

1. **The task statement** — from the human, in one sentence. Doesn't
   fit? There are several tasks; split them.
2. **The chosen path and why** — plus, explicitly: which options were
   rejected. Without this it's unclear whether a choice was made at all.
3. **The sequence of steps** — each step verifiable, and after each one
   you can stop without breaking the product.
4. **Explicit boundaries** — what we don't touch, what we defer, what we
   don't decide even though it's visible. The most skipped and the most
   valuable item.
5. **Risks** — what specifically can go wrong, and what we do then. No
   risk? Say "none".
6. **The verification method** — how we'll convince ourselves. For
   visual work — live, with eyes, not with tests.

## What not to put in

- A list of files ("I'll fix A, B, C") — that's not a solution.
- A fan of options with no recommendation — that shifts the choice onto
  the user.
- "Quickly" and "a bit" without numbers — either digits or an honest
  estimate of scope.
- "While I'm at it, I'll tidy the neighbouring thing" — that's a
  separate decision; name it separately.

## Plan size

A plan grows with the cost of a mistake, not with the size of the task.

- Trivial — no plan, just do it.
- Ordinary — a few paragraphs: task, solution, steps, boundaries.
- Irreversible (data format, public contract, familiar behaviour) —
  detailed, with alternatives and the price of each.

A sprawling plan for a trifle is as harmful as no plan for something
important: it trains people to skim.

## After approval

- Deviated from the plan — say it out loud, even if the plan turned out
  to be wrong: the user learns before the result, not after.
- "Since I'm here, I'll tidy up" — never silently: that's unrequested
  scope.
- The plan is wrong — stop and re-play, don't finish it out of politeness.
