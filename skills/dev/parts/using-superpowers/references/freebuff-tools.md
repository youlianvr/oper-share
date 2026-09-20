# Freebuff / OpenClaw — Tool Mapping

Skills speak in actions ("batch independent lookups", "create a todo", "read a file").
On Freebuff these resolve to the tools below.

| Action skills request | Freebuff equivalent |
|---|---|
| Parallel work | No subagent spawning — run independent lookups inline, batching them into one tool-call round |
| Task tracking ("create a todo", "mark complete") | `write_todos` — keep the plan updated as you go |
| Read a file / search | `read_files`, `code_search`, `glob` |
| Run a command / tests | `run_terminal_command` (typecheck, tests, mv/rm only) |
| Web research | `web_search`, `read_url` |
| Browser / preview | `register_preview`, `preview_snapshot`, `preview_click`, `preview_type` |
| Skills | `skill` tool — loads SKILL.md by name from the 4 discovery roots |

## Orchestration

Subagent spawning was removed from this workspace, so DAG orchestration runs inline:
decompose the task into steps, execute them in one session, and batch independent
lookups into a single tool-call round. The `orchestrator` / `dispatching-parallel-agents`
skills were archived when that capability was removed.

## Environment

- Windows 11 (Git Bash for shell commands; POSIX syntax works via Git Bash)
- Project root: `C:\Users\pc\.openclaw\workspace\` (Oper / Uncensored)
- Local LiteLLM proxy on port 4000; skills and MCP servers from `~/.agents/`
