---

name: plugin-creator
description: Scaffold a local Codewhale plugin bundle with a versioned manifest, namespaced Skills, and an explicit trust review.

---


# Plugin Creator


Use this skill when a user wants a local Codewhale plugin bundle. Codewhale

v0.9.1 has a deliberately bounded loader: trusted and enabled bundles may add

declarative Skills and MCP servers through the existing engines. Other

component kinds are inventory-only.


## Workflow


1. Pick a Codewhale-owned location:

   - User bundle: `~/.codewhale/plugins/<plugin-name>/`

   - Workspace bundle: `<workspace>/.codewhale/plugins/<plugin-name>/`

2. Normalize the bundle name to lowercase hyphen-case.

3. Create `plugin.toml`:


```toml

schema_version = 1


[plugin]

name = "my-plugin"

version = "0.1.0"

description = "What this bundle provides"


[skills]

path = "skills"

```


4. Put each Skill under `skills/<skill-name>/SKILL.md`. Codewhale exposes it

   as `my-plugin:<skill-name>`, never as an unqualified command.

5. Add `[mcp_servers.<name>]` only when the bundle needs an existing MCP

   engine. Keep stdio commands and paths inside the bundle. Map local

   environment values only as exact `${SOURCE_ENV}` references. For remote MCP,

   use HTTPS (or loopback HTTP), forbid URL user information/query/fragment,

   use only environment-backed headers or bearer tokens, and declare the exact

   normalized endpoint host set in `[capabilities].network_hosts`. Never place

   credentials in the manifest.

6. Declare commands, agents, hooks, LSP, native extensions, filesystem roots,

   or lifecycle mutation only when inventorying future work. v0.9.1 will show

   these declarations and refuse to activate the bundle.

7. Validate and review without executing bundle content:

   - `/plugin validate <plugin-name>`

   - `/plugin show <plugin-name>`

   - `/plugin enable <plugin-name>` to open the content/capability review

   - run the exact `/plugin trust ...` confirmation shown, then enable again

8. Verify `/skills inspect` reports plugin provenance and `/plugin list`

   reports the expected trust and activation state. Trust stages the reviewed

   content but does not activate it; enablement rebuilds the current

   workspace's Skill/MCP catalogue immediately.


Every user and workspace bundle starts untrusted and disabled. Do not add a

marketplace, downloader, updater, compatibility scan, executable extension

runtime, or automatic trust flow; those surfaces are outside v0.9.1.
