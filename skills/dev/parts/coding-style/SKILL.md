---
name: coding-style
description: "Core principles for clean, maintainable, minimal code generation. Merged 2026-08-09 from coding-style.md + andrej-karpathy-skills.md + karpathy-coder + minimalist; extended 2026-08-15 with reviewed ponytail mechanics (DietrichGebert/ponytail, MIT) and the code-simplifier over-simplification guard (Anthropic claude-plugins-official). Enforces Karpathy's 4 principles (think before coding, simplicity first, surgical changes, goal-driven execution), the Minimalist Efficiency Ladder (YAGNI → reuse → stdlib → native → existing deps → one-liner → minimum code), clean-deletion rules, lazy-senior intensity levels (lite/full/ultra), trade-off markers, compressed output format, and a clarity-over-brevity guard against over-simplification. Use when writing, reviewing, or committing code; when the user asks for efficient code, fewer dependencies, YAGNI, 'don't overcomplicate', a 'karpathy check', or before claiming a diff is good."
---

# Coding Style — Code Discipline

> One merged skill for how to write code that stays minimal, surgical, and maintainable.
> Sources merged 2026-08-09: `coding-style` (core principles) + `andrej-karpathy-skills` (Karpathy)
> + `karpathy-coder` (4 active principles + tooling) + `minimalist` (efficiency ladder).
> Extended 2026-08-15: reviewed merge of `ponytail` (DietrichGebert/ponytail, MIT) —
> intensity levels, trade-off markers, root-cause fix, runnable-check rule, output format.

---

## 1. Do Only What's Asked

- Make changes that are **directly requested or clearly necessary**
- Don't add features, refactor, or make "improvements" beyond scope
- A bug fix doesn't need surrounding code cleaned up
- A simple feature doesn't need extra configurability

## 2. Karpathy's 4 Principles

> "The models make wrong assumptions on your behalf and just run along with them without checking... They really like to overcomplicate code and APIs, bloat abstractions, don't clean up dead code." — Andrej Karpathy

### 2.1 Think Before Coding
- State assumptions explicitly. If uncertain, ask. Don't hide confusion.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.

### 2.2 Simplicity First
- No features beyond what was asked. No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- **The test:** Would a senior engineer say this is overcomplicated? If yes, simplify.

### 2.3 Surgical Changes
- Touch only what you must. Clean up only your own mess.
- Don't "improve" adjacent code, comments, or formatting. Don't refactor what isn't broken.
- If you notice unrelated dead code, mention it — don't delete it.
- Remove imports/variables/functions that YOUR changes made unused.
- **The test:** Every changed line should trace directly to the user's request.

### 2.4 Goal-Driven Execution
- Define success criteria; loop until verified.

| Instead of... | Transform to... |
|---|---|
| "Add validation" | "Write tests for invalid inputs, then make them pass" |
| "Fix the bug" | "Write a test that reproduces it, then make it pass" |
| "Refactor X" | "Ensure tests pass before and after" |

For multi-step tasks, state a brief plan: `1. [Step] → verify: [check]`, etc.

### 2.5 Bug Fix = Root Cause (from ponytail)

A report names a symptom. Before you edit, **grep every caller of the function you're about to touch**. The lazy fix IS the root-cause fix: one guard in the shared function is a smaller diff than a guard in every caller — and patching only the path the ticket names leaves every sibling caller still broken. Fix it once, where all callers route through.

## 3. The Efficiency Ladder (Minimalist)

Before writing any new code, stop at the first rung that holds:

1. **YAGNI** — Does this need to be built at all? If not asked, don't build it.
2. **STOP QUESTION (mandatory for infrastructure/systems work)** — Does a *maintained external tool* already implement this at system level? If yes — STOP and say so plainly; recommend adopting it instead of building. This question MUST be run explicitly before porting any feature out of a reference tool/codebase into self-written infrastructure. Answering "we already have it half-built" is sunk-cost fallacy, not a justification. (Blood lesson 2026-09-11: hiveproxy, ~6.4k lines, reinvented OmniRoute's documented core for months while the reference repo sat in the workspace — knowledge/wiki/lessons/2026-09-11-reinvented-wheel-hiveproxy-vs-omniroute.md.)
3. **Reuse** — Does it already exist in this codebase? Find and reuse it. Look before you write; re-implementing what's a few files over is the most common slop.
4. **Standard Library** — Does the stdlib do this? Use it directly.
5. **Native Platform** — Does a native platform feature cover it? Use it (`<input type="date">` over a picker lib, CSS over JS, DB constraint over app code).
6. **Existing Dependency** — Does an already-installed dependency solve it? Use it. Never add a new one for what a few lines can do.
7. **One-Liner** — Can this be one line? Make it one line.
8. **Minimum Code** — Only then, write the minimum code that works.

Rules of engagement: no unrequested abstractions, no unnecessary dependencies, no boilerplate
(deletion over addition), question complex requests ("Do you actually need X, or does Y cover it?"),
shortest working diff wins — but only once you understand the problem.

**The ladder is a reflex, not a research project — but it runs *after* you understand the problem, not instead of it.** Read the task and the code it touches first, trace the real flow end to end, then climb. Two rungs work → take the higher one and move on. The first lazy solution that works is the right one — once you actually know what the change has to touch. **Never lazy about understanding: the ladder shortens the solution, never the reading.** Laziness that skips comprehension to ship a small diff is the dangerous kind — it dresses up as efficiency and ships a confident wrong fix.

Two stdlib options, same size? Take the one that's correct on edge cases. Lazy means writing less code, not picking the flimsier algorithm.

## 4. Delete Cleanly

- Avoid backwards-compatibility hacks (renaming unused vars, re-exporting types, etc.)
- If you're certain something is unused, delete it completely.
- Don't leave `// removed` comments for removed code.

## 5. Intensity (from ponytail)

Lazy-senior posture is the **default**: the ladder applies to every coding response. Switch only when the user explicitly asks for more or less.

| Level | What change |
|-------|------------|
| **lite** | Build what's asked, but name the lazier alternative in one line. User picks. |
| **full** | The ladder enforced. Stdlib and native first. Shortest diff, shortest explanation. Default. |
| **ultra** | YAGNI extremist. Deletion before addition. Ship the one-liner and challenge the rest of the requirement in the same breath. |

Example: "Add a cache for these API responses."
- lite: "Done, cache added. FYI: `functools.lru_cache` covers this in one line if you'd rather not own a cache class."
- full: "`@lru_cache(maxsize=1000)` on the fetch function. Skipped custom cache class, add when lru_cache measurably falls short."
- ultra: "No cache until a profiler says so. When it does: `@lru_cache`. A hand-rolled TTL cache class is a bug farm with a hit rate."

## 6. Trade-off Markers (from ponytail)

Mark deliberate simplifications that cut a real corner with a known ceiling (global lock, O(n²) scan, naive heuristic) with a `ponytail:` comment naming the ceiling and the upgrade path:

```python
# ponytail: global lock, per-account locks if throughput matters
```

This is a debt receipt: the next reader sees the corner was intentional and knows when to revisit it. Never apply to the trivially obvious — only to cuts that a reviewer would flag as a risk.

## 7. Output Format (from ponytail)

Code first. Then at most three short lines: what was skipped, when to add it. No essays, no feature tours, no design notes. If the explanation is longer than the code, delete the explanation — every paragraph defending a simplification is complexity smuggled back in as prose.

Pattern: `[code] → skipped: [X], add when [Y].`

Explanation the user explicitly asked for (a report, a walkthrough, per-phase notes) is not debt — give it in full. The rule is only against unrequested prose.

## 8. Never Simplify Away (from ponytail + code-simplifier guard)

The ladder stops at trust boundaries. Never simplify away:
- Input validation at trust boundaries
- Error handling that prevents data loss
- Security measures
- Accessibility basics
- Anything explicitly requested

User insists on the full version → build it, no re-arguing.

### 8.1 The Over-Simplification Guard (from claude-plugins code-simplifier)

Laziness has a ceiling: **clarity beats brevity**. Explicit code is often better than overly compact code. The ladder shortens the solution — it never justifies making the result harder to read, debug, or extend.

Never simplify to the point of:
- **Nested ternaries or dense one-liners** — prefer `switch` / `if-else` chains for multiple conditions; a readable 10-line block beats a clever 3-line chain
- **Overly clever solutions** that need decoding at 3am — this is the same trap as over-engineering, just on the other side
- **Removing helpful abstractions** that improve organization — abstraction is debt only when single-use; a name for a real concept is not boilerplate
- **Combining too many concerns** into one function just to shorten the file
- **Prioritizing "fewer lines" over readability** — line count is a proxy, not the goal; the goal is the smallest diff that is still *obvious*

Balance check (applies to every lazy diff):
1. Is it smaller AND at least as readable? → keep it lazy.
2. Is it smaller but harder to follow? → keep the readable version.
3. Would a reviewer need a comment to decode my "elegant" one-liner? → if yes, it isn't lazy, it's a bug farm.

## 9. Every Lazy Change Leaves a Check (from ponytail)

Non-trivial logic (a branch, a loop, a parser, a money/security path) leaves **ONE runnable check** behind — the smallest thing that fails if the logic breaks: an `assert`-based `demo()`/`__main__` self-check or one small `test_*.py`. No frameworks, no fixtures, no per-function suites unless asked. Trivial one-liners need no test — YAGNI applies to tests too.

## 10. Enforcement

When reviewing or generating code, ask:
1. Is this change directly requested? → If no, don't do it
2. Is there a simpler way? → If yes, use it
3. Am I planning for the future? → Stop. Handle the present.
4. Would I need this abstraction again? → If unsure, don't create it.
5. Did I walk the Efficiency Ladder? → YAGNI → reuse → stdlib → native → existing deps → one-liner → minimum code
6. Does every changed line trace to the request? → If not, cut it.
7. Is the fix at the root, not the symptom? → Grep callers before editing the function.
8. Did I mark the deliberate corner with a trade-off comment and leave one runnable check? → If not, add them.

## 11. Tooling (from karpathy-coder)

Stdlib-only Python tools in `scripts/` — run with `--help`:

| Script | What it detects |
|---|---|
| `complexity_checker.py` | Over-engineering: too many classes, deep nesting, high cyclomatic complexity, unused params, premature abstractions |
| `diff_surgeon.py` | Diff noise: lines that don't trace to the stated goal — comment changes, style drift, drive-by refactors |
| `assumption_linter.py` | Hidden assumptions in a plan: unasked features, missing clarifications, silent interpretation choices |
| `goal_verifier.py` | Weak success criteria: vague plans without verifiable checks, missing test assertions |

## 11a. Complexity Budget (canonical home since 2026-09-11)

This skill is the canonical home of the complexity budget (rescued from the
archived docs/Quality.md). The checker presets in
`scripts/complexity_checker.py` are the numbers — no parallel doc copy:

| Preset | fn lines | file lines | cyclomatic | nesting | imports |
|---|---|---|---|---|---|
| strict | 30 | 300 | 5 | 3 | 10 |
| **medium (default)** | **50** | **500** | **8** | **4** | **15** |
| relaxed | 80 | 700+ | 12 | 5 | 25 |

Exceeding the budget = justified and marked, or split the unit.
Run: `python scripts/complexity_checker.py <path> --threshold medium`.

## 12. References

- `references/karpathy-principles.md` — source quotes, deeper context, when to relax each principle
- `references/anti-patterns.md` — 10+ before/after examples (Python, TypeScript, shell)
- `references/enforcement-patterns.md` — hooks, CI integration, team adoption
- `references/ponytail-source.md` — original ponytail SKILL.md (MIT), merged 2026-08-15

When to relax: for trivial tasks (typo fixes, obvious one-liners) use judgment. The principles
matter most on non-trivial implementations (>20 lines changed), code you don't fully understand,
multi-step tasks with unclear requirements, and anything reviewed by humans.
