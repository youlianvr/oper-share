---
name: review-request
description: >-
  Self-review checklist for any file — structure, writing, references, technical quality.
  Use when: creating/editing a file, pre-commit check, reviewing docs.
---

# Self-Review Checklist

## Structure
- [ ] File has clear purpose (title + first paragraph)
- [ ] Sections follow logical order
- [ ] No orphan sections (empty or single-line)
- [ ] Consistent heading levels (no skipping h2→h4)

## Writing
- [ ] No stylistic negation (Rule 3)
- [ ] Dossier over Novel style
- [ ] Tell don't Show
- [ ] No hedging language
- [ ] Concrete > abstract

## References
- [ ] All `[[wikilinks]]` resolve to existing files
- [ ] No broken internal links
- [ ] External links are current
- [ ] YAML frontmatter valid

## Technical
- [ ] No BOM (check with `xxd | head -1`)
- [ ] UTF-8 encoding
- [ ] No trailing whitespace
- [ ] No duplicate blank lines
