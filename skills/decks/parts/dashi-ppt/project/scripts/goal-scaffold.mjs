#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import {
  buildTemplateProjectionPlan,
  compactJson,
  contentShapeFromPresentation,
  isCoverCandidate,
  isCoverLikeLayout,
  inspectLayout,
  listLayouts,
  parseArgs,
} from './skill-workflow-utils.mjs';
import { hashSeed } from './workflow/layout-query.mjs';
import {
  presentationTargetEntries,
  projectorPresentationFieldForTarget as presentationFieldForTarget,
} from './workflow/presentation-field-semantics.mjs';
import {
  createLayoutAllocationState,
  layoutCompositionIdentity,
  layoutFamily,
  rebalanceDuplicateLayouts,
  selectDiverseLayouts,
} from './workflow/layout-allocation.mjs';
import { validateGoalSpec } from './validate-goal-spec.mjs';
import {
  chartUnitIdentity,
  condenseContentItems,
  deriveProjectionText,
  deriveSupportingSummary,
  deriveTemplateItems,
  formatValueWithUnit,
  isValidBespokeChartValue,
  normalizedChartValue,
  resolveContentMap,
} from '../src/variant-contract.mjs';
import { charLength } from './workflow/copy-contract.mjs';
import {
  beginWorkflowStage,
  createWorkflowRunId,
  workflowTelemetryPath,
} from './workflow-telemetry.mjs';

const BESPOKE_VARIANT_ID = 'v4';
const ROLE_LAYOUT_CANDIDATE_CACHE = new Map();
const FILL_PLAN_INSPECT_CACHE = new Map();
let layoutQueryCount = 0;
let lastAllocationDiagnostics = null;

// 相对路径按调用方目录解析:npm run(含 --prefix)会把脚本 cwd 切到项目根,INIT_CWD 才是用户所在目录。
const CALLER_CWD = process.env.INIT_CWD || process.cwd();

const DEFAULT_BODY_ROLES = [
  'statement',
  'breakdown',
  'context',
  'metrics',
  'comparison',
  'distribution',
  'relationship',
  'case',
  'image',
  'trend',
  'process',
  'risks',
  'actions',
  'result',
];

const BODY_ROLES = new Set([
  ...DEFAULT_BODY_ROLES,
  'transition',
  'observation',
  'ambient',
  'team',
]);

const args = parseArgs(process.argv.slice(2));

if (args.help || args.h) {
  printUsage();
  process.exit(0);
}

const scaffoldGoalPath = typeof args.out === 'string' && args.out.trim()
  ? path.resolve(CALLER_CWD, args.out)
  : null;
const requestedWorkflowRunId = args.workflowRunId || args['workflow-run-id'];
if (requestedWorkflowRunId === true) {
  console.error('--workflow-run-id requires a value');
  process.exit(1);
}
const explicitWorkflowRunId = String(
  requestedWorkflowRunId || process.env.DASHI_PPT_WORKFLOW_RUN_ID || '',
).trim();
const scaffoldRunId = scaffoldGoalPath
  ? explicitWorkflowRunId || createWorkflowRunId()
  : null;
const scaffoldTelemetry = scaffoldGoalPath
  ? beginWorkflowStage({
      goalPath: scaffoldGoalPath,
      telemetryFile: workflowTelemetryPath(scaffoldGoalPath),
      runId: scaffoldRunId,
      stage: 'scaffold',
      kind: 'scaffold',
      command: 'goal:scaffold',
    })
  : null;

try {
  run();
  scaffoldTelemetry?.finish({
    ok: true,
    metrics: {
      layoutQueryCount,
      ...(lastAllocationDiagnostics ? { allocation: lastAllocationDiagnostics } : {}),
    },
  });
} catch (error) {
  scaffoldTelemetry?.finish({ ok: false, error });
  console.error(error.message);
  process.exit(1);
}

function run() {
  const title = String(args.title || '').trim() || 'PPT';
  const goal = String(args.goal || '').trim() || title;
  const audience = String(args.audience || '').trim() || '目标受众';
  const themePack = String(args.theme || args.themePack || '').trim();
  const pageCount = Math.max(1, Math.min(50, Number(args.pages || args.pageCount || args['page-count']) || 0));
  const chunkSize = Number(args.chunkSize || args['chunk-size']) || 0;
  const layoutVariantsArg = args.layoutVariants ?? args['layout-variants'];
  const layoutVariants = layoutVariantsArg === undefined ? 3 : Number(layoutVariantsArg);
  const out = String(args.out || '').trim();
  const mediaIntent = parseMediaIntent(args);
  const briefs = parseBriefs(args.briefs || args['content-briefs']);

  if (!themePack) throw new Error('Missing --theme <themePack>');
  if (!pageCount) throw new Error('Missing --pages <n>');
  if (!out) throw new Error('Missing --out <goal.json>');
  if (layoutVariantsArg === true || ![1, 3].includes(layoutVariants)) {
    throw new Error('--layout-variants must be 1 or 3');
  }

  const { roles, explicit: rolesExplicit } = parseRoles(args.roles, Math.max(0, pageCount - 2));
  // 选页 seed:同分候选随机打散,让不同用户/不同次 scaffold 的骨架不再成片雷同;
  // --seed 显式传入时可复现同一份骨架。
  const seed = args.seed !== undefined && args.seed !== true ? String(args.seed) : String(Math.floor(Math.random() * 0xffffffff));
  const slides = buildSlides({
    themePack,
    pageCount,
    roles,
    rolesExplicit,
    briefs,
    mediaIntent,
    seed,
    layoutVariants,
    deckGoal: goal,
    audience,
  });
  const spec = {
    ...(layoutVariants === 3
      ? {
          schemaVersion: 2,
          variantOutputMode: 'comparison',
        }
      : {}),
    title,
    goal,
    themePack,
    pageCount,
    randomSeed: seed,
    workflowRunId: scaffoldRunId,
    slides,
  };
  const errors = validateGoalSpec(spec, {
    allowUnfilledMediaIntent: true,
    allowUnfilledBespoke: true,
    allowUnfilledContent: true,
  });
  if (errors.length) throw new Error(`Scaffold failed goal spec validation:\n- ${errors.join('\n- ')}`);

  writeJson(out, spec);
  const fillPlanOut = writeFillPlan(out, spec);
  writeChunks(out, spec, chunkSize);
  process.stdout.write(compactJson({
    out: path.resolve(CALLER_CWD, out),
    fillPlanOut,
    themePack,
    pageCount,
    layoutVariants,
    workflowRunId: scaffoldRunId,
    slideCount: slides.length,
    chunkSize: chunkSize || null,
    ...(layoutVariants === 3 && lastAllocationDiagnostics
      ? { allocation: lastAllocationDiagnostics }
      : {}),
  }));
}

function buildSlides({
  themePack,
  pageCount,
  roles,
  rolesExplicit,
  briefs,
  mediaIntent,
  seed = null,
  layoutVariants = 3,
  deckGoal = '',
  audience = '目标受众',
}) {
  if (layoutVariants === 3) {
    return buildFourVariantSlides({
      themePack,
      pageCount,
      roles,
      rolesExplicit,
      briefs,
      mediaIntent,
      seed,
      deckGoal,
      audience,
    });
  }
  let mediaAssigned = false;
  let defaultRoleCursor = 0;
  const legacyUsed = layoutVariants === 1 ? new Set() : null;
  const allocationState = layoutVariants === 3
    ? {
        layoutUsage: new Map(),
        familyUsage: new Map(),
        previousFamilies: new Set(),
      }
    : null;
  const slides = Array.from({ length: pageCount }, (_, index) => {
    const used = legacyUsed || new Set();
    const isCover = index === 0;
    const isClosing = pageCount > 1 && index === pageCount - 1;
    const isBody = !isCover && !isClosing;
    const bodyIndex = index - 1;
    const brief = briefs[index] || null;
    const content = canonicalSlideContent(brief, index);
    const contentShape = contentShapeFromPresentation(content.presentation, brief);
    const useMediaIntent = Boolean(mediaIntent && !mediaAssigned && isBody);
    let role = isCover
      ? 'cover'
      : isClosing
        ? 'closing'
        : brief?.role
          ? String(brief.role)
          : rolesExplicit
          ? roles[bodyIndex]
          : roles[bodyIndex % roles.length];
    if (useMediaIntent) role = 'image';
    const roleSeed = `${seed}:role:${role}${useMediaIntent ? `:${mediaIntent.field}:${mediaIntent.count}` : ''}`;

    let layouts;
    if (layoutVariants === 1) {
      layouts = [pickLayout({
        themePack,
        role,
        used,
        body: !isCover,
        mediaIntent: useMediaIntent ? mediaIntent : null,
        content,
        contentShape,
        seed: roleSeed,
      })];
    } else if (isClosing) {
      layouts = pickClosingLayouts({
        themePack,
        used,
        content,
        contentShape,
        count: layoutVariants,
        seed: `${seed}:closing`,
        allocationState,
      });
    } else if (isBody && !rolesExplicit && !useMediaIntent && !brief) {
      const picked = pickDefaultBodyLayouts({
        themePack,
        roles,
        startIndex: defaultRoleCursor,
        used,
        content,
        contentShape,
        count: layoutVariants,
        seed,
        allocationState,
      });
      role = picked.role;
      layouts = picked.layouts;
      defaultRoleCursor = picked.nextIndex;
    } else {
      layouts = pickRoleLayouts({
        themePack,
        role,
        used,
        body: !isCover,
        mediaIntent: useMediaIntent ? mediaIntent : null,
        content,
        contentShape,
        count: layoutVariants,
        seed: roleSeed,
        allocationState,
      });
    }

    const variants = layouts.map((layout, variantIndex) => {
      used.add(layout);
      const projection = suggestTemplateProjection(layout, content, {
        validateOnly: layoutVariants === 1 && !hasAuthoredCanonicalContent(content),
      });
      return {
        id: `v${variantIndex + 1}`,
        kind: 'template',
        layout,
        props: projection.props,
        contentMap: projection.contentMap,
        ...(useMediaIntent ? { [mediaIntent.field]: mediaIntent.value } : {}),
      };
    });
    if (useMediaIntent) mediaAssigned = true;
    if (layoutVariants === 1) {
      const slide = { ...variants[0] };
      delete slide.id;
      delete slide.kind;
      delete slide.contentMap;
      return slide;
    }
    return {
      content,
      selectedVariant: 'v1',
      variants: [
        ...variants,
        {
          id: BESPOKE_VARIANT_ID,
          kind: 'bespoke',
          adjustable: false,
          composition: {
            designIntent: {
              objective: '',
              audience: '',
              narrativeRole: '',
              emphasis: '',
              rationale: '',
            },
            background: 'default',
            elements: [],
          },
          contentMap: {},
        },
      ],
    };
  });
  if (mediaIntent && !mediaAssigned) {
    throw new Error(`No body slide available for ${mediaIntent.field}; use --pages 3 or more`);
  }
  return slides;
}

function buildFourVariantSlides({
  themePack,
  pageCount,
  roles,
  rolesExplicit,
  briefs,
  mediaIntent,
  seed,
  deckGoal,
  audience,
}) {
  let mediaAssigned = false;
  const descriptors = Array.from({ length: pageCount }, (_, index) => {
    const isCover = index === 0;
    const isClosing = pageCount > 1 && index === pageCount - 1;
    const isBody = !isCover && !isClosing;
    const bodyIndex = index - 1;
    const brief = briefs[index] || null;
    const content = canonicalSlideContent(brief, index);
    const contentShape = contentShapeFromPresentation(content.presentation, brief);
    const useMediaIntent = Boolean(mediaIntent && !mediaAssigned && isBody);
    const role = useMediaIntent
      ? 'image'
      : isCover
        ? 'cover'
        : isClosing
          ? 'closing'
          : brief?.role
            ? String(brief.role)
            : rolesExplicit
              ? roles[bodyIndex]
              : roles[bodyIndex % roles.length];
    if (useMediaIntent) mediaAssigned = true;
    return {
      index,
      isCover,
      isClosing,
      isBody,
      brief,
      content,
      contentShape,
      role,
      useMediaIntent,
      roleSeed: `${seed}:slide-${index + 1}:role:${role}`,
      hasExplicitChartData: Array.isArray(brief?.content?.presentation?.chartData)
        && brief.content.presentation.chartData.length >= 2,
    };
  });
  if (mediaIntent && !mediaAssigned) {
    throw new Error(`No body slide available for ${mediaIntent.field}; use --pages 3 or more`);
  }

  const candidateMatrix = descriptors.map(descriptor => {
    const { available, total } = roleLayoutCandidates({
      themePack,
      role: descriptor.role,
      used: new Set(),
      body: !descriptor.isCover,
      mediaIntent: descriptor.useMediaIntent ? mediaIntent : null,
      content: descriptor.content,
      contentShape: descriptor.contentShape,
      seed: descriptor.roleSeed,
    });
    return {
      descriptor,
      candidates: available,
      total,
    };
  });
  const shortages = candidateMatrix.filter(item => item.candidates.length < 3);
  if (shortages.length) {
    throw new Error(
      `Insufficient compatible layouts in ${themePack}: `
      + shortages.map(item => (
        `slide ${item.descriptor.index + 1} role "${item.descriptor.role}" `
        + `requires 3, available ${item.candidates.length}/${item.total}`
      )).join('; '),
    );
  }

  const allocationState = createLayoutAllocationState();
  const assignments = new Array(pageCount);
  const assignmentOrder = [...candidateMatrix].sort((left, right) => (
    left.candidates.length - right.candidates.length
    || left.descriptor.index - right.descriptor.index
  ));
  for (const item of assignmentOrder) {
    assignments[item.descriptor.index] = selectDiverseLayouts(
      item.candidates,
      3,
      allocationState,
      item.descriptor.roleSeed,
      item.descriptor.index,
    );
  }
  rebalanceDuplicateLayouts(assignments, candidateMatrix, seed);
  lastAllocationDiagnostics = allocationDiagnostics(assignments, candidateMatrix);
  const bespokeFamilies = planBespokeFamilies(descriptors, seed);

  return descriptors.map((descriptor, index) => {
    const variants = assignments[index].map((layout, variantIndex) => {
      const projection = suggestTemplateProjection(layout, descriptor.content);
      return {
        id: `v${variantIndex + 1}`,
        kind: 'template',
        layout,
        props: projection.props,
        contentMap: projection.contentMap,
        ...(descriptor.useMediaIntent ? { [mediaIntent.field]: mediaIntent.value } : {}),
      };
    });
    const bespoke = buildBespokeDraft(
      descriptor,
      bespokeFamilies[index],
      deckGoal,
      audience,
    );
    return {
      content: descriptor.content,
      selectedVariant: 'v1',
      variants: [
        ...variants,
        {
          id: BESPOKE_VARIANT_ID,
          kind: 'bespoke',
          adjustable: false,
          composition: bespoke.composition,
          contentMap: bespoke.contentMap,
        },
      ],
    };
  });
}

function allocationDiagnostics(assignments, candidateMatrix) {
  const candidateByPage = candidateMatrix.map(item => new Map(
    item.candidates.map(candidate => [candidate.layout, candidate]),
  ));
  const selectedCandidates = assignments.map((layouts, pageIndex) => (
    layouts.map(layout => candidateByPage[pageIndex].get(layout)).filter(Boolean)
  ));
  const layoutUsage = new Map();
  assignments.flat().forEach(layout => incrementUsage(layoutUsage, layout));
  const families = selectedCandidates.flat().map(layoutFamily);
  const compositions = selectedCandidates.flat().map(layoutCompositionIdentity);
  const maximumReuse = [...layoutUsage.values()].reduce(
    (maximum, count) => Math.max(maximum, count),
    0,
  );
  return {
    candidateCounts: candidateMatrix.map(item => ({
      slide: item.descriptor.index + 1,
      role: item.descriptor.role,
      compatible: item.candidates.length,
      eligible: item.total,
    })),
    uniqueLayoutCount: layoutUsage.size,
    maximumReuse,
    familyDiversity: {
      uniqueCount: new Set(families).size,
      families: [...new Set(families)].sort(),
      perSlide: selectedCandidates.map((candidates, index) => ({
        slide: index + 1,
        uniqueCount: new Set(candidates.map(layoutFamily)).size,
      })),
    },
    compositionDiversity: {
      uniqueCount: new Set(compositions).size,
      perSlide: selectedCandidates.map((candidates, index) => ({
        slide: index + 1,
        uniqueCount: new Set(candidates.map(layoutCompositionIdentity)).size,
      })),
    },
  };
}

function pickRoleLayouts({
  themePack,
  role,
  used,
  body,
  mediaIntent = null,
  content = null,
  contentShape = null,
  count,
  seed = null,
  allocationState = null,
}) {
  const { available, total } = roleLayoutCandidates({
    themePack,
    role,
    used,
    body,
    mediaIntent,
    content,
    contentShape,
    seed,
  });
  if (available.length < count) {
    throw new Error(
      `Insufficient distinct layout candidates for role "${role}" in ${themePack}: `
      + `required ${count}, available ${available.length} (${total} total eligible role matches)`,
    );
  }
  return selectDiverseLayouts(available, count, allocationState, seed);
}

function pickDefaultBodyLayouts({
  themePack,
  roles,
  startIndex,
  used,
  content = null,
  contentShape = null,
  count,
  seed = null,
  allocationState = null,
}) {
  const inventory = [];
  for (let offset = 0; offset < roles.length; offset += 1) {
    const roleIndex = (startIndex + offset) % roles.length;
    const role = roles[roleIndex];
    const { available, total } = roleLayoutCandidates({
      themePack,
      role,
      used,
      body: true,
      content,
      contentShape,
      seed: `${seed}:${role}`,
    });
    inventory.push(`${role}=${available.length}/${total}`);
    if (available.length >= count) {
      return {
        role,
        layouts: selectDiverseLayouts(available, count, allocationState, `${seed}:${role}`),
        nextIndex: (roleIndex + 1) % roles.length,
      };
    }
  }
  throw new Error(
    `No default body role in ${themePack} has ${count} distinct eligible layouts; `
    + `available/total by role: ${inventory.join(', ')}`,
  );
}

function pickClosingLayouts({
  themePack,
  used,
  content = null,
  contentShape = null,
  count,
  seed = null,
  allocationState = null,
}) {
  const roles = ['closing', 'result', 'statement'];
  const layouts = [];
  const seen = new Set();
  const inventory = [];
  for (const role of roles) {
    const { available, total } = roleLayoutCandidates({
      themePack,
      role,
      used,
      body: true,
      content,
      contentShape,
      seed: `${seed}:${role}`,
    });
    inventory.push(`${role}=${available.length}/${total}`);
    for (const layout of available) {
      if (seen.has(layout.layout)) continue;
      seen.add(layout.layout);
      layouts.push(layout);
    }
    if (layouts.length >= count) break;
  }
  if (layouts.length < count) {
    throw new Error(
      `Insufficient structural closing candidates in ${themePack}: `
      + `required ${count}, available ${layouts.length} across closing -> result -> statement `
      + `(${inventory.join(', ')})`,
    );
  }
  return selectDiverseLayouts(layouts, count, allocationState, seed);
}

function roleLayoutCandidates({
  themePack,
  role,
  used,
  body,
  mediaIntent = null,
  content = null,
  contentShape = null,
  seed = null,
}) {
  const mediaQuery = mediaIntent ? mediaIntentQuery(mediaIntent) : {};
  const cacheKey = JSON.stringify({ themePack, role, body, mediaQuery, contentShape, seed });
  let eligible = ROLE_LAYOUT_CANDIDATE_CACHE.get(cacheKey);
  if (!eligible) {
    const seen = new Set();
    layoutQueryCount += 1;
    eligible = listLayouts({
      theme: themePack,
      role,
      contentShape,
      ...mediaQuery,
      limit: 120,
      seed,
    })
      .filter(item => {
        if (!item.layout || seen.has(item.layout)) return false;
        seen.add(item.layout);
        return true;
      })
      .filter(item => (
        body
          ? !isCoverCandidate(item.layout) && !isCoverLikeLayout(item.layout)
          : isCoverCandidate(item.layout)
      ));
    ROLE_LAYOUT_CANDIDATE_CACHE.set(cacheKey, eligible);
  }
  return {
    total: eligible.filter(item => candidateCanProjectContent(
      item,
      content,
      contentShape,
    )).length,
    available: eligible
      .filter(item => !used.has(item.layout))
      .filter(item => candidateCanProjectContent(
        item,
        content,
        contentShape,
      )),
  };
}

function pickLayout({
  themePack,
  role,
  used,
  body,
  mediaIntent = null,
  content = null,
  contentShape = null,
  seed = null,
}) {
  const mediaQuery = mediaIntent ? mediaIntentQuery(mediaIntent) : {};
  layoutQueryCount += 2;
  const roleCandidates = listLayouts({ theme: themePack, role, contentShape, ...mediaQuery, limit: 80, seed });
  const fallbackCandidates = listLayouts({ theme: themePack, contentShape, ...mediaQuery, limit: 200, seed });
  const seen = new Set();
  const deferredSkeleton = !hasAuthoredCanonicalContent(content);
  const compatible = [...roleCandidates, ...fallbackCandidates]
    .filter(item => {
      if (!item.layout || seen.has(item.layout)) return false;
      seen.add(item.layout);
      return true;
    })
    .filter(item => (
      deferredSkeleton
        ? canSuppressUnusedMedia(inspectLayout(item.layout, { compact: true }))
        : candidateCanProjectContent(item, content, contentShape)
    ))
    .filter(item => (
      body
        ? !isCoverCandidate(item.layout) && !isCoverLikeLayout(item.layout)
        : isCoverCandidate(item.layout)
    ));
  const distinct = compatible.filter(item => !used.has(item.layout));
  if (!distinct.length) throw new Error(`No distinct ${body ? 'body' : 'cover'} layout available for role "${role}" in ${themePack}`);
  const candidates = distinct;
  // 从前 5 名合格候选里 seeded 随机挑:打分只有一两个精确命中时,永远取第一会让
  // 不同用户的骨架在这些 role 上完全一致;候选都已通过过滤(均"符合"),前几名之间
  // 的分差只是相关性排序,随机采样是多样性与相关性的折衷。
  const pool = candidates.slice(0, 5);
  return pool[hashSeed(`${seed}:${role}:${used.size}`) % pool.length].layout;
}

function candidateCanProjectContent(candidate, content, contentShape) {
  const inspected = inspectLayout(candidate.layout, { compact: true });
  const projectionPlan = buildTemplateProjectionPlan(
    inspected,
    projectionContentShape(candidate.layout, content, contentShape),
  );
  if (!projectionPlan.requiredFits) {
    return false;
  }
  if (!content?.media?.length && !canSuppressUnusedMedia(inspected)) return false;
  const projection = suggestTemplateProjection(candidate.layout, content, {
    inspected,
    projectionPlan,
    validateOnly: true,
  });
  return projection.complete;
}


function planBespokeFamilies(descriptors, seed) {
  const usage = new Map();
  let previous = null;
  return descriptors.map((descriptor, index) => {
    const candidates = bespokeFamiliesForRole(descriptor);
    const eligible = previous && candidates.length > 1
      ? candidates.filter(family => family !== previous)
      : candidates;
    const selected = [...eligible].sort((left, right) => (
      (usage.get(left) || 0) - (usage.get(right) || 0)
      || (hashSeed(`${seed}:bespoke:${index}:${left}`) % 1000)
        - (hashSeed(`${seed}:bespoke:${index}:${right}`) % 1000)
      || left.localeCompare(right)
    ))[0];
    incrementUsage(usage, selected);
    previous = selected;
    return selected;
  });
}

function bespokeFamiliesForRole(descriptor) {
  if (descriptor.isCover) return ['hero'];
  if (descriptor.isClosing) return ['editorial', 'hero', 'split'];
  const normalized = String(descriptor.role || '').toLowerCase();
  const items = descriptor.content?.presentation?.items || [];
  const chartData = descriptor.content?.presentation?.chartData || [];
  const chartType = bespokeChartType(chartData);
  const canShowMetrics = items.filter(isValueBearingItem).length >= 2;
  const canShowChart = chartData.length >= 2 && chartData.every(item => (
    isValidBespokeChartValue(chartType, item?.value)
  )) && new Set(chartData.map(item => item?.chartUnit || 'number')).size === 1;
  const canShowStructure = items.length >= 2;
  const chartOnly = canShowChart && items.length === 0;
  const chartPrimary = canShowChart && descriptor.hasExplicitChartData && (
    chartOnly || ['metrics', 'distribution', 'relationship', 'trend'].includes(normalized)
  );
  if (chartPrimary) return ['chart-led'];
  const filter = families => families.filter(family => (
    family !== 'chart-led' || canShowChart
  ) && (
    family !== 'metric-spotlight' || canShowMetrics
  ) && (
    !['timeline', 'process', 'matrix', 'comparison'].includes(family) || canShowStructure
  ));
  if (['comparison', 'risks'].includes(normalized)) return filter(['comparison', 'matrix', 'split']);
  if (['metrics', 'distribution', 'relationship'].includes(normalized)) {
    return filter(['chart-led', 'metric-spotlight', 'matrix', 'split']);
  }
  if (['process', 'actions', 'trend'].includes(normalized)) {
    return filter(['timeline', 'process', 'split']);
  }
  if (['breakdown', 'context', 'team'].includes(normalized)) {
    return filter(['split', 'matrix', 'editorial']);
  }
  if (['statement', 'result', 'observation', 'transition'].includes(normalized)) {
    return ['editorial', 'hero', 'split'];
  }
  if (['case', 'image', 'ambient'].includes(normalized)) return ['split', 'editorial', 'hero'];
  return filter(['editorial', 'split', 'matrix', 'process', 'chart-led']);
}

function buildBespokeDraft(descriptor, family, deckGoal, audience) {
  const presentation = descriptor.content?.presentation || {};
  const items = Array.isArray(presentation.items) ? presentation.items : [];
  const elements = [];
  const contentMap = {};
  const titleSource = hasPresentationValue(presentation.title)
    ? 'presentation.title'
    : 'presentation.titleShort';
  const summarySource = hasPresentationValue(presentation.summary)
    ? 'presentation.summary'
    : hasPresentationValue(presentation.summaryShort)
      ? 'presentation.summaryShort'
      : null;
  const takeawaySource = hasPresentationValue(presentation.takeaway)
    ? 'presentation.takeaway'
    : summarySource;
  const kickerSource = hasPresentationValue(descriptor.content?.meta?.panelTitle)
    ? 'meta.panelTitle'
    : null;
  const pageLabelSource = hasPresentationValue(descriptor.content?.meta?.pageLabel)
    ? 'meta.pageLabel'
    : null;

  const addText = (id, source, grid, role = 'body', tone = 'default', align = 'left') => {
    if (!source) return null;
    const index = elements.length;
    elements.push({
      id,
      type: 'text',
      grid,
      role,
      tone,
      align,
      text: '',
    });
    contentMap[`elements[${index}].text`] = source;
    return index;
  };
  const addQuote = (id, source, grid, tone = 'accent') => {
    if (!source) return null;
    const index = elements.length;
    elements.push({
      id,
      type: 'quote',
      grid,
      tone,
      quote: '',
    });
    contentMap[`elements[${index}].quote`] = source;
    return index;
  };
  const addList = (
    id,
    sourceIndexes,
    source,
    grid,
    ordered = false,
    offset = 0,
    tone = 'default',
  ) => {
    const selected = sourceIndexes.filter(index => items[index]);
    if (!selected.length) return null;
    const index = elements.length;
    elements.push({
      id,
      type: 'list',
      grid,
      ordered,
      tone,
      items: [],
    });
    const fields = { title: 'labelWithValue', body: 'detail' };
    contentMap[`elements[${index}].items`] = {
      source,
      fields,
      ...(offset ? { offset } : {}),
      limit: selected.length,
    };
    return index;
  };
  const addMetric = (id, itemIndex, grid, tone = 'accent') => {
    const item = items[itemIndex];
    if (!item || !isValueBearingItem(item)) return null;
    const index = elements.length;
    elements.push({
      id,
      type: 'metric',
      grid,
      tone,
      label: '',
      value: '',
    });
    contentMap[`elements[${index}].label`] = `presentation.items[${itemIndex}].label`;
    // displayValue is already formatted from canonical value + unit. Mapping the
    // unit again would make BespokeSlide format it twice (for example 37%%).
    if (hasPresentationValue(item.displayValue)) {
      contentMap[`elements[${index}].value`] = `presentation.items[${itemIndex}].displayValue`;
    } else {
      contentMap[`elements[${index}].value`] = `presentation.items[${itemIndex}].value`;
      if (hasPresentationValue(item.unit)) {
        contentMap[`elements[${index}].unit`] = `presentation.items[${itemIndex}].unit`;
      }
    }
    if (hasPresentationValue(item.detail)) {
      contentMap[`elements[${index}].detail`] = `presentation.items[${itemIndex}].detail`;
    }
    return index;
  };
  const addFactQuote = (id, itemIndex, grid, tone = 'default') => {
    const item = items[itemIndex];
    if (!item) return null;
    const index = elements.length;
    elements.push({
      id,
      type: 'quote',
      grid,
      tone,
      quote: '',
    });
    contentMap[`elements[${index}].quote`] = `presentation.items[${itemIndex}].labelWithValue`;
    if (hasPresentationValue(item.detail)) {
      contentMap[`elements[${index}].attribution`] = `presentation.items[${itemIndex}].detail`;
    }
    return index;
  };
  const addChart = grid => {
    const chartData = presentation.chartData || [];
    const chartType = bespokeChartType(chartData);
    if (
      chartData.length < 2
      || chartData.length > 12
      || chartData.some(item => !isValidBespokeChartValue(chartType, item?.value))
      || new Set(chartData.map(item => item?.chartUnit || 'number')).size !== 1
    ) return null;
    const index = elements.length;
    elements.push({
      id: 'main-chart',
      type: 'chart',
      grid,
      tone: 'accent',
      chartType,
      data: [],
      showValues: true,
    });
    contentMap[`elements[${index}].data`] = {
      source: 'presentation.chartData',
      fields: {
        label: 'label',
        value: 'value',
        displayValue: 'displayValue',
        ...(chartData.every(item => hasPresentationValue(item?.unit)) ? { unit: 'unit' } : {}),
      },
    };
    return index;
  };

  addText('page-kicker', kickerSource, { column: 1, row: 1, width: 5, height: 1 }, 'kicker', 'accent');
  addText('page-label', pageLabelSource, { column: 11, row: 1, width: 2, height: 1 }, 'label', 'muted', 'right');
  addText('page-title', titleSource, { column: 1, row: 2, width: 10, height: 2 }, 'title');
  if (family === 'hero') {
    const titleElement = elements.find(element => element.id === 'page-title');
    if (titleElement) titleElement.grid = { column: 1, row: 2, width: 10, height: 3 };
    addText('hero-summary', summarySource, { column: 1, row: 6, width: 7, height: 2 }, 'subtitle');
    addText('hero-takeaway', takeawaySource, { column: 9, row: 6, width: 4, height: 2 }, 'body', 'accent');
  } else if (family === 'split') {
    addText('split-summary', summarySource, { column: 1, row: 4, width: 5, height: 2 }, 'subtitle');
    addText('split-takeaway', takeawaySource, { column: 1, row: 7, width: 5, height: 2 }, 'body', 'accent');
    addList(
      'split-items',
      items.map((_, index) => index),
      'presentation.items',
      { column: 6, row: 4, width: 7, height: 5 },
    );
  } else if (family === 'metric-spotlight') {
    const visibleIndexes = items
      .map((item, index) => ({ item, index }))
      .filter(entry => isValueBearingItem(entry.item))
      .slice(0, 4)
      .map(entry => entry.index);
    const width = Math.max(3, Math.floor(12 / Math.max(1, visibleIndexes.length)));
    visibleIndexes.forEach((itemIndex, index) => {
      addMetric(
        `metric-${index + 1}`,
        itemIndex,
        { column: index * width + 1, row: 4, width, height: 5 },
        index === 0 ? 'accent' : 'default',
      );
    });
  } else if (family === 'chart-led') {
    addChart({ column: 1, row: 4, width: 8, height: 5 });
    addText('chart-summary', summarySource, { column: 9, row: 4, width: 4, height: 2 }, 'subtitle');
    addText('chart-takeaway', takeawaySource, { column: 9, row: 7, width: 4, height: 2 }, 'body', 'accent');
  } else if (family === 'timeline') {
    addList(
      'timeline-items',
      items.slice(0, 6).map((_, index) => index),
      'presentation.items',
      { column: 1, row: 4, width: 12, height: 5 },
      true,
      0,
      'accent',
    );
  } else if (family === 'process') {
    addList(
      'process-items',
      items.slice(0, 6).map((_, index) => index),
      'presentation.items',
      { column: 1, row: 4, width: 12, height: 5 },
      true,
      0,
      'accent',
    );
  } else if (family === 'matrix') {
    items.slice(0, 4).forEach((_, index) => {
      addFactQuote(
        `matrix-cell-${index + 1}`,
        index,
        {
          column: index % 2 === 0 ? 1 : 7,
          row: index < 2 ? 4 : 7,
          width: 6,
          height: 2,
        },
        index === 0 ? 'accent' : 'default',
      );
    });
  } else if (family === 'comparison') {
    const splitAt = Math.ceil(items.length / 2);
    addList(
      'comparison-left',
      items.slice(0, splitAt).map((_, index) => index),
      'presentation.items',
      { column: 1, row: 4, width: 6, height: 5 },
      false,
      0,
      'accent',
    );
    addList(
      'comparison-right',
      items.slice(splitAt).map((_, index) => index + splitAt),
      'presentation.items',
      { column: 7, row: 4, width: 6, height: 5 },
      false,
      splitAt,
      'positive',
    );
  } else {
    addQuote('editorial-takeaway', takeawaySource, { column: 1, row: 4, width: 7, height: 5 });
    if (items.length) {
      addList(
        'editorial-items',
        items.map((_, index) => index),
        'presentation.items',
        { column: 9, row: 4, width: 4, height: 5 },
      );
    } else {
      addText('editorial-summary', summarySource, { column: 9, row: 4, width: 4, height: 4 }, 'subtitle');
    }
  }

  return {
    composition: {
      designIntent: {
        objective: String(deckGoal || presentation.takeaway || presentation.title || '完成本页表达'),
        audience: String(descriptor.brief?.audience || audience || '目标受众'),
        narrativeRole: String(descriptor.role || 'content'),
        emphasis: String(presentation.takeaway || presentation.title || presentation.titleShort || '本页核心信息'),
        rationale: bespokeFamilyRationale(family),
        compositionFamily: family,
      },
      background: family === 'hero' ? 'dark' : 'default',
      elements,
    },
    contentMap,
  };
}

function bespokeFamilyRationale(family) {
  const rationales = {
    hero: '以单一主标题和非对称留白建立主张',
    split: '以非对称双栏分离结论与支撑信息',
    'metric-spotlight': '以关键数字建立视觉锚点并保留解释',
    'chart-led': '以数据图形作为主视觉并侧置结论',
    timeline: '以垂直时间轴表达先后关系和推进节奏',
    matrix: '以二维分区并列展示同层级信息',
    editorial: '以大标题、引语和窄栏列表建立杂志式层级',
    comparison: '以左右对照保持两组信息的可比性',
    process: '以横向路径串联步骤和行动顺序',
  };
  return rationales[family] || '按本页信息层级组织主视觉与支撑内容';
}

function incrementUsage(map, key) {
  if (!map || !key) return;
  map.set(key, (map.get(key) || 0) + 1);
}

function parseBriefs(value) {
  if (!value || value === true) return [];
  const source = String(value).trim();
  const parsed = JSON.parse(source.startsWith('[')
    ? source
    : readFileSync(path.resolve(CALLER_CWD, source), 'utf8'));
  return Array.isArray(parsed) ? parsed : parsed.slides || [];
}

function canonicalSlideContent(brief, slideIndex = 0) {
  const authored = brief?.content && typeof brief.content === 'object'
    ? brief.content
    : {};
  const presentation = authored.presentation && typeof authored.presentation === 'object'
    ? authored.presentation
    : {};
  const meta = {
    brand: '',
    pageLabel: '',
    unit: '',
    panelTitle: '',
    date: '',
    empty: '',
    ...(authored.meta || {}),
  };
  const coverLabels = Array.isArray(presentation.coverLabels)
    ? presentation.coverLabels
    : [meta.panelTitle, meta.unit, meta.date].filter(hasPresentationValue);
  const titleShort = presentation.titleShort || presentation.title || meta.panelTitle || '';
  const summaryShort = presentation.summaryShort || meta.panelTitle || meta.unit || presentation.takeaway || presentation.summary || '';
  const authoredItems = Array.isArray(presentation.items)
    ? presentation.items.map((item, index) => canonicalPresentationItem({
        ...(item && typeof item === 'object' ? item : {}),
        id: item?.id || `item-${index + 1}`,
      }))
    : [];
  if (presentation.chartData != null && !Array.isArray(presentation.chartData)) {
    throw new Error(
      `slide ${slideIndex + 1} field content.presentation.chartData: expected an array`,
    );
  }
  if (presentation.chartData?.length > 12) {
    throw new Error(
      `slide ${slideIndex + 1} field content.presentation.chartData: expected at most 12 items`,
    );
  }
  const explicitChartData = Array.isArray(presentation.chartData)
    ? presentation.chartData.map((item, index) => (
        canonicalChartDatum(item, index, slideIndex)
      ))
    : [];
  const explicitIds = explicitChartData
    .map(item => String(item.id || '').trim())
    .filter(Boolean);
  if (new Set(explicitIds).size !== explicitIds.length) {
    throw new Error(
      `slide ${slideIndex + 1} field content.presentation.chartData: duplicate id`,
    );
  }
  const chartData = explicitChartData.length
    ? explicitChartData
    : inferChartData(authoredItems);
  const {
    templateItems: _templateItems,
    supportingSummary: _supportingSummary,
    comparisonLeft: _comparisonLeft,
    comparisonRight: _comparisonRight,
    ...canonicalPresentation
  } = presentation;
  return {
    presentation: {
      title: '',
      titleShort,
      summary: '',
      summaryShort,
      takeaway: '',
      items: [],
      ...canonicalPresentation,
      coverLabels,
      items: authoredItems,
      chartData,
    },
    media: Array.isArray(authored.media) ? authored.media : [],
    meta,
  };
}

function canonicalPresentationItem(item) {
  const authored = item && typeof item === 'object' ? item : {};
  const hasRawValue = hasPresentationValue(authored.value);
  const authoredDisplayValue = hasPresentationValue(authored.displayValue)
    ? String(authored.displayValue)
    : hasPresentationValue(authored.valueText)
      ? String(authored.valueText)
      : '';
  const displayValue = formatValueWithUnit(
    hasRawValue ? authored.value : '',
    authored.unit,
    authoredDisplayValue,
  );
  const chartValue = normalizedChartValue({ ...authored, displayValue });
  const chartUnit = chartValue == null
    ? null
    : chartUnitIdentity({ ...authored, displayValue });
  const label = hasPresentationValue(authored.label) ? String(authored.label) : '';
  const detail = hasPresentationValue(authored.detail) ? String(authored.detail) : '';
  const labelWithValue = [displayValue, label].filter(hasPresentationValue).join(' · ');
  return {
    ...authored,
    label,
    detail,
    unit: hasPresentationValue(authored.unit) ? String(authored.unit) : '',
    emptyText: '',
    focus: Boolean(authored.focus),
    displayValue,
    valueText: displayValue,
    labelWithValue,
    labelWithSupporting: [label, detail].filter(hasPresentationValue).join('：'),
    labelWithValueAndSupporting: [labelWithValue || label, detail]
      .filter(hasPresentationValue)
      .join('｜'),
    ...(chartValue == null ? {} : { chartValue }),
    ...(chartUnit == null ? {} : { chartUnit }),
  };
}

function canonicalChartDatum(item, index, slideIndex) {
  const authored = item && typeof item === 'object' ? item : {};
  const label = String(authored.label ?? authored.name ?? '').trim();
  if (!label) {
    throw new Error(
      `slide ${slideIndex + 1} field content.presentation.chartData[${index}].label: expected a non-empty string`,
    );
  }
  const authoredDisplayValue = hasPresentationValue(authored.displayValue)
    ? String(authored.displayValue)
    : hasPresentationValue(authored.valueText)
      ? String(authored.valueText)
      : '';
  const displayValue = formatValueWithUnit(
    authored.value,
    authored.unit,
    authoredDisplayValue,
  );
  const value = normalizedChartValue({ ...authored, displayValue });
  if (!Number.isFinite(value)) {
    throw new Error(
      `slide ${slideIndex + 1} field content.presentation.chartData[${index}].value: expected a finite or formatted numeric value`,
    );
  }
  const chartUnit = chartUnitIdentity({ ...authored, displayValue });
  return {
    ...authored,
    id: authored.id || `chart-${index + 1}`,
    label,
    value,
    displayValue: displayValue || String(value),
    unit: hasPresentationValue(authored.unit) ? String(authored.unit) : '',
    chartUnit,
  };
}


function inferChartData(items) {
  const candidates = items
    .filter(item => Number.isFinite(item?.chartValue))
    .map(item => ({
      id: item.id,
      label: item.label,
      value: item.chartValue,
      displayValue: item.displayValue || String(item.chartValue),
      authoredUnit: item.unit || '',
      unit: item.chartUnit || 'number',
    }));
  if (
    candidates.length < 2
    || candidates.length > 12
    || new Set(candidates.map(item => item.unit)).size !== 1
  ) {
    return [];
  }
  return candidates.map(({ id, label, value, displayValue, authoredUnit, unit }, index) => ({
    id: id || `chart-${index + 1}`,
    label,
    value,
    displayValue,
    unit: authoredUnit,
    chartUnit: unit,
  }));
}

function suggestTemplateProjection(layout, content, options = {}) {
  const inspected = options.inspected || inspectLayoutForProjection(layout);
  const projectionPlan = options.projectionPlan || buildTemplateProjectionPlan(
    inspected,
    projectionContentShape(
      layout,
      content,
      contentShapeFromPresentation(content?.presentation),
    ),
  );
  const presentation = content?.presentation || {};
  const deferred = !hasAuthoredCanonicalContent(content);
  const contentMap = {};
  const props = {};
  const issues = [];
  const usedTextTargets = new Set();
  const fieldsByKey = textFieldsByKey(inspected);

  if (!projectionPlan.requiredFits) {
    issues.push('layout projection plan does not satisfy the required content shape');
  }

  const mapNamedText = (target, source, index = 0) => {
    if (!target || contentMap[target]) return;
    const field = fieldsByKey.get(target);
    const mapping = fitTextSource(source, field, content, index, { deferred });
    if (!mapping) {
      issues.push(`${target}: no canonical text fits this slot`);
      return;
    }
    contentMap[target] = mapping;
    usedTextTargets.add(target);
  };

  mapNamedText(projectionPlan.titleTarget, 'presentation.title', 0);
  mapNamedText(projectionPlan.summaryTarget, 'presentation.summary', 0);
  mapNamedText(projectionPlan.takeawayTarget, 'presentation.takeaway', 0);

  let externalSupportingRequired = false;
  const primary = projectionPlan.primaryContentContainer;
  if (primary?.kind === 'array') {
    const targetCount = primaryArrayTargetCount(primary, presentation, deferred);
    const canonicalItemCount = deriveTemplateItems(presentation).length;
    const source = canonicalSourceForArray(primary.field, presentation, {
      targetCount,
      deferred,
      includeTextFallback: true,
      // Keep truthful condensation scoped to authored facts. Narrative
      // fallbacks may fill a real shortage, but must not become extra items
      // when the canonical item set already covers the target slots.
      supplementTextFallback: targetCount > canonicalItemCount,
    });
    if (!source) {
      issues.push(`${primary.key}: canonical items cannot fill the primary array`);
    } else {
      contentMap[primary.key] = source.mapping;
      externalSupportingRequired = source.externalSupportingRequired;
      if (primary.field?.countKey) {
        const minimum = Math.max(0, Number(primary.minimumCapacity || 0));
        if (!deferred && source.count < minimum) {
          issues.push(`${primary.key}: projected count ${source.count} is below minimum ${minimum}`);
        } else {
          setProjectionProp(props, primary.field.countKey, deferred
            ? Math.max(minimum, Math.min(source.count, primary.capacity || source.count))
            : source.count);
        }
      }
    }
  } else if (primary?.kind === 'scalar-group') {
    const scalarProjection = mapScalarContentContainer(
      primary,
      presentation,
      contentMap,
      { deferred },
    );
    if (!scalarProjection.complete) {
      issues.push(`${primary.key}: canonical items cannot fill every fixed scalar slot`);
    }
    externalSupportingRequired = scalarProjection.externalSupportingRequired;
    scalarProjection.targets.forEach(target => usedTextTargets.add(target));
  }

  const auxiliary = mapAuxiliaryContent(
    projectionPlan,
    presentation,
    contentMap,
    props,
    { deferred },
  );
  issues.push(...auxiliary.issues);

  if (externalSupportingRequired) {
    const supporting = supportingTextProjection(
      inspected,
      presentation,
      new Set([...Object.keys(contentMap), ...usedTextTargets]),
      { deferred },
    );
    if (!supporting) {
      issues.push('condensed supporting facts have no canonical text slot');
    } else {
      contentMap[supporting.target] = supporting.mapping;
      usedTextTargets.add(supporting.target);
    }
  }

  const textFields = inspected?.fillPlan?.text || [];
  const textSources = canonicalTextSources(textFields);
  let textIndex = 3;
  let coverLabelIndex = 0;
  const coverLabels = Array.isArray(presentation.coverLabels)
    ? presentation.coverLabels
    : [];
  const canUseCoverLabels = isCoverCandidate(inspected.layout);
  for (const field of textFields) {
    if (contentMap[field.key] || hasProjectionProp(props, field.key)) continue;
    if (field.type && field.type !== 'string') {
      const numericMapping = numericBusinessFieldProjection(
        field,
        presentation,
        textIndex,
        { deferred },
      );
      if (numericMapping !== undefined) {
        if (!numericMapping) {
          issues.push(`${field.key}: no canonical numeric fact fits this visible metric slot`);
        } else {
          contentMap[field.key] = numericMapping;
          textIndex += 1;
        }
        continue;
      }
      const safeValue = safeProjectionControlValue(field);
      if (safeValue === undefined) {
        issues.push(`${field.key}: unsupported non-string business slot type ${field.type}`);
      } else {
        setProjectionProp(props, field.key, safeValue);
      }
      continue;
    }
    const leafKey = String(field.key || '').toLowerCase().split('.').at(-1) || '';
    const isNarrativeField = field.role === 'body'
      || field.role === 'paragraph'
      || /title|headline|heading|slogan|statement|claim|summary|subtitle|lead|body|detail|description/.test(leafKey);
    if (canUseCoverLabels && coverLabels.length && !isNarrativeField) {
      const matchingOffset = Array.from({ length: coverLabels.length }, (_, offset) => offset)
        .find(offset => {
          const value = coverLabels[(coverLabelIndex + offset) % coverLabels.length];
          return !Number(field.maxChars) || charLength(value) <= Number(field.maxChars);
        });
      if (matchingOffset !== undefined) {
        const sourceIndex = (coverLabelIndex + matchingOffset) % coverLabels.length;
        contentMap[field.key] = `presentation.coverLabels[${sourceIndex}]`;
        coverLabelIndex = sourceIndex + 1;
        textIndex += 1;
        continue;
      }
    }
    const source = textSources.get(field.key) || fallbackTextSource(field);
    const mapping = fitTextSource(source, field, content, textIndex, { deferred });
    if (!mapping) {
      issues.push(`${field.key}: no canonical text fits this slot`);
      continue;
    }
    contentMap[field.key] = mapping;
    textIndex += 1;
  }

  if (!content?.media?.length && !canSuppressUnusedMedia(inspected)) {
    issues.push('unused media slots cannot be safely hidden');
  } else {
    suppressUnusedMedia(inspected, content, props);
  }
  mirrorProjectionCountAliases(inspected, props);

  if (!deferred) {
    issues.push(...projectionCompletenessIssues(
      inspected,
      content,
      contentMap,
      props,
      projectionPlan,
    ));
  } else {
    issues.push(...projectionCoverageIssues(inspected, contentMap, props));
  }

  const uniqueIssues = [...new Set(issues.filter(Boolean))];
  const result = {
    contentMap,
    props,
    complete: uniqueIssues.length === 0,
    issues: uniqueIssues,
  };
  if (!result.complete && !options.validateOnly) {
    throw new Error(
      `Layout ${layout} cannot project canonical content:\n- ${uniqueIssues.slice(0, 12).join('\n- ')}`,
    );
  }
  return result;
}

function projectionContentShape(layout, content, contentShape) {
  if (hasAuthoredCanonicalContent(content) || isCoverCandidate(layout)) return contentShape;
  return {
    ...(contentShape || {}),
    deferred: true,
    required: {
      ...(contentShape?.required || {}),
      itemCount: Math.max(1, Number(contentShape?.required?.itemCount) || 0),
      minItemCount: Math.max(1, Number(contentShape?.required?.minItemCount) || 0),
    },
  };
}

function inspectLayoutForProjection(layout) {
  if (!FILL_PLAN_INSPECT_CACHE.has(layout)) {
    FILL_PLAN_INSPECT_CACHE.set(layout, inspectLayout(layout, { compact: true }));
  }
  return FILL_PLAN_INSPECT_CACHE.get(layout);
}

function textFieldsByKey(inspected) {
  return new Map((inspected?.fillPlan?.text || []).map(field => [field.key, field]));
}

function fitTextSource(source, field, content, index = 0, { deferred = false } = {}) {
  const maxChars = Number(field?.maxChars || 0);
  const candidates = canonicalTextPathCandidates(source, field);
  if (index === 0) {
    for (const pathName of candidates) {
      const value = canonicalTextValue(content, pathName);
      if (!hasPresentationValue(value)) continue;
      if (maxChars && charLength(value) > maxChars) continue;
      return pathName;
    }
  }
  const mapping = {
    source: 'presentation',
    derive: 'projection-text',
    preferred: candidates
      .filter(pathName => pathName.startsWith('presentation.'))
      .map(pathName => pathName.slice('presentation.'.length)),
    ...(maxChars ? { maxChars } : {}),
    index,
    truncate: true,
  };
  const projected = deriveProjectionText(content?.presentation || {}, mapping);
  if (deferred || (
    hasPresentationValue(projected)
    && (!maxChars || charLength(projected) <= maxChars)
  )) {
    return mapping;
  }
  return null;
}

function canonicalTextPathCandidates(source, field) {
  const titleFamily = source === 'presentation.title' || source === 'presentation.titleShort';
  const summaryFamily = source === 'presentation.summary' || source === 'presentation.summaryShort';
  const takeawayFamily = source === 'presentation.takeaway';
  const semantic = fallbackTextSource(field);
  const candidates = titleFamily
    ? ['presentation.title', 'presentation.titleShort', 'presentation.takeaway', 'presentation.summaryShort']
    : summaryFamily
      ? ['presentation.summary', 'presentation.summaryShort', 'presentation.takeaway', 'presentation.titleShort']
      : takeawayFamily
        ? ['presentation.takeaway', 'presentation.summaryShort', 'presentation.summary', 'presentation.titleShort']
        : [source, semantic, 'presentation.summaryShort', 'presentation.takeaway', 'presentation.titleShort'];
  return [...new Set(candidates.filter(Boolean))];
}

function canonicalTextValue(content, pathName) {
  const tokens = [...String(pathName || '').matchAll(/([A-Za-z_$][A-Za-z0-9_$-]*)|\[(\d+)\]/g)]
    .map(match => match[1] ?? Number(match[2]));
  return tokens.reduce((value, token) => value?.[token], content);
}

function fallbackTextSource(field) {
  const key = String(field?.key || '').toLowerCase();
  if (/page|sheet|index|number|^no$/.test(key)) return 'meta.pageLabel';
  if (/date|year|period/.test(key)) return 'meta.date';
  if (/brand|company|owner|author|team|org/.test(key)) return 'meta.brand';
  if (/unit/.test(key)) return 'meta.unit';
  if (/takeaway|conclusion|insight|closing|verdict/.test(key)) return 'presentation.takeaway';
  if (/summary|subtitle|subheadline|lead|intro|description|caption|body|detail|note/.test(key)) {
    return 'presentation.summary';
  }
  if (/title|headline|heading|slogan|statement|claim|kicker|eyebrow|label/.test(key)) {
    return 'presentation.titleShort';
  }
  if (field?.role === 'body' || field?.role === 'paragraph') return 'presentation.summaryShort';
  return 'presentation.takeaway';
}

function canonicalTextSources(fields) {
  const sources = new Map();
  assignUniqueTextSource(sources, fields, ['title', 'pagetitle', 'headline', 'heading', 'subject', 'topic'], 'presentation.title');
  assignUniqueTextSource(sources, fields, ['summary', 'subtitle', 'lead', 'intro', 'description'], 'presentation.summary');
  assignUniqueTextSource(sources, fields, ['takeaway', 'conclusion', 'insight', 'tagline', 'closing'], 'presentation.takeaway');
  assignUniqueTextSource(sources, fields, ['brand'], 'meta.brand');
  assignUniqueTextSource(sources, fields, ['pagelabel', 'pageno', 'pagenumber', 'sheetlabel', 'sheetno', 'sheetnumber'], 'meta.pageLabel');
  assignUniqueTextSource(sources, fields, ['unit'], 'meta.unit');
  assignUniqueTextSource(sources, fields, ['panelhead', 'paneltitle'], 'meta.panelTitle');
  assignUniqueTextSource(sources, fields, ['date', 'year'], 'meta.date');
  return sources;
}

function assignUniqueTextSource(sources, fields, names, source) {
  const candidates = fields.filter(field => names.includes(targetFieldName(field.key)));
  if (!candidates.length) return;
  const exact = candidates.filter(field => names.includes(normalizeTargetKey(field.key)));
  const selected = exact.length === 1
    ? exact[0]
    : candidates.length === 1
      ? candidates[0]
      : null;
  if (selected) sources.set(selected.key, source);
}

function targetFieldName(key) {
  return normalizeTargetKey(String(key || '').split('.').at(-1)?.replace(/\[\]/g, ''));
}

function normalizeTargetKey(key) {
  return String(key || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function primaryArrayTargetCount(primary, presentation, deferred) {
  const field = primary.field || {};
  const capacity = arrayFieldCapacity(field) || primary.capacity || 0;
  const canonicalAvailable = deriveTemplateItems(presentation).length;
  const minimum = Math.max(0, Number(primary.minimumCapacity || 0));
  const canSupplementWithCanonicalText = !primary.fields?.some(source => (
    source === 'value' || source === 'displayValue' || source === 'unit'
  ));
  const available = canSupplementWithCanonicalText && minimum > canonicalAvailable
    ? deriveTemplateItems(presentation, {
        includeTextFallback: true,
        supplementTextFallback: true,
      }).length
    : canonicalAvailable;
  if (field.countKey) {
    if (deferred) return Math.max(1, minimum);
    return Math.min(capacity || available, Math.max(canonicalAvailable, minimum));
  }
  const visible = Math.max(0, Number(field.visibleCount || field.fixedLength || 0));
  if (visible) return visible;
  return deferred ? Math.max(1, capacity) : Math.min(capacity || available, available);
}

function canonicalSourceForArray(field, presentation = {}, {
  targetCount = null,
  deferred = false,
  includeTextFallback = false,
  supplementTextFallback = false,
  textFallbackOnly = false,
} = {}) {
  if (String(field?.key || '').includes('[]')) return null;
  if (arrayFieldNestedDepth(field) > 0) return null;
  const shape = field.itemShape && typeof field.itemShape === 'object'
    && !Array.isArray(field.itemShape)
    ? field.itemShape
    : null;
  const targetEntries = shape ? presentationTargetEntries(field) : [];
  const hasNumericValueTarget = targetEntries.some(entry => (
    entry.decision.semantic === 'numericValue'
  ));
  const filter = hasNumericValueTarget ? 'value-bearing' : null;
  const canonicalItems = deriveTemplateItems(presentation);
  const allItems = includeTextFallback
    ? deriveTemplateItems(presentation, {
        includeTextFallback,
        supplementTextFallback,
        textFallbackOnly,
      })
    : canonicalItems;
  const sourceItems = filter === 'value-bearing'
    ? allItems.filter(item => Number.isFinite(item?.chartValue))
    : allItems;
  const canonicalSourceItems = filter === 'value-bearing'
    ? canonicalItems.filter(item => Number.isFinite(item?.chartValue))
    : canonicalItems;
  const capacity = arrayFieldCapacity(field) || sourceItems.length;
  const count = Math.max(0, Math.floor(Number(targetCount ?? Math.min(capacity, sourceItems.length)) || 0));
  if (!deferred && (!count || sourceItems.length < count)) return null;
  const shouldCondense = canonicalSourceItems.length > count && count > 0;
  const projectedItems = shouldCondense
    ? condenseContentItems(sourceItems, count)
    : sourceItems.slice(0, count || sourceItems.length);
  const baseMapping = {
    source: 'presentation',
    derive: 'template-items',
    ...(includeTextFallback ? { includeTextFallback: true } : {}),
    ...(supplementTextFallback ? { supplementTextFallback: true } : {}),
    ...(textFallbackOnly ? { textFallbackOnly: true } : {}),
    ...(filter ? { filter } : {}),
    ...(shouldCondense ? { group: count } : {}),
    limit: count,
  };

  if (field.itemShape === 'string') {
    const source = chooseProjectionItemSource(
      projectedItems,
      ['labelWithValueAndSupporting', 'labelWithSupporting', 'labelWithValue', 'label', 'displayValue'],
      Number(field.item?.maxChars || 0),
      deferred,
    );
    if (!source) return null;
    return {
      mapping: { ...baseMapping, select: source },
      count,
      items: projectedItems,
      externalSupportingRequired: projectedItems.some(item => item?.hasCondensedSupporting === true)
        && !/Supporting/.test(source),
    };
  }

  if (!shape || !Object.keys(shape).length || !targetEntries.length) return null;
  const hasDisplayValueTarget = targetEntries.some(entry => (
    entry.decision.semantic === 'displayValue'
  ));
  const fields = {};
  const usedStringSources = new Set();
  for (const { key, type, contract, decision } of targetEntries) {
    const semantic = decision.semantic;
    const stageSource = presentationFieldForTarget(key, type, field);
    if (!semantic || !stageSource) return null;
    if (semantic === 'focus') {
      fields[key] = stageSource;
      continue;
    }
    if (semantic === 'numericValue') {
      if (!deferred && projectedItems.some(item => !numericProjectionFits(item, contract))) return null;
      fields[key] = stageSource;
      continue;
    }
    if (type !== 'string' && !(type === 'number' && semantic === 'ordinal')) return null;
    const sources = projectionSourcesForSemantic(semantic, type);
    const labelSources = projectedItems.some(item => item?.hasCondensedSupporting === true)
      ? (
          hasDisplayValueTarget
            ? ['labelWithSupporting', 'labelWithValueAndSupporting', 'label', 'projectionLabel']
            : ['labelWithValueAndSupporting', 'labelWithSupporting', 'labelWithValue', 'label']
        )
      : sources;
    const source = chooseProjectionItemSource(
      projectedItems,
      semantic === 'label' ? labelSources : sources,
      Number(contract.maxChars || 0),
      deferred,
      usedStringSources,
    );
    if (!source) return null;
    fields[key] = source;
    usedStringSources.add(source);
  }
  const preservesSupporting = Object.values(fields).some(source => (
    source === 'detail' || /Supporting/.test(source)
  ));
  return {
    mapping: { ...baseMapping, fields },
    count,
    items: projectedItems,
    externalSupportingRequired: projectedItems.some(item => item?.hasCondensedSupporting === true)
      && !preservesSupporting,
  };
}

function chooseProjectionItemSource(
  items,
  candidates,
  maxChars = 0,
  deferred = false,
  excluded = new Set(),
) {
  const ordered = [
    ...candidates.filter(source => !excluded.has(source)),
    ...candidates.filter(source => excluded.has(source)),
  ];
  for (const source of ordered) {
    if (deferred && !items.length) return source;
    if (!items.length) continue;
    if (items.every(item => (
      hasPresentationValue(item?.[source])
      && (!maxChars || charLength(item[source]) <= maxChars)
    ))) return source;
  }
  return null;
}

function projectionSourcesForSemantic(semantic, type = 'string') {
  const sources = {
    label: ['label', 'projectionLabel', 'labelWithValue', 'projectionTag', 'id', 'projectionOrdinal'],
    indexedLabel: ['projectionLabel', 'labelWithValue', 'projectionTag', 'label', 'id', 'projectionOrdinal'],
    secondaryLabel: ['projectionSecondaryLabel'],
    duration: ['projectionDuration'],
    pageLabel: ['projectionPageLabel'],
    initial: ['projectionInitial'],
    detail: ['labelWithSupporting', 'projectionDetail', 'detail', 'labelWithValueAndSupporting', 'projectionLabel', 'label'],
    displayValue: ['displayValue', 'projectionValue'],
    ordinal: type === 'number' ? ['projectionOrdinalNumber'] : ['projectionOrdinal'],
    unit: ['unit', 'projectionUnit'],
    id: ['id', 'projectionOrdinal', 'projectionLabel', 'label'],
  };
  return sources[semantic] || sources.label;
}

function numericProjectionFits(item, contract = {}) {
  const value = Number(item?.chartValue);
  if (!Number.isFinite(value)) return false;
  const bounds = contract.numericBounds || {};
  const min = Number(bounds.min ?? contract.min);
  const max = Number(bounds.max ?? contract.max);
  if (Number.isFinite(min) && bounds.enforced !== false && value < min) return false;
  if (Number.isFinite(max) && bounds.enforced !== false && value > max) return false;
  return true;
}

function numericBusinessFieldProjection(
  field,
  presentation = {},
  index = 0,
  { deferred = false } = {},
) {
  if (field?.type !== 'number' || String(field?.role || '').toLowerCase() !== 'metric') {
    return undefined;
  }
  if (deferred) {
    return {
      source: 'presentation',
      derive: 'template-items',
      filter: 'value-bearing',
      at: Math.max(0, Math.floor(Number(index) || 0)),
      select: 'chartValue',
      fallback: safeProjectionControlValue(field),
    };
  }

  const sourceItems = deriveTemplateItems(presentation)
    .filter(item => Number.isFinite(Number(item?.chartValue)));
  const compatibleItems = sourceItems.filter(item => numericProjectionFits(item, field));
  if (!compatibleItems.length) return null;

  // Use the same priority-aware condensation contract as array projections so
  // required/high-priority/chart facts outrank ordinary numeric facts.
  const selected = condenseContentItems(compatibleItems, 1)[0];
  const selectedIndex = sourceItems.findIndex(item => sameProjectionFact(item, selected));
  return {
    source: 'presentation',
    derive: 'template-items',
    filter: 'value-bearing',
    at: selectedIndex >= 0 ? selectedIndex : 0,
    select: 'chartValue',
  };
}

function sameProjectionFact(left, right) {
  if (left === right) return true;
  const leftId = String(left?.id || '').trim();
  const rightId = String(right?.id || '').trim();
  if (leftId && rightId) return leftId === rightId;
  return String(left?.label || '') === String(right?.label || '')
    && Number(left?.chartValue) === Number(right?.chartValue)
    && String(left?.displayValue || '') === String(right?.displayValue || '');
}

function mapScalarContentContainer(container, presentation, contentMap, { deferred = false } = {}) {
  const slots = container.slots || [];
  const requiresValue = slots.some(slot => slot.fields?.value || slot.fields?.displayValue);
  const filter = requiresValue ? 'value-bearing' : null;
  const allItems = deriveTemplateItems(presentation, {
    includeTextFallback: !requiresValue,
    supplementTextFallback: !requiresValue,
  });
  const sourceItems = filter
    ? allItems.filter(item => Number.isFinite(item?.chartValue))
    : allItems;
  if (!deferred && sourceItems.length < slots.length) {
    return { complete: false, targets: [], externalSupportingRequired: false };
  }
  const projectedItems = sourceItems.length > slots.length
    ? condenseContentItems(sourceItems, slots.length)
    : sourceItems.slice(0, slots.length);
  const baseMapping = {
    source: 'presentation',
    derive: 'template-items',
    ...(filter ? { filter } : {}),
    ...(sourceItems.length > slots.length ? { group: slots.length } : {}),
  };
  const targets = [];
  let complete = true;
  let externalSupportingRequired = false;
  slots.forEach((slot, index) => {
    const item = projectedItems[index];
    const projection = scalarItemProjection(item, slot, { deferred });
    if (!projection) {
      complete = false;
      return;
    }
    for (const [semantic, source] of Object.entries(projection)) {
      const target = slot.fields[semantic];
      if (!target) continue;
      contentMap[target] = {
        ...baseMapping,
        at: index,
        select: source,
      };
      targets.push(target);
    }
    if (item?.hasCondensedSupporting === true && !Object.values(projection).some(source => (
      source === 'detail' || /Supporting/.test(source)
    ))) {
      externalSupportingRequired = true;
    }
  });
  return { complete, targets, externalSupportingRequired };
}

function scalarItemProjection(item, slot, { deferred = false } = {}) {
  if (!slot?.fields?.label) return null;
  const sourceItem = item || {};
  const projection = {};
  const usedSources = new Set();
  for (const semantic of Object.keys(slot.fields)) {
    if (semantic === 'value') {
      if (!deferred && !Number.isFinite(sourceItem?.chartValue)) return null;
      projection[semantic] = 'chartValue';
      continue;
    }
    const candidates = semantic === 'label'
      ? sourceItem?.hasCondensedSupporting === true
        ? (
            slot.fields?.displayValue || slot.fields?.value
              ? ['labelWithSupporting', 'labelWithValueAndSupporting', 'label', 'labelWithValue']
              : ['labelWithValueAndSupporting', 'labelWithSupporting', 'labelWithValue', 'label']
          )
        : ['label', 'labelWithValue', 'displayValue']
      : semantic === 'displayValue'
        ? ['displayValue']
        : semantic === 'detail'
          ? ['detail', 'labelWithSupporting', 'labelWithValueAndSupporting', 'label']
          : semantic === 'unit'
            ? ['unit']
            : ['label'];
    const maxChars = Number(slot?.budgets?.[semantic] || 0);
    const source = chooseProjectionItemSource(
      item ? [sourceItem] : [],
      candidates,
      maxChars,
      deferred,
      usedSources,
    );
    if (!source) return null;
    projection[semantic] = source;
    usedSources.add(source);
  }
  return projection;
}

function supportingTextProjection(inspected, presentation, usedTargets = new Set(), { deferred = false } = {}) {
  const summary = deriveSupportingSummary(presentation);
  const fields = (inspected?.fillPlan?.text || [])
    .filter(field => !field?.type || field.type === 'string')
    .filter(field => !String(field.key || '').includes('[]'))
    .filter(field => !usedTargets.has(field.key))
    .filter(field => !/brand|date|page|sheet|unit|number|^no$/i.test(field.key))
    .sort((left, right) => (
      supportingTextTargetScore(right) - supportingTextTargetScore(left)
      || Number(right.maxChars || 0) - Number(left.maxChars || 0)
      || left.key.localeCompare(right.key)
    ));
  const field = fields.find(candidate => (
    deferred
    || (hasPresentationValue(summary)
      && (!Number(candidate.maxChars) || charLength(summary) <= Number(candidate.maxChars)))
  ));
  if (!field) return null;
  return {
    target: field.key,
    mapping: {
      source: 'presentation',
      derive: 'supporting-summary',
    },
  };
}

function supportingTextTargetScore(field) {
  const key = String(field?.key || '').toLowerCase();
  const role = String(field?.role || '').toLowerCase();
  return Number(role === 'body' || role === 'paragraph') * 30
    + Number(/summary|callout|body|detail|note|caption|description|lead/.test(key)) * 20
    - Number(/title|headline|kicker|eyebrow/.test(key)) * 20;
}

function mapAuxiliaryContent(
  projectionPlan,
  presentation,
  contentMap,
  props,
  { deferred = false } = {},
) {
  const issues = [];
  for (const container of projectionPlan.auxiliaryContentContainers || []) {
    if (container?.kind !== 'array' || !container.auxiliaryStrategy) {
      issues.push(`${container?.key || 'auxiliary'}: auxiliary content cannot be safely controlled`);
      continue;
    }
    const field = container.field || {};
    const strategy = container.auxiliaryStrategy;
    if (strategy.type === 'navigation') {
      contentMap[container.key] = {
        source: 'presentation',
        derive: 'navigation-labels',
        limit: Math.max(1, Number(field.visibleCount || field.fixedLength || 1)),
      };
      continue;
    }
    if (strategy.type === 'cover-projection' && field.itemShape === 'string') {
      contentMap[container.key] = {
        source: 'presentation',
        derive: 'cover-decoration-labels',
        maxChars: Number(field.item?.maxChars || 0),
        limit: Math.max(1, Number(field.visibleCount || field.fixedLength || 1)),
      };
      continue;
    }
    if (strategy.type === 'count') {
      setProjectionProp(props, strategy.prop || field.countKey, 0);
      setProjectionProp(props, rootArrayTarget(container.key), []);
      continue;
    }
    if (strategy.type === 'toggle') {
      setProjectionProp(props, strategy.prop, Number(strategy.min) > 0);
    }
    const includeTextFallback = true;
    const fallbackItems = deriveTemplateItems(presentation, { includeTextFallback });
    const visible = Math.max(0, Number(field.visibleCount || field.fixedLength || 0));
    const capacity = arrayFieldCapacity(field) || visible || fallbackItems.length;
    const targetCount = auxiliaryProjectionTargetCount({
      field,
      strategy,
      visible,
      capacity,
      available: fallbackItems.length,
      deferred,
    });
    const source = canonicalSourceForArray(field, presentation, {
      targetCount,
      deferred,
      includeTextFallback,
      supplementTextFallback: true,
      textFallbackOnly: true,
    });
    if (!source) {
      issues.push(`${container.key}: auxiliary business slots lack canonical projection data`);
      continue;
    }
    contentMap[container.key] = source.mapping;
    if (strategy.type === 'projection' || strategy.type === 'cover-projection') {
      if (strategy.prop || field.countKey) {
        setProjectionProp(props, strategy.prop || field.countKey, source.count);
      }
    } else if (strategy.type === 'toggle' && Number(strategy.min) > 0 && field.countKey) {
      setProjectionProp(props, field.countKey, source.count);
    }
  }
  return { issues };
}

function auxiliaryProjectionTargetCount({ field, strategy, visible, capacity, available, deferred }) {
  if (strategy.type === 'toggle') {
    const minimum = Math.max(1, Number(strategy.min) || 0);
    const maximum = [strategy.max, field.maxCount, capacity]
      .map(value => Number(value))
      .filter(value => Number.isFinite(value) && value > 0)
      .reduce((min, value) => Math.min(min, value), Number.POSITIVE_INFINITY);
    return Number.isFinite(maximum) ? Math.min(minimum, maximum) : minimum;
  }
  if (strategy.type !== 'projection' && strategy.type !== 'cover-projection') {
    return Math.max(1, Math.min(capacity || 1, available || 1));
  }

  const minimum = Math.max(0, Number(strategy.min) || 0);
  const maxima = [strategy.max, field.maxCount, capacity]
    .filter(value => value !== null && value !== undefined && value !== '')
    .map(value => Number(value))
    .filter(value => Number.isFinite(value) && value >= 0);
  const declaredMaximum = maxima.length
    ? Math.min(...maxima)
    : Math.max(visible, available, minimum, 1);
  if (declaredMaximum < minimum || declaredMaximum === 0) return 0;
  const maximum = declaredMaximum;
  if (!field.countKey) {
    return Math.max(1, Math.min(maximum, visible || capacity || available || 1));
  }
  if (deferred) {
    return Math.max(minimum || 1, Math.min(maximum, visible || capacity || minimum || 1));
  }
  return Math.max(minimum || 1, Math.min(maximum, available || minimum || 1));
}

function projectionCompletenessIssues(inspected, content, contentMap, props, projectionPlan) {
  let resolved;
  try {
    resolved = resolveContentMap(content, contentMap, props);
  } catch (error) {
    return [`contentMap resolution failed: ${error.message}`];
  }
  const issues = [];
  for (const field of inspected?.fillPlan?.text || []) {
    if (!hasFilledProjectionPath(resolved, field.key)) {
      issues.push(`${field.key}: unresolved business text slot`);
      continue;
    }
    const value = readProjectionValue(resolved, field.key);
    if (typeof value === 'string' && Number(field.maxChars) && charLength(value) > Number(field.maxChars)) {
      issues.push(`${field.key}: projected text exceeds maxChars ${field.maxChars}`);
    }
  }
  const auxiliaryByKey = new Map(
    (projectionPlan?.auxiliaryContentContainers || []).map(container => [
      container.key,
      container.auxiliaryStrategy,
    ]),
  );
  for (const field of inspected?.fillPlan?.arrays || []) {
    const arrays = collectProjectionArrays(resolved, field.key);
    if (!arrays.length) {
      issues.push(`${field.key}: unresolved business array`);
      continue;
    }
    const requestedCount = projectionCountValue(readProjectionValue(resolved, field.countKey));
    const auxiliaryStrategy = auxiliaryByKey.get(field.key);
    const hiddenByToggle = auxiliaryStrategy?.type === 'toggle'
      && readProjectionValue(resolved, auxiliaryStrategy.prop) === false;
    const visibleCount = hiddenByToggle
      ? 0
      : requestedCount ?? projectionCountValue(field.visibleCount) ?? 0;
    arrays.forEach((items, arrayIndex) => {
      const suffix = arrays.length > 1 ? `[${arrayIndex}]` : '';
      if (items.length < visibleCount) {
        issues.push(`${field.key}${suffix}: ${items.length}/${visibleCount} visible items projected`);
        return;
      }
      for (let itemIndex = 0; itemIndex < visibleCount; itemIndex += 1) {
        if (!Object.keys(field.itemFields || {}).length) {
          if (!hasFilledProjectionValue(items[itemIndex])) {
            issues.push(`${field.key}${suffix}[${itemIndex}]: empty projected item`);
          }
          continue;
        }
        for (const [key, contract] of Object.entries(field.itemFields || {})) {
          if (!hasFilledProjectionPath(items[itemIndex], key)) {
            issues.push(`${field.key}${suffix}[${itemIndex}].${key}: empty projected field`);
            continue;
          }
          const value = readProjectionValue(items[itemIndex], key);
          if (typeof value === 'string' && Number(contract.maxChars) && charLength(value) > Number(contract.maxChars)) {
            issues.push(`${field.key}${suffix}[${itemIndex}].${key}: exceeds maxChars ${contract.maxChars}`);
          }
        }
      }
    });
  }
  return issues;
}

function projectionCoverageIssues(inspected, contentMap, props) {
  const issues = [];
  for (const field of inspected?.fillPlan?.text || []) {
    if (!Object.prototype.hasOwnProperty.call(contentMap, field.key)
      && !hasProjectionProp(props, field.key)) {
      issues.push(`${field.key}: no canonical projection mapping`);
    }
  }
  for (const field of inspected?.fillPlan?.arrays || []) {
    if (!Object.prototype.hasOwnProperty.call(contentMap, field.key)
      && !hasProjectionProp(props, rootArrayTarget(field.key))) {
      issues.push(`${field.key}: no canonical projection mapping`);
    }
  }
  return issues;
}

function hasAuthoredCanonicalContent(content = {}) {
  const presentation = content?.presentation || {};
  return [
    presentation.title,
    presentation.titleShort,
    presentation.summary,
    presentation.summaryShort,
    presentation.takeaway,
    ...(Array.isArray(presentation.coverLabels) ? presentation.coverLabels : []),
    ...(Array.isArray(presentation.items) ? presentation.items : []),
    ...(Array.isArray(presentation.chartData) ? presentation.chartData : []),
    ...Object.values(content?.meta || {}),
  ].some(value => (
    value && typeof value === 'object'
      ? Object.values(value).some(hasPresentationValue)
      : hasPresentationValue(value)
  ));
}

function safeProjectionControlValue(field) {
  if (field?.type === 'boolean') return false;
  if (field?.type === 'number') {
    const bounds = field.numericBounds || {};
    const minimum = Number(bounds.min ?? field.min ?? 0);
    const maximum = Number(bounds.max ?? field.max);
    if (Number.isFinite(minimum)) return minimum;
    if (Number.isFinite(maximum) && maximum < 0) return maximum;
    return 0;
  }
  return undefined;
}

function hasFilledProjectionPath(value, pathName) {
  return hasFilledProjectionValue(readProjectionValue(value, pathName));
}

function hasFilledProjectionValue(value) {
  if (typeof value === 'string') return value.trim().length > 0;
  return value !== undefined && value !== null;
}

function readProjectionValue(value, pathName) {
  if (!pathName) return undefined;
  const segments = String(pathName).split('.').filter(Boolean);
  let current = value;
  for (const raw of segments) {
    const key = raw.replace(/\[\]$/, '');
    if (!current || typeof current !== 'object' || !Object.prototype.hasOwnProperty.call(current, key)) {
      return undefined;
    }
    current = current[key];
  }
  return current;
}

function collectProjectionArrays(value, pathName) {
  const segments = String(pathName || '').split('.').filter(Boolean);
  return collectProjectionArrayTargets(value, segments, 0);
}

function collectProjectionArrayTargets(value, segments, index) {
  if (!value || typeof value !== 'object' || index >= segments.length) return [];
  const raw = segments[index];
  const traversesArray = raw.endsWith('[]');
  const key = traversesArray ? raw.slice(0, -2) : raw;
  const next = value[key];
  if (index === segments.length - 1) return Array.isArray(next) ? [next] : [];
  if (traversesArray) {
    if (!Array.isArray(next)) return [];
    return next.flatMap(item => collectProjectionArrayTargets(item, segments, index + 1));
  }
  return collectProjectionArrayTargets(next, segments, index + 1);
}

function projectionCountValue(value) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? Math.round(number) : null;
}

function isValueBearingItem(item) {
  return hasPresentationValue(item?.value)
    || hasPresentationValue(item?.displayValue)
    || Number.isFinite(item?.chartValue);
}

function suppressUnusedMedia(inspected, content, props) {
  if (content?.media?.length) return;
  for (const slot of inspected?.mediaSlots || []) {
    const strategy = emptyMediaStrategy(inspected, slot);
    if (slot.field) setProjectionProp(props, slot.field, []);
    if (strategy?.type === 'count') setProjectionProp(props, strategy.prop, 0);
    if (strategy?.type === 'toggle') setProjectionProp(props, strategy.prop, false);
  }
}

function canSuppressUnusedMedia(inspected) {
  const slots = inspected?.mediaSlots || [];
  return slots.every(slot => Boolean(emptyMediaStrategy(inspected, slot)));
}

function emptyMediaStrategy(inspected, slot) {
  if (
    slot?.emptySlotBehavior === 'hiddenByCount'
    && slot.countKey
    && slot.min != null
    && Number(slot.min) === 0
  ) {
    return { type: 'count', prop: slot.publicCountKey || slot.countKey };
  }
  if (['hidden', 'omitted', 'none'].includes(String(slot?.emptySlotBehavior || ''))) {
    return { type: 'empty' };
  }
  const subject = String(slot?.field || slot?.controlKey || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .replace(/s$/, '');
  const toggle = (inspected?.controls || []).find(control => {
    if (control?.type !== 'toggle') return false;
    const key = String(control.publicKey || control.key || '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
    if (!key.startsWith('show')) return false;
    const toggleSubject = key.slice(4).replace(/s$/, '');
    return subject && toggleSubject
      && (subject.startsWith(toggleSubject) || toggleSubject.startsWith(subject));
  });
  return toggle
    ? { type: 'toggle', prop: toggle.publicKey || toggle.key }
    : null;
}

function rootArrayTarget(pathName) {
  const value = String(pathName || '');
  const nestedAt = value.indexOf('[]');
  return (nestedAt === -1 ? value : value.slice(0, nestedAt)).replace(/\.$/, '');
}

function setProjectionProp(props, pathName, value) {
  const parts = String(pathName || '').split('.').filter(Boolean);
  if (!parts.length) return;
  let cursor = props;
  for (const part of parts.slice(0, -1)) {
    if (!cursor[part] || typeof cursor[part] !== 'object' || Array.isArray(cursor[part])) {
      cursor[part] = {};
    }
    cursor = cursor[part];
  }
  cursor[parts.at(-1)] = value;
}

function hasProjectionProp(props, pathName) {
  const parts = String(pathName || '').split('.').filter(Boolean);
  let cursor = props;
  for (const part of parts) {
    if (!cursor || typeof cursor !== 'object' || !Object.prototype.hasOwnProperty.call(cursor, part)) {
      return false;
    }
    cursor = cursor[part];
  }
  return true;
}

function mirrorProjectionCountAliases(inspected, props) {
  for (const binding of inspected?.countBindings || []) {
    const keys = [...new Set([binding?.key, binding?.publicKey].filter(Boolean))];
    if (keys.length < 2) continue;
    const sourceKey = keys.find(key => hasProjectionProp(props, key));
    if (!sourceKey) continue;
    const value = readProjectionValue(props, sourceKey);
    keys.forEach(key => setProjectionProp(props, key, value));
  }
}

function arrayFieldNestedDepth(field) {
  if (Object.keys(field?.nestedArrays || {}).length) return 1;
  return contentArrayDepth(field?.itemShape);
}

function arrayFieldCapacity(field) {
  return Math.max(0, Number(field?.maxCount || field?.visibleCount || field?.fixedLength || 0));
}

function contentArrayDepth(value) {
  if (Array.isArray(value)) return 1 + contentArrayDepth(value[0]);
  if (!value || typeof value !== 'object') return 0;
  return Object.values(value).reduce((max, child) => Math.max(max, contentArrayDepth(child)), 0);
}

function hasPresentationValue(value) {
  return value !== undefined && value !== null && value !== '';
}

function bespokeChartType(chartData) {
  return Array.isArray(chartData) && chartData.length > 5 ? 'line' : 'bar';
}


function parseMediaIntent(args) {
  const plannedImages = mediaIntentCount(args['planned-images'] ?? args.plannedImages);
  if (plannedImages) return { field: 'plannedImages', value: plannedImages, count: plannedImages };
  if (args['image-gen'] === true || args.imageGen === true) return { field: 'imageGen', value: true, count: 1 };
  if (args['needs-visual'] === true || args.needsVisual === true) return { field: 'needsVisual', value: true, count: 1 };
  return null;
}

function mediaIntentQuery(intent) {
  if (!intent) return {};
  if (intent.field === 'plannedImages') return { plannedImages: intent.count, mediaCount: intent.count };
  if (intent.field === 'imageGen') return { imageGen: true, mediaCount: intent.count };
  if (intent.field === 'needsVisual') return { needsVisual: true, mediaCount: intent.count };
  return {};
}

function mediaIntentCount(value) {
  if (value === true) return 1;
  const count = Number(value);
  if (Number.isFinite(count) && count > 0) return Math.round(count);
  return 0;
}

function parseRoles(value, expectedCount) {
  if (value === undefined) {
    return { roles: DEFAULT_BODY_ROLES, explicit: false };
  }
  if (value === true) throw new Error('Missing value for --roles');
  const roles = String(value)
    .split(',')
    .map(item => item.trim());
  if (roles.some(role => !role)) {
    throw new Error('--roles must be a comma-separated sequence without empty entries');
  }
  const structural = roles.filter(role => role === 'cover' || role === 'closing');
  if (structural.length) {
    throw new Error(`--roles only accepts body roles; cover and closing are automatic (received ${structural.join(', ')})`);
  }
  const unknown = [...new Set(roles.filter(role => !BODY_ROLES.has(role)))];
  if (unknown.length) {
    throw new Error(`Unknown --roles value(s): ${unknown.join(', ')}. Allowed body roles: ${[...BODY_ROLES].join(', ')}`);
  }
  if (roles.length !== expectedCount) {
    throw new Error(
      `--roles must provide exactly ${expectedCount} body roles for the requested page count; `
      + `cover and closing are automatic (received ${roles.length})`,
    );
  }
  return { roles, explicit: true };
}

function writeChunks(out, spec, chunkSize) {
  if (!Number.isFinite(chunkSize) || chunkSize <= 0) return;
  const size = Math.max(1, Math.round(chunkSize));
  const total = Math.ceil(spec.slides.length / size);
  const parsed = path.parse(out);
  for (let index = 0; index < total; index += 1) {
    const start = index * size;
    const end = Math.min(spec.slides.length, start + size);
    const chunkPath = path.join(parsed.dir, `${parsed.name}.part-${String(index + 1).padStart(2, '0')}.json`);
    const chunkSpec = {
      ...(spec.schemaVersion != null ? { schemaVersion: spec.schemaVersion } : {}),
      ...(spec.variantOutputMode ? { variantOutputMode: spec.variantOutputMode } : {}),
      title: spec.title,
      goal: spec.goal,
      themePack: spec.themePack,
      pageCount: spec.pageCount,
      ...(spec.randomSeed != null ? { randomSeed: spec.randomSeed } : {}),
      ...(spec.workflowRunId ? { workflowRunId: spec.workflowRunId } : {}),
      part: {
        index: index + 1,
        total,
        startSlide: start + 1,
        endSlide: end,
      },
      slides: spec.slides.slice(start, end),
    };
    writeJson(chunkPath, chunkSpec);
    writeFillPlan(chunkPath, chunkSpec);
  }
}

function writeJson(file, value) {
  const target = path.resolve(CALLER_CWD, file);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, compactJson(value));
}

function writeFillPlan(goalPath, spec) {
  const out = fillPlanPath(goalPath);
  writeJson(out, {
    goal: path.resolve(CALLER_CWD, goalPath),
    themePack: spec.themePack,
    slideCount: spec.slides.length,
    ...(spec.part ? { part: spec.part } : {}),
    slides: spec.slides.map((slide, index) => ({
      slide: (spec.part?.startSlide || 1) + index,
      ...(Array.isArray(slide.variants)
        ? {
            contentTask: canonicalContentTask(),
            selectedVariant: slide.selectedVariant,
            variants: slide.variants.map(item => inspectFillPlan(item)),
          }
        : inspectFillPlan(slide)),
    })),
  });
  return path.resolve(CALLER_CWD, out);
}

function canonicalContentTask() {
  return {
    status: 'agent-required',
    source: 'slide.content.presentation',
    canonicalKinds: ['title', 'summary', 'takeaway', 'items', 'structure'],
    sharedBy: ['v1', 'v2', 'v3'],
    instruction: '先冻结本页 presentation 文案包；v1-v3 保留同一页面意图、required facts 和关键数字，只选择长短文案、排序与分组。v4 基于同一事实源按用户目标重新组织表达，不新增事实。',
  };
}

function fillPlanPath(goalPath) {
  const parsed = path.parse(goalPath);
  return path.join(parsed.dir, `${parsed.name}.fill-plan.json`);
}

function inspectFillPlan(slide) {
  if (slide?.kind === 'bespoke') {
    return {
      id: slide.id || BESPOKE_VARIANT_ID,
      kind: 'bespoke',
      adjustable: false,
      designTask: {
        status: 'agent-required',
        instruction: '按 baoyu-design 的艺术指导方法分析本页目标、视觉焦点与整稿节奏，再把结果绘制为安全 composition；当前主题 runtime 是强约束设计系统，只使用其字体层级、页框、色带、线条、卡片和图表 recipe，不输出自由 HTML/CSS。',
      },
    };
  }
  let inspected = FILL_PLAN_INSPECT_CACHE.get(slide.layout);
  if (!FILL_PLAN_INSPECT_CACHE.has(slide.layout)) {
    inspected = inspectLayout(slide.layout, { compact: true });
    FILL_PLAN_INSPECT_CACHE.set(slide.layout, inspected);
  }
  return {
    ...(slide.id ? { id: slide.id } : {}),
    ...(slide.kind ? { kind: slide.kind } : {}),
    layout: slide.layout,
    label: inspected?.label || null,
    roles: inspected?.roles || [],
    fillPlan: inspected?.fillPlan || null,
    contentMap: slide.contentMap || {},
    unmappedTargets: [
      ...(inspected?.fillPlan?.text || [])
        .filter(field => field.type === 'string')
        .map(field => field.key),
      ...(inspected?.fillPlan?.arrays || []).map(field => field.key),
    ].filter(target => (
      !Object.prototype.hasOwnProperty.call(slide.contentMap || {}, target)
      && !hasProjectionProp(slide.props || {}, rootArrayTarget(target))
    )),
  };
}

function printUsage() {
  console.error('Usage: node scripts/goal-scaffold.mjs --title <title> --goal <goal> --theme <themeXX> --pages <n> --out output/<deck>/goal.json [--workflow-run-id <id>] [--layout-variants 1|3] [--roles <one-body-role-per-page>] [--chunk-size 5]');
}
