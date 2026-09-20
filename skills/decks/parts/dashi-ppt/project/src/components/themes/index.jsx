import React from 'react';
import { useSlideViewModel } from '../../view-model/context.jsx';
import { GENERATED_THEME_PAGES, GENERATED_THEME_PACKS } from './generated-metadata.js';
import { canonicalizeThemePageRuntime } from './canonical-metadata.mjs';

const THEME_RUNTIME_METADATA = GENERATED_THEME_PAGES.map(canonicalizeThemePageRuntime);
export const THEME_PAGES = THEME_RUNTIME_METADATA.map(metadata => metadata.page);
export const THEME_PACK_OPTIONS = Object.fromEntries(
  GENERATED_THEME_PACKS.map(theme => [
    theme.key,
    {
      label: theme.label,
      displayName: theme.displayName,
      scenario: theme.scenario,
      audience: theme.audience,
      layouts: THEME_PAGES.filter(page => page.themeKey === theme.key).map(page => page.key),
    },
  ]),
);

const METADATA_BY_KEY = new Map(THEME_RUNTIME_METADATA.map(metadata => [metadata.page.key, metadata]));

export function makeImportedThemePage(layoutKey) {
  const metadata = METADATA_BY_KEY.get(layoutKey);
  if (!metadata) throw new Error(`Unknown imported theme page "${layoutKey}"`);
  const { page, controls, defaults } = metadata;
  return function ImportedThemePage(props) {
    const viewModel = useSlideViewModel();
    const hasVariants = Number(viewModel?.variantCount) > 1;
    const comparisonVariant = viewModel?.variantMode === 'comparison';
    const slideId = comparisonVariant ? (viewModel?.physicalId || viewModel?.id) : viewModel?.id;
    return (
      <section
        className={`slide imported-theme-slide ${page.bgClass || ''}`}
        data-layout={page.layout}
        data-vm-slide-id={slideId}
        data-vm-source-slide-id={comparisonVariant ? viewModel?.sourceSlideId : undefined}
        data-vm-slide-key={viewModel?.key}
        data-vm-layout={viewModel?.layout}
        data-vm-index={viewModel?.index}
        data-vm-variant-state-id={hasVariants ? viewModel?.stateId : undefined}
        data-vm-variant-id={hasVariants ? viewModel?.variantId : undefined}
        data-vm-variant-index={hasVariants ? viewModel?.variantIndex : undefined}
        data-vm-variant-count={hasVariants ? viewModel?.variantCount : undefined}
        data-vm-variant-kind={comparisonVariant ? viewModel?.variantKind : undefined}
        data-vm-variant-mode={comparisonVariant ? 'comparison' : undefined}
        data-theme-pack={viewModel?.themePack}
        data-logical-slide={viewModel?.logicalIndex}
        data-label={viewModel?.label || page.label}
      >
        <div
          className="imported-theme-root"
          data-theme-key={page.themeKey}
          data-page-key={page.key}
          data-prop-controls={JSON.stringify(controls)}
          data-prop-defaults={JSON.stringify(defaults)}
        />
      </section>
    );
  };
}
