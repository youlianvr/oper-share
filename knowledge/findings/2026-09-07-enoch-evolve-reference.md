# Reference read: Enoch evolution system (2026-09-07)

Owner decision: clone + analyze under the agent-learning audit; self-check
untouched (owner explicitly said self-check is about orchestrator patch
integrity — do not extend it). Clone: `tools/enoch` (our-ark/enoch, Apache-2.0,
Python; 23★ — reference, not a tool).

## The architecture idea worth stealing

Enoch's `evolve` is a **governed selection pipeline**, not self-modification:

```
conversation turns + task event histories
    → semantic evidence scans → durable evidence
    → candidate synthesis / brainstorm drafts → candidate pool
    → bounded curation → human approve/remove
    → archived handoff record → normal task → worktree → commit → PR
```

Modes: `disabled` / `co-evolve` (default: agent recommends, human decides) /
`auto-evolve` (adds scheduled synthesis — still does NOT bypass human approval
for execution). Authority to modify the running software body stays with the
human at every mode.

## Key design rule: evidence ≠ candidates

An observation ("task progress disappeared after resume") is evidence;
"add a progress snapshot" is one candidate response. Keeping them separate:
evidence supports many future candidates; weak signals stay recorded without
becoming work; candidate rationale is auditable against original messages;
deleting a candidate does not erase what happened. Backlog items are excluded
(deliberately: backlog already represents work).

## Map to our agent-learning audit (2026-09-06 finding)

Our audit concluded: the framework covers model/harness/context layers, but the
missing piece is a **forced trigger to capture user corrections**. Enoch's
answer is exactly the missing mechanism — a durable evidence journal that
scans conversation turns + task histories and records observations WITHOUT
turning them into work, then a separate human-gated synthesis step. For Oper
that suggests: lessons/findings stay the candidate layer; what we lack is the
evidence journal + a periodic synthesis pass. Ideas stay in this doc — no
self-check changes without a separate owner decision (and self-check's real
job, per owner, is orchestrator patch integrity, not learning).

Also notable: `enoch.learn` = immutable published-skill snapshots with
structured applicability assessments (their analogue of our skill-library);
`enoch.skills` = catalog code. Conformance contract tests per provider — a
pattern our MCP-claims linter already embodies in cruder form.
