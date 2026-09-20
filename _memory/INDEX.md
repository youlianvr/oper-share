# Memory Index

This layer holds owner facts, decisions, dangling tasks, and error history.
**It is empty on purpose in this package**: personal memory never ships.
It becomes real during the birth interview (`BIRTH.md`) — entries below are
the files to create as answers arrive, not placeholders to ignore.

| File | What lives there | Created when |
|------|------------------|--------------|
| `USER.md` | Identity, language, autonomy level, agent persona | birth: identity + persona blocks |
| `HARD_RULES.md` | The user's standing hard rules (numbered H0+) | birth: danger zones / boundaries |
| `DANGLING_TASKS.md` | Open threads and deferred verdicts | first defer happens |
| `ERROR_LOG.md` | Recurring errors and their fixes | first recurring error |
| `WINS_LOG.md` | What worked, so it repeats | first notable win |

Rules: markdown is canonical; facts, not prose; a stale index is a lie told
to the next session — update it in the same commit that changes the layer.
