# Manifest

Built 2026-10-20 from a live workspace that uses this kit daily. It is not a
snapshot of a template: every document, script and router here is the version
that is actually in use, with the private material removed.

## What ships

| Path | Contents |
|---|---|
| `AGENTS.md` | The law, loaded every turn: truth contract, sanity gate, permissions, memory rules, Git rules (83 lines) |
| `BOOT.md` | The runbook: task start, memory verbs, skill routing, engineering procedure, safety, layout, diagnostics |
| `HOSTS.md` | The tool surface per client: one verb table, a Freebuff Desktop profile, a generic profile, and how to wire a new host |
| `BIRTH.md` | First-run bootstrap: probe, profile, create the tree, interview, verify, delete itself |
| `SKILLS.md` | The 31 routers with their trigger descriptions and the four-block authoring contract |
| `PROVENANCE.md` | Origin and license of every vendored pack, and what was withheld because its license forbids this kind of redistribution |
| `skills/` | 31 routers, 245 parts, 2 289 files: browser, research, design, decks, documents, security, OSINT, reverse engineering, memory, planning, review, ship and the rest |
| `_scripts/` | `memory.py` (the RSI tree, stdlib SQLite), `eval_skills.py` (context cost + trigger benchmark), `sync_skills.py` (one-way publish to a host skill folder), `parity_claim.py`, `secret_gate.py` + a 17-entry baseline of reviewed vendor samples, `mcp-call.py`, `trash.sh` + `trash.ps1` |
| `_memory/` | `INDEX.md` only. Birth adds `USER.md` and the store `memora.db`; that store is tracked on purpose, so a clone carries its decisions, and none of the three ships in this package |
| `LICENSE` | CC BY 4.0 for first-party material; vendored parts keep their own |
| `.gitignore` | Keeps caches, SQLite's side files, the generated graph, parity claims and `.env` out of a clone; the memory store itself is tracked |
| `PORT-PLAN.md` | The port's decision inventory: what moved from the live workspace, what was dropped and why, and the ledger of how each claim was checked |

## What is not here, and why

| Missing | Reason |
|---|---|
| `docs/` and `knowledge/` trees | One copy of each rule. The normative content lives in `AGENTS.md` and `BOOT.md`; the long essays were about a specific stack and are gone. |
| A flat skill list | Replaced by routers with parts. Five routers retired upstream are not carried; two operator runbooks (`router-admin`, `omniroute`) describe one machine and one account, so they stay private. |
| `documents/parts/docx`, `pdf`, `xlsx`, `decks/parts/pptx` | © Anthropic, all rights reserved. Not redistributable in a public kit. |
| `decks/parts/lieflat-charts` | PolyForm Noncommercial 1.0.0: a noncommercial pack cannot ship inside a kit that permits commercial use. |
| `telegram/parts/no-agi-posts`, `security/parts/pentest-tools/src-hunter` | One channel's house style; and a third-party pack with no license record inside it. |
| Owner memory, reports, canon file | Decisions, sessions and surveys about someone's own work. The tree is created fresh at birth. |
| Publishing, account and device scripts | They encode remotes, keys and one person's hardware. |
| `projects/`, `tools/`, `inbox/`, `_archive/` | The owner's work, third-party clones, imported material and cold storage. |

The routers name what is absent instead of pretending: `decks` and `documents`
say which engines are not bundled and that an install must be recorded in
`PROVENANCE.md`.

## How it was verified

1. **Reading, not pattern matching.** Every root document, every script and every
   `SKILL.md` was read; the sections of vendored parts that could carry identity
   were read in full. Each file got a verdict — ship, redacted, excluded — with
   the reason, in the port record this package was built from.
2. **Paths resolve.** Every path named in a shipped document exists in the
   package, or is explicitly created by `BIRTH.md`. Every `parts/<x>/` reference
   in a router resolves to a real folder; cross-router references carry the full
   `skills/<router>/parts/<x>/` path.
3. **Scripts run on a bare tree.** `memory.py` was exercised through every verb on
   a scratch store; `eval_skills.py` reports 31 routers, `AGENTS.md` at 83 lines and
   a trigger benchmark of Hit@1 27/31, Hit@3 31/31; `sync_skills.py` exits 0 with
   no host folder and plans correctly with one; `parity_claim.py` creates and lists a
   claim. `secret_gate.py` exits 0 on the shipped tree and exits 1 on a secret added
   afterwards — both runs recorded, because a gate that only ever passes is untested.
4. **Licenses were read**, not assumed — that is how the four Anthropic packs and
   the noncommercial chart gallery were caught before publication.
5. **The bootstrap was run cold** in an empty folder outside the repository, and
   again after the fixes. Six breakages came out of it, all fixed; the record is
   `PORT-PLAN.md` § 10.

## Updating this package

The direction depends on what changes. A **skill** starts in the live workspace and
comes here with its personal parts stripped — account names, private paths, one
machine's numbers. The **law** is written here first, in wording that does not
assume a client, and adapted in the workspace, because the workspace copy is allowed
to name its own host. A **tool** starts wherever it is used and is copied, never
moved, so the live instance keeps working.

Then: regenerate `SKILLS.md` from the frontmatter, add the license line to
`PROVENANCE.md` if the material is vendored, update the counts above when the tree
changes, and read the diff before committing — a leak enters through a bulk copy,
not through a sentence.

There is no build step. The package was generated from workspace layers until
2026-10-20; that builder is retired, because a regeneration would have replaced this
law with the workspace's and re-added what the read-pass removed.
