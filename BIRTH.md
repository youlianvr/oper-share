# BIRTH.md — run this once, then delete it

> You have been handed an empty Oper workspace. This file is the first run: it
> probes the machine, profiles the host, creates the memory tree, interviews the
> user, and ends by deleting itself in the same commit as the first personalized
> change. If `BIRTH.md` is still here, the workspace is not initialized.
>
> **The pass is mandatory; the content is optional.** You must walk every step.
> Nothing is adopted without an explicit yes: not a folder, not a server, not a
> demo. Every recommendation below is an option with a question attached.

---

## Step 0 — Read the law, then say what you read

Read `AGENTS.md`, `BOOT.md` and `HOSTS.md` before touching anything. In two or
three sentences, tell the user what this workspace is: a constitution that
prioritizes a real product and strict truth, a runbook, a skill library, a memory
tree, and a small script layer. No quotes from the files — say it in your own
words, and name the one absolute: nothing is ever destroyed, removal goes to the
trash.

If a tool named in `HOSTS.md` does not exist on this host, say so now, before the
interview, and add the host profile entry that replaces it.

## Step 1 — Probe the machine yourself

Never ask what can be measured. Collect, then present for confirmation:

- OS and shell, `git --version`, `python --version`, `node --version`, package
  managers, available disk space. Note which interpreter answered — `python` or
  `python3` — because every command below writes `python` and means that one.
- Whether `~/.agents/mcp.json` (or this host's MCP config) exists, and which
  servers it declares.
- Whether this host has a skill folder that `_scripts/sync_skills.py` can publish
  into — run it with no arguments; it prints what it found.
- Whether the folder is a git repository (`git status`). If it is not, say so and
  ask whether to initialize one; the closing commit needs it.
- `git config user.email` — a fresh machine has none, and the closing commit fails
  without it. Ask for the name and address to record if they are missing.

Present the findings as a short table with a single question: "anything wrong in
this picture?" Correct it from what they say, not from documentation.

## Step 2 — Create the tree before asking anything

The interview answers belong in memory, not in a markdown sheet that gets
overwritten. So the store comes first:

```bash
python _scripts/memory.py init
```

Then one node that records the act of birth itself:

```bash
python _scripts/memory.py branch --root root/workspace \
  --provenance owner_manual_edit --status active \
  --content "Workspace initialized from the Oper kit; interview follows."
```

Create the growth folders only if the user confirms them in Step 4 — an empty
folder nobody asked for is a decision made silently.

## Step 3 — Profile the host, do not interrogate about it

`HOSTS.md` already lists the verbs the law needs and may already carry a profile
for this client. If one matches, confirm it instead of rewriting it. If none
matches, fill the generic section: the tool behind *ask*, *propose*, *delegate*,
*show file*, *show app*, *publish*, *elevate*. Verify each with one real call
before writing it down — a name read from documentation is not a working tool.
Where a verb has no tool, write `absent` and the fallback you will use instead.

## Step 4 — The interview, in batches, until "enough"

Ask through the host's question channel, never as a wall of prose. Small batches,
each with a consequence in one line per option, best option first. After each
batch: "anything else you want configured?" The interview closes only on an
explicit "enough" — not when your question list runs out.

1. **Identity** — name or handle, how they want to be addressed, and the language
   of the conversation (documents, code and commits stay English).
2. **Work profile** — what this workspace is for: code, study, research, content,
   operations. This decides which skills and servers you propose first.
3. **Autonomy** — default mode: ask on every consequential fork, or act inside the
   task and report? What is never allowed without a fresh approval (push, deploy,
   sends, paid calls, accounts, keys)?
4. **Growth folders** — offer, do not impose: `projects/<name>/` for their own
   work, `projects/school/<course>/<work>/` for coursework, `tools/` for
   third-party tooling that is read and updated but never mixed into projects,
   `inbox/` for imported material, `_archive/` for cold storage with an index.
   Record adopted and skipped.
5. **Git habits** — commit frequency and message style; whether commits are a
   reflex after each logical step or only on request. Push policy is not a habit,
   it is a permission: one authorization per push.
6. **Danger zones** — folders the agent must never touch and data that never
   leaves the machine. Extend `.gitignore`; confirm that the only secret store is
   one `.env` at the root, which stays untracked.
7. **Persona** — a name and character for the agent, or the neutral default.
8. **Anything they raise** — a question they ask is a block of its own. Ask it
   fully, do not fold it into another topic.

Write each answer as a memory node as it arrives — `--provenance owner_decision`
or `owner_preference`, one node per decision, with the consequence in `--outcome`.
Answers that change how you behave also go into `_memory/USER.md`: create that file
with the first answer, using the shape the table in `_memory/INDEX.md` describes.
The node keeps the reasoning, the file keeps the operating facts, and the file
stays under 200 lines.

## Step 5 — Skills, servers and the demo

- **Skills.** `skills/` is the whole library; nothing is installed per project. If
  the host has a skill folder, run `python _scripts/sync_skills.py` and read the two
  lines it prints: `changed:` names the routers whose host copy differs, `stale:`
  names folders this tree does not own and will leave alone. Show that line to the
  user, say that `--apply` replaces the host copies of those routers — and that the
  host folder may hold skills which are not this tree's — then apply only on a yes.
  Read `SKILLS.md` for what is there; do not read all 33 routers.
- **MCP servers.** If the host has an MCP config, list what it actually declares
  and make one real call to one server the user cares about. A server that is
  configured but never called is a decoration. Install nothing new without a
  reason the user gave.
- **The demo, only on a yes.** Offer one harmless run so the mechanics are visible:
  a sanity-gate question on a real fork, a follow-up card, and one removal that
  goes to the trash instead of a delete. Skip it if they decline.

## Step 6 — Write down what the machine needs

Create `TOOLS.md` from Step 1: OS and shell, interpreters, the ports and services
this workspace relies on, the MCP servers that answered, and the *names* of the
environment variables in `.env` — never their values. Keep it a map, not an essay.

If the answers left something open — a key nobody has, a decision postponed — put
it in the relevant project's `STATUS.md`, or in `_memory/reports/` when it has no
project yet. An open question is never parked inside `USER.md`.

## Step 7 — Verify, then close

1. `python _scripts/memory.py walk --root root/workspace` shows the birth node, and
   `--root root/canon` shows the decision nodes.
2. `_memory/USER.md` exists and stays under 200 lines: facts about the user, not
   a rulebook.
3. `TOOLS.md` exists and holds names, not values.
4. `HOSTS.md` reflects this client, including the verbs it does not have.
5. The user confirms they understand the priority order and hold the veto.

Then delete this file and commit:

```bash
_scripts/trash.sh BIRTH.md
git add -A
git commit -m "birth: workspace initialized for <user>"
```

Read the commit before moving on: it must carry `_memory/memora.db`. A clone that
starts without the store starts without every decision made here.

After that commit the workspace is no longer a template — it is theirs.
