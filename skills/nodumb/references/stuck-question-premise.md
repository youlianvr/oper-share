# Checking the problem statement

New data didn't help — so suspicion falls on **the statement itself**.
Debugging is searching for the answer to a question that may have been
formulated wrong.

Signal: the observations each make sense on their own, but don't add up
together. Usually there is a premise underneath that seemed obvious and
so was never checked.

---

## Five checks of the statement

### 1. The right symptom?

What exactly is observed: what here is **fact**, and what is already
interpretation? "The button doesn't work" — does it not respond to
clicks, does the handler not fire, or does it fire but the result isn't
visible?

A good half of dead ends come from fixing the wrong symptom.

### 2. The right code?

- Does this branch even execute? A log on the first line answers
  instantly.
- Is there a second implementation: an old one, a copied one, an
  overridden one?
- Isn't a **different build** being checked than the one being edited?
  A classic: edits go to one instance while another is tested.

### 3. The right place?

- Doesn't the problem show up **earlier** in the flow — at data
  retrieval, not at display?
- Does the symptom disappear if the suspect section is bypassed?

### 4. Is this even a bug?

- Maybe the system works as designed and the expectations are wrong?
- Is there a recorded rule for how it should be? If not — settle that
  first, don't fix.

### 5. Does the problem dissolve at another level?

The most expensive class of dead ends: fixing something that shouldn't
exist.

- How do products where this is solved approach it?
- Are we forcing the system to do what it isn't built for?
- Would the problem disappear with a different data layout?

---

## Signs of a wrong statement

- **The fix works, but why is unclear.** The model is wrong; it will
  break again.
- **Every fix breeds a new problem nearby.** Symptoms run in circles —
  the cause is elsewhere.
- **It doesn't always reproduce.** Almost certainly order, timing or
  state — but the search is in the logic.
- **"That's impossible."** It's possible. Exactly the premise that
  seemed indisputable is wrong.

---

## When the statement didn't hold up

Don't rush to a new hypothesis. First:

1. **Record what exactly turned out to be wrong** — otherwise you'll be
   back at that premise within the hour.
2. **Look at what else rested on that premise** — usually more than one
   assumption sits under it.
3. **Restate the problem out loud.** If the wording didn't change after
   the finding, the finding wasn't absorbed.
