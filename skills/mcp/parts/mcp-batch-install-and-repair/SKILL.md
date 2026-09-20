---
name: mcp-batch-install-and-repair
description: Batch install/repair MCP servers, fix native bindings and env.
---

# MCP Batch Install and Repair

## Trigger
When multiple MCP servers have errors or need installation.

## Workflow
1. **Initial diagnosis** — inspect the current runtime MCP surface and configuration to see servers and status.
2. **Test each MCP** with initialize probe:
   ```bash
   timeout 30 npx -y <package> --help 2>&1 | head -5
   ```
   Check for:
   - `Connection closed` → first-run npx timeout, wait and retry
   - `Could not locate bindings file` → native binding missing
   - `missing required argument` → needs config/file
   - `Fatal X_API_KEY` → needs user key
   - `could not determine executable` → wrong package name or no bin

3. **Fix categories**:
   - **Env vars missing** → request the owner to provide/configure the variable; never write a secret automatically
   - **Native bindings** → `npm rebuild <package>` with `--foreground-scripts`
   - **Wrong package name** → find correct npm package, update config
   - **Runtime errors** → investigate with direct node run

4. **Report cleanup candidates** — disable/quarantine packages only after explicit owner authorization, confirmed ownership, and a reversible approved trash/recycle action; read-only diagnosis is the default.

## Pitfalls
- `Connection closed` on first add = npx downloading, NOT broken
- `PYTHONPATH`/`VIRTUAL_ENV` from hermes venv can interfere with `uvx --isolated`
- MCP tools only load in **new session** after config change
- **CRITICAL BLOCKER:** A dead symlink may break skill operations in a legacy Hermes profile. Confirm the path and ownership first; if removal is actually required, move the link through the workspace's approved trash/recycle procedure rather than deleting it in place. See `references/dead-symlink-blocker.md`.
- Never add MCP with placeholder env vars — leave disabled until real key provided
- Do not bypass the active workspace loader or write directly to an unverified external skills path.

## Native Binding Fix
For packages like `token-optimizer-mcp` that need `better-sqlite3`:
```bash
npm_config_ignore_scripts=false npm rebuild
npm install <package> --foreground-scripts
npm rebuild better-sqlite3 --foreground-scripts
```

## Config Format
```yaml
mcp_servers:
  <name>:
    enabled: true
    command: npx
    args: ["-y", "<package>"]
    env:
      SHODAN_API_KEY: "xxx"
```
