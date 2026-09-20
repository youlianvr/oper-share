---
name: freebuff-patch-check
description: >
  Freebuff Desktop patch registry and integrity check: the current
  orchestrator patch set (commit rule + ban removal, ask_questions
  multiSelect, mission passes are text-only), the MCP overlay checker, the
  Gate companion and the mandatory validation protocol after every Freebuff
  update. Use at session start, after a Freebuff Desktop update, on MCP
  failure, or when a patch is suspected lost ("no mcp", "patch lost",
  "promptaudit", "Freebuff restart"). Rewritten 2026-09-16 for 0.0.112: this
  file is the patch registry; `_memory/CORE.md` holds only the standing
  authorization. NOT a general startup ritual — session read order, inbox,
  inventory and proxy/provider health live in AGENTS.md, BOOT.md and
  docs/Infrastructure.md.
---

# FREEBUFF-PATCH-CHECK — patch registry and integrity

> Run: at the start of every session; after a Freebuff Desktop update; on MCP
> failure; when a patch is suspected lost. This is the single source of truth
> for the patch set — `_memory/CORE.md` duplicates only the authorization.

## Meta — authorization and freshness

**Authorization.** Calling this skill triggers only checks and read-only
diagnostics. Changing the installed Freebuff, credentials or managed processes
requires owner authorization: the standing authorization in `_memory/CORE.md`
covers the set in §2 — re-apply that set after any update without asking again.
Anything else (a new patch, a re-enabled retired patch) needs a fresh owner
decision. Never destroy: backups/trash only; no push/PR without a request.

**Freshness — priority #1.** Any environment change that affects the anchors,
markers, paths or scripts below (Freebuff update, core drift, new model/tool,
new reference copy) requires updating THIS FILE in the same pass. Order:
1. **Investigate first** — diff the new bundle against the reference copy,
   find where the code moved, confirm the cause. Never patch blind against
   stale anchors.
2. **Then update this file** — new version row, markers, scripts §2.
3. **Say it in the report** — what moved, where, what changed here.

**Keep current:** version/reference table (§1), markers (§2), script list (§2),
the retired list (§7).

## 0. Quick order (30–60 s)

```bash
python _scripts/check-freebuff-mcp-patch.py     # MCP overlay + mcp.json, read-only
grep -n "mcp-bridge\|Failed to load tools from MCP" \
  "C:/Users/pc/AppData/Roaming/Freebuff/logs/orchestrator-stderr.log" | tail
python _scripts/freebuff-gate-check.py          # Gate companion (relay/agent/proxy + serve-time shim)
python _scripts/integrity_check.py              # structure, deps, dangling refs
```

A PASS from these scripts is a static contract check, not a runtime health
claim. Present-tense capability claims need a successful live call.

## 1. Installed version and reference copies

```powershell
(Get-Item 'C:\Users\pc\AppData\Local\Programs\@codebufffreebuff-desktop\Freebuff.exe').VersionInfo.ProductVersion
```

Install engine: `%LOCALAPPDATA%\Programs\@codebufffreebuff-desktop\resources\orchestrator\orchestrator.js`.
Reference copies: `knowledge/freebuff-orchestrator/`.

| Copy | What it is |
|---|---|
| `orchestrator-0.0.112-patched.js` | **current reference** (sha256 `2109e0cc…`, 2026-09-16) — the §2 set applied, `bun build` exit 0 |
| `orchestrator-0.0.112-stock.js` | stock 0.0.112 as installed (sha256 `5894f84e…`) — the diff base for anchor drift |
| `orchestrator-0.0.102-patched.js` | previous reference; PARTIAL set (no §11, no §16b, no MCP-first, no ASK-limits) |
| `orchestrator-0.0.99/0.0.98/0.0.97/0.0.96/0.0.93/0.0.92/0.0.90/0.0.87/0.0.86/0.0.84/0.0.79/0.0.78/0.0.77*.js` | historical references |
| `system-prompt-0.0.76.md` | historical assembled-prompt reference (pinned to 0.0.76 — not proof of the installed version) |

**Rule: `cp` the stock bundle to a `*.bak-<version>-<date>` backup BEFORE the
first patch of an update** (the 0.0.102 backup was once mislabeled and the
stock original lost — ERROR_LOG 2026-09-10).

## 2. The current patch set (0.0.112)

Three patches. Every one of them: verify anchors first, backup, write, then
`bun build` exit code and markers. Order matters only for §2.1 → §2.2.

### 2.1 Commit rule + ban removal (`_scripts/freebuff-patches/patch-prompt.py`, then `patch-prompt-dont2.py`)

Why: an update restores the host bans — "Do not commit, push, or open a PR
unless…", "Run scripts without asking", "Treat anything outside of the project
directory as read-only". The workspace commits in small local units by default
and needs that to survive.

* `patch-prompt.py` job 1 replaces the host commit sentence with
  `Commit work in logical units as you complete meaningful steps — not every
  small change, but don't leave finished work uncommitted either. Never push to
  the remote repository or open a pull request without an explicit request from
  the user.` (its job 2 is dead on 0.0.99+ — the DO-NOT list carries escaped
  backticks; skip output `0 occurrences` is EXPECTED).
* `patch-prompt-dont2.py` extracts the whole `DO NOT do any of the following:`
  section from the bundle and rewrites it to three items (push caution,
  irreversible commands, package manager), asserting the bans are gone.

Markers: `Commit work in logical units` == 1, `Local commits are expected` == 1,
`Run scripts without asking` == 0,
`Treat anything outside of the project directory as read-only` == 0.

### 2.2 ask_questions multiSelect (`_scripts/freebuff-patches/patch-guidance.py`)

Why: options that are not mutually exclusive should be multi-select by default.
The question/option limits are NATIVE since 0.0.112 (`MAX_QUESTIONS = 5`,
`MAX_QUESTION_OPTIONS = 6`, prompt says "two to four concrete options") — the
old script's limit half is retired, the current script does one replacement:
`Set multiSelect only when several options can hold at once.` →
`Always set multiSelect when the options are not mutually exclusive \u2014 only
leave it off when exactly one answer is valid.`

Marker: `Always set multiSelect` == 1.

### 2.3 Mission passes are text-only (`_scripts/freebuff-patches/patch-mission-text-only.py`)

Why (owner decision 2026-09-16): a mission pass had two shapes — "skill + the
decider's addendum" or "plain text". The addendum did not work: at effort 4–5
`missionWriterRegime(effortForPass)` is false, so the target gate dropped the
decider's words and the pass arrived as the bare skill body — the prompt went
into the void. Verdict: keep only the plain-text shape.

Three points in `enqueueMissionInput`:
1. `target = missionWriterRegime(effortForPass) ? input.target?.trim() : void 0`
   → `target = input.target?.trim()` (the decider's words always survive);
2. the pass prompt is built from the decider's own words only — never the skill
   body: `prompt = (skillName ? target : input.text) && \`${skillName ? target : input.text}${epilogue}\`.trim();`
3. the queue row shows the text actually sent: `chatText: skillName ? prompt : null`.

The mission catalog is deliberately NOT cut: the decider may still name a
skill, naming it just no longer injects anything. A skill pick with no written
target is dropped as before.

Markers: `prompt = (skillName ? target : input.text) &&` == 1,
`target = input.target?.trim(),` == 1,
`chatText: skillName ? prompt : null,` == 1,
`prompt = (skillName ? skillBody && \`` == 0.

### 2.4 MCP overlay (`_scripts/check-freebuff-mcp-patch.py`)

Since the 0.0.5x update the orchestrator connects MCP servers natively from the
agent definition — vendor code, an update cannot break it. What CAN break is our
overlay in `~/.agents/freebuff-desktop-thread-local-v3.ts` (reads `mcp.json`,
applies `MCP_SERVER_DENY` + `APP_GATES`, resolves creds, carries the MCP-first
system prompt) and `~/.agents/mcp.json` itself. The checker covers both and
nothing else: it no longer inspects `orchestrator.js` at all (§11 retired).

`mcp.json` semantics it enforces: `command` = stdio, `url` = remote (a missing
`type` is NOT "stdio" — the template pins it:
`servers[name] = { type: c.type === 'sse' ? 'sse' : 'http', ...c, env }`), an
entry with neither is broken.

**Markers ≠ working wiring.** 2026-08-15 regression: both bridge markers were
alive while `threadAgentDefinition` dropped `mcpServers` → zod default `{}` → no
MCP tools, silently. Lazy gates for heavy servers and the `[mcp-bridge]` log
diagnosis path are unchanged: check the log first, then the checker, then
whether the `bun.exe` process is FRESH (started after the file edit), then the
bun probe, then reapply by meaning.

Without a restart, use the working fallback:
`python _scripts/mcp-call.py <server> <tool> [json-args]`.

## 3. Validation protocol (NON-NEGOTIABLE)

```
1. BACKUP:  cp orchestrator.js orchestrator.js.bak-<tag>-<date>
2. APPLY:   patch via python script (byte-exact, anchor-verified, idempotent)
3. VERIFY:  bun build --no-bundle orchestrator.js > tmp/bun.log 2>&1; echo exit=$?
            → validate EXIT CODE ONLY (never `| head && echo PASS` — head exits 0
              and masked a broken bundle on 2026-09-05)
            → exit != 0 = FAIL: restore the backup IMMEDIATELY, never fix in place
4. MARKERS: every marker in §2 at its expected count
5. DONE:    only after 3+4 pass; then cp the result to
            knowledge/freebuff-orchestrator/orchestrator-<ver>-patched.js
```

**Restart:** the running `bun.exe` keeps the old code in memory. The patch is
LIVE only after a Desktop restart — and only from an external terminal
(`python _scripts/restart_freebuff.py`); never restart from inside a session
(that kills the chat).

## 4. Reapply after a Freebuff update

```bash
cp "<install>/orchestrator.js" "<install>/orchestrator.js.bak-<ver>-<date>"
python _scripts/freebuff-patches/patch-prompt.py
python _scripts/freebuff-patches/patch-prompt-dont2.py
python _scripts/freebuff-patches/patch-guidance.py
python _scripts/freebuff-patches/patch-mission-text-only.py
bun build --no-bundle "<install>/orchestrator.js" > tmp/bun.log 2>&1; echo exit=$?
python _scripts/check-freebuff-mcp-patch.py
# then: markers §2, save the reference, update §1, restart Desktop
```

Each script verifies its own anchors before writing and prints SKIP when the
patch is already present, so re-running is safe. If a script reports a missing
anchor: the upstream text moved — find the new wording, update the SCRIPT and
this file, then apply. Never hand-edit the bundle without a backup.

## 5. Freebuff Gate companion (browser UI + mobile relay)

`projects/freebuff-gate` is the browser UI layer + mobile relay for Desktop.
Since the 0.0.5x update the on-disk gate patches (index.html shim, orchestrator
`/api/fb/*` routes + perf helper) are washed out on every update and are NOT
re-applied: the tailnet proxy on `127.0.0.1:58061` injects the mobile layer
(`mobile-ui.css/js`) and the `window.freebuffDesktop` shim at serve time, and
handles `/api/fb/upload`, `read-file`, `perf-report`, `ui-patch-status`,
`last-ad` itself. One gap stays: `/api/fb/dirlist` (folder picker) — WARN, the
LLM decides (re-add the orchestrator route or implement it in the proxy).

Ritual: `python _scripts/freebuff-gate-check.py` — update (`git fetch`), verify
the installed proxy's serve-time markers + live HTML on `:58061`, recover the
managed relay/agent/proxy from the git-ignored
`projects/freebuff-gate/_runtime/relay.env` when they are down. Secrets are
never printed.

Semantics to know:
1. **`relay_healthy()` — no `tunnelEnabled` field.** After the upstream merge
   the relay reports `{ok, service, protocolVersion, connectors}` and gates the
   tunnel in the APK. A healthy relay therefore has no such field; do NOT "fix"
   it back, and do not read its absence as broken.
2. **`check_ui_freshness()` — served HTML vs repo mobile layer.** The proxy
   serves `mobile-ui.*` from its own install dir
   (`%LOCALAPPDATA%/Freebuff/tailnet-proxy/`), so a repo edit reaches the phone
   only after copying the files there (backup first). Markers in repo but
   missing from served HTML = stale deploy → sync, don't shrug.

**Manual launcher:** the `Frebuff Gate.lnk` desktop shortcut runs
`_scripts/start-gate.py` (`--no-updates` wrapper) and brings the mobile runtime
up quietly.

## 6. Retired patches — do not re-apply without a fresh owner decision

| Patch | Status | Why |
|---|---|---|
| §11 `read_image` tool | retired 2026-09-16 | 0.0.110+ reads images natively: `read_files` on an image path returns a media part (`isImagePath` → `requestImageFile` → `getImageFile` → `mediaToolResult`). Verified live on stock 0.0.112 with a 1 KB PNG (the image reached the model). Cap: 768 KB (`MAX_IMAGE_READ_BYTES`), formats by extension. |
| §16a target gate | retired 2026-09-16 | folded into §2.3 (the gate is removed there) |
| §16b target teaching, §18 no-skill-bodies | retired 2026-09-16 | no skill body is injected at all any more (§2.3) |
| §5 slash-only ("never emit 'Activate the X Agent Skill'") | retired 2026-09-16 | the boilerplate came from the app's own `activationPromptFor` (`Activate the \`X\` Agent Skill.`) injected into mission passes; §2.3 removes the injection instead of forbidding the imitation |
| §5 plan-mode strictness | retired 2026-09-16 | 0.0.112's native `PLAN_MODE_GUIDANCE` is stricter (STRICTLY FORBIDDEN list + "HOW THE USER PHRASED THE REQUEST IS NOT PERMISSION TO BUILD"); our insert also pointed at `.agents/skills/writing-plans/`, a path the skills rework moved to `planning/parts/` |
| §5 MCP-first block, §5 context-before-action | retired 2026-09-16 | both live in AGENTS.md (MCP-First order; task-cycle "Read what I'm about to touch"), which reaches every session |
| §17e language rule, §17c identity, §17d strip-English-suffix | retired 2026-09-16 | the server stopped appending `(Reply in English only…)` (6 lifetime occurrences, last 2026-09-07, none in the last 300 messages); AGENTS.md owns the Russian-reply rule |
| §8 typecoerce | deprecated 2026-08-17 | models fixed upstream |
| §10 noTimeout | obsolete since 0.0.87 | upstream removed the questions timer |
| §13 / §14-budget / §15 autorun | obsolete since 0.0.79 | natively implemented |

## 7. Traps that cost real time (read before patching)

1. **`bun build | head && echo PASS` is a FALSE PASS** — `head` exits 0 on a
   broken bundle. Exit code only, output redirected to a file.
2. **Scripts printing OK while silently skipping** — trust markers, not stdout;
   check every marker AFTER the run.
3. **Escaping changes between versions** — the DO-NOT list carries escaped
   backticks (`\``) since 0.0.99; template-literal insert sites use literal
   `\n`, not raw newlines. Anchor on quote-free stable phrases; write patch
   scripts as FILES with `write_file`, never through shell heredocs.
4. **`grep -c` counts substrings, not syntax** — markers present ≠ bundle valid.
5. **Line endings flip mid-session** — the app may rewrite the bundle to CRLF.
   Scripts must detect NL or work on bytes. The 0.0.112 bundle is LF.
6. **A trailing `)` from the stock expression** — when replacing `( … )?.trim()`
   with a shorter expression, the paren count changes; `bun build` catches it,
   which is exactly why it is mandatory.
7. **Restart never from inside a session** — it kills the chat; use
   `python _scripts/restart_freebuff.py` from an external terminal.

## 8. Where the legacy scripts went

The 0.0.78–0.0.102 era scripts (`reapply-0.0.84-core.py` + `.bak`,
`patch-language-ru.py`, `patch-language-file-scope.py`,
`patch-language-preresolved.py`, `patch-identity-clarity.py`,
`patch-strip-en-suffix.py`, `patch-skill-slash-only.py`,
`patch-autorun-no-skill-bodies.py`, `patch-mcp-prompt.py`,
`patch-context-before-action.py`, `patch-notimeout.py`, `patch-typecoerce.py`,
`fix-0.0.90-buildarm-escapes.py`, `escape-t2-backticks.py`, `merge-0.0.102.py`,
`extract-anchor.py`, `build-prompt-ref.py`, `test-strip-en-suffix.js`,
`reapply-0.0.84-core.py.bak-lang17e-20260907`) are retired with their patches
— see `_archive/2026-09-16-freebuff-patch-legacy/`. History that mentions them
(`_memory/ERROR_LOG.md`, `_memory/DANGLING_TASKS.md`, `knowledge/findings/*`)
stays as history; do not revive a script from there without reviving its patch
decision too.

`patch-readimage.py` is deliberately NOT archived: it carries an uncommitted
0.0.110-era edit by another pass, and it is the fastest way back if the native
image path ever regresses. It is not part of the set — do not run it.
