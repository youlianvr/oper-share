# Project phases

This is not a maturity ladder and not a mandatory order. A project can be
in several phases at once; take only the layer whose absence already
blocks the current task.

## Contents

- idea
- prototype
- the product accretes
- the product settles
- maturity
- how to tell your phase

The point of the division is simple: at each phase some things are needed
and others are wasted work. You can err in both directions — creating a
layer early or scrambling late — and both cost the same.

---

## Phase 0. Idea

What exists: a hypothesis, no code or throwaway code.

Mandatory: nothing. Early: values, components, contract documents — it is
not yet known which entities survive.

Worth pinning down: one paragraph on what work the product does for the
user — so there is something to check against later.

---

## Phase 1. Prototype

What exists: a working skeleton, one or two screens, all in a couple of
files.

Mandatory: nothing. Repeats here are normal and even useful: until a
solution has repeated three times, you can't see what is common in it.

Early: extracting components after the second use — two cases don't show
the axis of variation, you'll extract the wrong thing.

Already worth doing: keeping logic separate from rendering. Not for
architecture's sake, but so the UI can be thrown away and rewritten
without touching the rest.

---

## Phase 2. The product accretes

What exists: 3+ screens, repeating elements, and review questions like
"how is this supposed to behave?".

Mandatory:
- **the behaviour contract** — a document with entities and scenarios
  (trigger С1);
- the first components — by trigger К1, not sooner.

Early: a full value system while the project is still actively changing
shape.

The sign it has arrived: two arguments in a row about the behaviour of
already-written code. This is not about code quality — it is about the
absence of a fixed decision.

---

## Phase 3. The product settles

What exists: the shape is clear, screens are no longer rebuilt wholesale,
"bring it all to one style" tasks appear.

Mandatory:
- **the value system** — by trigger З1;
- **components with a written contract**, not just extracted code;
- **live checks** as a mandatory step, not an option.

Too late when: the task "just drop in the new mockups" fails or drags.
The layer should have been created in the previous phase; now it is being
built under load.

Key point: at this phase the value system is **derived by measuring the
existing code**, not invented. The data is already there — count it.

---

## Phase 4. Maturity

What exists: several people or platforms, changes touch many things at
once.

Mandatory — everything from phase 3, plus:
- **the component showcase** — a place where what exists is visible
  (otherwise things get reinvented);
- **component documentation next to the code**, not in a separate
  document;
- **build-level layer isolation**, if there is more than one platform.

Only now can you introduce: style protocols, themes, token generation
from a design tool. Earlier — complexity with no load to justify it.

---

## How to tell your phase

Not by time and not by code volume, but by the questions that started
repeating:

| Repeating question | Phase |
|---|---|
| "What are we even building?" | 0 |
| "Does the basic scenario work?" | 1 |
| "How is this supposed to behave?" | 2 |
| "Why 14 here and 16 next door?" | 3 |
| "Do we already have one of these somewhere?" | 4 |

A repeating question is the signal that a layer is needed — one that
answers it once and forever.
