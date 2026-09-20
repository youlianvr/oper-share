---
name: code-audit
description: Use for authorized source-code security review and SAST workflows including Semgrep, CodeQL patterns, dangerous API hunting, and fix verification.
---

# Source Code Security Audit

## Before you start

1. `NOW`: read the local precedent if one exists, or confirm the code-audit authorization.
2. `NOW`: confirm **source or repository access** (no source, only a binary → switch to a RE skill).
3. `NOW`: state the language stack and the scope (directories / services / PR diff).
4. `NEXT`: the tool index; semgrep and similar.
5. `ACT`: threat-model sketch → automated scan → manual verification.

## When to use

- White-box audits, PR and diff security reviews.
- Semgrep / CodeQL / Bandit / gosec and similar SAST tools.
- Dangerous APIs, injection points, missing authorization, crypto misuse.
- Division of labor with `supply-chain-security/`: this skill covers **your own code
  logic**; the supply-chain skill covers dependencies and pipelines.

## Workflow

### 1. Scope and threat model

```text
□ Trust boundaries: user input, files, deserialization, SSRF, auth middleware
□ High-value assets: authentication, payments, admin surfaces, secret handling
```

### 2. Automated scan

```bash
semgrep --config auto .
# or project rule packs
semgrep --config p/owasp-top-ten .
```

### 3. Manual verification (MUST)

```text
□ Every SAST hit: reachable? exploitable? false positive?
□ Authorization: IDOR / privilege escalation, missing checks, wrong tenant isolation
□ Injection: SQL / command / template / LDAP
□ Crypto: hardcoded keys, ECB, custom crypto
```

### 4. Output

```text
Finding: location + data flow + PoC + fix recommendation
Optional ATT&CK / CWE identifiers
```

## Toolchain

| Tool | Language / scenario |
|------|---------------------|
| Semgrep | multi-language quick rules |
| CodeQL | deep data flow (GitHub) |
| Bandit | Python |
| gosec / staticcheck | Go |
| SpotBugs / FindSecBugs | Java |

## References

- `references/sast-review-checklist.md`
- `security/parts/supply-chain-security/`, `security/parts/api-security/`, `security/parts/llm-security/` (agent code)

## Routing context

**Upstream**: MASTER R26
**Downstream**: dependency vulnerabilities → supply-chain; runtime verification → pentest-tools

## Completion self-check

- [ ] Was every hit verified manually rather than pasted from scanner output?
- [ ] Does the report include fix recommendations?
- [ ] Was the work limited to authorized repositories?
- [ ] Checklist?
