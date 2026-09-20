#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import {
  compactJson,
  getLayoutRecord,
  getMediaSlotsForLayout,
  getPreferredMediaSlot,
  inspectLayout,
  isCoverCandidate,
  isCoverLikeLayout,
  isDeckLocalMediaSource,
  listLayouts,
  mediaSlotsCanFit,
  normalizeProps,
  typedMediaItemForSource,
  unknownPropKeys,
} from './skill-workflow-utils.mjs';
import { validateGoalSpec, validateHtmlStringBoundaries } from './validate-goal-spec.mjs';
import { isMediaArrayKey } from '../src/prop-contract-core.mjs';
import { getVariantKind, resolveContentMap } from '../src/variant-contract.mjs';
import {
  beginWorkflowStage,
  workflowTelemetryPath,
} from './workflow-telemetry.mjs';

const ALLOWED_MEDIA_ITEM_FIELDS = new Set(['src', 'kind', 'type', 'ar', 'ratio', 'poster']);

// 相对路径按调用方目录解析:npm run(含 --prefix)会把脚本 cwd 切到项目根,INIT_CWD 才是用户所在目录。
const CALLER_CWD = process.env.INIT_CWD || process.cwd();

const argv = process.argv.slice(2);

if (argv.includes('--help') || argv.includes('-h')) {
  printUsage();
  process.exit(0);
}

if (argv[0] === '--goal') {
  runGoal(argv[1], parseGoalOptions(argv.slice(2)));
} else {
  runSingle(argv);
}

function runSingle(args) {
  const [layout, propsArg, ...extraArgs] = args;
  if (!layout || !propsArg) {
    printUsage();
    process.exit(2);
  }

  let props;
  try {
    const source = propsArg.trim().startsWith('{') || propsArg.trim().startsWith('[')
      ? propsArg
      : readFileSync(propsArg, 'utf8');
    props = JSON.parse(source);
  } catch (error) {
    console.error(`Invalid props JSON: ${error.message}`);
    process.exit(2);
  }

  const mediaInput = parseMediaInput(extraArgs);
  const mediaInputErrors = validateMediaInput(mediaInput);
  if (mediaInputErrors.length) {
    process.stdout.write(compactJson({
      layout,
      props,
      warnings: [],
      errors: mediaInputErrors,
    }));
    process.exit(1);
  }

  let mediaIntent = null;
  let mediaMapping = null;

  if (mediaInput.items.length) {
    const slot = getPreferredMediaSlot(layout, { kind: mediaInput.kind, count: mediaInput.items.length });
    if (!slot) {
      process.stdout.write(compactJson({
        layout,
        props,
        warnings: [],
        errors: [`Layout "${layout}" has no media slot that can hold ${mediaInput.items.length} item(s)`],
      }));
      process.exit(1);
    }
    const writeKey = mediaSlotWriteKey(slot);
    props = {
      ...props,
      [writeKey]: mediaInput.items,
      ...(slot.countKey ? { [slot.countKey]: mediaInput.items.length } : {}),
    };
    mediaIntent = mediaInput.kind === 'media' ? 'provided-media' : 'provided-images';
    mediaMapping = {
      field: slot.field,
      fieldPath: slot.fieldPath,
      writableProp: slot.writableProp,
      presetProp: slot.presetProp,
      countKey: slot.countKey,
      count: mediaInput.items.length,
    };
  }

  const record = getLayoutRecord(layout);
  const unknownKeys = record ? unknownPropKeys(record, props) : [];
  const result = normalizeProps(layout, props);
  const unknownErrors = unknownKeys.map(key => `Unknown prop "${key}" for layout "${layout}"`);
  const htmlErrors = [];
  validateHtmlStringBoundaries(props, 'single-layout', layout, 'props', htmlErrors);
  const mediaErrors = validateMediaProps(result.props || props);
  const contractErrors = validateGoalSpec({
    slides: [{
      layout,
      props: result.props || props,
    }],
  }, {
    authoredSpec: {
      slides: [{
        layout,
        props,
      }],
    },
  }).filter(error => error.includes(' field props'));
  const errors = [...new Set([...(result.errors || []), ...unknownErrors, ...htmlErrors, ...mediaErrors, ...contractErrors])];
  process.stdout.write(compactJson({
    layout,
    mediaIntent,
    mediaMapping,
    ...result,
    warnings: result.warnings || [],
    props: unknownKeys.length ? stripKeys(result.props || props, unknownKeys) : result.props,
    publicProps: unknownKeys.length ? stripKeys(result.publicProps || {}, unknownKeys) : result.publicProps,
    errors,
  }));

  if (errors.length) process.exit(1);
}

function runGoal(goalArg, options = {}) {
  if (!goalArg) {
    printUsage();
    process.exit(2);
  }
  const goalPath = path.resolve(CALLER_CWD, goalArg);
  const telemetry = beginWorkflowStage({
    goalPath,
    telemetryFile: workflowTelemetryPath(goalPath),
    stage: 'props-safe',
    kind: 'normalize',
    command: 'props:safe',
  });
  let spec;
  try {
    spec = JSON.parse(readFileSync(goalPath, 'utf8'));
  } catch (error) {
    telemetry.finish({ ok: false, error });
    console.error(`Invalid goal JSON: ${error.message}`);
    process.exit(2);
  }

  const slides = Array.isArray(spec.slides) ? spec.slides : [];
  const canonicalContentErrors = slides.map(canonicalContentError);
  const entries = slides.flatMap((slide, slideIndex) => (
    Array.isArray(slide?.variants)
      ? slide.variants.map((variant, variantIndex) => ({
          slide: variant,
          content: slide?.content || {},
          canonicalContentError: variantIndex === 0 ? canonicalContentErrors[slideIndex] : null,
          slideIndex,
          variantIndex,
          variantId: variant?.id || `v${variantIndex + 1}`,
        }))
      : [{
          slide,
          content: slide?.content || {},
          canonicalContentError: canonicalContentErrors[slideIndex],
          slideIndex,
          variantIndex: null,
          variantId: null,
        }]
  ));
  // JAD-workflow-friction:layout 容量确定放不下作者媒体数组时(仅此一种、可客观判定的场景),
  // 换用同主题内能容纳的候选 layout,而不是把无解的媒体错误抛回作者。每次替换都记入
  // layoutChanges,绝不无声改写——调用方必须能在输出里看到 from/to/reason。
  const usedLayoutsBySlide = new Map(slides.map((_slide, slideIndex) => [
    slideIndex,
    new Set(entries
      .filter(item => item.slideIndex === slideIndex)
      .map(item => item.slide?.layout)
      .filter(Boolean)),
  ]));
  const layoutChanges = [];
  const normalizedEntries = entries.map((entry) => {
    const {
      slide,
      content,
      canonicalContentError: contentError,
      slideIndex,
      variantIndex,
      variantId,
    } = entry;
    const contentMap = slide?.contentMap || {};
    const canonicalErrors = [
      ...(contentError ? [contentError] : []),
      ...canonicalContentMapErrors(contentMap),
    ];
    if (getVariantKind(slide) === 'bespoke') {
      return {
        ...entry,
        normalizedSlide: slide,
        result: {
          slide: slideIndex + 1,
          ...(variantIndex == null ? {} : { variant: variantId }),
          kind: 'bespoke',
          layout: null,
          warningCount: 0,
          errorCount: canonicalErrors.length,
          ...(canonicalErrors.length ? { errors: canonicalErrors } : {}),
        },
      };
    }
    const originalLayout = slide?.layout;
    let layout = originalLayout;
    let effectiveProps = slide?.props || {};
    let contentMapError = canonicalErrors.length ? canonicalErrors.join('; ') : null;
    if (!contentMapError) {
      try {
        effectiveProps = resolveContentMap(content, contentMap, effectiveProps);
      } catch (error) {
        contentMapError = `contentMap: ${error.message}`;
      }
    }
    let normalized = contentMapError
      ? { warnings: [], errors: [contentMapError] }
      : layout
        ? normalizeProps(layout, effectiveProps)
        : { warnings: [], errors: ['missing layout'] };
    let unresolvedMediaMismatch = layout
      ? findLayoutMediaMismatch(layout, effectiveProps)
      : null;
    if (layout && normalized.errors?.length && !contentMapError) {
      const usedLayouts = usedLayoutsBySlide.get(slideIndex);
      const safe = trySafeLayoutForSlide(layout, effectiveProps, usedLayouts);
      if (safe) {
        layoutChanges.push({
          slide: slideIndex + 1,
          ...(variantIndex == null ? {} : { variant: variantId }),
          from: layout,
          to: safe.layout,
          reason: `props.${safe.mismatch.key} 有 ${safe.mismatch.count} 项媒体,"${layout}" 没有能容纳的媒体槽位,已换为 "${safe.layout}"`,
        });
        usedLayouts.delete(layout);
        usedLayouts.add(safe.layout);
        layout = safe.layout;
        normalized = safe.normalized;
        unresolvedMediaMismatch = null;
      }
    }
    // 字段级抢救:此前任何一个字段报错都会丢弃整页 props(整页回退演示文案,正是用户
    // 反馈的「几乎每页都残留」);现在仅剔除无法通过契约的根键,其余字段保留并写回。
    if (layout && normalized.errors?.length && !unresolvedMediaMismatch && !contentMapError && !Object.keys(contentMap).length) {
      const salvaged = salvageSlideProps(layout, effectiveProps);
      if (salvaged && Object.keys(salvaged.props || {}).length) {
        normalized = {
          props: salvaged.props,
          errors: [],
          warnings: [
            ...(normalized.warnings || []),
            `已剔除无法通过契约的字段并保留其余覆盖:${salvaged.dropped.join(', ')}(被剔除字段回退默认值,建议修正后重试)`,
          ],
        };
      }
    }
    const normalizedSlide = layout && !normalized.errors?.length
      ? {
          ...slide,
          layout,
          props: stripContentMapTargets(normalized.props, contentMap),
        }
      : { ...slide, layout };
    return {
      ...entry,
      normalizedSlide,
      result: {
        slide: slideIndex + 1,
        ...(variantIndex == null ? {} : { variant: variantId }),
        layout: layout || null,
        warningCount: normalized.warnings?.length || 0,
        errorCount: normalized.errors?.length || 0,
        ...(normalized.warnings?.length ? { warnings: normalized.warnings } : {}),
        ...(normalized.errors?.length ? { errors: normalized.errors } : {}),
      },
    };
  });
  const normalizedSlides = slides.map((slide, slideIndex) => {
    const matches = normalizedEntries.filter(item => item.slideIndex === slideIndex);
    if (!Array.isArray(slide?.variants)) return matches[0]?.normalizedSlide || slide;
    return {
      ...slide,
      variants: matches.map(item => item.normalizedSlide),
    };
  });
  const slideResults = normalizedEntries.map(item => item.result);
  const normalizedSpec = Array.isArray(spec.slides) ? { ...spec, slides: normalizedSlides } : spec;
  const goalSpecErrors = validateGoalSpec(normalizedSpec, { authoredSpec: spec });
  const propErrors = slideResults.flatMap(item => (item.errors || []).map(error => (
    `slide ${item.slide}${item.variant ? ` variant ${item.variant}` : ''} ${item.layout || '<missing>'}: ${error}`
  )));
  const ok = goalSpecErrors.length === 0 && propErrors.length === 0;
  if (ok && options.write) writeFileSync(goalPath, compactJson(normalizedSpec));
  const result = {
    goal: goalPath,
    slideCount: slides.length,
    ok,
    ...(ok && options.write ? { written: goalPath } : {}),
    goalSpecErrorCount: goalSpecErrors.length,
    propErrorCount: propErrors.length,
    warningCount: slideResults.reduce((sum, item) => sum + item.warningCount, 0),
    layoutChanges,
    ...(goalSpecErrors.length ? { goalSpecErrors } : {}),
    ...(propErrors.length ? { propErrors } : {}),
    slides: slideResults,
  };
  telemetry.finish({
    ok,
    error: ok ? null : new Error([...goalSpecErrors, ...propErrors].join('; ')),
    metrics: {
      layoutChangeCount: layoutChanges.length,
      propErrorCount: propErrors.length,
      goalSpecErrorCount: goalSpecErrors.length,
    },
  });
  process.stdout.write(compactJson(result));
  if (layoutChanges.length) {
    console.error(`${layoutChanges.length} 处 layout 被替换(核对输出 JSON 的 layoutChanges,不认可就改回并换页)`);
  }
  if (!result.ok) process.exit(1);
}

function canonicalContentError(slide) {
  const content = slide?.content;
  if (content && typeof content === 'object' && !Array.isArray(content)) {
    const variantKey = Object.keys(content).find(key => /^v\d+$/i.test(key));
    if (variantKey) {
      return `slide.content.${variantKey}: variant-specific content is not allowed; keep one canonical presentation source in slide.content`;
    }
  }
  const candidates = [
    ['slide.views', slide?.views],
    ['slide.variantContent', slide?.variantContent],
    ['slide.content.views', content?.views],
    ['slide.content.variants', content?.variants],
    ['slide.content.variantContent', content?.variantContent],
  ];
  for (const [scope, value] of candidates) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) continue;
    const variantKey = Object.keys(value).find(key => /^v\d+$/i.test(key));
    if (variantKey) {
      return `${scope}.${variantKey}: variant-specific content is not allowed; keep one canonical presentation source in slide.content`;
    }
  }
  return null;
}

function canonicalContentMapErrors(contentMap) {
  if (!contentMap || typeof contentMap !== 'object' || Array.isArray(contentMap)) return [];
  return Object.entries(contentMap).flatMap(([target, mapping]) => {
    const source = typeof mapping === 'string' ? mapping : mapping?.source;
    return typeof source === 'string' && /^(?:v\d+|(?:views|variants|variantContent)\.v\d+)(?:\.|\[|$)/i.test(source)
      ? [`contentMap target "${target}": variant-specific source "${source}" is not allowed; map from canonical slide.content`]
      : []
  });
}

function stripContentMapTargets(props, contentMap) {
  const paths = Object.keys(contentMap || {});
  if (!paths.length) return props;
  const result = structuredClone(props || {});
  const targets = paths
    .map(contentMapPathTokens)
    .map(tokens => (tokens[0] === 'props' ? tokens.slice(1) : tokens))
    .filter(tokens => tokens.length)
    .sort(compareContentMapTargets);
  for (const tokens of targets) deleteContentMapTarget(result, tokens);
  return result;
}

function contentMapPathTokens(value) {
  const tokens = [];
  String(value || '').replace(/([^[.\]]+)|\[(\d+)\]/g, (_match, key, index) => {
    tokens.push(index === undefined ? key : Number(index));
    return '';
  });
  return tokens;
}

function compareContentMapTargets(left, right) {
  const leftParent = JSON.stringify(left.slice(0, -1));
  const rightParent = JSON.stringify(right.slice(0, -1));
  const leftLast = left.at(-1);
  const rightLast = right.at(-1);
  if (leftParent === rightParent && Number.isInteger(leftLast) && Number.isInteger(rightLast)) {
    return rightLast - leftLast;
  }
  return right.length - left.length;
}

function deleteContentMapTarget(root, tokens) {
  let parent = root;
  for (const token of tokens.slice(0, -1)) {
    if (parent == null || typeof parent !== 'object') return;
    parent = parent[token];
  }
  if (parent == null || typeof parent !== 'object') return;
  const key = tokens.at(-1);
  if (Array.isArray(parent) && Number.isInteger(key)) {
    if (key >= 0 && key < parent.length) parent.splice(key, 1);
    return;
  }
  delete parent[key];
}

// 仅在“作者媒体数组长度超出该 layout 所有媒体槽位容量”这一可客观判定的场景下触发候选查找;
// 其余任何 normalizeProps 错误(未知字段、文案越界等)一律原样报错,不做 layout 替换。
function salvageSlideProps(layout, props = {}) {
  const current = { ...(props || {}) };
  const dropped = [];
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = normalizeProps(layout, current);
    if (!res.errors?.length) return dropped.length ? { props: res.props ?? current, dropped } : null;
    const bad = new Set((res.errors || [])
      .map(err => String(err).match(/props\.([A-Za-z0-9_$]+)/)?.[1])
      .filter(Boolean));
    if (!bad.size) return null;
    for (const key of bad) {
      if (key in current) { delete current[key]; dropped.push(key); }
    }
  }
  return null;
}

function findLayoutMediaMismatch(layout, props = {}) {
  const slots = getMediaSlotsForLayout(layout);
  if (!slots.length) return null;
  for (const [key, value] of Object.entries(props || {})) {
    if (!isMediaArrayKey(key) || !Array.isArray(value) || !value.length) continue;
    const kind = key.toLowerCase() === 'media' ? 'media' : 'image';
    if (!mediaSlotsCanFit(slots, value.length, { mediaKind: kind })) {
      return { key, count: value.length, kind };
    }
  }
  return null;
}

function findSafeLayoutCandidates(currentLayout, mismatch) {
  const themeKey = getLayoutRecord(currentLayout)?.page?.themeKey;
  if (!themeKey) return [];
  const currentRoles = new Set(inspectLayout(currentLayout, { compact: true })?.roles || []);
  const currentIsCover = isCoverCandidate(currentLayout);
  const currentIsCoverLike = isCoverLikeLayout(currentLayout);
  const rows = listLayouts({
    theme: themeKey,
    mediaCount: mismatch.count,
    mediaKind: mismatch.kind,
    limit: 30,
  });
  return rows
    .map(row => row.layout)
    .filter(candidate => candidate && candidate !== currentLayout)
    .filter(candidate => (
      isCoverCandidate(candidate) === currentIsCover
      && isCoverLikeLayout(candidate) === currentIsCoverLike
    ))
    .filter(candidate => {
      if (!currentRoles.size) return true;
      const candidateRoles = inspectLayout(candidate, { compact: true })?.roles || [];
      return candidateRoles.some(role => currentRoles.has(role));
    });
}

function trySafeLayoutForSlide(layout, props, usedLayouts) {
  const mismatch = findLayoutMediaMismatch(layout, props);
  if (!mismatch) return null;
  for (const candidateLayout of findSafeLayoutCandidates(layout, mismatch)) {
    if (usedLayouts.has(candidateLayout)) continue;
    const attempt = normalizeProps(candidateLayout, props);
    if (!attempt.errors?.length) return { layout: candidateLayout, normalized: attempt, mismatch };
  }
  return null;
}

function printUsage() {
  console.error('Usage:');
  console.error('  node scripts/write-safe-props.mjs <layout> <props-json-or-file> [--images <path...>] [--media <path...>]');
  console.error('  node scripts/write-safe-props.mjs --goal <goal-spec.json> [--write]');
}

function parseMediaInput(args) {
  const result = { kind: null, items: [] };
  for (let index = 0; index < args.length; index += 1) {
    const item = args[index];
    if (item !== '--images' && item !== '--media') continue;
    result.kind = item === '--media' ? 'media' : 'images';
    for (let valueIndex = index + 1; valueIndex < args.length && !args[valueIndex].startsWith('--'); valueIndex += 1) {
      result.items.push(result.kind === 'media' ? typedMediaItemForSource(args[valueIndex]) : args[valueIndex]);
      index = valueIndex;
    }
  }
  return result;
}

function parseGoalOptions(args) {
  return {
    write: args.includes('--write'),
  };
}

function mediaSlotWriteKey(slot) {
  const path = slot.presetProp || slot.writableProp || slot.fieldPath || (slot.field ? `props.${slot.field}` : '');
  const match = /^props\.([A-Za-z_$][\w$]*)$/.exec(String(path || ''));
  return match?.[1] || slot.field;
}

function validateMediaInput(mediaInput) {
  const errors = [];
  for (const [index, item] of mediaInput.items.entries()) {
    const src = typeof item === 'string' ? item : item?.src;
    pushMediaSourceError(src, `--${mediaInput.kind}[${index}]`, errors);
  }
  return errors;
}

function validateMediaProps(props = {}) {
  const errors = [];
  for (const [key, value] of Object.entries(props || {})) {
    if (!isMediaArrayKey(key) || !Array.isArray(value)) continue;
    value.forEach((item, index) => validateMediaItem(item, `props.${key}[${index}]`, errors));
  }
  return errors;
}

function validateMediaItem(item, field, errors) {
  if (typeof item === 'string') {
    pushMediaSourceError(item, field, errors);
    return;
  }
  if (!item || typeof item !== 'object' || Array.isArray(item)) return;
  const unknownFields = Object.keys(item).filter(key => !ALLOWED_MEDIA_ITEM_FIELDS.has(key));
  if (unknownFields.length) {
    errors.push(`${field}: unknown media item field(s): ${unknownFields.join(', ')}; allowed fields: ${[...ALLOWED_MEDIA_ITEM_FIELDS].join(', ')}`);
  }
  pushMediaSourceError(item.src, `${field}.src`, errors);
  if (typeof item.poster === 'string') pushMediaSourceError(item.poster, `${field}.poster`, errors);
}

function pushMediaSourceError(src, field, errors) {
  const text = String(src || '').trim();
  if (!text || isDeckLocalMediaSource(text)) return;
  errors.push(`${field}: media source "${text}" must be staged into the deck under assets/user-media/ and referenced by normalized POSIX relative path; traversal, loose relative paths, absolute local paths, file:// URLs, remote http(s) URLs, and data: media are not allowed`);
}

function stripKeys(value, keys) {
  const blocked = new Set(keys);
  return Object.fromEntries(Object.entries(value || {}).filter(([key]) => !blocked.has(key)));
}
