export const BESPOKE_SCHEMA_VERSION = 2;
export const TEMPLATE_VARIANT_COUNT = 3;
export const TOTAL_VARIANT_COUNT = 4;

const TEMPLATE_KIND = 'template';
const BESPOKE_KIND = 'bespoke';
const UNSAFE_KEYS = new Set(['__proto__', 'prototype', 'constructor']);
const FORBIDDEN_COMPOSITION_KEYS = new Set(['html', 'jsx', 'style', 'classname', 'controls']);
const PATH_PATTERN = /^[A-Za-z_$][A-Za-z0-9_$-]*(?:\[(?:0|[1-9]\d*)\]|\.[A-Za-z_$][A-Za-z0-9_$-]*)*$/;
const PATH_TOKEN_PATTERN = /([A-Za-z_$][A-Za-z0-9_$-]*)|\[(\d+)\]/g;
const MAX_PATH_INDEX = 9999;

const BACKGROUNDS = new Set(['default', 'surface', 'muted', 'accent', 'dark', 'light']);
const ELEMENT_TYPES = new Set(['text', 'metric', 'list', 'quote', 'media', 'shape', 'chart']);
const ELEMENT_TONES = new Set(['default', 'muted', 'accent', 'positive', 'warning', 'critical', 'inverse']);
const TEXT_ROLES = new Set(['kicker', 'title', 'subtitle', 'body', 'caption', 'label']);
const TEXT_ALIGNS = new Set(['left', 'center', 'right']);
const MEDIA_FITS = new Set(['cover', 'contain']);
const SHAPES = new Set(['rect', 'circle', 'line', 'panel']);
const CHART_TYPES = new Set(['bar', 'line', 'donut', 'progress']);

export function chartTypeAllowsNegativeValues(chartType) {
  return chartType === 'bar' || chartType === 'line';
}

export function isValidBespokeChartValue(chartType, value) {
  return typeof value === 'number'
    && Number.isFinite(value)
    && (chartTypeAllowsNegativeValues(chartType) || value >= 0);
}

const REQUIRED_DESIGN_INTENT_FIELDS = ['objective', 'audience', 'narrativeRole', 'emphasis', 'rationale'];
const OPTIONAL_DESIGN_INTENT_FIELDS = ['compositionFamily'];
const DESIGN_INTENT_FIELDS = [...REQUIRED_DESIGN_INTENT_FIELDS, ...OPTIONAL_DESIGN_INTENT_FIELDS];
const COMPOSITION_FAMILIES = new Set([
  'hero',
  'split',
  'metric-spotlight',
  'chart-led',
  'timeline',
  'matrix',
  'editorial',
  'comparison',
  'process',
]);
const GRID_FIELDS = ['column', 'row', 'width', 'height'];
const COMMON_ELEMENT_FIELDS = new Set(['id', 'type', 'grid', 'tone']);
const ELEMENT_FIELDS = {
  text: new Set([...COMMON_ELEMENT_FIELDS, 'text', 'role', 'align']),
  metric: new Set([...COMMON_ELEMENT_FIELDS, 'value', 'unit', 'label', 'detail', 'trend']),
  list: new Set([...COMMON_ELEMENT_FIELDS, 'items', 'ordered']),
  quote: new Set([...COMMON_ELEMENT_FIELDS, 'quote', 'attribution']),
  media: new Set([...COMMON_ELEMENT_FIELDS, 'src', 'alt', 'fit']),
  shape: new Set([...COMMON_ELEMENT_FIELDS, 'shape']),
  chart: new Set([...COMMON_ELEMENT_FIELDS, 'chartType', 'data', 'showValues']),
};

export function getVariantKind(variant) {
  if (!variant || typeof variant !== 'object' || Array.isArray(variant)) return null;
  if (variant.kind === TEMPLATE_KIND || variant.kind === BESPOKE_KIND) return variant.kind;
  if (variant.kind != null) return null;
  return typeof (variant.layout || variant.layoutName) === 'string'
    && String(variant.layout || variant.layoutName).trim()
    ? TEMPLATE_KIND
    : null;
}

export function isTemplateVariant(variant) {
  return getVariantKind(variant) === TEMPLATE_KIND;
}

export function isBespokeVariant(variant) {
  return getVariantKind(variant) === BESPOKE_KIND;
}

export function isExpandedVariantSlide(slide, schemaVersion = BESPOKE_SCHEMA_VERSION) {
  if (Number(schemaVersion) !== BESPOKE_SCHEMA_VERSION) return false;
  const variants = slide?.variants;
  if (!Array.isArray(variants) || variants.length !== TOTAL_VARIANT_COUNT) return false;
  return variants
    .slice(0, TEMPLATE_VARIANT_COUNT)
    .every(variant => variant?.kind === TEMPLATE_KIND)
    && variants[TEMPLATE_VARIANT_COUNT]?.kind === BESPOKE_KIND;
}

export function validateContentMap(contentMap, content) {
  const errors = [];
  if (contentMap == null) return errors;
  if (!isPlainRecord(contentMap)) {
    return ['contentMap: expected an object of target path -> content path'];
  }

  let safeContent = content;
  if (content !== undefined) {
    try {
      safeContent = safeDeepClone(content, 'content');
    } catch (error) {
      errors.push(error.message);
      safeContent = undefined;
    }
  }

  for (const [targetPath, sourceMapping] of Object.entries(contentMap)) {
    const targetTokens = parseMappedPath(targetPath, `contentMap target "${targetPath}"`, errors);
    const sourcePath = typeof sourceMapping === 'string'
      ? sourceMapping
      : sourceMapping?.source;
    if (typeof sourcePath !== 'string' || !sourcePath.trim()) {
      errors.push(`contentMap target "${targetPath}": source path must be a non-empty string`);
      continue;
    }
    const sourceTokens = parseMappedPath(sourcePath, `contentMap source "${sourcePath}"`, errors);
    if (!targetTokens || !sourceTokens || safeContent === undefined) continue;
    if (!readPath(safeContent, sourceTokens).found) {
      errors.push(`contentMap target "${targetPath}": missing source path "${sourcePath}"`);
    }
  }
  return errors;
}

export function resolveContentMap(content, contentMap, base = {}) {
  const errors = validateContentMap(contentMap, content);
  if (errors.length) throw new Error(errors.join('\n'));
  const safeContent = safeDeepClone(content ?? {}, 'content');
  const resolved = safeDeepClone(base ?? {}, 'contentMap base');
  if (!isPlainRecord(resolved)) {
    throw new Error('contentMap base: expected an object');
  }

  for (const [targetPath, sourceMapping] of Object.entries(contentMap || {})) {
    const sourcePath = typeof sourceMapping === 'string'
      ? sourceMapping
      : sourceMapping.source;
    const targetTokens = parsePath(targetPath);
    const sourceTokens = parsePath(sourcePath);
    const source = readPath(safeContent, sourceTokens);
    if (!source.found) {
      throw new Error(`contentMap target "${targetPath}": missing source path "${sourcePath}"`);
    }
    const projectedValue = typeof sourceMapping === 'string'
      ? source.value
      : projectContentMapValue(source.value, sourceMapping);
    const value = projectedValue === undefined
      && typeof sourceMapping === 'object'
      && Object.prototype.hasOwnProperty.call(sourceMapping, 'fallback')
      ? sourceMapping.fallback
      : projectedValue;
    writePath(resolved, targetTokens, safeDeepClone(value, `content.${sourcePath}`), targetPath);
  }
  return resolved;
}

function projectContentMapValue(value, mapping) {
  const limit = Number.isFinite(Number(mapping.limit)) && Number(mapping.limit) >= 0
    ? Math.floor(Number(mapping.limit))
    : null;
  const group = Number.isFinite(Number(mapping.group)) && Number(mapping.group) > 0
    ? Math.floor(Number(mapping.group))
    : null;
  const offset = Number.isFinite(Number(mapping.offset)) && Number(mapping.offset) >= 0
    ? Math.floor(Number(mapping.offset))
    : 0;
  const at = Number.isFinite(Number(mapping.at)) && Number(mapping.at) >= 0
    ? Math.floor(Number(mapping.at))
    : null;
  let projectedValue = deriveContentMapValue(value, mapping);
  projectedValue = filterContentMapValue(projectedValue, mapping.filter);
  if (group != null && Array.isArray(projectedValue)) {
    projectedValue = condenseContentItems(projectedValue, group);
  }
  if (offset && Array.isArray(projectedValue)) projectedValue = projectedValue.slice(offset);
  if (at != null && Array.isArray(projectedValue)) projectedValue = projectedValue[at];
  if (mapping.select) {
    const tokens = parsePath(mapping.select);
    const selected = Array.isArray(projectedValue)
      ? projectedValue.map(item => readPath(item, tokens).value)
      : readPath(projectedValue, tokens).value;
    return limit != null && Array.isArray(selected) ? selected.slice(0, limit) : selected;
  }
  if (!isPlainRecord(mapping.fields)) {
    return limit != null && Array.isArray(projectedValue)
      ? projectedValue.slice(0, limit)
      : projectedValue;
  }
  const project = item => Object.fromEntries(
    Object.entries(mapping.fields).map(([target, source]) => [
      target,
      readPath(item, parsePath(source)).value,
    ]),
  );
  const projected = Array.isArray(projectedValue)
    ? projectedValue.map(project)
    : project(projectedValue);
  return limit != null && Array.isArray(projected) ? projected.slice(0, limit) : projected;
}

function deriveContentMapValue(value, mapping) {
  if (!mapping.derive) return value;
  if (mapping.derive === 'template-items') return deriveTemplateItems(value, mapping);
  if (mapping.derive === 'cover-decoration-labels') {
    const maxChars = Math.max(0, Number(mapping.maxChars) || 0);
    return [
      ...(Array.isArray(value?.coverLabels) ? value.coverLabels : []),
      value?.titleShort,
      value?.title,
      value?.summaryShort,
      value?.takeaway,
      value?.summary,
    ]
      .filter(hasMappedValue)
      .map(String)
      .map(label => (maxChars ? truncateProjectionText(label, maxChars) : label))
      .filter(hasMappedValue)
      .filter((label, index, labels) => labels.indexOf(label) === index);
  }
  if (mapping.derive === 'navigation-labels') {
    return [
      value?.titleShort,
      value?.title,
      value?.summaryShort,
    ].filter(hasMappedValue).map(String);
  }
  if (mapping.derive === 'supporting-summary') return deriveSupportingSummary(value);
  if (mapping.derive === 'projection-text') return deriveProjectionText(value, mapping);
  throw new Error(`contentMap derive: unsupported projection "${mapping.derive}"`);
}

function filterContentMapValue(value, filter) {
  if (!filter || !Array.isArray(value)) return value;
  if (filter === 'value-bearing') {
    return value.filter(item => (
      typeof item?.chartValue === 'number' && Number.isFinite(item.chartValue)
    ));
  }
  if (filter === 'chart-facts') {
    return value.filter(item => item?.chartFact === true);
  }
  if (filter === 'supporting') {
    return value.filter(item => (
      item?.required !== true
      && item?.chartFact !== true
      && !isProjectionValueItem(item)
    ));
  }
  throw new Error(`contentMap filter: unsupported projection "${filter}"`);
}

export function deriveTemplateItems(presentation = {}, options = {}) {
  const authoredItems = options?.textFallbackOnly === true
    ? []
    : Array.isArray(presentation?.items)
    ? presentation.items.map(normalizeProjectionItem)
    : [];
  const merged = authoredItems.map(item => ({ ...item }));
  const authoredById = new Map(
    merged
      .map((item, index) => [String(item?.id || '').trim(), index])
      .filter(([id]) => id),
  );
  for (const datum of options?.textFallbackOnly === true
    ? []
    : selectChartProjectionData(presentation?.chartData)) {
    const id = String(datum?.id || '').trim();
    const existingIndex = id ? authoredById.get(id) : null;
    const projection = normalizeProjectionItem({
      ...(existingIndex == null ? {} : merged[existingIndex]),
      ...datum,
      id: id || `chart-${Number(datum?.sourceIndex || 0) + 1}`,
      label: String(datum?.label || ''),
      detail: existingIndex == null ? String(datum?.detail || '') : merged[existingIndex]?.detail,
      value: datum?.value,
      displayValue: datum?.displayValue,
      unit: datum?.unit,
      required: Boolean(datum?.projectionRequired || datum?.required || merged[existingIndex]?.required),
      priority: datum?.priority ?? merged[existingIndex]?.priority
        ?? (datum?.projectionRequired ? 'high' : ''),
      focus: Boolean(datum?.focus || merged[existingIndex]?.focus),
      chartFact: true,
      chartValue: Number(datum?.value),
      chartUnit: datum?.chartUnit || chartUnitIdentity(datum),
    });
    if (existingIndex != null) {
      merged[existingIndex] = projection;
    } else {
      authoredById.set(projection.id, merged.length);
      merged.push(projection);
    }
  }
  if (options?.includeTextFallback === true
    && (!merged.length || options?.supplementTextFallback === true)) {
    const existingLabels = new Set(merged.map(item => String(item?.label || '')).filter(Boolean));
    const fallbackValues = [
      ...(Array.isArray(presentation?.coverLabels) ? presentation.coverLabels : []),
      presentation?.titleShort,
      presentation?.title,
      presentation?.summaryShort,
      presentation?.summary,
      presentation?.takeaway,
    ]
      .filter(hasMappedValue)
      .map(String)
      .filter(value => !existingLabels.has(value))
      .filter((value, index, values) => values.indexOf(value) === index);
    const authoredCoverLabels = Array.isArray(presentation?.coverLabels)
      ? presentation.coverLabels.filter(hasMappedValue).map(String)
      : [];
    const narrativeFallbackValues = [
      presentation?.titleShort,
      presentation?.title,
      presentation?.summaryShort,
      presentation?.summary,
      presentation?.takeaway,
    ]
      .filter(hasMappedValue)
      .map(String)
      .filter((value, index, values) => values.indexOf(value) === index);
    const fallbackStart = merged.length;
    fallbackValues.slice(0, Math.max(0, 8 - fallbackStart)).forEach((label, index) => {
      const coverIndex = authoredCoverLabels.indexOf(label);
      const secondaryLabel = authoredCoverLabels.length > 1
        ? authoredCoverLabels[
            ((coverIndex >= 0 ? coverIndex : index) + 1) % authoredCoverLabels.length
          ]
        : (coverIndex < 0 ? authoredCoverLabels[0] || '' : '');
      const detail = narrativeFallbackValues[index % narrativeFallbackValues.length]
        || fallbackValues.find(value => value !== label && value !== secondaryLabel)
        || '';
      const coverValue = authoredCoverLabels.includes(label)
        ? projectionValueFromCoverLabel(label)
        : null;
      merged.push(normalizeProjectionItem({
        id: `text-${fallbackStart + index + 1}`,
        label: coverValue?.label || label,
        ...(secondaryLabel ? { secondaryLabel } : {}),
        detail: detail === label ? '' : detail,
        ...(coverValue ? { displayValue: coverValue.displayValue } : {}),
        focus: index === 0,
      }));
    });
  }
  return merged.map((item, index) => withProjectionAliases(item, index));
}

function projectionValueFromCoverLabel(value) {
  const match = String(value || '').trim().match(
    /^([+-]?\d+(?:[.,]\d+)?(?:%|[KMBT]|万|亿)?)(?:(?:\s+|[·|/]\s*)(.*))?$/i,
  );
  if (!match) return null;
  return {
    displayValue: match[1],
    label: String(match[2] || match[1]).trim(),
  };
}

function withProjectionAliases(item, index) {
  const label = String(item?.label || '');
  const detail = String(item?.detail || '');
  const secondaryLabel = String(item?.secondaryLabel || '');
  const duration = String(item?.duration || '');
  const displayValue = String(item?.displayValue || '');
  const unit = String(item?.unit || '');
  const pageLabel = String(item?.pageLabel || '');
  const ordinalNumber = index + 1;
  const ordinal = String(ordinalNumber);
  return {
    ...item,
    projectionOrdinal: ordinal,
    projectionOrdinalNumber: ordinalNumber,
    projectionLabel: [ordinal, label].filter(hasMappedValue).join('. '),
    projectionDetail: [label, detail].filter(hasMappedValue).join('：') || label || ordinal,
    projectionValue: displayValue,
    projectionUnit: unit,
    projectionTag: [label, displayValue].filter(hasMappedValue).join(' · ') || label || ordinal,
    projectionSecondaryLabel: secondaryLabel,
    projectionDuration: duration,
    projectionPageLabel: pageLabel,
    projectionInitial: label.trim().slice(0, 1),
  };
}

export function deriveSupportingSummary(presentation = {}) {
  const supporting = deriveTemplateItems(presentation)
    .filter(item => item?.required !== true && item?.chartFact !== true && !isProjectionValueItem(item))
    .map(item => item?.labelWithSupporting || item?.labelWithValueAndSupporting || item?.label)
    .filter(hasMappedValue)
    .map(String);
  if (supporting.length) return [...new Set(supporting)].join('；');
  return [presentation?.summaryShort, presentation?.takeaway, presentation?.summary]
    .find(hasMappedValue) || '';
}

export function deriveProjectionText(presentation = {}, mapping = {}) {
  const preferred = Array.isArray(mapping.preferred) ? mapping.preferred : [];
  const direct = preferred.map(pathName => readPath(
    presentation,
    parsePath(String(pathName || 'titleShort')),
  ).value);
  const itemText = deriveTemplateItems(presentation).flatMap(item => [
    item?.labelWithValueAndSupporting,
    item?.labelWithSupporting,
    item?.labelWithValue,
    item?.label,
    item?.detail,
  ]);
  const candidates = [
    ...direct,
    presentation?.titleShort,
    presentation?.title,
    presentation?.summaryShort,
    presentation?.summary,
    presentation?.takeaway,
    ...(Array.isArray(presentation?.coverLabels) ? presentation.coverLabels : []),
    deriveSupportingSummary(presentation),
    ...itemText,
  ]
    .filter(hasMappedValue)
    .map(String)
    .filter((value, index, values) => values.indexOf(value) === index);
  const maxChars = Number(mapping.maxChars || 0);
  const fitting = maxChars
    ? candidates.filter(value => projectionCharLength(value) <= maxChars)
    : candidates;
  const projected = fitting.length
    ? fitting
    : mapping.truncate === true && maxChars
      ? candidates
        .map(value => truncateProjectionText(value, maxChars))
        .filter(hasMappedValue)
        .filter((value, candidateIndex, values) => values.indexOf(value) === candidateIndex)
      : [];
  if (!projected.length) return '';
  const index = Math.max(0, Math.floor(Number(mapping.index) || 0));
  return projected[index % projected.length];
}

function truncateProjectionText(value, maxChars) {
  let width = 0;
  let output = '';
  for (const ch of String(value ?? '')) {
    const next = projectionCharLength(ch);
    if (width + next > maxChars) break;
    output += ch;
    width += next;
  }
  return output.trim();
}

function projectionCharLength(value) {
  let width = 0;
  for (const ch of String(value ?? '')) {
    const code = ch.codePointAt(0);
    const fullWidth = (code >= 0x1100 && code <= 0x115f)
      || (code >= 0x2e80 && code <= 0xa4cf)
      || (code >= 0xac00 && code <= 0xd7a3)
      || (code >= 0xf900 && code <= 0xfaff)
      || (code >= 0xfe30 && code <= 0xfe4f)
      || (code >= 0xff00 && code <= 0xff60)
      || (code >= 0xffe0 && code <= 0xffe6)
      || (code >= 0x3000 && code <= 0x303e)
      || (code >= 0x20000 && code <= 0x3fffd);
    width += fullWidth ? 1 : 0.5;
  }
  return Math.ceil(width);
}

function firstMappedString(...values) {
  const value = values.find(hasMappedValue);
  return value === undefined ? '' : String(value);
}

function normalizeProjectionItem(item = {}) {
  const label = hasMappedValue(item?.label) ? String(item.label) : '';
  const detail = hasMappedValue(item?.detail) ? String(item.detail) : '';
  const secondaryLabel = firstMappedString(
    item?.secondaryLabel,
    item?.englishLabel,
    item?.english,
    item?.en,
    item?.subtitle,
  );
  const duration = firstMappedString(item?.duration, item?.durationLabel);
  const pageLabel = firstMappedString(item?.pageLabel, item?.pageNumber);
  const unit = hasMappedValue(item?.unit) ? String(item.unit) : '';
  const displayValue = formatValueWithUnit(
    item?.value,
    unit,
    item?.displayValue ?? item?.valueText ?? '',
  );
  const chartValue = Number.isFinite(Number(item?.chartValue))
    ? Number(item.chartValue)
    : normalizedChartValue({ ...item, displayValue });
  const chartUnit = chartValue == null
    ? null
    : item?.chartUnit || chartUnitIdentity({ ...item, displayValue });
  const labelWithValue = [displayValue, label].filter(hasMappedValue).join(' · ');
  return {
    ...item,
    label,
    detail,
    secondaryLabel,
    duration,
    pageLabel,
    unit,
    emptyText: '',
    focus: Boolean(item?.focus),
    displayValue,
    valueText: displayValue,
    labelWithValue,
    labelWithSupporting: [label, detail].filter(hasMappedValue).join('：'),
    labelWithValueAndSupporting: [labelWithValue || label, detail]
      .filter(hasMappedValue)
      .join('｜'),
    ...(chartValue == null ? {} : { chartValue }),
    ...(chartUnit == null ? {} : { chartUnit }),
  };
}

function selectChartProjectionData(chartData) {
  if (!Array.isArray(chartData) || !chartData.length) return [];
  const indexed = chartData
    .map((item, index) => ({ ...item, sourceIndex: index }))
    .filter(item => Number.isFinite(Number(item?.value)) && hasMappedValue(item?.label));
  const prioritized = [...indexed].sort((left, right) => (
    projectionPriorityScore(right, right.sourceIndex)
    - projectionPriorityScore(left, left.sourceIndex)
    || left.sourceIndex - right.sourceIndex
  ));
  const guaranteedIndex = prioritized.find(isHighPriorityProjectionItem)?.sourceIndex
    ?? indexed[0]?.sourceIndex;
  if (indexed.length <= 4) {
    return indexed.map(item => ({
      ...item,
      projectionRequired: item.sourceIndex === guaranteedIndex,
    }));
  }
  const selected = new Set();
  for (const item of prioritized) {
    if (!isHighPriorityProjectionItem(item)) continue;
    selected.add(item.sourceIndex);
    if (selected.size >= 4) break;
  }
  const byValue = [...indexed].sort((left, right) => (
    Number(left.value) - Number(right.value) || left.sourceIndex - right.sourceIndex
  ));
  for (const index of [
    0,
    indexed.length - 1,
    byValue[0]?.sourceIndex,
    byValue.at(-1)?.sourceIndex,
  ]) {
    if (Number.isInteger(index)) selected.add(index);
    if (selected.size >= 4) break;
  }
  for (let index = 0; selected.size < 4 && index < indexed.length; index += 1) {
    selected.add(index);
  }
  return indexed
    .filter(item => selected.has(item.sourceIndex))
    .map(item => ({
      ...item,
      projectionRequired: item.sourceIndex === guaranteedIndex,
    }));
}

export function condenseContentItems(items, targetCount) {
  if (!Array.isArray(items) || items.length < 2) return items;
  const count = Math.max(1, Math.min(items.length, Math.floor(Number(targetCount) || items.length)));
  if (count >= items.length) return items;
  const pinned = [];
  const supporting = [];
  items.forEach((item, index) => {
    const entry = { item, index };
    if (isPinnedProjectionItem(item)) pinned.push(entry);
    else supporting.push(entry);
  });
  if (pinned.length > count) {
    const selected = [...pinned, ...supporting]
      .sort((left, right) => (
        projectionPriorityScore(right.item, right.index)
        - projectionPriorityScore(left.item, left.index)
        || left.index - right.index
      ))
      .slice(0, count);
    const selectedIndexes = new Set(selected.map(entry => entry.index));
    const overflow = [...pinned, ...supporting].filter(entry => !selectedIndexes.has(entry.index));
    return attachSupportingItems(selected, overflow);
  }
  if (supporting.length && pinned.length === count) {
    return attachSupportingItems(pinned, supporting);
  }
  const supportingSlots = count - pinned.length;
  const groupedSupporting = Array.from({ length: supportingSlots }, (_, index) => {
    const start = Math.floor(index * supporting.length / supportingSlots);
    const end = Math.floor((index + 1) * supporting.length / supportingSlots);
    const entries = supporting.slice(start, Math.max(start + 1, end));
    const group = entries.map(entry => entry.item);
    const first = group[0] && typeof group[0] === 'object' ? group[0] : {};
    const join = (key, separator = ' / ') => [...new Set(
      group.map(item => item?.[key]).filter(hasMappedValue).map(String),
    )].join(separator);
    const label = join('label');
    const displayValue = join('displayValue');
    const labelWithValue = group.map(item => (
      hasMappedValue(item?.labelWithValue)
        ? String(item.labelWithValue)
        : [item?.displayValue, item?.label].filter(hasMappedValue).join(' · ')
    )).filter(Boolean).join(' / ');
    const detail = join('detail', '；');
    const supportingText = group.map(projectionItemSummary).filter(Boolean).join('；');
    const merged = {
      ...first,
      id: join('id', '+'),
      label,
      detail,
      displayValue,
      valueText: join('valueText'),
      labelWithValue: labelWithValue || label,
      supportingText,
      labelWithSupporting: supportingText || label,
      labelWithValueAndSupporting: [labelWithValue || label, detail]
        .filter(hasMappedValue)
        .join('｜'),
      hasCondensedSupporting: group.length > 1,
      unit: join('unit'),
      emptyText: '',
      focus: group.some(item => Boolean(item?.focus)),
      chartFact: group.some(item => item?.chartFact === true),
    };
    return {
      item: {
        ...merged,
        required: group.some(item => item?.required === true),
      },
      index: entries[0]?.index ?? items.length,
    };
  });
  return [
    ...pinned,
    ...groupedSupporting,
  ].sort((left, right) => left.index - right.index)
    .map(entry => entry.item);
}

function attachSupportingItems(selectedEntries, overflowEntries) {
  const selected = [...selectedEntries].sort((left, right) => left.index - right.index);
  if (!overflowEntries.length) return selected.map(entry => entry.item);
  return selected.map((entry, index) => {
    const start = Math.floor(index * overflowEntries.length / selected.length);
    const end = Math.floor((index + 1) * overflowEntries.length / selected.length);
    const assigned = overflowEntries.slice(start, end).map(item => item.item);
    if (!assigned.length) return entry.item;
    const supportingText = assigned.map(projectionItemSummary).filter(Boolean).join('；');
    const label = String(entry.item?.label || '');
    const labelWithValue = String(entry.item?.labelWithValue || label);
    return {
      ...entry.item,
      detail: [entry.item?.detail, supportingText].filter(hasMappedValue).join('；'),
      supportingText,
      labelWithSupporting: [label, supportingText].filter(hasMappedValue).join('｜'),
      labelWithValueAndSupporting: [labelWithValue, supportingText]
        .filter(hasMappedValue)
        .join('｜'),
      hasCondensedSupporting: true,
    };
  });
}

function projectionItemSummary(item) {
  return [item?.labelWithValue || item?.label, item?.detail]
    .filter(hasMappedValue)
    .join('：');
}

function isPinnedProjectionItem(item) {
  return item?.required === true
    || item?.chartFact === true
    || isHighPriorityProjectionItem(item)
    || isProjectionValueItem(item);
}

function isProjectionValueItem(item) {
  return hasMappedValue(item?.value)
    || hasMappedValue(item?.displayValue)
    || (typeof item?.chartValue === 'number' && Number.isFinite(item.chartValue));
}

function isHighPriorityProjectionItem(item) {
  if (item?.focus === true) return true;
  const value = item?.priority;
  if (typeof value === 'number' && Number.isFinite(value)) return value <= 2;
  return ['high', 'highest', 'critical', 'required', 'primary', 'p0', 'p1']
    .includes(String(value || '').trim().toLowerCase());
}

function projectionPriorityScore(item, index = 0) {
  const priority = item?.priority;
  const numericPriority = typeof priority === 'number' && Number.isFinite(priority)
    ? Math.max(0, 1000 - priority * 100)
    : 0;
  const namedPriority = isHighPriorityProjectionItem(item) ? 900 : 0;
  return Number(item?.chartFact === true) * 3500
    + Number(item?.required === true) * 7000
    + numericPriority
    + namedPriority
    + Number(item?.focus === true) * 500
    + Number(isProjectionValueItem(item)) * 300
    - index / 10000;
}

function hasMappedValue(value) {
  return value !== undefined && value !== null && value !== '';
}

const VALUE_SCALES = new Map([
  ['k', 1e3],
  ['m', 1e6],
  ['b', 1e9],
  ['t', 1e12],
  ['万', 1e4],
  ['亿', 1e8],
]);

export function formatValueWithUnit(value, unit = '', displayValue = '') {
  if (hasMappedValue(displayValue)) return String(displayValue);
  if (!hasMappedValue(value)) return '';
  const text = String(value);
  const normalizedUnit = String(unit || '').trim();
  if (!normalizedUnit) return text;
  const trimmedText = text.trim();
  const escapedUnit = normalizedUnit.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (/^[¥$€£]$/.test(normalizedUnit)) {
    return new RegExp(`^${escapedUnit}`).test(trimmedText) ? text : `${normalizedUnit}${text}`;
  }
  if (/^(?:%|k|m|b|t|万|亿)$/i.test(normalizedUnit)) {
    return new RegExp(`${escapedUnit}$`, 'i').test(trimmedText) ? text : `${text}${normalizedUnit}`;
  }
  if (new RegExp(`${escapedUnit}$`, 'i').test(trimmedText)) return text;
  return `${text} ${normalizedUnit}`;
}

export function normalizedChartValue(item = {}) {
  const displayValue = hasMappedValue(item?.displayValue)
    ? String(item.displayValue)
    : hasMappedValue(item?.valueText)
      ? String(item.valueText)
      : '';
  const parsedDisplay = parseFormattedValue(displayValue);
  if (parsedDisplay && (
    parsedDisplay.currency
    || parsedDisplay.suffix
    || typeof item?.value !== 'number'
  )) {
    return parsedDisplay.value;
  }
  if (typeof item?.value === 'number' && Number.isFinite(item.value)) {
    const scale = VALUE_SCALES.get(String(item?.unit || '').trim().toLowerCase()) || 1;
    return item.value * scale;
  }
  return parsedDisplay?.value ?? null;
}

export function chartUnitIdentity(item = {}) {
  const displayValue = hasMappedValue(item?.displayValue)
    ? String(item.displayValue)
    : hasMappedValue(item?.valueText)
      ? String(item.valueText)
      : '';
  const parsedDisplay = parseFormattedValue(displayValue);
  if (parsedDisplay?.suffix === '%') return 'percent';
  if (parsedDisplay?.currency) return `currency:${parsedDisplay.currency}`;
  const unit = String(item?.unit || '').trim();
  if (!unit || VALUE_SCALES.has(unit.toLowerCase())) return 'number';
  if (unit === '%') return 'percent';
  if (/^[¥$€£]$/.test(unit)) return `currency:${unit}`;
  return `unit:${unit.toLowerCase()}`;
}

function parseFormattedValue(value) {
  const normalized = String(value || '').trim().replace(/,/g, '');
  const match = normalized.match(/^([+-]?)([¥$€£]?)(\d+(?:\.\d+)?)(%|[KMBT]|万|亿)?$/i);
  if (!match) return null;
  const suffix = String(match[4] || '');
  const scale = VALUE_SCALES.get(suffix.toLowerCase()) || 1;
  const parsed = Number(`${match[1]}${match[3]}`) * scale;
  if (!Number.isFinite(parsed)) return null;
  return {
    value: parsed,
    currency: match[2] || '',
    suffix,
  };
}

export function validateBespokeComposition(composition) {
  const errors = [];
  scanForbiddenKeys(composition, 'composition', errors);
  if (!isPlainRecord(composition)) {
    errors.push('composition: expected an object');
    return unique(errors);
  }
  rejectUnknownFields(composition, new Set(['designIntent', 'background', 'elements']), 'composition', errors);
  validateDesignIntent(composition.designIntent, errors);

  if (!BACKGROUNDS.has(composition.background)) {
    errors.push(`composition.background: expected one of ${[...BACKGROUNDS].join(', ')}`);
  }
  if (!Array.isArray(composition.elements)) {
    errors.push('composition.elements: expected a non-empty array');
    return unique(errors);
  }
  if (composition.elements.length < 1) {
    errors.push('composition.elements: expected at least 1 element');
  }
  if (composition.elements.length > 32) {
    errors.push('composition.elements: expected at most 32 elements');
  }

  const ids = new Set();
  composition.elements.forEach((element, index) => {
    validateElement(element, index, ids, errors);
  });
  return unique(errors);
}

function validateDesignIntent(value, errors) {
  const path = 'composition.designIntent';
  if (!isPlainRecord(value)) {
    errors.push(`${path}: expected an object`);
    return;
  }
  rejectUnknownFields(value, new Set(DESIGN_INTENT_FIELDS), path, errors);
  for (const field of REQUIRED_DESIGN_INTENT_FIELDS) {
    if (!isNonEmptyString(value[field])) {
      errors.push(`${path}.${field}: expected a non-empty string`);
    }
  }
  if (value.compositionFamily != null && !COMPOSITION_FAMILIES.has(value.compositionFamily)) {
    errors.push(
      `${path}.compositionFamily: expected one of ${[...COMPOSITION_FAMILIES].join(', ')}`,
    );
  }
}

function validateElement(element, index, ids, errors) {
  const path = `composition.elements[${index}]`;
  if (!isPlainRecord(element)) {
    errors.push(`${path}: expected an object`);
    return;
  }

  const id = isNonEmptyString(element.id) ? element.id.trim() : '';
  if (!id) {
    errors.push(`${path}.id: expected a non-empty string`);
  } else if (ids.has(id)) {
    errors.push(`${path}.id: duplicate element id "${id}"`);
  } else {
    ids.add(id);
  }

  const type = element.type;
  if (!ELEMENT_TYPES.has(type)) {
    errors.push(`${path}.type: expected one of ${[...ELEMENT_TYPES].join(', ')}`);
  }
  rejectUnknownFields(element, ELEMENT_FIELDS[type] || COMMON_ELEMENT_FIELDS, path, errors);
  validateGrid(element.grid, `${path}.grid`, errors);

  if (element.tone != null && !ELEMENT_TONES.has(element.tone)) {
    errors.push(`${path}.tone: expected one of ${[...ELEMENT_TONES].join(', ')}`);
  }

  if (type === 'text') validateTextElement(element, path, errors);
  if (type === 'metric') validateMetricElement(element, path, errors);
  if (type === 'list') validateListElement(element, path, errors);
  if (type === 'quote') validateQuoteElement(element, path, errors);
  if (type === 'media') validateMediaElement(element, path, errors);
  if (type === 'shape') validateShapeElement(element, path, errors);
  if (type === 'chart') validateChartElement(element, path, errors);
}

function validateGrid(grid, path, errors) {
  if (!isPlainRecord(grid)) {
    errors.push(`${path}: expected {column,row,width,height}`);
    return;
  }
  rejectUnknownFields(grid, new Set(GRID_FIELDS), path, errors);
  for (const field of GRID_FIELDS) {
    if (!Number.isInteger(grid[field])) {
      errors.push(`${path}.${field}: expected an integer`);
    }
  }
  if (!Number.isInteger(grid.column) || !Number.isInteger(grid.row)
    || !Number.isInteger(grid.width) || !Number.isInteger(grid.height)) return;

  if (grid.column < 1 || grid.column > 12) {
    errors.push(`${path}.column: expected an integer from 1 to 12`);
  }
  if (grid.row < 1 || grid.row > 8) {
    errors.push(`${path}.row: expected an integer from 1 to 8`);
  }
  if (grid.width < 1 || grid.width > 12) {
    errors.push(`${path}.width: expected an integer from 1 to 12`);
  }
  if (grid.height < 1 || grid.height > 8) {
    errors.push(`${path}.height: expected an integer from 1 to 8`);
  }
  if (grid.column >= 1 && grid.width >= 1 && grid.column + grid.width - 1 > 12) {
    errors.push(`${path}: exceeds 12-column grid`);
  }
  if (grid.row >= 1 && grid.height >= 1 && grid.row + grid.height - 1 > 8) {
    errors.push(`${path}: exceeds 8-row grid`);
  }
}

function validateTextElement(element, path, errors) {
  if (!isNonEmptyString(element.text)) errors.push(`${path}.text: expected a non-empty string`);
  if (element.role != null && !TEXT_ROLES.has(element.role)) {
    errors.push(`${path}.role: expected one of ${[...TEXT_ROLES].join(', ')}`);
  }
  if (element.align != null && !TEXT_ALIGNS.has(element.align)) {
    errors.push(`${path}.align: expected one of ${[...TEXT_ALIGNS].join(', ')}`);
  }
}

function validateMetricElement(element, path, errors) {
  if (!isStringOrFiniteNumber(element.value)) {
    errors.push(`${path}.value: expected a non-empty string or finite number`);
  }
  if (!isNonEmptyString(element.label)) errors.push(`${path}.label: expected a non-empty string`);
  validateOptionalString(element.unit, `${path}.unit`, errors);
  validateOptionalString(element.detail, `${path}.detail`, errors);
  validateOptionalString(element.trend, `${path}.trend`, errors);
}

function validateListElement(element, path, errors) {
  if (element.ordered != null && typeof element.ordered !== 'boolean') {
    errors.push(`${path}.ordered: expected a boolean`);
  }
  if (!Array.isArray(element.items) || !element.items.length) {
    errors.push(`${path}.items: expected a non-empty array`);
    return;
  }
  element.items.forEach((item, index) => {
    const itemPath = `${path}.items[${index}]`;
    if (isNonEmptyString(item)) return;
    if (!isPlainRecord(item)) {
      errors.push(`${itemPath}: expected a non-empty string or {title,body}`);
      return;
    }
    rejectUnknownFields(item, new Set(['title', 'body']), itemPath, errors);
    if (!isNonEmptyString(item.title) && !isNonEmptyString(item.body)) {
      errors.push(`${itemPath}: expected a non-empty title or body`);
    }
    validateOptionalString(item.title, `${itemPath}.title`, errors);
    validateOptionalString(item.body, `${itemPath}.body`, errors);
  });
}

function validateQuoteElement(element, path, errors) {
  if (!isNonEmptyString(element.quote)) errors.push(`${path}.quote: expected a non-empty string`);
  validateOptionalString(element.attribution, `${path}.attribution`, errors);
}

function validateMediaElement(element, path, errors) {
  if (!isNonEmptyString(element.src)) errors.push(`${path}.src: expected a non-empty string`);
  validateOptionalString(element.alt, `${path}.alt`, errors);
  if (element.fit != null && !MEDIA_FITS.has(element.fit)) {
    errors.push(`${path}.fit: expected one of ${[...MEDIA_FITS].join(', ')}`);
  }
}

function validateShapeElement(element, path, errors) {
  if (!SHAPES.has(element.shape)) {
    errors.push(`${path}.shape: expected one of ${[...SHAPES].join(', ')}`);
  }
}

function validateChartElement(element, path, errors) {
  if (!CHART_TYPES.has(element.chartType)) {
    errors.push(`${path}.chartType: expected one of ${[...CHART_TYPES].join(', ')}`);
  }
  if (element.showValues != null && typeof element.showValues !== 'boolean') {
    errors.push(`${path}.showValues: expected a boolean`);
  }
  if (!Array.isArray(element.data) || !element.data.length) {
    errors.push(`${path}.data: expected a non-empty array`);
    return;
  }
  if (element.data.length > 12) {
    errors.push(`${path}.data: expected at most 12 items`);
  }
  element.data.forEach((item, index) => {
    const itemPath = `${path}.data[${index}]`;
    if (!isPlainRecord(item)) {
      errors.push(`${itemPath}: expected {label,value}`);
      return;
    }
    rejectUnknownFields(item, new Set(['label', 'value', 'displayValue', 'unit']), itemPath, errors);
    if (!isNonEmptyString(item.label)) errors.push(`${itemPath}.label: expected a non-empty string`);
    const permitsNegative = chartTypeAllowsNegativeValues(element.chartType);
    if (!isValidBespokeChartValue(element.chartType, item.value)) {
      errors.push(`${itemPath}.value: expected a ${permitsNegative ? '' : 'non-negative '}finite number`);
    }
    validateOptionalString(item.displayValue, `${itemPath}.displayValue`, errors);
    validateOptionalString(item.unit, `${itemPath}.unit`, errors);
  });
}

function validateOptionalString(value, path, errors) {
  if (value != null && !isNonEmptyString(value)) errors.push(`${path}: expected a non-empty string`);
}

function parseMappedPath(value, label, errors) {
  try {
    return parsePath(value);
  } catch (error) {
    errors.push(`${label}: ${error.message}`);
    return null;
  }
}

function parsePath(value) {
  const path = String(value || '').trim();
  if (!PATH_PATTERN.test(path)) {
    throw new Error(`invalid path "${path}" (use dot paths and numeric [n] indices)`);
  }
  const tokens = [];
  for (const match of path.matchAll(PATH_TOKEN_PATTERN)) {
    const token = match[1] ?? Number(match[2]);
    if (typeof token === 'string' && UNSAFE_KEYS.has(token)) {
      throw new Error(`unsafe path segment "${token}"`);
    }
    if (typeof token === 'number' && (!Number.isSafeInteger(token) || token > MAX_PATH_INDEX)) {
      throw new Error(`array index ${match[2]} is outside the supported range`);
    }
    tokens.push(token);
  }
  return tokens;
}

function readPath(value, tokens) {
  let current = value;
  for (const token of tokens) {
    if (typeof token === 'number') {
      if (!Array.isArray(current) || !Object.prototype.hasOwnProperty.call(current, token)) {
        return { found: false, value: undefined };
      }
    } else if (!isPlainRecord(current) || !Object.prototype.hasOwnProperty.call(current, token)) {
      return { found: false, value: undefined };
    }
    current = current[token];
  }
  return { found: true, value: current };
}

function writePath(target, tokens, value, targetPath) {
  let current = target;
  for (let index = 0; index < tokens.length - 1; index += 1) {
    const token = tokens[index];
    const nextToken = tokens[index + 1];
    assertWritableContainer(current, token, targetPath);
    if (!Object.prototype.hasOwnProperty.call(current, token) || current[token] == null) {
      current[token] = typeof nextToken === 'number' ? [] : {};
    }
    const expectedArray = typeof nextToken === 'number';
    if ((expectedArray && !Array.isArray(current[token]))
      || (!expectedArray && !isPlainRecord(current[token]))) {
      throw new Error(`contentMap target "${targetPath}": cannot traverse non-container segment "${String(token)}"`);
    }
    current = current[token];
  }
  const last = tokens.at(-1);
  assertWritableContainer(current, last, targetPath);
  current[last] = value;
}

function assertWritableContainer(container, token, targetPath) {
  if (typeof token === 'number') {
    if (!Array.isArray(container)) {
      throw new Error(`contentMap target "${targetPath}": array index [${token}] requires an array`);
    }
    return;
  }
  if (!isPlainRecord(container)) {
    throw new Error(`contentMap target "${targetPath}": property "${token}" requires an object`);
  }
}

function safeDeepClone(value, path, active = new WeakSet()) {
  if (value == null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error(`${path}: expected a finite number`);
    return value;
  }
  if (typeof value !== 'object') {
    throw new Error(`${path}: expected JSON-compatible content`);
  }
  if (active.has(value)) throw new Error(`${path}: circular values are not supported`);
  active.add(value);
  try {
    if (Array.isArray(value)) {
      for (const key of Object.keys(value)) {
        if (UNSAFE_KEYS.has(key)) throw new Error(`${path}: unsafe object key "${key}"`);
        if (!/^(?:0|[1-9]\d*)$/.test(key)) {
          throw new Error(`${path}: array contains unsupported property "${key}"`);
        }
      }
      return value.map((item, index) => safeDeepClone(item, `${path}[${index}]`, active));
    }
    if (!isPlainRecord(value)) throw new Error(`${path}: expected a plain object`);
    const clone = {};
    for (const [key, item] of Object.entries(value)) {
      if (UNSAFE_KEYS.has(key)) throw new Error(`${path}: unsafe object key "${key}"`);
      clone[key] = safeDeepClone(item, `${path}.${key}`, active);
    }
    return clone;
  } finally {
    active.delete(value);
  }
}

function scanForbiddenKeys(value, path, errors, active = new WeakSet()) {
  if (!value || typeof value !== 'object' || active.has(value)) return;
  active.add(value);
  for (const [key, item] of Object.entries(value)) {
    const itemPath = Array.isArray(value) ? `${path}[${key}]` : `${path}.${key}`;
    if (UNSAFE_KEYS.has(key)) errors.push(`${itemPath}: unsafe object key`);
    if (FORBIDDEN_COMPOSITION_KEYS.has(key.toLowerCase())) {
      errors.push(`${itemPath}: forbidden composition field`);
    }
    scanForbiddenKeys(item, itemPath, errors, active);
  }
  active.delete(value);
}

function rejectUnknownFields(value, allowed, path, errors) {
  for (const key of Object.keys(value || {})) {
    if (!allowed.has(key)) errors.push(`${path}.${key}: unknown field`);
  }
}

function isPlainRecord(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isStringOrFiniteNumber(value) {
  return isNonEmptyString(value) || (typeof value === 'number' && Number.isFinite(value));
}

function unique(values) {
  return [...new Set(values)];
}
