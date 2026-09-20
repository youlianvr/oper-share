---
name: database-security
description: Use for authorized database security assessment covering PostgreSQL/MySQL/MSSQL/Mongo/Redis exposure, authz, UDF/command paths, and misconfiguration review.
---

# Database Security Assessment

## Before you start

1. `NOW`: read the local precedent if one exists; **destructive statements against
   production databases are forbidden** unless explicitly allowed.
2. `NOW`: the scope must state the instances, the account permissions, and whether
   writes or deletes are allowed.
3. `NEXT`: client tool paths.
4. `ACT`: exposure → authentication → authorization → configuration → safe
   exploit-chain verification.

## When to use

- Databases with no authentication, weak passwords, or wrongly bound to 0.0.0.0.
- Excessive privileges and dangerous features (xp_cmdshell, COPY PROGRAM, UDF).
- Lateral movement: from an application account to DBA.
- NoSQL injection and Redis file-write paths (authorized environments).

## Workflow

```text
□ Network exposure and TLS
□ Account roles and grantees
□ Sensitive-table access control
□ Dangerous configuration: file_priv, xp_cmdshell, load_file
□ Whether audit logging is enabled
□ Backup and snapshot permissions
```

## Toolchain

| Tool | Purpose |
|------|---------|
| Official CLIs | connection and enumeration |
| sqlmap | injection verification (authorized) |
| nuclei | known-exposure templates |
| Cloud RDS console audit | configuration |

## References

- `references/db-misconfig-checklist.md`
- `security/parts/pentest-tools/`, `security/parts/cloud-k8s/`

## Routing context

**Upstream**: MASTER R35
**Downstream**: OS command obtained → attack-chain; cloud-hosted → cloud-k8s

## Completion self-check

- [ ] Were unauthorized writes and deletes avoided?
- [ ] Was the distinction between a misconfiguration and an exploitable chain made?
- [ ] Checklist?
