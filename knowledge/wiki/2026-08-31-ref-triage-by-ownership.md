# Lesson: triage workspace "broken refs" by ownership before acting

**When:** 2026-08-31, master-plan v3 Stage B content-review.

**Context:** `_scripts/workspace_audit.py --json` reported 345 of 3309 refs
"broken". A naive sweep would have mass-edited hundreds of files, many of them
project subtrees or intentional placeholders.

**What is actually broken (active Oper layer):**
1. `docs/Workspace-Architecture.md` audit block referenced pytest modules
   (`tests/test_validate_doc_routes.py`, `tests/test_validate_repo_layout.py`)
   that live as unittest modules under `_scripts/`, not pytest files under
   `tests/`. Corrected the command set.
2. `docs/document-status.toml` had 5 unclassified, committed docs absent rows.
   `validate_doc_routes.py` reports these as hard errors, which breaks the
   revision closure gate. Added as `informative`.
3. `knowledge/INDEX.md` was missing a row for a findings file created this
   revision (`2026-08-31-stage13-...md`) → an INDEX hole. Added a row.

**Rule (reusable):** when a validator or scanner reports broken references,
bucket them before editing:
- repository-local active-layer refs → fix in place;
- project-subtree links (`../ops/`, project dirs) → out of scope, owned by that
  subtree (`docs/Workspace-Architecture.md` "Link-audit interpretation");
- template/example placeholders inside SKILL.md contract text
  (`exact/path/to/file.py`, `findings/YYYY-MM-DD.md`, `sources/NN.md`,
  `infrastructure/cloud.md`) → intentionally non-resolving, do not rewrite;
- committed-but-unclassified docs → classify in the manifest, do not delete;
- foreign untracked root files → never touch.

A single global "broken links = N" number is not actionable. `Reality >
existing documentation` also applies to index/route manifests, not only prose.

**Verification:** after fixes, `validate_doc_routes` → OK; two matching sweeps
(Stage D) → green; victim-free of foreign files.