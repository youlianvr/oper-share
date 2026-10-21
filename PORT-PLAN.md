# PORT-PLAN.md — what this package inherits, and what it never will

Working document for the 2026-10-20 port. It is a decision record, not an
inventory: every line says what moves, what is already here, or what stays in the
private workspace, and why. It ships with the package as its record: the conclusions
live in `MANIFEST.md`, and every claim below can be checked against the tree.

Audit order for anyone checking the result: this file → `MANIFEST.md` → the files
it names.

---

## 1. Where the package stood

The package on disk was the 2026-10-17 build: a faithful copy of a workspace that
no longer exists. Between 10-17 and 10-20 that workspace was rebuilt — `docs/`,
`knowledge/` and `tests/` were retired, the flat skill list became routers with
parts, and memory moved from markdown sheets into an RSI tree. The package kept
the old shape.

| File in the package | State found | Why it was wrong |
|---|---|---|
| `AGENTS.md` (66 lines) | pre-rebuild law | no two-contour truth, no sanity gate, no question channel, no orchestration |
| `BOOT.md` (38 lines) | stub | routed to `knowledge/INDEX.md`, `MEMORY.md` and `validate_skills_catalog.py` — none of them exists now |
| `skills/` (37) | superseded set | shipped 5 retired routers (`fastapi`, `fleet-manager`, `google-signup-mobile`, `lsp-code-depth`, `multimodal-vision`), lacked `bro`, and half the routers still carried the pre-router body |
| `docs/` (10 + 3 ADR) | retired layer | the workspace dissolved it into the two root documents; a second copy of every rule drifts |
| `knowledge/` (9 findings + wiki) | retired layer | it was the owner's own research about their stack, superseded by the tree |
| `_memory/INDEX.md` | described flat files | `USER/HARD_RULES/DANGLING_TASKS/ERROR_LOG/WINS_LOG` are no longer the set |
| `_scripts/` (4 files) | older toolkit | no tree CLI, no parity claims, no skill evaluation, no sync, no secret gate |
| `BIRTH.md` | six-step birth | pointed at `docs/`, `knowledge/`, a catalog validator and `MEMORY.md` |
| `MANIFEST.md` | build note | claimed "37 skills, carried over unchanged" — true on 10-17, false today |

Two leaks the old checklist missed, both found by reading rather than matching:
`_scripts/oper-vm-init.sh` hardcoded the owner's repository URL, and
`skills/router-admin/SKILL.md` carried the live WAN address, router model and line
parameters.

---

## 2. The new experience, item by item

### 2.1 Sanity-Check and the Truth Contract → `AGENTS.md`
**What it is.** Two rules at the top of the law: *no silent decisions* (a homonym,
a prompt that disagrees with the disk, or an unclear destination stops the first
mutating call) and the *two-contour truth* (artifacts carry no self-justification;
the owner gets strict truth in conversation; open jambs live in `STATUS.md`).
**Already present.** The weaker half: "no disclaimers", "no self-sabotaging UI",
never destroy.
**Moves.** Both rules, rewritten host-neutral, plus the `STATUS.md` channel, which
the package did not have at all.
**Stays private.** The owner's own wording and the audit that produced it.

### 2.2 Router skills instead of a flat list → `skills/`, `SKILLS.md`
**What it is.** 33 routers at the source, 31 after the exclusions in D10, each
`SKILL.md` in one four-block shape — frontmatter trigger, `Choosing a part`,
`Rules`, `Related` — with mechanics in `parts/`. The trigger description is a
first-class artifact: it is the only signal for automatic selection.
**Already present.** 37 folders in the old shape; some were routers, many were
single pages.
**Moves.** The whole keep-set, `SKILLS.md` regenerated from the frontmatter, and
the four-block shape stated once as the authoring contract.
**Stays private.** Nothing — the skill tree is the most portable thing we own. The
read-pass in §6 decides, per file, whether a personal fact inside a part is
genericized or the part is dropped.
**Retired on purpose.** The five strays above: an unmaintained router rots faster
in a package than an absent one.

### 2.3 The session relay and the industry sweep
**What it is.** Two halves of one lesson — continuity has to be engineered. The
`memory` router's `sessions` part (recovering a lost conversation from the host's
own store, with permission) and the 2026-10-19 industry sweep (twenty research
directions, each with the construction change it forces).
**Already present.** Nothing.
**Moves.** `sessions` travels inside the `memory` router, host-neutral: what to
recover and with whose permission, leaving the mechanism to `HOSTS.md`.
**Moves distilled, not as a report.** The sweep itself is dated evidence about our
stack. Its consequences ship, which is the honest form of a research finding:
- `_scripts/eval_skills.py` — context-layer weights and a trigger benchmark
  (Hit@1, Hit@3, near-miss rejection). Directions 1 and 2.
- `PROVENANCE.md` — source, license and state per skill folder, with the `docx`
  exclusion written down. Directions 11 and 12.
- `BOOT.md` memory rules — `valid_from` apart from `recorded_at`, report search
  over fragments. Directions 3 and 14.
- `HOSTS.md` — the tool surface is declared per host instead of assumed. Direction 6.
**Stays private.** The sweep, the session-anatomy measurement and the surveys.

### 2.4 Bootstrap → `BIRTH.md`
**What it is.** The first-run script in the new law: probe the machine, profile the
host, initialize the tree, run the interview, delete itself and commit.
**Already present.** A six-step birth written against the retired layer set, with
the right instinct: the pass is mandatory, the content is optional.
**Moves.** A rewrite: nothing is asked that can be probed; the tree exists before
the interview so answers land as nodes; the closing step is a real commit.
**Stays private.** The owner's answers and the resulting `USER.md`.

---

## 3. Decisions

**D1 — Root set.** `AGENTS.md`, `BOOT.md`, `HOSTS.md`, `README.md`,
`MANIFEST.md`, `SKILLS.md`, `PROVENANCE.md`, `BIRTH.md`, `LICENSE`. `TOOLS.md` and
a schedule registry are owner artifacts: the bootstrap writes `TOOLS.md` from the
machine it just probed, and a package has no schedules.

**D2 — `docs/` and `knowledge/` are dropped, not copied.** One copy of each rule is
the point of the rebuild. The normative content is already inside the two root
documents; the long essays would immediately disagree with the short rule. The cost
— losing the long-form argument — is paid by `PROVENANCE.md` and by `BOOT.md`
carrying the *why* in one line beside each rule.

**D3 — `HOSTS.md` is new, and the constitution names no tool.** The law is
vendor-neutral; tool names are not. Freebuff Desktop ships as the reference
profile, plus a generic profile with the abstract verb behind each capability.
`AGENTS.md` stays at or below 85 lines by pointing at the host profile.

**D4 — Memory ships as the tree, never as its contents.** `memora.db` is created at
birth; `OWNER-CANON.md` is described as generated and not shipped, because a file
generated from nodes that do not exist here is a lie with a header.

**D5 — The memory CLI is ported, not copied.** The workspace script resolves an
interpreter inside the owner's tool folder and imports a large server that needs a
prepared virtualenv. Ship `_scripts/memory.py`: stdlib SQLite, same node and edge
schema, verbs `init`, `walk`, `branch`, `verdict`, `search`, `render`, so a fresh
clone has working memory with no install step.

**D6 — `eval_skills.py` ships.** Descriptions are the only auto-selection signal,
and every direction in the sweep says measure them. A measuring tool is cheaper
than an opinion about routers.

**D7 — The supply chain is written down.** `PROVENANCE.md` gives each vendored
folder its upstream, license and state, and records why a skill whose license
forbids repackaging cannot ship.

**D8 — Privacy is verified by reading, not by a gate.** The gate that was supposed
to guarantee this already passed a package carrying the owner's repository URL, so
the gate is now evidence: a table of files read, what was in them, and the verdict.
`secret_gate.py` may still guard against *new* secrets at commit time; it is never
the proof that the package is clean.

**D9 — What stays private is named, not implied** (§4).

**D10 — Two routers and three parts do not ship, and the reason is a property of
the item, not of convenience.**
- `router-admin` — a runbook for one specific CPE device on one SIM, with its WAN
  identity. Publishing it publishes someone's line.
- `omniroute` — the operator runbook of a private proxy: absolute paths, internal
  hostnames, a live connection id, upstream quirks of services the reader does not
  have. Genericizing it would leave nothing worth reading.
- `documents/parts/docx` — its license forbids extracting copies or creating
  derivative works.
- `telegram/parts/no-agi-posts` — the house style of one specific channel.
- `security/parts/pentest-tools/src-hunter` — a third-party pack whose ownership
  and license cannot be established from inside the folder.

Additional exclusions found while reading licenses, not assumed (S5):
`documents/parts/pdf`, `documents/parts/xlsx` and `decks/parts/pptx` are
"© Anthropic, all rights reserved", and `decks/parts/lieflat-charts` is PolyForm
Noncommercial 1.0.0, which cannot sit inside a kit that permits commercial use.
`documentation-writer/parts/pz-writer/references/` held a real school work with a
school name, an author and an absolute path in its README — removed whole.

Each exclusion leaves the router that referenced it without a dead pointer: the
table row or the section goes with the part.

---

## 4. What stays in the private workspace

- The canon file of raw owner answers, in the owner's own words. Never ships, not
  even redacted: its value is exactness.
- `USER.md`, the tools document, the schedule registry, the memory database, the
  report tree, parity claims.
- The publishing script and its target list — the remotes are ours.
- Every script that encodes an account: phone tooling, proxy manager, messaging,
  VPN tooling, check-in, provider tables, the secret-gate baseline.
- `projects/`, `tools/`, `inbox/`, `_archive/`.
- Per-router personal facts (home router model and line, proxy accounts, local
  ports): genericized in place during the read-pass, or the part is dropped. The
  table records which, and why.

---

## 5. Order of work

1. This document. **S1**
2. Constitution chunk — `AGENTS.md`, `BOOT.md`, `HOSTS.md`, `_memory/INDEX.md`. **S1**
3. Skill tree — the 33 routers, `SKILLS.md` regenerated. **S2**
4. Scripts — memory CLI, parity claims, trash, skill evaluation, sync, secret gate. **S3**
5. Bootstrap — `BIRTH.md`. **S4**
6. Manifests — `README.md`, `MANIFEST.md`, `PROVENANCE.md`. **S5**
7. Read-pass, table filled, leaks fixed. **S6**
8. Workspace documentation updated; local commits prepared, nothing pushed. **S7**

---

## 6. Privacy verification: the method

Not a grep, and not the old checklist — that checklist is exactly what once passed
a leak.

1. **Enumerate by path.** The shipping set comes from the repository index; nothing
   outside it is claimed as verified.
2. **Read the content.** Every root document, script and `SKILL.md`, and the
   sections of every part where identity could sit — examples, paths, credentials,
   names, chats — are read, not matched.
3. **Record a verdict per file** in the table in §8: `ship`, `redacted` (with what
   was removed), or `excluded` (with why). A file without a row is not shipped.
4. **Check the three non-content surfaces**: file names, the package's own commit
   history, and anything untracked sitting in the folder but outside the index.
5. **Read the port's own diff** — a leak usually enters through a bulk copy, not
   through a sentence.

---

## 7. Where the industry standards enter

| Direction | What it changes here |
|---|---|
| 1. Descriptions as the trigger | `eval_skills.py` trigger benchmark; the four-block shape in `SKILLS.md` |
| 2. Context budget | `eval_skills.py` prints the layer budgets on every run; `AGENTS.md` ≤ 85 lines, mechanics in `BOOT.md` |
| 3. Memory architecture | `valid_from` apart from `recorded_at`; `supersedes` chains in the memory CLI |
| 6. Tool surface | `HOSTS.md` declares the surface instead of assuming it |
| 11–12. Supply chain and licenses | `PROVENANCE.md`, the `docx` exclusion, no unpinned `npx -y` in skill setup |
| 13. One writer to the cloud | the sync script ships with that rule in its header |
| 16. Observability | reports distinguish passed / failed / skipped / not run, never a green summary over a red exit code |

---

## 8. Ledger of checks and read-pass evidence

### 8.1 Slice S1 — paths named in the four documents

| Path named | How it was confirmed |
|---|---|
| `AGENTS.md`, `BOOT.md`, `HOSTS.md`, `_memory/INDEX.md` | written in this slice, on disk |
| `SKILLS.md`, `MANIFEST.md`, `README.md`, `BIRTH.md`, `LICENSE` | `ls -1` at the package root |
| `skills/` | `ls skills` — 37 folders at S1; the keep-set replaces them in S2 |
| `skills/dev/parts/ponytail/SKILL.md` | `ls skills/dev/parts/ponytail` |
| `_scripts/`, `_scripts/trash.sh`, `_scripts/mcp-call.py` | `ls -1 _scripts` |
| `_memory/memora.db`, `_memory/USER.md`, `_memory/parity/`, `_memory/reports/` | named as *created by* `BIRTH.md`; none ships |
| `_memory/OWNER-CANON.md` | named as *generated*, never shipped |
| `STATUS.md` | named as a per-project file created when a jamb appears |
| `projects/`, `tools/`, `_archive/` | named as folders created at birth |
| memory CLI verbs (`init`, `walk`, `branch`, `verdict`, `search`, `render`) | named as verbs, not as a file; `BIRTH.md` is the document that prints the commands |

Deliberate deferrals, so that no document points at a file that does not exist:
`BOOT.md` names no memory-CLI filename until S3 lands `_scripts/memory.py`, and no
`PROVENANCE.md` until S5 lands it. Both get their one-line addition in those
slices.

State left behind by S1, stated so the next slice does not trust a wrong picture:
`docs/` (10 files + 3 ADRs) and `knowledge/` (50 files) are still on disk and are
no longer referenced by any root document. They are removed in S5, together with
the `MANIFEST.md` and `README.md` rewrite. Until then the package is internally
consistent but carries dead weight, not dead references.

### 8.2 Slice S2 — the skill tree

| Check | How it was confirmed |
|---|---|
| 31 routers, 251 parts, 2544 files | copied from `.agents/skills` with `node_modules`, `__pycache__`, `.venv`, `.git`, `*.pyc` filtered; counted after the copy |
| No dead part pointer | every `` `parts/<name>/` `` and `` `skills/<router>/parts/<name>/` `` occurrence resolved against the disk: 0 dangling |
| Every router has a trigger | frontmatter parsed for `name` and `description` on all 31: none missing |
| `SKILLS.md` matches the tree | regenerated from the frontmatter after the last edit; 31 rows |

Read and rewritten in this slice, because the port itself exposed them:
`skills/email/SKILL.md` (owner's mail account handle removed, client tool names
replaced by the verb), `skills/browser/SKILL.md` (client panel APIs and a personal
project path removed), `skills/memory/SKILL.md` (workspace script and MCP names
replaced by the CLI verbs), `skills/media/SKILL.md` (a private gateway and its port
replaced by the OpenAI-compatible base URL), `skills/telegram/SKILL.md` and
`skills/vpn/SKILL.md` (Related lists pointed at the two excluded routers),
`skills/security/parts/pentest-tools/` (the src-hunter section and its two
references), `skills/mcp/parts/mcp-usage/SKILL.md` (same reference in a table row).
Fifteen cross-router references were rewritten from `parts/<x>/` to
`skills/<router>/parts/<x>/` so a reader can follow them without guessing.

Removed through the Recycle Bin: 215 stale files left from the 10-17 build and the
two excluded routers. The live tree was not touched.

### 8.3 Slice S3 — the script layer

| Script | What was run | Result |
|---|---|---|
| `_scripts/memory.py` | `init`, three `branch` calls including one `--supersedes 2`, `walk`, `verdict`, `search`, `render`, `reindex-reports` on a scratch store | every verb worked; the supersedes edge reads from both ends (`replaced by 3` on the old node, `supersedes 2` on the new one); no store present gives a message that names `init` |
| `_scripts/parity_claim.py` | `new memory-port --dir <scratch>`, then `list` | record created and listed |
| `_scripts/eval_skills.py` | full run against the package, repeated after the last edit | 31 routers; context 80-line `AGENTS.md` (~1.1k tokens) + ~2.9k tokens of descriptions; trigger benchmark Hit@1 27/31, Hit@3 31/31 |
| `_scripts/sync_skills.py` | dry run with no arguments, then `--target <scratch>` | finds the host folder or says there is none and exits 0; 14 folders differ, 2 stale left untouched |
| `_scripts/mcp-call.py` | `--help` | runs; its working root is now the package, not a home directory |
| `_scripts/secret_gate.py` | scan of the package | reports only test fixtures and samples under `skills/**` — read in S6, not taken on trust |
| `_scripts/trash.sh`, `trash.ps1` | used for this port's own removals (215 stale skill files, two routers, the dropped bootstrap) | Recycle Bin, nothing hard-deleted |

Ported rather than copied, because the originals name the owner's machine:
`memory.py` is new (stdlib instead of a venv-bound script and a 647-line server);
`mcp-call.py` resolved its working root from the author's home directory; `secret_gate.py` carried
owner-specific quarantine folders; `eval_skills.py` scanned `.agents/skills` and a
private tools document and its benchmark still asked about two excluded routers;
`sync_skills.py` hard-coded the keep-set and the Freebuff account layout.

**Dropped: `oper-vm-init.sh` and `_scripts/oper-kit/`.** The script vendored the
retired `docs/` and `knowledge/` layers into a project, cloned from a personal
repository URL, and offered a second bootstrap next to `BIRTH.md`. Two bootstraps
is how a kit grows two laws. The capability is not lost silently: it is recorded
here, and a project-vendoring feature can be written deliberately later.

### 8.4 Slice S4 — the bootstrap

`BIRTH.md` was rewritten from scratch: no retired path, no interview about
something measurable, the tree created before the first question so answers land
as nodes, the host profile verified with one real call per verb, and a closing
commit that deletes the file. Commands it names were run in S3 (`memory.py init`,
`branch`, `walk`) and exist in `_scripts/`; the paths it creates are the ones
`_memory/INDEX.md` lists.

### 8.5 Slice S5 — manifests, provenance, and the retired layers

`README.md`, `MANIFEST.md` and `PROVENANCE.md` were written against the tree as it
now stands; `docs/` and `knowledge/` left the package (both already retired in the
workspace, both unreferenced by any shipped document). Seventeen LICENSE files
were opened one by one: that is how the four Anthropic packs and the
noncommercial chart gallery were caught, and how the CC BY-SA exception for the
OWASP-derived `code-audit` pack got written down instead of glossed over.

### 8.6 Read-pass evidence (S6)

**What was read.** Every root document and every script in full. Every one of the
31 router `SKILL.md` files and every part `SKILL.md` in full — split across five
readers, one per folder group, each reporting verbatim quotes rather than a
judgement. The references, scripts and data files that can carry identity
(session notes, install notes, token tables, case notes, examples, shell and
Python scripts) were opened directly. Vendor reference libraries — Cloudflare
deployment docs, OWASP cheat sheets, payload collections — were checked by
reading every identity-marker hit inside them; those are upstream text, not our
notes.

**Verdicts.** `redacted` means identity was removed and the method kept.
`excluded` means the item left the package.

| Path | Finding | Verdict |
|---|---|---|
| `skills/browser/parts/google-signup-mobile/` | a real mailbox created by the recipe, its account file path, the phone model | excluded — account-bypass recipe with a live address |
| `skills/design/parts/ux-ui-kit/` | a manifest for a library that is not in the package, plus a private archive path | excluded |
| `skills/memory/.../freebuff-session-logs/references/device-layout.md` | a survey of one machine: store names, sizes, message counts, paths | excluded |
| `skills/mcp/parts/mcp-auth-handler/references/2026-08-10-auth-fix.md` | a session transcript quoting the owner | excluded |
| `skills/dev/parts/using-superpowers/references/freebuff-tools.md` | absolute home path, private workspace name, duplicated `HOSTS.md` | excluded |
| `skills/email/parts/email-core/SKILL.md` | owner mailbox and handle; a third party's address, archive and product | redacted |
| `skills/telegram/parts/telegram-report/SKILL.md` | owner's name throughout, workspace script paths | redacted |
| `skills/telegram/parts/telegram-rich-messages/SKILL.md` | two bot usernames, channel and DM ids, private topic map, absolute config path | redacted |
| `skills/telegram/parts/tg-check/SKILL.md` | the list of private channels the owner reads, private fetcher paths | redacted |
| `skills/osint/parts/osint-protocol/SKILL.md` | a real handle resolved to a full name; a table of which API keys sit in which file; standing access to a personal account | redacted |
| `skills/reverse-engineering/references/field-notes.md` | a named real target of a real exploit, plus a phishing block with no case file | redacted — technique kept, target and block removed |
| `skills/review/parts/think-like-human/references/examples.md` | a private project named in two examples | redacted |
| `skills/reliable-automation/SKILL.md` | private clone and archive paths, a hardcoded app client id, a community name | redacted |
| `skills/ship/parts/git/SKILL.md` | a foreign tool's mandated attribution footer, private workspace name | redacted |
| `skills/media/parts/image-generation/SKILL.md`, `youtube-full/scripts/{lab_settings,youtube_pipeline}.py` | a local gateway, a reseller model id, a private lab path | redacted |
| `skills/mcp/parts/mcp-usage/SKILL.md`, `mcp-batch-install-and-repair/references/dead-symlink-blocker.md` | archived report paths, a private project thread, home paths | redacted |
| `skills/memory/parts/sessions/parts/{error-memory,freebuff-orchestrator-debug,freebuff-session-logs}` | absolute paths, a datacenter exit IP, a private workspace name in code | redacted |
| `skills/dev/parts/{cross-platform-gotchas,jsonc-surgical-edit}/SKILL.md` | a private project name and its installer scripts | redacted |
| `skills/review/parts/self-reflection/SKILL.md` | retired memory files, archive paths | redacted |
| `skills/prompt-to-exe/SKILL.md` | an `author:` line naming a person | redacted |
| `skills/skill-meta/parts/{skill-installer,plugin-creator,skill-hub}` | another client's command surface and install paths, an external repo name | redacted |
| `skills/desktop/parts/{zram-optimize,themes/parts/dolphin-windows-theme}/scripts/*.sh` | promotional banners and channel links baked into code | redacted — the scripts keep working |
| `skills/desktop/parts/windows-encoding-fixes/SKILL.md` | a private project name and a channel name | redacted |
| `_scripts/mcp-call.py` | home paths in the docstring and in the Telegram credential lookup | redacted |
| `skills/documentation-writer/parts/pz-writer/references/` | a real school work: school name, author, absolute path in its README | excluded |

**Cross-cutting fixes made while reading:** `_scripts/rsi_tree.py` → `memory.py`
references in two skills, `mcp_env_run.py` and `publish.py` mentions that pointed
at scripts the package does not carry (three and two files), and 39
`.agents/skills/` prefixes that named another client's install path. Zero dangling
`parts/` references remain; every router still has a trigger description.

**What a reader should not conclude:** the marker scan at the end of this pass
returned nothing, but a scan is not the evidence — the table above is. The scan
is a last look, and it is wrong to treat a clean scan as the proof that a package
is clean.

### 8.7 Slice S7 — the gate itself, and the numbers the documents claim

Running the package's own gate on the package turned up two defects in the kit,
not in the skills:

| Defect | Fix |
|---|---|
| `secret_gate.py` exited 1 on a clean checkout: 19 hits, all of them vendor placeholders, fake credentials in a test suite, and two truncated key markers that exist to unit-test a detector. A kit whose first command is red teaches its reader to ignore the gate | Each hit was opened and read (no value printed). The 17 unique ones went into `_scripts/secret_gate_baseline.txt` with the header saying what an entry means. Gate now exits 0 on the shipped tree |
| A clone had no `.gitignore`, so the publish step in §9 would have committed `__pycache__`, the per-install memory store, parity claims and a local `.env` | One ships, with the store and the graph view listed |
| A pass-only result proves nothing | A fake `sk-proj-…` token was appended to a tracked script: gate exited 1 and named both detectors. The file was restored byte-for-byte and the gate returned to 0 |

Counts in `README.md` and `MANIFEST.md` were claims about the tree and had drifted:
247 parts and an "empty baseline" no longer matched. Measured now — 31 routers,
245 parts, 2 288 files under `skills/`, `AGENTS.md` at 83 lines, `eval_skills.py`
at Hit@1 27/31 and Hit@3 31/31 (the S3 figure of 28/31 was before three descriptions
were rewritten for redaction).

---

## 9. Publication

Ten commits carried the port inside the private workspace; nothing was pushed
while the package was being built.

**Published 2026-10-20** to `https://github.com/youlianvr/oper-share` as a single
root commit, force-updated onto `master`; the two published commits were rewritten
on 2026-10-22 to drop the tool-attribution trailers, and the tree is the
publication tree apart from this paragraph. A clone of the public repository is
2 309 files on one commit; `secret_gate.py` and `eval_skills.py` both exit 0 there
and `memory.py` starts, run from that clone rather than from the workspace. The
branch is `master` because that is the repository's existing default; the commit
content is the tree this package held at publication.

| Commit | What it carries |
|---|---|
| `915d08bcf` | This document, the host-neutral law (`AGENTS.md`, `BOOT.md`, `HOSTS.md`, `_memory/INDEX.md`) |
| `6742eb6bf` | The router tree: 31 routers, 245 parts, `SKILLS.md` regenerated |
| `ba7af6858` | The script layer: `memory.py`, `parity_claim.py`, `eval_skills.py`, `sync_skills.py`, `secret_gate.py`, `mcp-call.py`, `trash.*` |
| `bc7f95fcc` | `BIRTH.md`, `README.md`, `MANIFEST.md`, `PROVENANCE.md`; the retired layers leave |
| `068d1f21c` | The read-pass verdicts applied: 70 files redacted or excluded |
| `7f128dd3c` | The gate gets its reviewed baseline; drifting counts corrected |
| `c96d03cf2` | The builder retires to `_archive/`; workspace docs follow |
| `3f9b92c33` | The `.gitignore` a fresh clone needs |
| `fad0c67c0`, `cc3894562`, `dc385ee34` | The last document defects found by reading the package as a stranger would |
| `9de251081` | The six fixes from the cold run (§10): interpreter, git identity, `USER.md`, `--apply` consent, the untracked memory store, a portable trash |

The commands used, from the package folder:

```bash
git init -b master
git add -A
git commit -m "Oper: an agent workspace that keeps its word"
git remote add origin https://github.com/youlianvr/oper-share.git
git push --force origin master
```

A fresh repository rather than a subtree of the private one is the point: the
workspace's history carries its own paths, its authors and every file the read-pass
removed, and none of that belongs in the published tree's past.

### 9.1 Text ready to paste

Repository description, under the 350-character limit:

> An agent workspace that keeps its word: a short law, a runbook, 31 router
> skills, a memory tree that never overwrites a decision, and the scripts to run
> them. Taken from daily use, not designed on a whiteboard.

Pull-request body for the first commit of the public repository:

```markdown
## What this is

A working kit for an AI coding agent: `AGENTS.md` (the law, 83 lines), `BOOT.md`
(the runbook), `HOSTS.md` (the tool surface per client), 31 router skills under
`skills/`, a stdlib-only memory tree in `_scripts/memory.py`, and `BIRTH.md`, the
first-run bootstrap that writes its own host profile and then deletes itself.

## Why it exists

The part everyone skips: the agent says what actually happened. Artifacts make no
promises about verification, the conversation carries strict truth, and open jambs
live in a `STATUS.md` instead of a disclaimer on the product page.

## How it was checked

- Every root document, script and `SKILL.md` read end to end; identity removed
  where it appeared, and the vendor packs whose licenses forbid repackaging
  withheld. `PROVENANCE.md` names each one.
- Every path named in a shipped document exists in the package or is created by
  `BIRTH.md`.
- `memory.py` exercised through every verb on a scratch store; `eval_skills.py`
  reports 31 routers and Hit@3 31/31; `sync_skills.py` and `parity_claim.py` run
  on a bare tree.
- `secret_gate.py` exits 0 on this tree and exits 1 on a secret added after it —
  both runs recorded.

No secrets, no owner memory, no machine-specific runbooks.
```

### 9.2 What is left open, so the next pass starts here

- **`_scripts/oper-vm-init.sh` still describes the old kit.** It vendors `docs/` and
  `knowledge/` and reads a kit core that no longer exists in this shape. It is a
  workspace tool, not a shipped one, but it will break on the next fresh VM. It needs
  a deliberate rewrite that vendors the current layout, or retirement next to the
  builder.
- **The builder is retired, not replaced.** `build_share_package.py` and
  `_scripts/oper-kit/` went to `_archive/oper-share-builder-2026-10-20/`: rerunning
  them would have overwritten the hand-written law from workspace layers and
  re-added the personal skill layer. The direction now depends on the artifact, and
  `MANIFEST.md` states it: a skill comes from the workspace with its personal
  parts stripped, while the law is written here in host-neutral wording and adapted
  in the workspace.
- **The workspace skill tree is mid-migration.** It carries a large uncommitted
  diff from an earlier phase of this work. It is not this port's to commit; a
  separate pass should either finish it or revert it, per the owner's call.

---

## 10. The cold run (2026-10-20)

The port claimed the bootstrap works, and nothing had ever tested that claim. So
the package was copied into an empty folder outside the repository — no history,
no siblings — and `BIRTH.md` was followed command by command, with the workspace
put out of mind. Six things asked for a decision the file had not made.

| Breakage | What it looked like | Fix |
|---|---|---|
| `python` was hardcoded | Step 1 records the interpreter; every later command says `python`. A host with only `python3` dies at Step 2 | Step 1 now says which interpreter to use for the rest of the file |
| No git identity check | A fresh machine has no `user.email`; the first command that needs it is the closing commit, after the whole interview | Step 1 asks for the name and address when they are missing |
| `USER.md` appeared from nowhere | Step 4 says answers "go into `_memory/USER.md`", Step 7 checks that it exists; no step creates it and no step gives it a shape | Step 4 creates it on the first answer and points at the table in `_memory/INDEX.md` |
| `--apply` rewrote the host without a word | Step 5 said "publish with `sync_skills.py` and then `--apply`". On this machine that is 26 folders of a live account skill set, some of them holding skills this tree does not own | Step 5 now requires showing the `changed:`/`stale:` lines and getting a yes before `--apply` |
| The closing commit dropped the memory tree | `.gitignore` ignored `_memory/memora.db`, so `git add -A` committed everything except the decisions — a clone would start empty, and the "no longer a template" promise was false | The store is tracked; only SQLite's `-wal`/`-shm` and the generated graph stay out |
| `trash.sh` was Windows-only | The law makes it the only legal removal and the closing step depends on it; on Linux or macOS it exited with "PowerShell is required", so the "never `rm`" rule left no way to remove anything | It falls back to `gio trash`, else a dated `OperTrash/` folder, and prints where the file went |

Also found and fixed by reading the run: `TOOLS.md` was written by Step 6 and checked
by Step 7 but named nowhere in the law or the runbook, so the next session would
never learn that it holds the key names; `AGENTS.md` and `BOOT.md` now point at it.
Step 3 said "fill its generic section for this client" even when a profile for that
client already ships, and Step 7 checked decisions in a root Step 4 does not write.

`trash.sh` was exercised on both paths: the Recycle Bin branch recycled a file, and
the POSIX branch — with `PATH` stripped of PowerShell — moved one into
`OperTrash/<date>/` and printed the destination. The run then repeated from a third
empty folder with no findings.

**Still unproven.** The interview and the git-initialization question need a human,
so their content here was a stand-in, not an answer. Nothing ran on Linux, macOS or
WSL: the POSIX trash branch was tested by hiding PowerShell from `PATH`, which is
not the same thing. The three MCP servers called during the run were all dead
(`obsidian`: connection cancelled; `searchmcp`: timeout; `zvec-grep`: server failed
to start), so Step 5's "one real call" produced no success — a fact about this
machine, recorded in `TOOLS.md`, not a property of the package.
