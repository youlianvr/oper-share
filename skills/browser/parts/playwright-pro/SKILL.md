---
name: "playwright-pro"
description: "Production-grade Playwright testing toolkit. Use when the user mentions Playwright tests, end-to-end testing, browser automation, fixing flaky tests, test migration, CI/CD testing, test suites, test report, results summary, test status, test coverage, coverage gaps, what's not tested, browserstack, cross-browser, cloud testing, testrail, test management, or sync test cases. Generate tests, fix flaky failures, migrate from Cypress/Selenium, sync with TestRail, run on BrowserStack, analyze coverage gaps, generate test reports. 55 templates, 3 agents, smart reporting."
metadata:
  version: 2.1.0
  merged_from: "report/coverage/browserstack/testrail (thin /pw:* wrappers) — absorbed 2026-08-05 as Command Details"
---

# Playwright Pro

Production-grade Playwright testing toolkit for AI coding agents.

## Available Commands

When installed as a Claude Code plugin, these are available as `/pw:` commands:

| Command | What it does |
|---|---|
| `/pw:init` | Set up Playwright — detects framework, generates config, CI, first test |
| `/pw:generate <spec>` | Generate tests from user story, URL, or component |
| `/pw:review` | Review tests for anti-patterns and coverage gaps |
| `/pw:fix <test>` | Diagnose and fix failing or flaky tests |
| `/pw:migrate` | Migrate from Cypress or Selenium to Playwright |
| `/pw:coverage` | Analyze what's tested vs. what's missing |
| `/pw:testrail` | Sync with TestRail — read cases, push results |
| `/pw:browserstack` | Run on BrowserStack, pull cross-browser reports |
| `/pw:report` | Generate test report in your preferred format |

> The `/pw:report`, `/pw:coverage`, `/pw:browserstack`, and `/pw:testrail` command
> wrappers were merged into this skill on 2026-08-05. Their detailed workflows
> live in the [Command Details](#command-details) section below.

## Quick Start Workflow

The recommended sequence for most projects:

```
1. /pw:init          → scaffolds config, CI pipeline, and a first smoke test
2. /pw:generate      → generates tests from your spec or URL
3. /pw:review        → validates quality and flags anti-patterns      ← always run after generate
4. /pw:fix <test>    → diagnoses and repairs any failing/flaky tests  ← run when CI turns red
```

**Validation checkpoints:**
- After `/pw:generate` — always run `/pw:review` before committing; it catches locator anti-patterns and missing assertions automatically.
- After `/pw:fix` — re-run the full suite locally (`npx playwright test`) to confirm the fix doesn't introduce regressions.
- After `/pw:migrate` — run `/pw:coverage` to confirm parity with the old suite before decommissioning Cypress/Selenium tests.

### Example: Generate → Review → Fix

```bash
# 1. Generate tests from a user story
/pw:generate "As a user I can log in with email and password"

# Generated: tests/auth/login.spec.ts
# → Playwright Pro creates the file using the auth template.

# 2. Review the generated tests
/pw:review tests/auth/login.spec.ts

# → Flags: one test used page.locator('input[type=password]') — suggests getByLabel('Password')
# → Fix applied automatically.

# 3. Run locally to confirm
npx playwright test tests/auth/login.spec.ts --headed

# 4. If a test is flaky in CI, diagnose it
/pw:fix tests/auth/login.spec.ts
# → Identifies missing web-first assertion; replaces waitForTimeout(2000) with expect(locator).toBeVisible()
```

## Golden Rules

1. `getByRole()` over CSS/XPath — resilient to markup changes
2. Never `page.waitForTimeout()` — use web-first assertions
3. `expect(locator)` auto-retries; `expect(await locator.textContent())` does not
4. Isolate every test — no shared state between tests
5. `baseURL` in config — zero hardcoded URLs
6. Retries: `2` in CI, `0` locally
7. Traces: `'on-first-retry'` — rich debugging without slowdown
8. Fixtures over globals — `test.extend()` for shared state
9. One behavior per test — multiple related assertions are fine
10. Mock external services only — never mock your own app

## Locator Priority

```
1. getByRole()        — buttons, links, headings, form elements
2. getByLabel()       — form fields with labels
3. getByText()        — non-interactive text
4. getByPlaceholder() — inputs with placeholder
5. getByTestId()      — when no semantic option exists
6. page.locator()     — CSS/XPath as last resort
```

## What's Included

- **5 skill dirs** (init/generate/review/fix/migrate) + 4 merged command sections (report/coverage/browserstack/testrail)
- **3 specialized agents**: test-architect, test-debugger, migration-planner
- **55 test templates**: auth, CRUD, checkout, search, forms, dashboard, settings, onboarding, notifications, API, accessibility
- **2 MCP servers** (TypeScript): TestRail and BrowserStack integrations
- **Smart hooks**: auto-validate test quality, auto-detect Playwright projects
- **6 reference docs**: golden rules, locators, assertions, fixtures, pitfalls, flaky tests
- **Migration guides**: Cypress and Selenium mapping tables

## Command Details

> Merged 2026-08-05 from the four thin `/pw:*` wrappers (`report`, `coverage`,
> `browserstack`, `testrail`). All MCP tools referenced below come from the
> bundled TestRail / BrowserStack MCP servers.

### /pw:report — Generate Test Report

Generate test reports that plug into the user's existing workflow. Zero new tools.

1. **Run tests (if not already run):** check for recent results (`ls -la test-results/ playwright-report/`); if none, run `npx playwright test --reporter=json,html,list 2>&1 | tee test-output.log`.
2. **Parse results:** read the JSON report — total/passed/failed/skipped/flaky, duration per test and total, failed test names with error messages, flaky tests (passed on retry).
3. **Detect report destination** and route automatically:

| Check | If found | Action |
|---|---|---|
| `TESTRAIL_URL` env var | TestRail configured | Push results via `/pw:testrail push` |
| `SLACK_WEBHOOK_URL` env var | Slack configured | Post summary to Slack |
| `.github/workflows/` | GitHub Actions | Results go to PR comment via artifacts |
| `playwright-report/` | HTML reporter | Open or serve the report |
| None of the above | Default | Generate markdown report |

4. **Generate report:**
   - *Markdown (always):* `# Test Results — {{date}}` with ✅ Passed / ❌ Failed / ⏭️ Skipped / 🔄 Flaky / ⏱️ Duration summary, Failed Tests table (name/error/file:line), Flaky Tests table, By Project table (Chromium/Firefox/WebKit). Save to `test-reports/{{date}}-report.md`.
   - *Slack (if webhook):* `curl -X POST "$SLACK_WEBHOOK_URL"` with a `🧪 Test Results: ✅ {{passed}} | ❌ {{failed}} | ⏱️ {{duration}}` payload.
   - *TestRail (if configured):* invoke `/pw:testrail push` with the JSON results.
   - *HTML:* `npx playwright show-report` (or, in CI: "HTML report available at: playwright-report/index.html").
5. **Trend analysis (if historical data exists):** compare pass rate over time, identify newly flaky tests, highlight new vs. recurring failures.

Output: summary counts, failed-test details, report-destination confirmation, trend comparison, next-action recommendation (fix failures or celebrate green).

### /pw:coverage — Analyze Coverage Gaps

Map all testable surfaces and identify what's tested vs. what's missing.

1. **Map application surface** with your own tooling: routes/pages (Next.js `app/`, React Router, Vue Router), interactive components (forms, modals, dropdowns, tables, complex state), API endpoints (route files/controllers with methods), user flows (auth, checkout, onboarding, multi-step workflows).
2. **Map existing tests:** scan `*.spec.ts`/`*.spec.js` — extract covered pages/routes (by `page.goto()`), components (by locator usage), endpoints (mocked or hit), count tests per area.
3. **Generate coverage matrix:**
```
| Area | Route | Tests | Status |
|---|---|---|---|
| Auth | /login | 5 | ✅ Covered |
| Auth | /forgot-password | 0 | ❌ Missing |
| Dashboard | /dashboard | 3 | ⚠️ Partial (no error states) |
```
4. **Prioritize gaps by business impact:** Critical (auth, payment, core) → High (CRUD, search, navigation) → Medium (settings, edge cases) → Low (static pages).
5. **Suggest test plan per gap:** number of tests, which `templates/` to use, effort (quick/medium/complex).
6. **Auto-generate (optional):** ask "Generate tests for the top N gaps?" — if yes, invoke `/pw:generate` for each gap with the recommended template.

Output: coverage matrix, coverage percentage estimate, prioritized gap list with effort estimates, option to auto-generate.

### /pw:browserstack — Run on BrowserStack

Run Playwright tests on BrowserStack's cloud grid for cross-browser and cross-device testing.

**Prerequisites:** `BROWSERSTACK_USERNAME` + `BROWSERSTACK_ACCESS_KEY` env vars. If not set, point the user to [browserstack.com/accounts/settings](https://www.browserstack.com/accounts/settings) and stop.

**Capabilities:**
1. **Setup** (`/pw:browserstack setup`) — check `playwright.config.ts`, add `connectOptions` with `wsEndpoint` caps per browser (chrome/firefox/webkit × Windows/macOS), and an npm script `"test:e2e:cloud": "npx playwright test --project='chrome@*' --project='firefox@*' --project='webkit@*'"`.
2. **Run** (`/pw:browserstack run`) — verify credentials, run `npx playwright test --project='chrome@*' --project='firefox@*'` with env vars, monitor, report per-browser results.
3. **Results** (`/pw:browserstack results`) — `browserstack_get_builds` MCP tool → latest build sessions → per-session status/browser/OS/duration/video URL/log URLs → summary table.
4. **Browsers** (`/pw:browserstack browsers`) — `browserstack_get_browsers` MCP tool → filter Playwright-compatible → display browser/OS combos.
5. **Local testing** (`/pw:browserstack local`) — for localhost/staging behind a firewall: `npm install -D browserstack-local`, add local tunnel to config, provide setup instructions.

**Reference config** — add to `playwright.config.ts` (the `isBS` switch keeps local projects intact):
```typescript
import { defineConfig } from '@playwright/test';

const isBS = !!process.env.BROWSERSTACK_USERNAME;

export default defineConfig({
  // ... existing config
  projects: isBS ? [
    {
      name: "chromelatestwindows-11",
      use: {
        connectOptions: {
          wsEndpoint: `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(JSON.stringify({
            'browser': 'chrome',
            'browser_version': 'latest',
            'os': 'Windows',
            'os_version': '11',
            'browserstack.username': process.env.BROWSERSTACK_USERNAME,
            'browserstack.accessKey': process.env.BROWSERSTACK_ACCESS_KEY,
          }))}`,
        },
      },
    },
    {
      name: "firefoxlatestwindows-11",
      use: {
        connectOptions: {
          wsEndpoint: `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(JSON.stringify({
            'browser': 'playwright-firefox',
            'browser_version': 'latest',
            'os': 'Windows',
            'os_version': '11',
            'browserstack.username': process.env.BROWSERSTACK_USERNAME,
            'browserstack.accessKey': process.env.BROWSERSTACK_ACCESS_KEY,
          }))}`,
        },
      },
    },
    {
      name: "webkitlatestos-x-ventura",
      use: {
        connectOptions: {
          wsEndpoint: `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(JSON.stringify({
            'browser': 'playwright-webkit',
            'browser_version': 'latest',
            'os': 'OS X',
            'os_version': 'Ventura',
            'browserstack.username': process.env.BROWSERSTACK_USERNAME,
            'browserstack.accessKey': process.env.BROWSERSTACK_ACCESS_KEY,
          }))}`,
        },
      },
    },
  ] : [
    // ... local projects fallback
  ],
});
```

**MCP tools:** `browserstack_get_plan`, `browserstack_get_browsers`, `browserstack_get_builds`, `browserstack_get_sessions`, `browserstack_get_session`, `browserstack_update_session`, `browserstack_get_logs`.

Output: cross-browser results table, per-browser pass/fail, dashboard links for video/screenshots, browser-specific failures highlighted.

### /pw:testrail — Sync with TestRail

Bidirectional sync between Playwright tests and TestRail test management.

**Prerequisites:** `TESTRAIL_URL`, `TESTRAIL_USER`, `TESTRAIL_API_KEY` env vars. If not set, tell the user how to configure them and stop.

**Capabilities:**
1. **Import cases → generate tests** (`/pw:testrail import --project <id> --suite <id>`) — `testrail_get_cases` MCP tool → map each case (title, preconditions, steps, expected results) to a Playwright test using a template, annotate with the case ID (`test.info().annotations.push({ type: 'testrail', description: 'C12345' })`), group by section, report X imported / Y generated.
2. **Push results** (`/pw:testrail push --run <id>`) — run with JSON reporter (`npx playwright test --reporter=json > test-results.json`), map each test to its case ID from annotations, `testrail_add_result` per test (pass→1, fail→5 + error, skip→2), report X pushed / Y passed / Z failed.
3. **Create test run** (`/pw:testrail run --project <id> --name "Sprint 42 Regression"`) — `testrail_add_run` MCP tool with all case IDs found in annotations, return run ID.
4. **Sync status** (`/pw:testrail status --project <id>`) — compare TestRail cases vs local annotations, report coverage (linked / unlinked / missing).
5. **Update cases** (`/pw:testrail update --case <id>`) — read the Playwright test, extract steps/expected results, `testrail_update_case` MCP tool.

**MCP tools:** `testrail_get_projects`, `testrail_get_suites`, `testrail_get_cases`, `testrail_add_case`, `testrail_update_case`, `testrail_add_run`, `testrail_add_result`, `testrail_get_results`.

**Test annotation format** (the bridge between Playwright and TestRail):
```typescript
test('should login successfully', async ({ page }) => {
  test.info().annotations.push({ type: 'testrail', description: 'C12345' });
  // ... test code
});
```

Output: operation summary with counts, any errors or unmatched cases, link to the TestRail run/results.

## Integration Setup

### TestRail (Optional)
```bash
export TESTRAIL_URL="https://your-instance.testrail.io"
export TESTRAIL_USER="your@email.com"
export TESTRAIL_API_KEY="your-api-key"
```

### BrowserStack (Optional)
```bash
export BROWSERSTACK_USERNAME="your-username"
export BROWSERSTACK_ACCESS_KEY="your-access-key"
```

## Quick Reference

See `reference/` directory for:
- `golden-rules.md` — The 10 non-negotiable rules
- `locators.md` — Complete locator priority with cheat sheet
- `assertions.md` — Web-first assertions reference
- `fixtures.md` — Custom fixtures and storageState patterns
- `common-pitfalls.md` — Top 10 mistakes and fixes
- `flaky-tests.md` — Diagnosis commands and quick fixes

See `templates/README.md` for the full template index.
