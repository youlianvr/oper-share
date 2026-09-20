---
name: browsermcp-automation
description: Full browsing through BrowserMCP — an MCP server for browser automation that acts "as a human" on the anti-detect browser Camoufox. Navigation, snapshots with refs, clicks and forms, signups and logins with 2FA (TOTP), content extraction, screenshots, network and console, cookies and persistent sessions. How to prepare call sequences, read statuses, fix stale_ref/timeouts/captchas and save tokens. Use for any task of the form "do it on the site", "sign up", "log in", "open the page", "fill the form", "extract the data from the page".
license: MIT
compatibility: opencode, Claude Code, Cursor, OpenAI Codex, VS Code (Copilot), Gemini CLI, Antigravity CLI, Crush, Pi, Kimi Code CLI, Hermes Agent
metadata:
  category: tool-usage
  complexity: advanced
  author: BrowserMCP
  version: "1.5.0"
  tool_macro: browsermcp
---

# BrowserMCP — browsing "as a human" through MCP

BrowserMCP is a local MCP server: a real anti-detect browser (Camoufox) with a
**persistent profile**, so logins and cookies survive between calls. **86 tools**
(v1.4: WebMCP standard, behavioral captchas, action cache, confirm-writes, GIF):
navigation, snapshots with `ref`, actions, widgets (combobox/date), overlays, lists,
iframes/shadow DOM, emulation, network without CORS, 2FA, structural "understanding"
of the page. No paid APIs.

**The main principle:** every interaction = `snapshot` (see the refs) → act by `ref`
→ `snapshot`/`wait_for` (check the result). Never click blind and never parse HTML
through `evaluate` — the snapshot already gives you the map.

## Universal access to the tools (never hardcode)

Before calling, resolve the real tool name — never print an assumed prefix:

1. Get the list of available tools (tools/list, `/mcp`, the session's function list).
2. Find the tool by description or substring: `navigate`, `snapshot`, `click`,
   `fill_form`, `extract_text`, `screenshot`, `sessions_*` — not by an assumed name.
3. Use the real name. Client table (canon of 2026-09-01):

| Client | Tool-name format | Example |
|---|---|---|
| opencode / opencode2 | `tools.<server>.<tool>` | `tools.browsermcp.navigate` |
| Claude Code, Cursor, Codex, Copilot | `mcp__<server>__<tool>` | `mcp__browsermcp__navigate` |
| `mcp__browsermcp__` (universal form) | — | substitute the prefix for the client |
| Gemini CLI, Antigravity (agy) | `mcp_<server>_<tool>` (FQN; `_` is not allowed inside a server name) | `mcp_browsermcp_navigate` |
| Crush | `mcp_<server>_<tool>` | `mcp_browsermcp_navigate` |
| Hermes, Kimi, Pi, omp | see the real name in the tool list | — |

When reality disagrees with the table, take the real name from the environment
(remember the client and prefix, and tell the user).

## When to use

- "Open site X", "go to page Y", "what is on this page?".
- Signup / login / password change on any site, forms and multi-step flows.
- 2FA: when a code is needed — `totp_generate(secret_env="SITE")`.
- Extracting content from pages (text plus links, markdown, HTML).
- JS-rendered sites where `webfetch` is powerless.
- "Human-like" actions: buy, order, submit an application, subscribe.
- Diagnostics: console and network, screenshots, checking what changed after a click.

## When NOT to use

- The full text of a page with no interaction — `webfetch`/SearchMCP is faster and cheaper.
- Searching the internet — that is SearchMCP `research` (fan-out plus digest).
- Parsing large tables into JSON schemas — only by hand through `evaluate` plus truncation.
- Private or local addresses (127.0.0.1, 10.x, metadata) — `blocked_ssrf`, that is protection.
- Bypassing a captcha — not allowed: the `captcha` status means "a human is needed" (open a window).
- PDF generation — out of v1 (there is no `print_pdf`; use `save_html`).

## Tool overview (59)

| Group | Tools |
|---|---|
| **core (33)** | `browser_status`, `browser_close`, `navigate(url, wait_until=load\|domcontentloaded\|networkidle, timeout)`, `go_back`, `go_forward`, `reload`, `page_info`, `snapshot(compact, max_chars, include_frames, include_shadow)`, `get_state`, `get_form_fields`, `click(ref\|selector\|text\|role, button, double)`, `hover`, `type(value, ref\|selector, clear_first, submit, human)`, `fill_form(fields[], submit)`, `select_option(value\|label\|index)`, `press_key(key, modifiers)`, `drag(source_ref, target_ref)`, `scroll(direction, amount, element_ref)`, `handle_dialog(accept\|dismiss)`, `upload_file(files[], ref\|selector)`, `wait_for(state, timeout, selector\|text\|ref)`, `tabs(list\|new\|switch\|close)`, `evaluate(script, args)`, `extract_text(max_chars, include_links)`, `extract_markdown`, `save_html(path)` + **v1.1**: `set_combobox(values, ref, multiple)`, `set_date(date, mode=auto\|native\|type\|picker)`, `dismiss_overlays(kinds)`, `extract_list(item_selector, max_items, max_scrolls)`, `browser_resize(w,h)`, `emulate(locale,timezone,user_agent,viewport,color_scheme)`, `ask_user(prompt)` |
| **content (4)** | `page_summary(max_chars)`, `extract_cards(selector?, max_cards)`, `extract_table(sel_or_index, max_rows, expand_details)`, `search_page(query, limit)` |
| **vision (5)** | `screenshot(fmt=jpeg\|png\|webp, quality, full_page, element_ref)`, `mouse_move_xy`, `mouse_click_xy`, `mouse_drag_xy`, `mouse_wheel` |
| **network (7)** | `console_messages(level, limit)`, `network_requests(filters)`, `network_route(pattern, action=allow\|block\|mock, mock_body, content_type, status)`, `network_unroute(pattern)`, `network_set_offline(offline)` + **v1.1**: `wait_for_network(pattern, timeout)`, `http_request(method,url,headers,body,data)` |
| **storage (7)** | `cookies(domain)`, `cookies_set/delete/clear`, `storage(scope=local\|session, action=list\|get\|set\|delete\|clear, key, value)`, `storage_save(name)`, `storage_load(name)` |
| **auth (1)** | `totp_generate(secret\|secret_env, algorithm=sha1, digits=6, period=30)` |
| **frames (1)** | `frames()` — the iframe registry; refs look like `f1-e3` for actions inside frames |
| **trends (10)** | `webmcp_list()`, `webmcp_call(name, args)` — the site's WebMCP tools; `recording_start(screenshots)`, `recording_stop(name)`, `recordings_list`, `recordings_show(id)` — session recording; `flow_save(name)`, `flow_list`, `flow_run(name)`, `flow_delete(name)` — repeatable scenarios |
| **vault (5)** | `sessions_list/new/switch/delete/use` — parallel account profiles |
| **mail (3)** | `mail_status/list/wait_for` — e-mail codes (IMAP or a dev directory) |
| **extras (6)** | `extract_token(provider?)` + `tokens_consume(digest)`, `read_pdf`/`search_page_pdf`, `knowledge_save/lookup`, `proxy_status` |
| **downloads (1)** | `downloads_list(limit)` |

The snapshot line format is the Playwright MCP canon:

```
- heading "todos"
- textbox "What needs to be done?" [ref=e1] <text> (required)
- checkbox "Toggle Todo" [ref=e2] (unchecked)
- button "Add" [ref=e3]
```

Actions use the `ref` from the latest snapshot. After any navigation the refs reset.

## How to read the response

Every tool answers as `{"status": ..., "data": {...}}` or `{"status": ..., "error": ...}`.

| Status | Meaning | What to do |
|---|---|---|
| `ok` | success | continue |
| `stale_ref` | the ref went stale (the page changed) | `snapshot` again, then repeat the action |
| `timeout` | the element or page did not arrive in time | `wait_for` with a longer timeout, or re-snapshot |
| `not_interactable` | the element is hidden or blocked | `scroll(element_ref)` or a different selector |
| `blocked` / `blocked_ssrf` | the URL is disallowed by policy or private | do not work around it; choose another URL |
| `failed` | network/DNS/TLS, or the browser died | check the URL; retry (`browser_crashed` self-heals on the next call) |
| `captcha` | bot check or captcha | stop: a human is needed (launch `open` with a window) |
| `needs_human` | a step that requires a human (an email, a password change) | tell the user |
| `needs_human` (from `ask_user`) | the tool asked for human input | hand the prompt to the user and continue after the answer |
| `js_error` | the script threw | check the `evaluate` script |
| `tab_closed` / `no_history` | the tab is closed, or there is no history | `tabs(list)`, open it again |
| `validation_error` | invalid arguments | fix the parameters |
| `no_cards` / `no_table` | v1.1: the heuristic found no cards or table | pass `selector` or an index |
| `frame_unavailable` | v1.1: the frame is unreachable (cross-domain or gone) | `frames()` → pick another path |
| `profile_in_use` | the profile is held by another Firefox | close the other process |

**Secrets:** 2FA codes come from `secret_env` (the env var
`BROWSERMCP_TOTP_SECRET_<NAME>`); never pass a secret as an argument. Credentials go
only into form fields, and they are never logged.

## Key scenarios

### 1. Signup with 2FA (the full flow)

```
mcp__browsermcp__navigate("https://site/signup")
mcp__browsermcp__snapshot()                          # fields with refs
mcp__browsermcp__fill_form([{ref:"e1",value:"mail@x.com"},{ref:"e3",value:"Password123"}], submit=true)
# 2FA:
mcp__browsermcp__totp_generate(secret_env="SITE")    # -> code
mcp__browsermcp__snapshot()                          # the new code field (refs changed!)
mcp__browsermcp__fill_form([{ref:"e7",value:"<code>"}], submit=true)
mcp__browsermcp__wait_for(text="Welcome", state="visible")
mcp__browsermcp__snapshot()                          # the confirmation
mcp__browsermcp__extract_text()
```

### 2. Log in once and for all

The profile is persistent: log in, and the cookies stay. In later sessions work
without logging in. To verify authorization explicitly, take `cookies(domain)` and
look for the session cookie.

### 3. Extracting content

```
mcp__browsermcp__navigate(url)
mcp__browsermcp__extract_text(max_chars=20000)       # text + links[]
mcp__browsermcp__extract_markdown()                  # the markdown version
```

### 4. SPA and dynamic pages (after a click, do not rush)

```
mcp__browsermcp__click(ref="e3")                     # for example a "Load more" button
mcp__browsermcp__wait_for(state="visible", text="Next page")
mcp__browsermcp__snapshot()
```

### 5. Canvas and complex UI (vision)

```
mcp__browsermcp__screenshot(fmt="jpeg")              # the model looks at the image
mcp__browsermcp__mouse_click_xy(x=412, y=308)        # coordinates taken from the screenshot
```

### 6. Blocking trackers and diagnostics

```
mcp__browsermcp__network_route("https://ads.example/*", action="block")   # before navigating
mcp__browsermcp__navigate(url)
mcp__browsermcp__console_messages(level="error")     # JS errors
mcp__browsermcp__network_requests(url_filter="api.", method="POST")
```

### 7. Downloads

```
mcp__browsermcp__click(selector='a[href$=".pdf"]')
mcp__browsermcp__downloads_list()                    # the path of the saved file
```

### 8. Moving a session between profiles

```
mcp__browsermcp__storage_save("site-auth")           # cookies into states/<name>.json (mode 600)
# on the other profile:
mcp__browsermcp__storage_load("site-auth")
```

### 9. "Understanding" the page (v1.1 — the first step after navigate)

```
mcp__browsermcp__page_summary()          # headings/paragraphs/CTAs/counters — what page is this
mcp__browsermcp__extract_cards()         # listings: products/results/news (title, price, links)
mcp__browsermcp__extract_table("#prices")# a table → headers/rows (up to 500 rows)
mcp__browsermcp__search_page("USB-C")    # find a fragment in the page text
```

### 10. WebMCP-first (v1.2 — determinism instead of parsing)

```
mcp__browsermcp__webmcp_list()          # the site declares tools (the 2026 standard: Chrome/Edge/W3C)
mcp__browsermcp__webmcp_call("search_products", {"q": "keyboard"})
# on unsupported_webmcp → the normal path: snapshot → extract_cards → actions
```

### 11. Recording and replay (v1.2)

```
mcp__browsermcp__recording_start(screenshots=true)   # record every action (secrets → ***)
# ... any scenario ...
mcp__browsermcp__recording_stop(name="s1")           # → recordings/rec_*.json
mcp__browsermcp__recordings_show("s1", include_images=true)
mcp__browsermcp__flow_save("site-login")             # the scenario → a flow (steps with secrets are skipped)
mcp__browsermcp__flow_run("site-login")              # replay in one call
```

### 12. Accounts and mail (v1.3)

```
mcp__browsermcp__sessions_new("work")                # a second profile-account
mcp__browsermcp__sessions_switch("work")             # instant switch (cookies/logins are kept)
mcp__browsermcp__mail_wait_for(sender="shop.example", code_re=r"\d{6}")  # a code from an email
mcp__browsermcp__emulate(fingerprint="desktop:windows")   # the whole fingerprint (not just the UA)
proxy_status()                      # the current proxy (host:port, no credentials)
```

### 13. Widgets and frames (v1.1 — when "simple" selectors are not enough)

```
mcp__browsermcp__set_combobox("Germany", ref="e2")   # autocomplete: React Select / MUI / any cascade
mcp__browsermcp__set_date("2026-09-15", ref="e5")    # native input → masked typing → the calendar
mcp__browsermcp__dismiss_overlays()                  # cookie banners, modals, popups in one call
mcp__browsermcp__extract_list(item_selector="#list li")  # long or virtualized lists, all the way down
mcp__browsermcp__frames()                            # the iframe registry (OAuth popups, checkouts)
mcp__browsermcp__click(ref="f1-e1")                  # a click INSIDE a frame by the ref from the snapshot
mcp__browsermcp__http_request("GET","https://api.site/v1/x")  # a request with session cookies (no CORS)
mcp__browsermcp__emulate(locale="fr-FR", viewport=[1280,720]) # regional or responsive sites
```

### 14. Confirmations and the action cache (v1.4)

```
# confirm-writes (BROWSERMCP_CONFIRM_WRITES=true)
mcp__browsermcp__fill_form([...], submit=true)  -> need_confirm (it did NOT run!)
mcp__browsermcp__ask_user("Confirm the order?")
mcp__browsermcp__fill_form([...], submit=true, confirmed=true)

# self-heal: successful actions are remembered
mcp__browsermcp__click(ref="e3")  -> data.cache_hit=true (when this exact click ran on this domain before)
mcp__browsermcp__action_cache_stats() / mcp__browsermcp__action_cache_clear()
```

## Sizing it to the task

| Goal | How |
|---|---|
| Speed (tests) | `BROWSERMCP_HUMAN=false` — no typing or mouse delays |
| "Like a human" (default) | `human=true`: 30–120 ms per character, the mouse follows a curve |
| See the window | `BROWSERMCP_HEADLESS=false` (manual logins, captchas) |
| Fewer tokens | `snapshot(compact=true)`, `extract_text(max_chars=4000)`, `screenshot(fmt="jpeg")` |
| A clean session | `BROWSERMCP_ISOLATED=true` (a temporary profile) |

## Antipatterns (don't)

- ❌ Click by `selector` without a `snapshot` — look at the refs first (cheaper and more precise).
- ❌ Reuse old refs after `navigate`/`reload` — you will just get `stale_ref`.
- ❌ Dozens of `evaluate` calls to read a page — use `extract_text`/`snapshot` instead.
- ❌ Pass a TOTP secret or passwords as tool arguments — use `secret_env` and form fields.
- ❌ `screenshot(format="png", full_page=true)` on long pages — megabytes into the context; jpeg/1024 by default.
- ❌ Try to "get around" a captcha or a WAF — report it honestly and stop.
- ❌ Visit local or private addresses — the SSRF block is protection, not a bug.

## Troubleshooting

- **`stale_ref` on every step** → the page re-renders; snapshot right before the action and use `wait_for` to let it settle.
- **`not_interactable` although the element is visible** → something covers it; `scroll(element_ref)`, or `mouse_click_xy` at the box coordinates from the snapshot.
- **`timeout` on `navigate`** → raise `timeout`, try `wait_until="domcontentloaded"` (networkidle is slow on SPAs).
- **Everything is green but "nothing happened"** → check `console_messages(level="error")` and `network_requests(status>=400)`; often it is a JS error or a blocked request.
- **A captcha at login** → `headless=false`, ask a human to solve it, then continue (the profile keeps the session).
- **`browser_crashed`** → just repeat the call: the manager restarts the browser with the same profile.
- **`frame_unavailable`** → the frame does not resolve; call `frames()` first, then `click(ref="f1-e2")` right after a snapshot.
- **`no_cards`/`no_table`** → the heuristic failed: pass `selector` or an index manually.
- **`emulate` returned `partial: {user_agent: true}`** → only `navigator.userAgent` was overridden (not the whole fingerprint) — not enough for sites with strict anti-detect checks.
- **`ask_user` → `needs_human`** → give the prompt to the user; after the answer just continue with the normal tools (the context and browser are not reset).
- **`unsupported_webmcp`** → the site declares no WebMCP tools; that is not an error — use snapshot plus actions (or `ask_user`).
- **`flow_run` returned `skipped_secret`** → a step holding a password or a recorded value was skipped (safety): walk through that step manually in the current session.
- **`recording_stop` says "no active recording"** → call `recording_start()` first.
- **`mail_unavailable`** → set `BROWSERMCP_IMAP_*` or `BROWSERMCP_MAIL_DIR`; codes are matched by `code_re` in the body and the subject.
- **`emulate(fingerprint=...)` returned `failed: Camoufox does not support the OS`** → only desktop presets are available (windows/mac/linux).
- **`proxy_status` shows only host:port** → credentials are masked on purpose; set them in `BROWSERMCP_PROXIES`.
- **`need_confirm`** → `BROWSERMCP_CONFIRM_WRITES` is on; ask a human (`ask_user`) and repeat with `confirmed=true`.
- **`cache_hit` in an action response** → this is a successful solution from the past (the action cache); safe to repeat.
- **`captcha` with `mode: behavioral`** → an invisible Turnstile (a challenge host was seen); a human is needed.
- **`sessions_use` picked the wrong session** → domains are recorded in `.vault.json` during navigation; visit the site in the right session and repeat.

## CLI equivalents (for a human or a script)

```bash
python -m browsermcp open "https://example.com" --snapshot   # a window + the page map
python -m browsermcp doctor                                  # environment check
python -m browsermcp status                                  # config / profile / caps
```

## Skill activation

The skill is published by the `skills_install.py` farm (canon + macros → per-client
derivatives). Paths: `~/.config/opencode/skills/browsermcp-automation`,
`~/.claude/skills/`, `~/.agents/skills/`, `~/.cursor/skills/` and so on. Trigger
phrases: "open / go to the site", "register an account", "log in", "fill the form",
"take a screenshot of the page", "extract the data from the page", "pass 2FA",
"download the file". Use this skill for any browser scenario — it sets the correct
call order and the correct reading of statuses.
