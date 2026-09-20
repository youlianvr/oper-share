# ADR — Architecture Decision Records

> One ADR = one architectural decision that is hard to reverse, surprising
> without context, and the result of a real trade-off. If any of the three is
> missing, a finding note or commit message is enough — no ADR.
>
> Existing ADRs live next to this file as `ADR-NNNN-slug.md`.

## Template

```
ADR-NNNN: [Decision Name]

Status: Proposed / Accepted / Deprecated / Superseded
Date:   YYYY-MM-DD

## Context
Why was this decision made? What problem is solved? What constraints exist?

## Decision
What is decided? How exactly?

## Alternatives
Alternative A / B / C:
  Description:
  Pros:
  Cons:

## Rationale
Why was this solution chosen? Why are alternatives worse?

## Trade-offs
What do we gain? What do we lose? What compromises are accepted?

## Consequences
What consequences will arise later? What limitations appear?

## Rollback
How to safely roll back this decision if it proves wrong?

## Review Date
When SHOULD the decision be revisited? On the Review Date, verify the
Decision is still current. MAY be `N/A` (no revisit trigger) or an explicit
date/condition; MUST NOT be earlier than the acceptance Date.
```

Source: rescued 2026-09-11 from the archived docs/Planning.md + docs/Templates.md
during the docs consolidation. Also: three live ADRs already exist here
(ADR-0001 zvec ANN backend, ADR-0002 parallel mistral key pool, ADR-0003
cron-telegram redesign).
