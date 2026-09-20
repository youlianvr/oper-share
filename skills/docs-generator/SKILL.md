---

name: docs-generator

description: |

  Creates task-oriented technical documentation with progressive disclosure. Use when writing READMEs, API docs, architecture docs, or markdown documentation.

  Also use this skill at the END of any completed reverse engineering, penetration testing, CTF, or security analysis task to generate a formal report in the user's project directory.

  Trigger keywords: write report, write documentation, produce report, writeup, technical documentation, report, documentation.

---


# Technical Documentation


## ACTION REQUIRED (execute immediately after reading)


1. `NOW`: confirm the current task falls within this skill's scope

2. `NOW`: read `../tool-index.md`, verify tool availability and real paths

3. `NEXT`: if a tool is missing, call bootstrap, do not guess paths

4. `ACT`: enter the workflow's first step and execute, do not stop at confirmation


For writing style, tone, and voice guidance, use `Skill(ce:writer)` with **The Engineer** persona.


## Security/RE task documentation output


When RE/pentest/CTF/security analysis task is complete, this skill generates formal technical documentation in the **user's project directory**.


### Trigger timing


1. RE task complete, core conclusions produced (algorithm recovery, signature cracking, bypass plan, etc.)

2. Pentest complete, vulnerabilities discovered and verified

3. CTF challenge solved, flag obtained

4. The user explicitly requests "write a report / documentation / writeup"


### Template selection


| Task type | use template |

|---------|---------|

| APK/binary/so reversing | `references/security-report-templates.md` → reverse engineering report |

| pentest/vulnerability hunting | `references/security-report-templates.md` → pentestReport |

| CTF solving | `references/security-report-templates.md` → CTF writeup |

| JS/web signature reversing | `references/security-report-templates.md` → signature reversing report |

| general-purposetechnical documentation | `references/templates.md` → README / API Documentation |


### Output specification


- **Output location**: the user's current project directory (not the skill package directory)

- **Filename format**: `YYYY-MM-DD_[type]-[target]-report.md`

- **If the project has a `docs/` directory**: prefer placing it under `docs/`

- **Encoding**: UTF-8

- **Language**: follow the user's conversation language (Chinese conversation → Chinese report, English → English)


### Quality requirements


- All code blocks must be directly runnable or have clear context

- No placeholder/TODO

- Key findings must be evidence-backed

- Reproduction steps must allow third parties to independently reproduce

- Sensitive information (real tokens, passwords, internal URLs) replaced with placeholders

- **MUST** package the Evidence → Finding → Path chain (see the ops contract; templates §0)

- **SHOULD** reference the case `scope.md` / `timeline.md` files when they exist


### Diagram integration


When generating reports, call the `diagram-generator` skill at appropriate points to generate visual diagrams:


| Report type | Suggested diagram | Diagram type |

|---------|---------|---------|

| RE report | Function call graph, data flow diagram | Mermaid flowchart / sequenceDiagram |

| pentestReport | Attack path diagram, network topology diagram | Mermaid flowchart / Graphviz |

| CTF writeup | Solution approach flowchart | Mermaid flowchart |

| JS signature reversing report | Request chain sequence diagram, algorithm flowchart | Mermaid sequenceDiagram / flowchart |


Diagrams are embedded as Mermaid code blocks in the report markdown, ensuring direct rendering on GitHub/GitLab.


---


## Core Principles


### 1. Progressive Disclosure


Reveal information in layers:


| Layer | Content | User Question |

|-------|---------|---------------|

| 1 | One-sentence description | What is it? |

| 2 | Quick start code block | How do I use it? |

| 3 | Full API reference | What are my options? |

| 4 | Architecture deep dive | How does it work? |


**Warnings, breaking changes, and prerequisites go at the TOP.**


### 2. Task-Oriented Writing


```markdown

<!-- Bad: Feature-oriented -->

## AuthService Class

The AuthService class provides authentication methods...


<!-- Good: Task-oriented -->

## Authenticating Users

To authenticate a user, call login() with credentials:

```


### 3. Show, Don't Tell


Every concept needs a concrete example.


## Formatting Standards


- **Sentence case headings**: "Getting started" not "Getting Started"

- **Max 3 heading levels**: Deeper means split the doc

- **Always specify language** in code blocks

- **Relative paths** for internal links

- **Tables** for structured data with 3+ attributes


## Quality Checklist


- [ ] Code examples tested and runnable

- [ ] No placeholder text or TODOs

- [ ] Matches actual code behavior

- [ ] Scannable without reading everything

- [ ] Reader knows what to do next


## Anti-Patterns


| Problem | Fix |

|---------|-----|

| Wall of text | Break up with headings, bullets, code, tables |

| Buried critical info | Warnings/breaking changes at TOP |

| Missing error docs | Always document what can go wrong |


## Templates


For README, API endpoint, and file organization templates, see [references/templates.md](references/templates.md).


## Related Skills


- `Skill(ce:writer)` - Writing style, tone, and voice (load The Engineer persona)

- `Skill(ce:visualizing-with-mermaid)` - Architecture and flow diagrams


---


## On-Demand Bootstrap


This skill does not depend on external tools — pure text generation, no bootstrap needed.


If diagram rendering is needed for the report, call the `diagram-generator/` skill.


---


## Routing context


**Upstream entry**: All security/RE skills inautomatically call this skill after task completion

**Trigger method**:

- Automatic: execute as the final step of the behavior chain after task completion

- Manual: the user says "write report", "produce documentation", "writeup"


**Sibling modules**:

- `apk-reverse/` — generate RE report after APK reversing is complete

- `ida-reverse/` — generate RE report after binary analysis is complete

- `radare2/` — generate RE report after CLI analysis is complete

- `js-reverse/` — generate signature report after JS signature reversing is complete

- `reverse-engineering/` — generate RE report after general reversing is complete

- `field-journal/` — Report content also serves as data source for the evolution log


**Security report templates**: `references/security-report-templates.md`

**General documentation templates**: `references/templates.md`


## Task completion checklist (MUST pass before claiming completion)


- [ ] Did I execute every workflow step (not just read)?

- [ ] Did I use real tool paths based on `tool-index`?

- [ ] Did I produce reproducible evidence (commands/scripts/screenshots/report)?

- [ ] Does the report contain the Evidence / Finding / Path chain (ops contract)?

- [ ] Did I complete and write back the required checklist items?
