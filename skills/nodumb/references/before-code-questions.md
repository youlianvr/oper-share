# Questions for working through a task

The point of the walkthrough is to not mix up the **task** and the
**proposed solution**. People usually bring a ready answer, not a
question — that's expected: they've already thought about it. But an
answer can only be judged through the task behind it.

Pick only the questions that have no answer yet — don't run the whole
list for the sake of ticking boxes.

---

## About the task

**What human need does this place serve?**
Speak from the user's perspective, not the system's. Not "note
synchronization" but "not losing a thought that came away from the
computer".

**When does the person land here?**
What happened before. It often turns out the real problem is one step
earlier.

**How do they live today, without this capability?**
- Not at all → the task is new, and demand may not exist at all.
- Via a workaround → the new solution must be noticeably more convenient
  than the workaround, or the person won't switch. "Slightly better"
  doesn't work.
- Via another tool → understand what satisfies them there, and don't make
  it worse.

**What happens if nothing is done?**
The most uncomfortable and the most useful question. It eliminates some
tasks outright.

---

## About the solution

**Does it treat the task's form or its symptom?**
Example: "add an undo button" may mean "the action is too easy to trigger
by accident" — and then the right solution is different.

**Could this be solved one level up?**
A different presentation of the data, removing a step, changing what
happens earlier. The cheapest solutions usually live there.

**How is this solved in products where the task works?**
Not for copying — to see the shape. Sometimes everyone solves it
fundamentally differently, and it's worth understanding why.

**What do we give up by choosing this?**
Every choice has a price: complexity, irreversibility, closed paths. A
solution with no named price is half-thought-through.

---

## About the consequences

**What will survive a future redesign, and what gets thrown away?**
Logic and behaviour rules survive. A concrete screen layout does not.
This determines where things should live.

**Which states will appear?**
Empty, loading, error, too many, name too long, no access rights. They
must be designed regardless — better now than when they surface in
production.

**What becomes irreversible?**
The data storage format, a public contract, behaviour people will get
used to. Such decisions get discussed separately — they are expensive to
change.

**How will we know it worked?**
A sign that can be observed. Not "it got more convenient" but "I stopped
opening a second window to do this".

---

## Signs the walkthrough isn't finished

- The "why" question gets answered by restating the solution in other
  words.
- You can't name what we are **not** doing this round.
- Every clarification adds new functionality.
- It's unclear who uses this and when — only "well, it might come in
  handy".

In these cases it's too early to write code: it would freeze an unmade
decision.
