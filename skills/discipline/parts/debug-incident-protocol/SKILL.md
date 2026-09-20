---
name: debug-incident-protocol
description: >-
  Use when the user says: "doesn't work", "still broken", "hung/frozen", "disappeared after update", "used to work", "metric is zero but UI OK" — or when you need to investigate an incident, find the hang root cause, verify a process was actually restarted. Covers: facts before theories (storage/logs/PID), symptom vs root cause, silent failure by metrics, single consumer, restart ritual, hang localization via progress marker, timeouts, cache masking. Do not use for test writing (testing-discipline) and refactoring (agent-refactor-safety).
compatibility: >-
  any stack: processes, logs, DB, networks, tests
metadata:
  author: AGGG2.0 (t.me/aidvizhenie, t.me/hilartem)
---


# Debug & incident protocol: facts before theories, hangs

Distillation of debug and incident sessions. Source:
`docs/patterns/GLAV-PATTERNS.md`, blocks E (38-44), L.9-15, M.34/56;
`UNIVERSAL-PATTERNS.md` — "Hang Protection."

## 1. Core: facts, not opinions

1. **FACTS BEFORE THEORIES** — order: 1) config flags, 2) DB row, 3) log lines, 4) only then code-hypothesis. First incident report contains a fact, not an opinion.
2. **SYMPTOM ≠ ROOT CAUSE** — "minutes not deducting" — symptom; silent except + wrong parser — root cause. Trace call path to side-effect; fix root ONCE. One fix closes all surfaces.
3. **IF METRIC FLAT WHILE FEATURE "WORKS" — SILENT FAILURE** — UX success + zero metric = error swallowing. Look for except/early return on the metric path.
4. **SINGLE CONSUMER FOR EXCLUSIVE STREAMS** — long-poll/queue/lock file — one owner. Kill duplicates before start; health = exactly one PID.
5. **RESTART RITUAL IS PART OF THE FIX** — code on disk ≠ code in memory. After fix: stop all → start one → verify log. Check: PID creation time > edit time.
6. **ENCODING OF CONSOLE ≠ ENCODING OF PRODUCT** — mojibake in Windows console doesn't mean corrupted data. Check UTF-8 in client/file; don't "fix" data because of cp1251.
7. **INCIDENT CHECKLIST TEMPLATE** — recurring incidents → checklist, not heroics: flags? storage? logs? single instance? money path except? duration source? Checklist lives next to runbook.

## 2. Hang localization (UNIVERSAL-PATTERNS)


1. **"Can't hang" — not an argument.** Anything can hang: network without timeout, Read-Host, interactive prompt, infinite loop, GUI wrapper. Only proven by running with a timeout.
2. **Localize via progress marker, not last line** — marker ("Describing X", "=== stage N ===") printed at START of block → hung INSIDE last block with marker. No markers — add them.
3. **Progress — to FILE, not pipe** — `cmd 2>&1 | Out-File prog.txt`; pipe to tail can itself hang or lose tail on timeout kill.
4. **Isolate suspect BEFORE full run** — one block with small timeout (30-60s), not the full set with 900s.
5. **Tool API first** — `--help`/Get-Help one check; two failed attempts with guessed params = minus two timeouts.
6. **Chain A && B && C masks hang location** — separate stages: each command alone, its own timeout, its own marker.
7. **First suspect — infrastructure, not logic** — BeforeAll/dot-source/modules/network/interactive are more guilty than "instant" tests.
8. **Compare with last successful run** — git diff/file list: culprit is usually in the changes.
9. **Timeout — always and progressive** — small for suspect, increase only if operation is legitimately long.

## 3. Processes (Windows/Linux)

- **PID TRACE CHAIN** — tree: ParentProcessId → launcher → working directory. Don't look at PID without understanding who launched whom.
- **LOG TIMELINE CORRELATION** — log time vs file LastWriteTime: log older than edit = process not restarted.
- **STOP-ALL-THEN-START-ONE** — kill all old processes before starting new (two processes with one token = Conflict).
- **PROCESS CREATION TIME CHECK** — CreationDate < edit time = process on old code.
- **POST-RESTART LOG TIMESTAMP FILTER** — after restart, read only lines after start time (old Conflict in log ≠ current problem).

## 4. MCP failed at startup (disk-mount race) — new in 2.7

- **Symptom:** at harness start ALL MCP servers with paths on an external disk fail AT ONCE: python servers — "MCP error -32000: Connection closed" (process died immediately: script file not found), scripts — "ENOENT posix_spawn"; only servers independent of the disk survive (binary on the system disk, root in an env variable).
- **Root:** the harness started before the OS mounted the external disk (udisks2 mounts lazily at login; harness autostart wins the race).
- **Check:** harness process start time (`ps -o lstart`) vs mount time (`journalctl -k | grep mounted` — "EXT4-fs (sdb1): mounted"). The harness log may be in UTC — account for the offset when correlating with local time.
- **Before diagnosing:** run the server BY HAND — if it answers MCP initialize, the server is alive; the problem is the harness start environment, not the server. All servers failing at once + working individually = infrastructure, not server code.
- **Fix now:** restart the harness service — the disk is already mounted, everything comes up (opencode: `opencode2 service restart`, or close/reopen the TUI; the harness has no MCP retry — the failed status sticks).
- **Prevention (industry):** an fstab entry with `nofail` — the external disk mounts at boot, BEFORE login (udisks2 not involved); or systemd `RequiresMountsFor=<path>` on the harness unit. Gotcha (verified when installing the fix): a mount unit from fstab enters local-fs.target, and `systemd-tmpfiles-setup` (which creates `/run/media`) runs `After=local-fs.target` — the per-user subdirectory (`/run/media/<user>`) is created by udisks2 only at login, and systemd creates only the last path component. Fix: a drop-in with `[Mount] ExecStartPre=/usr/bin/mkdir -p /run/media/<user>`.

## 5. Capture phase: record the failure BEFORE retrying (3.0)

Blind retry = a second run with no new information. Before repeating, capture (~30s): task/goal, error (type/message/stack), last successful step, last failed command, recurring pattern, context pressure, environment assumptions (cwd, branch, service, files). Rule: 2+ retries without new information — stop, capture, change approach.

## 6. Stuck patterns: Repeater / Wanderer / Looper (3.0)

Repeater (same step again) -> stop: what changed? Nothing — change approach. Wanderer (drift that looks relevant) -> return to the problem statement, replan. Looper (2-3 step cycle, no progress) -> break: new information or escalate. "Stuck vs slow" separator = progress metric (movement toward the goal), not call count.

## 7. Recovery ladder: nudge -> replan -> escalate -> reset -> hand-off (3.0)

1. nudge — reread the error, progress marker. 2. replan — different hypothesis/tool/order. 3. escalate — docs/primary sources, subagent research, skill search by symptom. 4. reset — new context/session without old assumptions (Capture preserves facts). 5. hand-off — to a human: facts, what was tried, hypotheses. Escalation is a normal rung, not failure.

## 8. ACH: >=2 competing hypotheses, refute-first (3.0)

Multi-factor incident -> at least 2 hypotheses, for each write WHAT WOULD REFUTE IT; test refutations, not confirmations (confirmation-bias defense). Quick incidents with an obvious root cause skip this.

## 9. Postmortem after resolution (3.0)

1. Summary (id/date/severity/one-sentence what happened). 2. Chain: agent/tool, input, failing action, real side effect. 3. Artifacts: session id, trace, approval mode, config (hard to fill = observability problem). 4. Localization: containment vs permanent fix. 5. Root: cause + amplifiers + which gate failed + layer (policy/permissions/memory/observability). 6. Lesson into canon: canon/skill/CHANGELOG.


## Checklist

- [ ] facts collected (config flags → DB row → log lines → code hypothesis)
- [ ] process really restarted (PID creation > edit time; fresh log lines after restart)
- [ ] cache excluded (bytes actually served)
- [ ] disk-mount race excluded (harness start time vs disk mount time)
- [ ] output: fact + root cause + one fix + smoke
