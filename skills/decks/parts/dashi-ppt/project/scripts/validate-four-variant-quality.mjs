#!/usr/bin/env node
import {
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

import { getExportBrowserPath } from './chrome-path.mjs';
import {
  auditThemeAssetProvenance,
  groupPhysicalSlides,
} from './workflow/four-variant-quality.mjs';
import {
  beginWorkflowStage,
  workflowTelemetryPath,
} from './workflow-telemetry.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const args = parseArgs(process.argv.slice(2));
if (!args.deck) {
  console.error('Usage: node scripts/validate-four-variant-quality.mjs --deck <ppt/index.html> [--goal goal.json] [--out quality.json] [--theme-source-root <dir>]');
  process.exit(2);
}

const deckFile = path.resolve(args.deck);
const deckDir = path.dirname(deckFile);
const outFile = path.resolve(args.out || path.join(deckDir, 'four-variant-quality.json'));
const screenshotsDir = path.resolve(args.screenshots || path.join(deckDir, 'four-variant-screenshots'));
const projectRoot = path.resolve(args.projectRoot || ROOT);
const themeSourceRoot = path.resolve(args.themeSourceRoot || path.join(projectRoot, 'src/components/themes'));
const explicitGoalPath = args.goal ? path.resolve(args.goal) : null;
const goalPath = explicitGoalPath || inferGoalPath(deckFile);
const telemetry = beginWorkflowStage({
  goalPath,
  telemetryFile: workflowTelemetryPath(goalPath),
  stage: 'validate-four-variant-quality',
  kind: 'validate',
  command: 'validate:four-variant-quality',
});

if (explicitGoalPath) {
  const goal = JSON.parse(readFileSync(explicitGoalPath, 'utf8'));
  if (goal.schemaVersion !== 2) {
    const skippedReport = {
      schemaVersion: 1,
      deck: deckFile,
      goal: explicitGoalPath,
      generatedAt: new Date().toISOString(),
      skipped: true,
      reason: 'legacy-goal-spec',
    };
    writeReport(outFile, skippedReport);
    telemetry.finish({ ok: true });
    console.log(JSON.stringify({ out: outFile, skipped: true }));
    process.exit(0);
  }
}

let browser;
let dependencyAudit = null;
let descriptorScope = null;
let report;
try {
  const html = readFileSync(deckFile, 'utf8');
  const runtimeFile = path.join(deckDir, 'assets/imported-theme-runtime.js');
  dependencyAudit = auditThemeAssetProvenance({
    html: existsSync(runtimeFile) ? `${html}\n${readFileSync(runtimeFile, 'utf8')}` : html,
    deckDir,
    projectRoot,
    themeSourceRoot,
  });

  browser = await chromium.launch({
    headless: true,
    executablePath: getExportBrowserPath(),
  });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  await installDeckAssetRoute(page, deckDir);
  await page.setContent(withDeckBase(html), { waitUntil: 'load' });
  await page.waitForFunction(() => (
    document.querySelector('#deck')
    && typeof window.__getExportSlides === 'function'
    && typeof window.__materializeExportSlide === 'function'
    && typeof window.__restoreExportSlide === 'function'
  ));

  const runtime = await page.evaluate(() => {
    const visible = window.__getVisibleSlides?.()
      || [...document.querySelectorAll('#deck > .slide:not([hidden])')];
    return {
      liveLogicalPages: visible.length,
      descriptors: window.__getExportSlides('comparison'),
    };
  });
  const descriptors = normalizeExportDescriptors(runtime.descriptors);
  const qualityDescriptors = descriptors.filter(descriptor => descriptor.variantKind === 'bespoke');
  const groups = groupPhysicalSlides(descriptors);
  descriptorScope = {
    logicalGroupsChecked: groups.length,
    liveLogicalPagesChecked: runtime.liveLogicalPages,
    comparisonCandidates: descriptors.length,
    physicalPagesChecked: qualityDescriptors.length,
    templatePagesChecked: 0,
    templatePagesSkipped: descriptors.filter(
      descriptor => descriptor.variantKind === 'template',
    ).length,
    bespokePagesChecked: qualityDescriptors.length,
  };
  const groupErrors = validateGroups(groups, runtime.liveLogicalPages);
  const issues = [];
  const groupReports = [];
  let hydratedPhysicalPages = 0;
  mkdirSync(screenshotsDir, { recursive: true });

  for (const group of groups) {
    const pages = [];
    for (const descriptor of group.slides.filter(item => item.variantKind === 'bespoke')) {
      const measurement = await inspectExportCandidate(page, descriptor, screenshotsDir);
      if (measurement.hydrated) hydratedPhysicalPages += 1;
      pages.push({
        physicalId: descriptor.id,
        logicalIndex: measurement.logicalIndex,
        variantId: descriptor.variantId,
        variantKind: descriptor.variantKind,
        hydrated: measurement.hydrated,
        clipIssueCount: measurement.issues.length,
        rootMetrics: measurement.rootMetrics,
        screenshot: measurement.screenshot,
      });
      issues.push(...measurement.issues.map(issue => ({
        sourceSlideId: group.sourceSlideId,
        physicalId: descriptor.id,
        variantId: descriptor.variantId,
        variantKind: descriptor.variantKind,
        ...issue,
      })));
      if (!measurement.hydrated) {
        issues.push({
          sourceSlideId: group.sourceSlideId,
          physicalId: descriptor.id,
          variantId: descriptor.variantId,
          variantKind: descriptor.variantKind,
          kind: 'hydration-failed',
        });
      }
    }
    groupReports.push({
      sourceSlideId: group.sourceSlideId,
      pages,
    });
  }

  const bespokeClipFailures = issues.filter(issue => (
    issue.variantKind === 'bespoke' && issue.kind === 'scroll-clipping'
  ));
  report = {
    schemaVersion: 1,
    deck: deckFile,
    generatedAt: new Date().toISOString(),
    summary: {
      ...descriptorScope,
      hydratedPhysicalPages,
      groupContractFailureCount: groupErrors.length,
      bespokeClipFailureCount: bespokeClipFailures.length,
      dependencyFailureCount: dependencyAudit.errors.length,
      dependencyWarningCount: 0,
      browserErrorCount: pageErrors.length,
    },
    groups: groupReports,
    groupErrors,
    issues,
    dependencies: dependencyAudit,
    visualQaScope: {
      strategy: 'bespoke-only',
      template: 'skipped',
      bespoke: 'checked',
    },
    screenshotsDir,
    browserErrors: pageErrors,
  };
  writeReport(outFile, report);
  const failed = dependencyAudit.errors.length > 0
    || groupErrors.length > 0
    || bespokeClipFailures.length > 0
    || pageErrors.length > 0
    || hydratedPhysicalPages !== qualityDescriptors.length;
  telemetry.finish({
    ok: !failed,
    error: failed ? new Error(failureSummary(report)) : null,
  });
  if (failed) {
    console.error(`Four-variant quality validation failed: ${failureSummary(report)}`);
    process.exitCode = 1;
  } else {
    console.log(JSON.stringify({
      out: outFile,
      logicalGroupsChecked: groups.length,
      physicalPagesChecked: qualityDescriptors.length,
      screenshotsDir,
    }));
  }
} catch (error) {
  report ||= {
    schemaVersion: 1,
    deck: deckFile,
    generatedAt: new Date().toISOString(),
    summary: {
      logicalGroupsChecked: descriptorScope?.logicalGroupsChecked ?? null,
      liveLogicalPagesChecked: descriptorScope?.liveLogicalPagesChecked ?? null,
      comparisonCandidates: descriptorScope?.comparisonCandidates ?? null,
      physicalPagesChecked: descriptorScope?.physicalPagesChecked ?? null,
      templatePagesChecked: descriptorScope?.templatePagesChecked ?? null,
      templatePagesSkipped: descriptorScope?.templatePagesSkipped ?? null,
      bespokePagesChecked: descriptorScope?.bespokePagesChecked ?? null,
      hydratedPhysicalPages: null,
      groupContractFailureCount: null,
      bespokeClipFailureCount: null,
      dependencyFailureCount: dependencyAudit?.errors?.length ?? null,
      dependencyWarningCount: dependencyAudit ? 0 : null,
      browserErrorCount: null,
    },
    groups: [],
    groupErrors: [],
    issues: [],
    dependencies: dependencyAudit,
    visualQaScope: {
      strategy: 'bespoke-only',
      template: descriptorScope ? 'skipped' : 'not-reached',
      bespoke: descriptorScope ? 'attempted' : 'not-reached',
    },
    browserErrors: [],
    fatalError: error?.message || String(error),
  };
  writeReport(outFile, report);
  telemetry.finish({ ok: false, error });
  console.error(`Four-variant quality validation failed: ${error?.message || error}`);
  process.exitCode = 1;
} finally {
  await browser?.close().catch(() => {});
}

async function installDeckAssetRoute(page, rootDir) {
  const root = path.resolve(rootDir);
  await page.route('http://dashi.local/**', async route => {
    try {
      const requestUrl = new URL(route.request().url());
      const decoded = decodeURIComponent(requestUrl.pathname).replace(/^\/+/, '');
      let file = path.resolve(root, decoded || 'index.html');
      if (file !== root && !file.startsWith(`${root}${path.sep}`)) {
        await route.fulfill({ status: 403, body: 'Forbidden' });
        return;
      }
      if (existsSync(file) && statSync(file).isDirectory()) file = path.join(file, 'index.html');
      if (!existsSync(file) || !statSync(file).isFile()) {
        await route.fulfill({ status: 404, body: 'Not found' });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: contentTypeForFile(file),
        body: readFileSync(file),
      });
    } catch (error) {
      await route.fulfill({ status: 500, body: error?.message || 'Internal error' });
    }
  });
}

function withDeckBase(html) {
  const base = '<base href="http://dashi.local/">';
  if (/<head(?:\s[^>]*)?>/i.test(html)) {
    return html.replace(/<head(?:\s[^>]*)?>/i, match => `${match}${base}`);
  }
  return `${base}${html}`;
}

function contentTypeForFile(file) {
  return {
    '.css': 'text/css; charset=utf-8',
    '.gif': 'image/gif',
    '.html': 'text/html; charset=utf-8',
    '.ico': 'image/x-icon',
    '.jpeg': 'image/jpeg',
    '.jpg': 'image/jpeg',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.mov': 'video/quicktime',
    '.mp4': 'video/mp4',
    '.otf': 'font/otf',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.ttf': 'font/ttf',
    '.wasm': 'application/wasm',
    '.webm': 'video/webm',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
  }[path.extname(file).toLowerCase()] || 'application/octet-stream';
}

async function inspectExportCandidate(page, descriptor, screenshotsDir) {
  let token = null;
  try {
    const materialized = await page.evaluate(async candidate => {
      const slides = window.__getVisibleSlides?.()
        || [...document.querySelectorAll('#deck > .slide:not([hidden])')];
      const slide = candidate.sourceSlideId
        ? slides.find(item => item.dataset.vmSlideId === candidate.sourceSlideId)
          || slides.find(item => window.__getSlideSourceId?.(item) === candidate.sourceSlideId)
        : slides[candidate.logicalIndex];
      if (!slide) return { found: false, token: null, logicalIndex: null };
      const logicalIndex = slides.indexOf(slide);
      window.go?.(logicalIndex, { animate: false, force: true });
      const restoreToken = await window.__materializeExportSlide({
        sourceSlideId: candidate.sourceSlideId,
        logicalIndex,
        variantStateId: candidate.variantStateId,
        variantKind: candidate.variantKind,
        exportIndex: candidate.exportIndex,
      });
      return { found: true, token: restoreToken, logicalIndex };
    }, descriptor);
    token = materialized.token;
    if (!materialized.found) {
      return {
        hydrated: false,
        issues: [],
        rootMetrics: null,
        logicalIndex: null,
        screenshot: null,
      };
    }
    await page.evaluate(() => new Promise(resolve => (
      requestAnimationFrame(() => requestAnimationFrame(resolve))
    )));
    const screenshotFile = path.join(
      screenshotsDir,
      `slide-${String(materialized.logicalIndex + 1).padStart(2, '0')}-v4.png`,
    );
    await page.locator('#deck > .slide:not([hidden])')
      .nth(materialized.logicalIndex)
      .screenshot({ path: screenshotFile });
    const measurement = await page.evaluate(candidate => {
      const slides = window.__getVisibleSlides?.()
        || [...document.querySelectorAll('#deck > .slide:not([hidden])')];
      const slide = candidate.sourceSlideId
        ? slides.find(item => item.dataset.vmSlideId === candidate.sourceSlideId)
          || slides.find(item => window.__getSlideSourceId?.(item) === candidate.sourceSlideId)
        : slides[candidate.logicalIndex];
      if (!slide) return { hydrated: false, issues: [], rootMetrics: null };
      const importedRoot = slide.querySelector('.imported-theme-root');
      const bespokeRoot = slide.querySelector('.bespoke-root');
      const renderedStateId = slide.dataset.vmVariantStateId || slide.dataset.vmSlideId || '';
      const stateMatches = !candidate.variantStateId || renderedStateId === candidate.variantStateId;
      const hydrated = stateMatches && (importedRoot
        ? importedRoot.dataset.importedThemeRuntime === 'true'
        : Boolean(bespokeRoot || slide.dataset.qualityHydrated === 'true'));
      const root = importedRoot || bespokeRoot || slide;
      const rootMetrics = {
        element: describeElement(root),
        display: getComputedStyle(root).display,
        overflowX: getComputedStyle(root).overflowX,
        overflowY: getComputedStyle(root).overflowY,
        clientWidth: root.clientWidth,
        clientHeight: root.clientHeight,
        scrollWidth: root.scrollWidth,
        scrollHeight: root.scrollHeight,
      };
      const issues = [];
      for (const element of [root, ...root.querySelectorAll('*')]) {
        if (issues.length >= 12 || element.clientWidth <= 0 || element.clientHeight <= 0) continue;
        const style = getComputedStyle(element);
        const clipsX = ['hidden', 'clip', 'auto', 'scroll'].includes(style.overflowX);
        const clipsY = ['hidden', 'clip', 'auto', 'scroll'].includes(style.overflowY);
        const horizontal = clipsX && element.scrollWidth > element.clientWidth + 1;
        const vertical = clipsY && element.scrollHeight > element.clientHeight + 1;
        if (!horizontal && !vertical) continue;
        issues.push({
          kind: 'scroll-clipping',
          element: describeElement(element),
          overflowX: style.overflowX,
          overflowY: style.overflowY,
          clientWidth: element.clientWidth,
          clientHeight: element.clientHeight,
          scrollWidth: element.scrollWidth,
          scrollHeight: element.scrollHeight,
        });
      }
      return { hydrated, issues, rootMetrics };

      function describeElement(element) {
        const id = element.id ? `#${element.id}` : '';
        const classes = [...element.classList].slice(0, 3).map(name => `.${name}`).join('');
        return `${element.tagName.toLowerCase()}${id}${classes}`;
      }
    }, {
      ...descriptor,
      logicalIndex: materialized.logicalIndex,
    });
    return {
      ...measurement,
      logicalIndex: materialized.logicalIndex,
      screenshot: screenshotFile,
    };
  } finally {
    if (token) {
      await page.evaluate(async restoreToken => {
        await window.__restoreExportSlide(restoreToken);
      }, token);
    }
  }
}

function normalizeExportDescriptors(descriptors) {
  return (Array.isArray(descriptors) ? descriptors : []).map((descriptor, index) => {
    const sourceSlideId = String(descriptor?.sourceSlideId || '').trim();
    const variantStateId = String(
      descriptor?.variantStateId
      || descriptor?.stateId
      || descriptor?.id
      || '',
    ).trim();
    const variantId = String(
      descriptor?.variantId
      || variantStateId.split('::').at(-1)
      || '',
    ).trim();
    return {
      id: variantStateId || `${sourceSlideId}::${variantId}`,
      sourceSlideId,
      logicalIndex: Number.isInteger(Number(descriptor?.logicalIndex))
        ? Number(descriptor.logicalIndex)
        : null,
      variantStateId,
      variantId,
      variantKind: String(descriptor?.variantKind || '').trim(),
      exportIndex: Number.isInteger(descriptor?.exportIndex)
        ? descriptor.exportIndex
        : Number.isInteger(descriptor?.comparisonIndex)
          ? descriptor.comparisonIndex
          : index,
    };
  });
}

function validateGroups(groups, liveLogicalPages) {
  const errors = [];
  for (const group of groups) {
    const ids = group.slides.map(slide => slide.variantId);
    const kinds = group.slides.map(slide => slide.variantKind);
    const logicalIndexes = [...new Set(group.slides.map(slide => slide.logicalIndex))];
    if (group.slides.length !== 4) {
      errors.push(`${group.sourceSlideId}: expected 4 candidates, found ${group.slides.length}`);
      continue;
    }
    if (ids.join(',') !== 'v1,v2,v3,v4') {
      errors.push(`${group.sourceSlideId}: expected v1,v2,v3,v4 order, found ${ids.join(',')}`);
    }
    if (kinds.join(',') !== 'template,template,template,bespoke') {
      errors.push(`${group.sourceSlideId}: expected 3 template + 1 bespoke, found ${kinds.join(',')}`);
    }
    if (logicalIndexes.length !== 1 || !Number.isInteger(logicalIndexes[0])) {
      errors.push(`${group.sourceSlideId}: candidates must share one logicalIndex`);
    }
  }
  if (groups.length !== liveLogicalPages) {
    errors.push(`expected ${liveLogicalPages} logical groups, found ${groups.length}`);
  }
  if (!groups.length) errors.push('no comparison variant groups found');
  return errors;
}

function failureSummary(value) {
  const summary = value.summary;
  return [
    `group=${summary.groupContractFailureCount}`,
    `bespokeClip=${summary.bespokeClipFailureCount}`,
    `dependency=${summary.dependencyFailureCount}`,
    `browser=${summary.browserErrorCount}`,
    `hydrated=${summary.hydratedPhysicalPages}/${summary.physicalPagesChecked}`,
  ].join(', ');
}

function inferGoalPath(file) {
  const pptDir = path.dirname(file);
  const deckRoot = path.basename(pptDir) === 'ppt' ? path.dirname(pptDir) : pptDir;
  const candidate = path.join(deckRoot, 'goal.json');
  return existsSync(candidate) ? candidate : file;
}

function writeReport(file, value) {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const key = {
      '--deck': 'deck',
      '--goal': 'goal',
      '--out': 'out',
      '--project-root': 'projectRoot',
      '--theme-source-root': 'themeSourceRoot',
      '--screenshots': 'screenshots',
    }[arg];
    if (!key) continue;
    parsed[key] = argv[index + 1];
    index += 1;
  }
  return parsed;
}
