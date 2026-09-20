import React from 'react';
import { useSlideViewModel } from '../../view-model/context.jsx';

export function SlideShell({ layout, tone = 'light', hero = false, animate = 'cascade', className = '', children }) {
  const viewModel = useSlideViewModel();
  const hasVariants = Number(viewModel?.variantCount) > 1;
  const comparisonVariant = viewModel?.variantMode === 'comparison';
  const slideId = comparisonVariant ? (viewModel?.physicalId || viewModel?.id) : viewModel?.id;
  const classes = ['slide', hero ? 'hero' : '', tone, className].filter(Boolean).join(' ');
  return (
    <section
      className={classes}
      data-layout={layout}
      data-animate={animate}
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
    >
      {children}
    </section>
  );
}
