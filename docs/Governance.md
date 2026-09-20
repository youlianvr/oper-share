# Governance

> **Rules about rules.** Ownership of the meta-layer: what is normative, what
> is informative, which keywords carry obligation, and how the document layer
> keeps matching the disk.
>
> Rewritten 2026-09-13 (owner-approved) from a 541-line version. Its live body
> carried a second priority ladder that contradicted `AGENTS.md`, a SemVer
> contract that was never honoured (12+ breaking changes since 5.0.2, zero
> bumps), a hand-maintained machine index that had rotted (8 normative and 8
> informative paths no longer on disk), and a 4-step deprecation ritual never
> once executed. Removed text: `_archive/2026-09-11-docs-consolidation/Governance.md`.
> The Change Log below is history and is not edited.

---

## Rule Priority

There is exactly one ladder: `AGENTS.md` → **Owner Authority — Priority
Ladder**. The owner's direct words in this chat are rank 1; Never Destroy
(Trash-Only) is the single absolute above everything, including rank 1.

A second ladder is not maintained here. Two competing ladders were the drift
this rewrite removes: the old one put owner requirements at rank 5 and
duplicated capability discovery as levels 0a and 0b.

---

## RFC 2119 Keywords

| Keyword | Meaning |
|---|---|
| **MUST** / **MUST NOT** | absolute — deviation is a violation of the constitution |
| **SHOULD** / **SHOULD NOT** | strong — deviation requires a stated reason |
| **MAY** | agent's discretion |

A deviation from MUST/MUST NOT is allowed only when a higher-priority rule
justifies it, is named out loud in the response, and is never hidden.

---

## Document Classification

**Normative** — binding, cumulative: `AGENTS.md`,
`docs/Principles.md`, `docs/Code.md`,
`docs/Data-Safety.md`, `docs/Version-Control.md`, `docs/Working-Base.md`,
`docs/Infrastructure.md`, `docs/Governance.md`,
`docs/Autonomy-Charter.md`.

**Informative** — reference, service notes, templates, records:
`docs/KB-RAG.md`,
`docs/adr/**`, `docs/superpowers/**`, `docs/hiveproxy-v3/**`,
`knowledge/wiki/**`, `agreements/**`.

**Bootstrap** — session entry point: `BOOT.md`.

Local agreements may refine project context and collaboration style but must
not override `AGENTS.md` or the normative documents. The former
`runtime-profiles/` layer was archived on 2026-07-21; archived paths are not
live routes.

**Pointers die with their target.** Archiving or renaming a document obliges
the same commit to repair every live reference to it.

---

## The Docs Gate

`docs/document-status.toml` is the machine-readable projection of the
classification above. `_scripts/validate_doc_routes.py` checks it against the
disk: every listed path exists, no live `docs/` file is unclassified, no live
route sits on an archived prefix.

- A commit that touches `docs/` (or the manifest) must pass
  `python _scripts/validate_doc_routes.py`. A failing gate blocks the commit —
  fix the manifest or the pointers first, never commit around it.
- The gate also runs from `.githooks/pre-commit`; install it with
  `git config core.hooksPath .githooks`. Skipping it with `--no-verify` needs a
  stated reason, because it is the only automatic drift detector in the layer.
- There is no constitution version number and no deprecation ceremony. What
  changed, when and why is visible in git and in the Change Log below.

---

## Change Log

History moved out of the live layer to `_archive/2026-09-13-governance-changelog.md`
on 2026-09-13. Version bumps stopped being honest long before that, so the live
document no longer carries them; git holds the same history.
