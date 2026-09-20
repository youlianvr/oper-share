# Lesson: CLI indexers take the root from cwd — pass it explicitly

**2026-09-07** — zvec-grep MCP registration cycle.

## What happened

`cd ~ && nohup zg index --rebuild ...` — `zg index` uses the **current working
directory** as the index root when no root argument is passed. The rebuild
started indexing the whole user profile (Chrome Cookies, AppData...), died on a
locked `Cookies` file (`EBUSY: resource busy or locked`), and left a partial
33 MB index of personal files at `~/.zvec-grep`.

A secondary failure: the Recycle-Bin cleanup one-liner printed `TRASHED-OK` but
its error was eaten by the `| tail -2` pipe — the directory survived. The tool's
own removal command finished the job.

## Rules

1. Indexer/search CLI invocations MUST pass the target root as an explicit
   argument (`zg index "C:/Users/pc/.openclaw/workspace" ...`), never rely on cwd.
2. After any failed/aborted indexer run, check for leftover state at the
   unintended root and clean it with the tool's native removal command
   (`zg index --drop --yes`), not ad-hoc deletes.
3. Never pipe a destructive PowerShell command through `| tail` — the failure
   signal is exactly what the tail cuts. Verify deletion with a fresh `ls`
   before declaring success.
4. `~/.zvec-grep` is `ZVEC_GREP_HOME` (daemon/model-cache runtime state); only
   the index artifacts (`files.zvec`, `index.zvec`, `manifest.json`, `locks`)
   belong to a workspace — `models/` stays.
