# Version Control — Commit Reflex (Local Commits Are the Default)

> **Source of truth for commit policy.** The constitution (`AGENTS.md`) keeps
> a one-line pointer to this document.
>
> Status: normative. Belongs to the Version Control cluster of the Oper
> constitution.

---

**Owner preference for this local workspace:** commits are a reliability
mechanism, not a release ceremony. A small local commit preserves a rollback
point and makes autonomous work recoverable. Therefore, meaningful changes
SHOULD be committed immediately in small logical units, without waiting for a
separate approval or batching unrelated work.

## Repository boundary

- **Local workspace / private working repository:** commit meaningful changes
  by default. Do not leave finished work stranded merely because the owner is
  away; the commit is the recovery point.
- **GitHub-bound, public, shared, or PR-bound repository:** preserve the same
  small-commit discipline, but get the owner's explicit approval before
  creating commits intended for that shared/public history. Never push, open a
  PR, or publish without an explicit request.
- **When the repository's destination is unclear:** treat it as the local
  workspace unless there is evidence that the current change is being prepared
  for public/shared history; ask only when that distinction affects the action.

This is a repository workflow policy, not an attempt to rewrite the runtime
instruction hierarchy. System/developer instructions supplied by the host
remain authoritative for safety and tool use; this file cannot override them.
The local-vs-GitHub distinction applies whenever it is compatible with the
active runtime.

## Rules

- SHOULD commit after any meaningful local change.
- SHOULD commit small logical units, not giant batches.
- SHOULD NOT leave work-in-progress uncommitted at the end of a work cycle
  when the active runtime permits a local commit.
- MUST NOT push without explicit request (H1). Local commits only by default.
- MUST stage only the files changed for the current task; never `git add -A`
  over changes made by others or unrelated to the current task.
- MUST scope a push to the project named by session context. A bare "push"
  means the current project pushed to its own repository. The workspace repo
  (`oper-workspace`) is pushable only on a separate explicit request plus an
  additional confirmation (target repo, branch, included content). Pushes to
  repositories the owner does not own or shares with others require an
  explicit confirmation. Owner rule of 2026-09-18, mirrored in `AGENTS.md`.

## Related

- Working With Pre-Existing Changes (workspace history is the working base):
  `docs/Working-Base.md`.
- GitHub collaboration: issues and PRs only on an explicit owner request — never push, merge, or rewrite shared history. Remote: `<owner-repo>` (verified 2026-09-13; the archived `docs/GitHub-Collaboration.md` templates never ran and named a different repo).
