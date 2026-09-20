---
name: digital-forensics
description: Use for authorized digital forensics including memory dumps, disk timelines, PCAP investigation, artifact triage, and IR evidence preservation.
---

# Digital Forensics & IR Artifacts

## Authorization preamble

1. Read the org's IR authorization, or confirm the engagement is **forensics/attribution**, not offensive scanning.
2. Open a case; work on read-only copies first (write-block original media).
3. Tools: Volatility etc. are often manual installs — verify before use.
4. Order of work: preserve hashes → timeline → key artifacts.

## Scope

- Memory dump analysis (Volatility 2/3)
- Disk / E01 / dropped-file timelines
- PCAP attribution and protocol recovery (pairs with `protocol-reverse/`)
- Host artifacts: Prefetch, Shimcache, Event Logs, browser history
- IR IOC extraction (pairs with `malware-analysis/` / `threat-hunting/`)

## Workflow

### 1. Preservation

```text
□ Compute SHA256; record timezone and collection commands
□ Work on copies; originals read-only
□ Chain-of-custody notes written into the timeline
```

### 2. Memory

```bash
vol -f mem.dmp windows.info
vol -f mem.dmp windows.pslist
vol -f mem.dmp windows.netscan
vol -f mem.dmp windows.cmdline
```

### 3. Host artifacts

```text
□ Event logs: Security / PowerShell / Sysmon
□ Persistence: Run keys, services, scheduled tasks, WMI
□ Execution traces: Amcache, Prefetch, BAM
```

### 4. Network

```text
□ tshark session and DNS statistics
□ Export suspicious flows → protocol-reverse or malware C2 analysis
```

## Toolchain

| Tool | Purpose |
|------|---------|
| Volatility 3 | memory |
| Timeline Explorer / Plaso | super timeline |
| tshark | PCAP |
| Eric Zimmerman's tools | Windows artifacts |
| Autopsy / FTK Imager | disk |

## References

- `references/forensics-triage.md`
- `security/parts/malware-analysis/` `security/parts/threat-hunting/` `reverse-engineering/parts/protocol-reverse/`

## Completion self-check

- [ ] Hashes and copy strategy preserved?
- [ ] Timeline reproducible?
- [ ] IOCs sanitized and graded?
- [ ] Checklist written?
