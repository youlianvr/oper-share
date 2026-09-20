export const SANS_CJK = '"Noto Sans SC","PingFang SC","Microsoft YaHei",system-ui,sans-serif';

export const BESPOKE_FAMILIES = Object.freeze([
  'hero',
  'editorial',
  'split',
  'comparison',
  'process',
  'matrix',
  'metric-spotlight',
  'timeline',
  'chart-led',
]);

const DEFAULT_FAMILY_RECIPE = Object.freeze({
  frame: 'neutral',
  surface: 'cards',
  titleClass: 'title',
  titleScale: null,
  listMode: 'stack',
  quoteMode: 'card',
  metricMode: 'card',
  chartMode: 'card',
});

export function adapter(values) {
  const familyRecipes = Object.fromEntries(BESPOKE_FAMILIES.map(family => [
    family,
    Object.freeze({
      ...DEFAULT_FAMILY_RECIPE,
      ...(values.familyRecipes?.[family] || {}),
    }),
  ]));
  return Object.freeze({
    ...values,
    familyRecipes: Object.freeze(familyRecipes),
    sourcePrimitives: Object.freeze({ ...(values.sourcePrimitives || {}) }),
    rootVars: Object.freeze({ ...(values.rootVars || {}) }),
    base: Object.freeze(values.base),
    backgrounds: Object.freeze(
      Object.fromEntries(Object.entries(values.backgrounds).map(([key, value]) => [key, Object.freeze(value)])),
    ),
  });
}

export function createBespokeThemeProfileRegistry(adapters, { fallbackKey = 'theme01' } = {}) {
  const entries = Object.entries(adapters || {}).filter(([, value]) => value);
  if (!entries.length) throw new Error('createBespokeThemeProfileRegistry: no theme adapters.');
  const sourceAdapters = Object.freeze(Object.fromEntries(entries));
  const resolvedFallbackKey = Object.hasOwn(sourceAdapters, fallbackKey) ? fallbackKey : entries[0][0];
  const profiles = Object.freeze(
    Object.fromEntries(entries.map(([key, value]) => [key, compileProfile(key, value, 'default')])),
  );
  const resolvedProfiles = new Map();

  function getBespokeThemeProfile(themeKey, background = 'default') {
    const key = Object.hasOwn(sourceAdapters, themeKey) ? themeKey : resolvedFallbackKey;
    const semantic = sourceAdapters[key].backgrounds[background] ? background : 'default';
    if (semantic === 'default') return profiles[key];
    const cacheKey = `${key}:${semantic}`;
    if (!resolvedProfiles.has(cacheKey)) {
      resolvedProfiles.set(cacheKey, compileProfile(key, sourceAdapters[key], semantic));
    }
    return resolvedProfiles.get(cacheKey);
  }

  return Object.freeze({
    profiles,
    getBespokeThemeProfile,
  });
}

function compileProfile(themeKey, source, semantic) {
  const patch = source.backgrounds[semantic] || source.backgrounds.default;
  const base = source.base;
  const values = {
    ...base,
    ...patch,
    themeKey,
    semanticBackground: semantic,
    sourceTokens: source.sourceTokens,
    sourcePath: source.sourcePath,
    sourcePrimitives: source.sourcePrimitives,
    cssText: source.cssText || '',
    Runtime: source.Runtime || null,
    rootClass: patch.rootClass || source.rootClass || '',
    rootVars: Object.freeze({ ...source.rootVars, ...(patch.rootVars || {}) }),
    familyRecipes: source.familyRecipes,
    frame: Object.freeze({ ...(base.frame || {}), ...(patch.frame || {}) }),
    textTreatment: Object.freeze({ ...(base.textTreatment || {}), ...(patch.textTreatment || {}) }),
    cardTreatment: Object.freeze({ ...base.cardTreatment, ...(patch.cardTreatment || {}) }),
    typeScale: Object.freeze({ ...base.typeScale, ...(patch.typeScale || {}) }),
    mediaTreatment: Object.freeze({ ...base.mediaTreatment, ...(patch.mediaTreatment || {}) }),
    chartTreatment: Object.freeze({
      ...base.chartTreatment,
      ...(patch.chartTreatment || {}),
      series: Object.freeze([...(patch.chartTreatment?.series || base.chartTreatment.series || [])]),
    }),
    shapeTreatment: Object.freeze({ ...base.shapeTreatment, ...(patch.shapeTreatment || {}) }),
  };
  return Object.freeze(values);
}

export function onColor(bg, ink, accent2) {
  return {
    bg,
    surface: 'rgba(0,0,0,.12)',
    ink,
    muted: ink === '#ffffff' ? 'rgba(255,255,255,.74)' : 'rgba(0,0,0,.64)',
    line: ink === '#ffffff' ? 'rgba(255,255,255,.24)' : 'rgba(0,0,0,.2)',
    accent2,
  };
}

export function cssVar(name, fallback) {
  return `var(${name},${fallback})`;
}

export function readCssTokens(css) {
  const tokens = {};
  for (const match of String(css).matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/gi)) {
    tokens[match[1]] = match[2].trim();
  }
  return Object.freeze(tokens);
}

export function readCssPxToken(css, name) {
  const value = readCssTokens(css)[name];
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) throw new Error(`Missing numeric theme token ${name}`);
  return parsed;
}

export function readRuleDeclaration(css, selector, property) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const block = String(css).match(new RegExp(`${escapedSelector}\\s*\\{([\\s\\S]*?)\\}`))?.[1] || '';
  const escapedProperty = property.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const value = block.match(new RegExp(`(?:^|;)\\s*${escapedProperty}\\s*:\\s*([\\s\\S]*?)(?=;|$)`))?.[1]?.trim();
  if (!value) throw new Error(`Missing ${selector} ${property} in canonical theme CSS`);
  return value.replace(/\s+/g, ' ');
}
