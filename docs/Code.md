# Code — Executing Work

> The domain document for doing the work: how a task is read, planned, verified
> and recovered. The task cycle itself is universal and lives in `AGENTS.md`;
> this file carries the procedure detail. Rewritten 2026-09-13 (owner-approved)
> from `docs/Workflow.md` + `docs/ERROR-PATTERNS.md`, both archived: the prose
> history is gone, the rules and their evidence stayed.

## Read Before You Change

- Never modify a resource before reading it; never change before understanding.
- Before editing shared code: its role, imports, callers, adjacent patterns,
  related tests and configs.
- Existing code first: reuse before rewrite, extend before replace. Wrong
  existing code is fixed in place — never forked into a "correct" copy nearby.
- Smallest possible change: no drive-by refactors, no style edits without need.

## Planning Discipline

- Non-trivial work: ordered steps before acting; every step has evidence and an
  exit condition. A step is not done until its evidence is known or its unknown
  is explicitly marked.
- Name the risks the change takes on — blast radius, hidden coupling, what
  breaks if the assumption underneath is wrong — before executing it.
- Scope drift mid-task (different files than planned, bigger blast radius,
  changed objective, new root cause) → stop, re-plan, re-confirm with owner.
- Decision Matrix for non-trivial choices: at least three viable alternatives,
  explicit trade-offs, then the decision — plus how to detect it is wrong.

## Verification

- Every change is checked: file edited → content; command run → result;
  config changed → validity.
- Escalate narrowly: focused test → related module → build/typecheck/lint →
  integration/manual. Report which rung was reached and why higher ones were
  not.
- "Looks correct" is not verification when an executable check exists.
- Verify with different eyes than the ones that produced the work: another
  source, another provider, another data type — not the same tool asked twice.
- Before a heavy build/check, run the fastest real smoke path first: dev
  server, app window, existing script.

## Field Traps

> Traps caught by mining session logs; each one recurred in practice before it
> was promoted here. Read before verification-heavy work — and recount before
> recording any count or verdict.

```
□ numbers recounted before recording (counts/quantities/percentages) — numeric drift
  (c56 "59/60 vs 60/61", c57 "~50 vs ~53", c59 "14/16 vs 13/15"; from c63 to c74 another
  ~8 instances: c64-c67 repeated, c68 "3 artifacts", c69 "4 vs 5", c71 stale verdict
  in the log, c74 "Artifacts (5) vs 6") — repeated 10+ times, class NOT closed
□ the fix itself does not introduce drift: after adding an artifact mid-cycle
  (new file/line) recount the counter in ALL artifacts, including the canon
  (c69 "5 artifacts after adding the ModelScope line", c74 "Artifacts (5)"
  stayed in the canon after adding CRON-REGISTRY — log/digest updated, source not)
□ exit code after a pipe catches the LAST command, not the first: `grep x | head; echo rc=$?`
  returns head's code (always 0), not grep's → phrase evidence as "0 lines printed",
  not "rc=0" (c68 pipe trap; does NOT replace checking the output)
□ `&&`-chains in verification scripts short-circuit: `a && b && c` silently
  stops at the first non-zero (grep=0 on a marker/wrong pattern) → checks b/c
  are NOT executed, "verification green" on an incomplete set; use
  `;`-separators or if/else (c97 first instance — receivers check skipped;
  c99 repeated — the whole chain broke after a 0-match on an em-dash in a
  heading; the "repeated" criterion met, sibling of the c68 pipe trap;
  promoted c99)
□ test run scoped: "N tests PASS" only with a file/subset list; a subset ≠ a
  full run (c56 "the suite", c58 "47 tests PASS" out of 2/~40 files)
□ output attributed by source: VERIFIED (independently confirmed) vs
  VERIFIED-AS-STATED (source's words, no official check) vs UNVERIFIED
  (c55 Kimi-K3, c61 Zhipu-as-fact, c62 Zhipu VERIFIED→VERIFIED-AS-STATED) —
  a bare VERIFIED from a forum post is an overclaim
□ edit after review → ALL artifacts synced (canonical / INDEX /
  heartbeat log / digest) — lesson #11 (c57, c59, c62, c74): a stale number
  must be zero everywhere, including the canon itself that the cycle documents
□ before recording, checked: does the file near-duplicate an existing canon
  (lesson #7) — merge into the existing one, not a new file
□ Windows console: printing Cyrillic requires
  stdout.reconfigure(encoding='utf-8') (cp1251 trap: cron ticker, recon probes) —
  3+ repetitions, class known; FROM 2026-08-03 a GLOBAL fix: PYTHONUTF8=1 in
  User env (kills the class at environment level; verify:
  python _scripts/_utf8_probe.py → utf8_mode: 1). reconfigure patches remain
  as insurance (they do not depend on the environment).
□ marker verification: grep the EXACT marker format as recorded in canon/INDEX
  (case, comma, backticks, **bold**) — an approximate pattern gives a false
  negative (grep=0) → a review round is wasted on self-check (c76 INDEX comma
  "r4 (c76,", c79 "## r3" vs "r3 (c79", c81 "## r2" vs "r2 (c81", c82
  bold/backticks in OWNED_ROOT_FILES attribution; c83 M4 case "Caught by" vs
  "caught by") — repeated 5+, class known (lesson c76, promoted c85);
  remediation: on grep=0 RE-READ the line from the file and copy the exact
  marker (do not paraphrase from memory)
□ json-shape crash-on-input: a `json.loads` result from a file/external input is
  NOT self-controlled — isinstance guard (list/dict) BEFORE `.get`/iteration
  (c83 proxy_router M4 image_url, c88 check_cron_health M1 jobs, c90
  check_provider_env M1 providers — 3+ verified instances in a day, class =
  "diagnostic code crashes on the very input it should diagnose"; fix:
  `isinstance(raw, list)` ~2 lines; promoted c91 ERROR PATTERN r6
□ str_replace/patch anchor is UNIQUE before editing: oldString occurs >1 time OR
  the context drifts (encoding/CRLF/spaces/my edits to foreign M-files) → the
  edit lands elsewhere or not at all (anchor-drift class, 9 ERROR_LOG entries
  07-31..08-04: patch×6 "stale context/anchor", tool×2 "too broad / not found",
  merge×1; close neighbour — the marker-verification checkbox, but there it is
  grep of the EXACT format, here — uniqueness of the EDIT anchor); fix: long
  anchor with surroundings + verify a single occurrence (grep -c) BEFORE
  str_replace; ERROR PATTERN r6 05.08)
□ desktop codebuff.com errors (402 Out of credits / 428 waiting_room_required) —
  NOT problems of the local proxy (check OmniRoute :20128 is alive); diagnostics: grep
  %APPDATA%/Freebuff/logs/orchestrator-stderr.log for statusCode 40|42 BEFORE
  blaming the proxy/cron; both isRetryable:false → do not blind-retry, [DEFER]
  to the owner (family canonized r5 c80; checkbox added c91 r6 — r5 did NOT
  touch Checklists, r5 artifacts = 4 without Checklists)
□ cwd before a command: npm/project scripts → project cwd (npm --prefix);
  carriers/diagnostics/canon → workspace root; mixing = FileNotFoundError
  or ENOENT on package.json (6 entries: fixes c24/c26/c28 did NOT close the
  class — 3 fresh 2026-08-02; r9 c73 ERROR PATTERN)
□ reading .env: redacted check only (name+length), NOT sed/cat over ranges —
  prints keys (2026-08-02 leak of *_KEY=...; section in
  secret-hygiene-baseline.md + cross-reference; r9 c73)
□ composited-browser verification: the browser cache serves OLD JS after an
  edit — "the old line is still in the render" does NOT mean "fix not applied";
  check disk + server first (curl), then the browser; fix: a fresh browser
  process (close → open = empty cache) or cache-busting (?v=), then a repeat
  render check (A4 21:40 research.js: dataHasOld=true with a new line on
  disk/server — after a clean restart dataHasNew=true, console 0)
□ code_search/ripgrep binary unavailable is NOT "no matches": when the
  vendored rg is missing/timed-out the tool answers with an error, and a
  grep=0 conclusion from it is FALSE (class: 6 ERROR_LOG entries 2026-08-14
  all [A1]: "ripgrep binary missing", "vendored ripgrep unavailable" ×2,
  "browser-role search", "ripgrep executable unavailable" ×2 — 5+ in a day);
  fix: fall back to bash `grep -rn` (shell rg) BEFORE concluding absence, and
  distinguish "tool error" from "no result" in the report
□ multiline Python / regex backslashes in heredoc commands: layers of
  JSON/heredoc/bash eat `\s`-style escapes and turn multi-line `python -c`
  into a syntax error (class: 6+ ERROR_LOG entries 2026-08-14/15 [A1]:
  "multiline Python passed incorrectly", "bounded probes ... backslash
  replacement/regex backslashes/non-raw Windows literals", "byte-repr probe
  syntax error"); fix: write the probe to a temp .py file and run it, or use
  raw strings r"..." + `\\s` when inline; verify by running, not by reading
```

---

## Heavy Commands (owner's machine, shared)

- Default: >5 min runtime or likely CPU/RAM/disk saturation → user-run.
  Estimate before running, not after the fan spins up.
- Rust/Cargo is heavy by default (check/clippy/test/build compile the crate
  graph): offer user-run first; agent-run only on explicit delegation, in
  background, with a stop path.
- User-run handover: exact command, cwd, expected duration, stop command,
  what output to paste back.
- Never silently wait on long compilation — poll with progress updates or
  hand over.

## Processes & Cleanup

- Anything launched (process, server, watcher, browser session) is mine until
  cleanup is verified. Before launch: PID/port, expected lifetime, safe stop.
- Abnormal load or a stuck process → reassess: poll, stop, or hand to owner.
- Never kill unknown/user-owned processes silently — report and ask.
- killall / mass-kill forbidden without explicit permission.

## Recovery

- Wrong conclusion or bad change discovered: stop, say what went wrong and
  why, revert if applied, re-plan with the new information.
- Never continue in a known-wrong direction; never hide an error.
- Rollback touching user data → owner confirmation first.
