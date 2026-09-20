---
name: identity-federation
description: Use for authorized assessment of federated identity systems including SAML, OIDC, OAuth2 flows, SSO misconfiguration, and token confusion issues.
---

# Identity Federation (SAML / OIDC / OAuth)

## Before you start

1. `NOW`: read the local precedent if one exists; SSO test accounts and the IdP/SP
   scope go into the scope document.
2. `NOW`: brute-force attempts that lock out real user accounts are forbidden.
3. `NEXT`: interception tools and documentation (the metadata URLs).
4. `ACT`: map the protocol flows → common misconfigurations → verify.

## When to use

- SAML Response signature/assertion tampering surfaces (the classic defect patterns).
- OIDC implicit flow / authorization code without PKCE.
- redirect_uri / state / nonce problems.
- IdP and SP metadata, multi-tenant issuer confusion.
- Complements the JWT attacks in `api-security` (this skill covers federation and SSO flows).

## Workflow

```text
□ Draw the flow: User → SP → IdP → Token → SP
□ Collect: /.well-known/openid-configuration, SAML metadata
□ Check: exact redirect_uri matching, state binding, PKCE
□ Check: SAML signature coverage, algorithm downgrade
□ Session fixation and logout invalidation
```

## Toolchain

| Tool | Purpose |
|------|---------|
| Burp + SAML Raider and similar | assertion editing (authorized) |
| jwt_tool | JWT segments |
| Browser DevTools | redirect chains |
| IdP admin logs | audit |

## References

- `references/sso-flow-checklist.md`
- `../api-security/`, `../windows-ad/` (enterprise IdP)

## Routing context

**Upstream**: MASTER R37
**Downstream**: pure API JWT → api-security; cloud IdP → cloud-k8s

## Completion self-check

- [ ] Was the full SSO flow mapped?
- [ ] Does every finding have a reproduction and an impact?
- [ ] Checklist?
