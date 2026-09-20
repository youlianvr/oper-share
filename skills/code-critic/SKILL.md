---
name: code-critic
description: >
  MUST USE when user asks to review code, find bugs, check for issues,
  audit code, code review, find bugs, check code, review, re-review,
  critique this, review this file, is this code good, what's wrong with,
  check for bugs, find problems.

  Sends code to proxy:4000 (deepseek-v4-flash) for merciless review.
  Returns structured report: score (0-10), critical count, each issue
  with severity/file/line/description/suggestion.
---

# Code Critic — merciless code reviewer

Sends files to proxy:4000 for review. Model: `deepseek-v4-flash` (free, local).

## When to use

- "review this code" / review this code
- "find bugs in proxy.py" / find bugs in proxy.py
- "check what's wrong with this file" / check what's wrong with this file
- "code review before commit" / code review before commit
- "security audit" / security audit

## Commands

### Review a single file

```bash
python _scripts/critic.py path/to/file.py
```

### Review a directory (recursively)

```bash
python _scripts/critic.py src/
```

### With a focus hint

```bash
python _scripts/critic.py proxy.py --context "look for security issues and resource leaks"
```

### JSON output (for scripts)

```bash
python _scripts/critic.py src/ --json
```

### Different model

```bash
python _scripts/critic.py file.py --model glm-5.2
```

## What it returns

```json
{
  "overall_score": 4.0,
  "critical_count": 3,
  "total_issues": 27,
  "passed": false,
  "summary": "Code has several critical issues...",
  "issues": [
    {
      "severity": "critical",
      "file": "proxy_probe.py",
      "line": 18,
      "description": "Hardcoded port defaults to 4001...",
      "suggestion": "Use the same default as proxy.py (4000)"
    }
  ]
}
```

Severity: `critical` > `major` > `minor` > `nit`.

`passed = true` means 0 critical issues. The score is always low by design
(harsh reviewer).

## Requirements

- Proxy on `localhost:4000` must be running
- Model `deepseek-v4-flash` available on the proxy (check: `curl -s localhost:4000/v1/models`)
- `httpx` installed (`pip install httpx`)

## Interpreting results

The critic is **merciless by design**. It ALWAYS finds issues, even in good code.

- `critical > 0` → real bugs that need fixing
- `major > 0` → serious architectural/design problems
- `minor > 0` → style, readability
- `nit > 0` → taste

Not every finding is the truth. ~15% are false positives (hallucinated
issues, missing context). Always verify before fixing.

## git pre-commit integration

```bash
# .git/hooks/pre-commit — review all staged Python files
for f in $(git diff --cached --name-only -- '*.py'); do
    python _scripts/critic.py "$f" --json || exit 1
done
```
