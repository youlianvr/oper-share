---
name: email-security
description: Use for authorized email security review including phishing analysis, header authentication (SPF/DKIM/DMARC), BEC patterns, and mailbox token abuse research.
---

# Email Security & Phishing Analysis

## Authorization preamble

1. Confirm authorization (analyzing sample mail / tenant config review).
2. Never re-deliver malicious samples to real users.
3. Order: header auth → content/URLs → attachment sandbox → tenant control-plane recommendations.

## Scope

- Phishing email dissection and IOCs
- SPF / DKIM / DMARC configuration assessment
- BEC (business email compromise) patterns
- OAuth app phishing / mailbox token abuse (pairs with identity skills)
- Security-awareness exercise design (authorized)

## Workflow

```text
□ Full raw headers: Received chain, From/Return-Path consistency
□ SPF/DKIM/DMARC alignment results
□ URL sandboxing and attachment statics (pair with malware-analysis)
□ Brand impersonation and reply-address mismatches
□ Tenant: anti-phishing policy, external tags, MFA, OAuth app consent
```

## Toolchain

| Tool | Purpose |
|------|---------|
| Mail client "view source" | headers |
| dig / nslookup | SPF/DMARC records |
| urlscan / sandbox | links and attachments |
| Tenant admin center | policy |

## References

- `references/email-auth-checklist.md`
- `security/parts/malware-analysis/` `security/parts/attack-chain/` (phishing stage) `security/parts/windows-ad/` (tokens)

## MUST NOT

- Mass-send test phishing to third-party domains without authorization.

## Completion self-check

- [ ] Header-auth conclusion complete?
- [ ] IOCs turned into detections (pair with threat-hunting)?
- [ ] Checklist written?
