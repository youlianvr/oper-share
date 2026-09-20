# Working Base — Changes Created Outside the Current Session

> **Source of truth for the working-base policy.** The constitution
> (`AGENTS.md`) keeps a one-line pointer to this document.
>
> Status: normative. Owner-approved rule, 2026-08-30, replacing the blanket
> "don't touch foreign work" ban.

---

**All workspace history is the working base.** In this workspace only the owner
and agent variations work. Code written outside the current session (previous
sessions, previous agent variations, manual edits) is a working base, not an
untouchable zone. The agent works with it as its own: read, edit, move, revert
— without a special permission per file. There is no separate "don't touch
foreign work" ban.

**The only restriction: report to the owner.** Autonomy is lifted only where a
decision is unsafe without the owner. The agent reports immediately (records in
the audit ledger as "requires owner decision", continues other areas) when:

1. **Obvious regression** — the change breaks previously working behavior, and
   there is no reason to consider it planned.
2. **Critical change** — the change touches critical infrastructure/configuration,
   and the agent cannot determine itself whether it was planned by the owner.
3. Also report when:
   - **(A) Unclassifiable** — the agent cannot confidently determine the nature
     of the change (regression/plan/routine) or the safety of interacting with it.
   - **(B) Secrets and forbidden zones** — the change touches credentials,
     tokens, environment, live runtime configuration (providers.json, .env,
     cron state), or zones explicitly excluded by the owner (archive, excluded
     defects). "Work as your own" is prohibited there in principle.
   - **(C) Fresh changes** — regardless of scale, from a single line to a mass
     refactor: check parity A* first. If a parallel agent is active (e.g. A2
     working right now), do not touch conflicting zones, record "parallel
     session, zone busy" in the ledger, and report to the owner on
     intersection. If no parallel agent is active, freshness alone does not
     block: the change is working base, the agent works with it as its own
     (without silently reverting it — record it in the ledger).

## Related

- Commit policy: `docs/Version-Control.md`.
- Audit ledger: `knowledge/findings/2026-08-29-oper-workspace-audit-ledger.md`.
