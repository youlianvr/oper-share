---
name: windows-env
description: "Windows-specific development environment patterns — paths, package managers, shell differences from Linux/macOS. Use when: Windows, installing on Windows, choco, winget, win paths, PowerShell, CMD."
---

# Windows Environment — patterns for Windows

## When to use

- Installing tools on Windows
- Debugging scripts on Windows
- Choosing a package manager
- Paths, shell differences, codepages

## Package managers (priority)

| Priority | Manager | For what |
|-----------|----------|----------|
| 1 | **choco** | CLI tools (jq, bat, fzf) |
| 2 | **winget** | Microsoft Store / modern Windows apps |
| 3 | **pip** | Python packages (main) |
| 4 | **npm** | Node.js tools |
| 5 | **pipx** | Isolated Python apps |

## Differences from Linux/macOS

| Linux | Windows | Note |
|-------|---------|---------|
| `which` | `where` | Different command |
| `grep` | `findstr` | Different command |
| `/usr/bin/` | `C:\Program Files\` | Different path |
| `~` | `C:\Users\<user>\` | Different path |
| path `:` | path `;` | Different separator |

## Common pitfalls

- PowerShell vs CMD — different syntax
- Long paths — enable support in Windows
- Python and Node.js — full path names in PATH
- Unicode emoji in terminal — ASCII fallback in critical scripts
- `sigterm` doesn't work — use `SIGBREAK`

## Useful choco packages

```bash
choco install jq -y       # JSON processor
choco install bat -y      # cat with highlighting
choco install fzf -y      # fuzzy finder
```

## Useful npm packages

```bash
npm install -g tldr       # quick command help
```

## Related Skills

- `computer-use` — Windows-MCP
- `mcp-usage` — MCP servers
