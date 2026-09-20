---
name: "agent-designer"
description: "Use when the user asks to design a multi-agent system, pick an orchestration pattern (supervisor/swarm/pipeline), generate tool schemas for agents, or evaluate agent execution logs for cost, latency, and failure bottlenecks. Examples: 'design an agent architecture for research automation', 'generate Anthropic tool schemas from these tool descriptions', 'analyze these agent run logs for bottlenecks'. NOT for Claude Code workflow files (use orchestrator)."
---

# Agent Designer — Multi-Agent System Architecture

Use the three tools below to design architectures, generate tool schemas, and evaluate execution logs. Use the planner to score architectures from requirements.

## When to use

- Designing a new multi-agent system from requirements (pattern choice, roles, comms)
- Generating provider-ready tool schemas (Anthropic + OpenAI formats) from plain tool descriptions
- Evaluating execution logs: success rate, latency distribution, cost, bottlenecks

**When NOT to use:** Claude Code Workflow-tool automations or runtime multi-agent fan-out — these run outside this skill's design scope.

## Pattern decision table

| Choose | When | Watch out for |
|---|---|---|
| Single agent | One bounded task, < ~5 tools | Don't add agents you don't need |
| Supervisor | Central decomposition, specialists report back | Supervisor becomes the bottleneck |
| Pipeline | Strictly sequential stages with handoffs | Rigid order; slowest stage gates throughput |
| Hierarchical | Multiple org layers, > ~8 agents | Communication overhead per level |
| Swarm | Parallel peers, fault tolerance over predictability | Hard to debug; needs consensus rules |

Run the planner to score the patterns deterministically.

## Workflow

All paths relative to this skill folder. Each step's JSON output is the next step's design input.

### 1. Design the architecture

Write a requirements JSON (copy `assets/sample_system_requirements.json` — keys: `goal`, `tasks[]`, `constraints{max_response_time, budget_per_task, concurrent_tasks}`, `team_size`):

```bash
python3 agent_planner.py requirements.json --format json -o arch
```

Emits `arch.json` with `architecture_design` (pattern, agents, communication links), `mermaid_diagram`, and `implementation_roadmap`. Read `architecture_design.pattern` and the per-agent role list; present the mermaid diagram to the user.

### 2. Generate tool schemas

Describe each agent's tools in plain JSON (copy `assets/sample_tool_descriptions.json`), then:

```bash
python3 tool_schema_generator.py tool_descriptions.json --validate -o tools
```

Emits `tools.json` (`tool_schemas`, `validation_summary`) plus provider-specific `tools_anthropic.json` / `tools_openai.json`. **Gate: every tool must print `✓ Valid`.** Fix any invalid schema before proceeding — never hand an agent an unvalidated schema.

### 3. Evaluate execution logs

Once the system runs (or against `assets/sample_execution_logs.json` for a dry run):

```bash
python3 agent_evaluator.py execution_logs.json --detailed -o eval
```

Emits `eval.json` with `summary`, `agent_metrics`, `bottleneck_analysis`, `error_analysis`, `cost_breakdown`, `sla_compliance`, and `optimization_recommendations`, plus split files (`eval_errors.json`, `eval_recommendations.json`).

### 4. Verification loop

The design is not done until:

1. `tool_schema_generator.py --validate` reports 0 invalid schemas.
2. `agent_evaluator.py` on a pilot run reports **0 critical issues** (the tool prints `CRITICAL: N critical issues` when found). If N > 0, apply the top item in `eval_recommendations.json`, re-run the pilot, and re-evaluate.
3. Compare your outputs against `expected_outputs/` to confirm the schema shape you're consuming hasn't drifted.

## Workflow scaffolding and handoff contracts

When the architecture needs a concrete multi-step workflow, use the bundled
`scripts/workflow_scaffolder.py` rather than inventing an ad-hoc format. The scaffold is a config generator only; it does not execute agents or provide runtime orchestration:

```bash
python3 scripts/workflow_scaffolder.py sequential --name content-pipeline
python3 scripts/workflow_scaffolder.py orchestrator --name incident-triage --output workflows/incident-triage.json
```

Select the smallest pattern that matches the dependency shape: `sequential`,
`parallel`, `router`, `orchestrator`, or `evaluator`. Define bounded handoff
fields, retry/timeouts, output validation, and per-step cost/context limits.
Read `references/workflow-patterns.md` for the pattern trade-offs.

## Boundary with runtime orchestration

Use `agent-designer` for architecture, tool schemas, workflow contracts, and
execution-log analysis. Runtime multi-agent execution (spawning, competing in
worktrees, cooperative pipelines) is out of scope and is not provided by this
skill or implied by its generated configs. Execute only through a separately
verified host/runtime capability; otherwise use an inline single-agent fallback.

## References

- `references/agent_architecture_patterns.md` — pattern trade-offs in depth
- `references/tool_design_best_practices.md` — schema, idempotency, error-handling rules
- `references/evaluation_methodology.md` — metric definitions the evaluator implements
- `references/workflow-patterns.md` — production workflow patterns and handoff contracts
