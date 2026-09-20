---
name: threat-hunting
description: Use for blue-team threat hunting, detection engineering with Sigma/YARA, SIEM query design, and incident detection validation.
---

# Threat Hunting & Detection Engineering

## Authorization preamble

1. Confirm blue-team/hunting authorization and data-source scope (SIEM, EDR exports).
2. Form the hypothesis before querying data — avoid mindless alert-drowning.
3. Verify tooling and data-access methods.
4. Loop: hypothesis → query → validate → codify as a rule.

## Scope

- Hypothesis-driven threat hunting
- Sigma / YARA detection engineering
- Alert tuning, false-positive analysis
- With `malware-analysis/`: sample-side IOCs → this skill lands the detections
- With `digital-forensics/`: case artifacts → lateral hunting

## Workflow

### 1. Form the hypothesis

```text
Example: attacker pivots with living-off-the-land
→ data sources: Sysmon 1/3/10, Windows Security 4624/4648
→ success criterion: anomalous parent process or rare account logon source found
```

### 2. Query and stacking

```text
□ Baseline: normal admin behavior windows and hosts
□ Anomalies: new services, encoded PowerShell, unusual outbound
□ Correlation: same account, many hosts, short interval
```

### 3. Codify

```yaml
# Sigma skeleton lives in malware-analysis; this skill emphasizes:
# - the false-positive surface
# - data-source field mapping
# - response playbook links
```

### 4. Validate

```text
□ Atomic testing (Atomic Red Team) only in authorized labs
□ Replay historical logs to verify recall
```

## Toolchain

| Tool | Purpose |
|------|---------|
| Sigma CLI / sigmac | rule conversion |
| YARA | files / memory |
| SIEM (ELK/Splunk etc.) | queries |
| osquery | endpoint hunting |
| Atomic Red Team | detection validation (lab) |

## References

- `references/hunting-loop.md`
- `../malware-analysis/references/yara-sigma-rules.md`
- `security/parts/digital-forensics/`

## MUST NOT

- Run attack simulations in unauthorized production environments.

## Completion self-check

- [ ] Clear hypothesis and conclusion?
- [ ] Rules annotated with false positives and data sources?
- [ ] Checklist written?
