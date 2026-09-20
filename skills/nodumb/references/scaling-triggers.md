# When to introduce a shared layer

The thresholds below are heuristics from one real project, not universal
norms. First measure the actual volume, then adjust the threshold for the
language, framework, team and cost of a mistake. "Feels like it's time" is
not sufficient on its own: you need an observable repeat or an expensive
bulk edit.

Where possible, confirm the trigger by searching the code, not from memory.

## Contents

- behaviour contract
- value system
- components
- component showcase
- build-level layer isolation
- anti-triggers

---

## Behaviour contract

Triggers:

| Trigger | Sign |
|---|---|
| **B1** | "How is this supposed to work?" discussed twice about already-written code |
| **B2** | Three or more entities, each with states, transitions and edge cases |
| **B3** | A scenario passes through 3+ screens |

**What to create:** two documents — entities (fields, states, rules, where
the data lives) and scenarios (entry points, steps, branches, edge cases).

**Mandatory condition:** the documents update **in the same commit as the
code**. A document behind the code is worse than a missing one — people
refer to it and get a wrong answer.

---

## Value system

Triggers:

| Trigger | Sign |
|---|---|
| **V1** | More than 8 distinct values of one kind (count unique spacings, radii, type sizes) |
| **V2** | The question "why 14 here and 16 next door?" has no answer except "that's how it was" |
| **V3** | Changing one decision requires walking many places ("make all cards denser" = search across files) |

Count the unique values:

```bash
grep -rhoE 'padding\([0-9]+|spacing: [0-9]+' src/ | grep -oE '[0-9]+$' | sort -n | uniq -c
```

**What to create:** scales for spacing, radii, typography, durations.
**How to create:** only by measuring the existing code — see
`scaling-build-system.md`.

**Caution threshold:** if the project is still changing shape (phase 2),
the system is premature. The sign — screens being rebuilt wholesale more
often than once a month.

---

## Components

Triggers:

| Trigger | Sign |
|---|---|
| **C1** | Three places with the same element (two repeats are a coincidence, three are a pattern) |
| **C2** | A visual change requires identical edits in 3+ files |
| **C3** | A view file passed ~800 lines (a signal that self-contained pieces live inside) |

**Boundary rule:** a component **does not know the app's model**. The
moment a view touches domain types or storage, it's a feature, not a
component. Verified by grep, not taste:

```bash
grep -l 'YourModelType\|Store\b' src/components/
```

Empty — the boundary holds.

**What not to extract:** an element in a single place, even if it "looks
reusable". Hypothetical reuse is a bad reason.

---

## Component showcase

Triggers:

| Trigger | Sign |
|---|---|
| **S1** | A component was reinvented because the existing one was unknown (one case is already a trigger) |
| **S2** | More than 10 components — the list stops fitting in one's head |

**What to create:** a screen or page where all components and their states
are visible live. Not documentation — a showcase: working elements, not
pictures.

**Side benefit:** the showcase answers "which states need to be designed"
before the designing starts.

---

## Build-level layer isolation

Triggers:

| Trigger | Sign |
|---|---|
| **I1** | A second platform or a second app on shared code |
| **I2** | The layer boundary is violated regularly despite the agreement — you need a compiler, not persuasion |

Until the second platform appears, isolation as a separate module is
overhead with no payoff.

---

## Anti-triggers

Situations where a layer should **not** be created, however tempting:

- **"That's how big projects do it"** — their problems have not arrived.
- **"It'll be more expensive later"** — it will be, but right now there is
  no data for the right decision. An early system built on guesses gets
  redone wholesale.
- **"But it's pretty"** — structural symmetry doesn't pay for its
  maintenance cost.
- **Two repeats** — see К1.
