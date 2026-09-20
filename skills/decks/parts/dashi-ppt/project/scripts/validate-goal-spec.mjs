#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { isCssColorLike, isMediaArrayKey, isSerializedReactElementLike } from '../src/prop-contract-core.mjs';
import {
  BESPOKE_SCHEMA_VERSION,
  TEMPLATE_VARIANT_COUNT,
  TOTAL_VARIANT_COUNT,
  normalizedChartValue,
  resolveContentMap,
  validateBespokeComposition,
  validateContentMap,
} from '../src/variant-contract.mjs';
// 与预算生成同一把尺:视觉宽度折算(全角=1、半角=0.5),见 copy-contract.mjs(issue #15)。
import { charLength } from './workflow/copy-contract.mjs';
import {
  beginWorkflowStage,
  workflowTelemetryPath,
} from './workflow-telemetry.mjs';
import {
  NEUTRAL_PLACEHOLDERS,
  THEME_PAGES,
  buildTemplateProjectionPlan,
  contentShapeFromPresentation,
  getCopyBudgetsForLayout,
  inspectLayout,
  getMediaSlotsForLayout,
  getLayoutRecord,
  getThemePackMetadata,
  isDeckLocalMediaSource,
  isCoverCandidate,
  isCoverLikeLayout,
  layoutExists,
  mediaSlotCapacity,
  normalizeProps,
  unknownPropKeys,
} from './skill-workflow-utils.mjs';

const ALLOWED_INLINE_TAGS = new Set(['b', 'strong', 'i', 'em', 'br', 'sup', 'sub']);
const NON_CONTENT_STRING_FIELD_PATTERN = /^(id|key|type|kind|tone|color|colour|accent|fill|stroke|background|bg|tint|hex|variant|style|theme|mode|layout|align|side|position|icon|href|url|src|fit|className)$/i;
const ALLOWED_MEDIA_ITEM_FIELDS = new Set(['src', 'kind', 'type', 'ar', 'ratio', 'poster']);
const VARIANT_STATE_ID_SEPARATOR = '::';

export function validateGoalSpec(spec, options = {}) {
  const errors = [];
  const slides = Array.isArray(spec?.slides) ? spec.slides : [];
  const authoredSlides = Array.isArray(options.authoredSpec?.slides) ? options.authoredSpec.slides : null;
  const mediaUsages = new Map();
  const layoutUsages = new Map();
  const deckCoreCopyUsages = new Map();
  const schemaVersion = spec?.schemaVersion == null ? 1 : Number(spec.schemaVersion);
  if (!Number.isInteger(schemaVersion) || ![1, BESPOKE_SCHEMA_VERSION].includes(schemaVersion)) {
    errors.push(`deck field schemaVersion: unsupported "${spec?.schemaVersion}" (use 1 or ${BESPOKE_SCHEMA_VERSION})`);
  }
  validateLogicalSlideIdentities(slides, errors);
  const { layoutEntries, bespokeEntries } = expandLayoutEntries(
    slides,
    authoredSlides,
    errors,
    { ...options, schemaVersion },
  );

  if (!slides.length) {
    errors.push('deck field slides: final delivery goal must include non-empty slides with concrete layout values');
  }

  validateFreeHtml(spec?.title, 'deck', '<deck>', 'title', errors);
  validateFreeHtml(spec?.goal, 'deck', '<deck>', 'goal', errors);
  validateNoSerializedReactElements(spec?.text, 'deck', '<deck>', 'text', errors);
  validateNoSerializedReactElements(spec?.props, 'deck', '<deck>', 'props', errors);
  validateObjectStrings(spec?.text, 'deck', '<deck>', 'text', errors);
  validateObjectStrings(spec?.props, 'deck', '<deck>', 'props', errors);

  if (spec?.themePack && !getThemePackMetadata(spec.themePack)) {
    errors.push(`deck field themePack: unknown or unavailable themePack "${spec.themePack}"`);
  }

  if (spec?.language != null && !/^(zh|en)([-_][a-z0-9]+)?$/i.test(String(spec.language).trim())) {
    errors.push(`deck field language: unsupported "${spec.language}" (use "zh" or "en")`);
  }

  if (Object.prototype.hasOwnProperty.call(spec || {}, 'media')) {
    errors.push('deck layout <deck> field media: top-level media is not rendered; use each slide props.images or props.media');
  }

  const coverCandidatesBySlide = new Map();
  const nonCandidateCoverLikes = [];

  layoutEntries.forEach((entry) => {
    const {
      slide,
      slideNumber,
      logicalSlideNumber,
      authoredSlide,
      location,
    } = entry;
    const layout = slide?.layout;
    const layoutLabel = layout || '<missing>';

    if (!layout) {
      const role = slide?.role ? ` role "${slide.role}"` : '';
      errors.push(`slide ${slideNumber} layout <missing> field layout: final goal must use a concrete layout${role}`);
      return;
    }

    if (!layoutExists(layout)) {
      errors.push(`slide ${slideNumber} layout ${layout} field layout: unknown layout`);
      return;
    }

    const usages = layoutUsages.get(layout) || [];
    usages.push(location);
    layoutUsages.set(layout, usages);

    if (Object.prototype.hasOwnProperty.call(slide, 'media')) {
      errors.push(`slide ${slideNumber} layout ${layoutLabel} field media: slides[].media is not rendered; use props.images or props.media`);
    }

    if (Object.prototype.hasOwnProperty.call(slide, 'copy')) {
      errors.push(`slide ${slideNumber} layout ${layoutLabel} field copy: slides[].copy is not supported in final goal specs; write authored values under props`);
    }

    const record = getLayoutRecord(layout);
    const props = slide?.props || {};
    const authoredProps = authoredSlide?.props || props;
    validateNoSerializedReactElements(props, `slide ${slideNumber}`, layoutLabel, 'props', errors);
    validateNoSerializedReactElements(slide?.copy, `slide ${slideNumber}`, layoutLabel, 'copy', errors);
    validateMediaIntent(slide, slideNumber, layoutLabel, props, errors, options);
    validateMediaProps(slideNumber, layoutLabel, props, errors);
    collectMediaUsages(props, slideNumber, logicalSlideNumber, layoutLabel, mediaUsages);

    for (const key of unknownPropKeys(record, props)) {
      errors.push(`slide ${slideNumber} theme ${themeFromLayout(layoutLabel)} layout ${layoutLabel} field ${key}: unknown prop for this layout`);
    }

    const normalized = normalizeProps(layout, props);
    const shapeChecked = authoredSlides ? normalizeProps(layout, authoredProps) : normalized;
    for (const error of shapeChecked.errors || []) {
      errors.push(`slide ${slideNumber} layout ${layoutLabel} field props: ${error}`);
    }

    validateVisibleDirtyCopy(layout, normalized.props || props, authoredProps, slideNumber, layoutLabel, errors);
    validateCountBindingConsistency(layout, props, slideNumber, layoutLabel, errors);
    validateLengthBindingConsistency(layout, props, slideNumber, layoutLabel, errors);
    if (authoredSlides) {
      const authoredLengthErrors = [];
      validateLengthBindingConsistency(layout, authoredProps, slideNumber, layoutLabel, authoredLengthErrors);
      pushUniqueErrors(errors, authoredLengthErrors);
    }
    validateObjectStrings(props, `slide ${slideNumber}`, layoutLabel, 'props', errors);
    validateArrayCapacities(layout, props, slideNumber, layoutLabel, errors);
    validateCopyBudgets(layout, props, slideNumber, layoutLabel, errors);
    validateRepeatedVisibleCopy(layout, props, slideNumber, layoutLabel, errors);
    collectDeckCoreCopy(layout, normalized.props || props, authoredProps, logicalSlideNumber, layoutLabel, deckCoreCopyUsages);
    validateObjectStrings(slide?.copy, `slide ${slideNumber}`, layoutLabel, 'copy', errors);

    if (isCoverCandidate(layout)) {
      const rows = coverCandidatesBySlide.get(logicalSlideNumber) || [];
      rows.push(layout);
      coverCandidatesBySlide.set(logicalSlideNumber, rows);
    }
    else if (isCoverLikeLayout(layout)) nonCandidateCoverLikes.push({ slideNumber, layout });
  });

  bespokeEntries.forEach((entry) => {
    validateBespokeEntry(entry, errors, mediaUsages, options);
  });

  const logicalCoverSlides = [...coverCandidatesBySlide.keys()];
  if (logicalCoverSlides.length > 1) {
    const layouts = logicalCoverSlides
      .map(slideNumber => `slide ${slideNumber}: ${coverCandidatesBySlide.get(slideNumber).join(', ')}`)
      .join('; ');
    errors.push(`deck field cover: only one logical cover slide is allowed, found logical slides ${logicalCoverSlides.join(', ')} (${layouts})`);
  }

  for (const item of nonCandidateCoverLikes) {
    errors.push(`slide ${item.slideNumber} layout ${item.layout} field layout: cover-like layouts must use themeXX_page001-page005`);
  }

  if (schemaVersion !== BESPOKE_SCHEMA_VERSION) validateUniqueLayouts(layoutUsages, errors);
  validateDeckRepeatedCoreCopy(deckCoreCopyUsages, errors);

  if (spec?.allowMediaReuse !== true) validateUniqueMediaUsages(mediaUsages, errors);

  return errors;
}

function pushUniqueErrors(errors, candidates) {
  for (const error of candidates) {
    if (!errors.includes(error)) errors.push(error);
  }
}

function validateLogicalSlideIdentities(slides, errors) {
  const usages = new Map();
  slides.forEach((slide, index) => {
    const logicalSlideNumber = index + 1;
    const id = resolveLogicalSlideId(slide, index);
    if (id.includes(VARIANT_STATE_ID_SEPARATOR)) {
      errors.push(`slide ${logicalSlideNumber} field id: reserved delimiter "${VARIANT_STATE_ID_SEPARATOR}" is not allowed in logical slide ids because it makes stateId ambiguous`);
    }
    const positions = usages.get(id) || [];
    positions.push(logicalSlideNumber);
    usages.set(id, positions);
  });
  for (const [id, positions] of usages.entries()) {
    if (positions.length <= 1) continue;
    errors.push(`deck field slides: duplicate logical slide id "${id}" on slides ${positions.join(', ')}`);
  }
}

function resolveLogicalSlideId(slide, index) {
  if (slide?.id != null && slide.id !== '') return String(slide.id);
  if (Object.prototype.hasOwnProperty.call(slide || {}, 'variants')) {
    return String(slide?.key || slide?.slideKey || `slide-${index + 1}`);
  }
  const layout = typeof slide === 'string' ? slide : slide?.layout || slide?.layoutName || 'slide';
  return `${layout}-${index + 1}`;
}

function expandLayoutEntries(slides, authoredSlides, errors, options = {}) {
  const layoutEntries = [];
  const bespokeEntries = [];
  const isV2Deck = options.schemaVersion === BESPOKE_SCHEMA_VERSION;

  slides.forEach((slide, index) => {
    const logicalSlideNumber = index + 1;
    const hasVariants = Object.prototype.hasOwnProperty.call(slide || {}, 'variants');
    const hasLegacyLayout = Object.prototype.hasOwnProperty.call(slide || {}, 'layout');
    if (!hasVariants) {
      if (isV2Deck) {
        errors.push(`slide ${logicalSlideNumber} field variants: schemaVersion ${BESPOKE_SCHEMA_VERSION} requires exactly ${TOTAL_VARIANT_COUNT} variants (3 template + 1 bespoke)`);
        return;
      }
      layoutEntries.push({
        slide,
        authoredSlide: authoredSlides?.[index],
        slideNumber: logicalSlideNumber,
        logicalSlideNumber,
        location: `slide ${logicalSlideNumber}`,
      });
      return;
    }
    if (hasLegacyLayout || Object.prototype.hasOwnProperty.call(slide || {}, 'props')) {
      errors.push(`slide ${logicalSlideNumber} field variants: variant slides cannot also define top-level layout or props`);
    }
    if (!Array.isArray(slide?.variants)) {
      const expected = isV2Deck ? `${TOTAL_VARIANT_COUNT} items (3 template + 1 bespoke)` : 'exactly 3 items';
      errors.push(`slide ${logicalSlideNumber} field variants: must be an array with ${expected}`);
      return;
    }
    const expectedCount = isV2Deck ? TOTAL_VARIANT_COUNT : 3;
    if (slide.variants.length !== expectedCount) {
      const expected = isV2Deck ? `${TOTAL_VARIANT_COUNT} items (3 template + 1 bespoke)` : 'exactly 3 items';
      errors.push(`slide ${logicalSlideNumber} field variants: must contain ${expected}, found ${slide.variants.length}`);
    }
    if (isV2Deck) {
      validateLogicalContent(slide, logicalSlideNumber, errors, options);
    }
    const ids = new Set();
    const layouts = new Set();
    for (const [variantIndex, item] of slide.variants.entries()) {
      const id = String(item?.id || '');
      if (!id.trim()) {
        errors.push(`slide ${logicalSlideNumber} variant ${variantIndex + 1} field id: non-empty variant id is required`);
      } else if (ids.has(id)) {
        errors.push(`slide ${logicalSlideNumber} field variants: duplicate variant id "${id}"`);
      }
      if (id.includes(VARIANT_STATE_ID_SEPARATOR)) {
        errors.push(`slide ${logicalSlideNumber} variant ${id || variantIndex + 1} field id: reserved delimiter "${VARIANT_STATE_ID_SEPARATOR}" is not allowed in variant ids because it makes stateId ambiguous`);
      }
      if (id) ids.add(id);
      if (Object.prototype.hasOwnProperty.call(item || {}, 'content')) {
        errors.push(`slide ${logicalSlideNumber} variant ${id || variantIndex + 1} field content: variant content is not allowed; keep the single content source at slide.content`);
      }
      const expectedKind = isV2Deck
        ? (variantIndex < TEMPLATE_VARIANT_COUNT ? 'template' : variantIndex === TEMPLATE_VARIANT_COUNT ? 'bespoke' : null)
        : 'template';
      if (isV2Deck && expectedKind && item?.kind !== expectedKind) {
        errors.push(`slide ${logicalSlideNumber} variant ${id || variantIndex + 1} field kind: variant ${variantIndex + 1} must be "${expectedKind}"`);
      }
      const isBespoke = isV2Deck && variantIndex === TEMPLATE_VARIANT_COUNT;
      if (isBespoke) {
        validateBespokeEnvelope(item, slide, logicalSlideNumber, id || variantIndex + 1, errors, options);
        continue;
      }
      const layout = String(item?.layout || '').trim();
      if (layout && layouts.has(layout)) {
        errors.push(`slide ${logicalSlideNumber} field variants: duplicate layout "${layout}"`);
      }
      if (layout) layouts.add(layout);
      if (!item?.props || typeof item.props !== 'object' || Array.isArray(item.props)) {
        errors.push(`slide ${logicalSlideNumber} variant ${id || variantIndex + 1} field props: object is required`);
      }
      if (isV2Deck) {
        validateContentMapEnvelope(item, slide, logicalSlideNumber, id || variantIndex + 1, errors, options);
      }
    }
    if (typeof slide.selectedVariant !== 'string' || !ids.has(slide.selectedVariant)) {
      errors.push(`slide ${logicalSlideNumber} field selectedVariant: "${slide.selectedVariant ?? '<missing>'}" does not match a variant id`);
    }
    if (isV2Deck) {
      validateCanonicalVariantContent(slide, logicalSlideNumber, errors, options);
      const authoredLogicalSlide = authoredSlides?.[index];
      if (authoredLogicalSlide) {
        validateCanonicalVariantContent(
          authoredLogicalSlide,
          logicalSlideNumber,
          errors,
          options,
          ' authored',
        );
      }
    }
    const templateVariants = isV2Deck ? slide.variants.slice(0, TEMPLATE_VARIANT_COUNT) : slide.variants;
    const coverCount = templateVariants.filter(item => isCoverCandidate(item?.layout)).length;
    if (coverCount > 0 && coverCount !== templateVariants.length) {
      errors.push(`slide ${logicalSlideNumber} field variants: cover and body layouts cannot be mixed on one logical slide`);
    }
    slide.variants.forEach((item, variantIndex) => {
      const variantId = String(item?.id || variantIndex + 1);
      const authoredLogicalSlide = authoredSlides?.[index];
      const authoredVariant = authoredLogicalSlide?.variants?.[variantIndex];
      if (isV2Deck && variantIndex === TEMPLATE_VARIANT_COUNT) {
        bespokeEntries.push({
          slide: {
            ...item,
            composition: resolveMappedRenderData(
              slide?.content,
              item?.contentMap,
              item?.composition,
              `slide ${logicalSlideNumber} variant ${variantId}`,
              errors,
              options,
            ),
          },
          authoredSlide: authoredVariant
            ? {
              ...authoredVariant,
              composition: resolveMappedRenderData(
                authoredLogicalSlide?.content,
                authoredVariant?.contentMap,
                authoredVariant?.composition,
                `slide ${logicalSlideNumber} variant ${variantId} authored`,
                errors,
                options,
              ),
            }
            : null,
          slideNumber: `${logicalSlideNumber} variant ${variantId}`,
          logicalSlideNumber,
          location: `slide ${logicalSlideNumber} variant ${variantId}`,
        });
        return;
      }
      const resolvedProps = isV2Deck
        ? resolveMappedRenderData(
          slide?.content,
          item?.contentMap,
          item?.props,
          `slide ${logicalSlideNumber} variant ${variantId}`,
          errors,
          options,
        )
        : item?.props;
      const authoredProps = isV2Deck && authoredVariant
        ? resolveMappedRenderData(
          authoredLogicalSlide?.content,
          authoredVariant?.contentMap,
          authoredVariant?.props,
          `slide ${logicalSlideNumber} variant ${variantId} authored`,
          errors,
          options,
        )
        : authoredVariant?.props;
      layoutEntries.push({
        slide: { ...item, props: resolvedProps },
        authoredSlide: authoredVariant ? { ...authoredVariant, props: authoredProps } : null,
        slideNumber: `${logicalSlideNumber} variant ${variantId}`,
        logicalSlideNumber,
        location: `slide ${logicalSlideNumber} variant ${variantId}`,
      });
    });
  });
  return { layoutEntries, bespokeEntries };
}

function validateLogicalContent(slide, slideNumber, errors, options = {}) {
  if (Object.prototype.hasOwnProperty.call(slide || {}, 'views')) {
    errors.push(`slide ${slideNumber} field views: candidate-specific slide views are not allowed; keep one canonical slide.content source`);
  }
  if (!isPlainRecord(slide?.content)) {
    if (!options.allowUnfilledContent) {
      errors.push(`slide ${slideNumber} field content: schemaVersion ${BESPOKE_SCHEMA_VERSION} requires a single content source object`);
    }
    return;
  }
  if (!Object.keys(slide.content).length && !options.allowUnfilledContent) {
    errors.push(`slide ${slideNumber} field content: content source must not be empty`);
  }
  validateNoSerializedReactElements(slide.content, `slide ${slideNumber}`, '<content>', 'content', errors);
  validateObjectStrings(slide.content, `slide ${slideNumber}`, '<content>', 'content', errors);
  validatePlaceholderCopy(slide.content, `slide ${slideNumber}`, '<content>', 'content', errors);
  validatePresentationChartData(slide.content.presentation, slideNumber, errors);
}

function validatePresentationChartData(presentation, slideNumber, errors) {
  if (!isPlainRecord(presentation) || presentation.chartData == null) return;
  const pathName = `slide ${slideNumber} field content.presentation.chartData`;
  if (!Array.isArray(presentation.chartData)) {
    errors.push(`${pathName}: expected an array`);
    return;
  }
  if (presentation.chartData.length > 12) {
    errors.push(`${pathName}: expected at most 12 items`);
  }
  const ids = new Set();
  presentation.chartData.forEach((item, index) => {
    const itemPath = `${pathName}[${index}]`;
    if (!isPlainRecord(item)) {
      errors.push(`${itemPath}: expected an object`);
      return;
    }
    const label = String(item.label ?? item.name ?? '').trim();
    if (!label) errors.push(`${itemPath}.label: expected a non-empty string`);
    const id = String(item.id || '').trim();
    if (!id) {
      errors.push(`${itemPath}.id: expected a stable non-empty string`);
    } else if (ids.has(id)) {
      errors.push(`${itemPath}.id: duplicate "${id}"`);
    } else {
      ids.add(id);
    }
    if (!Number.isFinite(normalizedChartValue(item))) {
      errors.push(`${itemPath}.value: expected a finite or formatted numeric value`);
    }
  });
}

function validateCanonicalVariantContent(
  slide,
  slideNumber,
  errors,
  options = {},
  scopeSuffix = '',
) {
  const variants = Array.isArray(slide?.variants) ? slide.variants.slice(0, TOTAL_VARIANT_COUNT) : [];
  const variantIds = new Set(variants.map((variant, index) => String(variant?.id || `v${index + 1}`)));
  validateCanonicalContentNamespaces(slide?.content, variantIds, slideNumber, errors, scopeSuffix);
  if (options.allowUnfilledContent) return;

  const traces = variants.map((variant, index) => (
    index < TEMPLATE_VARIANT_COUNT
      ? validateTemplateCanonicalContent(variant, slide?.content, slideNumber, errors, scopeSuffix)
      : validateBespokeCanonicalContent(variant, slideNumber, errors, scopeSuffix)
  ));
  if (traces.length !== TOTAL_VARIANT_COUNT) return;

  const templateTraces = traces.slice(0, TEMPLATE_VARIANT_COUNT);
  const bespokeTrace = traces[TEMPLATE_VARIANT_COUNT];
  const titleSets = templateTraces
    .filter(trace => trace.titleTargetCount > 0)
    .map(trace => new Set(
      [...trace.titleSources].map(canonicalTitleSourceFamily),
    ));
  if (titleSets.length >= 2 && (titleSets.some(set => !set.size) || !intersectSets(titleSets).size)) {
    errors.push(`slide ${slideNumber}${scopeSuffix} field contentMap: all three template variants must trace a title to the same canonical title family in slide.content`);
  }

  const coreRoots = canonicalCoreRoots(slide?.content);
  if (coreRoots.size) {
    const sharedSourceRoots = intersectSets(templateTraces.map(trace => trace.sourceRoots));
    const sharedCoreRoots = new Set([...sharedSourceRoots].filter(root => coreRoots.has(root)));
    if (!sharedCoreRoots.size) {
      errors.push(`slide ${slideNumber}${scopeSuffix} field contentMap: all three template variants must trace core facts to at least one shared canonical slide.content root`);
    }
    const bespokeCoreRoots = new Set(
      [...(bespokeTrace?.sourceRoots || [])].filter(root => coreRoots.has(root)),
    );
    if (!bespokeCoreRoots.size) {
      errors.push(`slide ${slideNumber}${scopeSuffix} field contentMap: bespoke variant must stay traceable to canonical slide.content facts`);
    }
  }
}

function validateCanonicalContentNamespaces(content, variantIds, slideNumber, errors, scopeSuffix = '') {
  if (!isPlainRecord(content)) return;
  const visit = (value, pathName, parentKey = '') => {
    if (!value || typeof value !== 'object') return;
    for (const [key, item] of Object.entries(value)) {
      const itemPath = `${pathName}.${key}`;
      const isNamespace = item != null && typeof item === 'object';
      const variantNamespace = isNamespace && (
        variantIds.has(key)
        || isVariantNamedNamespace(key, variantIds)
        || (parentKey === 'views' && variantIds.has(key))
      );
      if (key === 'variants' || variantNamespace) {
        errors.push(`slide ${slideNumber}${scopeSuffix} field ${itemPath}: candidate-specific content namespace is not allowed; keep one canonical slide.content source`);
      }
      visit(item, itemPath, key);
    }
  };
  visit(content, 'content');
}

function isVariantNamedNamespace(key, variantIds) {
  const normalized = String(key || '').toLowerCase().replace(/[\s_-]+/g, '');
  for (const id of variantIds) {
    const variantId = String(id).toLowerCase().replace(/[\s_-]+/g, '');
    if (!variantId) continue;
    if (normalized === `view${variantId}`
      || normalized === `variant${variantId}`
      || normalized === `candidate${variantId}`) return true;
  }
  return false;
}

function validateTemplateCanonicalContent(variant, content, slideNumber, errors, scopeSuffix = '') {
  const variantId = String(variant?.id || '<missing>');
  const inspected = inspectLayout(variant?.layout, { compact: true }) || {};
  const businessTargets = templateBusinessTargets(inspected);
  const requiredTargets = templateRequiredTargets(
    inspected,
    content,
    businessTargets,
    variant?.props,
  );
  const titleTargets = templateTitleTargets(inspected, content);
  const contentMap = isPlainRecord(variant?.contentMap) ? variant.contentMap : {};
  validateContentMapTargetCoverage(
    contentMap,
    requiredTargets,
    `slide ${slideNumber}${scopeSuffix} variant ${variantId}`,
    errors,
  );
  // Hidden or currently disabled business fields still cannot carry candidate-
  // local copy in props: a user may re-enable the real control later.  A safely
  // disabled target may omit its mapping, but it must not retain stale payload.
  validateNoIndependentVisibleValues(
    variant?.props,
    businessTargets,
    'props',
    `slide ${slideNumber}${scopeSuffix} variant ${variantId}`,
    errors,
  );
  return {
    titleSources: mappedSourcesForTargets(contentMap, titleTargets),
    titleTargetCount: titleTargets.length,
    sourceRoots: contentMapSourceRoots(contentMap),
  };
}

function templateBusinessTargets(inspected) {
  const contracts = inspected?.fieldContracts || [];
  const explicitDecorativePaths = (inspected?.decorativeKeys || [])
    .map(normalizeTemplateTargetPath)
    .filter(Boolean);
  const mediaPaths = (inspected?.mediaSlots || [])
    .flatMap(slot => [
      slot?.field,
      slot?.fieldPath,
      slot?.writableProp,
      slot?.presetProp,
    ])
    .map(normalizeTemplateTargetPath)
    .filter(Boolean);
  const controlPaths = new Set(
    (inspected?.controls || [])
      .flatMap(control => [control?.key, control?.publicKey])
      .map(normalizeTemplateTargetPath)
      .filter(Boolean),
  );
  const explicitlyNonBusinessPaths = contracts
    .filter(contract => (
      contract?.businessContent === false
      || ['decorative', 'media', 'control'].includes(String(contract?.role || '').toLowerCase())
    ))
    .map(contract => normalizeTemplateTargetPath(contract?.key))
    .filter(Boolean);

  const contractFor = key => contracts.find(contract => (
    normalizeContractPath(contract?.key) === normalizeContractPath(key)
    || reduceArrayTarget(normalizeTemplateTargetPath(contract?.key))
      === reduceArrayTarget(normalizeTemplateTargetPath(key))
  ));
  const targets = new Set();
  const add = (key, role) => {
    const pathName = normalizeTemplateTargetPath(key);
    const target = reduceArrayTarget(pathName);
    if (!target) return;
    const contract = contractFor(pathName);
    const roles = [role, contract?.role].map(value => String(value || '').toLowerCase());
    if (roles.some(value => ['decorative', 'media', 'control'].includes(value))) return;
    if (contract?.businessContent === false) return;
    if (controlPaths.has(target)) return;
    if (explicitDecorativePaths.some(pathValue => templatePathOverlaps(pathValue, target))) return;
    if (mediaPaths.some(pathValue => templatePathOverlaps(pathValue, target))) return;
    if (explicitlyNonBusinessPaths.some(pathValue => templatePathOverlaps(pathValue, target))) return;
    targets.add(target);
  };

  for (const field of inspected?.fillPlan?.text || []) add(field?.key, field?.role);
  for (const field of inspected?.fillPlan?.arrays || []) add(field?.key, field?.role);
  for (const contract of contracts) add(contract?.key, contract?.role);
  return [...targets];
}

function templateRequiredTargets(inspected, content, businessTargets, props = {}) {
  const contentShape = contentShapeFromPresentation(content?.presentation);
  const projectionPlan = buildTemplateProjectionPlan(inspected, contentShape);
  const primary = projectionPlan.primaryContentContainer;
  const itemCount = contentShape.required.itemCount;
  const primaryTargets = primary?.kind === 'scalar-group'
    ? primary.slots
      .slice(0, itemCount || primary.slots.length)
      .flatMap(slot => Object.values(slot.fields))
    : primary?.kind === 'array'
      ? [primary.key]
      : [];
  return [...new Set([
    ...businessTargets,
    ...primaryTargets.map(reduceArrayTarget),
  ].filter(Boolean))]
    .filter(target => !templateTargetSafelyDisabled(target, inspected, props));
}

function templateTargetSafelyDisabled(target, inspected, props = {}) {
  const arrayField = (inspected?.fillPlan?.arrays || []).find(field => (
    reduceArrayTarget(normalizeTemplateTargetPath(field?.key)) === target
  ));
  if (arrayField && templateArrayCountIsSafelyZero(arrayField, inspected, props)) return true;

  const toggle = templateToggleForTarget(target, inspected);
  if (!toggle) return false;
  const enabled = props?.[toggle.key]
    ?? props?.[toggle.publicKey]
    ?? toggle.default;
  if (enabled !== false) return false;

  // A hidden array whose real component contract requires items still needs a
  // canonical projection.  Keeping that data is what makes re-enabling the
  // control safe and avoids violating min/fixed-length contracts.
  return !arrayField || templateArrayMinimum(arrayField, inspected) === 0;
}

function templateArrayCountIsSafelyZero(field, inspected, props) {
  const binding = templateCountBindingForArray(field, inspected);
  if (!binding && !field?.countKey) return false;
  const control = (inspected?.controls || []).find(item => (
    item?.key === binding?.key
    || item?.publicKey === binding?.publicKey
    || item?.key === field?.countKey
    || item?.publicKey === field?.countKey
  ));
  const count = props?.[binding?.key]
    ?? props?.[binding?.publicKey]
    ?? props?.[field?.countKey]
    ?? control?.default
    ?? inspected?.defaultVisibleCounts?.[binding?.publicKey]
    ?? inspected?.defaultVisibleCounts?.[binding?.key]
    ?? inspected?.defaultVisibleCounts?.[field?.countKey]
    ?? field?.visibleCount;
  return Number(count) === 0 && templateArrayMinimum(field, inspected) === 0;
}

function templateArrayMinimum(field, inspected) {
  const binding = templateCountBindingForArray(field, inspected);
  const control = (inspected?.controls || []).find(item => (
    item?.key === binding?.key
    || item?.publicKey === binding?.publicKey
    || item?.key === field?.countKey
    || item?.publicKey === field?.countKey
  ));
  for (const value of [binding?.min, control?.min, field?.minCount, field?.fixedLength]) {
    const number = Number(value);
    if (Number.isFinite(number)) return Math.max(0, number);
  }
  if (!binding && !field?.countKey) {
    const visible = Number(field?.visibleCount);
    if (Number.isFinite(visible)) return Math.max(0, visible);
  }
  return 0;
}

function templateCountBindingForArray(field, inspected) {
  const fieldKey = normalizeTemplateTargetPath(field?.key);
  return (inspected?.countBindings || []).find(binding => (
    (binding?.arrays || []).some(arrayPath => (
      normalizeTemplateTargetPath(arrayPath) === fieldKey
    ))
    || binding?.key === field?.countKey
    || binding?.publicKey === field?.countKey
  ));
}

function templateToggleForTarget(target, inspected) {
  const parts = normalizeTemplateTargetPath(target).split('.').filter(Boolean);
  const root = normalizeToggleToken(parts[0]);
  const leaf = normalizeToggleToken(parts.at(-1));
  const full = normalizeToggleToken(parts.join(''));
  const targetTokens = new Set([root, leaf, full].filter(Boolean));
  return (inspected?.controls || []).find(control => {
    if (control?.type !== 'toggle') return false;
    const keys = [control?.key, control?.publicKey]
      .map(normalizeToggleToken)
      .filter(Boolean);
    return keys.some(key => key.startsWith('show') && targetTokens.has(key.slice(4)));
  });
}

function normalizeToggleToken(value) {
  return String(value || '').replace(/[^a-z0-9]/gi, '').toLowerCase();
}

function normalizeTemplateTargetPath(value) {
  return String(value || '')
    .replace(/^props\./, '')
    .replace(/\[\d+\]/g, '[]')
    .replace(/\.$/, '');
}

function templatePathOverlaps(left, right) {
  const a = reduceArrayTarget(normalizeTemplateTargetPath(left));
  const b = reduceArrayTarget(normalizeTemplateTargetPath(right));
  return a === b || a.startsWith(`${b}.`) || b.startsWith(`${a}.`);
}

function hasContentValue(value) {
  return value !== undefined && value !== null && value !== '';
}

function canonicalTitleSourceFamily(source) {
  return source === 'presentation.titleShort' ? 'presentation.title' : source;
}

function templateTitleTargets(inspected, content) {
  const projectionPlan = buildTemplateProjectionPlan(
    inspected,
    contentShapeFromPresentation(content?.presentation),
  );
  if (projectionPlan.titleTarget) return [projectionPlan.titleTarget];
  const targets = [...new Set(Object.entries(inspected?.copyRoles || {})
    .filter(([, role]) => role === 'title')
    .map(([target]) => reduceArrayTarget(target))
    .filter(Boolean))];
  const primary = targets.filter(target => /(?:title|headline|heading|subject|topic)/i.test(target));
  return primary.length ? primary : targets;
}

function reduceArrayTarget(pathName) {
  const value = String(pathName || '');
  const arrayIndex = value.indexOf('[]');
  return arrayIndex === -1 ? value : value.slice(0, arrayIndex).replace(/\.$/, '');
}

function validateBespokeCanonicalContent(variant, slideNumber, errors, scopeSuffix = '') {
  const variantId = String(variant?.id || '<missing>');
  const composition = isPlainRecord(variant?.composition) ? variant.composition : {};
  const { requiredTargets, visibleTargets, titleTargets } = bespokeContentTargets(composition);
  const contentMap = isPlainRecord(variant?.contentMap) ? variant.contentMap : {};
  validateContentMapTargetCoverage(
    contentMap,
    requiredTargets,
    `slide ${slideNumber}${scopeSuffix} variant ${variantId}`,
    errors,
  );
  validateNoIndependentVisibleValues(
    composition,
    visibleTargets,
    'composition',
    `slide ${slideNumber}${scopeSuffix} variant ${variantId}`,
    errors,
  );
  return {
    titleSources: mappedSourcesForTargets(contentMap, titleTargets),
    titleTargetCount: titleTargets.length,
    sourceRoots: contentMapSourceRoots(contentMap),
  };
}

function bespokeContentTargets(composition) {
  const requiredTargets = [];
  const visibleTargets = [];
  const titleTargets = [];
  (composition?.elements || []).forEach((element, index) => {
    const base = `elements[${index}]`;
    const requiredFields = {
      text: ['text'],
      metric: ['value', 'label'],
      list: ['items'],
      quote: ['quote'],
      media: ['src'],
      chart: ['data'],
    }[element?.type] || [];
    const visibleFields = {
      text: ['text'],
      metric: ['value', 'label', 'detail', 'trend'],
      list: ['items'],
      quote: ['quote', 'attribution'],
      media: ['src', 'alt'],
      chart: ['data'],
    }[element?.type] || [];
    requiredTargets.push(...requiredFields.map(field => `${base}.${field}`));
    visibleTargets.push(...visibleFields.map(field => `${base}.${field}`));
    if (element?.type === 'text' && element?.role === 'title') {
      titleTargets.push(`${base}.text`);
    }
  });
  return { requiredTargets, visibleTargets, titleTargets };
}

function validateContentMapTargetCoverage(contentMap, requiredTargets, scope, errors) {
  const mappedTargets = Object.keys(contentMap || {});
  for (const target of requiredTargets) {
    if (mappedTargets.some(mappedTarget => mappedTargetCovers(mappedTarget, target))) continue;
    errors.push(`${scope} field contentMap: visible target "${target}" is not mapped from canonical slide.content`);
  }
}

function mappedTargetCovers(mappedTarget, requiredTarget) {
  const mapped = String(mappedTarget || '');
  const required = String(requiredTarget || '');
  return mapped === required
    || required.startsWith(`${mapped}.`)
    || required.startsWith(`${mapped}[`);
}

function validateNoIndependentVisibleValues(value, targets, fieldPrefix, scope, errors) {
  for (const target of targets) {
    const found = readSimplePath(value, target);
    if (!found.found || !hasVisibleNarrativeValue(found.value)) continue;
    errors.push(`${scope} field ${fieldPrefix}.${target}: visible copy/data must come from slide.content via contentMap`);
  }
}

function readSimplePath(value, pathName) {
  const tokens = [];
  for (const match of String(pathName || '').matchAll(/([A-Za-z_$][A-Za-z0-9_$-]*)|\[(\d+)\]/g)) {
    tokens.push(match[1] ?? Number(match[2]));
  }
  let current = value;
  for (const token of tokens) {
    if (current == null || typeof current !== 'object' || !Object.prototype.hasOwnProperty.call(current, token)) {
      return { found: false, value: undefined };
    }
    current = current[token];
  }
  return { found: true, value: current };
}

function hasVisibleNarrativeValue(value) {
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'number') return Number.isFinite(value);
  if (Array.isArray(value)) return value.some(hasVisibleNarrativeValue);
  if (!value || typeof value !== 'object') return false;
  return Object.values(value).some(hasVisibleNarrativeValue);
}

function mappedSourcesForTargets(contentMap, targets) {
  const sources = new Set();
  for (const requiredTarget of targets) {
    const candidates = Object.entries(contentMap || {})
      .filter(([mappedTarget]) => mappedTargetCovers(mappedTarget, requiredTarget))
      .sort(([left], [right]) => right.length - left.length);
    const [mappedTarget, sourceMapping] = candidates[0] || [];
    const sourcePath = typeof sourceMapping === 'string'
      ? sourceMapping
      : sourceMapping?.source;
    if (!mappedTarget || typeof sourcePath !== 'string') continue;
    const suffix = requiredTarget.slice(mappedTarget.length);
    sources.add(`${sourcePath}${suffix}`);
  }
  return sources;
}

function contentMapSourceRoots(contentMap) {
  return new Set(Object.values(contentMap || {})
    .map(value => typeof value === 'string' ? value : value?.source)
    .filter(value => typeof value === 'string')
    .map(sourcePathRoot)
    .filter(Boolean));
}

function sourcePathRoot(pathName) {
  return String(pathName || '').match(/^[A-Za-z_$][A-Za-z0-9_$-]*/)?.[0] || '';
}

function canonicalCoreRoots(content) {
  if (!isPlainRecord(content)) return new Set();
  const excluded = /^(?:title|titles|headline|heading|subject|topic|name|kicker|eyebrow|section|caption|footnote|unit|date|author|owner|source|locale|language|englishTitle)$/i;
  return new Set(Object.keys(content).filter(key => !excluded.test(key)));
}

function intersectSets(sets) {
  if (!sets.length) return new Set();
  return new Set([...sets[0]].filter(value => sets.slice(1).every(set => set.has(value))));
}

function validateContentMapEnvelope(variant, logicalSlide, slideNumber, variantId, errors, options = {}) {
  if (!isPlainRecord(variant?.contentMap)) {
    if (!options.allowUnfilledContent) {
      errors.push(`slide ${slideNumber} variant ${variantId} field contentMap: object is required`);
    }
    return;
  }
  if (!Object.keys(variant.contentMap).length && !options.allowUnfilledContent) {
    errors.push(`slide ${slideNumber} variant ${variantId} field contentMap: at least one target path -> content path mapping is required`);
  }
  if (!isPlainRecord(logicalSlide?.content) && !options.allowUnfilledContent) {
    errors.push(`slide ${slideNumber} variant ${variantId} field contentMap: slide.content is required as the mapping source`);
  }
}

function validateBespokeEnvelope(variant, logicalSlide, slideNumber, variantId, errors, options = {}) {
  for (const field of ['layout', 'props', 'controls']) {
    if (Object.prototype.hasOwnProperty.call(variant || {}, field)) {
      errors.push(`slide ${slideNumber} variant ${variantId} field ${field}: bespoke variants must not define ${field}`);
    }
  }
  if (variant?.adjustable !== false) {
    errors.push(`slide ${slideNumber} variant ${variantId} field adjustable: bespoke variants must set adjustable:false`);
  }
  if (!isPlainRecord(variant?.composition) && !options.allowUnfilledBespoke) {
    errors.push(`slide ${slideNumber} variant ${variantId} field composition: bespoke composition object is required`);
  }
  validateContentMapEnvelope(variant, logicalSlide, slideNumber, variantId, errors, options);
}

function resolveMappedRenderData(content, contentMap, base, location, errors, options = {}) {
  if (!isPlainRecord(contentMap)) return isPlainRecord(base) ? base : {};
  const contentForValidation = isPlainRecord(content) ? content : undefined;
  const mapErrors = validateContentMap(contentMap, contentForValidation);
  const actionable = options.allowUnfilledContent
    ? mapErrors.filter(error => !/missing source path/i.test(error))
    : mapErrors;
  for (const error of actionable) errors.push(`${location} field contentMap: ${error}`);
  if (mapErrors.length || !contentForValidation) return isPlainRecord(base) ? base : {};
  try {
    return resolveContentMap(contentForValidation, contentMap, isPlainRecord(base) ? base : {});
  } catch (error) {
    errors.push(`${location} field contentMap: ${error.message}`);
    return isPlainRecord(base) ? base : {};
  }
}

function validateBespokeEntry(entry, errors, mediaUsages, options = {}) {
  const {
    slide,
    authoredSlide,
    slideNumber,
    logicalSlideNumber,
  } = entry;
  const composition = slide?.composition;
  const scope = `slide ${slideNumber}`;
  if (!isPlainRecord(composition)) return;

  validateNoSerializedReactElements(composition, scope, 'bespoke', 'composition', errors);
  validateObjectStrings(composition, scope, 'bespoke', 'composition', errors);
  validatePlaceholderCopy(composition, scope, 'bespoke', 'composition', errors);
  if (!options.allowUnfilledBespoke) {
    for (const error of validateBespokeComposition(composition)) {
      errors.push(`${scope} bespoke field composition: ${error}`);
    }
  }
  const authoredComposition = authoredSlide?.composition;
  if (isPlainRecord(authoredComposition)) {
    validateNoSerializedReactElements(authoredComposition, scope, 'bespoke', 'composition', errors);
    validateObjectStrings(authoredComposition, scope, 'bespoke', 'composition', errors);
    validatePlaceholderCopy(authoredComposition, scope, 'bespoke', 'composition', errors);
    if (!options.allowUnfilledBespoke) {
      const authoredErrors = validateBespokeComposition(authoredComposition)
        .map(error => `${scope} bespoke field composition: ${error}`);
      pushUniqueErrors(errors, authoredErrors);
    }
  }
  validateBespokeMedia(composition, slideNumber, logicalSlideNumber, mediaUsages, errors);
}

function validatePlaceholderCopy(value, scope, layout, fieldPrefix, errors) {
  visitStrings(value, fieldPrefix, (text, field) => {
    const placeholders = NEUTRAL_PLACEHOLDERS.filter(item => text.includes(item));
    if (placeholders.length) {
      errors.push(`${scope} layout ${layout} field ${field}: placeholder copy is not allowed (${placeholders.join(', ')})`);
    }
    if (/^\s*(?:undefined|null|\[object Object\])\s*$/i.test(text)) {
      errors.push(`${scope} layout ${layout} field ${field}: invalid visible copy "${text.trim()}"`);
    }
  });
}

function validateBespokeMedia(composition, slideNumber, logicalSlideNumber, mediaUsages, errors) {
  (composition?.elements || []).forEach((element, index) => {
    if (element?.type !== 'media') return;
    for (const field of ['src', 'poster']) {
      if (!Object.prototype.hasOwnProperty.call(element, field)) continue;
      const value = element[field];
      const fieldPath = `composition.elements[${index}].${field}`;
      if (typeof value !== 'string' || !value.trim()) {
        errors.push(`slide ${slideNumber} layout bespoke field ${fieldPath}: expected non-empty media source`);
        continue;
      }
      validateMediaSource(value.trim(), `slide ${slideNumber}`, 'bespoke', fieldPath, errors);
      addMediaUsage(value, fieldPath, slideNumber, logicalSlideNumber, 'bespoke', mediaUsages);
    }
  });
}

function isPlainRecord(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function validateUniqueLayouts(layoutUsages, errors) {
  for (const [layout, locations] of layoutUsages.entries()) {
    if (locations.length <= 1) continue;
    errors.push(`deck field slides: duplicate layout ${layout} used on ${locations.join(', ')}; choose a unique layout for every slide variant`);
  }
}

function validateMediaIntent(slide, slideNumber, layout, props, errors, options = {}) {
  const slots = getMediaSlotsForLayout(layout);
  const intent = getSlideMediaIntent(slide);
  if (!intent.requiresMedia) return;

  if (!slots.length) {
    errors.push(`slide ${slideNumber} layout ${layout} field ${intent.field}: ${intent.label} requires a usable media slot; choose a layout with mediaSlots or remove the media intent`);
    return;
  }

  if (intent.count > 0 && !slots.some(slot => mediaSlotCapacity(slot) >= intent.count)) {
    const capacities = slots.map(slot => `${slot.field}:${mediaSlotCapacity(slot)}`).join(', ');
    errors.push(`slide ${slideNumber} layout ${layout} field ${intent.field}: ${intent.label} needs ${intent.count} media item(s), but available media slot capacity is ${capacities}`);
  }

  if (!intent.requiresWrittenProps || options.allowUnfilledMediaIntent === true) return;

  const writtenSlot = slots.find(slot => Array.isArray(props?.[slot.field]) && props[slot.field].length >= Math.max(1, intent.count));
  if (!writtenSlot) {
    const fields = slots.map(slot => `props.${slot.field}`).join(' or ');
    errors.push(`slide ${slideNumber} layout ${layout} field ${intent.field}: ${intent.label} must be written to ${fields}; do not use slides[].media`);
  }
}

function validateMediaProps(slideNumber, layout, props, errors) {
  const slots = getMediaSlotsForLayout(layout).filter(slot => slot.field && slot.initialSrcSupported === true);
  const slotsByField = new Map(slots.map(slot => [slot.field, slot]));
  for (const [key, value] of Object.entries(props || {})) {
    if (!isMediaArrayKey(key)) continue;
    const slot = slotsByField.get(key);
    if (!slot) {
      errors.push(`slide ${slideNumber} layout ${layout} field props.${key}: not a writable media slot for this layout`);
      continue;
    }
    if (!Array.isArray(value)) {
      errors.push(`slide ${slideNumber} layout ${layout} field props.${key}: expected array of media items`);
      continue;
    }
    const capacity = mediaPropCapacity(props, slot);
    if (value.length > capacity) {
      errors.push(`slide ${slideNumber} layout ${layout} field props.${key}: too many media items (${value.length} > ${capacity}); keep within media slot capacity and explicit count`);
    }
    value.forEach((item, index) => validateMediaItem(item, slot, `slide ${slideNumber}`, layout, `props.${key}[${index}]`, errors));
  }
}

function mediaPropCapacity(props, slot) {
  const slotCapacity = mediaSlotCapacity(slot);
  const explicitCount = mediaPropExplicitCount(props, slot);
  return explicitCount == null ? slotCapacity : Math.min(slotCapacity, explicitCount);
}

function mediaPropExplicitCount(props, slot) {
  for (const key of [slot.countKey, slot.publicCountKey].filter(Boolean)) {
    if (!Object.prototype.hasOwnProperty.call(props || {}, key)) continue;
    const count = numberOrNull(props[key]);
    if (count != null) return count;
  }
  return null;
}

function validateMediaItem(item, slot, scope, layout, field, errors) {
  if (typeof item === 'string') {
    const src = item.trim();
    if (!src) {
      errors.push(`${scope} layout ${layout} field ${field}: expected non-empty media source`);
      return;
    }
    if (validateMediaSource(src, scope, layout, field, errors)) return;
    if (looksLikeVideoSrc(src) && !src.startsWith('data:video/')) {
      errors.push(`${scope} layout ${layout} field ${field}: video media must use {src, kind:"video", type}`);
      return;
    }
    validateAcceptedMediaKind(src.startsWith('data:video/') ? 'video' : 'image', slot, scope, layout, field, errors);
    return;
  }

  if (!item || typeof item !== 'object' || Array.isArray(item)) {
    errors.push(`${scope} layout ${layout} field ${field}: expected media item as string or {src}`);
    return;
  }

  const unknownFields = Object.keys(item).filter(key => !ALLOWED_MEDIA_ITEM_FIELDS.has(key));
  if (unknownFields.length) {
    errors.push(`${scope} layout ${layout} field ${field}: unknown media item field(s): ${unknownFields.join(', ')}; allowed fields: ${[...ALLOWED_MEDIA_ITEM_FIELDS].join(', ')}`);
  }

  const src = typeof item.src === 'string' ? item.src.trim() : '';
  if (!src) {
    errors.push(`${scope} layout ${layout} field ${field}: expected media item with src`);
    return;
  }
  validateMediaSource(src, scope, layout, `${field}.src`, errors);
  if (Object.prototype.hasOwnProperty.call(item, 'poster')) {
    if (item.poster != null && typeof item.poster !== 'string') {
      errors.push(`${scope} layout ${layout} field ${field}.poster: expected poster media source as string`);
    } else if (typeof item.poster === 'string' && item.poster.trim()) {
      validateMediaSource(item.poster.trim(), scope, layout, `${field}.poster`, errors);
    }
  }

  const declaredKind = normalizeMediaKind(item.kind);
  const typeText = String(item.type || '');
  const inferredKind = declaredKind
    || (typeText.startsWith('video/') || src.startsWith('data:video/') ? 'video' : 'image');
  if (looksLikeVideoSrc(src) && inferredKind !== 'video') {
    errors.push(`${scope} layout ${layout} field ${field}: video media must set kind:"video" or type:"video/*"`);
    return;
  }
  validateAcceptedMediaKind(inferredKind, slot, scope, layout, field, errors);
}

function validateMediaSource(src, scope, layout, field, errors) {
  const text = String(src || '').trim();
  if (!text) return false;
  if (isDeckLocalMediaSource(text)) return false;
  errors.push(`${scope} layout ${layout} field ${field}: media source "${text}" must be staged as deck-local offline media under assets/user-media/ and referenced by normalized POSIX relative path; traversal, loose relative paths, absolute local paths, file:// URLs, remote http(s) URLs, and data: media are not allowed`);
  return true;
}

function validateAcceptedMediaKind(kind, slot, scope, layout, field, errors) {
  const accepted = slot.acceptedKinds || [];
  if (!accepted.length || accepted.includes(kind)) return;
  errors.push(`${scope} layout ${layout} field ${field}: ${kind} media is not supported by props.${slot.field}`);
}

function getSlideMediaIntent(slide) {
  const providedCount = mediaCount(slide?.providedImages);
  if (providedCount || slide?.hasImages === true) {
    return {
      requiresMedia: true,
      requiresWrittenProps: true,
      count: providedCount || 1,
      field: providedCount ? 'providedImages' : 'hasImages',
      label: providedCount ? 'providedImages' : 'hasImages',
    };
  }

  const providedMediaCount = mediaCount(slide?.providedMedia);
  if (providedMediaCount) {
    return {
      requiresMedia: true,
      requiresWrittenProps: true,
      count: providedMediaCount,
      field: 'providedMedia',
      label: 'providedMedia',
    };
  }

  const plannedCount = mediaCount(slide?.plannedImages);
  if (plannedCount) {
    return {
      requiresMedia: true,
      requiresWrittenProps: true,
      count: plannedCount,
      field: 'plannedImages',
      label: 'plannedImages',
    };
  }

  if (slide?.needsVisual === true || slide?.needsImageGen === true || slide?.imageGen === true) {
    const field = slide?.needsVisual === true ? 'needsVisual' : slide?.needsImageGen === true ? 'needsImageGen' : 'imageGen';
    return {
      requiresMedia: true,
      requiresWrittenProps: true,
      count: 1,
      field,
      label: field,
    };
  }

  return {
    requiresMedia: false,
    requiresWrittenProps: false,
    count: 0,
    field: '',
    label: '',
  };
}

function mediaCount(value) {
  if (Array.isArray(value)) return value.length;
  if (value === true) return 1;
  const number = Number(value);
  if (Number.isFinite(number) && number > 0) return Math.round(number);
  return 0;
}

export function validateHtmlStringBoundaries(value, scope, layout, fieldPrefix, errors) {
  if (!value || typeof value !== 'object') return;
  visitStrings(value, fieldPrefix, (text, field) => validateFreeHtml(text, scope, layout, field, errors));
}

function validateObjectStrings(value, scope, layout, fieldPrefix, errors) {
  validateHtmlStringBoundaries(value, scope, layout, fieldPrefix, errors);
}

function validateNoSerializedReactElements(value, scope, layout, fieldPrefix, errors) {
  if (!value || typeof value !== 'object') return;
  if (isSerializedReactElementLike(value)) {
    errors.push(`${scope} layout ${layout} field ${fieldPrefix}: serialized React element is not allowed; use plain text`);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => validateNoSerializedReactElements(item, scope, layout, `${fieldPrefix}[${index}]`, errors));
    return;
  }
  Object.entries(value).forEach(([key, item]) => validateNoSerializedReactElements(item, scope, layout, `${fieldPrefix}.${key}`, errors));
}

function validateCopyBudgets(layout, props, slideNumber, layoutLabel, errors) {
  const budgets = getCopyBudgetsForLayout(layout);
  if (!Object.keys(budgets).length) return;
  visitStrings(props, 'props', (text, field) => {
    const budgetKey = normalizeBudgetPath(field.replace(/^props\./, ''));
    const budget = budgets[budgetKey];
    if (!budget) return;
    const length = charLength(stripInlineMarkers(text));
    if (length <= budget.maxChars) return;
    const hint = alternativeLayoutsForBudget(layout, budgetKey, length);
    errors.push(`slide ${slideNumber} layout ${layoutLabel} field ${field}: ${budget.density} copy is too long (${length} > ${budget.maxChars}); ${hint || 'move long text to subtitle/lead/list or choose a denser layout'}`);
  });
}

// 「文案超长」曾只给一句泛泛的 choose a denser layout,用户只能在 90+ 个布局里盲试
// (issue #16 用户换了 3 次 layout 才放下内容;issue #17 的多轮返工也多由换布局引发)。
// 这里直接扫同主题里同名字段预算能容纳该长度的布局,附 3 个具体候选与其预算上限。
function alternativeLayoutsForBudget(layout, budgetKey, requiredLength) {
  const themeKey = layout.split('_')[0];
  const candidates = [];
  for (const page of THEME_PAGES) {
    if (page.themeKey !== themeKey || page.key === layout) continue;
    const budget = getCopyBudgetsForLayout(page.key)[budgetKey];
    if (budget && budget.maxChars >= requiredLength) {
      candidates.push(`${page.key}(${budgetKey} ≤ ${budget.maxChars})`);
      if (candidates.length >= 3) break;
    }
  }
  if (!candidates.length) return '';
  return `压缩文案,或换同主题可容纳的布局: ${candidates.join('、')}`;
}

function validateArrayCapacities(layout, props, slideNumber, layoutLabel, errors) {
  const inspected = inspectLayout(layout, { compact: true }) || {};
  const arrays = inspected.fillPlan?.arrays || [];
  const countKeysByArrayPath = countKeysByArrayPathForLayout(inspected.countBindings || []);
  for (const meta of arrays) {
    validateArrayCapacity(props, props, meta.key, meta, meta.key, `props.${meta.key}`, countKeysByArrayPath, slideNumber, layoutLabel, errors);
  }
}

function validateArrayCapacity(propsRoot, root, pathName, meta, logicalPath, field, countKeysByArrayPath, slideNumber, layoutLabel, errors, ownerIndex = null) {
  const value = valueAtObjectPath(root, pathName);
  if (!Array.isArray(value)) return;
  const max = Number(meta.maxCount);
  const visibleCount = visibleArrayCount(propsRoot, meta, logicalPath, countKeysByArrayPath, value.length);
  const hasCountKey = Boolean((countKeysByArrayPath.get(logicalPath) || [meta.countKey]).filter(Boolean).length);
  const checkedCount = hasCountKey ? visibleCount : value.length;
  if (Number.isFinite(max) && checkedCount > max) {
    errors.push(`slide ${slideNumber} layout ${layoutLabel} field ${field}: too many items (${checkedCount} > ${max}); use at most fillPlan.maxCount or choose another layout`);
  }
  const fixedLength = fixedLengthForArrayPlan(meta, ownerIndex);
  if (fixedLength != null && value.length !== fixedLength) {
    errors.push(`slide ${slideNumber} layout ${layoutLabel} field ${field}: fixed length mismatch (${value.length} != ${fixedLength}); authored array length must match fillPlan fixedLength`);
  }
  const nestedArrays = meta.nestedArrays || {};
  for (const [nestedKey, nestedMeta] of Object.entries(nestedArrays)) {
    const nestedLogicalPath = `${logicalPath}[].${nestedKey}`;
    value.slice(0, visibleCount).forEach((item, index) => {
      if (!item || typeof item !== 'object' || Array.isArray(item)) return;
      validateArrayCapacity(propsRoot, item, nestedKey, nestedMeta, nestedLogicalPath, `${field}[${index}].${nestedKey}`, countKeysByArrayPath, slideNumber, layoutLabel, errors, index);
    });
  }
}

function fixedLengthForArrayPlan(meta, ownerIndex) {
  const fixed = Number(meta.fixedLength);
  if (Number.isFinite(fixed)) return fixed;
  if (ownerIndex != null && Array.isArray(meta.fixedLengths)) {
    const byItem = Number(meta.fixedLengths[ownerIndex]);
    if (Number.isFinite(byItem)) return byItem;
  }
  return null;
}

function visibleArrayCount(propsRoot, meta, logicalPath, countKeysByArrayPath, fallback) {
  const countKeys = countKeysByArrayPath.get(logicalPath) || [meta.countKey].filter(Boolean);
  for (const countKey of countKeys) {
    const authored = Number(propsRoot?.[countKey]);
    if (Number.isFinite(authored)) return Math.max(0, Math.min(fallback, Math.round(authored)));
  }
  const visible = Number(meta.visibleCount);
  if (Number.isFinite(visible)) return Math.max(0, Math.min(fallback, Math.round(visible)));
  return fallback;
}

function countKeysByArrayPathForLayout(countBindings = []) {
  const result = new Map();
  for (const binding of countBindings || []) {
    const keys = [binding.key, binding.publicKey].filter(Boolean);
    for (const arrayPath of binding.arrays || []) result.set(arrayPath, keys);
  }
  return result;
}

function validateRepeatedVisibleCopy(layout, props, slideNumber, layoutLabel, errors) {
  validateRepeatedArrayGroupCopy(layout, props, slideNumber, layoutLabel, errors);

  const budgets = getCopyBudgetsForLayout(layout);
  if (!Object.keys(budgets).length) return;
  const seen = new Map();
  visitStrings(props, 'props', (text, field) => {
    const budgetKey = normalizeBudgetPath(field.replace(/^props\./, ''));
    if (!budgets[budgetKey]) return;
    const normalized = normalizeRepeatedCopy(text);
    if (charLength(normalized) < 8) return;
    const rows = seen.get(normalized) || [];
    rows.push(field);
    seen.set(normalized, rows);
  });
  for (const [text, fields] of seen.entries()) {
    if (fields.length < 4) continue;
    errors.push(`slide ${slideNumber} layout ${layoutLabel} field props: repeated visible copy "${text}" appears ${fields.length} times (${fields.slice(0, 6).join(', ')}); vary list items or shorten repeated labels`);
  }
}

function validateVisibleDirtyCopy(layout, props, authoredProps, slideNumber, layoutLabel, errors) {
  const inspected = inspectLayout(layout, { compact: true }) || {};
  const copyPaths = visibleCopyPathSet(inspected);
  const visibleProps = visiblePropsForInspection(props, inspected, authoredProps);
  visitStrings(visibleProps, 'props', (text, field) => {
    const contractPath = normalizeContractPath(field.replace(/^props\./, ''));
    if (copyPaths.size && !copyPaths.has(contractPath)) return;
    const reason = dirtyVisibleCopyReason(text);
    if (!reason) return;
    errors.push(`slide ${slideNumber} theme ${inspected.theme || themeFromLayout(layoutLabel)} layout ${layoutLabel} field ${field}: ${reason}`);
  });
}

function dirtyVisibleCopyReason(value) {
  const text = String(value || '');
  const placeholder = NEUTRAL_PLACEHOLDERS.find(item => text.includes(item));
  if (placeholder) return `中性占位文案 "${placeholder}" 不允许出现在可见文案`;
  if (text.includes('[object Object]')) return 'object placeholder "[object Object]" is not allowed in visible copy';
  if (/\bundefined\b/i.test(text)) return 'undefined literal is not allowed in visible copy';
  return '';
}

function validateCountBindingConsistency(layout, props, slideNumber, layoutLabel, errors) {
  const inspected = inspectLayout(layout, { compact: true }) || {};
  const theme = inspected.theme || themeFromLayout(layoutLabel);
  for (const binding of contentCountBindingsForInspection(inspected)) {
    const countSource = binding.publicKey || binding.key;
    const rawCount = props?.[binding.key] ?? props?.[binding.publicKey];
    if (rawCount == null || rawCount === '') continue;
    const count = numberOrNull(rawCount);
    if (count == null) continue;

    // count 比 authored 数组长(渲染合成层会用 defaultProps 补足到 count 再显示)不再是硬
    // 错误——只有数组比 count 还长(多余的已写数据不会被渲染,大概率是笔误)仍然拦下来。
    const mismatches = [];
    for (const arrayPath of binding.arrays || []) {
      if (isMediaArrayKey(rootArrayKey(arrayPath))) continue;
      for (const item of collectBoundArrays(props, arrayPath)) {
        if (item.value.length <= count) continue;
        const shortField = stripPropsPrefix(item.field);
        const fullField = item.field === shortField ? '' : ` (${item.field} has ${item.value.length})`;
        mismatches.push(`${shortField} has ${item.value.length}${fullField}`);
      }
    }
    if (!mismatches.length) continue;
    errors.push(`slide ${slideNumber} theme ${theme} layout ${layoutLabel} field props.${countSource}: countBinding mismatch ${countSource}=${count}; ${mismatches.join(', ')}; authored array lengths must match the count key`);
  }
}

function validateLengthBindingConsistency(layout, props, slideNumber, layoutLabel, errors) {
  const inspected = inspectLayout(layout, { compact: true }) || {};
  const theme = inspected.theme || themeFromLayout(layoutLabel);
  for (const binding of inspected.lengthBindings || []) {
    if (binding.relation !== 'same-length') continue;
    const dependents = collectBoundArrays(props, binding.dependent);
    if (!dependents.length) continue;

    const expected = expectedLengthForBinding(props, binding, inspected);
    if (!expected) continue;

    const mismatches = dependents
      .filter(item => item.value.length !== expected.count)
      .map(item => `${stripPropsPrefix(item.field)} has ${item.value.length}`);
    if (!mismatches.length) continue;

    errors.push(`slide ${slideNumber} theme ${theme} layout ${layoutLabel} field props.${rootArrayKey(binding.dependent)}: lengthBinding mismatch ${binding.dependent} must match ${binding.anchor}; ${mismatches.join(', ')}; ${expected.source} has ${expected.count}`);
  }
}

function expectedLengthForBinding(props, binding, inspected) {
  const anchor = valueAtObjectPath(props, binding.anchor);
  if (Array.isArray(anchor)) return { count: anchor.length, source: binding.anchor };

  const countKeys = [binding.countKey].filter(Boolean);
  for (const countKey of countKeys) {
    const authored = numberOrNull(props?.[countKey]);
    if (authored != null) return { count: authored, source: countKey };
  }

  for (const countKey of countKeys) {
    const visible = numberOrNull(inspected.defaultVisibleCounts?.[countKey]);
    if (visible != null) return { count: visible, source: countKey };
  }

  const defaultCount = numberOrNull(binding.defaultCount);
  return defaultCount == null ? null : { count: defaultCount, source: binding.anchor };
}

function stripPropsPrefix(field) {
  return String(field || '').replace(/^props\./, '');
}

function validateRepeatedArrayGroupCopy(layout, props, slideNumber, layoutLabel, errors) {
  const inspected = inspectLayout(layout, { compact: true }) || {};
  const theme = inspected.theme || themeFromLayout(layoutLabel);
  for (const arrayPlan of inspected.fillPlan?.arrays || []) {
    validateRepeatedArrayPlanCopy(props, arrayPlan, inspected, slideNumber, theme, layoutLabel, errors);
  }
}

function validateRepeatedArrayPlanCopy(props, arrayPlan, inspected, slideNumber, theme, layoutLabel, errors) {
  const value = valueAtObjectPath(props, arrayPlan.key);
  if (!Array.isArray(value)) return;
  const fallbackCount = fallbackVisibleCountForInspection(props, countBindingsForFallback(inspected));
  const visibleCount = visibleCountForArrayPlan(props, arrayPlan, inspected, value.length, fallbackCount);
  const visible = value.slice(0, visibleCount);

  if (arrayPlan.itemShape === 'string') {
    const pathName = `${arrayPlan.key}[]`;
    const role = inspected.copyRoles?.[pathName] || arrayPlan.role;
    const seen = collectRepeatedValues(visible, index => ({
      value: visible[index],
      field: `props.${arrayPlan.key}[${index}]`,
      summaryField: `props.${pathName}`,
      role,
    }));
    pushRepeatedGroupErrors(seen, slideNumber, theme, layoutLabel, errors);
    return;
  }

  for (const [fieldKey, fieldMeta] of Object.entries(arrayPlan.itemFields || {})) {
    const pathName = `${arrayPlan.key}[].${fieldKey}`;
    const role = fieldMeta.role || inspected.copyRoles?.[pathName] || arrayPlan.role;
    if (!isRepeatCheckedCopyRole(role) || fieldMeta.type !== 'string') continue;
    const seen = collectRepeatedValues(visible, index => ({
      value: valueAtObjectPath(visible[index], fieldKey),
      field: `props.${arrayPlan.key}[${index}].${fieldKey}`,
      summaryField: `props.${pathName}`,
      role,
    }));
    pushRepeatedGroupErrors(seen, slideNumber, theme, layoutLabel, errors);
  }
}

function collectRepeatedValues(items, pick) {
  const seen = new Map();
  for (let index = 0; index < items.length; index += 1) {
    const item = pick(index);
    if (typeof item.value !== 'string') continue;
    const normalized = normalizeRepeatedCopy(item.value);
    if (!isMeaningfulRepeatedCopy(normalized, item.role)) continue;
    const rows = seen.get(normalized) || { fields: [], summaryField: item.summaryField };
    rows.fields.push(item.field);
    seen.set(normalized, rows);
  }
  return seen;
}

function pushRepeatedGroupErrors(seen, slideNumber, theme, layoutLabel, errors) {
  for (const [text, item] of seen.entries()) {
    if (item.fields.length < 3) continue;
    errors.push(`slide ${slideNumber} theme ${theme} layout ${layoutLabel} field ${item.summaryField}: repeated visible copy "${text}" appears ${item.fields.length} times (${item.fields.slice(0, 6).join(', ')}); vary list items`);
  }
}

function isRepeatCheckedCopyRole(role) {
  return !['metric', 'serial', 'decorative', 'media'].includes(String(role || '').toLowerCase());
}

function isMeaningfulRepeatedCopy(value, role) {
  if (!isRepeatCheckedCopyRole(role)) return false;
  const text = String(value || '').trim();
  if (charLength(text) < 8) return false;
  if (isNumericLike(text) || isPageLabel(text) || isUploadPlaceholderText(text)) return false;
  return /[\p{Letter}\p{Number}]/u.test(text);
}

function collectDeckCoreCopy(layout, props, authoredProps, slideNumber, layoutLabel, usages) {
  const inspected = inspectLayout(layout, { compact: true }) || {};
  const visibleProps = visiblePropsForInspection(props, inspected, authoredProps);
  visitStrings(visibleProps, 'props', (text, field) => {
    const contractPath = normalizeContractPath(field.replace(/^props\./, ''));
    const role = coreCopyRoleForPath(inspected, contractPath);
    const budget = inspected.copyBudgets?.[contractPath];
    if (!isDeckCoreCopyField(contractPath, role, budget)) return;
    const normalized = normalizeRepeatedCopy(text);
    if (!isMeaningfulDeckCoreCopy(normalized)) return;
    const rows = usages.get(normalized) || [];
    rows.push({ slideNumber, layout: layoutLabel, field });
    usages.set(normalized, rows);
  });
}

function validateDeckRepeatedCoreCopy(usages, errors) {
  for (const [text, rows] of usages.entries()) {
    const uniqueSlides = new Set(rows.map(item => item.slideNumber));
    if (uniqueSlides.size < 4) continue;
    const locations = rows
      .filter((item, index, list) => list.findIndex(other => other.slideNumber === item.slideNumber) === index)
      .slice(0, 6)
      .map(item => `slide ${item.slideNumber} ${item.layout} ${item.field}`)
      .join(', ');
    errors.push(`deck field slides: repeated core copy "${text}" appears on ${uniqueSlides.size} slides (${locations}); vary page titles/core copy`);
  }
}

function coreCopyRoleForPath(inspected, contractPath) {
  if (inspected.copyRoles?.[contractPath]) return inspected.copyRoles[contractPath];
  const contract = (inspected.fieldContracts || []).find(item => normalizeContractPath(item.key) === contractPath);
  return contract?.role || '';
}

function isDeckCoreCopyField(contractPath, role, budget) {
  const field = lastPathKey(contractPath).toLowerCase();
  if (/^(kicker|eyebrow|en|unit|amount|value|no|index|label|tag|chip|caption|footnote|note|summary|intro|description|desc|cn)$/i.test(field)) return false;
  if (/^(title|titleTop|titleBottom|headline|heading|statement|quote|lead|subtitle)$/i.test(field)) return true;
  const normalizedRole = String(role || '').toLowerCase();
  if (normalizedRole === 'title') return true;
  return String(budget?.density || '').toLowerCase() === 'display';
}

function isMeaningfulDeckCoreCopy(value) {
  const text = String(value || '').trim();
  if (charLength(text) < 8) return false;
  if (isNumericLike(text) || isPageLabel(text) || isUploadPlaceholderText(text)) return false;
  if (containsNeutralPlaceholder(text)) return false;
  return /[\p{Letter}\p{Number}]/u.test(text);
}

function visibleCopyPathSet(inspected) {
  const keys = [
    ...Object.keys(inspected.copyBudgets || {}),
    ...Object.keys(inspected.copyRoles || {}),
    ...(inspected.fieldContracts || [])
      .filter(item => item?.role && !['media', 'decorative'].includes(item.role))
      .map(item => item.key),
  ];
  return new Set(keys.map(normalizeContractPath));
}

function visiblePropsForInspection(props = {}, inspected = {}, authoredProps = props) {
  const bindings = contentCountBindingsForInspection(inspected);
  const arrayCounts = new Map();
  for (const binding of bindings) {
    const count = numberOrNull(props?.[binding.key] ?? props?.[binding.publicKey]);
    if (count == null) continue;
    for (const arrayPath of binding.arrays || []) {
      arrayCounts.set(arrayPath, count);
      if (rootArrayKey(arrayPath) === arrayPath) arrayCounts.set(rootArrayKey(arrayPath), count);
    }
  }
  const fallbackCount = fallbackVisibleCountForInspection(props, countBindingsForFallback(inspected));
  return filterVisibleValue(props, '', arrayCounts, fallbackCount, authoredProps);
}

function countBindingsForFallback(inspected = {}) {
  const bindings = [];
  for (const binding of inspected.countBindings || []) bindings.push(binding);
  for (const meta of inspected.arrayMeta || []) {
    if (meta.countKey) bindings.push({ key: meta.countKey, publicKey: meta.countKey, arrays: [meta.key] });
  }
  return bindings;
}

function contentCountBindingsForInspection(inspected = {}) {
  const result = [];
  const byKey = new Map();
  const add = binding => {
    if (!binding?.key && !binding?.publicKey) return;
    const key = binding.key || binding.publicKey;
    const current = byKey.get(key) || {
      key: binding.key || key,
      publicKey: binding.publicKey || key,
      arrays: [],
    };
    current.arrays = [...new Set([...(current.arrays || []), ...(binding.arrays || [])])];
    byKey.set(key, current);
  };
  for (const binding of inspected.countBindings || []) {
    const arrays = (binding.arrays || []).filter(arrayPath => !isMediaArrayKey(rootArrayKey(arrayPath)));
    add({ ...binding, arrays });
  }
  for (const meta of inspected.arrayMeta || []) {
    if (!meta.countKey) continue;
    if (isMediaArrayKey(rootArrayKey(meta.key))) continue;
    add({ key: meta.countKey, publicKey: meta.countKey, arrays: [meta.key] });
  }
  for (const item of byKey.values()) {
    if ((item.arrays || []).length) result.push(item);
  }
  return result;
}

function filterVisibleValue(value, pathName, arrayCounts, fallbackCount, authoredValue = value) {
  if (Array.isArray(value)) {
    const key = lastPathKey(pathName);
    const explicitCount = arrayCounts.get(pathName) ?? arrayCounts.get(key);
    const authoredCount = Array.isArray(authoredValue) ? authoredValue.length : null;
    const limit = explicitCount ?? (shouldSliceByFallback(key, value, fallbackCount) ? fallbackCount : authoredCount);
    const visible = limit == null ? value : value.slice(0, limit);
    const itemPath = pathName ? `${pathName}[]` : '[]';
    return visible.map((item, index) => filterVisibleValue(item, itemPath, arrayCounts, fallbackCount, authoredValue?.[index]));
  }
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.entries(value).map(([childKey, childValue]) => [
    childKey,
    filterVisibleValue(childValue, pathName ? `${pathName}.${childKey}` : childKey, arrayCounts, fallbackCount, authoredValue?.[childKey]),
  ]));
}

function collectBoundArrays(value, pathName, fieldPrefix = 'props') {
  if (!value || typeof value !== 'object') return [];
  const [segment, ...restParts] = String(pathName || '').split('.');
  const rest = restParts.join('.');
  const arraySegment = segment.endsWith('[]');
  const key = arraySegment ? segment.slice(0, -2) : segment;
  const next = value[key];
  const field = `${fieldPrefix}.${key}`;

  if (arraySegment) {
    if (!Array.isArray(next)) return [];
    if (!rest) return [{ field, value: next }];
    return next.flatMap((item, index) => collectBoundArrays(item, rest, `${field}[${index}]`));
  }

  if (!rest) return Array.isArray(next) ? [{ field, value: next }] : [];
  return collectBoundArrays(next, rest, field);
}

function isNeutralRestoreTail(items, count) {
  const tail = items.slice(count);
  return tail.length > 0 && tail.every(item => containsNeutralPlaceholder(item) && isNeutralRestoreValue(item));
}

function isNeutralRestoreValue(value, field = '') {
  if (value == null || typeof value === 'number' || typeof value === 'boolean') return true;
  if (typeof value === 'string') {
    if (!value.trim()) return true;
    if (containsNeutralPlaceholder(value)) return true;
    return isNonContentString(field, value);
  }
  if (Array.isArray(value)) return value.every(item => isNeutralRestoreValue(item, field));
  if (typeof value !== 'object') return true;
  return Object.entries(value).every(([key, item]) => isNeutralRestoreValue(item, key));
}

function containsNeutralPlaceholder(value) {
  if (typeof value === 'string') return NEUTRAL_PLACEHOLDERS.some(item => value.includes(item));
  if (Array.isArray(value)) return value.some(containsNeutralPlaceholder);
  if (!value || typeof value !== 'object') return false;
  return Object.values(value).some(containsNeutralPlaceholder);
}

function isNonContentString(field, value) {
  const text = String(value || '').trim();
  if (!text) return true;
  if (NON_CONTENT_STRING_FIELD_PATTERN.test(field)) return true;
  if (/^(https?:|data:|#)/i.test(text)) return true;
  if (isCssColorLike(text) || isNumericLike(text)) return true;
  return false;
}

function visibleCountForArrayPlan(props, arrayPlan, inspected, fallback, fallbackCount) {
  if (!arrayPlan.countKey) {
    return shouldSliceByFallback(lastPathKey(arrayPlan.key), valueAtObjectPath(props, arrayPlan.key), fallbackCount)
      ? Math.max(0, Math.min(fallback, fallbackCount))
      : fallback;
  }
  const count = numberOrNull(props?.[arrayPlan.countKey] ?? inspected.defaultVisibleCounts?.[arrayPlan.countKey]);
  if (count != null) return Math.max(0, Math.min(fallback, count));
  return shouldSliceByFallback(lastPathKey(arrayPlan.key), valueAtObjectPath(props, arrayPlan.key), fallbackCount)
    ? Math.max(0, Math.min(fallback, fallbackCount))
    : fallback;
}

function collectMediaUsages(props, slideNumber, logicalSlideNumber, layout, mediaUsages) {
  for (const [key, value] of Object.entries(props || {})) {
    if (!isMediaArrayKey(key)) continue;
    collectMediaValue(value, `props.${key}`, slideNumber, logicalSlideNumber, layout, mediaUsages);
  }
}

function collectMediaValue(value, field, slideNumber, logicalSlideNumber, layout, mediaUsages) {
  if (typeof value === 'string') {
    addMediaUsage(value, field, slideNumber, logicalSlideNumber, layout, mediaUsages);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectMediaValue(item, `${field}[${index}]`, slideNumber, logicalSlideNumber, layout, mediaUsages));
    return;
  }
  if (!value || typeof value !== 'object') return;
  if (typeof value.src === 'string') addMediaUsage(value.src, `${field}.src`, slideNumber, logicalSlideNumber, layout, mediaUsages);
}

function addMediaUsage(src, field, slideNumber, logicalSlideNumber, layout, mediaUsages) {
  const key = normalizeMediaSrc(src);
  if (!key) return;
  const usages = mediaUsages.get(key) || [];
  usages.push({ field, slideNumber, logicalSlideNumber, layout });
  mediaUsages.set(key, usages);
}

function validateUniqueMediaUsages(mediaUsages, errors) {
  for (const [src, usages] of mediaUsages.entries()) {
    const logicalSlides = [...new Set(usages.map(item => item.logicalSlideNumber))];
    const candidateScopes = new Set(usages.map(item => item.slideNumber));
    if (logicalSlides.length <= 1 && candidateScopes.size === usages.length) continue;
    const locations = usages.map(item => `slide ${item.slideNumber} ${item.layout} ${item.field}`).join(', ');
    const scope = logicalSlides.length > 1
      ? `across logical slides ${logicalSlides.join(', ')}`
      : `within logical slide ${logicalSlides[0]}`;
    errors.push(`media asset "${src}" is used ${usages.length} times ${scope} (${locations}); use it at most once per layout variant and on only one logical slide, or set deck allowMediaReuse=true when the user explicitly asks for reuse`);
  }
}

function visitStrings(value, field, visitor) {
  if (typeof value === 'string') {
    visitor(value, field);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => visitStrings(item, `${field}[${index}]`, visitor));
    return;
  }
  if (!value || typeof value !== 'object') return;
  Object.entries(value).forEach(([key, item]) => visitStrings(item, `${field}.${key}`, visitor));
}

function validateFreeHtml(value, scope, layout, field, errors) {
  if (typeof value !== 'string') return;
  const findings = findUnsafeHtmlFindings(value);
  if (!findings.length) return;
  errors.push(`${scope} layout ${layout} field ${field}: obvious free HTML is not allowed (${findings.join(', ')})`);
}

function findUnsafeHtmlFindings(value) {
  const findings = new Set();
  for (const match of value.matchAll(/<\/?([a-z][a-z0-9-]*)\b[^>]*>/gi)) {
    const tag = match[1].toLowerCase();
    if (!ALLOWED_INLINE_TAGS.has(tag)) findings.add(tag);
    for (const attr of htmlAttributes(match[0])) {
      if (/^on[a-z]/i.test(attr.name)) findings.add(attr.name.toLowerCase());
      if (hasJavascriptUrl(attr.value)) findings.add('javascript:');
    }
  }
  return [...findings];
}

function htmlAttributes(tagSource) {
  const attrs = [];
  const attrPattern = /[\s/]+([^\s"'<>/=]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g;
  for (const match of tagSource.matchAll(attrPattern)) {
    attrs.push({
      name: match[1],
      value: match[2] ?? match[3] ?? match[4] ?? '',
    });
  }
  return attrs;
}

function hasJavascriptUrl(value) {
  return decodeHtmlEntities(String(value || '')).replace(/[\u0000-\u001f\u007f\s]+/g, '').toLowerCase().includes('javascript:');
}

function decodeHtmlEntities(value) {
  return String(value || '')
    .replace(/&#(\d+);?/g, (source, code) => decodeCodePoint(Number(code), source))
    .replace(/&#x([0-9a-f]+);?/gi, (source, code) => decodeCodePoint(Number.parseInt(code, 16), source));
}

function decodeCodePoint(code, fallback) {
  if (!Number.isInteger(code) || code < 0 || code > 0x10ffff) return fallback;
  return String.fromCodePoint(code);
}

function normalizeBudgetPath(field) {
  return String(field || '').replace(/\[\d+\]/g, '[]');
}

function normalizeContractPath(field) {
  return String(field || '').replace(/\[\d+\]/g, '[]');
}

function valueAtObjectPath(value, pathName) {
  let current = value;
  for (const segment of String(pathName || '').split('.')) {
    if (current == null) return undefined;
    current = current[segment];
  }
  return current;
}

function normalizeMediaSrc(src) {
  return String(src || '').trim();
}

function looksLikeVideoSrc(src) {
  return /\.(mp4|m4v|mov|webm|ogv)(?:[?#].*)?$/i.test(String(src || '').trim())
    || String(src || '').startsWith('data:video/');
}

function normalizeMediaKind(value) {
  const text = String(value || '').trim().toLowerCase();
  if (!text) return '';
  if (['image', 'img', 'photo', 'picture'].includes(text)) return 'image';
  if (['video', 'movie', 'clip'].includes(text)) return 'video';
  return text;
}

function stripInlineMarkers(value) {
  return String(value || '')
    .replace(/\[\[(.*?)\]\]/g, '$1')
    .replace(/\*\*(.*?)\*\*/g, '$1');
}

function normalizeRepeatedCopy(value) {
  return stripInlineMarkers(value).replace(/\s+/g, '').trim();
}

function lastPathKey(pathName) {
  return String(pathName || '')
    .split('.')
    .at(-1)
    ?.replace(/\[\]$/, '') || '';
}

function rootArrayKey(pathName) {
  return String(pathName || '').split('.')[0].replace(/\[\]$/, '');
}

function numberOrNull(value) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? Math.round(number) : null;
}

function fallbackVisibleCountForInspection(props, bindings = []) {
  const counts = [...new Set((bindings || [])
    .flatMap(binding => [binding.key, binding.publicKey])
    .filter(Boolean)
    .map(key => numberOrNull(props?.[key]))
    .filter(value => value != null))];
  return counts.length === 1 ? counts[0] : null;
}

function shouldSliceByFallback(key, value, fallbackCount) {
  if (fallbackCount == null || !Array.isArray(value) || value.length <= fallbackCount) return false;
  if (isMediaArrayKey(key)) return false;
  return isNeutralRestoreTail(value, fallbackCount);
}

function isNumericLike(value) {
  return /^[+-]?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?%?$/.test(String(value || '').trim());
}

function isPageLabel(value) {
  return /^(?:p\.?\s*)?\d{1,3}$|^第\s*\d{1,3}\s*页$/i.test(String(value || '').trim());
}

function isUploadPlaceholderText(value) {
  return /上传|upload/i.test(String(value || '').trim());
}


function themeFromLayout(layout) {
  return String(layout || '').split('_')[0] || '<unknown>';
}

function runCli() {
  const parsed = parseCliArgs(process.argv.slice(2));
  if (parsed.error) {
    console.error(parsed.error);
    printUsage();
    process.exit(2);
  }

  // 相对路径按调用方目录解析:npm run(含 --prefix)会把脚本 cwd 切到项目根,INIT_CWD 才是用户所在目录。
  const callerCwd = process.env.INIT_CWD || process.cwd();
  const specPath = path.resolve(callerCwd, parsed.file);
  const telemetry = beginWorkflowStage({
    goalPath: specPath,
    telemetryFile: workflowTelemetryPath(specPath),
    stage: 'validate-goal-spec',
    kind: 'validate',
    command: 'validate:goal-spec',
  });
  try {
    const spec = JSON.parse(readFileSync(specPath, 'utf8'));
    const errors = validateGoalSpec(spec);
    if (errors.length) {
      const error = new Error(errors.join('; '));
      telemetry.finish({ ok: false, error });
      console.error('Goal spec validation failed:');
      for (const validationError of errors) console.error(`- ${validationError}`);
      process.exitCode = 1;
      return;
    }
    telemetry.finish({ ok: true });
    console.log('Goal spec validation passed.');
  } catch (error) {
    telemetry.finish({ ok: false, error });
    throw error;
  }
}

function parseCliArgs(argv) {
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--goal') {
      const file = argv[index + 1];
      if (!file || file.startsWith('--')) return { error: 'Missing goal spec path after --goal.' };
      return { file };
    }
    if (arg.startsWith('--goal=')) {
      const file = arg.slice('--goal='.length);
      if (!file) return { error: 'Missing goal spec path after --goal.' };
      return { file };
    }
    if (!arg.startsWith('-')) return { file: arg };
  }
  return { error: 'Missing goal spec path.' };
}

function printUsage() {
  console.error('Usage: node scripts/validate-goal-spec.mjs <goal-spec.json>');
  console.error('   or: node scripts/validate-goal-spec.mjs --goal <goal-spec.json>');
}

// Bundle-safe entry guard: only auto-run the CLI when validate-goal-spec.mjs is the
// invoked script. The `import.meta.url === argv[1]` form breaks when this module is
// esbuild-bundled into another tool (JAD-202) — every inlined module then shares the
// bundle's import.meta.url and would fire its CLI. Matching the invoked basename is
// inert when imported/bundled and identical for direct invocation.
if (process.argv[1] && /(^|[\\/])validate-goal-spec\.mjs$/.test(process.argv[1])) {
  runCli();
}
