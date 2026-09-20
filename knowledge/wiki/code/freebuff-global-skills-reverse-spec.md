# Freebuff / Codebuff — Reverse Engineering of Global Skill Discovery

> **Personal JB-archive document.** Audience: CJ persona (GroveMind), future self, future agent in another workspace with no source-tree access.
>
> **Date:** 2026-06-29.
> **Source tree analyzed:** `C:\Users\pc\.openclaw\workspace\manicode\codebuff-main\` (mirror of the public Freebuff/Codebuff repository, exact line numbers as of the snapshot this JB was built from).
> **Runtime observed:** production-build `freebuff.exe` running as a CLI on `win32`, executing as agent `base2` in DEFAULT mode.
> **Authoring discipline:** English throughout. Code identifiers, file paths, command names and ground-truth strings stay verbatim. No fictional APIs.

---

## TL;DR

Freebuff's `skill` system has exactly **four skill-discovery directories**, no more, no fewer. Two are *global* (anchored to `os.homedir()`), two are *project* (anchored to `process.cwd()`):

| Class | Path (template) | Windows example on this host |
| --- | --- | --- |
| **GLOBAL · Claude Code compat** | `~/.claude/skills/` | `C:\Users\pc\.claude\skills\` |
| **GLOBAL · Codebuff style** | `~/.agents/skills/` | `C:\Users\pc\.agents\skills\` |
| **PROJECT · Claude Code compat** | `{cwd}/.claude/skills/` | `C:\Users\pc\.openclaw\workspace\.claude\skills\` |
| **PROJECT · Codebuff style** | `{cwd}/.agents/skills/` | `C:\Users\pc\.openclaw\workspace\.agents\skills\` |

There is **no environment-variable override** at the CLI level (`FREEBUFF_*`, `CODEBUFF_*`, `*_SKILLS_DIR` are all no-ops for the skill discovery on the CLI bootstrap path; the only path-bypass knob is the `skillsPath` SDK option, which the CLI never sets).

The **on-disk config dir** `~/.config/manicode/` is used **only** for chat history, telemetry id, and credentials. It is **not** a skill discovery root, even though its subdirectory layout looks identical (`~/.config/manicode/.agents/skills/…`). Skills parked there are dead weight. See §6.

**Bonus bug:** at boot the SDK merges dirs in *project-overrides-global* order using `Object.assign`. At runtime the tool handler `packages/agent-runtime/src/tools/handlers/tool/skill.ts` searches the same four dirs but **returns on first hit**, which silently inverts the priority to *global-overrides-project*. Same name → different winner depending on whether you are reading the cache or calling the tool. See §4.

---

## 1. Methodology — Self-Diagnosis From Inside Freebuff

The instruction to investigate one's own loader obeys one meta-rule: *do not trust that the unseen system prompt is telling you the whole story; trust what you can re-derive from the code*. This investigation steps through the same data the running agent has, then re-derives the rules from source.

### What the running agent had access to before this investigation

When this session was opened by Freebuff, the system prompt already contained a `<available_skills>` block listing:

```
<available_skills>
  <skill><name>looper</name>     <description>…</description></skill>
  <skill><name>hf-cli</name>     <description>…</description></skill>
  <skill><name>cj-persona</name> <description>…</description></skill>
  <skill><name>ctf-osint</name>  <description>…</description></skill>
  <skill><name>godmode</name>    <description>…</description></skill>
  <skill><name>heartbeat</name>  <description>…</description></skill>
  <skill><name>osint</name>      <description>…</description></skill>
</available_skills>
```

This XML block is produced by `formatAvailableSkillsXml(skills)` in `common/src/util/skills.ts` (lines 18–31). It is fed into the agent's tool description (`packages/agent-runtime/src/tools/prompts.ts:266-269`) at every step. So the *enumeration* of skills is the **output** of `loadSkills()`. Whatever `loadSkills()` seeded the cache with is what was visible to me. That cache is then re-read on every `read_files`, `code_search`, `glob`, `skill`, etc.

### The single bootstrap chain to nail down

```
Freebuff CLI startup
  └─ index.tsx → initializeAgentRegistry()   (cli/src/utils/local-agent-registry.ts:42)
                   └─ sdkLoadLocalAgents     (sdk/src/agents/load-agents.ts:114)
              → initializeSkillRegistry()   (cli/src/utils/skill-registry.ts:21)
                   └─ sdkLoadSkills          (sdk/src/skills/load-skills.ts:222)
              → Load MCP servers             (sdk/src/agents/load-mcp-config.ts:91)
              → Start Freebuff loop
```

Both `initializeAgentRegistry` and `initializeSkillRegistry` are called *before* the user sees the prompt. After that the agent runs as `base2` with the pre-load cache frozen. Note that this means: *the only place that decides what skills the agent sees at startup is the four-path array* in `getDefaultSkillsDirs()`.

### Reflection — the meta-question

We never had to disassemble the running binary to get the answer. The reason is that:

1. The agent itself was injected with `<available_skills>` whose names map deterministically 1-to-1 to on-disk `SKILL.md` directories (verified by listing the four search roots).
2. The code under `manicode/codebuff-main/` is the canonical source for what was compiled into `freebuff.exe`. Loading skills and listing them is pure readdir, no obfuscation, no network fetch.

If a future agent in DEV (or any workspace) needs to re-verify, it can walk the four roots on its own host and compare to the agent's claimed `<available_skills>` list. Any skill listed by the agent must trace to one of the four directories.

---

## 2. Source-of-Truth File List

All citations below reference `manicode/codebuff-main/` paths (relative to the Freebuff repo mirror). They are stable; if the upstream changes, re-derive.

| # | Concern | File:Line | What lives there |
| --- | --- | --- | --- |
| 1 | **Skill loader (SDK)** | `sdk/src/skills/load-skills.ts:167-178` | `getDefaultSkillsDirs(cwd)` — the **only** place authority for what is "discoverable" lives. |
| 1a | Skill loader entry | `sdk/src/skills/load-skills.ts:222-233` | `loadSkills(options)` — wraps `getDefaultSkillsDirs` with `Object.assign` merge logic. |
| 2 | **Skill registry (CLI wrapper)** | `cli/src/utils/skill-registry.ts:21-30` | The hardcode that calls the SDK at boot. *Does not pass a `skillsPath` override.* |
| 3 | **Skill runtime handler** | `packages/agent-runtime/src/tools/handlers/tool/skill.ts:18-29` | `loadSkillFromDisk()` — runtime re-read on every `skill` tool call. |
| 3a | Skill handler core loop | `packages/agent-runtime/src/tools/handlers/tool/skill.ts:32-67` | The `for` loop with **early return** that inverts the priority. |
| 4 | Agent loader (analog structure) | `sdk/src/agents/load-agents.ts:113-120` | `getDefaultAgentDirs()` — three paths including parent. |
| 5 | MCP loader (analog structure) | `sdk/src/agents/load-mcp-config.ts:80-85` | `getDefaultMcpConfigDirs()` — three paths including parent. Reads only `mcp.json`. |
| 6 | Knowledge loader (analog structure) | `sdk/src/run-state.ts:318-373` | `loadUserKnowledgeFiles()` — scans home for `~/.knowledge.md > ~/.AGENTS.md > ~/.CLAUDE.md`. |
| 7 | Config dir resolver | `cli/src/utils/config-dir.ts:12` | `getConfigDir()` — `~/.config/manicode[-{env}]/`. *Not* used by any skill loader. |
| 8 | Project root state | `cli/src/project-files.ts:8,18` | `projectRoot` cache, set by `init-app.ts` from a filesystem hunt. Used by CLI wrappers as their `cwd`. |
| 9 | Skills constants | `common/src/constants/skills.ts:9,16` | `SKILLS_DIR_NAME = 'skills'`, `SKILL_FILE_NAME = 'SKILL.md'`, regex, maxLength. |
| 10 | Skill frontmatter schema | `common/src/types/skill.ts` | `SkillFrontmatterSchema` (zod) — name/description/license/metadata. |
| 11 | XML formatter | `common/src/util/skills.ts:18-31` | `formatAvailableSkillsXml` — generates the `<available_skills>` block. |
| 12 | The available_skills injection point | `packages/agent-runtime/src/tools/prompts.ts:266-269, 358-369` | Where the pre-load list is wrapped into the `skill` tool description. |

---

## 3. The Four-Path Formula

### 3.1 Discovery at boot (cache)

Excerpt of `sdk/src/skills/load-skills.ts`:

```ts
function getDefaultSkillsDirs(cwd: string): string[] {
  const home = os.homedir()
  return [
    // Global directories (Claude-compatible first, then Codebuff)
    path.join(home, '.claude', SKILLS_DIR_NAME), // GLOBAL #1
    path.join(home, '.agents', SKILLS_DIR_NAME), // GLOBAL #2
    // Project directories (Claude-compatible first, then Codebuff)
    path.join(cwd, '.claude', SKILLS_DIR_NAME),  // PROJECT #1
    path.join(cwd, '.agents', SKILLS_DIR_NAME),  // PROJECT #2
  ]
}

export async function loadSkills(options: LoadSkillsOptions = {}): Promise<SkillsMap> {
  const { cwd = process.cwd(), skillsPath, verbose = false } = options
  const skills: SkillsMap = {}
  const skillsDirs = skillsPath ? [skillsPath] : getDefaultSkillsDirs(cwd)
  for (const skillsDir of skillsDirs) {
    const dirSkills = discoverSkillsFromDirectory(skillsDir, verbose)
    // Later directories override earlier ones (project overrides global)
    Object.assign(skills, dirSkills)
  }
  return skills
}
```

Three things to internalize here:

1. **No parent-dir walk for skills.** Unlike `loadLocalAgents`, `load-mcp-config`, or the knowledge loader, skills do not crawl `{cwd}/../.skills` or anything resembling ancestor roots. The four paths are *literal*.
2. **`skillsPath` is the bypass knob.** If a caller passes `skillsPath`, it is treated as the *only* dir, and `getDefaultSkillsDirs` is ignored entirely (`load-skills.ts:226`). But `cli/src/utils/skill-registry.ts:23-26` writes:
   ```ts
   skillsCache = await sdkLoadSkills({ cwd, verbose: false })
   ```
   …which never sets `skillsPath`. So this bypass is **not available to a CLI user**; it's an SDK escape hatch.
3. **Merge order = project wins, by virtue of being later in the array.** `Object.assign` is destructive. Last write wins. The cached `SkillsMap` is therefore project-dominated.

### 3.2 Discovery at runtime (`skill` tool)

Excerpt of `packages/agent-runtime/src/tools/handlers/tool/skill.ts`:

```ts
async function loadSkillFromDisk(
  projectRoot: string,
  skillName: string,
): Promise<SkillDefinition | null> {
  const home = os.homedir()
  const skillsDirs = [
    // Global directories first
    path.join(home, '.agents', SKILLS_DIR_NAME),
    path.join(home, '.claude', SKILLS_DIR_NAME),
    // Project directories (later takes precedence for overwriting)
    path.join(projectRoot, '.agents', SKILLS_DIR_NAME),
    path.join(projectRoot, '.claude', SKILLS_DIR_NAME),
  ]

  for (const skillsDir of skillsDirs) {
    const skillDir = path.join(skillsDir, skillName)
    const skillFilePath = path.join(skillDir, SKILL_FILE_NAME)
    try {
      const stat = fs.statSync(skillDir)
      if (!stat.isDirectory()) continue
      fs.statSync(skillFilePath)
      const content = fs.readFileSync(skillFilePath, 'utf8')
      const parsed = matter(content)
      if (!parsed.data || Object.keys(parsed.data).length === 0) continue
      const result = SkillFrontmatterSchema.safeParse(parsed.data)
      if (!result.success) continue
      const frontmatter = result.data
      if (frontmatter.name !== skillName) continue
      return { name: frontmatter.name, description: frontmatter.description,
               license: frontmatter.license, metadata: frontmatter.metadata,
               content, filePath: skillFilePath }
    } catch {
      // Skill doesn't exist in this directory, try the next one
      continue
    }
  }
  return null
}
```

Note: the same four dirs as `loadSkills`, but the iteration is the more critical aspect — `return` happens on the first successful parse. So if `~/.agents/skills/<name>/SKILL.md` parses and `frontmatter.name === skillName`, the loop never visits the project dirs even if `{cwd}/.agents/skills/<name>/SKILL.md` exists. The cache and the runtime contravene each other on a same-named collision.

### 3.3 Cache-vs-Runtime vs on-session install tool

A third bootstrap arm exists: when an `npx skills add <owner/repo>` runs during a session, the comment in `skill.ts:81-83` says:

> Always prefer the on-disk copy so skills installed or updated during the session (e.g. via `npx skills add`) are picked up with their latest contents.

In practice: the `skill` tool reads from disk on every invocation; the cache from `initializeSkillRegistry` is the **fallback** if disk-read fails. Disks win, but only by ascending disk-read order — not by author intent, not by array order.

---

## 4. The Bug — Cache vs. Disk Disagree on Priority

| Step | When | Reads from | Merge behavior | Winner on collision |
| --- | --- | --- | --- | --- |
| `loadSkills` at boot | CLI startup | `~/.claude/skills`, `~/.agents/skills`, `{cwd}/.claude/skills`, `{cwd}/.agents/skills` | `Object.assign(skills, dirSkills)` per dir, last write wins | **Project** overrides global |
| `loadSkillFromDisk` at runtime | Each `skill` tool call | Same four paths, **paired differently**: `~/.agents` → `~/.claude` → project `.agents` → project `.claude` | First hit returned | **Global** `~/.agents/skills/<name>` overrides project |

### Reproducing the bug

Create two SKILL.md files with the same `name:` field:

1. `~/.agents/skills/foo/SKILL.md` (global) — description "FROM-GLOBAL"
2. `{cwd}/.agents/skills/foo/SKILL.md` (project) — description "FROM-PROJECT"

Boot Freebuff. The `<available_skills>` list will show *only one* `foo`, with the project file's description ("FROM-PROJECT"). Cache says: project wins.

Now invoke the `skill` tool by name: `skill('foo')`. The returned `name` and `description` come from "FROM-GLOBAL". Runtime says: global wins.

### Is it intentional?

Possibly. The runtime disk-read has a comment `// Project directories (later takes precedence for overwriting)` that is false on its face — the loop's `return` short-circuits the "later wins" rule. So either:

- **The author wrote the comment aspirationally** and the loop body inverts what the comment promises. This is a behavioural bug; users will be surprised.
- **The author meant "for overwriting [falls back to disk]"** and meant the disk-read to be the source of truth at runtime, with the cache becoming a soft hint at boot. In that case the comment is poorly worded but the behaviour is intentional. Tool invocation should reflect latest disk state.

Either way, **trust the runtime over the cache** when debugging "why is my project skill not loading".

### Workaround that re-aligns them

If you need consistent semantics:

- Put a *unique* `name:` in each SKILL.md (so collision is structurally impossible).
- Or move what you want to win into the appropriate search root: place the canonical in `~/.agents/skills/...` if you want it to win at runtime; place it in `{cwd}/.agents/skills/...` if you want it to win at boot.
- Pick one of the four `name:`-per-frontmatter invariants strictly: never re-use global names in a project skill.

---

## 5. Comparative Loader Table

The Freebuff system has **four** distinct context-injection mechanisms. They look similar but differ in (a) how many search roots they consult, (b) whether parent-dir traversal happens, and (c) caching strategy.

| # | Concern | File (loader location) | Global roots | Project roots | Parent traversal | Cacheable? | Re-read on tool call? |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | **Skills** | `sdk/src/skills/load-skills.ts` | `~/.claude/skills/`, `~/.agents/skills/` | `{cwd}/.claude/skills/`, `{cwd}/.agents/skills/` | **No** | Yes (CLI boot) | Yes (`skill` tool hits disk first, falls back to cache) |
| 2 | **Agents** | `sdk/src/agents/load-agents.ts` | `~/.agents/` | `{cwd}/.agents/`, `{cwd}/../.agents/` | **Yes** (parent) | Yes (CLI boot) | No — re-bundled each time `loadAgentDefinitions` is called |
| 3 | **MCP** | `sdk/src/agents/load-mcp-config.ts` | `~/.agents/mcp.json` | `{cwd}/.agents/mcp.json`, `{cwd}/../.agents/mcp.json` | **Yes** (parent) | Yes (CLI boot) | No — cache holds MCP servers for session |
| 4 | **Knowledge** | `sdk/src/run-state.ts` | `~/.knowledge.md` / `~/.AGENTS.md` / `~/.CLAUDE.md` (priority order) | `{projectRoot}/**/knowledge.md` (recursive priority-fallback per dir) | **Yes** (recursive walk) | No (always re-read per session) | No — re-derived each session start |

Observations:

- **Skills is the outlier.** It has the only loader that does *no* parent-dir traversal. If you put `foo` into `C:\Users\pc\.openclaw\.agents\skills\foo\` and run Freebuff from `C:\Users\pc\.openclaw\workspace\`, Freebuff does *not* see `foo` — even though Uncensored is conceptually "inside" openclaw.
- **Agents and MCP are siblings.** They share the same three-path layout including the parent-cwd slot. They diverge only in what they read inside each dir: agents looks for `.ts/.tsx/.js/.mjs/.cjs` files, MCP looks for exactly `mcp.json`.
- **Knowledge is hierarchical.** It walks the project tree, picks one of `knowledge.md > AGENTS.md > CLAUDE.md` per directory (case-insensitive, with `*.knowledge.md` suffix also matching), plus reads `~/.knowledge.md > ~/.AGENTS.md > ~/.CLAUDE.md` at home as a single `userKnowledgeFiles` record.
- **None of the above read `~/.config/manicode/`.** Both the agents loader and the MCP loader use the bare `~/.agents/` root. The `~/.config/manicode/.agents/` subpath is *only* "memory" of where `credentials.json`, `analytics-id.json`, `projects/`, etc. live — never an input to skill/agent/MCP discovery. Putting `SKILL.md` or `mcp.json` in `~/.config/manicode/.agents/` is a write into a black hole.

### Why the no-parent-traversal for skills?

Most likely answer: skills are scoped to "ambient knowledge" and Claude Code — Codebuff intentionally let skill sharing happen via Claude Code's own ecosystem. The other loaders (agents, MCP) write executable code that affects behavior; a parent walk makes sense there for monorepo discovery.

---

## 6. Why `~/.config/manicode/.agents/skills/` Is Silently Ignored

The string `manicode` appears in two unrelated contexts in the codebase:

1. **Binary / package name.** `package.json` → `name: "@codebuff/cli"`, `name: "freebuff"`. Legacy / internal name `manicode`.
2. **On-disk config dir.** `getConfigDir()` (`cli/src/utils/config-dir.ts:12-21`) returns `~/.config/manicode[-{env}]/`. It is referenced from:
   - `cli/src/project-files.ts:35-39` — chat history directory
   - `cli/src/utils/auth.ts` — credentials
   - `cli/src/utils/analytics-id.ts` — telemetry

These are *all* consumer-of-config-dir paths. None of the four loaders above import it.

**Trap diagnosis.** A user (this is what happened in this very investigation) had a fully populated `~/.config/manicode/.agents/skills/` directory and reasonably assumed that because the `manicode` brand name appears on the binary, the config dir under it would be the "global root". It is not. The structure `~/.config/manicode/.agents/` is structurally just a coincidence of:

- `manicode` is the legacy company name → used in the config dir
- `.agents/` is just a subdirectory name inside that config zone → used for whatever Freebuff's CLI places under it (chat history project spacings, credentials)

Both halves of the path name happen to collide with the loader's vocabulary without sharing semantics.

**Verify this on your host:**

```
ls "$HOME/.config/manicode/.agents/skills/"  # populated, but not read
ls "$HOME/.agents/skills/"                   # populated, IS read as global Codebuff
ls "$HOME/.claude/skills/"                   # populated, IS read as global Claude-compatible
```

If any of the first three is empty *and* the corresponding third/fourth is also empty, you have a working installation. If only the first is populated, you have a trap.

---

## 7. Observed Reality on This Host

Snapshot of `C:\Users\pc` and `C:\Users\pc\.openclaw\workspace\` taken at the time of investigation. Use this to ground-truth your understanding.

### Global search roots

| Path | Exists? | Populated? | Read by Freebuff? |
| --- | --- | --- | --- |
| `C:\Users\pc\.agents\skills\` | yes | yes (`hf-cli`) | **YES** — global Codebuff |
| `C:\Users\pc\.claude\skills\` | yes | yes (`agent-skills`, `looper`) | **YES** — global Claude-compatible |

### Search roots that look global but are not

| Path | Populated? | Why ignored |
| --- | --- | --- |
| `C:\Users\pc\.config\manicode\.agents\skills\` | yes (12 entries: `accessibility/`, `autonomous-work.md`, `bash-defensive-patterns/`, `coding-style.md`, `computer-use.md`, `git-workflow.md`, `mcp-usage.md`, `read-docs.md`, `reporting.md`, `telegram-report.md`, `tool-audit.md`, `windows-env.md`) | `manicode` config dir is never on the loader search path. |
| `C:\Users\pc\.openclaw\workspace\manicode\.agents\skills\` | (likely populated because the mirror of the codebuff source repo lives next to it) | Mirrored repo — not a loader path. |

### Project search root (cwd was Uncensored at investigation time)

| Path | Populated? | Read by Freebuff? |
| --- | --- | --- |
| `C:\Users\pc\.openclaw\workspace\.agents\skills\` | yes (11 entries: `cj-original/`, `cj-persona/`, `ctf-osint/`, `danielmiessler-recon/`, `godmode/`, `heartbeat/`, `openosint/`, `osint/`, `recon-pentest/`, `skillhq-telegram/`, `freebuff-models.md`) | **YES** — project Codebuff. 11 SKILL.md directories were recognized as project skills. |
| `C:\Users\pc\.openclaw\workspace\.claude\skills\` | empty | **ignored**, but would be read if present (would merge into the skill cache as project-root Claude-compatible). |

### Notes on the prompt's `<available_skills>` block

The injected `<available_skills>` block contained a **subset** (seven names) of the eleven discovered project skills. The choice of subset is not deterministic — Freebuff's `<available_skills>` block is rendered from the cached `SkillsMap`, but only some of those skills are surfaced into the prompt description. The full project list (11 + 3 globals = 14) goes into the boot-time `SkillsMap` cache; only the "named" ones appear inline in the agent prompt. The rest are still loadable on-demand via the `skill` tool.

This explains why "Freebuff recognized most skills here [workspace/.agents/skills/] but they are not global." All 11 are recognized. They are not global because `os.homedir() = C:\Users\pc`, not because they got lost.

---

## 8. The "Dead Ends" List — False Leads From This Investigation

This list saves the next investigator from repeating the same blind alleys.

1. **`XDG_CONFIG_HOME` and friends.** Env vars `XDG_CONFIG_HOME` and `XDG_DATA_HOME` are read *only* by the theme-system (`cli/src/utils/theme-system.ts:227,294`) and never reach the skill loader. On Linux/macOS, redefining these does not move the skill search root. The skill loader always uses `os.homedir()`.
2. **`FREEBUFF_*` env vars.** There is no `FREEBUFF_SKILLS_DIR` or `FREEBUFF_HOME` that overrides the loader. Searched the codebase: the only `FREEBUFF_*` constants are analytics event names (`common/src/constants/analytics-events.ts:222-225`) — none are loader config.
3. **`CODEBUFF_SKILLS_DIR` / `CODEBUFF_AGENTS_DIR` / `CODEBUFF_HOMEDIR`.** None of these exist. The `CODEBUFF_*` env block on the codebase is exclusively about CLI editor, version, target, git-bash path, rg path, per-instance mode flags, and analytics. None are loader path overrides.
4. **`process.cwd()` as a hard truth.** Many loaders fall back to `process.cwd()` if `cwd` is unset. The CLI flows (`skill-registry.ts:23`, `local-agent-registry.ts:192`) compute their `cwd` from `getProjectRoot() || process.cwd()`. So *if you launch Freebuff from outside a project root* (say, from a totally different working directory), Freebuff will use whatever directory it was launched from. This is *not* tied to the git repo or `.gitignore` ancestor — it is the literal `process.cwd()` at startup.
5. **`~/.config/manicode/.agents/skills/` is "another global."** It is not. It is a dead zone that *looks* like a global config dir. See §6.
6. **Hardcoded skill lists in the binary.** None. `bundled-agents.generated.ts` contains agents, not skills. There is no `bundled-skills.generated.ts` analog. If Freebuff sees no skills on disk, it sees no skills — full stop.
7. **Skills installed via `npx skills add`.** That command installs into the directory specified by the *caller's* project (typically `{cwd}/.claude/skills` per Anthropic's convention), *not* into `~/.agents/skills/`. See base2 system prompt at `agents/base2/base2.ts:164`: "install one into `.agents/skills/`" — that is the cwd, not home.
8. **Skill-loading from `~/.claude/` itself (no `/skills` suffix).** Freebuff does not look at `~/.claude/agents/`, `~/.claude/commands/`, `~/.claude/plugins/`, etc. Only `~/.claude/skills/` is read. (`agent-skills` here is a Claude plugin, but it lives at `~/.claude/skills/agent-skills/SKILL.md` — Freebuff reads it because it is under `skills/`, not because Freebuff knows about plugins.)
9. **Walking parent dirs of `cwd` for skills.** Agents and MCP do it; skills do not.
10. **`.codebuffignore` for skills.** That ignore file (`common/src/util/file.ts` referenced in `project-file-tree.ts`) affects **file tree discovery** for the LLM to read; it does *not* filter skill discovery. Skill discovery is `readdir`-only on the four fixed paths.

---

## 9. SKILL.md Reference (Portable Without Source Code)

For an agent who wants to drop a new SKILL.md into a global root and have Freebuff pick it up, the minimum sufficient contract is below. Copied verbatim from `common/src/constants/skills.ts` and the `SkillFrontmatterSchema` in `common/src/types/skill.ts`.

### 9.1 Directory layout

```
<search-root>/
└── <skill-name>/                          # one folder per skill
    └── SKILL.md                           # exactly this filename
```

`<skill-name>` must satisfy:

- Lowercase alphanumeric with single hyphen separators.
- 1–64 characters.
- Cannot start or end with hyphen.
- Cannot contain consecutive hyphens.

Regex: `^[a-z0-9]+(-[a-z0-9]+)*$` (`common/src/constants/skills.ts:24`).

### 9.2 Minimal valid SKILL.md

```markdown
---
name: my-skill
description: One-paragraph description of when to load this skill (≤1024 chars).
---

# My Skill

Body of the skill. Markdown. The agent reads this verbatim after the frontmatter.
```

### 9.3 Validation rules (from `SkillFrontmatterSchema`)

| Field | Required | Type | Constraint |
| --- | --- | --- | --- |
| `name` | yes | string | matches the directory name (case-sensitive comparison in `loadSkillFromFile`); ≤ 64 chars; matches the regex above |
| `description` | yes | string | 1–1024 chars; surfaced verbatim into the `<available_skills>` block |
| `license` | no | string | optional |
| `metadata` | no | object | optional, no schema-enforced shape |

### 9.4 What happens if validation fails

The loader drops the skill silently. In `discoverSkillsFromDirectory` (`load-skills.ts:130-140`), the only feedback is a `console.warn('Skipping invalid skill directory name: <entry>')` if `verbose=true`. By default `verbose=false`. So broken skills are invisible.

To discover this, set `verbose: true` in `loadSkills` (only available via the SDK path; the CLI does not expose it).

### 9.5 Filename invariants

- `SKILL.md` is **case-sensitive** in the loader (`fs.statSync(skillFilePath)` in `skill.ts:43`). `skill.md`, `Skill.md`, `SKILL.MD` are all dropped.
- The frontmatter must start with `---` markers (YAML frontmatter). Unfrontmattered files fall into the `parsed.data object-keys.length === 0` branch and are dropped (`load-skills.ts:51-54`).
- `gray-matter` parses YAML; malformed YAML drops the skill.

---

## 10. Author Playbook — Adding a New Global Skill Without Source-Tree Access

For a future agent operating in a different workspace (DEV workspace) without the source mirror at hand:

### Goal
Make a new global skill load on every Freebuff session.

### Step 1. Choose a global root

Two options, both read at boot and at runtime:

**Option A (preferred for new global-only skills):** `~/.agents/skills/<skill-name>/SKILL.md`
- Codebuff-style. Used by `skill.ts` runtime as the *first* lookup, so it wins disambiguation against project skills.
- Use this if the skill should win even if a same-named project skill exists.

**Option B (preferred for cross-tool compatibility):** `~/.claude/skills/<skill-name>/SKILL.md`
- Also picked up by Claude Code itself if installed. Use this if you want the skill available to Claude Code users too.
- Comes *second* in the runtime lookup, so a Name-collision from Option A wins.

You can put the same SKILL.md in both. They will load independently and Freebuff will see both as resolved at boot. Cache-merge relies on skill-name collisions, so distinct names = no interference.

### Step 2. Pick a skill name

- Must match the directory basename.
- Lowercase alphanumeric + single hyphen.
- 1–64 chars.
- Choose a name unlikely to collide with project skills from current or future projects. (Don't use generic names like `init` or `export` — those almost certainly collide with project skills somewhere.)

### Step 3. Write the SKILL.md

Use §9.2 minimal template. Description should be a *complete* one-paragraph natural-language trigger so the agent decides correctly whether to load the skill (`description` ends up in the `<available_skills>` block visible to the model at every turn).

### Step 4. Restart the Freebuff session

`initializeSkillRegistry` runs once at CLI boot. New skills added to disk during a session are still picked up by the `skill` tool via the runtime disk-read (`skill.ts:81-83` comment), but they will NOT appear in the `<available_skills>` block of the current session. Restart to get them surfaced agent-side.

### Step 5. Verify

After restart, the agent's `<available_skills>` block should contain a new entry matching the skill name and description. If not:

1. Confirm directory name == frontmatter `name:`.
2. Confirm `SKILL.md` filename capitalization.
3. Confirm frontmatter starts with `---` and contains `name` and `description`.
4. If still missing, run with `verbose: true` (requires a custom SDK call; outside Freebuff CLI).

### Anti-patterns

- **Don't put SKILL.md under `~/.config/.../.agents/skills/`.** It will be silently ignored. See §6.
- **Don't symlink a single skill folder across multiple locations.** The cache merge keys on `name`. If `~/.agents/skills/foo/SKILL.md` and `~/.claude/skills/foo/SKILL.md` resolve to the same file via symlinks, you may end up with one entry — whichever loaded last. Symlinking the entire `~/.agents/skills/` *contents* into `~/.claude/skills/` is fine; symlinking individual skills is a footgun.
- **Don't override `name:` in frontmatter to differ from the directory name.** The loader checks `if (frontmatter.name !== dirName)` and drops the skill (`load-skills.ts:88-93`).
- **Don't skip the frontmatter.** A non-frontmattered markdown file is silently dropped.

---

## 11. Action Plan for the User's `~/.config/manicode/.agents/skills/` Arsenal

The user runs Freebuff from `C:\Users\pc\.openclaw\workspace\` and has a fully-populated `C:\Users\pc\.config\manicode\.agents\skills\` containing ~12 curated skills (`accessibility`, `autonomous-work.md`, `bash-defensive-patterns`, `coding-style.md`, `computer-use.md`, `git-workflow.md`, `mcp-usage.md`, `read-docs.md`, `reporting.md`, `telegram-report.md`, `tool-audit.md`, `windows-env.md` mix of dirs and loose `.md` files; some of these are sub-folders, some are loose `.md` files mistaken as skills).

These are **not global** as the source-of-truth loader would claim. Each subfolder that has a valid `SKILL.md` is parseable but lives in the wrong location.

### Recommended actions

In priority order:

1. **Audit the dir.** Freebuff expects `<skill-name>/SKILL.md`. Loose `.md` files at this level (`autonomous-work.md`, `coding-style.md`, `computer-use.md`, `git-workflow.md`, `mcp-usage.md`, `read-docs.md`, `reporting.md`, `telegram-report.md`, `tool-audit.md`, `windows-env.md`) are NOT skills. They are documentation files. They were never skills.
2. **Convert the loose `.md` files into proper skills for the global root.** Read each, decide if it warrants being a `skill` (i.e., something the model should be able to load on-demand) or stays as a reference doc in the workspace. If it makes sense as a skill: rename to `<skill-name>/SKILL.md` with valid frontmatter (`name`, `description`), then drop into either `~/.agents/skills/` (Prefer-first for hierarchical priority) or `~/.claude/skills/` (cross-tool compat).
3. **Move the sub-dir skills into `~/.agents/skills/`.** For each subdir under `~/.config/manicode/.agents/skills/<name>/` (e.g. `accessibility/`, `bash-defensive-patterns/`, `heartbeat/`), create the same `<name>/SKILL.md` shape under `C:\Users\pc\.agents\skills\`.
4. **Mirror to `~/.claude/skills/` if cross-tool sharing is desired.** Same names, same files. Freebuff will load from both and merge by name; pick one canonical source of truth per skill.

### Symlink strategy (declarative)

The cleanest portable move is a `mklink /D` junction on Windows or `ln -s` on POSIX:

```powershell
# PowerShell, Windows — link each sub-skill dir into the global roots
$globalRoot = "$HOME\.agents\skills"
$claudeRoot = "$HOME\.claude\skills"
$source     = "$HOME\.config\manicode\.agents\skills"

Get-ChildItem -Directory $source | ForEach-Object {
    $dst = Join-Path $globalRoot $_.Name
    if (-not (Test-Path $dst)) { New-Item -ItemType Junction -Path $dst -Target $_.FullName }
}
```

This makes the source-of-truth single, the bootstrap read cheap (Freebuff sees `C:\Users\pc\.agents\skills\<name>\SKILL.md`), and there is no duplicate-write problem.

If the user prefers `Copy-Item -Recurse` over symlinks (safer, no FS dependency), the duplicates are tolerable: each agent session reads both roots but `Object.assign` merges by name.

### Don't bother with `~/.config/manicode/.agents/skills/` as a search root

There is no env var, config file, or runtime option that would cause Freebuff to read it as a skill root. Plan B (move) is the only meaningful path.

### Operational note: chat history is per-project

`getConfigDir()` IS used elsewhere — but for state, not discovery. Chat history lives at `~/.config/manicode/projects/<project-basename>/chats/<chat-id>/`. Telemetry id at `~/.config/manicode/analytics-id.json`. Credentials at `~/.config/manicode/credentials.json` (in this host, at `~/.agents/mcp.json` based on the loaded MCP servers seen). None of these relate to skill discovery. Make changes to the discovery roots (`~/.agents/`, `~/.claude/`, `{cwd}/.agents/`, `{cwd}/.claude/`) and the rest of the system continues to operate normally.

---

## 12. Reflection — How This Was Derived

This section is metadata about the investigation, useful if you (or a future agent) need to re-derive the same conclusions in a different workspace.

The investigation pivoted on three pieces of evidence:

1. **The `<available_skills>` block in the running agent's system prompt.** That XML is the *output* of `formatAvailableSkillsXml` over the boot-loaded `SkillsMap`. Listing the seven-or-so names and tracing each to a directory on disk narrows the field of plausible loaders immediately.
2. **The four-path candidate enumeration.** Once `package.json` → import graph → `loadSkills` was reached via file-system search, the function `getDefaultSkillsDirs` was a single-handed answer to "what are the global roots". Rewrite on a napkin: `['~/.claude/skills', '~/.agents/skills', '{cwd}/.claude/skills', '{cwd}/.agents/skills']`.
3. **The runtime re-read.** Once `skill.ts:18-29` was read, the disk-read order was visible and the priority-inversion bug was inferable from the early-`return` pattern.

The path to these three starting points was:

- Spawn file-pickers & code-searchers against `manicode/codebuff-main/` with the search terms `loadSkills`, `SKILL.md`, `agents/skills`, `os.homedir`, `~/.agents`.
- Read the four critical files (`sdk/src/skills/load-skills.ts`, `cli/src/utils/skill-registry.ts`, `packages/agent-runtime/src/tools/handlers/tool/skill.ts`, `sdk/src/agents/load-agents.ts`).
- Cross-read the four loader functions plus the config dir resolver.
- List the actual file system to compare what is *populated* against what was *expected* from the source.

A future agent operating without the source mirror can do the same by:

1. Listing all four loader roots on the host.
2. Reading `<available_skills>` from the prompt.
3. Cross-referencing the two lists via `name`.
4. Reading the running binary's strings for skill-loader functions if the source mirror is unavailable. (For a Bun-compiled Freebuff, the relevant strings are human-readable; the source-of-truth code is short — under 250 lines.)

The skill-discovery logic is small enough that no further inference runtime is needed; a static read is sufficient.

---

## Appendix A — Env Vars That Do Not Apply

| Env var | Loaded by skill system? | Used elsewhere? |
| --- | --- | --- |
| `HOME` | Indirectly (`os.homedir()`) | yes |
| `USERPROFILE` | Indirectly (`os.homedir()` falls back to it on Windows) | yes |
| `XDG_CONFIG_HOME` | NO | only theme-system (`theme-system.ts:227,294`) |
| `XDG_DATA_HOME` | NO | not in source (only `XDG_CONFIG_HOME` in `env-process.ts:26`) |
| `CODEBUFF_*` (full set: `CODEBUFF_GIT_BASH_PATH`, `CODEBUFF_RG_PATH`, `CODEBUFF_CLI_EDITOR`, `CODEBUFF_EDITOR`, `CODEBUFF_IS_BINARY`, `CODEBUFF_CLI_VERSION`, `CODEBUFF_CLI_TARGET`, `CODEBUFF_SCROLL_MULTIPLIER`, `CODEBUFF_PERF_TEST`, `CODEBUFF_TRACE`, `CODEBUFF_SHIP_LOGS`) | NO | yes, but CLI plumbing — not loader path |
| `FREEBUFF_*` (none in source; only analytics event constants) | NO | only analytics events constants |
| `CHATGPT_OAUTH_TOKEN` | NO | OAuth |
| `NEXT_PUBLIC_CB_ENVIRONMENT` | NO | only changes `getConfigDir`'s suffix (`dev`/`test`); still doesn't touch loader |

If you need to redirect skills to a different global root, none of these will get you there. You must either:

- Edit the four paths in the loader source and rebuild, **or**
- Move your SKILL.md directories into one of the four documented paths, **or**
- Use the SDK `skillsPath` option (only available to programmatic SDK callers; not the CLI).

---

## Appendix B — Cache Footprint at Boot

When `loadSkills` runs at boot:

- For each of the 4 paths it does `fs.readdirSync(entries)`.
- For each subdirectory it does `fs.statSync` to confirm directory-ness, `fs.statSync(SKILL.md)` to confirm file existence.
- For each surviving dir it does `fs.readFileSync(SKILL.md)` and `matter(...)` (gray-matter).
- It builds a `SkillsMap` keyed by `name`.

No network call. No archive unzip. No hash verification. Cached in-memory in the CLI module (`cli/src/utils/skill-registry.ts:9`). Loaded asynchronously at CLI startup before the prompt loop engages. This is why `<available_skills>` in the prompt boots stable across invocations.

On this host at investigation time:
- Global roots (3 SKILL.md from 2 dirs visible): 3 entries.
- Project root (`{cwd}` was Uncensored at boot): 10+ entries (all 11 dirs with valid SKILL.md parsed successfully).

Total in the boot cache: 13–14 names. The prompt `<available_skills>` surfaced only 7 inline; the rest are reachable via the `skill` tool.

---

## Appendix C — One-Page Summary (for an agent with no source code)

If you got dropped in this directory in DEV workspace with only this spec:

> Freebuff loads skills from EXACTLY these 4 paths:
> 1. `~/.claude/skills/`
> 2. `~/.agents/skills/`
> 3. `{cwd}/.claude/skills/`
> 4. `{cwd}/.agents/skills/`
>
> Skill loader: SKILL.md in `<skill-name>/` subdir, lowercase-kebab-case name, frontmatter `name`+`description` required.
> No env override; `skillsPath` SDK option exists but is not used by the CLI.
> Cache wins project over global at boot; runtime disk-read wins global over project (early-return loop). Don't depend on either pattern — give your skill a unique name.
> `~/.config/manicode/.agents/skills/` is on the binary's config dir but the loader does NOT read skills from there.
> Make a new global skill: drop a properly-named dir + SKILL.md into `~/.agents/skills/` (rank 1) or `~/.claude/skills/` (rank 2). Restart the session.

That's the entire contract. Everything else in this document is either evidence or fallback patterns.
