# How to build a value system

A scale is not invented — it is measured off the code. Six steps, each born
from a concrete mistake. Typography gets its own section.

## Contents

- measure what exists
- compress values by measurement
- compute the cost before editing
- separate values by nature
- mark exceptions
- test the system on itself
- typography, separately

---

## 1. Statistics first

The scale is not invented: it is extracted from the project. Step one —
count which values are already used and how often.

```bash
# value frequency by kind
grep -rhoE 'padding\([0-9]+|cornerRadius: [0-9]+|spacing: [0-9]+' src/ \
  | grep -oE '[0-9]+$' | sort -n | uniq -c | sort -rn
```

How to read the result:

- **frequent values** — live steps, they already work;
- **rare ones next to frequent ones** — noise, compression candidates;
- **rare large loners** — probably not from this scale at all (see step 4).

A 4/8/16/32 scale "for beauty" shifts half the working interface for no
reason. The measurement takes minutes and justifies every step.

**Prevents:** a guess-based system that diverges from reality and gets
redone wholesale.

---

## 2. Compress by frequency

Intermediate values are removed — but each one is first checked by
frequency.

A value "between 16 and 24" may turn out to be the third most frequent in
the whole project. That's not noise, it's a separate decision — it cannot
be cut.

**Rule:** a step survives if it occurs noticeably more often than
neighbouring noise. The threshold is project-specific, but leaders usually
pull away by multiples.

**Prevents:** a cut live step that shifts dozens of places for no reason.

---

## 3. The cost, before editing

Before a mass replacement — a calculation: how many places change, by how
much, where the largest shifts are.

```
# calculation pseudocode
for each found value:
    nearest scale step
    shift = |step - value|
group by shift magnitude
```

The calculation reveals the invisible: blind application of the rule
breaks part of the cases, "same-kind" values turn out to be of different
natures, the scale itself is holey.

**Prevents:** a mass replacement that breaks the layout where the value
was meaningful.

---

## 4. Nature matters more than appearance

Visually identical numbers often have different sources:

| Nature | Example | Destination |
|---|---|---|
| Derived from the system | padding inside a card | onto the scale |
| Derived from another element | "icon width + gap" for alignment | a named constant next to the source |
| Unique to a place | popup positioning, margins around an image | leave as is |

Derived values are the sneakiest: they look like ordinary spacing but are
tied to a neighbouring element's size. Left as a number, they drift apart
when the element changes.

**Prevents:** stretching the scale over what doesn't belong to it — which
ruins both the scale and the place.

---

## 5. Exceptions — with an explanation

Every value not brought onto the system carries an explanation nearby:

```
// 92 — not a token: window positioning from the top of the screen.
```

**A silently left deviation is indistinguishable from a forgotten one.**
The next pass will either "finish" it and break things, or be afraid to
touch it.

**The flip side:** if no explanation gets written, the deviation is
unjustified and must be brought onto the system. Requiring a written
reason works as a filter.

---

## 6. Test the system on itself

After introduction — run the check over the system's own code.

A design system that doesn't use its own tokens; a linter with an
exclusion for its own code; a convention violated in its own description —
each undermines the rule entirely. Nobody cites it afterwards.

The only legitimate exception: the place where the values are
**defined**. The numbers have to physically live somewhere.

---

## Typography, separately

If the platform offers semantic text styles (roles, not points) — build
the scale on those, not on numbers. The reason is not aesthetic: semantic
styles follow the system's text-size settings, numeric ones don't. An app
with hardcoded sizes ignores the user's accessibility settings.

**But:** the actual sizes must be **measured**, not taken from
documentation. Platforms collapse adjacent steps differently, and two
"different" roles can turn out to be the same size. This needs to be known
before the mockup is drawn.
