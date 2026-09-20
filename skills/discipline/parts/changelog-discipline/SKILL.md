---
name: changelog-discipline
description: "Load when the user asks to maintain/update/create a CHANGELOG as a decision log: after code changes, when setting up changelog in a new project, when preparing a release, when asking 'why was it done this way' without an answer in code, or when a taken decision and rejected alternatives need to be documented — even if they don't call the file CHANGELOG but ask 'record what we decided / why this way / what we rejected'. Do not use for commit messages, PR descriptions, and user-facing release notes."
license: Proprietary
metadata:
  author: AGGG2.0 (https://t.me/aidvizhenie)
  inspiration: "hanumatori/nodumbmode (no license; ideas and names from there, text rewritten in own words)"
---
Source: tg t.me/aidvizhenie | t,me/hilartem | aidvizh_hub — channel and gig on TG


# changelog-discipline

CHANGELOG does not exist to duplicate version history —
version control handles that. Its job is to preserve **decisions**: why
this path was chosen, what was there before, what was rejected. This is exactly what
you cannot find in code.

## Where it's needed

- In a project where changelog is established — after **every** code change.
- When first establishing changelog in a new project.
- When preparing a release.
- Not suitable for commit messages, PR descriptions, and release notes for
  users: they have different formats and readers.

## Guiding principles

- **The reader is "me six months from now."** Context will be forgotten by then, so
  the entry must be self-contained.
- **"Why" matters more than "what."** "What" the diff shows; "why this was chosen" —
  nobody will show.
- **A rejected alternative is gold.** It protects against "improving" back to it and
  stepping on the same rake again.
- **Write immediately after the change.** A deferred entry degenerates into a
  diff retelling: the reason is forgotten within days.
- **No exceptions.** One skipped "trivial" change turns
  the log into a selective one, and selective logs cannot be trusted.

## Format

### File skeleton

```markdown
# Changelog

All notable changes to <project>. Format — Keep a Changelog.
