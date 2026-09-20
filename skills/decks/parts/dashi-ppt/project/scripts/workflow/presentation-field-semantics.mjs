// @ts-check
// Shared semantic resolver for template item fields. It classifies target
// fields independently from the planner/projector-specific canonical source
// names (`value` versus `chartValue`).

const SCALAR_ITEM_TYPES = new Set(['string', 'number', 'boolean']);
const METRIC_CONTAINER_KEYS = /^(?:stats|metrics|kpis|metricsdata|indicators|scores|factsdata)$/;
const CHAPTER_CONTAINER_KEYS = /^(?:contents|index|chapters|agenda)$/;
const DURATION_CONTAINER_KEYS = /^(?:tracks|songs|playlist|setlist)$/;
const METRIC_FIELD_KEYS = /^(?:v|value|amount|amt|metric|stat|pct|percent|score|avg|disp|val)$/;
const STRUCTURAL_NUMERIC_KEYS = /^(?:idx|no|num|rank|index|pg|page|pageno|pagenumber)$/;
const TITLE_SIBLING_KEYS = new Set(['t', 'title', 'label', 'name', 'big', 'cn', 'zh', 'nm', 'lb']);

function recordEntries(value) {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? Object.entries(value)
    : [];
}

function normalizedType(value) {
  return typeof value === 'string' ? value.toLowerCase() : '';
}

function normalizedRole(value) {
  return String(value || '').trim().toLowerCase();
}

function normalizedKey(value) {
  return String(value || '').trim().toLowerCase();
}

function caseInsensitiveEntry(entries, key) {
  const normalized = normalizedKey(key);
  return entries.find(([candidate]) => normalizedKey(candidate) === normalized) || null;
}

/**
 * Return the complete scalar target set for one array contract. Shape keys
 * take precedence, while itemFields-only contracts remain visible to both
 * planner and projector.
 */
export function presentationTargetEntries(field = {}) {
  const shapeEntries = recordEntries(field.itemShape);
  const contractEntries = recordEntries(field.itemFields);
  const keys = [];
  const seen = new Set();
  for (const [key] of [...shapeEntries, ...contractEntries]) {
    const normalized = normalizedKey(key);
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    keys.push(key);
  }
  return keys.map(key => {
    const shapeEntry = caseInsensitiveEntry(shapeEntries, key);
    const contractEntry = caseInsensitiveEntry(contractEntries, key);
    const contract = contractEntry?.[1] || {};
    const type = normalizedType(shapeEntry?.[1] || contract?.type);
    return {
      key,
      type,
      contract,
      decision: resolvePresentationFieldDecision(key, type, field),
    };
  });
}

/**
 * Resolve one target field to a stage-independent semantic role.
 * `numericValue` deliberately does not name either planner `value` or
 * projector `chartValue`; callers adapt that one semantic at their boundary.
 */
export function resolvePresentationFieldDecision(key, type, field = {}) {
  const name = normalizedKey(key);
  const itemType = normalizedType(type);
  const containerKey = normalizedKey(field.key);
  const container = containerKey.split('.').at(-1)?.replace(/\[\]$/g, '') || '';
  const containerRole = normalizedRole(field.role);
  const itemEntries = recordEntries(field.itemShape);
  const itemFieldEntries = recordEntries(field.itemFields);
  const itemField = caseInsensitiveEntry(itemFieldEntries, name)?.[1] || {};
  const contractRole = normalizedRole(itemField.role);
  const siblingKeys = new Set([
    ...itemEntries.map(([item]) => normalizedKey(item)),
    ...itemFieldEntries.map(([item]) => normalizedKey(item)),
  ]);
  const siblingTypes = new Map();
  for (const siblingKey of siblingKeys) {
    const shapeEntry = caseInsensitiveEntry(itemEntries, siblingKey);
    const contractEntry = caseInsensitiveEntry(itemFieldEntries, siblingKey);
    siblingTypes.set(
      siblingKey,
      normalizedType(shapeEntry?.[1] || contractEntry?.[1]?.type),
    );
  }
  const siblingRoles = new Map(itemFieldEntries.map(([itemKey, contract]) => [
    normalizedKey(itemKey),
    normalizedRole(contract?.role),
  ]));
  const metricContainer = containerRole === 'metric' || METRIC_CONTAINER_KEYS.test(container);
  const chapterContainer = containerRole === 'chapter' || CHAPTER_CONTAINER_KEYS.test(container);
  const durationContainer = DURATION_CONTAINER_KEYS.test(container);
  const hasTitleSibling = [...TITLE_SIBLING_KEYS].some(item => siblingKeys.has(item));
  const hasMetricSibling = [...siblingKeys].some(itemKey => (
    itemKey !== name
    && (
      (siblingTypes.get(itemKey) === 'number' && !STRUCTURAL_NUMERIC_KEYS.test(itemKey))
      || siblingRoles.get(itemKey) === 'metric'
      || METRIC_FIELD_KEYS.test(itemKey)
    )
  ));
  const context = {
    key: String(key || ''),
    normalizedKey: name,
    itemType,
    containerKey,
    container,
    containerRole,
    contractRole,
    siblingKeys: [...siblingKeys].sort(),
    siblingTypes: Object.fromEntries([...siblingTypes].sort(([left], [right]) => left.localeCompare(right))),
    siblingRoles: Object.fromEntries([...siblingRoles].sort(([left], [right]) => left.localeCompare(right))),
  };
  const decide = (semantic, reason) => ({ ...context, semantic, reason });

  if (!SCALAR_ITEM_TYPES.has(itemType)) return decide(null, 'unsupported-item-type');

  // Existing projector behavior treats array booleans as state/focus fields.
  // Resolve it here so the planner sees the same semantic.
  if (itemType === 'boolean') return decide('focus', 'boolean-state-field');

  // Structural numbers are positions or page references, never business
  // metrics. Resolve every authored string/number form before container,
  // contract-role, and generic numeric rules can reinterpret it as a value.
  if (STRUCTURAL_NUMERIC_KEYS.test(name)) {
    if (name === 'pg' || name === 'page' || name === 'pageno' || name === 'pagenumber') {
      return decide('pageLabel', 'page-field');
    }
    if (name === 'idx') return decide('ordinal', 'idx-is-structural-ordinal');
    if (name === 'no' || name === 'num') return decide('ordinal', 'ordinal-long-field');
    return decide('ordinal', 'ordinal-index-field');
  }

  // Page, duration, metric and secondary-label targets require their matching
  // canonical data. They never borrow an ordinal or ordinary label source.
  if (/^(?:unit|suffix)$/.test(name)
    || (name === 'u' && (metricContainer || hasMetricSibling))) {
    return decide('unit', 'unit-field-in-metric-context');
  }
  if (container === 'quotes') {
    if (name === 'q') return decide('detail', 'quote-body');
    if (name === 'n') return decide('label', 'quote-attribution-name');
    if (name === 'r') return decide('secondaryLabel', 'quote-attribution-role');
    if (name === 'm') return decide('initial', 'quote-initial');
  }
  if (name === 'd') {
    if (itemType === 'number') return decide('numericValue', 'numeric-d-field');
    if (durationContainer) return decide('duration', 'duration-container-d-field');
    if (contractRole === 'metric' || metricContainer) {
      return decide('displayValue', 'metric-context-d-field');
    }
    if (contractRole === 'body' || contractRole === 'paragraph' || hasTitleSibling) {
      return decide('detail', 'detail-context-d-field');
    }
    return decide('label', 'unqualified-string-d-field');
  }
  if (name === 'e') {
    if (itemType === 'number') return decide('numericValue', 'numeric-e-field');
    if (contractRole === 'body' || contractRole === 'paragraph') {
      return decide('detail', 'body-contract-e-field');
    }
    if (chapterContainer || siblingKeys.has('t') || siblingKeys.has('n') || siblingKeys.has('pg')) {
      return decide('secondaryLabel', 'chapter-or-title-sibling-e-field');
    }
    return decide('label', 'unqualified-string-e-field');
  }
  if (name === 'n') {
    if (itemType === 'number') return decide('numericValue', 'numeric-n-field');
    if (contractRole === 'metric' || metricContainer) {
      return decide('displayValue', 'metric-context-n-field');
    }
    if (/^(?:quotes|artists)$/.test(container)) {
      return decide('label', 'named-entity-container-n-field');
    }
    if (hasTitleSibling) return decide('ordinal', 'title-sibling-n-field');
    return decide('label', 'standalone-n-label');
  }
  if (name === 't') {
    return contractRole === 'body' || contractRole === 'paragraph'
      ? decide('detail', 'body-contract-t-field')
      : decide('label', 'title-like-t-field');
  }
  if (name === 's') {
    if (itemType === 'number') return decide('numericValue', 'numeric-s-field');
    if (contractRole === 'metric' || metricContainer) {
      return decide('displayValue', 'metric-context-s-field');
    }
    if (container === 'artists' && siblingTypes.has('v')) {
      return decide('displayValue', 'artist-value-s-field');
    }
    if (hasTitleSibling) return decide('secondaryLabel', 'title-sibling-s-field');
    return decide('label', 'unqualified-string-s-field');
  }
  if ((name === 'l' || name === 'lb') && (metricContainer || hasMetricSibling)) {
    return decide('label', 'metric-label-field');
  }

  if (itemType === 'number') return decide('numericValue', 'generic-numeric-field');
  if (contractRole === 'metric') return decide('displayValue', 'metric-contract-role');
  if (contractRole === 'body' || contractRole === 'paragraph') {
    return decide('detail', 'body-contract-role');
  }
  if (/body|detail|description|desc|note|summary|sub|caption|copy|text/.test(name)) {
    return decide('detail', 'detail-long-field');
  }
  if (/^(?:v)$|value|amount|score|number|metric|stat|pct|percent|share|delta|rate/.test(name)) {
    return decide('displayValue', 'display-value-long-field');
  }
  if (/rank|index/.test(name)) return decide('ordinal', 'ordinal-index-field');
  if (/^(?:k|t)$|label|name|title|heading|category|series|item|dim|^en$|phase|stage|period|time|tag/.test(name)) {
    return decide('label', 'label-long-field');
  }
  if (/^id$|key/.test(name)) return decide('id', 'identity-field');

  // The real projector historically used contract role and then label as its
  // final fallback. Keeping that fallback in this shared resolver preserves
  // existing long-field behavior while making planner eligibility identical.
  return decide('label', 'default-string-label');
}

export function presentationSourceForDecision(decision, { numericSource = 'value' } = {}) {
  if (!decision?.semantic) return null;
  if (decision.semantic !== 'numericValue') return decision.semantic;
  if (numericSource !== 'value' && numericSource !== 'chartValue') {
    throw new Error(`Unsupported numeric presentation source: ${numericSource}`);
  }
  return numericSource;
}

export function plannerPresentationFieldForTarget(key, type, field = {}) {
  return presentationSourceForDecision(
    resolvePresentationFieldDecision(key, type, field),
    { numericSource: 'value' },
  );
}

export function projectorPresentationFieldForTarget(key, type, field = {}) {
  return presentationSourceForDecision(
    resolvePresentationFieldDecision(key, type, field),
    { numericSource: 'chartValue' },
  );
}
