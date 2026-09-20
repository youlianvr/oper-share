---
name: reverse-api-engineer
description: >-
  Reverse-engineer a website into a clean, typed API client by capturing real
  network traffic (HAR) and generating client code in Python, JS/TS, Go, Java,
  C#, PHP, Ruby, or C. Use when the user wants programmatic access to a site's
  internal API, says "reverse engineer this API", "make a client for this
  website", or needs data from a site with no official API. Not for sites with
  official APIs — use those instead.
license: MIT
metadata:
  source: https://github.com/nottelabs/reverse-api-engineer
  runtimeClone: tools/reverse-api-engineer
  installedAt: 2026-09-06
---

# reverse-api-engineer (wrapper skill)

This is a **wrapper**: the runtime is a real tool, not a prompt skill. Source
clone lives in `tools/reverse-api-engineer/` (Python 3.11+, also published on
PyPI as `reverse-api-engineer`). Authoritative usage: that repo's README.

## Two modes

- **Manual mode** — the user browses the target site in a captured session;
  traffic lands in a HAR file; the generator writes the client.
- **Agent mode** — an agent drives the browser to fulfill a stated goal,
  traffic is captured, and the configured model reads the HAR and writes the
  typed client.

## Workflow

1. First use: `pip install -e tools/reverse-api-engineer` (or
   `pip install reverse-api-engineer` for the PyPI build).
2. Fix a concrete goal: "list all open job postings from site X" — one page
   type per pass beats "get everything".
3. Run the capture per the README in the clone (CLI flags change; do not
   trust memory — read `tools/reverse-api-engineer/README.md` first).
4. Feed the HAR to the model; request the client in the language the user's
   project uses.
5. Smoke-test the generated client against the live site. Deliver the client
   into the user's project directory — never leave it inside this skill.

## Boundaries

- Only for APIs the user is entitled to use; respect site ToS and robots.
- Unofficial endpoints break silently — every generated client ships with a
  smoke test or does not ship.
- Never capture traffic from accounts other than the user's own logged-in
  session; never capture credentials fields.
- Workspace note: Camoufox/Playwright backends already exist in `tools/` for
  the browser-driving part.
