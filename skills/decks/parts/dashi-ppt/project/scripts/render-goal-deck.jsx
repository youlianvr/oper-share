#!/usr/bin/env node
import { scrubLocalPaths } from './scrub-local-paths.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { composeDeck } from '../src/deckComposer.jsx';
import { renderDeck } from '../src/renderDeck.jsx';
import { validateGoalSpec } from './validate-goal-spec.mjs';
import {
  beginWorkflowStage,
  workflowTelemetryPath,
} from './workflow-telemetry.mjs';

// 相对路径按调用方目录解析:npm run(含 --prefix)会把脚本 cwd 切到项目根,INIT_CWD 才是用户所在目录。
const CALLER_CWD = process.env.INIT_CWD || process.cwd();

const [, , specArg, outArg] = process.argv;

if (!specArg || !outArg) {
  console.error('Usage: npm run render:goal -- <goal-spec.json> <output/ppt/index.html>');
  process.exit(2);
}

const specPath = path.resolve(CALLER_CWD, specArg);
const outFile = path.resolve(CALLER_CWD, outArg);
const renderTelemetry = beginWorkflowStage({
  goalPath: specPath,
  telemetryFile: workflowTelemetryPath(specPath),
  stage: 'render',
  kind: 'render',
  command: 'render:goal',
});

try {
  const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
  const validationTelemetry = beginWorkflowStage({
    goalPath: specPath,
    telemetryFile: workflowTelemetryPath(specPath),
    stage: 'validate-goal-spec',
    kind: 'validate',
    command: 'validate:goal-spec',
  });
  const specErrors = validateGoalSpec(spec);
  if (specErrors.length) {
    const error = new Error(`Goal spec validation failed: ${specErrors.join('; ')}`);
    validationTelemetry.finish({ ok: false, error });
    renderTelemetry.finish({ ok: false, error });
    console.error('Goal spec validation failed:');
    for (const specError of specErrors) console.error(`- ${scrubLocalPaths(specError)}`);
    process.exit(1);
  }
  validationTelemetry.finish({ ok: true });
  const deck = composeDeck(spec);

  renderDeck(deck, { outFile });
  copyGoalSpec(specPath, outFile);
  renderTelemetry.finish({ ok: true });
  console.log(`Rendered ${deck.slides.length} slide(s): ${displayPath(outFile)}`);
} catch (error) {
  renderTelemetry.finish({ ok: false, error });
  console.error(`Could not render goal deck: ${scrubLocalPaths(error?.message || error)}`);
  process.exit(1);
}

function copyGoalSpec(from, to) {
  const outDir = path.dirname(to);
  const deckDir = path.basename(outDir) === 'ppt' ? path.dirname(outDir) : outDir;
  const target = path.join(deckDir, 'goal.json');
  fs.mkdirSync(deckDir, { recursive: true });
  if (path.resolve(from) !== path.resolve(target)) {
    fs.copyFileSync(from, target);
  }
}

function displayPath(file) {
  const relative = path.relative(CALLER_CWD, file);
  return relative && !relative.startsWith('..') && !path.isAbsolute(relative) ? relative : path.basename(file);
}
