# Case study: a foundation built under load

Real project: a native macOS app, ~12,000 lines of interface, one developer
and an agent. The product worked and was in daily use.

Contents: the starting mistake → what was missing → what was built → what
surfaced → the cost → what would be done earlier.

---

## The starting mistake

The task was framed as: **"I'll make new mockups, hand them off for
development — and it'll all go."**

The first redesign was abandoned. The diagnosis survived in a commit on the
broken branch:

> Logic is fixed nowhere, markup was done by guessing, the result is
> unsatisfactory.
> Tokens were redefined and partially rolled back — the palette is
> contradictory.
> Density and type sizes were picked by eye.
> They checked with a build, not a live app.

Three causes were extracted — **and none of them is about mockups**:

1. With no fixed logic, every markup decision was made on the fly.
2. With no value system, numbers lived one by one and never added up.
3. With no live check, "it compiled" stood in for "it works".

---

## What was missing

By maturity the product was late-stage; by structure, early-stage:

| Layer | Fact |
|---|---|
| Behaviour contract | did not exist |
| Value system | 17 distinct spacings, 13 radii — a list, not a scale |
| Components | 9 reusable elements smeared around, some duplicated |
| Screens | 12,000 lines |

Screens were built without the first three layers. It worked until the time
came for a systemic change.

---

## What was built, in what order

1. **Behaviour contract**: two documents — entities (fields, states, rules)
   and scenarios (entries, steps, branches). Plus a rule: update them in the
   same commit as the code.
2. **Value system**: scales for spacing, radii, typography, durations.
   Derived by **measuring** the existing code, by frequency of use.
3. **Components**: one file per component, documentation inside the file, a
   state gallery.
4. **Showcase**: a screen where every component and token is visible live.
5. **Interface conversion**: 366 hardcoded values — 307 moved to tokens,
   59 marked as justified exceptions.

---

## What surfaced (the main value)

### Blind rounding would have broken the layout

Preliminary calculation: only 43% of spacings landed on the scale
unchanged; the tail held 92, 56, 40, 36, 31. Mechanical rounding would
have turned 92 into 24.

It turned out large numbers come in **three kinds** — window positioning,
alignment against another element, and ordinary spacing. The first two
have nothing to do with the scale at all.

Conclusion: **count before editing** and **separate by nature, not by
appearance**.

### A live step was nearly cut

The value 20pt was judged "an intermediate between 16 and 24" and removed.
Measurement: it was the third most frequent, after 8 and 6. It was a
separate decision ("the field of a large card"), and removing it would
have shifted 11 places by a noticeable 4pt.

The step was restored.

Conclusion: **compress by measurement, not by feeling**.

### The system didn't follow itself

Inside the design system itself, 22 hardcoded values were found: components
had been copied byte-for-byte and the tokens were never used.

Conclusion: **test the system on itself**.

### A false exception lingered for a long time

The activity feed was marked "do not tokenize": fractional sizes 12.5 /
11.5 / 9.5 justified as "hand-tuned for density, rounding would loosen it".

The justification **was read in the author's comment but never checked**.
A live check: lines wrapped anyway because of a separate timestamp
element — the height is set by the wrap (~18pt), not the size, so saving
0.5pt bought nothing. The values moved onto the scale.

The difference from the 20pt case: there the step was **absent** (no
neighbour existed); here the value was simply **rounded to a neighbour**.
Telling them apart is only possible by measurement, not reasoning.

Conclusion: **an unverified explanation is a hypothesis, not a
justification**. Requiring a written reason is a filter — but a written
reason alone does not make an exception legitimate.

---

## The cost

Building the foundation took roughly as long as the entire redesign had
been budgeted. The redesign itself had not even started by then.

If the layers had been created on triggers at mid-stage, each would have
cost a few hours and blocked nothing.

---

## What would be done differently

**Not "start the design system from day one"**: on an empty project there
is nothing to measure — the scales would have been invented, then redone
when reality diverged from the guess.

**But this was worth doing:**

- The behaviour contract at the third screen (trigger П1 had fired long
  before — behaviour arguments kept repeating).
- The scale once the count of unique values passed a dozen (trigger З1).
- Mandatory live checks from the first visual bug tests didn't catch.

All three are cheap at trigger time and expensive when built under load.
