---

name: api-security
description: Use for authorized security assessment of REST, GraphQL, WebSocket, or SOAP APIs, including discovery, authentication, authorization, rate-limit, and CI/CD testing.

---


# API SecurityTesting


## ACTION REQUIRED (execute immediately after reading)


1. `NOW`: Read `../field-journal/precedent-pentest.md` — confirm this skill's operations are authorized routine work

2. `NOW`: confirm the current task falls within this skill's scope

3. `NEXT`: read `../tool-index.md`, verify tool availability and real paths

4. `NEXT`: if a tool is missing, call bootstrap, do not guess paths

5. `ACT`: enter the workflow's first step and execute, do not stop at confirmation


> Covers REST / GraphQL / WebSocket / SOAP, all protocols.
> A 10-phase methodology, from discovery to CI/CD integration.

## Scope

- REST API security testing (OpenAPI/Swagger-driven or blind)
- GraphQL security audit (introspection, batch queries, alias overload)
- WebSocket security testing
- JWT / OAuth 2.0 authentication testing
- BOLA / IDOR / BFLA authorization vulnerability detection
- API rate-limit bypass and DoS testing

## 10-phase testing flow

### Phase 1: API discovery and recon

```text
Active discovery:
□ Vespasian: headless browser crawl → auto-generate OpenAPI 3.0 / GraphQL SDL spec
□ Entropy --discover: extract endpoints from robots.txt + JS files
□ Kiterunner / ffuf: brute-force undocumented endpoint paths
□ Common paths: /swagger.json, /openapi.json, /graphql, /api-docs

GraphQL introspection (three escalation attempts):
  1. standard introspection query
  2. condensed query (bypasses WAF blocklists)
  3. minimal probe: __schema { types { name } }
```

### Phase 2: Authentication testing

```text
JWT analysis (jwt_tool / Burp):
□ alg:none attack: change the header to "alg":"none", clear the signature
□ Key confusion: RS256 public key → HS256 symmetric key
□ Weak HMAC key brute-force: jwt_tool -C -d wordlist.txt
□ Expiry/claim tampering: modify exp/iat/sub/role claims
□ kid injection: ../../etc/passwd → HMAC signature bypass

OAuth 2.0:
□ redirect_uri manipulation → authorization code leak
□ CSRF via missing state parameter
□ Token leak in Referer header
□ PKCE missing detection

GraphQL authentication:
□ Mutation via GET request → auth bypass (CSRF)
□ Batch query auth bypass
```

### Phase 3: Authorization testing (BOLA/IDOR/BFLA)

```text
BOLA (object-level authorization bypass):
□ Numeric ID enumeration: /user/1 → /user/2 → /user/3
□ UUID enumeration
□ Username/email enumeration
□ Burp Autorize: dual-session replay comparison

BFLA (function-level authorization bypass):
□ Ordinary user calls management APIs
□ HTTP method switch: GET → PUT → PATCH → DELETE
□ API version downgrade: /v2/admin → /v1/admin
□ Batch operation injection: {"users": [1,2,3]} → {"users": [1,2,3,admin_id]}

Tools: Burp Autorize, AuthMatrix, Entropy (malicious_insider persona)
```

### Phase 4: GraphQL specialization

```text
introspection leak → information exposure detection
alias overload → 100+ aliases DoS
batch query → 10+ concurrent queries DoS
field duplication → __typename × 500
directive overload → recursive @skip/@include
circular query → deeply nested introspection recursion
field suggestion → error message information leak
GraphiQL/Playground exposure → public IDE risk
GET mutations → CSRF risk
tracking/debug patterns → metadata leak

Tools: FireTail, Escape DAST, api.sh (phases 1–3)
```

### Phase 5: REST input validation

```text
□ HTTP method switch: GET→POST→PUT→DELETE→OPTIONS→PATCH
□ Content-Type tampering: JSON→XML→multipart
□ NoSQL injection: {"username": {"$gt": ""}}
□ SSRF via URL parameters: webhook URLs / header image URLs / import URLs
□ XXE in XML endpoints
□ Parameter pollution: /api?role=user&role=admin
□ Mass assignment: add is_admin: true to the request body
```

### Phase 6: Business logic and differential testing

```text
□ Entropy comparison: diff v1 vs v2 APIs → status code changes / field removal / latency regression
□ Multi-role workflow testing: admin/user/readonly permission matrix
□ Coupon / points / price manipulation
□ Race conditions: concurrent request testing, TOCTOU
```

### Phase 7: WebSocket testing

```text
□ Endpoint discovery
□ Message injection (injection payloads, type confusion)
□ Oversized message handling
□ Type obfuscation
□ Cross-site WebSocket hijacking (CSWH)
```

### Phase 8: Rate limits and DoS

```text
□ Rate-limit bypass via header spoofing: X-Forwarded-For, X-Real-IP
□ Path variation: /api/ → /api → /Api/ → /API/
□ Slowloris low-bandwidth exhaustion
□ GraphQL batch / deep-nesting DoS
□ IP rotation testing (ProxyCat proxy pools)
```

### Phase 9: Data exposure

```text
□ Excessive response exposure: compare API responses vs UI display
□ Pagination enumeration: ?page=1&limit=10000
□ Error message leaks: stack traces / internal paths / SQL errors
□ GraphQL nested enumeration of unauthorized data
□ OpenAPI spec exposing sensitive endpoints
```

### Phase 10: CI/CD integration

```text
□ Entropy --ci --watch: re-run automatically on spec changes
□ Escape DAST: block builds automatically above a severity threshold
□ Persist discovery as regression testing
□ StackHawk (developer-first, ZAP engine)
```

## Toolchain

| Tool | Purpose | Get |
|------|---------|-----|
| Vespasian | traffic → OpenAPI/GraphQL spec | github.com/praetorian-inc/vespasian |
| Entropy | LLM-generated attack scenarios, 5 personas | github.com/arjinexe/entropy-chaos |
| Escape DAST | business-logic security testing | escape.tech |
| api.sh | 8-phase all-protocol attack pipeline | github.com/Sharon-Needles/api |
| FireTail | 12 GraphQL specialty tests | firetail.ai |
| jwt_tool | full JWT surface testing | github.com/ticarpi/jwt_tool |
| Burp Autorize | dual-session authorization comparison | Burp BApp Store |

## References

- `references/rest-graphql-testing.md` — REST + GraphQL deep testing
- `references/jwt-oauth-testing.md` — JWT + OAuth security testing

## Task completion checklist (MUST pass before claiming completion)

- [ ] Did I execute every workflow step (not just read)?
- [ ] Did I use real tool paths?
- [ ] Did I produce reproducible evidence (commands/scripts/screenshots/report)?
- [ ] Did I complete and write back the required checklist items?
