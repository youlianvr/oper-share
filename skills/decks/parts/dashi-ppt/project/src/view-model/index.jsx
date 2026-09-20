import React from 'react';
import { SlideViewModelProvider } from './context.jsx';
import { getLayoutContract, normalizeSlidePropsForLayout } from '../propContracts.jsx';
import { isMediaArrayKey } from '../prop-contract-core.mjs';
import { BespokeSlide } from '../components/bespoke/BespokeSlide.jsx';
import {
  BESPOKE_SCHEMA_VERSION,
  getVariantKind,
  isBespokeVariant,
  isExpandedVariantSlide,
  resolveContentMap,
} from '../variant-contract.mjs';
import {
  SCHEMA_V2_LOGICAL_SLIDE_FIELDS,
  pickSchemaV2LogicalSlideFields,
} from './schema-v2-canonical.mjs';

const SLIDE_MODEL_TYPE = 'dashi.slide-model';
const VARIANT_STATE_ID_SEPARATOR = '::';

export function createSlideModel(layout, props = {}) {
  if (!layout || typeof layout !== 'string') {
    throw new Error('Slide model requires a layout name.');
  }
  return {
    type: SLIDE_MODEL_TYPE,
    layout,
    props: props || {},
  };
}

export function isSlideModel(value) {
  return value?.type === SLIDE_MODEL_TYPE || (value?.layout && !React.isValidElement(value));
}

export function buildDeckViewModel(deck, registries) {
  const model = normalizeDeckModel(deck);
  const layoutAliases = registries.layoutAliases || {};
  const renderableSlides = model.slides.flatMap((slide) => slide.variants || [slide]);
  const slideKeys = createSlideKeys(renderableSlides, layoutAliases);
  let slideKeyIndex = 0;
  const slides = model.slides.map((slide, index) => {
    const candidateCount = slide.variants?.length || 1;
    const keys = slideKeys.slice(slideKeyIndex, slideKeyIndex + candidateCount);
    slideKeyIndex += candidateCount;
    return buildLogicalSlideViewModel(slide, index, keys, {
      layouts: registries.layouts,
      themePacks: registries.themePacks,
      layoutAliases,
      defaultThemePack: model.themePack || registries.defaultThemePack,
    });
  });
  const comparisonPages = buildComparisonPageDescriptors(slides, model.schemaVersion);
  const themePack = registries.resolveOption(
    registries.themePacks,
    model.themePack || slides[0]?.themePack,
    registries.defaultThemePack,
    'theme pack',
  );
  const state = {
    slideOrder: slides.map((slide) => slide.id),
    text: normalizeTextState(model.text, slides.flatMap((slide) => slide.variants || [slide]), layoutAliases),
    media: model.media || {},
    props: model.props || {},
    variantSelection: Object.fromEntries(
      slides
        .filter((slide) => slide.variants?.length)
        .map((slide) => [slide.id, slide.stateId]),
    ),
  };

  return {
    model,
    themePack,
    slides,
    comparisonPages,
    options: {
      themePacks: serializeThemePacks(filterThemePacksForSlides(registries.themePacks, slides)),
      current: {
        themePack: themePack.key,
      },
    },
    state,
  };
}

export function renderDeckView(viewModel) {
  return viewModel.slides.map((slide) => {
    if (slide.element) return slide.element;
    const Component = slide.component;
    return (
      <SlideViewModelProvider value={slide.context} key={slide.id}>
        <Component {...slide.props} />
      </SlideViewModelProvider>
    );
  });
}

export function serializeDeckViewModel(viewModel) {
  const toJson = createJsonSerializer();
  return {
    version: 1,
    ...(viewModel.model.schemaVersion != null
      ? { schemaVersion: viewModel.model.schemaVersion }
      : {}),
    ...(viewModel.model.variantPresentation
      ? { variantPresentation: viewModel.model.variantPresentation }
      : {}),
    ...(viewModel.model.variantOutputMode
      ? { variantOutputMode: viewModel.model.variantOutputMode }
      : {}),
    ...(Number(viewModel.model.schemaVersion) === BESPOKE_SCHEMA_VERSION
      ? {
          runtimeSchema: {
            schemaV2LogicalSlideFields: [...SCHEMA_V2_LOGICAL_SLIDE_FIELDS],
          },
        }
      : {}),
    title: viewModel.model.title,
    themePack: viewModel.themePack.key,
    slides: viewModel.slides.map((slide) => serializeSlideViewModel(
      slide,
      toJson,
      Number(viewModel.model.schemaVersion) === BESPOKE_SCHEMA_VERSION,
    )),
    ...(viewModel.comparisonPages?.length
      ? { comparisonPages: viewModel.comparisonPages }
      : {}),
    state: {
      slideOrder: viewModel.slides.map((slide) => slide.id),
      text: viewModel.state.text || {},
      media: viewModel.state.media || {},
      props: viewModel.state.props || {},
      variantSelection: viewModel.state.variantSelection || {},
    },
  };
}

function serializeSlideViewModel(slide, toJson, canonicalContentOnly = false) {
  if (canonicalContentOnly && slide.variants?.length) {
    const selected = slide.variants.find(variant => variant.stateId === slide.stateId) || slide.variants[0];
    return pickSchemaV2LogicalSlideFields({
      id: slide.id,
      key: slide.key,
      label: slide.label,
      logicalIndex: slide.logicalIndex,
      ...(slide.content !== undefined ? { content: toJson(slide.content) } : {}),
      stateId: slide.stateId,
      selectedVariant: selected?.variantId,
      variants: slide.variants.map((variant) => serializeVariantViewModel(
        variant,
        toJson,
        canonicalContentOnly,
      )),
    });
  }
  const serialized = {
    id: slide.id,
    key: slide.key,
    layout: slide.layout,
    dataLayout: slide.dataLayout,
    themePack: slide.themePack,
    label: slide.label,
    logicalIndex: slide.logicalIndex,
    props: toJson(slide.authoredProps ?? {}),
    ...(canonicalContentOnly
      ? {}
      : { materializedProps: toJson(slide.sourceProps ?? slide.authoredProps ?? {}) }),
    media: toJson(slide.media),
    ...(slide.content !== undefined ? { content: toJson(slide.content) } : {}),
  };
  if (!slide.variants?.length) return serialized;
  const selected = slide.variants.find(variant => variant.stateId === slide.stateId) || slide.variants[0];
  return {
    ...serialized,
    stateId: slide.stateId,
    selectedVariant: selected?.variantId,
    variants: slide.variants.map((variant) => serializeVariantViewModel(
      variant,
      toJson,
      canonicalContentOnly,
    )),
  };
}

function serializeVariantViewModel(variant, toJson, canonicalContentOnly = false) {
  const media = toJson(variant.media);
  const hasMedia = media != null
    && typeof media === 'object'
    && Object.keys(media).length > 0;
  const shared = {
    id: variant.variantId,
    stateId: variant.stateId,
    key: variant.key,
    kind: variant.variantKind,
    themePack: variant.themePack,
    label: variant.label,
    logicalIndex: variant.logicalIndex,
    ...(!canonicalContentOnly || hasMedia ? { media } : {}),
    ...(variant.contentMap !== undefined
      ? { contentMap: toJson(variant.contentMap) }
      : {}),
  };
  if (variant.variantKind === 'bespoke') {
    return {
      ...shared,
      adjustable: false,
      composition: toJson(variant.authoredComposition),
    };
  }
  return {
    ...shared,
    layout: variant.layout,
    dataLayout: variant.dataLayout,
    props: toJson(variant.authoredProps ?? {}),
    ...(canonicalContentOnly
      ? {}
      : { materializedProps: toJson(variant.sourceProps ?? variant.authoredProps ?? {}) }),
  };
}

function createJsonSerializer() {
  const active = new WeakSet();
  return function toJson(value) {
    if (value == null || ['string', 'number', 'boolean'].includes(typeof value)) return value;
    if (typeof value === 'function' || React.isValidElement(value)) return undefined;
    if (Array.isArray(value)) return value.map(toJson);
    if (typeof value !== 'object') return undefined;
    if (active.has(value)) return undefined;
    active.add(value);
    const serialized = Object.fromEntries(
      Object.entries(value)
        .map(([key, item]) => [key, toJson(item)])
        .filter(([, item]) => item !== undefined),
    );
    active.delete(value);
    return serialized;
  };
}

function normalizeDeckModel(deck) {
  const schemaVersion = deck.schemaVersion;
  const slides = (deck.slides || []).map((slide, index) => normalizeSlideModel(
    slide,
    index,
    schemaVersion,
  ));
  assertSlideIdentities(slides);
  return {
    title: deck.title || 'Untitled Deck',
    themePack: deck.themePack,
    schemaVersion,
    variantPresentation: deck.variantPresentation,
    variantOutputMode: deck.variantOutputMode,
    text: deck.text || {},
    media: deck.media || {},
    props: deck.props || {},
    slides,
  };
}

function normalizeSlideModel(slide, index, schemaVersion) {
  if (React.isValidElement(slide)) {
    return {
      id: `legacy-${index + 1}`,
      element: slide,
      props: {},
      legacy: true,
    };
  }
  if (typeof slide === 'string') {
    return {
      id: `${slide}-${index + 1}`,
      layout: slide,
      props: {},
    };
  }
  if (Array.isArray(slide?.variants)) {
    const expanded = Number(schemaVersion) === BESPOKE_SCHEMA_VERSION
      && isExpandedVariantSlide(slide, schemaVersion);
    if (Number(schemaVersion) === BESPOKE_SCHEMA_VERSION && !expanded) {
      throw new Error(
        'Schema version 2 slide variants must contain exactly 3 explicit template entries and 1 bespoke entry.',
      );
    }
    if (Number(schemaVersion) !== BESPOKE_SCHEMA_VERSION && slide.variants.length !== 3) {
      throw new Error(
        'Slide variants must contain exactly 3 entries.',
      );
    }
    const pageId = String(slide.id || slide.key || slide.slideKey || `slide-${index + 1}`);
    const variants = slide.variants.map((variant, variantIndex) => {
      const layout = variant.layout || variant.layoutName;
      const variantId = String(variant.id || `variant-${variantIndex + 1}`);
      const variantKind = getVariantKind(variant);
      if (variantKind === 'bespoke') {
        for (const forbidden of ['layout', 'layoutName', 'props', 'controls']) {
          if (Object.prototype.hasOwnProperty.call(variant, forbidden)) {
            throw new Error(`Bespoke variant "${variantId}" must not define ${forbidden}.`);
          }
        }
      }
      return {
        ...variant,
        id: variantId,
        stateId: `${pageId}::${variantId}`,
        pageId,
        variantId,
        variantKind,
        variantIndex,
        variantCount: slide.variants.length,
        layout,
        ...(variantKind === 'bespoke'
          ? { key: createBespokeSlideKey(pageId, variantId) }
          : { props: variant.props || {} }),
        label: variant.label || slide.label,
        logicalIndex: variant.logicalIndex ?? slide.logicalIndex,
      };
    });
    const selected = variants.find((variant) => (
      variant.id === slide.selectedVariant || variant.stateId === slide.selectedVariant
    )) || variants[0];
    return {
      ...slide,
      id: pageId,
      variants,
      selectedVariant: selected?.stateId,
    };
  }
  const layout = slide.layout || slide.layoutName;
  return {
    ...slide,
    id: slide.id || `${layout}-${index + 1}`,
    layout,
    props: slide.props || {},
  };
}

function assertSlideIdentities(slides) {
  const logicalIdUsages = new Map();
  slides.forEach((slide, slideIndex) => {
    const logicalId = String(slide.id);
    if (logicalId.includes(VARIANT_STATE_ID_SEPARATOR)) {
      throw new Error(`Slide ${slideIndex + 1} logical slide id "${logicalId}" contains reserved delimiter "${VARIANT_STATE_ID_SEPARATOR}" used by stateId.`);
    }
    const positions = logicalIdUsages.get(logicalId) || [];
    positions.push(slideIndex + 1);
    logicalIdUsages.set(logicalId, positions);

    if (!slide.variants?.length) return;
    const variantIdUsages = new Map();
    slide.variants.forEach((variant, variantIndex) => {
      const variantId = String(variant.variantId);
      if (variantId.includes(VARIANT_STATE_ID_SEPARATOR)) {
        throw new Error(`Slide ${slideIndex + 1} variant ${variantIndex + 1} variant id "${variantId}" contains reserved delimiter "${VARIANT_STATE_ID_SEPARATOR}" used by stateId.`);
      }
      const variantPositions = variantIdUsages.get(variantId) || [];
      variantPositions.push(variantIndex + 1);
      variantIdUsages.set(variantId, variantPositions);
    });
    for (const [variantId, variantPositions] of variantIdUsages.entries()) {
      if (variantPositions.length <= 1) continue;
      throw new Error(`Slide ${slideIndex + 1} has duplicate variant id "${variantId}" on variants ${variantPositions.join(', ')}.`);
    }
  });
  for (const [logicalId, positions] of logicalIdUsages.entries()) {
    if (positions.length <= 1) continue;
    throw new Error(`Deck has duplicate logical slide id "${logicalId}" on slides ${positions.join(', ')}.`);
  }
}

function buildLogicalSlideViewModel(slide, index, slideKeys, registries) {
  if (!slide.variants?.length) {
    const built = buildSlideViewModel(
      slide,
      index,
      registries.layouts,
      registries.themePacks,
      slideKeys[0],
      registries.layoutAliases,
      registries.defaultThemePack,
      slide.content,
    );
    return {
      ...built,
      id: slide.id,
      stateId: built.id,
      content: slide.content,
      context: {
        ...built.context,
        id: slide.id,
        stateId: built.id,
      },
    };
  }

  const variants = slide.variants.map((variant, variantIndex) => buildSlideViewModel(
    variant,
    index,
    registries.layouts,
    registries.themePacks,
    slideKeys[variantIndex],
    registries.layoutAliases,
    registries.defaultThemePack,
    slide.content,
  ));
  const selected = variants.find((variant) => variant.stateId === slide.selectedVariant) || variants[0];
  return {
    ...selected,
    id: slide.id,
    stateId: selected.stateId,
    variants,
    content: slide.content,
    context: {
      ...selected.context,
      id: slide.id,
      stateId: selected.stateId,
      variantId: selected.variantId,
      variantIndex: selected.variantIndex,
      variantCount: selected.variantCount,
      physicalId: slide.id,
      sourceSlideId: slide.id,
      variantMode: 'logical',
    },
  };
}

function buildComparisonPageDescriptors(slides, schemaVersion) {
  if (Number(schemaVersion) !== BESPOKE_SCHEMA_VERSION) return [];
  let comparisonIndex = 0;
  return slides.flatMap((slide) => slide.variants.map((variant) => ({
    id: variant.stateId,
    sourceSlideId: slide.id,
    stateId: variant.stateId,
    variantId: variant.variantId,
    variantKind: variant.variantKind,
    variantIndex: variant.variantIndex,
    variantCount: variant.variantCount,
    comparisonIndex: comparisonIndex++,
    selected: slide.stateId === variant.stateId,
    key: variant.key,
    themePack: variant.themePack,
    ...(variant.variantKind === 'template' ? { layout: variant.layout } : { adjustable: false }),
  })));
}

function buildSlideViewModel(
  slide,
  index,
  layoutOptions,
  themePacks,
  slideKey,
  layoutAliases = {},
  defaultThemePack,
  content,
) {
  const stateId = slide.stateId || slide.id;
  const pageId = slide.pageId || slide.id;
  if (slide.legacy) {
    return {
      id: stateId,
      stateId,
      pageId,
      key: slideKey,
      index,
      element: slide.element,
      sourceProps: {},
      themePack: defaultThemePack,
      context: {
        id: pageId,
        stateId,
        key: slideKey,
        index,
        themePack: defaultThemePack,
        legacy: true,
        textKeyPrefix: `text:${slideKey}:`,
      },
    };
  }
  if (isBespokeVariant(slide)) {
    return buildBespokeSlideViewModel(
      slide,
      index,
      slideKey,
      defaultThemePack,
      content,
      stateId,
      pageId,
    );
  }
  const resolvedLayout = layoutAliases[slide.layout] || slide.layout;
  const option = layoutOptions[resolvedLayout];
  if (!option) {
    throw new Error(`Unknown layout "${slide.layout}". Choose one of: ${Object.keys(layoutOptions).join(', ')}`);
  }
  const slideThemePack = findLayoutThemePack(resolvedLayout, themePacks) || defaultThemePack;
  const authoredProps = slide.props || {};
  const sourceProps = slide.contentMap
    ? resolveContentMap(content, normalizeContentMapSources(slide.contentMap), authoredProps)
    : authoredProps;
  const label = slide.label || inferSlideLabel(slide, index) || option.label;
  const renderProps = mergeSparsePropsForRender(
    getLayoutContract(resolvedLayout)?.defaultProps || {},
    normalizeSlidePropsForLayout(resolvedLayout, sourceProps),
  );
  return {
    id: stateId,
    stateId,
    pageId,
    variantId: slide.variantId,
    variantKind: slide.variantId ? (slide.variantKind || 'template') : undefined,
    variantIndex: slide.variantIndex,
    variantCount: slide.variantCount,
    key: slideKey,
    index,
    layout: resolvedLayout,
    label,
    dataLayout: option.dataLayout,
    themePack: slideThemePack,
    component: option.component,
    props: renderProps,
    sourceProps,
    authoredProps,
    contentMap: slide.contentMap,
    media: slide.media || {},
    logicalIndex: slide.logicalIndex,
    context: {
      id: pageId,
      stateId,
      variantId: slide.variantId,
      variantKind: slide.variantId ? (slide.variantKind || 'template') : undefined,
      variantIndex: slide.variantIndex,
      variantCount: slide.variantCount,
      key: slideKey,
      index,
      layout: resolvedLayout,
      label,
      dataLayout: option.dataLayout,
      themePack: slideThemePack,
      logicalIndex: slide.logicalIndex,
      media: slide.media || {},
      textKeyPrefix: `text:${slideKey}:`,
    },
  };
}

function buildBespokeSlideViewModel(
  slide,
  index,
  slideKey,
  defaultThemePack,
  content,
  stateId,
  pageId,
) {
  const authoredComposition = slide.composition || {};
  const composition = slide.contentMap
    ? resolveContentMap(content, normalizeContentMapSources(slide.contentMap), authoredComposition)
    : authoredComposition;
  const themePack = slide.themePack || defaultThemePack;
  const label = slide.label || 'Agent 定制方案';
  return {
    id: stateId,
    stateId,
    pageId,
    variantId: slide.variantId,
    variantKind: 'bespoke',
    variantIndex: slide.variantIndex,
    variantCount: slide.variantCount,
    adjustable: false,
    key: slideKey,
    index,
    label,
    dataLayout: 'bespoke',
    themePack,
    component: BespokeSlide,
    props: { composition },
    sourceProps: {},
    authoredProps: undefined,
    composition,
    authoredComposition,
    contentMap: slide.contentMap,
    media: slide.media || {},
    logicalIndex: slide.logicalIndex,
    context: {
      id: pageId,
      stateId,
      variantId: slide.variantId,
      variantKind: 'bespoke',
      variantIndex: slide.variantIndex,
      variantCount: slide.variantCount,
      adjustable: false,
      key: slideKey,
      index,
      label,
      dataLayout: 'bespoke',
      themePack,
      logicalIndex: slide.logicalIndex,
      media: slide.media || {},
      textKeyPrefix: `text:${slideKey}:`,
    },
  };
}

function normalizeContentMapSources(contentMap) {
  return Object.fromEntries(Object.entries(contentMap || {}).map(([targetPath, sourceMapping]) => {
    if (typeof sourceMapping === 'string') {
      return [
        targetPath,
        sourceMapping.startsWith('content.')
          ? sourceMapping.slice('content.'.length)
          : sourceMapping,
      ];
    }
    return [
      targetPath,
      {
        ...sourceMapping,
        source: sourceMapping?.source?.startsWith('content.')
          ? sourceMapping.source.slice('content.'.length)
          : sourceMapping?.source,
      },
    ];
  }));
}

function createBespokeSlideKey(sourceSlideId, variantId) {
  return `bespoke-${encodeURIComponent(sourceSlideId)}-${encodeURIComponent(variantId)}`;
}

function mergeSparsePropsForRender(defaultProps, sparseProps) {
  const next = { ...(defaultProps || {}) };
  for (const [key, value] of Object.entries(sparseProps || {})) {
    next[key] = mergeSparseValueForRender(next[key], value, key);
  }
  return next;
}

function mergeSparseValueForRender(defaultValue, sparseValue, key) {
  if (Array.isArray(defaultValue) && Array.isArray(sparseValue)) {
    if (isMediaArrayKey(key)) return sparseValue;
    const defaultItem = defaultValue.find(isPlainObject);
    const sparseHasObjects = sparseValue.some(isPlainObject);
    if (!defaultItem || !sparseHasObjects) return sparseValue;
    return sparseValue.map((item, index) => {
      return isPlainObject(item)
        ? mergeSparseValueForRender(defaultValue[index], item, key)
        : item;
    });
  }
  if (isPlainObject(defaultValue) && isPlainObject(sparseValue)) {
    const next = { ...defaultValue };
    for (const [key, value] of Object.entries(sparseValue)) {
      next[key] = mergeSparseValueForRender(next[key], value, key);
    }
    return next;
  }
  return sparseValue;
}

function isPlainObject(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function filterThemePacksForSlides(themePacks, slides) {
  const used = new Set(
    slides
      .flatMap(slide => slide.variants || [slide])
      .map(slide => slide.themePack)
      .filter(Boolean),
  );
  if (!used.size) return themePacks;
  return Object.fromEntries(
    Object.entries(themePacks).filter(([key]) => used.has(key)),
  );
}

function inferSlideLabel(slide, index) {
  const props = slide.props || {};
  const candidates = [
    props.head?.cn,
    props.titleCN,
    props.title,
    Array.isArray(props.titleLines) ? props.titleLines.join(' ') : null,
    props.headline,
    props.heading,
    props.bigWord,
    props.brand,
  ];
  return candidates.find(value => typeof value === 'string' && value.trim()) || `第 ${index + 1} 页`;
}

function createSlideKeys(slides, layoutAliases = {}) {
  const totals = new Map();
  slides.forEach((slide) => {
    const base = layoutAliases[slide.layout] || slide.layout || slide.id;
    totals.set(base, (totals.get(base) || 0) + 1);
  });

  const seen = new Map();
  return slides.map((slide) => {
    if (slide.key || slide.slideKey) return slide.key || slide.slideKey;
    const base = layoutAliases[slide.layout] || slide.layout || slide.id;
    const count = (seen.get(base) || 0) + 1;
    seen.set(base, count);
    return totals.get(base) > 1 ? `${base}-${count}` : base;
  });
}

function normalizeTextState(text, slides, layoutAliases = {}) {
  const entries = Object.entries(text || {});
  const firstLegacySlot = new Map();
  entries.forEach(([key]) => {
    const parsed = parseTextKey(key);
    if (!parsed || !/^\d+$/.test(parsed.slot)) return;
    const current = firstLegacySlot.get(parsed.target);
    const slot = Number(parsed.slot);
    if (current === undefined || slot < current) firstLegacySlot.set(parsed.target, slot);
  });

  const keyById = new Map(slides.map((slide) => [slide.id, slide.key]));
  const layoutToKeys = new Map();
  slides.forEach((slide) => {
    if (!slide.layout) return;
    const keys = layoutToKeys.get(slide.layout) || [];
    keys.push(slide.key);
    layoutToKeys.set(slide.layout, keys);
  });
  const stableKeys = new Set(slides.map((slide) => slide.key));

  return Object.fromEntries(entries.map(([key, value]) => {
    const parsed = parseTextKey(key);
    if (!parsed) return [key, value];
    if (stableKeys.has(parsed.target)) return [key, value];

    const aliasKey = resolveLayoutAliasKey(parsed.target, layoutAliases, layoutToKeys);
    if (aliasKey) return [`text:${aliasKey}:${parsed.slot}`, value];

    const targetKey = keyById.get(parsed.target) || resolveLegacyLayoutKey(parsed.target, layoutToKeys);
    if (!targetKey) return [key, value];

    const firstSlot = firstLegacySlot.get(parsed.target);
    const slot = firstSlot !== undefined && /^\d+$/.test(parsed.slot)
      ? String(Number(parsed.slot) - firstSlot + 1)
      : parsed.slot;
    return [`text:${targetKey}:${slot}`, value];
  }));
}

function parseTextKey(key) {
  const match = /^text:([^:]+):(.+)$/.exec(key);
  if (!match) return null;
  return {
    target: match[1],
    slot: match[2],
  };
}

function resolveLegacyLayoutKey(target, layoutToKeys) {
  const layout = target.replace(/-\d+$/, '');
  const keys = layoutToKeys.get(layout);
  return keys?.length === 1 ? keys[0] : null;
}

function resolveLayoutAliasKey(target, layoutAliases, layoutToKeys) {
  const layout = target.replace(/-\d+$/, '');
  const resolved = layoutAliases[layout];
  if (!resolved) return null;
  const keys = layoutToKeys.get(resolved);
  return keys?.length === 1 ? keys[0] : null;
}

function findLayoutThemePack(layout, themePacks = {}) {
  return Object.entries(themePacks)
    .find(([, option]) => option.layouts?.includes(layout))?.[0] || null;
}

function serializeThemePacks(registry) {
  return Object.fromEntries(
    Object.entries(registry).map(([key, option]) => [
      key,
      {
        label: option.label,
        displayName: option.displayName,
        scenario: option.scenario,
        audience: option.audience,
        layouts: option.layouts || [],
      },
    ]),
  );
}
