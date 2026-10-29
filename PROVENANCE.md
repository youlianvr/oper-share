# PROVENANCE.md — where the material comes from

A skill is a folder of instructions *and* code, so one license statement for the
kit is not enough. This file records what ships under someone else's terms.

- **First-party material** — the root documents, `_scripts/`, `BIRTH.md` and every
  skill folder not named below — is written for this kit and licensed
  **CC BY 4.0** (`LICENSE`).
- **Vendored material** keeps its own license. The license file stays in the
  folder it belongs to; this table is the map, not a replacement.

## Vendored packs that ship

| Path | Origin | License | State |
|---|---|---|---|
| `skills/ai-image-prompts-skill/` | YouMind-OpenLab | MIT | verbatim, `LICENSE` kept |
| `skills/antislop/parts/ai-copywriter/` | Siqi Chen (humanizer), Mickey Haslavsky | MIT | adapted, `LICENSE` kept |
| `skills/loops/parts/loop-library/` | Forward Future | MIT | verbatim, `LICENSE` kept |
| `skills/dev/parts/fastapi/` | Sebastián Ramírez (FastAPI docs) | MIT | verbatim, `LICENSE.txt` kept |
| `skills/ship/parts/vercel-deploy/` | Vercel | MIT | verbatim, `LICENSE.txt` kept |
| `skills/browser/parts/webapp-testing/` | Anthropic skills | Apache-2.0 | verbatim, `LICENSE.txt` kept |
| `skills/design/parts/frontend-design/` | Anthropic skills | Apache-2.0 | verbatim, `LICENSE.txt` kept |
| `skills/design/parts/ui-styling/` | Anthropic skills | Apache-2.0 | verbatim, `LICENSE.txt` kept |
| `skills/mcp/parts/mcp-builder/` | Anthropic skills | Apache-2.0 | verbatim, `LICENSE.txt` kept |
| `skills/jupyter-notebook/` | Anthropic skills | Apache-2.0 | verbatim, `LICENSE.txt` kept |
| `skills/media/parts/speech/`, `transcribe/` | Anthropic skills | Apache-2.0 | verbatim, `LICENSE.txt` kept |
| `skills/planning/parts/define-goal/` | Anthropic skills | Apache-2.0 | verbatim, `LICENSE.txt` kept |
| `skills/skill-meta/parts/skill-creator/` | Anthropic skills | Apache-2.0 | verbatim, `LICENSE.txt` kept |
| `skills/ship/parts/cloudflare-deploy/`, `vercel-deploy/` | Cloudflare / Vercel docs packs | Apache-2.0 / MIT | verbatim, `LICENSE.txt` kept |
| `skills/ship/parts/gh-fix-ci/`, `gh-address-comments/` | Anthropic skills | Apache-2.0 | verbatim, `LICENSE.txt` kept |
| `skills/security/parts/security-best-practices/`, `security-threat-model/`, `security-ownership-map/` | Anthropic skills | Apache-2.0 | verbatim, `LICENSE.txt` kept |
| `skills/security/parts/code-audit/` | OWASP Cheat Sheet Series | **CC BY-SA 4.0** | derived; `LICENSE` kept, see the exception below |
| `skills/media/parts/novel-outline/`, `novel-characters/`, `novel-art/`, `novel-script/` | shuohao-skills | Apache-2.0 | verbatim; `skills/media/parts/LICENSE-shuohao` covers the set |
| `skills/replica/` | Jake Schincariol (replica-skill) | MIT | adapted (paths, kit wording), `LICENSE.txt` kept |
| `skills/reverse-engineering/parts/reverse-api-engineer/` | nottelabs (kalil0321) | MIT | verbatim, `LICENSE` kept under `references/` |
| `skills/decks/parts/dashi-ppt/` | chuspeeism, dashiAI-ppt-skill | proprietary inside `project/packages/html-deck-to-pptx/`; the rest of the skill carries no license record | ships whole, the engine's `LICENSE` kept; see the condition below |

**License exception.** `skills/security/parts/code-audit/` is a derivative of the
OWASP Cheat Sheet Series and stays **CC BY-SA 4.0**. Its share-alike term applies to
that folder only; the rest of the kit is CC BY 4.0. Keep the `LICENSE` file with
the folder, and keep the attribution to the OWASP Foundation.

**Deck engine condition.** `skills/decks/parts/dashi-ppt/project/packages/html-deck-to-pptx/`
is proprietary, not open source: its `LICENSE` grants use "solely as an integrated
component of the Dashi PPT skill" and forbids extracting, copying or redistributing
it separately, or using it in any other product. Ship the folder whole, keep that
`LICENSE` in place, and never lift the engine out of the skill for another use. The
bundle's `package.json` says `0.1.0` while the licence text speaks from v0.2.7
onward and withdraws the earlier MIT grant for later versions; the stricter terms
govern until upstream says otherwise.

## Withheld because the license does not allow this kind of redistribution

| Path | Origin | License | Why it is not here |
|---|---|---|---|
| `documents/parts/docx`, `pdf`, `xlsx` | Anthropic | © all rights reserved, use governed by the Anthropic agreement | Not redistributable in a public kit |
| `decks/parts/pptx` | Anthropic | © all rights reserved | Same |
| `decks/parts/lieflat-charts` | PolyForm project | PolyForm Noncommercial 1.0.0 | Noncommercial-only; this kit permits commercial use |
| `telegram/parts/no-agi-posts` | one channel's house style | not ours to publish | Identifies a specific channel |
| `security/parts/pentest-tools/src-hunter` | third-party pack | no license record inside the folder | Ownership could not be established |

A missing engine is a missing capability, not a defect of the kit: the routers name
what is absent and where to get it, and each install has to be recorded here.

## Origin not recorded

A part with no `LICENSE`, `NOTICE` or `license:` field is either written for this
kit or vendored without a record. Before redistributing such a part under your own
name, check where it came from. The honest default: if the origin cannot be shown,
treat the folder as all rights reserved and replace it with your own text.
