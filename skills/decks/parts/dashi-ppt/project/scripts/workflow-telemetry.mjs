import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from 'node:fs';
import { randomUUID } from 'node:crypto';
import path from 'node:path';

const TELEMETRY_SCHEMA_VERSION = 1;

export function workflowTelemetryPath(goalPath, explicitFile = process.env.DASHI_PPT_TELEMETRY_FILE) {
  if (explicitFile) return path.resolve(explicitFile);
  return path.join(path.dirname(path.resolve(goalPath)), 'workflow-telemetry.json');
}

export function createWorkflowRunId(now = Date.now) {
  return `${new Date(Number(now())).toISOString().replace(/[-:.TZ]/g, '')}-${randomUUID().slice(0, 8)}`;
}

export function workflowRunIdForGoal(goalPath, explicitRunId = process.env.DASHI_PPT_WORKFLOW_RUN_ID) {
  if (explicitRunId) return String(explicitRunId);
  try {
    const goal = JSON.parse(readFileSync(path.resolve(goalPath), 'utf8'));
    if (goal?.workflowRunId) return String(goal.workflowRunId);
  } catch {
    // goal:scaffold starts telemetry before goal.json exists.
  }
  const existing = readWorkflowTelemetry(workflowTelemetryPath(goalPath), { allowMissing: true });
  return existing?.runId || createWorkflowRunId();
}

export function beginWorkflowStage({
  goalPath,
  telemetryFile = workflowTelemetryPath(goalPath),
  runId = workflowRunIdForGoal(goalPath),
  reset = false,
  stage,
  kind = stage,
  command = stage,
  now = Date.now,
}) {
  if (!goalPath) throw new Error('workflow telemetry requires goalPath');
  if (!stage) throw new Error('workflow telemetry requires stage');
  const file = path.resolve(telemetryFile);
  const startedAtMs = Number(now());
  const previousReport = reset ? null : readWorkflowTelemetry(file, { allowMissing: true });
  const previous = previousReport?.runId === runId ? previousReport : null;
  const previousStageAttempts = previous?.stages?.[stage]?.attempts || [];
  const retry = previousStageAttempts.at(-1)?.status === 'failed';
  let finished = false;

  return {
    file,
    stage,
    get finished() {
      return finished;
    },
    finish({ ok = true, error = null, metrics = null } = {}) {
      if (finished) return readWorkflowTelemetry(file);
      finished = true;
      const finishedAtMs = Number(now());
      const currentReport = readWorkflowTelemetry(file, { allowMissing: true });
      const report = currentReport?.runId === runId
        ? currentReport
        : createEmptyReport(goalPath, runId, startedAtMs);
      const previousFinishedAtMs = latestFinishedAtMs(report);
      const attempt = {
        sequence: nextSequence(report),
        command,
        kind,
        runId,
        status: ok ? 'passed' : 'failed',
        retry,
        startedAt: new Date(startedAtMs).toISOString(),
        finishedAt: new Date(finishedAtMs).toISOString(),
        durationMs: Math.max(0, Math.round(finishedAtMs - startedAtMs)),
        gapSincePreviousMs: previousFinishedAtMs == null
          ? 0
          : Math.max(0, Math.round(startedAtMs - previousFinishedAtMs)),
        ...(metrics ? { metrics } : {}),
        ...(!ok ? { failureReason: failureReason(error) } : {}),
      };
      const current = report.stages?.[stage] || {
        stage,
        kind,
        command,
        attempts: [],
      };
      current.kind = kind;
      current.command = command;
      current.attempts = [...(current.attempts || []), attempt];
      report.stages ||= {};
      report.stages[stage] = current;
      rebuildSummary(report);
      writeTelemetry(file, report);
      return report;
    },
  };
}

export function readWorkflowTelemetry(file, { allowMissing = false } = {}) {
  const resolved = path.resolve(file);
  if (!existsSync(resolved)) {
    if (allowMissing) return null;
    throw new Error(`Workflow telemetry not found: ${resolved}`);
  }
  return JSON.parse(readFileSync(resolved, 'utf8'));
}

function createEmptyReport(goalPath, runId, startedAtMs) {
  return {
    schemaVersion: TELEMETRY_SCHEMA_VERSION,
    runId,
    goalPath: path.resolve(goalPath),
    workflowStartedAt: new Date(startedAtMs).toISOString(),
    workflowFinishedAt: null,
    wallClockDurationMs: 0,
    commandDurationMs: 0,
    stageGapDurationMs: 0,
    updatedAt: null,
    stages: {},
    commandCounts: {},
    failureCount: 0,
    retryCount: 0,
    failures: [],
    repeatedStages: [],
  };
}

function nextSequence(report) {
  return Object.values(report.stages || {})
    .flatMap(stage => stage.attempts || [])
    .reduce((max, attempt) => Math.max(max, Number(attempt.sequence) || 0), 0) + 1;
}

function rebuildSummary(report) {
  const orderedStages = Object.values(report.stages || {})
    .sort((left, right) => firstSequence(left) - firstSequence(right));
  const allAttempts = orderedStages
    .flatMap(stage => (stage.attempts || []).map(attempt => ({
      ...attempt,
      stage: stage.stage,
    })))
    .sort((left, right) => left.sequence - right.sequence);

  for (const stage of orderedStages) {
    const attempts = stage.attempts || [];
    stage.commandCount = attempts.length;
    stage.successCount = attempts.filter(attempt => attempt.status === 'passed').length;
    stage.failureCount = attempts.filter(attempt => attempt.status === 'failed').length;
    stage.retryCount = attempts.filter(attempt => attempt.retry).length;
    stage.totalDurationMs = attempts.reduce((sum, attempt) => sum + attempt.durationMs, 0);
    stage.lastDurationMs = attempts.at(-1)?.durationMs || 0;
    stage.lastFailureReason = [...attempts].reverse().find(attempt => attempt.failureReason)?.failureReason || null;
  }

  report.commandCounts = {};
  for (const attempt of allAttempts) {
    report.commandCounts[attempt.kind] = (report.commandCounts[attempt.kind] || 0) + 1;
  }
  report.failureCount = allAttempts.filter(attempt => attempt.status === 'failed').length;
  report.retryCount = allAttempts.filter(attempt => attempt.retry).length;
  report.failures = allAttempts
    .filter(attempt => attempt.status === 'failed')
    .map(attempt => ({
      sequence: attempt.sequence,
      stage: attempt.stage,
      kind: attempt.kind,
      reason: attempt.failureReason,
    }));
  report.repeatedStages = orderedStages
    .filter(stage => stage.commandCount > 1)
    .map(stage => ({
      stage: stage.stage,
      kind: stage.kind,
      command: stage.command,
      commandCount: stage.commandCount,
      failureCount: stage.failureCount,
      retryCount: stage.retryCount,
    }));
  report.metrics = {};
  for (const attempt of allAttempts) {
    for (const [key, value] of Object.entries(attempt.metrics || {})) {
      if (typeof value === 'number' && Number.isFinite(value)) {
        report.metrics[key] = (report.metrics[key] || 0) + value;
      }
    }
  }
  report.commandDurationMs = allAttempts.reduce((sum, attempt) => sum + attempt.durationMs, 0);
  report.stageGapDurationMs = allAttempts.reduce((sum, attempt) => sum + (attempt.gapSincePreviousMs || 0), 0);
  report.workflowFinishedAt = allAttempts.at(-1)?.finishedAt || report.workflowStartedAt;
  report.wallClockDurationMs = Math.max(
    0,
    new Date(report.workflowFinishedAt).getTime() - new Date(report.workflowStartedAt).getTime(),
  );
  report.updatedAt = new Date().toISOString();
}

function latestFinishedAtMs(report) {
  const values = Object.values(report.stages || {})
    .flatMap(stage => stage.attempts || [])
    .map(attempt => new Date(attempt.finishedAt).getTime())
    .filter(Number.isFinite);
  return values.length ? Math.max(...values) : null;
}

function firstSequence(stage) {
  return Math.min(...(stage.attempts || []).map(attempt => Number(attempt.sequence) || Infinity));
}

function failureReason(error) {
  const raw = error?.message || String(error || 'unknown failure');
  return raw.replace(/\s+/g, ' ').trim().slice(0, 600) || 'unknown failure';
}

function writeTelemetry(file, report) {
  mkdirSync(path.dirname(file), { recursive: true });
  const tempFile = `${file}.${process.pid}.tmp`;
  writeFileSync(tempFile, `${JSON.stringify(report, null, 2)}\n`);
  renameSync(tempFile, file);
}
