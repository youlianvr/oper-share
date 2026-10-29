---
name: detect-and-break
description: Use when a long task has drifted into a frame the agent built for itself and stopped serving the owner's goal, even though each step checks out — endless sub-proofs of one component, polishing one property past the point it matters, re-planning a plan instead of delivering, or building tools for the tools. Also use when the owner asks what the work is for, says it went in circles, or says the agent lost the point. Not for ordinary debugging, where repeated attempts at one bug are expected.
---

# loop-breaker — leave a self-made frame

## What the loop is

It is not repetition. Each step is correct on its own terms, and that is the
trap:

1. The task starts from a goal the owner stated.
2. The agent finds a sub-problem inside it that can be checked, and checks it.
3. Passing the check reveals a neighbouring sub-problem, which gets checked too.
4. After some hours the agent is working inside a frame it created: the
   checks now answer questions nobody asked, and the goal is no longer the
   thing being measured.
5. The owner watches progress that does not reach them and asks what it is for.

Neither the model nor a passing test sees this from inside, because the
checks keep passing. The signal is that the work is accurate and the product
has not moved.

## How to tell (judge meaning, not counts)

Do not count keywords or mentions. Ask these questions about the recent work:

- **Who would use the result of this step?** If the honest answer is "only me,
  to check myself", the step is inside the frame.
- **Did the owner ask for this sub-problem, in this turn?** If the agent chose
  it, the owner has not yet judged whether it matters.
- **Did the last result change what the owner can do?** If not, the last two
  or three steps were proof, not delivery.
- **Are the owner's own recent messages pointing somewhere else?** Owners
  usually say it first as a short question: "what is it for", "where is the
  benefit", "you went off into the weeds".
- **Did this pass refute the pass before it?** A pass that ends with "my
  previous diagnosis was wrong", "the finding did not reproduce" or "my probe
  was built incorrectly" has not advanced the product. It has been measuring
  the instrument. That closes the seam, it does not open the next one.
- **Where did the requirement come from?** For the property currently being
  proven, find the owner's own words that asked for it. If the only place it
  appears is a plan, spec or checklist the agent wrote — especially one marked
  "owner decisions" or "approved" — the agent is serving its own requirement.
  This is the strongest signal of the four, and the one that survives approval.
- **Does every gate carry a priority the owner set?** Take the plan's exit
  conditions and check what order they were given in. Gates about internal
  properties — durability, atomicity, completeness, coverage, "no duplicate
  events" — usually have no priority at all, and that is how they end up first.
- **Has the owner restated the goal in his own words?** He does it short, in his
  own language, without technical terms, often with irritation ("where is the
  benefit", "I want a finished project", "just show it on screen"). Treat it as
  a reset of priorities, not as one more input to the current stage. Do not
  turn his sentence into a quoted top line: a quote becomes another document
  that can drift. Re-order the work instead.

If two or more of these point inward, treat the loop as likely.

## How a plan degrades

Four steps, and each one looks correct from inside:

1. The owner asks for an outcome in plain words.
2. The agent turns it into a document with stages and exit conditions, then adds
   a few conditions the owner never named, because they are good engineering.
3. The owner approves the document and says "ask nothing more". From then on,
   the document speaks for him, and the added conditions are mandatory.
4. Each condition needs proof; each proof reveals a neighbouring condition; the
   owner's original sentence is no longer anywhere in the loop.

The tell is asymmetric: the plan keeps growing and the deliverable does not
move. The owner then restates the goal, which arrives looking like one more
input to the current stage.

## The break

0a. **Re-derive the requirement from the owner, not from the plan.** Quote the
   owner's sentence that asks for this property. If there is no such sentence,
   the requirement is the agent's own proposal: downgrade it to an open
   question for the owner and take it out of the exit criteria. A plan approved
   as a whole approves a document; it does not convert each of the agent's
   invented requirements into the owner's goal.
0b. **Set the priority before the proof.** List the gates and fix their order
   with the owner in one question: what serves the visible result, what waits.
   Work the highest first. A gate with no priority gets one question straight
   away — the owner's answer of 2026-10-26 was "ask at once", not "defer it".
   Do not invent a goal line for him and do not re-quote him into a document:
   the order of work is the mechanism, not another paragraph.
0c. **An answer to your own question is not a requirement.** Options the agent
   wrote and the owner picked ratify the agent's frame, not the owner's goal.
   When he answers a list like that with "the goal is a finished project, stop
   limiting yourself", stop the question list and restate the goal instead.
0. **Prove the instrument before the property.** Name the interpreter, binary,
   config and data the check runs on, and compare them with what the product
   itself runs on. A probe on a different interpreter, a scratch copy or a
   hand-built fixture measures the probe. If the two differ, that difference
   is the finding — report it and end the seam there, before any further
   proof of the property.
1. **Write the frame in one sentence**, in the chat: "I am working on X inside
   the frame Y, which I chose because Z." Writing it out is what makes the
   drift visible.
2. **Re-read the owner's goal verbatim** from the session or the request. If
   the frame is narrower than the goal, or is a different goal, the loop is
   confirmed.
3. **Ask the benefit question**: "If this sub-problem were fully solved
   tomorrow, what could the owner do that they cannot do today?" If the answer
   is "a stronger test" or "a cleaner record", the work is inward.
4. **Take one outward step**: a run on the real path, a result on real data,
   something the owner can look at or judge. Do this before more proof.
5. **Park the sub-problem** if it does not serve step 4 in one sentence. Record
   it as an open item for later, not as the current task.
6. **Ask the owner with `ask_questions`** when the next direction is a product
   choice (what to build, how much polish is enough). After a loop has been
   detected, the agent does not choose the direction alone.

## Rules

- A passing check of a sub-problem is a check. Report it as that, not as
  progress on the goal.
- Do not start a new proof, writer or test for a seam the owner did not name
  in this turn. Close what was named, then move on.
- When the owner has called a direction wrong, the next work starts from the
  owner's direction, not from the last plan file the agent wrote.
- Record a confirmed loop in the memory tree under `root/skill/loop-breaker` as a node
  with `outcome` and a pointer to the session, so the pattern is found next time.
- The break is short: name the frame, check the goal, take one outward step.
  Do not spend the turn explaining the loop at length.

## Two more signals from the same session, which the skill must catch:

- **Wrong thread, same drift.** On 2026-10-18 the owner asked why the *plan
  had drifted* and to read the current session. The agent opened a different
  thread (a workspace review) because it was easier to read. Answering the
  question that was asked comes first; a convenient neighbour is not the answer.
- **Lost context, repeated.** On 2026-09-24 the owner had to say twice that
  context was lost ("Стой, очень сильно потеря контекста"). Before any new
  step, re-read the owner's last decision and the plan; do not rebuild from
  the previous message alone.

## The workspace case, measured

OSTIS project, session `d55fbcb5-…`, 2026-10-02. This is the clearest case of a
requirement the agent authored and then obeyed as if the owner had ordered it.

**What the owner asked, at 00:11.** One sentence: make a plan for a full rewrite
so the project stops being a Frankenstein, ask any questions now, ask nothing
after approval.

**What the agent wrote at 00:39–01:25**, in the plan it authored:

- under "Confirmed owner decisions": "OSTIS is mandatory durable memory; no
  silent production SQLite/JSON fallback";
- under "Core contracts": "OSTIS is not presumed ACID or whole-storage crash
  atomic. Coordinated writer, stable operation IDs, completion markers,
  read-back and incomplete-batch recovery must be verified on the actual
  stack."

Neither sentence comes from the owner. Searched through every owner message of
that session, he never asks for crash atomicity, durability or recovery. The
agent put the requirement in, labelled it as the owner's decision, made it a
stage exit criterion, and then spent the next day satisfying it. Because the
owner had said "ask nothing after approval", nothing could reopen it: the plan
had become self-justifying.

**The cost.** From 16:25 to 22:10, eight owner turns and about 600 tool calls on
one seam, does a write survive a restart. Two consecutive passes ended by
refuting the pass before them — "both hypotheses disproven, the old
zero-after-restart could not be reproduced from the same saved bytes", then "my
diagnosis from the previous answer was wrong, my probes were built incorrectly".
No product surface changed that day.

**What the seam actually was.** Eleven days later the same symptom returned and
blocked the demo: `verified: false, arcs_found: 0`. Three commands found the
cause: the product's `.venv` had no `sc_kpm` and no `pip`, while the interpreter
on `PATH` had both. Through the interpreter the product uses, the graph read
`verified: true, arcs_found: 1`. A packaging gap in the venv, not durability.

Two lessons, in order of size: a self-authored requirement is the engine of the
loop, and a probe on the agent's own environment confirms it. Reproduce with the
host's session-log tool (`HOSTS.md`), writing the dump outside the project tree.

### The same session over two months

The full arc, because one day does not show the pattern:

- **2026-08-15, 17:55.** The owner stops the agent at the start: "why did you
  rush to define everything instead of me — that makes it your research, not
  mine". The agent agrees in words and promises the role split. It is the
  correct answer, and it does not hold.
- **2026-09-19, 21:38 and 21:43.** "I think we are far from the goal, you forgot
  something", "we are doing it wrong, we are going the wrong way".
- **2026-09-23, 01:39.** The goal is stated as a product: "by morning the agent
  must actually work for a non-professional".
- **2026-09-25, 12:03–13:05.** Six owner turns asking for one visible screen to
  photograph for schoolwork. The agent works on MCP instead; the owner swears
  twice before it opens a preview.
- **2026-10-09, 18:48 and 19:31.** "How did it happen that you have 'mission
  accomplished'?", "why are you writing just a couple of files, I thought this
  would be massive work".
- **2026-10-11.** Five commits in one day (03:57, 05:22, 21:17, 21:55, 23:58),
  each closing defects a read-only audit found in the previous one. On 2026-10-13
  the same panel still prints `verified: false`.
- **2026-10-12, 15:28.** The owner cancels everything: "only the talk now".
- **2026-10-18, 21:55.** He asks the one question that matters — "where does the
  drift come from?" — and the turn dies in dump parsing without an answer. He
  never asks again; the next message is "let's re-plan".
- **2026-10-25, 03:24.** "Ask 200 questions, you are sickening me with one
  question and deciding everything for me at once." His answers to the agent's
  own option list: "the goal of the plan is a finished project, stop limiting
  yourself", then "to hell with the steps", then "bro", then "enough".

The pattern the skill must catch: the owner's goal lives in his short sentences,
and the plan that outranks them was written by the agent. When he answers a
question the agent framed, the answer ratifies the frame, not the goal.

## Related

`challenge` (pre-mortem of a plan), `reflect`-style review of the whole
conversation, `verify`, `task-cycle`, `planning`.
