---
name: supply-chain-security
description: Use for software supply-chain security assessment covering SBOM, SCA, CI/CD pipelines, container images, build integrity, dependency provenance, and vulnerability reachability.
---

# Supply Chain Security Testing

## Authorization preamble

1. Confirm the assessment is authorized routine work.
2. Confirm the task hits this skill's scope.
3. Verify tool availability and real paths before use.
4. Work order: SBOM → SCA → reachability → CI/CD → images → third-party deps.

> SBOM / SCA / CI/CD pipelines / dependency provenance
> Regulatory drivers: US EO SBOM, EU CRA.

## Scope

- Software supply-chain security assessment
- Open-source dependency vulnerability scanning and verification
- CI/CD pipeline security audit
- Container image security analysis
- Third-party component compliance review
- Build artifact provenance and integrity verification

## Six-layer supply-chain governance framework

```text
Layer 1: source trust → upstream repo / maintainers / release history
Layer 2: build pipeline integration → CI/CD gates, signature verification
Layer 3: artifact distribution integrity → signatures, checksums, SBOM attach
Layer 4: runtime protection → container scanning, admission control
Layer 5: continuous monitoring → CVE tracking, reachability analysis
Layer 6: incident response → supply-chain attack response, rollback strategy
```

## Workflow

### 1. SBOM generation and audit

```text
Generate SBOM:
□ CycloneDX: cdxgen → bom.json
□ SPDX: sbom-tool generate
□ Syft: syft <image|dir> -o spdx-json

Audit points:
□ Unknown / unauthorized dependencies
□ Deprecated / unmaintained packages
□ License conflicts
□ Direct vs transitive dependency inventory
□ Release timeline and maintainer status per component
```

### 2. Software composition analysis (SCA)

```bash
# OSV-Scanner (free, Google-maintained)
osv-scanner scan -r . --format json

# OWASP Dependency-Track (enterprise continuous monitoring)
docker run -p 8080:8080 dependencytrack/apiserver
# → upload SBOM → auto-match NVD/OSV/GitHub Advisory

# Snyk (commercial)
snyk test --all-projects
snyk monitor  # continuous

# Trivy (containers + deps + IaC)
trivy fs .
trivy image nginx
trivy config .
```

### 3. Vulnerability reachability verification

```text
SCA alert ≠ actual risk! Most SCA tools produce only ~15% truly reachable alerts.

Verification steps:
1. Get CVE list from Dependency-Track or Trivy
2. Filter CVSS >= 7.0
3. For CVEs with PoCs, run reachability analysis
   - Code Property Graph slicing: trace user input to the vulnerable function
   - DEPTEX-style: execution-path dominance + LLM semantic validation
4. Verify the PoC in an isolated environment
5. Prioritize fixes for reachable vulns by actual impact
```

Tool notes: CodeQL (data-flow via GitHub), Snyk Code (reachability marking), DEPTEX (LLM-assisted contextual risk).

### 4. CI/CD pipeline security

```text
Checkpoints:
□ Commit → pre-commit hook: gitleaks (secret scanning)
□ PR stage → SCA scan (Trivy / OSV-Scanner)
□ Build stage → artifact signing (cosign)
□ Push stage → SBOM attach (syft + attest)
□ Deploy stage → admission control (OPA/Kyverno + image scan)
□ Runtime → continuous vuln monitoring (Dependency-Track)

Pipeline self-security:
□ Pipeline-as-Code audit (GitHub Actions / GitLab CI injection)
□ Runner isolation (malicious build breakout)
□ Secret management (Actions Secrets / Vault, no hardcoding)
□ Third-party action review (pin commit SHAs, not tags)
```

### 5. Container image security

```bash
hadolint Dockerfile

# Multi-layer scan: OS + app deps + config
trivy image --severity HIGH,CRITICAL nginx:latest

# Minimal base images: distroless → alpine → slim; avoid :latest
docker scout quickview nginx:latest

# Image signing
cosign sign --key cosign.key myimage:tag
cosign verify --key cosign.pub myimage:tag
```

### 6. Third-party dependency review

```text
New-dependency checklist:
□ Maintenance: commits in the last 6 months? maintainer activity?
□ Security history: ever had malicious code injected?
□ Dependency tree: how many new transitive deps?
□ License: compatible with the project?
□ Alternatives: safer option (Snyk Advisor / Socket.dev score)?

Risk matrix:
  high-maintenance × low-dep-count × compatible license → low risk
  low-maintenance × high-dep-count × license conflict → high risk
```

## Toolchain

| Tool | Purpose | Get |
|------|---------|-----|
| OWASP Dependency-Track | enterprise continuous SCA | `docker pull dependencytrack/apiserver` |
| OSV-Scanner | free SCA (OSV.dev) | `go install github.com/google/osv-scanner` |
| Trivy | image + dep + IaC scanning | `apt install trivy` |
| Syft | SBOM generation | install script (anchore/syft) |
| cdxgen | CycloneDX SBOM | `npm install -g @cyclonedx/cdxgen` |
| Cosign | container signing | `go install github.com/sigstore/cosign/v2/cmd/cosign` |
| Gitleaks | secret scanning | `go install github.com/gitleaks/gitleaks/v8` |
| Snyk | commercial SCA + reachability | `npm install -g snyk` |
| CodeQL | code queries + data flow | built into GitHub Actions |

## References

- `references/sbom-sca-methodology.md` — SBOM + SCA methodology
- `references/cicd-pipeline-security.md` — CI/CD pipeline security audit

## Completion self-check (MUST pass before claiming completion)

- [ ] Did I execute every step of the workflow (rather than just read it)?
- [ ] Did I use real tool paths?
- [ ] Did I produce reproducible evidence (commands / scripts / reports)?
- [ ] Did I write back the required checklist items?
