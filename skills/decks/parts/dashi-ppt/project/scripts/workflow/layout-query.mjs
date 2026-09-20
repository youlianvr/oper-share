// @ts-check
// layout-query 域:按 role/关键词/媒体需求筛选并打分候选版式(listLayouts 的实现)。
import {
  THEME_PAGES,
  isBodyContentCandidate,
  isCoverCandidate,
} from './theme-registry.mjs';
import {
  getMediaSlotsForLayout,
  isWritableMediaSlot,
  mediaSlotsCanFit,
  normalizeMediaKind,
  slotAcceptsKind,
} from './media-slots.mjs';
import {
  inspectLayout,
  pageSearchText,
} from './inspect-fillplan.mjs';
import { charLength } from './copy-contract.mjs';
import { deriveTemplateItems } from '../../src/variant-contract.mjs';
import {
  plannerPresentationFieldForTarget as presentationFieldForTarget,
  presentationTargetEntries,
} from './presentation-field-semantics.mjs';

const ROLE_ALIASES = {
  agenda: 'breakdown',
  summary: 'statement',
  insight: 'observation',
  quote: 'observation',
  // 批测实证的直觉词(codex 多轮使用未命中):映射到最接近的既有 role。
  numbers: 'metrics',
  section: 'transition',
  chapter: 'transition',
  list: 'breakdown',
  product: 'case',
  feature: 'case',
  faq: 'risks',
  content: 'content',
  body: 'content',
  main: 'content',
  inner: 'content',
  interior: 'content',
  '正文': 'content',
  '内容': 'content',
  '主体': 'content',
  '内页': 'content',
  chart: 'metrics',
  timeline: 'trend',
  compare: 'comparison',
  flow: 'process',
  roadmap: 'actions',
  visual: 'image',
  gallery: 'image',
  media: 'image',
  picture: 'image',
  photo: 'image',
  atmosphere: 'ambient',
  background: 'ambient',
  dynamic: 'ambient',
};
const LAYOUT_INSPECTION_CACHE = new Map();
const EMPTY_REQUIRED_CONTENT_SHAPE = {
  titleChars: 0,
  itemCount: 0,
  minItemCount: 0,
  numericItemCount: 0,
  valueItemCount: 0,
  rawNumericItemCount: 0,
  textualValueItemCount: 0,
  unitItemCount: 0,
  secondaryLabelItemCount: 0,
  durationItemCount: 0,
  pageLabelItemCount: 0,
  nestedDepth: 0,
  requiresValue: false,
};
const EMPTY_PREFERRED_CONTENT_SHAPE = {
  summaryChars: 0,
  takeawayChars: 0,
  detailItemCount: 0,
  chartPointCount: 0,
  priority: '',
};

export function contentShapeFromPresentation(presentation = {}, hints = {}) {
  const items = deriveTemplateItems(presentation);
  const positive = key => {
    const value = Number(hints?.[key]);
    return Number.isFinite(value) && value > 0 ? Math.round(value) : 0;
  };
  const valueItemCount = items.filter(item => (
    hasContentValue(item?.value) || hasContentValue(item?.displayValue)
  )).length || positive('valueItemCount') || positive('numericItemCount');
  const rawNumericItemCount = items.filter(item => (
    Number.isFinite(item?.chartValue)
  )).length || positive('rawNumericItemCount');
  const textualValueItemCount = items.filter(item => (
    hasContentValue(item?.displayValue)
    && (
      typeof item?.value !== 'number'
      || !Number.isFinite(item.value)
      || String(item.displayValue) !== String(item.value)
    )
  )).length || positive('textualValueItemCount');
  const unitItemCount = items.filter(item => hasContentValue(item?.unit)).length
    || positive('unitItemCount');
  const secondaryLabelItemCount = items.filter(item => (
    hasContentValue(item?.secondaryLabel)
    || hasContentValue(item?.projectionSecondaryLabel)
  )).length || positive('secondaryLabelItemCount');
  const durationItemCount = items.filter(item => (
    hasContentValue(item?.duration)
    || hasContentValue(item?.projectionDuration)
  )).length || positive('durationItemCount');
  const pageLabelItemCount = items.filter(item => (
    hasContentValue(item?.pageLabel)
    || hasContentValue(item?.projectionPageLabel)
  )).length || positive('pageLabelItemCount');
  const itemCount = items.length || positive('itemCount');
  const minimumProjectionSlots = items.length
    ? Math.max(1, Math.ceil(items.length / 2))
    : 0;
  return {
    required: {
      titleChars: charLength(presentation?.titleShort || presentation?.title || '')
        || positive('titleChars'),
      itemCount,
      minItemCount: items.length
        ? Math.min(items.length, minimumProjectionSlots)
        : positive('minItemCount') || itemCount,
      numericItemCount: valueItemCount,
      valueItemCount,
      rawNumericItemCount,
      textualValueItemCount,
      unitItemCount,
      secondaryLabelItemCount,
      durationItemCount,
      pageLabelItemCount,
      nestedDepth: positive('requiredNestedDepth') || positive('nestedDepth'),
      requiresValue: valueItemCount > 0,
    },
    preferred: {
      summaryChars: charLength(presentation?.summaryShort || presentation?.summary || '')
        || positive('summaryChars'),
      takeawayChars: charLength(presentation?.takeaway || '')
        || positive('takeawayChars'),
      detailItemCount: items.filter(item => hasContentValue(item?.detail)).length
        || positive('detailItemCount'),
      chartPointCount: Array.isArray(presentation?.chartData)
        ? presentation.chartData.length
        : positive('chartPointCount'),
      priority: String(hints?.priority || '').trim().toLowerCase(),
    },
  };
}

function hasContentValue(value) {
  return value !== undefined && value !== null && value !== '';
}

/** @param {import('../../src/types').ListLayoutsOptions} [options] */
export function listLayouts({
  theme,
  role,
  keyword,
  contentShape = null,
  needsMedia = false,
  plannedImages = false,
  providedImages = false,
  providedMedia = false,
  imageGen = false,
  needsVisual = false,
  mediaCount = null,
  mediaKind = null,
  requireInitialMedia = false,
  limit = 12,
  seed = null,
} = {}) {
  const requestedRole = role ? String(role).trim().toLowerCase() : '';
  const normalizedRole = requestedRole ? ROLE_ALIASES[requestedRole] || requestedRole : '';
  const keywordText = String(keyword || '').trim().toLowerCase();
  const requestedMediaCount = getRequestedMediaCount({ plannedImages, providedImages, providedMedia, imageGen, needsVisual, mediaCount });
  const normalizedMediaKind = normalizeMediaKind(mediaKind);
  const needsInitialMedia = Boolean(requireInitialMedia || providedImages || providedMedia);
  const requiresMedia = needsMedia || requestedMediaCount > 0 || needsInitialMedia || Boolean(normalizedMediaKind);
  const normalizedContentShape = normalizeContentShape(contentShape);

  const rows = listLayoutsForMediaCount({
    theme,
    normalizedRole,
    keywordText,
    contentShape: normalizedContentShape,
    requiresMedia,
    requestedMediaCount,
    normalizedMediaKind,
    needsInitialMedia,
    seed,
  });
  return rows
    .slice(0, Math.max(1, Math.min(200, Number(limit) || 12)))
    .map(compactLayoutCandidate);
}

function listLayoutsForMediaCount({ theme, normalizedRole, keywordText, contentShape, requiresMedia, requestedMediaCount, normalizedMediaKind, needsInitialMedia, seed }) {
  const candidates = THEME_PAGES
    .filter(page => !theme || page.themeKey === theme)
    .filter(page => {
      if (!normalizedRole) return true;
      if (normalizedRole === 'cover') return isCoverCandidate(page.key);
      if (normalizedRole === 'content') return isBodyContentCandidate(page);
      return true;
    })
    .filter(page => !keywordText || pageSearchText(page).includes(keywordText))
    .map(page => inspectLayoutForQuery(page.key))
    .filter(Boolean)
    .filter(row => !requiresMedia || mediaSlotsCanFit(
      getMediaSlotsForLayout(row.layout),
      requestedMediaCount || 1,
      {
        requireInitialMedia: needsInitialMedia,
        mediaKind: normalizedMediaKind,
        exactCount: requestedMediaCount > 0,
      },
    ))
    .map(row => {
      const projectionPlan = buildTemplateProjectionPlan(row, contentShape);
      const structureFingerprint = layoutStructureFingerprint(row, projectionPlan);
      return {
        ...row,
        projectionPlan,
        structureFingerprint,
        queryScore: scoreLayout(row, {
          normalizedRole,
          keywordText,
          contentShape,
          structureFingerprint,
          requiresMedia,
          requestedMediaCount,
          normalizedMediaKind,
          needsInitialMedia,
        }),
      };
    })
    .filter(row => row.projectionPlan.requiredFits);

  // 同分候选用 seed 随机打散:打分只表达"是否更匹配",同等匹配的页面之间没有天然
  // 优先级。历史上并列项按页码稳定排序,所有调用方(Agent 与 goal:scaffold)都贪婪
  // 取列表最前,导致不同用户生成的 deck 大量选中同一批"前面的页",成片雷同。
  const tieBreakSeed = seed === null || seed === undefined || seed === '' ? String(Math.floor(Math.random() * 0xffffffff)) : String(seed);
  return candidates.sort((a, b) => {
    const diff = b.queryScore - a.queryScore;
    if (diff !== 0) return diff;
    return hashSeed(`${tieBreakSeed}:${b.layout}`) - hashSeed(`${tieBreakSeed}:${a.layout}`);
  });
}

function compactLayoutCandidate(row) {
  if (!row) return row;
  const {
    copyBudgets,
    propShapes,
    fieldContracts,
    copyRoles,
    countBindings,
    defaultVisibleCounts,
    fillPlan,
    lengthBindings,
    themeDisplayName,
    themeScenario,
    themeAudience,
    ...candidate
  } = row;
  const copyKeys = (row.copyKeys || []).slice(0, 6);
  return {
    ...candidate,
    themeDisplayName,
    capabilities: layoutCapabilities(row, row.projectionPlan?.contentShape),
    copyKeys,
    copyBudgets: compactCopyBudgets(row.copyBudgets, copyKeys),
    arrayMeta: (row.arrayMeta || []).map(compactCandidateArrayMeta),
    mediaSlots: (row.mediaSlots || []).map(compactQueryMediaSlot),
  };
}

function inspectLayoutForQuery(layout) {
  if (!LAYOUT_INSPECTION_CACHE.has(layout)) {
    LAYOUT_INSPECTION_CACHE.set(layout, inspectLayout(layout));
  }
  return LAYOUT_INSPECTION_CACHE.get(layout);
}

function compactCopyBudgets(copyBudgets = {}, copyKeys = []) {
  return Object.fromEntries((copyKeys || [])
    .map(key => [key, copyBudgets?.[key]])
    .filter(([, budget]) => budget?.maxChars)
    .map(([key, budget]) => [key, { maxChars: budget.maxChars }]));
}

function compactCandidateArrayMeta(meta) {
  return {
    key: meta.key,
    role: meta.role,
    defaultVisibleCount: meta.defaultVisibleCount,
    maxCount: meta.maxCount,
    countKey: meta.countKey,
    maxFromKey: meta.maxFromKey,
    maxFromKeyOffset: meta.maxFromKeyOffset,
    maxByKey: meta.maxByKey,
    maxByValue: meta.maxByValue,
  };
}

function compactQueryMediaSlot(slot) {
  return {
    role: slot.role,
    field: slot.field,
    fieldPath: slot.fieldPath,
    writableProp: slot.writableProp,
    countKey: slot.countKey,
    publicCountKey: slot.publicCountKey || slot.countKey,
    defaultCount: slot.defaultCount,
    defaultVisibleCount: slot.defaultVisibleCount,
    max: slot.max,
    maxFromKey: slot.maxFromKey,
    maxFromKeyOffset: slot.maxFromKeyOffset,
    maxByKey: slot.maxByKey,
    maxByValue: slot.maxByValue,
    maxCount: slot.maxCount,
    acceptedKinds: slot.acceptedKinds,
    acceptedKindsSource: slot.acceptedKindsSource,
    initialSrcSupported: slot.initialSrcSupported,
    canPresetMedia: slot.canPresetMedia,
    presetProp: slot.presetProp,
    emptySlotBehavior: slot.emptySlotBehavior,
  };
}

function compactCandidateFillPlan(plan) {
  return {
    arrays: (plan.arrays || []).slice(0, 4).map(item => ({
      key: item.key,
      role: item.role,
      visibleCount: item.visibleCount,
      maxCount: item.maxCount,
      countKey: item.countKey,
      ...(item.itemShape === 'string' ? { itemShape: item.itemShape } : {}),
      ...(item.item?.maxChars ? { item: item.item } : {}),
      ...(item.nestedArrays && Object.keys(item.nestedArrays).length ? { nestedArrays: item.nestedArrays } : {}),
    })),
    media: (plan.media || []).slice(0, 2),
  };
}

export function hashSeed(value) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  // FNV-1a 对仅末字符不同的 key(themeNN_page010/011…)雪崩不足,直接用会让"随机"
  // 顺序呈现大片连续页码;补一轮 murmur3 终混(fmix32)打散。
  hash ^= hash >>> 16;
  hash = Math.imul(hash, 0x85ebca6b);
  hash ^= hash >>> 13;
  hash = Math.imul(hash, 0xc2b2ae35);
  hash ^= hash >>> 16;
  return hash >>> 0;
}

/** @param {import('../../src/types').CompactLayoutCandidate} layout */
export function scoreLayout(layout, {
  normalizedRole,
  keywordText,
  contentShape,
  structureFingerprint,
  requiresMedia,
  requestedMediaCount,
  normalizedMediaKind,
  needsInitialMedia,
}) {
  let score = 0;
  if (normalizedRole && layout.roles.includes(normalizedRole)) score += 4;
  if (keywordText && `${layout.label} ${layout.slot}`.toLowerCase().includes(keywordText)) score += 6;
  if (requiresMedia && layout.mediaSlots.some(isWritableMediaSlot)) score += 8;
  if (!requiresMedia && layout.mediaSlots.some(isWritableMediaSlot)) score -= 4;
  if (needsInitialMedia && layout.mediaSlots.some(slot => isWritableMediaSlot(slot) && slot.initialSrcSupported)) score += 6;
  if (normalizedMediaKind && layout.mediaSlots.some(slot => isWritableMediaSlot(slot) && slotAcceptsKind(slot, normalizedMediaKind))) score += 4;
  if (requestedMediaCount && layout.mediaSlots.some(slot => isWritableMediaSlot(slot) && Number(slot.defaultCount) === requestedMediaCount)) score += 3;
  score += scoreContentShape(layout, contentShape);
  score += scoreExpressionFit(
    structureFingerprint,
    normalizedRole,
    contentShape?.preferred?.priority,
  );
  return score;
}

function scoreContentShape(layout, shape) {
  if (!shape) return 0;
  const normalized = normalizeContentShape(shape);
  const required = normalized?.required || EMPTY_REQUIRED_CONTENT_SHAPE;
  const preferred = normalized?.preferred || EMPTY_PREFERRED_CONTENT_SHAPE;
  const capabilities = layoutCapabilities(layout, normalized);
  const primary = capabilities.primaryContentContainer;

  let score = 0;
  if (required.titleChars) {
    score += capacityFitScore(capabilities.titleMaxChars, required.titleChars, 12);
  }
  if (preferred.summaryChars) {
    score += capacityFitScore(capabilities.summaryMaxChars, preferred.summaryChars, 8);
  }
  if (preferred.takeawayChars) {
    score += capacityFitScore(capabilities.takeawayMaxChars, preferred.takeawayChars, 6);
  }
  if (required.itemCount) {
    score += capacityFitScore(capabilities.itemCapacity, required.itemCount, 20);
  }
  if (required.valueItemCount || required.numericItemCount) {
    score += primary?.supportsValue ? 10 : 0;
  }
  if (required.nestedDepth) {
    score += capabilities.nestedDepth === required.nestedDepth ? 8 : 4;
  }
  if (preferred.detailItemCount && primary?.supportsDetail) score += 6;
  if (preferred.chartPointCount) {
    score += primary?.supportsNumericValue ? 8 : primary?.supportsValue ? 3 : 0;
  }
  if (preferred.priority && `${layout.label} ${layout.slot} ${layout.roles.join(' ')}`.toLowerCase().includes(preferred.priority)) {
    score += 3;
  }
  return score;
}

function normalizeContentShape(value) {
  if (!value || typeof value !== 'object') return null;
  const sourceRequired = value.required && typeof value.required === 'object' ? value.required : value;
  const sourcePreferred = value.preferred && typeof value.preferred === 'object' ? value.preferred : value;
  const number = (source, key) => {
    const parsed = Number(source[key]);
    return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : 0;
  };
  const legacyNumericItemCount = number(sourceRequired, 'numericItemCount');
  const valueItemCount = number(sourceRequired, 'valueItemCount') || legacyNumericItemCount;
  const rawNumericItemCount = number(sourceRequired, 'rawNumericItemCount')
    || (sourceRequired.valueItemCount == null ? legacyNumericItemCount : 0);
  const textualValueItemCount = number(sourceRequired, 'textualValueItemCount');
  const unitItemCount = number(sourceRequired, 'unitItemCount');
  const secondaryLabelItemCount = number(sourceRequired, 'secondaryLabelItemCount');
  const durationItemCount = number(sourceRequired, 'durationItemCount');
  const pageLabelItemCount = number(sourceRequired, 'pageLabelItemCount');
  const normalized = {
    deferred: value.deferred === true,
    required: {
      titleChars: number(sourceRequired, 'titleChars'),
      itemCount: number(sourceRequired, 'itemCount'),
      minItemCount: number(sourceRequired, 'minItemCount')
        || number(sourceRequired, 'itemCount'),
      numericItemCount: valueItemCount,
      valueItemCount,
      rawNumericItemCount,
      textualValueItemCount,
      unitItemCount,
      secondaryLabelItemCount,
      durationItemCount,
      pageLabelItemCount,
      nestedDepth: number(sourceRequired, 'nestedDepth'),
      requiresValue: Boolean(sourceRequired.requiresValue || valueItemCount),
    },
    preferred: {
      summaryChars: number(sourcePreferred, 'summaryChars'),
      takeawayChars: number(sourcePreferred, 'takeawayChars'),
      detailItemCount: number(sourcePreferred, 'detailItemCount')
        || (sourcePreferred.requiresDetail ? number(sourceRequired, 'itemCount') : 0),
      chartPointCount: number(sourcePreferred, 'chartPointCount'),
      priority: String(sourcePreferred.priority || '').trim().toLowerCase(),
    },
  };
  return [
    normalized.deferred,
    ...Object.values(normalized.required),
    ...Object.values(normalized.preferred),
  ].some(Boolean) ? normalized : null;
}

function layoutSupportsContentShape(layout, shape) {
  return buildTemplateProjectionPlan(layout, shape).requiredFits;
}

function layoutCapabilities(layout, shape = null) {
  const normalized = normalizeContentShape(shape);
  const text = layout.fillPlan?.text || [];
  const arrays = layout.fillPlan?.arrays || [];
  const titleMaxChars = maxFieldChars(text.filter(field => field.role === 'title'));
  const paragraphFields = text.filter(field => (
    field.role === 'body'
    || field.role === 'paragraph'
    || /summary|subtitle|lead|intro|description|caption|note|sub/i.test(field.key)
  ));
  const paragraphMaxChars = paragraphFields
    .map(field => Number(field.maxChars) || 0)
    .filter(Boolean)
    .sort((left, right) => right - left);
  const summaryMaxChars = Math.max(...paragraphMaxChars, 0);
  const takeawayMaxChars = summaryMaxChars;
  const primaryContentContainer = selectPrimaryContentContainer(layout, normalized);
  const itemCapacity = primaryContentContainer?.capacity || 0;
  const numericItemCapacity = primaryContentContainer?.numericCapacity || 0;
  const nestedDepth = arrays.reduce((max, field) => Math.max(max, arrayNestedDepth(field)), 0);
  const mediaCapacity = (layout.fillPlan?.media || []).reduce(
    (max, field) => Math.max(max, Number(field.maxCount || field.visibleCount || 0)),
    0,
  );
  return {
    titleMaxChars,
    summaryMaxChars,
    takeawayMaxChars,
    paragraphMaxChars,
    itemCapacity,
    numericItemCapacity,
    primaryContentContainer,
    nestedDepth,
    mediaCapacity,
  };
}

function maxFieldChars(fields) {
  return fields.reduce((max, field) => Math.max(max, Number(field.maxChars) || 0), 0);
}

function arrayCapacity(field) {
  return Number(field.maxCount || field.visibleCount || field.fixedLength || 0);
}

function arrayNestedDepth(field) {
  const nestedPaths = Object.keys(field.nestedArrays || {});
  if (nestedPaths.length) {
    return Math.max(...nestedPaths.map(pathName => (String(pathName).match(/\[\]/g) || []).length), 1);
  }
  return shapeArrayDepth(field.itemShape);
}

function shapeArrayDepth(value) {
  if (Array.isArray(value)) return 1 + shapeArrayDepth(value[0]);
  if (!value || typeof value !== 'object') return 0;
  return Object.values(value).reduce((max, child) => Math.max(max, shapeArrayDepth(child)), 0);
}

function arraySupportsPresentation(field) {
  if (field.itemShape === 'string') return true;
  if (!field.itemShape || typeof field.itemShape !== 'object' || Array.isArray(field.itemShape)) return false;
  const supported = new Set(presentationTargetEntries(field)
    .map(({ key, type }) => presentationFieldForTarget(key, type, field))
    .filter(Boolean));
  return supported.has('label');
}

function arraySupportsNumericItems(field) {
  if (!field.itemShape || typeof field.itemShape !== 'object' || Array.isArray(field.itemShape)) return false;
  return presentationTargetEntries(field).some(({ key, type }) => (
    ['value', 'displayValue'].includes(presentationFieldForTarget(key, type, field))
  ));
}

function scalarPresentationFieldForTarget(key, type) {
  const name = String(key || '').toLowerCase();
  if (/body|detail|description|desc|note|summary|sub|caption|copy|text/.test(name)) return 'detail';
  if (/value|amount|score|number|metric|stat|pct|percent|share|delta|rate|^v$/.test(name)) {
    return type === 'number' ? 'value' : 'displayValue';
  }
  if (/label|name|title|heading|category|series|item|dim|^k$|^t$/.test(name)) return 'label';
  if (/unit|suffix/.test(name)) return 'unit';
  return null;
}

function scalarFieldDescriptor(field) {
  const pathParts = String(field?.key || '').split('.');
  const segment = pathParts.at(-1) || '';
  const tokens = segment
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .match(/[A-Za-z]+|\d+/g) || [];
  const numericTokens = tokens.filter(token => /^\d+$/.test(token));
  if (numericTokens.length !== 1 || Number(numericTokens[0]) <= 0) return null;
  const indexToken = numericTokens[0];
  const wordTokens = tokens.filter(token => token !== indexToken);
  let semanticIndex = -1;
  let source = null;
  for (let index = wordTokens.length - 1; index >= 0; index -= 1) {
    const candidate = scalarPresentationFieldForTarget(wordTokens[index], field?.type);
    if (!candidate) continue;
    semanticIndex = index;
    source = candidate;
    break;
  }
  if (!source) return null;
  const familyTokens = wordTokens.filter((_, index) => index !== semanticIndex);
  const parent = pathParts.slice(0, -1).join('.');
  return {
    family: `${parent}:${familyTokens.join('-').toLowerCase() || 'root'}`,
    index: Number(indexToken),
    source,
    target: field.key,
    maxChars: Number(field.maxChars) || 0,
  };
}

function collectScalarContentContainers(layout, normalized) {
  const required = normalized?.required || EMPTY_REQUIRED_CONTENT_SHAPE;
  const preferred = normalized?.preferred || EMPTY_PREFERRED_CONTENT_SHAPE;
  const families = new Map();
  for (const field of layout.fillPlan?.text || []) {
    if (field?.type && !['string', 'number', 'boolean'].includes(field.type)) continue;
    const descriptor = scalarFieldDescriptor(field);
    if (!descriptor) continue;
    if (!families.has(descriptor.family)) families.set(descriptor.family, new Map());
    const slots = families.get(descriptor.family);
    if (!slots.has(descriptor.index)) slots.set(descriptor.index, {
      fields: {},
      budgets: {},
    });
    const slot = slots.get(descriptor.index);
    if (!slot.fields[descriptor.source]) {
      slot.fields[descriptor.source] = descriptor.target;
      slot.budgets[descriptor.source] = descriptor.maxChars;
    }
  }
  const containers = [];
  for (const [family, indexedSlots] of families) {
    const slots = [...indexedSlots.entries()]
      .sort(([left], [right]) => left - right)
      .map(([sourceIndex, slot]) => ({
        sourceIndex,
        fields: slot.fields,
        budgets: slot.budgets,
      }))
      .filter(slot => slot.fields.label);
    if (slots.length < 2) continue;
    const itemCount = required.itemCount
      ? Math.min(required.itemCount, slots.length)
      : slots.length;
    const activeSlots = slots.slice(0, itemCount);
    const numericValueCapacity = activeSlots.filter(slot => slot.fields.value).length;
    const inlineValueCapacity = activeSlots.filter(slot => slot.fields.label).length;
    const textualValueCapacity = activeSlots.filter(slot => (
      slot.fields.displayValue || slot.fields.label
    )).length;
    const valueCapacity = activeSlots.filter(slot => (
      slot.fields.value || slot.fields.displayValue || slot.fields.label
    )).length;
    const requiredValueCount = Math.min(
      required.valueItemCount
        || required.numericItemCount
        || (required.requiresValue ? itemCount : 0),
      itemCount,
    );
    const requiredTextualValueCount = Math.min(required.textualValueItemCount, itemCount);
    const requiredUnitCount = Math.min(required.unitItemCount, itemCount);
    const valueSlots = activeSlots.filter(slot => (
      slot.fields.value || slot.fields.displayValue
    )).length;
    const unitSlots = activeSlots.filter(slot => slot.fields.unit).length;
    const requiredFits = (!required.itemCount || slots.length >= (required.minItemCount || itemCount))
      && valueCapacity >= requiredValueCount
      && textualValueCapacity >= requiredTextualValueCount
      && requiredValueCount >= valueSlots
      && requiredUnitCount >= unitSlots;
    const slack = required.itemCount ? Math.max(0, slots.length - required.itemCount) : slots.length;
    const fields = new Set(slots.flatMap(slot => Object.keys(slot.fields)));
    const supportsDetail = fields.has('detail');
    const supportsNumericValue = fields.has('value');
    const supportsTextualValue = fields.has('displayValue');
    const supportsInlineValue = fields.has('label');
    const supportsValue = supportsNumericValue || supportsTextualValue || supportsInlineValue;
    containers.push({
      kind: 'scalar-group',
      key: `scalar:${family}`,
      role: supportsValue ? 'metric' : 'list-item',
      capacity: slots.length,
      fields: [...fields],
      supportsLabel: true,
      supportsValue,
      supportsNumericValue,
      supportsTextualValue,
      supportsInlineValue,
      supportsDetail,
      numericCapacity: valueCapacity,
      numericValueCapacity,
      textualValueCapacity,
      inlineValueCapacity,
      valueCapacity,
      slack,
      requiredFits,
      slots,
      targetPaths: slots.flatMap(slot => Object.values(slot.fields)),
      score: Number(requiredFits) * 100
        + Number(supportsDetail && preferred.detailItemCount) * 16
        + Number(supportsValue && requiredValueCount) * 8
        + Number(supportsTextualValue && required.textualValueItemCount) * 8
        + Math.max(0, 12 - slack),
    });
  }
  return containers;
}

function collectArrayContentContainers(layout, normalized) {
  const required = normalized?.required || EMPTY_REQUIRED_CONTENT_SHAPE;
  const preferred = normalized?.preferred || EMPTY_PREFERRED_CONTENT_SHAPE;
  return (layout.fillPlan?.arrays || [])
    .filter(field => arrayNestedDepth(field) === 0)
    .filter(field => !isPageChromeArray(field))
    .filter(arraySupportsPresentation)
    .map(field => {
      const capacity = arrayCapacity(field);
      const countBinding = field.countKey
        ? (layout.countBindings || []).find(item => (
            item?.key === field.countKey || item?.publicKey === field.countKey
          ))
        : null;
      const minimumCapacity = Number(countBinding?.min || 0);
      const mappedFields = field.itemShape === 'string'
        ? [{ key: field.key, type: 'string', semantic: 'label', source: 'label' }]
        : presentationTargetEntries(field)
          .map(({ key, type, decision }) => ({
            key,
            type,
            semantic: decision.semantic,
            source: presentationFieldForTarget(key, type, field),
          }))
          .filter(item => item.source);
      const supported = new Set(mappedFields.map(item => item.source));
      const numericTargetCount = mappedFields.filter(item => item.semantic === 'numericValue').length;
      const supportsNumericValue = numericTargetCount > 0;
      const supportsTextualValue = mappedFields.some(item => item.source === 'displayValue');
      const requiresUnit = mappedFields.some(item => item.source === 'unit');
      const requiresSecondaryLabel = mappedFields.some(item => item.source === 'secondaryLabel');
      const requiresDuration = mappedFields.some(item => item.source === 'duration');
      const requiresPageLabel = mappedFields.some(item => item.source === 'pageLabel');
      const supportsInlineValue = supported.has('label');
      const supportsValue = supportsNumericValue || supportsTextualValue || supportsInlineValue;
      const supportsDetail = supported.has('detail');
      const valueCapacity = supportsValue ? capacity : 0;
      const textualValueCapacity = supportsTextualValue || supportsInlineValue ? capacity : 0;
      const requiredValueCount = required.valueItemCount
        || required.numericItemCount
        || (required.requiresValue ? required.itemCount : 0);
      const containerRoleScore = primaryContainerRoleScore(field);
      const semanticFits = containerRoleScore > -24;
      const canSupplementWithCanonicalText = !supportsNumericValue
        && !supportsTextualValue
        && !requiresUnit
        && Boolean(preferred.summaryChars || preferred.takeawayChars);
      const projectedItemCount = required.itemCount
        ? Math.min(required.itemCount, capacity)
        : capacity;
      const effectiveProjectedItemCount = canSupplementWithCanonicalText
        ? Math.min(capacity, Math.max(projectedItemCount, minimumCapacity))
        : projectedItemCount;
      const minimumItemCount = required.minItemCount || required.itemCount;
      const projectedValueCount = Math.min(requiredValueCount, effectiveProjectedItemCount);
      const projectedTextualValueCount = Math.min(
        required.textualValueItemCount,
        effectiveProjectedItemCount,
      );
      const deferred = normalized?.deferred === true;
      const canonicalNumericTargetFits = deferred
        || !supportsNumericValue
        || required.rawNumericItemCount >= effectiveProjectedItemCount;
      const canonicalTextualValueTargetFits = deferred
        || !supportsTextualValue
        || required.valueItemCount >= effectiveProjectedItemCount;
      const canonicalUnitTargetFits = deferred
        || !requiresUnit
        || required.unitItemCount >= effectiveProjectedItemCount;
      const canonicalSecondaryLabelTargetFits = deferred
        || !requiresSecondaryLabel
        || required.secondaryLabelItemCount >= effectiveProjectedItemCount;
      const canonicalDurationTargetFits = deferred
        || !requiresDuration
        || required.durationItemCount >= effectiveProjectedItemCount;
      const canonicalPageLabelTargetFits = deferred
        || !requiresPageLabel
        || required.pageLabelItemCount >= effectiveProjectedItemCount;
      const requiredFits = semanticFits && (!required.itemCount || (
        capacity >= minimumItemCount
        && effectiveProjectedItemCount >= minimumCapacity
      ))
        && valueCapacity >= projectedValueCount
        && textualValueCapacity >= projectedTextualValueCount
        && canonicalNumericTargetFits
        && canonicalTextualValueTargetFits
        && canonicalUnitTargetFits
        && canonicalSecondaryLabelTargetFits
        && canonicalDurationTargetFits
        && canonicalPageLabelTargetFits;
      const slack = required.itemCount ? Math.max(0, capacity - projectedItemCount) : capacity;
      const shapeFieldCount = field.itemShape && typeof field.itemShape === 'object'
        && !Array.isArray(field.itemShape)
        ? Object.keys(field.itemShape).length
        : 1;
      const fieldCoverage = mappedFields.length / Math.max(1, shapeFieldCount);
      return {
        kind: 'array',
        key: field.key,
        role: field.role || 'misc',
        capacity,
        minimumCapacity,
        fields: [...supported],
        mappedFields,
        supportsLabel: supported.has('label'),
        supportsValue,
        supportsNumericValue,
        supportsTextualValue,
        supportsInlineValue,
        supportsDetail,
        numericCapacity: supportsNumericValue || supportsTextualValue ? capacity : 0,
        numericValueCapacity: supportsNumericValue ? capacity : 0,
        textualValueCapacity,
        inlineValueCapacity: supportsInlineValue ? capacity : 0,
        valueCapacity,
        fieldCoverage,
        containerRoleScore,
        semanticFits,
        slack,
        requiredFits,
        field,
        targetPaths: [field.key],
        score: Number(requiredFits) * 100
          + containerRoleScore
          + Math.round(fieldCoverage * 12)
          + Number(supportsDetail && preferred.detailItemCount) * 16
          + Number(supportsValue && requiredValueCount) * 8
          + Number(supportsTextualValue && required.textualValueItemCount) * 8
          + Math.max(0, 12 - slack),
      };
    })
    .filter(candidate => candidate.supportsLabel);
}

function primaryContainerRoleScore(field) {
  const role = String(field?.role || '').toLowerCase();
  const key = String(field?.key || '').toLowerCase();
  let score = 0;
  if (['metric', 'step', 'list-item', 'distribution', 'relationship', 'chapter'].includes(role)) score += 24;
  if (role === 'misc') score -= 4;
  if (/header|legend|tick|axis|categor|label|marker|caption|callout/.test(key)) score -= 32;
  if (/headline|segment|token|word|phrase|fragment/.test(key)) score -= 48;
  if (/rows|items|cards|steps|stages|events|data|metrics|companies|records|entries/.test(key)) score += 14;
  if (/sector/.test(key) && role === 'misc') score -= 18;
  return score;
}

function collectContentContainers(layout, normalized) {
  return [
    ...collectArrayContentContainers(layout, normalized),
    ...collectScalarContentContainers(layout, normalized),
  ];
}

export function selectPrimaryContentContainer(layout, shape = null) {
  const normalized = normalizeContentShape(shape);
  const candidates = collectContentContainers(layout, normalized)
    .sort((left, right) => (
      right.score - left.score
      || left.slack - right.slack
      || left.key.localeCompare(right.key)
    ));
  return candidates.find(candidate => candidate.requiredFits) || candidates[0] || null;
}

export function buildTemplateProjectionPlan(layout, shape = null) {
  const contentShape = normalizeContentShape(shape);
  const required = contentShape?.required || EMPTY_REQUIRED_CONTENT_SHAPE;
  const preferred = contentShape?.preferred || EMPTY_PREFERRED_CONTENT_SHAPE;
  const text = layout.fillPlan?.text || [];
  const contentContainers = collectContentContainers(layout, contentShape);
  const contentContainerTargets = new Set(
    contentContainers.flatMap(container => container.targetPaths || []),
  );
  const titleTarget = text
    .filter(field => !contentContainerTargets.has(field.key))
    .map(field => ({
      field,
      score: titleTargetScore(field),
    }))
    .filter(candidate => candidate.score > 0)
    .sort((left, right) => (
      right.score - left.score
      || (Number(right.field.maxChars) || 0) - (Number(left.field.maxChars) || 0)
      || left.field.key.localeCompare(right.field.key)
    ))[0]?.field || null;
  const paragraphs = text
    .filter(field => field.role === 'body' || field.role === 'paragraph')
    .sort((left, right) => (Number(right.maxChars) || 0) - (Number(left.maxChars) || 0));
  const primaryContentContainer = required.itemCount
    ? selectPrimaryContentContainer(layout, contentShape)
    : null;
  const primaryIdentity = primaryContentContainer
    ? `${primaryContentContainer.kind}:${primaryContentContainer.key}`
    : '';
  const knownContainerKeys = new Set(contentContainers.map(container => (
    `${container.kind}:${container.key}`
  )));
  const unclassifiedVisibleArrays = (layout.fillPlan?.arrays || [])
    .filter(field => arrayHasVisibleBusinessData(field))
    .filter(field => !knownContainerKeys.has(`array:${field.key}`))
    .map(field => ({
      kind: 'array',
      key: field.key,
      role: field.role || 'misc',
      field,
      targetPaths: [field.key],
    }));
  const auxiliaryContentContainers = [
    ...contentContainers.filter(container => (
      `${container.kind}:${container.key}` !== primaryIdentity
      && !canTreatScalarGroupAsCoverText(layout, container, required)
    )),
    ...unclassifiedVisibleArrays,
  ].filter(container => `${container.kind}:${container.key}` !== primaryIdentity)
    .map(container => ({
    ...container,
    auxiliaryStrategy: auxiliaryContainerStrategy(layout, container, {
      deferred: contentShape?.deferred === true,
    }),
  }));
  const unsupportedAuxiliaryContainers = auxiliaryContentContainers.filter(container => (
    !container.auxiliaryStrategy
  ));
  const nestedDepth = (layout.fillPlan?.arrays || [])
    .reduce((max, field) => Math.max(max, arrayNestedDepth(field)), 0);
  const requiredFits = (!required.titleChars || Number(titleTarget?.maxChars || 0) >= required.titleChars)
    && (!required.itemCount || (
      primaryContentContainer?.requiredFits
      && primaryContentContainer.capacity >= (required.minItemCount || required.itemCount)
    ))
    && (!required.nestedDepth || nestedDepth >= required.nestedDepth)
    && (!required.itemCount || unsupportedAuxiliaryContainers.length === 0);
  return {
    contentShape,
    requiredFits,
    titleTarget: titleTarget?.key || null,
    summaryTarget: preferred.summaryChars ? paragraphs[0]?.key || null : null,
    takeawayTarget: preferred.takeawayChars ? paragraphs[1]?.key || paragraphs[0]?.key || null : null,
    primaryContentContainer,
    reservedTargetPaths: contentContainers.flatMap(container => container.targetPaths || []),
    auxiliaryContentContainers,
    unsupportedAuxiliaryContainers,
  };
}

function isPageChromeArray(field) {
  const key = String(field?.key || '').toLowerCase().split('.').at(-1)?.replace(/\[\]$/g, '') || '';
  return /^(navitems?|breadcrumbs?|tabs?)$/.test(key);
}

function auxiliaryContainerStrategy(layout, container, { deferred = false } = {}) {
  if (container?.kind !== 'array') return null;
  if (isPageChromeArray(container.field)) return { type: 'navigation' };
  const countKey = container.field?.countKey;
  const binding = countKey
    ? (layout.countBindings || []).find(item => (
        item?.key === countKey || item?.publicKey === countKey
      ))
    : null;
  if (Number(binding?.min) === 0) {
    return { type: 'count', prop: countKey };
  }
  const key = String(container.key || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const toggle = (layout.controls || []).find(control => {
    if (control?.type !== 'toggle') return false;
    const publicKey = String(control.publicKey || control.key || '');
    const normalized = publicKey.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!normalized.startsWith('show')) return false;
    const subject = normalized.slice(4);
    return subject && (key.startsWith(subject) || subject.startsWith(key));
  });
  if (toggle) {
    return {
      type: 'toggle',
      prop: toggle.publicKey || toggle.key,
      min: Number.isFinite(Number(binding?.min)) ? Number(binding.min) : null,
      max: Number.isFinite(Number(binding?.max)) ? Number(binding.max) : null,
    };
  }
  if ((isCoverCandidate(layout.layout) || deferred)
    && arraySupportsCanonicalProjection(container.field, { allowNumeric: deferred })) {
    return {
      type: isCoverCandidate(layout.layout) ? 'cover-projection' : 'projection',
      prop: countKey || null,
      min: Number.isFinite(Number(binding?.min)) ? Number(binding.min) : null,
      max: Number.isFinite(Number(binding?.max)) ? Number(binding.max) : null,
    };
  }
  return null;
}

function arraySupportsCanonicalProjection(field, { allowNumeric = false } = {}) {
  if (!field || String(field.key || '').includes('[]') || arrayNestedDepth(field) > 0) {
    return false;
  }
  const contractTypes = Object.values(field.itemFields || {})
    .map(contract => contract?.type)
    .filter(Boolean);
  if (field.itemShape === 'string') {
    return contractTypes.every(type => type === 'string');
  }
  const types = [
    ...Object.values(field.itemShape || {}),
    ...contractTypes,
  ].filter(Boolean);
  return types.length > 0 && types.every(type => (
    type === 'string' || type === 'boolean' || (allowNumeric && type === 'number')
  ));
}

function arrayHasVisibleBusinessData(field) {
  const includesBusinessValue = value => {
    if (value === 'string' || value === 'number') return true;
    if (Array.isArray(value)) return value.some(includesBusinessValue);
    if (!value || typeof value !== 'object') return false;
    return Object.values(value).some(includesBusinessValue);
  };
  return includesBusinessValue(field?.itemShape);
}

function canTreatScalarGroupAsCoverText(layout, container, required) {
  if (required.itemCount !== 0
    || container.kind !== 'scalar-group'
    || !isCoverCandidate(layout.layout)) {
    return false;
  }
  return container.slots.every(slot => (
    Object.keys(slot.fields || {}).every(field => field === 'label' || field === 'detail')
  ));
}

function titleTargetScore(field) {
  const pathName = String(field.key || '').toLowerCase();
  const parts = pathName.split('.');
  const leafKey = parts.at(-1)?.replace(/\[\]$/g, '') || pathName;
  // Theme11's authored fields use semantic names such as headingHtml and
  // headlineHtml. Strip only that renderer suffix; do not promote arbitrary
  // nested *.title or generic root copy to page-title status.
  const semanticLeaf = leafKey.replace(/html$/, '');
  if (pathName.includes('[]')) return 0;
  const pageScoped = parts.length === 1 || (parts.length === 2 && parts[0] === 'copy');
  const role = String(field.role || '').toLowerCase();
  let nameScore = 0;
  if (/^(?:title|pagetitle|platetitle|decktitle|headline|heading|subject|topic)(?:line)?1?$/.test(semanticLeaf)) nameScore = 30;
  else if (/^title(?:top|cn|zh|main|primary|l1|line1|a)$/.test(semanticLeaf)) nameScore = 26;
  else if (/^title(?:bottom|en|sub|secondary|l2|line2|b)$/.test(semanticLeaf)) nameScore = 22;
  else if (/^title(?:l|line)?\d+$|^title[a-z]+$/.test(semanticLeaf)) nameScore = 18;
  if (role === 'title' && pageScoped && nameScore) return 200 + nameScore;
  if (role === 'title') return 170;
  if (pageScoped && nameScore) return 130 + nameScore;
  if (pageScoped && /^(?:slogan(?:line)?1?|statement|claim|quote)$/.test(semanticLeaf)) return 80;
  // Imported opaque themes expose their primary authored copy as copy.text001.
  // Restrict the fallback to that first structured slot rather than promoting
  // arbitrary copy.* or root fields (for example captions or axis labels).
  if (parts.length === 2 && parts[0] === 'copy' && /^text0*1$/.test(semanticLeaf)) return 72;
  return 0;
}

function layoutStructureFingerprint(layout, projectionPlan) {
  const primary = projectionPlan.primaryContentContainer;
  const label = `${layout.slot || ''} ${layout.label || ''} ${(layout.roles || []).join(' ')}`.toLowerCase();
  const mediaCapacity = (layout.fillPlan?.media || []).reduce(
    (max, field) => Math.max(max, Number(field.maxCount || field.visibleCount || 0)),
    0,
  );
  let family = 'editorial';
  if (/table|sheet|ranking|leaderboard|表|排行|清单/.test(label)) family = 'table';
  else if (/bubble|scatter|气泡|散点/.test(label)) family = 'bubble-chart';
  else if (/case|profile|spotlight|案例|档案|剖面/.test(label)) family = 'case-study';
  else if (/matrix|heat|score|quadrant|矩阵|热力|评分|象限/.test(label)) family = 'matrix';
  else if (/timeline|roadmap|process|path|step|sequence|时间|路线|流程|路径|阶段/.test(label)) family = 'sequence';
  else if (/compare|versus|delta|comparison|对比|竞品|差异/.test(label)) family = 'comparison';
  else if (/chart|trend|radar|donut|waterfall|curve|plot|图|趋势|雷达|瀑布|曲线/.test(label)) family = 'chart';
  else if (/hero|statement|manifesto|quote|封面|宣言|观点|主张/.test(label)) family = 'hero';
  else if (/card|grid|list|tile|卡|网格|列表/.test(label)) family = 'cards';
  else if (primary?.role === 'metric') family = 'metrics';
  else if ((primary?.capacity || 0) >= 3) family = 'cards';
  else if (mediaCapacity > 0) family = 'media';
  const valueMode = primary?.supportsNumericValue && primary?.supportsTextualValue
    ? 'numeric+formatted'
    : primary?.supportsTextualValue
      ? 'formatted'
      : primary?.supportsNumericValue
        ? 'numeric'
        : primary?.supportsInlineValue
          ? 'inline'
        : 'text';
  const capacity = Number(primary?.capacity || 0);
  return {
    family,
    compositionType: family,
    primaryRole: primary?.role || 'none',
    primaryKind: primary?.kind || 'none',
    primaryShape: primary
      ? `${primary.kind}:${primary.supportsValue ? 'value' : 'text'}:${primary.supportsDetail ? 'detail' : 'compact'}:${primary.capacity}`
      : 'none',
    valueMode,
    capacityBand: capacity >= 8 ? 'dense' : capacity >= 5 ? 'wide' : capacity >= 3 ? 'standard' : 'compact',
    mediaMode: mediaCapacity > 0 ? 'media' : 'none',
  };
}

function scoreExpressionFit(fingerprint, role, priority) {
  const family = fingerprint?.family || 'editorial';
  const intents = [role, priority].map(value => String(value || '').toLowerCase()).filter(Boolean);
  if (!intents.length) return 0;
  const preferredFamilies = new Set();
  for (const intent of intents) {
    if (['comparison', 'risks'].includes(intent)) {
      ['comparison', 'matrix', 'table', 'bubble-chart'].forEach(item => preferredFamilies.add(item));
    } else if (['process', 'actions', 'trend'].includes(intent)) {
      ['sequence', 'table', 'cards'].forEach(item => preferredFamilies.add(item));
    } else if (['metrics', 'distribution', 'relationship'].includes(intent)) {
      ['metrics', 'chart', 'bubble-chart', 'table', 'matrix'].forEach(item => preferredFamilies.add(item));
    } else if (['breakdown', 'context'].includes(intent)) {
      ['cards', 'table', 'editorial', 'case-study'].forEach(item => preferredFamilies.add(item));
    } else if (['statement', 'result', 'closing', 'observation'].includes(intent)) {
      ['hero', 'editorial', 'case-study'].forEach(item => preferredFamilies.add(item));
    } else if (intent === 'case') {
      ['case-study', 'media', 'cards'].forEach(item => preferredFamilies.add(item));
    }
  }
  return preferredFamilies.has(family) ? 12 : 0;
}

function capacityFitScore(capacity, required, weight) {
  if (!required || capacity < required) return 0;
  const excess = Math.max(0, capacity - required);
  return Math.max(1, weight - Math.min(Math.floor(weight / 2), excess));
}

function getRequestedMediaCount({ plannedImages, providedImages, providedMedia, imageGen, needsVisual, mediaCount }) {
  const explicit = Number(mediaCount);
  if (Number.isFinite(explicit) && explicit > 0) return Math.round(explicit);
  const provided = mediaIntentCount(providedImages) || mediaIntentCount(providedMedia);
  if (provided) return provided;
  const planned = mediaIntentCount(plannedImages);
  if (planned) return planned;
  if (imageGen || needsVisual) return 1;
  return 0;
}

function mediaIntentCount(value) {
  if (Array.isArray(value)) return value.length;
  if (value === true) return 1;
  const number = Number(value);
  if (Number.isFinite(number) && number > 0) return Math.round(number);
  return 0;
}
