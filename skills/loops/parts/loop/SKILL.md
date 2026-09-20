---
name: loop
description: >-
  Load when the user asks for a repeating autonomous mode: "/loop 10 30m <prompt>",
  "/loop 99 6666 <prompt>", "work cycle after cycle", "keep going until it's done",
  "continue on your own, don't stop", "find new solutions turn after turn",
  "infinite loop", "autonomous until the result". Each iteration is a full work
  cycle (re-contextualize → database → research → action → verify → findings in
  research.db → checkpoint), the next iteration starts with a NEW angle or
  hypothesis, and the agent makes its own decisions. Stop: N iterations / M minutes /
  a readiness criterion / 2 iterations without progress. NOT for a single task
  (task-cycle) or parallel orchestration of one task by subagents (fable-loop).
license: Proprietary
metadata:
  author: AGGG2.0 (https://t.me/aidvizhenie)
  inspiration: "omp /loop and /goal (can1357/oh-my-pi), ByBrawe/opencode-loop, disler/infinite-agentic-loop — loop mechanics; rules and text are our own"
---


# loop — repeating autonomous iterations

The agent does not "answer and stop": it goes iteration after iteration — a full
work cycle → findings and a checkpoint in research.db → immediately the next
iteration with a new angle. It stops only on explicit criteria, not out of the
habit "answered — enough".

## Invocation format

```text
/loop [N] [M] [prompt]
```

| Argument | Rule |
|---|---|
| N | number of iterations (integer). Not set — default **5** |
| M | minute limit (integer or with `m`/`h` suffix). Both N and M set — stop at whichever comes first |
| prompt | task/goal, rest of the line. Not set — **continue from the last checkpoint** |

Examples:

```text
/loop 10 30m run an audit and close findings one by one
/loop 99 6666 invent improvements and ship them turn after turn
/loop improve CI                      # N not set → 5 iterations
/loop                                # continue from the last checkpoint
```

## When to use / NOT to use

**Use:** the user explicitly asks for a loop; "do N iterations";
"keep going until it's done"; a series of sequential improvements where
each next step depends on the previous result.

**NOT to use:** a single task — the `task-cycle` skill;
parallel decomposition of ONE task by subagents — `fable-loop`;
a trivial request — just do it without loop mode.

## Workflow

**0. Initialization (once).**

1. Create a task in the journal: `tasks.py add "<prompt>" --tags loop`.
2. Write the start checkpoint (format below) with the plan for the first iterations.
3. Record the start time: `date +%s` (for the M limit, not by feel).
4. Define the readiness criterion: what must be visible at the end
   (green tests, N findings, empty backlog, a concrete file/state).
   If the criterion cannot be formulated — ask the user before iterating.

**1. Iteration (repeats).** Each iteration is a compact CYCLE:

1. **Iteration angle:** one phrase — what this iteration does and HOW it
   differs from the previous one (new hypothesis, other source, other tool,
   other order). Repeating the previous iteration is forbidden.
2. **Database:** `findings.py search` on the iteration topic — what we already
   know, so we don't repeat or argue with our own conclusions.
3. **Action:** research per the step type → edits/experiment →
   **verification** (linter/tests/live; "it built" ≠ "it works").
4. **Findings:** `findings.py add` — what you chose, why, what you rejected,
   links. Every accepted decision goes into the database: iterations without
   findings are wasted iterations.
5. **Checkpoint delta:** `findings.py add --tags "loop checkpoint"` —
   format below (short, only non-obvious).
6. **Summary to the user:** 1-2 lines — iteration X/N done, what was done,
   what's next.

**2. Transition to the next iteration.**

- Progress exists → the next iteration develops the previous one (the next
  finding, the next plan step).
- No progress for 2 iterations in a row → **change the angle** (another
  hypothesis, another source, another tool), do not hammer the same thing a
  third time (CYCLE.md rule: an error twice = change the method).
- Before starting an iteration, check the limits: iterations done ≥ N? Minutes
  elapsed ≥ M (`date +%s` against start)? Readiness criterion reached AND
  verified? Yes → phase 3, no → iterate.

**3. Stop and final.**

1. `tasks.py close <id> --result "<one-two line summary>"`.
2. Final report to the user: what was done across all iterations, what remains,
   how to continue (`/loop` with no arguments — from the last checkpoint).
3. Stop always with a named reason: which criterion exactly fired.

## Progress detector & retry policy (AGGG 3.0)

- **Repeat fingerprint:** hash (step+result) per turn; 2 identical turns with no new information = stop criterion -> change angle.
- **Retries by class:** validation/auth/permanent -> STOP; 429/timeout -> 2-3 retries with backoff+jitter; safety/irreversible -> owner confirmation; everything else -> 1 retry.
- **Budgets:** turns/minutes + token hygiene + money on expensive operations — exceeding any one = stop with reason.


## Checkpoint format (for research.db, --tags "loop checkpoint")

```text
loop: iteration X/N (or X iterations, M min)
done: <what this iteration completed>
decisions: <what you chose and rejected, one line>
next: <the next iteration's angle — one line>
files: <what changed>
```

~100 words limit. The checkpoint is the fuel of resumption: `findings.py search
loop` must restore context after a session restart.

## Success criteria

- N iterations (or M minutes) completed, each with a finding and a checkpoint
  in research.db (check: `findings.py search loop` — records ≥ N+1).
- Or earlier: the readiness criterion reached AND verified by a check
  (not claimed in words).
- Each iteration differs from the previous one — visible from the checkpoints.
- Stop always with a reason; the task closed in tasks.py.

## Failure modes

| Symptom | What to do |
|---|---|
| Repeats the same iteration | The angle-change rule after 2 no-progress iterations — apply, don't discuss |
| Context running out (>50-60%) | Don't start a new iteration: checkpoint + tell the user "say /loop — I'll continue from the checkpoint" |
| User doesn't see progress | 1-2 line summary after EVERY iteration — mandatory, not optional |
| Stopped without a reason | Stop only by phase 3 criteria; the reason goes in the report |
| Decisions not recorded | Every iteration must leave a finding; otherwise knowledge dies with the context |

## Gotchas

- Keep the iteration counter EXPLICIT in every checkpoint (iteration X/N) —
  from memory the agent errs in both directions.
- Minutes — by `date +%s`, not by felt time.
- Expensive/irreversible/outward-facing actions — user confirmation even
  inside the loop (the irreversibility gate).
- Secrets — placeholders only, even in research.db.
- "Readiness criterion reached" — only after verification by a check;
  a green check that doesn't verify the feature is not done (fable-judge).
- Iterations don't have to be big: a small verified step beats a large
  unverified one.
- If the user writes `/loop 99 6666` — 99 iterations and 6666 minutes: a BIG
  autonomous mode. Checkpoints and findings are critical: without them
  everything is lost on context overflow.

## References

- One iteration's cycle and its phases — the workspace `CYCLE.md`.
- A single task without repetition — the `task-cycle` skill.
- Decision rules — the `fable-method` skill.
- Database and findings (findings.py, tasks.py) — `DB-FIRST.md` in the root.
- External mechanics analogs: omp `/loop` (dumb resubmit) and `/goal`
  (objective + token budget) — omp.sh/docs/slash, omp.sh/docs/goal.

