import {
  normalizeControlOptions,
  normalizePublicControls,
} from '../../control-naming.mjs';
import { normalizePageControls } from '../../metadata-serialize.mjs';
import {
  clampCountControlLimits,
  clampDefaultCountProps,
  serializeValue,
} from '../../prop-contract-core.mjs';
import { getThemeRuntimeOverride } from '#dashi-theme-runtime-overrides';

const REMOVED_CONTROL_TYPES = new Set(['text', 'string', 'input', 'url', 'email', 'textarea', 'multiline']);

export function canonicalizeThemePageRuntime(page) {
  const canonicalPage = applyThemePageDefaults(page);
  const serializedDefaults = serializeDefaults(canonicalPage.defaultProps);
  const serializedControls = normalizePageControls(canonicalPage, serializedDefaults);
  const controls = normalizeControls(serializedControls, serializedDefaults, canonicalPage);
  const defaults = clampDefaultCountProps(serializedDefaults, controls);
  return {
    page: canonicalPage,
    controls,
    defaults,
  };
}

function applyThemePageDefaults(page) {
  const override = getThemeRuntimeOverride(page.themeKey);
  if (!override) return page;
  let next = page;
  if (override.removeControlTypes) {
    const removed = new Set(override.removeControlTypes);
    next = {
      ...next,
      controls: (next.controls || []).filter(control => !removed.has(String(control?.type || '').toLowerCase())),
    };
  }
  if (override.injectControls) {
    const replaced = new Set(override.replaceKeys || []);
    next = {
      ...next,
      controls: [
        ...(next.controls || []).filter(control => !replaced.has(control.key)),
        ...override.injectControls,
      ],
      defaultProps: {
        ...(next.defaultProps || {}),
        ...(override.injectDefaults || {}),
        ...(override.preset3dBySlot?.[page.slot] || {}),
      },
    };
  }
  return next;
}

function normalizeControls(controls, defaults, page) {
  return clampCountControlLimits(normalizePublicControls((controls || [])
    .map(control => {
      const key = control.key || control.prop;
      if (!key) return null;
      const type = normalizeType(control.type);
      if (page?.themeKey !== 'theme04' && REMOVED_CONTROL_TYPES.has(String(control.type || type || '').toLowerCase())) return null;
      const options = normalizeControlOptions(serializeValue(control.options));
      const explicitDisplay = serializeValue(control.display);
      const next = {
        key,
        label: control.label || key,
        type,
        display: explicitDisplay,
        default: serializeValue(control.default ?? control.def ?? defaults[key]),
        min: serializeValue(resolveValue(control.min, defaults)),
        max: serializeValue(resolveValue(control.max, defaults)),
        step: serializeValue(control.step),
        options,
        countKey: serializeValue(control.countKey),
        countIndex: serializeValue(control.countIndex),
        maxFromKey: serializeValue(control.maxFromKey),
        maxFromKeyOffset: serializeValue(control.maxFromKeyOffset),
        maxByKey: serializeValue(control.maxByKey),
        maxByValue: serializeValue(control.maxByValue),
        displayOffset: serializeValue(control.displayOffset),
        dependsOn: serializeValue(control.dependsOn),
        dependsOnValue: serializeValue(control.dependsOnValue),
        dependsOnValues: serializeValue(control.dependsOnValues),
        mediaSlots: serializeValue(control.mediaSlots),
        desc: serializeValue(control.desc || control.description || control.describe),
      };
      const sourceType = String(control.type || '').toLowerCase();
      if (!explicitDisplay && type === 'select' && (sourceType === 'color' || sourceType === 'palette' || isThemeSwatchControl(page, key))) {
        next.display = 'color';
      }
      const optionCount = Array.isArray(options) ? options.length : 0;
      if (!explicitDisplay && type === 'select' && next.display !== 'color' && optionCount > 0 && optionCount <= 5) {
        next.display = 'tab';
      }
      return next;
    })
    .filter(Boolean), { layout: page?.key, themeKey: page?.themeKey }), serializeDefaults(defaults));
}

function isThemeSwatchControl(page, key) {
  return (getThemeRuntimeOverride(page?.themeKey)?.swatchKeys || []).includes(key);
}

function normalizeType(type) {
  if (type === 'slider' || type === 'number') return 'range';
  if (type === 'icons') return 'icons';
  if (['enum', 'radio', 'select', 'segment', 'color', 'palette', 'labelType'].includes(type)) return 'select';
  if (['toggle', 'boolean', 'focus'].includes(type)) return 'toggle';
  return type || 'range';
}

function resolveValue(value, defaults) {
  if (typeof value === 'function') return value(defaults);
  return value;
}

function serializeDefaults(defaultProps) {
  return Object.fromEntries(
    Object.entries(defaultProps || {})
      .map(([key, value]) => [key, serializeValue(value)])
      .filter(([, value]) => value !== undefined),
  );
}
