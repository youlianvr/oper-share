# Oper — an agent workspace that keeps its word

A working kit for an AI coding agent, taken from daily use rather than designed on
a whiteboard. It gives the agent four things: a short law it loads every turn, a
runbook it reads at task start, a library of 31 router skills that load on demand,
and a memory tree that never overwrites its own decisions.

The point of the kit is the boring part everyone skips: **the agent tells you what
actually happened.** Artifacts carry no self-justification, chat carries strict
truth, and open questions go to a `STATUS.md` instead of becoming a disclaimer on
the product.

## Quick start

1. Clone this repository and open the folder with your agent client.
2. The agent sees `BIRTH.md` and runs it: it probes the machine, writes its own
   host profile, creates the memory store, interviews you in batches, and deletes
   the file in the first commit. The pass is mandatory; every answer is optional.
3. Done. The workspace is yours; `BIRTH.md` never comes back.

No package manager, no build step, no service to start. Python 3.9 is the floor the
scripts are written for, and the last full run was on 3.14: treat 3.9 as intended,
not as verified. Everything else is markdown.

## What is inside

| Path | What it is |
|---|---|
| `AGENTS.md` | The law, 83 lines: truth contract, sanity gate, permissions, memory and Git rules |
| `BOOT.md` | The runbook: how a task starts, how memory is read and written, how work is verified |
| `HOSTS.md` | The tool surface of your client — a Freebuff Desktop profile ships as the reference |
| `TOOLS.md` | This machine: OS, interpreters, services, and the names — never the values — of the keys in `.env`; birth writes it |
| `BIRTH.md` | The first-run bootstrap; it deletes itself |
| `SKILLS.md` | The 31 routers and the four-block shape every one of them follows |
| `PROVENANCE.md` | Where vendored material came from, under which license, and what was withheld |
| `MANIFEST.md` | What ships, what does not, and how the package was verified |
| `skills/` | 31 routers with 245 parts: browser, research, design, decks, documents, security, OSINT, reverse engineering, memory, planning, review, ship and more |
| `_scripts/` | The memory tree CLI, the skill-context and trigger evaluator, the one-way skill sync, trash-only removal, the secret gate |
| `_memory/` | `INDEX.md` ships; birth adds `USER.md` and the memory store, and both stay in your repository |

## The four ideas worth stealing

- **Two-contour truth.** Product artifacts say what the product does. The
  conversation says what was verified and what failed. The two never mix.
- **Sanity gate.** A homonym, a prompt that disagrees with the disk, or an unclear
  destination stops the first mutating action for a question.
- **Routers, not a list.** A skill that has real sub-modes is a router: a trigger,
  a table of parts, rules, related work. Everything else is one page.
- **A tree, not a notebook.** Decisions are nodes with provenance; a changed
  decision supersedes the old one and both directions of that edge are written.

## What is not included

Third-party packs whose licenses forbid repackaging, one person's operator
runbooks, owner memory and reports, and the scripts that encode private remotes
and accounts. `MANIFEST.md` lists each exclusion with its reason, and
`PROVENANCE.md` records which engines a skill expects you to install yourself.

## License

First-party material is **CC BY 4.0** — share and adapt, keep the attribution. See
`LICENSE`. Vendored folders keep their own licenses; `PROVENANCE.md` is the map.
