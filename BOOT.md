# BOOT.md — operational runbook

> Read at task start. `AGENTS.md` is the always-loaded law; this file is the
> procedure behind it. `HOSTS.md` says which tools this client actually has.

## 1. Orientation

- `BIRTH.md` still present means the workspace was never initialized: run it
  before any real task. It creates `_memory/memora.db`, `_memory/USER.md`, the
  growth folders (`projects/`, `tools/`, `_archive/`) and the machine profile,
  then deletes itself.
- `MANIFEST.md` is the honest map of what this package ships and what it refuses
  to ship. `SKILLS.md` is the skill index. `TOOLS.md`, once birth has written it, is
  this machine's map: interpreters, ports, the MCP servers that answered, and the
  names — never the values — of the variables in `.env`.
- Root holds the kit's documents only. Anything else belongs in the folder that
  owns it (section 7).

## 2. Start from the task

1. Name the goal and the delivery mode: co-design, repair, or a direct build.
2. Check the working directory, branch and `git status`; read the actual project
   files and its `STATUS.md` before touching anything. Preserve unrelated edits.
3. Walk the memory tree from the matching root (section 3) before inventing a
   solution. Recover prior work first; if the request looks familiar and a
   targeted lookup finds nothing, ask whether a similar task existed.
4. Plan in the task list, plus one memory node with the goal, acceptance and exit
   evidence. No throwaway plan file unless the owner asks for one.
5. Pick the router skill by the task (section 4); read its `SKILL.md` and only the
   part you need.
6. Check a service only when it is a dependency or a failure signal. A stopped
   optional service is not an incident.

## 3. Memory (tree)

- Store: `_memory/memora.db`, one node per decision, lesson, finding or task.
  Roots: `root/canon` (owner decisions), `root/workspace`, `root/project/<name>`,
  `root/skill/<name>`. Start at the root that matches the task.
- Read the `promoted` champion and every `pruned` dead-end with its failure reason
  before branching. Branch from the champion, not from memory of it.
- One CLI, stdlib only: `python _scripts/memory.py <verb>`.
  `init` creates the store; `walk [--root ROOT]` reads a tree; `branch --content ...`
  adds a node; `verdict --id N --status ...` promotes or prunes one; `search "..."`
  finds a node or a report fragment; `reindex-reports` rebuilds the fragment index;
  `render` redraws the local graph. `init` produced the store on the first run;
  nothing else creates it.
- A changed decision is a new node with a bidirectional `supersedes`, never an
  edit of the old one. `valid_from` is kept apart from `recorded_at`: when a rule
  starts to hold is not when it was written down.
- Statuses: `active` while a node is open, `promoted` for the champion of a real
  comparison, `pruned` for a dead end. The agent promotes, the owner holds the
  veto, and a `pruned` node records what was tried, why it failed and what
  replaced it.
- Every node records provenance — owner decision, preference, manual edit,
  external brief, verified observation, measurement, incident lesson,
  architecture choice, external source, or agent hypothesis. A hypothesis names
  its source or is marked unverified.
- One writer at a time. A node whose writer is not this session belongs to another
  session: never stage or commit it; claim shared paths in `_memory/parity/`.
- `_memory/OWNER-CANON.md` is rendered from the canon root with `walk --json` once
  a round closes, then regenerated — never hand-edited.
- `_memory/reports/` holds dated evidence too large for a node, indexed by
  fragments (path, date, section) so a lookup reads the paragraph, not the file.
  Conclusions belong in the tree; the report is the exhibit.

## 4. Skill routing

- Skills live in `skills/`. Each router is `SKILL.md` with four blocks: a
  frontmatter trigger, a `Choosing a part` table, `Rules`, and `Related`. The
  mechanics live in `parts/` and load on demand.
- Depth (described only here): `skills/<router>/parts/<part>/` is the normal
  shape; a part may itself be a router, which gives
  `skills/<router>/parts/<part>/parts/<sub>/`. Two exist today —
  `desktop/parts/themes` and `memory/parts/sessions`. From inside a part, a link to
  `parts/<x>/` resolves against that part, not against the router.
- The trigger description is the only signal for automatic selection: it names
  the situation, not the topic.
- A router is justified only where the domain has real sub-modes. A skill with one
  body is a skill, not a router.
- No foreign client commands, foreign paths or promo lines inside a skill. Name
  the active skill and the reason in chat.
- Authoring a new skill: copy the four-block shape, put scripts and references
  under `parts/<part>/`, and record its upstream and license when it is not
  written here.

## 5. Engineering procedure

- Read callers, dependencies and tests before editing; reuse the project's own
  conventions instead of inventing parallel ones.
- Small coherent edits. Verify each through the real usage path; never skip or
  weaken a check to get green.
- A failing command, test or server: name the exact cause in one line, then fix it
  or hand the owner the exact command. A green summary never covers a red exit
  code — report passed, failed, skipped and not-run separately.
- Read a file before replacing it; prefer targeted edits over whole-file writes.
- Pass the working directory to the tool instead of chaining `cd`.
- Performance claims need correctness plus measured timing on representative
  input; a build is not proof of behavior.
- Dev servers: inspect the manifest and lockfile, follow the project's install
  procedure, check the listener and HTTP readiness, stop only the process you
  started.
- Ponytail (`skills/dev/parts/ponytail`): the simplest thing that keeps
  capability, verification and reach. Fewer lines never justify losing checks.

## 6. Safety, Git and publishing

- Removal: `_scripts/trash.sh` — the Recycle Bin on Windows, a dated trash folder
  elsewhere; never `rm`. Confirm targets first. Moving a folder into
  `_archive/<dated-name>/` keeps the data.
- Secrets: one `.env` at the root, gitignored. A tracked file holds variable names,
  never values. A commit hook may refuse a new plaintext secret; fix the cause
  rather than overriding it.
- Background processes: know the PID, the lifetime, the stop path and readiness.
  Do not mass-kill unknown processes. No new schedule or autostart without a
  request.
- Commits: local checkpoints after each logical step, staging only task-owned
  changes, with hash and file list reported. Push, deploy, PR, payment and sending
  need explicit approval, one authorization per action. The message carries no tool
  attribution: no "Generated with ..." trailer, no "Co-Authored-By:" line, no tool
  name in the subject or the body.
- A project's `STATUS.md` records open jambs, missing keys and questions. It never
  becomes a disclaimer inside the product and never substitutes for a fix.
- Publishing is per project and follows that project's own procedure. This folder
  is published as a repository of its own: `git init` here and commit this tree, so
  the history a reader clones starts at this package. Never push the workspace
  repository or a subtree of it — that history carries everything else. Set the
  identity for that repository before the first commit (`git config user.name` and
  `user.email` without `--global`): commit metadata travels with every clone, so the
  name and address in it are as public as the files.

## 7. Layout and file rules

- `projects/<name>/` is the user's own work; `tools/` is third-party tooling that
  is read and updated, never mixed into projects; `_archive/` is material no longer
  in use, cold storage with an index.
- Scripts: one task, one script, in `_scripts/`; a related set gets a subfolder with
  its own README; a script only one project needs lives inside that project.
- No caches in the tree: `__pycache__`, test caches and build output are
  regenerated, never kept.
- Skills: `skills/`; a vendored skill folder keeps its upstream and license next to
  it.
- Skills, scripts and documents are English.

## 8. Diagnostics — on smell, not as ceremony

- MCP: inspect the task's real schema and make one relevant call. Config alone is
  not health, and a tool listed is not a tool working.
- Ports and processes: confirm the listener and the owner of the process before
  killing or rebinding anything.
- A tool that a skill assumes: check that it runs (`--help` at minimum) instead of
  discovering it halfway through the task.

## 9. Host surface

`AGENTS.md` names no tool on purpose. Every capability it relies on — asking,
proposing follow-ups, delegating, showing a file, showing a running app, moving
long work elsewhere, requesting administrator rights, reading mail — is declared
in `HOSTS.md` for this client. If a verb is missing on the current host, say so
and degrade explicitly; never simulate a question or an approval.
