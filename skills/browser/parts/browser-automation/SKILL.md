---
name: browser-automation
description: Drive browsers and desktop GUIs — choose the right tool for the job. Covers agent-browser (standalone CDP), browser-skill (user's real browser via bsk), and computer-use (desktop GUI via cua-driver). Use when interacting with websites, web apps, native apps, or the desktop.
---

# Browser Automation — Tool Selection & Usage

Three tools for browser/desktop automation. Each has a different approach; the right choice depends on whether you need the user's session, a clean environment, or native desktop access.

---

## 1. Decision Tree

```
Need the user's logged-in browser (cookies, sessions)?
  ├── YES → browser-skill (bsk CLI + extension)
  │          Uses user's real Chromium with their logins.
  └── NO  → Need to drive native desktop apps (Finder, Mail, Figma)?
              ├── YES → computer-use (cua-driver desktop GUI)
              └── NO  → agent-browser (Rust CLI, standalone Chrome via CDP)
                          Fast, isolated, no extension needed.
```

### Quick comparison

| Criteria | agent-browser | browser-skill | computer-use |
|----------|--------------|---------------|--------------|
| Browser type | Standalone Chrome (CDP) | User's real Chromium | Any desktop app |
| Needs extension | No | Yes (browser-skill ext) | No |
| Needs user session | No | Yes (user's cookies) | N/A |
| Speed | Fast (Rust) | Medium (IPC) | Slow (GUI) |
| Best for | Scraping, testing, CI | User-account-required sites | Desktop apps, Electron |

---

## 2. agent-browser — Standalone Browser Automation

Fast Rust CLI using Chrome/Chromium via CDP. No user session, no extension needed.

### Install
```bash
npm i -g agent-browser && agent-browser install
```

### Workflow
```bash
# Start, navigate, interact
agent-browser skills get core    # full workflow reference
```

### Key features
- Accessibility-tree snapshots with `@eN` element refs
- Sessions, auth vault, state persistence, video recording
- Observability dashboard on port 4848
- Electron app support via `agent-browser skills get electron`

### When to use
- Scraping public sites
- Testing web apps in isolation
- CI/CD browser tasks
- Tasks that don't need user login

---

## 3. browser-skill — User's Real Browser

Uses the `bsk` CLI + browser-skill extension to drive the user's **real Chromium** with their logins and cookies. Actions happen in an isolated Agent Window.

### Prerequisites
1. `bsk` on PATH (Rust CLI)
2. browser-skill extension loaded in Chromium and connected
3. `bsk doctor` if anything fails

### Mandatory lifecycle
```bash
bsk session start                # → prints 4-letter session id
bsk navigate <url> --session <id>
bsk snapshot --session <id>      # → aria tree with @e1, @e2, … refs
bsk click @e3 --session <id>
bsk session stop <id>            # REQUIRED when done
```

### Core interaction pattern
```bash
bsk navigate <url> --session <id>
bsk snapshot --session <id>      # first choice: accessibility tree
bsk get-html --session <id>      # only when snapshot insufficient
bsk screenshot --session <id>    # only when visual needed
bsk click @eN --session <id>     # or fill, select, press
bsk evaluate <js> --session <id> # JS in agent tab
```

### When to use
- Sites behind login (user's cookies available)
- Regression-testing a UI change
- Forms, multi-step flows, smoke tests
- Any page the user can already access

### Safety rules
- Never `bsk evaluate` on banking/SSO/password-manager pages for credential extraction
- Always return borrowed tabs: `bsk tab return <tab-id>`
- Always stop session when done

---

## 4. computer-use — Desktop GUI Automation

Drives the user's desktop **in the background** (no cursor steal, no focus grab) via Hermes `computer_use` tool. Works for any native app: Finder, Mail, Figma, native chat clients, terminal emulators, games.

### Canonical workflow
```
computer_use(action="capture", mode="som", app="Chrome")
  → screenshot + numbered overlays + AX tree with @1, @2, …

computer_use(action="click", element=7)
  → click by element index (most reliable)

computer_use(action="click", element=7, capture_after=True)
  → click + verify in one call
```

### Available actions
| Action | Parameters |
|--------|-----------|
| `capture` | `mode=som|vision|ax`, `app=…` |
| `click` | `element=N` or `coordinate=[x,y]`, `button=left|right|middle` |
| `double_click` | `element=N` or `coordinate=[x,y]` |
| `scroll` | `direction=up|down|left|right`, `amount=N` |
| `type` | `text="…"` |
| `key` | `keys="ctrl+s"`, `"return"`, `"escape"` |
| `drag` | `from_element=N, to_element=M` or `from_coordinate/to_coordinate` |
| `wait` | `seconds=N` |
| `list_apps` | Returns running apps |
| `focus_app` | `app="…"`, `raise_window=false` |

### When to use
- Native desktop apps (Finder/Explorer, Mail/Outlook, Figma, native chat)
- Desktop workflows that need actual GUI interaction
- When you need to interact with non-web content

### When NOT to use
- Web automation possible via `agent-browser` or `browser-skill` — prefer those
- File edits — use read_file/write_file instead
- Shell commands — use terminal instead
- Never `raise_window=True` unless user asked

---

## 5. Quick Reference

| Need | Use |
|------|-----|
| Visit a public URL, scrape data | `agent-browser` |
| Visit a site behind login | `browser-skill` (user's browser) |
| Test a UI change | `browser-skill` (user's browser) |
| Click around a desktop app | `computer-use` |
| Take a screenshot of a page | `agent-browser` or `browser-skill` |
| Fill a form on a logged-in site | `browser-skill` |
| Automated tests in CI | `agent-browser` |
