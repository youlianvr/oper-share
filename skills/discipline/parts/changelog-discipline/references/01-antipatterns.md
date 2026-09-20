# Antipatterns

Ways to keep a changelog such that it exists but brings no value.

---

## 1. Reciting the diff

```
- Changed the saveNote() method
- Added the isCompleted field
- Updated the card component
```

**Why it's bad:** this is exactly what version history shows, and more
precisely. The entry adds nothing but the feeling that a changelog is
being kept.

**The right way:** write from the product. Not "the save method changed"
but "notes no longer write the file on every keystroke — saving happens
once per second after a pause".

---

## 2. A list of commits

Auto-generated from commit messages. The result is long, fragmented and
reason-free: twenty entries about one feature, each about an intermediate
step.

**Why it's bad:** the reader needs one entry about the decision, not
twenty about the road to it. Intermediate steps are noise.

**The right way:** one entry = one decision, regardless of commit count.

---

## 3. Filling it in before release

The changelog is written in one sitting an hour before the tag, from
commit history.

**Why it's bad:** the reasons behind decisions are already forgotten. What
remains is what can be reconstructed from the diff — that is, diff
recitation (see #1). The most valuable part — why this option was chosen
and what was rejected — is lost irretrievably.

**The right way:** write immediately after the change, while the reason is
still in your head.

---

## 4. Only "what", no "why"

```
- Search moved to the context menu.
```

**Why it's bad:** six months later it's unclear whether this was a
deliberate decision or an accident. Someone will "improve" it back and
step on the same rake.

**The right way:** add the reason and the rejected option:

```
- Search moved to the context menu. The first take was a hover popup,
  but the cursor never reached the button in time.
```

---

## 5. Skipping the "before" field

The release summary describes the new state but not the old one.

**Why it's bad:** the reader doesn't remember how it was. "The marker is
now visible immediately" is meaningless without "it used to appear only
after the first letter".

**The right way:** always record the previous behaviour. This is the only
place it will survive — it disappears from the code.

---

## 6. "A minor thing this time, I'll add it later"

**Why it's bad:** the rule only works as unconditional. One exception
turns the changelog into a selective one, and a selective one cannot be
trusted: you can't tell what's missing from it.

**The right way:** always write. A small fix gets a small one-line entry —
but it exists.

---

## 7. Technical language where product language is needed

```
- Refactored the persistence layer with a migration to batched writes
```

**Why it's bad:** it describes the means, not the outcome. Six months
later it's unclear why it was done and what changed for the user.

**The right way:** outcome first, means second:

```
- The app stopped lagging on fast typing — disk writes are now batched,
  not one per change.
```

---

## 8. Missing "where"

The entry describes the change but never says where to look.

**Why it's bad:** six months later, finding the right place starts from
zero.

**The right way:** list the affected files and areas. A cheap line that
saves half an hour.
