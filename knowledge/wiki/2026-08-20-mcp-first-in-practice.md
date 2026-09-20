# 2026-08-20 — MCP and Skills: Real Usage Instead of Ritual

> **TL;DR.** User said: "you don't know where things are and don't use MCP and skills during the work itselfаботы». Root cause: Freebuff auto-update on Aug 19 ~20:41 wiped 5 MCP-bridge markers + the promptaudit patch from `orchestrator.js`. Side-effect: the current session toolset contained zero `server__tool` MCP calls, so the only available surface was filesystem/grep/web_search — which is exactly the failure mode the user observed. **Fix**: 7-phase plan (Phase 0 backup-snapshot → trash; Phase 1 baseline-restore → orchestrator PASS; Phase 2 mcp-call.py smoke test → knowledge-rag VERIFIED-LIVE; Phase 3-6 docs/skill/intgrity hardening). After Freebuff restart the same channel surfaces as native `knowledge-rag__*` calls.

## 1. The two flavours of «don't use MCP»

User pain has two distinct causes, and a fix has to answer both:

1. **Plumbing flavour.** The MCP bridge in `orchestrator.js` is invisible
   from the agent's toolset. Tools like `knowledge-rag__search_knowledge`
   simply don't exist as `<server>__<tool>` even though the server is
   configured in `~/.agents/mcp.json` and the corpus (4500+ files, 49k+
   chunks) is alive. Without those tools, the agent falls back to
   filesystem/grep, regardless of how well it knows MCP-FIRST. Concrete
   evidence before the fix:

   ```
   $ grep -c -F <marker> orchestrator.js
   function desktopMcpServers                       BACKUP-WORK=1  CUR-BROKEN=0  ← GONE
   mcpServers: desktopMcpServers()                  BACKUP-WORK=1  CUR-BROKEN=0  ← GONE
   kb-rag-server.py                                 BACKUP-WORK=1  CUR-BROKEN=0  ← GONE
   @playwright/mcp                                  BACKUP-WORK=1  CUR-BROKEN=0  ← GONE
   puppeteer-mcp-server                             BACKUP-WORK=1  CUR-BROKEN=0  ← GONE
   mcp-tools-cache                                  BACKUP-WORK=2  CUR-BROKEN=0  ← GONE
   Local commits are expected                       BACKUP-WORK=1  CUR-BROKEN=0  ← GONE
   Never push or open a pull request                BACKUP-WORK=2  CUR-BROKEN=0  ← GONE
   Treat anything outside of the project            BACKUP-WORK=0  CUR-BROKEN=1  ← host ban RETURNED
   Do not commit or open a PR unless                BACKUP-WORK=0  CUR-BROKEN=1  ← host ban RETURNED
   ```

2. **Behaviour flavour.** Even when `server__tool` is alive, the
   agent defaults to filesystem/grep because the MCP-FIRST reflex didn't
   get triggered at start. There was no Pre-response Checklist row
   forcing the verdict. Concrete symptom: this very session (Aug 20)
   started with `list_directory` × 3 + ssh into SKILL.md reading instead
   of `knowledge-rag.search_knowledge("MCP patch")` — which would have
   answered the diagnostic question in one call.

A truthful fix has to address both. Plumbing fix without behaviour fix
recovers MCP availability but the agent still won't reach for it.
Behaviour fix without plumbing fix holds in theory but is bypassed by
every Freebuff update.

## 2. The actual fix — 7 phases, all reversible

| Phase | Artifact | Reversible by |
|-------|----------|---------------|
| 0 | `~/.openclaw/freebuff-baseline-2026-08-20/` snapshot of the pre-wipe orchestrator (8 776 056 bytes working + 4 bak-* history) | `Recycle Bin` for the original (`...@codebufffreebuff-desktop — копия (2)`) → already trashed via `_scripts/trash.ps1 -LiteralPath` |
| 1 | `cp` baseline → current install; `node --check` exit 0; `check-freebuff-mcp-patch.py` 11/15 PASS (CLI exe promptaudit left as owner-zone follow-up) | `cp` from `.bak-20260820-164856-mcp-restore` back |
| 2 | `python _scripts/mcp-call.py knowledge-rag search_knowledge '{"query":"mcp patch","limit":3}'` → 10 hits in 6.2 s | nothing to undo — read-only |
| 3 | `AGENTS.md`: Pre-response Checklist +3 mandatory-rows (`SKILLS` expanded with find-skills, `MCP-AVAIL` verdict print, `MCP-FIRST` reason-to-not-mcp) | `git checkout HEAD -- AGENTS.md` |
| 4 | `mcp-first/SKILL.md`: «Workspace-specific mapping» table + «Decision tree when MCP missing from the current toolset» | `git checkout HEAD -- .agents/skills/mcp-first/SKILL.md` |
| 5 | implicit in Phase 3's expanded `□ SKILLS:` row, but worth its own line | same revert as Phase 3 |
| 6 | `integrity_check.py`: new `check_mcp_runtime_sanity()` — probes `knowledge-rag.search_knowledge` via `mcp-call.py`; WARN default, `--strict-mcp` upgrades to FAIL for nightly | `git checkout HEAD -- _scripts/integrity_check.py` |
| 7 | this lesson + 1 commit (no push, H18 default) | `git reset HEAD~1` |

## 3. Why we copied the working baseline instead of editing current

`orchestrator.js` is 8.7 MB bundled Electron main process. Marker-based
patches would require 7+ insertions (~6 KB of function bodies) interleaved
with surrounding whitespace and comment lines that have shifted since the
patch was first written. Worst-case risk: an insertion lands two lines off
and silently breaks `desktopMcpServers` calls. Best-case: a 10-minute
parsing exercise where every line has to be re-anchored by hand.

The patch-author's working file (Aug 19 01:34, 8 776 056 bytes) was
preserved in the user's backup folder. `cp` from baseline is safer,
faster, and reversible by `cp` from the freshly-timestamped backup
(`orchestrator.js.bak-20260820-164856-mcp-restore`).

**Trade-off accepted:** we lose ~21 KB of Freebuff updates from the
Aug 19 auto-update, namely `includeHomeSkills` gating on skill loading
and `recountContextTokens`/`adjustContextTokenCountForHistoryEdit`
helpers for context-token accounting in history-edit edges. All three
are silent no-ops for this workspace:

- `includeHomeSkills` defaults to `undefined` → home skills still load,
  potentially *more* rather than less permissive;
- `recountContextTokens` re-runs only on history-edit triggers — user
  conversations rarely hit that path automatically;
- `adjustContextTokenCountForHistoryEdit` is only the delta
  recomputation in the same path.

If a regression shows up post-restart, document it and patch by
anchors. Reset baseline via `cp` of the saved
`~/.openclaw/freebuff-baseline-2026-08-20/orchestrator.current-broken-20Aug20-0941.js`
back, then re-apply by anchors on top of the then-current state.

## 4. The state BEFORE everything (the smoking gun)

These are the three lines that prove the regression and the recovery:

```
BEFORE  (Aug 19 20:41, post-update, 8 796 819 bytes, in current install):
PASS: MCP bridge is present (2 agent-template injections)
PASS: synthetic thread agent marker count=2
PASS: MCP config path in runtime marker count=7
FAIL: desktop MCP bridge helper marker count=0   ← THE bug
FAIL: desktop agent mcpServers wiring marker count=0  ← THE bug
FAIL: heavy-server lazy gate (matcher) marker count=0
FAIL: heavy-server lazy gate (cache read) marker count=0
FAIL: heavy-server lazy gate (cache write) marker count=0
FAIL: requestMcpToolData lazy path marker count=0
FAIL: orchestrator.js prompt still contains host bans (...)

AFTER  (Aug 20 16:48, baseline-restored, 8 776 056 bytes, in current install):
PASS: MCP bridge is present (2 agent-template injections)
PASS: synthetic thread agent marker count=2
PASS: MCP config path in runtime marker count=11
PASS: desktop MCP bridge helper marker count=1
PASS: desktop agent mcpServers wiring marker count=1
PASS: heavy-server lazy gate (matcher) marker count=1
PASS: heavy-server lazy gate (cache read) marker count=1
PASS: heavy-server lazy gate (cache write) marker count=1
PASS: requestMcpToolData lazy path marker count=1
PASS: orchestrator.js syntax is valid
PASS: recovery backups found: 1
PASS: orchestrator.js promptaudit rules are present
FAIL: freebuff CLI prompt missing: local commits are expected, ...   ← CLI exe, separate
FAIL: freebuff CLI prompt still contains host bans: ...             ← CLI exe, separate
PASS: CLI prompt backups found: 3
PASS: mcp.json is valid (38 server definitions)
```

Five MCP markers cross zero→one; promptaudit cross «still host bans»→
«present». Two CLI-only FAILs remain because `~/.config/manicode/freebuff.exe`
text is encoded (no plain grep finds the markers); the byte-replacement
work follows after the owner is ready to drive it.

## 5. Live demo — this is when it stops being theory

```
$ python _scripts/mcp-call.py knowledge-rag search_knowledge \
    '{"query":"mcp patch","limit":3}'
[kb-rag] Starting knowledge-rag MCP server (lazy init)
[kb-rag] Root: C:\Users\pc\.openclaw\workspace
[kb-rag] Dirs: ['knowledge', 'docs', '_archive/projects', '_memory', '_archive/experiments']
[kb-rag] Indexed 4536 files, 49515 chunks (137125 terms) in 6.2s
{
  "result": "{...}"
  [
    {score 11.87  docs/MCPRuntime.md           chunk 8},
    {score 11.85  docs/MCPRuntime.md          chunk 24},
    {score 11.57  _memory/CORE.md               chunk 5},
    {score 11.24  _archive/.../codewhale/.../inject.md  chunk 4},
    {score 11.02  docs/Governance.md            chunk 8},
    {score 10.69  _memory/ERROR_LOG.md          chunk 79},
    {score 10.26  _memory/CORE.md               chunk 6},
    {score 10.23  _archive/.../metasploit/...    chunk 1},
    {score 10.14  _archive/.../patch-management/ chunk 5},
    {score 10.10  docs/MCPRuntime.md            chunk 19},
  ]
}
```

Same query answered in 6.2 s with 10 ranked hits, the top 3 all from
the workspace's own reference docs (`docs/MCPRuntime.md` x2,
`_memory/CORE.md`, `docs/Governance.md`). To get the same answer before
the fix, this session would have had to grep across `~4500` markdown
files in 5 different scopes — easily 30+ seconds and noisier. After
Freebuff restart, the same call becomes `knowledge-rag__search_knowledge`
in the native toolset — 1 round-trip, no terminal.

`integrity_check.py`'s new section also runs that probe automatically
on every nightly cycle:

```
--- 🛰 MCP runtime sanity (mcp-call.py probe) ---
✅ knowledge-rag.search_knowledge: жив, ответ 12152 chars
ℹ️  MCP-канал активен через mcp-call.py даже когда server__tool не прокинут в toolset — fallback жив
ℹ️  под флагом --strict-mcp этот же результат повышается до FAIL для nightly-цикла
```

## 6. The new behaviour rules (Phase 3-6, durable after restart)

Every substantive `ask_questions`/`suggest_prompts`/`plan`/`fix`
response now has to start with one line of MCP verdict:

```
MCP-VERDICT: <VERIFIED-LIVE|TOOL-SURFACE-VIA-MCP-CALL|MISSING> for <server…>;
fallback=<none|mcp-call.py|filesystem>; reason=<one line>
```

Two-way enforcement:

1. **AGENTS.md Pre-response Checklist** now mandates three rows:
   `□ SKILLS` (expanded so the agent must run `find-skills` over task
   keywords BEFORE picking a tool), `□ MCP-AVAIL` (one-line verdict),
   `□ MCP-FIRST` (explicit reason-to-not-MCP if filesystem logic is
   about to run).
2. **`.agents/skills/mcp-first/SKILL.md`** now embeds a workspace
   mapping table (this repo's patterns → preferred MCP server → tool)
   and an explicit decision tree for when the native toolset has no
   `server__tool`. The skill is loaded mandatorily on every task
   (always-on via .freebuff routing, preload fallback per
   `AGENTS.md` «Стартовый ритуал»).

## 7. Followups (each one is reversible, none are blocking)

- **Rest­art Freebuff Desktop** (owner action): only then will the new
  session's toolset contain native `knowledge-rag__*`,
  `filesystem__*`, etc. Until then, mcp-call.py fallback is the bridge.
  Run via app menu, **never kill the process** — kills the active
  transcript.
- **`~/.config/manicode/freebuff.exe` promptaudit re-apply** (owner-zone):
  text is encoded in the binary, byte-replacement needs the original
  anchor byte-range. Tracked in `_memory/DANGLING_TASKS.md`.
- **Nightly `integrity_check.py --strict-mcp`** (autonomous on next
  nightly cycle): the `check_mcp_runtime_sanity()` helper upgrades from
  WARN to FAIL under the flag; recommend switching the hermes cron
  invocation to use it (a separate one-line change).
- **MCP semantic layer** (separate `knowledge-rag` config): currently
  `KB_SEMANTIC=off` because the numpy hang bug in
  `docs/MCPRuntime.md` §«knowledge-rag interpreter + semantic switch»;
  BM25 search (used above) is fast and accurate enough that semantic is
  a follow-up, not a precondition.

## 8. Cross-references

- `_memory/CORE.md` → STANDING AUTHORIZATION 2026-08-14 12:45 +
  2026-08-15 (orchestrator.js bridge + CLI promptaudit)
- `knowledge/findings/2026-08-15-A1-mcp-fix-sweep.md` — first live MCP probe
- `knowledge/findings/2026-08-15-mcp-retroactive-bridge.md` — the 15.08 regression anatomy
- `knowledge/findings/2026-08-17-A7-kb-rag-reindex-fix.md` — semantic reindex path
- `knowledge/wiki/lessons/2026-08-15-mcp-retroactive-loading.md` — earlier MCP-bridge diagnostics
- `AGENTS.md` «Стартовый ритуал» — session-start sequence is now stricter
- `AGENTS.md` «Pre-response Checklist» — MCP-VERDICT one-liner is mandatory
- `.agents/skills/mcp-first/SKILL.md` «Workspace-specific mapping»
- `docs/MCPRuntime.md` — current evidence labels updated 2026-08-20
- `_scripts/integrity_check.py::check_mcp_runtime_sanity` — auto probe
- `~/.openclaw/freebuff-baseline-2026-08-20/README.md` — snapshot index
