---
name: ship
description: >-
  Delivering changes safely: release preparation, dependency audits and
  scoped updates, secrets hygiene, changelog generation, Git conventions
  and worktrees, GitHub Actions, technical-change tracking, technical-debt
  tracking, operational runbooks. One contract; parts under parts/.
---

# ship — delivering and maintaining releases

> Safety rail across the parts: publishing, tagging, and deploying are
> separate authorizations. A part may prepare everything and still stop
> before the public action.

## How to use it

Pick the parts that match the task from the table and read those files.

## Parts

**Releasing and dependencies**

| Part | What it covers |
|---|---|
| `parts/release/` | Prepare a named version: preflight, version consistency, build/package, smoke test, checksums/notes — stops before any public release action |
| `parts/dependency-auditor/` | Audit dependencies across multi-language projects: vulnerabilities, licenses |
| `parts/dependency-update/` | Scoped dependency updates: release notes first, explicit scope only, no update-everything |
| `parts/env-secrets-manager/` | Environment-variable hygiene and secrets safety, local to production |

**VCS and change tracking**

| Part | What it covers |
|---|---|
| `parts/git/` | Standardized Git operations: conventional commits, branch naming, workflow rules |
| `parts/git-worktree-manager/` | Parallel feature work via Git worktrees: branch isolation, safe cleanup |
| `parts/github-actions-docs/` | GitHub Actions workflows: syntax, caching, matrix builds, common gotchas |
| `parts/changelog-generator/` | Consistent, auditable release notes from Conventional Commits |
| `parts/tc-tracker/` | Technical-change records and TC lifecycle management |
| `parts/tech-debt-tracker/` | Scan for technical debt, score severity, prioritize remediation |

**Operations**

| Part | What it covers |
|---|---|
| `parts/runbook-generator/` | Operational runbooks from a service name: deployment, incident response, maintenance |

## Choosing

- **"Cut a release"** → `parts/release/` (prep only; publishing needs your
  explicit word).
- **"Update dependency X"** → `parts/dependency-update/`; "audit our deps" →
  `parts/dependency-auditor/`.
- **Commit/branch conventions** → `parts/git/`; parallel workstreams →
  `parts/git-worktree-manager/`.
- **"What changed since / track this change"** → `parts/tc-tracker/` or
  `parts/changelog-generator/`.
- Writing and changing the code itself → the `dev` router.
