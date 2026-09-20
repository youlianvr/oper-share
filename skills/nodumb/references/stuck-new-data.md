# Getting a new fact when reading the code is exhausted

When debugging is stuck, change not the hypothesis but **where the data
comes from**. Rereading the same file is useless: if the answer were in
it, it would have been found already.

Below — ways to obtain an observation instead of a guess, ordered by
cost.

## Observe, don't reason

**Log at the point of decision.** Place it not "around the function" but
exactly where the code decides between branches. Log what the choice
depends on.

If it's unclear where to put the log — that symptom matters more than the
bug itself: the flow is not understood.

**Dump the whole state, not one field.** People usually look where the
difference isn't. Printing the whole structure shows the divergence from
the model at once, not piecemeal.

**Order and timing.** Anything involving sequence, asynchrony and updates
almost always arrives in a different order than expected. Put timestamps
on and compare.

## Make the invisible visible

For interface and layout problems:

- **coloured fills** on containers — sizes and overlaps visible instantly
- **a border around** the "misplaced" element — often it is exactly where
  it should be, and the parent is shifted
- **numbers on screen** — coordinates, sizes, counters over the interface

Looks crude, but answers the question in one run. Remove afterwards.

## Isolation

Reproduce the problem in a minimal environment: a standalone file, an
empty project, a sandbox, a test page.

Both outcomes are informative:

- **Reproduced** → the cause is in this code, and it's now in 40 lines,
  not 4,000.
- **Did not reproduce** → the cause is in the environment: configuration,
  neighbouring code, state, a dependency version. The search shouldn't be
  here.

The second outcome is more valuable than the first, and reading code will
never yield it.

## Verify other people's claims

Any knowledge about the system not obtained from your own observation is
a hypothesis:

- documentation ("this method is called before rendering")
- articles and forum answers
- other people's comments in the code
- notes from past sessions
- your own memory of past behaviour

A probe of a few dozen lines checks it in minutes. An unverified
hypothesis costs hours of work in the wrong direction.

## Binary search over history

It used to work — now it doesn't. Don't look for the cause in the code;
**find the moment of breakage** through version history. It's a
mechanical operation, no reasoning involved.

The same trick within one state: switch off half the functionality until
the problem disappears.

## Compare with something that works

Find a place where the same thing **already works** — in your project or
someone else's — and compare line by line. The difference is the answer.

If the problem is solved in a known product — look at exactly how. Often
it turns out to be solved fundamentally differently, and "fixing" your
approach is pointless.

## Forbidden while stuck

- Rereading the same code again.
- Changing things at random "to see what happens": without a hypothesis
  it's a lottery, and random edits accumulate.
- Expanding the edit ("might as well rewrite this bit") — afterwards it's
  unclear what worked.
- Explaining why it should work. An explanation is not a fact, and it has
  already misled you twice — otherwise there'd be no stall.
