# skills-lock.json — Megapack Protection and Survivor Inventory

> **RETIRED 2026-09-13.** The file was recycled on the owner's word: it had
> drifted 19 skills behind the disk and still listed two directories that no
> longer exist, so it was no longer a membership boundary — the on-disk
> `.agents/skills/` set is. This page is kept as history of the megapack guard
> and of the 2026-08-07 archive pass. Do not treat it as current state.

**Date:** 2026-08-07
**Context:** After auditing 395 skills (2026-08-07), 233 were moved to archive
`_archive/skills-trash-20260807/`, leaving 162 active (151 global + 11 project).
`skills-lock.json` in the repo root freezes this state so that
megapack updates don't restore deleted skills, and any session can
read "what's alive / what's archived."

**Update 2026-08-08:** Snapshot resynced from disk — **164** active
(151 global + 13 project; project count grew by 13 due to
`telegram-bot-hosting-triage` and `tool-claims-verification`, `autorun` was
already locked), archive — 233.

**Update 2026-08-09:** Wave 2+3 (31+1 archived, 4 merges) → 132 active;
Wave 4 (content audit, broken links) → 132; Wave 5 (usage audit: brainstorming
moved to preload, web-design-guidelines → frontend-design, strict-api →
zero-hallucination-coder, 14 skills with 0 calls archived) → **118** active
(105 global + 13 project), archive — **279**.

---

## File Structure

```json
{
  "version": 1,
  "skills": {
    "agent-reach": {
      "source": "Panniantong/Agent-Reach",
      "sourceType": "github",
      "skillPath": "agent_reach/skill/SKILL.md",
      "computedHash": "..."
    }
  },
  "snapshot": {
    "capturedAt": "2026-08-07",
    "purpose": "Megapack-update guard: do NOT auto-install skills present in \"archived\"; keep exactly \"survivors\" + \"projectSkills\" active.",
    "activeTotal": 162,
    "activeGlobal": 151,
    "activeProject": 11,
    "archivedCount": 233,
    "survivors": ["a11y-audit", "...", "zero-hallucination-coder"],
    "projectSkills": ["android-adb-automation", "...", "tg-check"],
    "archived": ["ab-test-setup", "...", "yourvpndead-vpn-detection"]
  }
}
```

- **`version`** — file schema (1).
- **`skills`** — skills installed via `npx skills add` with known
  source/hash. Add here when installing new community skills.
- **`snapshot`** — state at `capturedAt`:
  - **`survivors`** — allowlist: active global skills
    (`~/.agents/skills/`), do not touch them.
  - **`projectSkills`** — workspace-local wrapper (`.agents/skills/`),
    does not participate in megapack updates at all.
  - **`archived`** — blocklist: skills moved to
    `_archive/skills-trash-20260807/`. Megapack install should not
    restore them.

---

## How to Block Megapack Install

When updating/installing a megapack (or any other skill package):

1. **Before install** read `archived` from `skills-lock.json`.
2. From the package candidate list, drop all names matching `archived` —
   they were intentionally removed.
3. From the rest, drop names from `survivors` — they're already installed (don't overwrite).
4. Install only the new, non-overlapping tail.

Verify with one script:

```bash
python - <<'PYEOF'
import json
lock = json.load(open('skills-lock.json'))['snapshot']
blocked = set(lock['archived']) | set(lock['survivors']) | set(lock['projectSkills'])
# candidates — list of names the package wants to install
candidates = [...]   # e.g.: new_pkg_manifest.keys()
new_only = [c for c in candidates if c not in blocked]
print('Blocked (archived):', sorted(set(candidates) - set(new_only)))
print('New to install    :', sorted(new_only))
PYEOF
```

After any install/remove — resync `snapshot` from disk:

```bash
python - <<'PYEOF'
import os, json
def dirs(p): return sorted(d for d in os.listdir(p) if os.path.isdir(os.path.join(p, d)))
lock = json.load(open('skills-lock.json'))
rem  = dirs(os.path.expanduser('~/.agents/skills'))
proj = dirs('.agents/skills')
arch = dirs('_archive/skills-trash-20260807')
lock['snapshot'].update({'capturedAt':'<date>','activeTotal':len(rem)+len(proj),
  'activeGlobal':len(rem),'activeProject':len(proj),'archivedCount':len(arch),
  'survivors':rem,'projectSkills':proj,'archived':arch})
json.dump(lock, open('skills-lock.json','w'), ensure_ascii=False, indent=2)
PYEOF
```

---

## How to Restore Skills from Archive

The archive is a normal directory, everything is reversible. No `rm`, only `mv`.

```bash
# One skill
mv "_archive/skills-trash-20260807/<name>" ~/.agents/skills/

# Multiple
for d in postmortem pulse playwright-pro; do
  mv "_archive/skills-trash-20260807/$d" ~/.agents/skills/
done

# All at once (restore 233)
mv _archive/skills-trash-20260807/* ~/.agents/skills/ 2>/dev/null
```

Full manifest of moved items: `_archive/skills-trash-20260807/MANIFEST.md`
(sections: main cleanup, Merge 2026-08-07, Border finalize 2026-08-07 —
with reasons for each skill).

---

## Audit Timeline 2026-08-07

| Phase | What | Archived | Remaining Active |
|-------|------|----------|-----------------|
| Initial | 395 directories (387 active + 8 `._trash_*`) | — | 387 |
| DEL/TRASH/DEPREC cleanup | 217 moved | 217 | 178 |
| Real duplicate merge | 5 moved (post-mortem, database-schema-designer, accessibility, using-git-worktrees, pr-review-expert) | 222 | 173 |
| Border finalize | 11 moved (last30days, behuman, caveman, landing-page-generator, skillopt-sleep, incident-commander, init, generate, fix, review, migrate) | 233 | **162** |

Companion audit files (in `_archive/`):
- `skills-audit-inventory.txt` — all 395 skills: source, lines, description
- `skills-audit-result.json` / `skills-audit-result-final.json` — map "skill → category → rationale"
- `skills_audit_classify.py` — classifier (KEEP/MERGE/DEL/BORDER)

---

## Rules

- **Do not install** skills from `archived` without explicit owner decision.
- **Do not overwrite** `survivors` with megapack update — only touch individually.
- **After any skill change** — resync `snapshot`.
- **Deletion** — only via `mv` to archive (or `_scripts/trash.sh` to recycle bin),
  never `rm`.
