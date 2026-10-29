# WIKI.md — the kit's map

> One page answers "where does this live?" for everything that ships. The law is
> `AGENTS.md`; the procedure is `BOOT.md`; the map is here. If a document and the
> disk disagree, the disk wins and the document is fixed.

## Find it by question

| You need | Read |
|---|---|
| The rules: truth, permissions, memory, Git | `AGENTS.md` |
| How a task starts, how work is verified, where files go | `BOOT.md` |
| Which tool implements *ask*, *propose*, *publish* on this client | `HOSTS.md` |
| What this package ships and what it refuses to ship | `MANIFEST.md` |
| Which routers exist and what fires them | `SKILLS.md` |
| Who owns the code in a router, under which license | `PROVENANCE.md` |
| How the port was checked, and what stayed unproven | `PORT-PLAN.md` |
| How to install, and what the first run does | `README.md`, then `BIRTH.md` |
| This machine: interpreters, ports, MCP servers, key names | `TOOLS.md`, written by birth |
| Decisions taken here and why | the memory tree, `_scripts/memory.py walk --root root/canon` |
| A skill by situation | `skills/<router>/SKILL.md`, parts on demand |

## The four layers

1. **Law** — `AGENTS.md`, loaded every turn, at most 85 lines. It names no tool.
2. **Runbook** — `BOOT.md`, read at task start: orientation, memory verbs, skill
   routing, engineering procedure, safety, layout, diagnostics.
3. **Client** — `HOSTS.md`, the verb-to-tool map for the host in use.
4. **Machine** — `TOOLS.md`, written by `BIRTH.md`, never shipped.

Everything else is content: `skills/`, `_scripts/`, `_memory/`.

## Skills

- A router exists only where a domain has real sub-modes: frontmatter trigger,
  `Choosing a part` table, `Rules`, `Related`. Mechanics live in
  `skills/<router>/parts/<part>/` and load on demand.
- A domain with one body is a single-page skill with no `parts/`.
- The trigger description is the only automatic-selection signal: name the
  situation the user is in, not the topic.
- Adding one: write it here in the kit, strip anything that names one person's
  machine, account or channel, record vendored code in `PROVENANCE.md`, regenerate
  `SKILLS.md`, and re-run `_scripts/eval_skills.py`.

## Memory

- One store, `_memory/memora.db`, created by birth. A node carries content,
  `provenance`, `root`, `outcome` and a `supersedes` edge; nothing is overwritten.
- Roots: `root/canon` (owner decisions), `root/workspace`, `root/project/<name>`,
  `root/skill/<name>`.
- The owner holds the veto over a promotion. A canon-versus-disk disagreement is a
  question, not an edit.
- Records that are too large for a node belong in a dated file, not in the tree.

## How the kit is updated

`MANIFEST.md` § "Updating this package" is the procedure; it is short and it is the
only place the direction is written down. A skill travels from the workspace with
its private parts stripped; the law is edited here first and adapted in a
workspace; a tool is copied, never moved.

## What is deliberately absent

Vendored packs whose licenses forbid redistribution, one operator's runbooks, and
every script that encodes a private remote or account. `MANIFEST.md` lists each
exclusion with its reason; `PROVENANCE.md` records what an install must bring.
