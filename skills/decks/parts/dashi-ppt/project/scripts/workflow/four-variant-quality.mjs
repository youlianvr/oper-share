import {
  existsSync,
  readdirSync,
  readFileSync,
} from 'node:fs';
import path from 'node:path';

const ASSET_REF_PATTERN = /(?:^|["'`(,;:\s=])((?:\.\/|\/)?(?:assets|images|uploads)\/[^"'`<>)\s\\]+?\.(?:png|jpe?g|webp|gif|svg|mp4|mov|json|js|css|wasm|woff2?|ttf|otf|ico))(?:[?#][^"'`<>)\s\\]*)?/gi;
const GENERATED_ASSETS = new Set([
  'assets/imported-theme-runtime.js',
  'assets/vendor/gsap.min.js',
  'assets/vendor/pptxgen.bundle.js',
  'assets/vendor/html-to-image.js',
  'assets/vendor/pdf-lib.min.js',
]);

export function groupPhysicalSlides(slides) {
  const groups = new Map();
  for (const slide of slides || []) {
    const sourceSlideId = String(slide?.sourceSlideId || '').trim();
    if (!sourceSlideId) continue;
    if (!groups.has(sourceSlideId)) {
      groups.set(sourceSlideId, {
        sourceSlideId,
        slides: [],
      });
    }
    groups.get(sourceSlideId).slides.push(slide);
  }
  return [...groups.values()];
}

export function auditThemeAssetProvenance({
  html,
  deckDir,
  projectRoot,
  themeSourceRoot = path.join(projectRoot, 'src/components/themes'),
}) {
  const source = String(html || '');
  const usedThemes = [...new Set(
    [...source.matchAll(/\bdata-theme-pack=["'](theme\d+)["']/gi)]
      .map(match => match[1]),
  )].sort();
  const assets = collectLocalAssetRefs(source);
  const themeKeys = listThemeKeys(themeSourceRoot);
  const errors = [];
  const provenances = [];

  for (const asset of assets) {
    const outputFile = path.join(deckDir, asset);
    if (!existsSync(outputFile)) {
      errors.push({ asset, reason: 'missing-output-asset', usedThemes });
      continue;
    }
    if (isGeneratedOrUserAsset(asset)) {
      provenances.push({ asset, source: 'generated-or-user' });
      continue;
    }

    const sharedSource = path.join(projectRoot, asset);
    if (existsSync(sharedSource)) {
      if (sameFileContents(sharedSource, outputFile)) {
        provenances.push({ asset, source: 'shared-runtime' });
      } else {
        errors.push({ asset, reason: 'shared-asset-content-mismatch', usedThemes });
      }
      continue;
    }

    const availableThemes = themeKeys.filter(themeKey => (
      existsSync(path.join(themeSourceRoot, themeKey, 'source', asset))
    ));
    const matchingUsedTheme = usedThemes.find(themeKey => {
      const sourceFile = path.join(themeSourceRoot, themeKey, 'source', asset);
      return existsSync(sourceFile) && sameFileContents(sourceFile, outputFile);
    });
    if (matchingUsedTheme) {
      provenances.push({ asset, source: 'theme', theme: matchingUsedTheme });
      continue;
    }
    if (availableThemes.some(themeKey => usedThemes.includes(themeKey))) {
      errors.push({
        asset,
        reason: 'used-theme-asset-content-mismatch',
        usedThemes,
        availableThemes,
      });
      continue;
    }
    if (availableThemes.length) {
      errors.push({
        asset,
        reason: 'asset-only-belongs-to-unrelated-theme',
        usedThemes,
        availableThemes,
      });
      continue;
    }
    errors.push({
      asset,
      reason: 'asset-has-no-declared-source',
      usedThemes,
      availableThemes: [],
    });
  }

  return {
    ok: errors.length === 0,
    usedThemes,
    checkedAssets: assets.length,
    provenances,
    errors,
  };
}

export function collectLocalAssetRefs(source) {
  const refs = new Set();
  for (const match of String(source || '').matchAll(ASSET_REF_PATTERN)) {
    const normalized = normalizeAssetRef(match[1]);
    if (normalized) refs.add(normalized);
  }
  return [...refs].sort();
}

function normalizeAssetRef(value) {
  let normalized = String(value || '').trim().replaceAll('\\/', '/');
  if (!normalized || /^(?:data:|blob:|https?:|file:|#)/i.test(normalized)) return null;
  normalized = normalized.split(/[?#]/)[0].replace(/^\/+/, '');
  while (normalized.startsWith('./')) normalized = normalized.slice(2);
  if (normalized.split('/').some(segment => !segment || segment === '..')) return null;
  return normalized;
}

function isGeneratedOrUserAsset(asset) {
  return GENERATED_ASSETS.has(asset)
    || asset.startsWith('assets/user-media/')
    || asset.startsWith('images/user-media/');
}

function listThemeKeys(themeSourceRoot) {
  try {
    return readdirSync(themeSourceRoot, { withFileTypes: true })
      .filter(entry => entry.isDirectory() && /^theme\d+$/.test(entry.name))
      .map(entry => entry.name)
      .sort();
  } catch {
    return [];
  }
}

function sameFileContents(left, right) {
  return readFileSync(left).equals(readFileSync(right));
}
