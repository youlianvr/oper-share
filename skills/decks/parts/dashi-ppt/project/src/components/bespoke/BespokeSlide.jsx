import React from 'react';
import { useSlideViewModel } from '../../view-model/context.jsx';
import {
  chartTypeAllowsNegativeValues,
  formatValueWithUnit,
  isValidBespokeChartValue,
} from '../../variant-contract.mjs';
import { getBespokeThemeProfile } from '#dashi-bespoke-theme-profiles';

export const BESPOKE_GRID_COLUMNS = 12;
export const BESPOKE_GRID_ROWS = 8;

const ALIGNMENTS = {
  left: 'left',
  center: 'center',
  right: 'right',
};

const TEXT_ROLE_RECIPES = {
  kicker: { lineHeight: 1.2, fontWeight: 780, letterSpacing: '.15em', textTransform: 'uppercase', minSize: 14 },
  title: { lineHeight: 1.02, fontWeight: 900, letterSpacing: '-.035em', minSize: 30 },
  subtitle: { lineHeight: 1.24, fontWeight: 650, letterSpacing: '-.012em', minSize: 22 },
  body: { lineHeight: 1.5, fontWeight: 450, letterSpacing: 0, minSize: 17 },
  label: { lineHeight: 1.2, fontWeight: 750, letterSpacing: '.14em', textTransform: 'uppercase', minSize: 13 },
  caption: { lineHeight: 1.4, fontWeight: 500, letterSpacing: '.02em', minSize: 15 },
};

export function BespokeSlide({ composition = {} }) {
  const viewModel = useSlideViewModel() || {};
  const themePack = viewModel.themePack || 'theme01';
  const comparisonVariant = viewModel.variantMode === 'comparison';
  const physicalId = comparisonVariant
    ? (viewModel.physicalId || viewModel.stateId || viewModel.id)
    : (viewModel.id || viewModel.sourceSlideId || viewModel.physicalId || viewModel.stateId);
  const sourceSlideId = viewModel.sourceSlideId || viewModel.pageId || viewModel.logicalId || viewModel.id;
  const stateId = viewModel.stateId || physicalId;

  return (
    <section
      className="slide bespoke-slide"
      data-vm-slide-id={physicalId}
      data-vm-source-slide-id={sourceSlideId}
      data-vm-slide-key={viewModel.key || physicalId}
      data-vm-index={viewModel.index}
      data-vm-variant-state-id={stateId}
      data-vm-variant-id={viewModel.variantId}
      data-vm-variant-index={viewModel.variantIndex}
      data-vm-variant-count={viewModel.variantCount}
      data-vm-variant-kind="bespoke"
      data-vm-variant-mode={viewModel.variantMode || 'comparison'}
      data-theme-pack={themePack}
      data-logical-slide={viewModel.logicalIndex}
      data-label={viewModel.label || 'Agent 定制方案'}
      aria-label={viewModel.label || 'Agent 定制方案'}
    >
      <BespokeSlideBody composition={composition} themePack={themePack} />
    </section>
  );
}

export function BespokeSlideBody({ composition = {}, themePack = 'theme01' }) {
  const profile = getBespokeThemeProfile(themePack, composition.background);
  const elements = Array.isArray(composition?.elements) ? composition.elements.slice(0, 32) : [];
  const family = composition?.designIntent?.compositionFamily || 'unplanned';
  const recipe = familyRecipe(profile, family);
  const Runtime = profile.Runtime;
  return (
    <div
      className="bespoke-root"
      data-bespoke-composition-family={family}
      data-bespoke-frame={recipe.frame}
      data-bespoke-surface-language={recipe.surface}
      data-bespoke-title-language={recipe.titleClass}
      data-bespoke-list-language={recipe.listMode}
      style={rootStyle(profile)}
    >
      {profile.cssText ? <style data-bespoke-theme-source={profile.themeKey}>{profile.cssText}</style> : null}
      {Runtime ? <Runtime /> : null}
      <div className={profile.rootClass} data-bespoke-theme-source={profile.sourcePath} style={themeLayerStyle(profile)}>
        <ThemeDecorations profile={profile} composition={composition} />
        <CompositionFrame profile={profile} family={family} recipe={recipe} />
        <div className="bespoke-grid" style={canvasStyle(profile)}>
          {elements.map((element, index) => (
            <BespokeElement
              key={element?.id || `${element?.type || 'element'}-${index + 1}`}
              element={element || {}}
              index={index}
              profile={profile}
              family={family}
              recipe={recipe}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ThemeDecorations({ profile, composition }) {
  const primitives = profile.sourcePrimitives || {};
  const family = composition?.designIntent?.compositionFamily || 'unplanned';
  if (profile.decoration === 'theme01-bokeh') {
    return (
      <div aria-hidden="true" data-editable-skip="true" style={decorationLayerStyle()}>
        <span style={orbStyle(profile.accent2, { width: 620, height: 620, right: -190, top: -260, opacity: 0.2, filter: 'blur(28px)' })} />
        <span style={orbStyle(profile.accent, { width: 420, height: 420, left: -160, bottom: -190, opacity: 0.16, filter: 'blur(32px)' })} />
        <span style={{ position: 'absolute', inset: '34px', border: `1px solid ${profile.line}`, borderRadius: 28 }} />
      </div>
    );
  }
  if (profile.decoration === 'theme02-grid') {
    const isPath = family === 'timeline' || family === 'process';
    const isData = family === 'chart-led' || family === 'metric-spotlight' || family === 'matrix';
    const primaryGlow = family === 'hero' || family === 'editorial'
      ? { width: 880, height: 880, right: -260, top: -330, opacity: 0.5 }
      : family === 'split' || family === 'comparison'
        ? { width: 580, height: 580, right: -160, top: 110, opacity: 0.34 }
        : { width: 680, height: 420, right: 120, bottom: -250, opacity: 0.28 };
    const secondaryGlow = isData
      ? { width: 460, height: 460, left: 100, top: 210, opacity: 0.14, cool: true }
      : { width: 460, height: 460, left: -230, bottom: -250, opacity: 0.16, cool: true };
    return (
      <div aria-hidden="true" data-editable-skip="true" style={decorationLayerStyle()}>
        {!isPath && <span style={gxnAuroraStyle(primaryGlow)} />}
        {!isPath && <span style={gxnAuroraStyle(secondaryGlow)} />}
        {isPath && (
          <span style={{
            position: 'absolute',
            left: family === 'timeline' ? 170 : 110,
            right: family === 'timeline' ? 'auto' : 110,
            top: family === 'timeline' ? 170 : 610,
            bottom: family === 'timeline' ? 120 : 'auto',
            width: family === 'timeline' ? 180 : 'auto',
            height: family === 'timeline' ? 'auto' : 180,
            background: family === 'timeline'
              ? 'linear-gradient(180deg,rgba(var(--gxn-glow),.3),transparent)'
              : 'linear-gradient(90deg,rgba(var(--gxn-glow),.28),rgba(78,162,255,.16),transparent)',
            filter: 'blur(44px)',
            opacity: 0.7,
          }} />
        )}
        <span style={{ position: 'absolute', left: 64, top: 54, width: 48, height: 2, background: 'linear-gradient(90deg,var(--gxn-accent),transparent)', boxShadow: '0 0 18px rgba(var(--gxn-glow),.8)' }} />
        <span style={{ position: 'absolute', right: 64, top: 54, color: 'var(--gxn-faint)', fontFamily: 'var(--gxn-font-mono)', fontSize: 15, letterSpacing: '.16em' }}>
          {plainText(composition?.designIntent?.narrativeRole) || 'NATIVE COMPOSITION'}
        </span>
        <span style={{ position: 'absolute', left: 64, right: 64, bottom: 46, height: 1, background: 'linear-gradient(90deg,rgba(var(--gxn-glow),.55),var(--gxn-line) 28%,var(--gxn-line) 72%,rgba(78,162,255,.45))' }} />
      </div>
    );
  }
  if (profile.decoration === 'theme04-sparks') {
    return (
      <div aria-hidden="true" data-editable-skip="true" style={decorationLayerStyle()}>
        <span style={{ position: 'absolute', right: 84, top: 72, width: 38, height: 38, border: `5px solid ${profile.ink}`, borderRadius: '50%' }} />
        <span style={{ position: 'absolute', left: 62, bottom: 54, width: 18, height: 18, background: profile.chartTreatment.series[2], transform: 'rotate(45deg)' }} />
      </div>
    );
  }
  if (profile.decoration === 'theme05-spectrum') {
    const kicker = composition?.elements?.find(element => element?.type === 'text' && element?.role === 'kicker')?.text;
    const narrativeRole = composition?.designIntent?.narrativeRole;
    return (
      <div aria-hidden="true" data-editable-skip="true" style={decorationLayerStyle()}>
        <header className="pulse-bar pulse-bar--dark" style={{ position: 'absolute', inset: '0 0 auto', zIndex: 1 }}>
          <div className="pulse-wordmark">{plainText(kicker) || 'CUSTOM'}<sup>®</sup></div>
          <div className="pulse-bar__meta">
            <span>{plainText(narrativeRole) || 'AGENT COMPOSITION'}</span>
            <span className="sep">/</span>
            <span>V4</span>
          </div>
        </header>
        <div className="pulse-band" style={{ position: 'absolute', inset: 'auto 0 0', zIndex: 1 }}>
          {profile.chartTreatment.series.map((color, index) => (
            <i key={`${color}-${index}`} style={{ flex: 1, background: color }} />
          ))}
        </div>
      </div>
    );
  }
  if (profile.decoration === 'theme06-grid' && primitives.Grid) {
    const Grid = primitives.Grid;
    return <div aria-hidden="true" data-editable-skip="true" style={decorationLayerStyle()}><Grid cols={6} /></div>;
  }
  if (profile.decoration === 'theme07-lens') {
    return (
      <div aria-hidden="true" data-editable-skip="true" style={decorationLayerStyle()}>
        <span style={{ position: 'absolute', width: 610, height: 610, right: -205, top: -205, border: `1px solid ${profile.line}`, borderRadius: '50%' }} />
        <span style={{ position: 'absolute', width: 430, height: 430, right: -115, top: -115, border: `18px solid ${profile.accent}`, borderRadius: '50%', opacity: 0.08 }} />
        <span style={{ position: 'absolute', left: 68, top: 62, bottom: 62, width: 5, background: profile.accent }} />
      </div>
    );
  }
  if (profile.decoration === 'theme08-doodle' && primitives.Doodle) {
    const Doodle = primitives.Doodle;
    return (
      <div aria-hidden="true" data-editable-skip="true" style={decorationLayerStyle()}>
        <Doodle kind="spark" size={70} fill={profile.accent2} stroke={profile.ink} style={{ right: 48, top: 34 }} />
        <Doodle kind="arrowS" size={92} color={profile.ink} style={{ left: 42, bottom: 32 }} />
      </div>
    );
  }
  if (profile.decoration === 'theme09-orbs') {
    return (
      <div aria-hidden="true" data-editable-skip="true" style={decorationLayerStyle()}>
        <span style={orbStyle(profile.accent2, { width: 520, height: 520, right: -180, top: -210 })} />
        <span style={orbStyle(profile.accent, { width: 360, height: 360, left: -160, bottom: -170 })} />
      </div>
    );
  }
  if (profile.decoration === 'theme10-grain') {
    return (
      <div
        aria-hidden="true"
        data-editable-skip="true"
        style={{
          ...decorationLayerStyle(),
          backgroundImage: `radial-gradient(${profile.ink} 0.7px,transparent 0.8px)`,
          backgroundSize: '7px 7px',
          opacity: 0.075,
        }}
      >
        <span style={{ position: 'absolute', left: 70, right: 70, top: 54, height: 1, background: profile.line }} />
        <span style={{ position: 'absolute', right: 76, bottom: 54, width: 180, height: 3, background: `linear-gradient(90deg,transparent,${profile.accent})` }} />
      </div>
    );
  }
  if (profile.decoration === 'theme11-ignis' && primitives.Slide) {
    const Slide = primitives.Slide;
    const Grain = primitives.Grain;
    const Edge = primitives.Edge;
    const Corners = primitives.Corners;
    const surface = profile.semanticBackground === 'surface' || profile.semanticBackground === 'light'
      ? 'paper'
      : profile.semanticBackground === 'accent'
        ? 'ember'
        : 'ink';
    return (
      <div aria-hidden="true" data-editable-skip="true" style={decorationLayerStyle()}>
        <Slide surface={surface} style={{ position: 'absolute', inset: 0, padding: 0, pointerEvents: 'none' }}>
          {Grain ? <Grain /> : null}
          {Edge ? <Edge /> : null}
          {Corners ? <Corners /> : null}
        </Slide>
      </div>
    );
  }
  if (profile.decoration === 'theme12-shapes' && primitives.Shape) {
    const Shape = primitives.Shape;
    return (
      <div aria-hidden="true" data-editable-skip="true" style={decorationLayerStyle()}>
        <Shape kind="ring" size={150} color={profile.accent2} border={18} style={{ right: 44, top: 42, opacity: 0.42 }} />
        <Shape kind="teardrop" size={88} color={profile.accent} style={{ left: 42, bottom: 34, opacity: 0.52 }} />
      </div>
    );
  }
  return null;
}

function CompositionFrame({ profile, family, recipe }) {
  if (profile.themeKey === 'theme03') {
    const common = {
      fill: 'none',
      stroke: 'var(--rd-line)',
      strokeWidth: 2,
      vectorEffect: 'non-scaling-stroke',
    };
    const blue = 'var(--rd-blue)';
    const lime = 'var(--rd-lime)';
    let geometry = null;
    if (recipe.frame === 'rd-masthead') {
      geometry = (
        <>
          <rect x="120" y="92" width="14" height="778" fill={blue} />
          <rect x="120" y="894" width="520" height="18" fill={lime} />
          <path d="M1560 92H1800V332" {...common} stroke={blue} strokeWidth="4" />
          <path d="M1608 140H1800" {...common} stroke={lime} strokeWidth="12" />
        </>
      );
    } else if (recipe.frame === 'rd-editorial-rail') {
      geometry = (
        <>
          <path d="M120 430H1800" {...common} />
          <rect x="120" y="382" width="10" height="574" fill={blue} />
          <rect x="1440" y="430" width="360" height="10" fill={lime} />
        </>
      );
    } else if (recipe.frame === 'rd-split-rule') {
      geometry = (
        <>
          <path d="M120 430H1800" {...common} />
          <path d="M836 430V956" {...common} stroke={blue} strokeWidth="4" />
          <rect x="824" y="430" width="24" height="24" fill={lime} />
        </>
      );
    } else if (recipe.frame === 'rd-comparison-axis') {
      geometry = (
        <>
          <path d="M960 430V956" {...common} strokeWidth="4" />
          <rect x="120" y="430" width="760" height="12" fill={blue} />
          <rect x="1040" y="430" width="760" height="12" fill={lime} />
          <path d="M920 430H1000M920 956H1000" {...common} />
        </>
      );
    } else if (recipe.frame === 'rd-process-path') {
      geometry = (
        <>
          <path d="M120 430H1800" {...common} />
          <rect x="120" y="430" width="240" height="8" fill={blue} />
          <rect x="1560" y="430" width="240" height="8" fill={lime} />
        </>
      );
    } else if (recipe.frame === 'rd-matrix-grid') {
      geometry = (
        <>
          <rect x="120" y="430" width="1680" height="526" {...common} />
          <path d="M960 430V956M120 693H1800" {...common} />
          <rect x="120" y="430" width="18" height="18" fill={blue} />
          <rect x="1782" y="938" width="18" height="18" fill={lime} />
        </>
      );
    } else if (recipe.frame === 'rd-metric-band') {
      geometry = (
        <>
          <path d="M120 430H1800" {...common} />
          <rect x="120" y="430" width="600" height="12" fill={blue} />
          <rect x="720" y="430" width="1080" height="12" fill={lime} />
          <path d="M120 956H1800" {...common} />
        </>
      );
    } else if (recipe.frame === 'rd-timeline-spine') {
      geometry = (
        <>
          <path d="M120 430H1800" {...common} />
          <rect x="120" y="430" width="12" height="526" fill={blue} />
          <rect x="120" y="930" width="300" height="26" fill={lime} />
        </>
      );
    } else if (recipe.frame === 'rd-chart-plot') {
      geometry = (
        <>
          <path d="M120 430H1800" {...common} />
          <rect x="120" y="430" width="520" height="10" fill={blue} />
          <rect x="1640" y="430" width="160" height="10" fill={lime} />
          <path d="M120 956H1800" {...common} />
        </>
      );
    }
    if (!geometry) return null;
    return (
      <svg
        aria-hidden="true"
        data-editable-skip="true"
        data-bespoke-frame-geometry={recipe.frame}
        viewBox="0 0 1920 1080"
        preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}
      >
        {geometry}
      </svg>
    );
  }

  if (profile.themeKey !== 'theme02') return null;
  const common = {
    fill: 'none',
    stroke: 'rgba(var(--gxn-glow),.34)',
    strokeWidth: 2,
    vectorEffect: 'non-scaling-stroke',
  };
  let geometry = null;
  if (family === 'hero' || family === 'editorial') {
    geometry = (
      <>
        <circle cx="1540" cy="530" r="250" {...common} />
        <circle cx="1540" cy="530" r="172" {...common} stroke="rgba(78,162,255,.22)" />
        <path d="M1270 530H1810M1540 260V800" {...common} strokeDasharray="7 16" />
      </>
    );
  } else if (family === 'split' || family === 'comparison') {
    geometry = (
      <>
        <path d="M960 156V924" {...common} />
        <path d="M914 156H1006M914 924H1006" {...common} />
        <circle cx="960" cy="540" r="14" fill="var(--gxn-accent)" stroke="none" />
      </>
    );
  } else if (family === 'timeline') {
    geometry = <path d="M220 264V872" {...common} strokeWidth="4" />;
  } else if (family === 'process') {
    geometry = <path d="M220 650H1700" {...common} strokeWidth="4" />;
  } else if (family === 'matrix') {
    geometry = (
      <>
        <rect x="154" y="272" width="1612" height="650" rx="28" {...common} />
        <path d="M960 272V922M154 597H1766" {...common} />
      </>
    );
  } else if (family === 'metric-spotlight') {
    geometry = (
      <>
        {[0, 1, 2].map(index => <circle key={index} cx={430 + index * 530} cy="590" r={190 - index * 18} {...common} strokeDasharray={index === 1 ? '10 16' : undefined} />)}
      </>
    );
  } else if (family === 'chart-led') {
    geometry = (
      <>
        {[0, 1, 2, 3].map(index => <path key={index} d={`M160 ${390 + index * 145}H1370`} {...common} stroke="rgba(255,255,255,.07)" />)}
      </>
    );
  }
  if (!geometry) return null;
  return (
    <svg
      aria-hidden="true"
      data-editable-skip="true"
      data-bespoke-frame-geometry={recipe.frame}
      viewBox="0 0 1920 1080"
      preserveAspectRatio="none"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none', opacity: 0.9 }}
    >
      {geometry}
    </svg>
  );
}

function BespokeElement({ element, index, profile, family, recipe }) {
  switch (element.type) {
    case 'text':
      return <TextElement element={element} index={index} profile={profile} family={family} recipe={recipe} />;
    case 'metric':
      return <MetricElement element={element} index={index} profile={profile} family={family} recipe={recipe} />;
    case 'list':
      return <ListElement element={element} index={index} profile={profile} family={family} recipe={recipe} />;
    case 'quote':
      return <QuoteElement element={element} index={index} profile={profile} family={family} recipe={recipe} />;
    case 'media':
      return <MediaElement element={element} index={index} profile={profile} />;
    case 'shape':
      return <ShapeElement element={element} index={index} profile={profile} />;
    case 'chart':
      return <ChartElement element={element} index={index} profile={profile} family={family} recipe={recipe} />;
    default:
      return null;
  }
}

function TextElement({ element, index, profile, recipe }) {
  const roleName = Object.hasOwn(TEXT_ROLE_RECIPES, element.role) ? element.role : 'body';
  const textRecipe = {
    ...TEXT_ROLE_RECIPES[roleName],
    ...(profile.textTreatment?.[roleName] || {}),
  };
  const fit = fitTextToGrid(plainText(element.text), roleName, element.grid, profile, recipe);
  const color = toneColor(profile, element.tone);
  const theme03Native = profile.themeKey === 'theme03';
  const theme03Text = theme03Native ? theme03TextStyle(roleName, recipe, profile) : {};
  return (
    <div
      data-bespoke-element="text"
      data-bespoke-fit-role={roleName}
      data-bespoke-title-treatment={roleName === 'title' ? recipe.titleClass : undefined}
      data-bespoke-capacity={fit.fits ? 'fit' : 'minimum'}
      style={{
        ...elementGridStyle(element),
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        color,
        textAlign: ALIGNMENTS[element.align] || 'left',
        fontFamily: roleName === 'label' || roleName === 'kicker' ? profile.fontMono : profile.fontDisplay,
        overflow: 'hidden',
      }}
    >
      <div
        className={nativeTextClass(profile, roleName, recipe, element.tone)}
        data-editable-path={editablePath(element, index, 'text')}
        style={{
          ...theme03Text,
          alignSelf: roleName === 'kicker' && theme03Native ? 'flex-start' : undefined,
          color: theme03Text.color || color,
          fontSize: fit.fontSize,
          lineHeight: theme03Native ? theme03Text.lineHeight : textRecipe.lineHeight,
          fontWeight: theme03Native ? theme03Text.fontWeight : textRecipe.fontWeight,
          letterSpacing: theme03Native ? theme03Text.letterSpacing : textRecipe.letterSpacing,
          textTransform: theme03Native ? theme03Text.textTransform : textRecipe.textTransform,
          textShadow: profile.themeKey === 'theme02' && (roleName === 'title' || element.tone === 'accent')
            ? '0 0 34px rgba(var(--gxn-glow),.28)'
            : undefined,
          maxWidth: '100%',
          overflowWrap: 'anywhere',
          textWrap: roleName === 'title' ? 'balance' : 'pretty',
        }}
      >
        {plainText(element.text)}
      </div>
    </div>
  );
}

function MetricElement({ element, index, profile, recipe }) {
  const framed = recipe.metricMode !== 'band';
  const palette = elementPalette(profile, framed);
  const fit = fitMetricToGrid(element, profile, recipe, framed);
  const formattedValue = formatMetricValue(element.value, element.unit);
  return (
    <div
      className={framed ? nativePanelClass(profile, element) : undefined}
      data-bespoke-element="metric"
      data-bespoke-metric-language={recipe.metricMode}
      data-bespoke-fit-role="metric"
      data-bespoke-capacity={fit.fits ? 'fit' : 'minimum'}
      style={{
        ...elementGridStyle(element),
        ...cardStyle(profile, framed, element.grid, element.tone === 'accent'),
        display: 'flex',
        flexDirection: 'column',
        justifyContent: framed ? 'flex-start' : 'center',
        gap: fit.gap,
        color: palette.ink,
        overflow: 'hidden',
        borderTop: framed ? undefined : `4px solid ${toneColor(profile, element.tone || 'accent')}`,
        borderBottom: framed ? undefined : `1px solid ${profile.line}`,
        paddingTop: framed ? undefined : 24,
        paddingBottom: framed ? undefined : 18,
      }}
    >
      <div
        className={profile.themeKey === 'theme03' ? 'rd-mono' : undefined}
        data-editable-path={editablePath(element, index, 'label')}
        style={{
          color: palette.muted,
          fontFamily: profile.fontMono,
          fontSize: fit.labelSize,
          fontWeight: 700,
          letterSpacing: '.12em',
          lineHeight: 1.2,
          textTransform: 'uppercase',
          overflowWrap: 'anywhere',
        }}
      >
        {plainText(element.label)}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', minWidth: 0 }}>
        <strong
          className={profile.themeKey === 'theme02'
            ? 'gxn-num gxn-aurora-num'
            : profile.themeKey === 'theme03'
              ? 'rd-figure'
              : undefined}
          data-editable-path={editablePath(element, index, 'value')}
          style={{
            color: toneColor(profile, element.tone || 'accent'),
            fontFamily: profile.fontDisplay,
            fontSize: fit.valueSize,
            display: 'block',
            fontWeight: profile.themeKey === 'theme03' ? 800 : profile.metricWeight || 900,
            letterSpacing: profile.themeKey === 'theme03' ? '-.03em' : '-.045em',
            lineHeight: profile.themeKey === 'theme03' ? 0.86 : 0.92,
            overflowWrap: 'anywhere',
            textWrap: profile.themeKey === 'theme03' ? 'balance' : undefined,
          }}
        >
          {formattedValue}
        </strong>
      </div>
      {element.detail != null && (
        <div
          className={profile.themeKey === 'theme03' ? 'rd-cap' : undefined}
          data-editable-path={editablePath(element, index, 'detail')}
          style={{ color: palette.muted, fontSize: fit.detailSize, lineHeight: 1.35, overflowWrap: 'anywhere' }}
        >
          {plainText(element.detail)}
        </div>
      )}
      {element.trend != null && (
        <div
          data-editable-path={editablePath(element, index, 'trend')}
          style={{
            alignSelf: 'flex-start',
            color: toneColor(profile, element.tone === 'critical' ? 'critical' : 'positive'),
            fontFamily: profile.fontMono,
            fontSize: fit.trendSize,
            fontWeight: 750,
            lineHeight: 1.2,
            padding: framed ? (fit.trendSize <= 14 ? '4px 7px' : '7px 10px') : 0,
            border: framed ? `1px solid ${palette.line}` : 0,
            borderRadius: framed ? Math.max(3, profile.radius / 2) : 0,
            overflowWrap: 'anywhere',
          }}
        >
          {plainText(element.trend)}
        </div>
      )}
    </div>
  );
}

function ListElement({ element, index, profile, recipe }) {
  if (recipe.listMode === 'process') {
    return <ProcessListElement element={element} index={index} profile={profile} />;
  }
  if (recipe.listMode === 'timeline') {
    return <TimelineListElement element={element} index={index} profile={profile} />;
  }
  return <StructuredListElement element={element} index={index} profile={profile} recipe={recipe} />;
}

function StructuredListElement({ element, index, profile, recipe }) {
  const items = Array.isArray(element.items) ? element.items.slice(0, 8) : [];
  const mode = recipe.listMode || 'stack';
  const framed = recipe.surface !== 'open';
  const palette = elementPalette(profile, framed);
  const comparisonSide = mode === 'comparison' && /right/i.test(String(element.id || '')) ? 'right' : 'left';
  const accentTone = comparisonSide === 'right' ? 'positive' : element.tone || 'accent';
  const accent = toneColor(profile, accentTone);
  const compact = mode === 'rail' || items.length >= 5;
  const titleSize = mode === 'rail' ? 20 : mode === 'comparison' ? 23 : mode === 'ledger' ? 22 : compact ? 21 : 25;
  const bodySize = mode === 'rail' ? 16 : mode === 'comparison' ? 17 : mode === 'ledger' ? 17 : compact ? 17 : 20;
  return (
    <div
      className={framed ? nativePanelClass(profile, element) : undefined}
      data-bespoke-element="list"
      data-bespoke-list-mode={mode}
      data-bespoke-comparison-side={mode === 'comparison' ? comparisonSide : undefined}
      style={{
        ...elementGridStyle(element),
        ...cardStyle(profile, framed, element.grid, element.tone === 'accent'),
        display: 'flex',
        flexDirection: 'column',
        color: palette.ink,
        overflow: 'hidden',
        borderTop: !framed && mode !== 'rail' ? `${mode === 'comparison' ? 10 : 3}px solid ${accent}` : undefined,
        borderLeft: !framed && mode === 'rail' ? `5px solid ${accent}` : undefined,
        borderBottom: !framed && mode === 'ledger' ? `1px solid ${palette.line}` : undefined,
        paddingTop: !framed && mode !== 'rail' ? 20 : undefined,
        paddingLeft: !framed && mode === 'rail' ? 24 : undefined,
      }}
    >
      <div style={{ display: 'grid', gap: mode === 'rail' ? 6 : 0, minHeight: 0, overflow: 'hidden' }}>
        {items.map((item, itemIndex) => {
          const normalized = normalizeListItem(item);
          return (
            <div
              key={normalized.id || itemIndex}
              style={{
                display: 'grid',
                gridTemplateColumns: mode === 'rail' ? '38px minmax(0,1fr)' : '42px minmax(0,1fr)',
                gap: mode === 'rail' ? 10 : 14,
                alignItems: 'start',
                padding: mode === 'rail'
                  ? `${itemIndex ? 8 : 0}px 0 9px`
                  : `${itemIndex ? 14 : 0}px 0 14px`,
                borderTop: itemIndex ? `1px solid ${palette.line}` : '0',
              }}
            >
              <span
                aria-hidden="true"
                data-editable-skip="true"
                style={{
                  color: accent,
                  fontFamily: profile.fontMono,
                  fontSize: mode === 'rail' ? 15 : 17,
                  fontWeight: 800,
                  lineHeight: 1.5,
                  letterSpacing: '.05em',
                }}
              >
                {element.ordered || profile.listMarker === 'index' || mode !== 'stack'
                  ? String(itemIndex + 1).padStart(2, '0')
                  : '•'}
              </span>
              <div style={{ minWidth: 0 }}>
                <div
                  data-editable-path={editablePath(element, index, `items.${itemIndex}.title`)}
                  style={{ fontSize: titleSize, fontWeight: 740, lineHeight: 1.25, overflowWrap: 'anywhere' }}
                >
                  {normalized.title}
                </div>
                {normalized.body && (
                  <div
                    data-editable-path={editablePath(element, index, `items.${itemIndex}.body`)}
                    style={{ color: palette.muted, fontSize: bodySize, lineHeight: 1.38, marginTop: 4, overflowWrap: 'anywhere' }}
                  >
                    {normalized.body}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProcessListElement({ element, index, profile }) {
  const items = Array.isArray(element.items) ? element.items.slice(0, 6) : [];
  const count = Math.max(1, items.length);
  return (
    <div
      data-bespoke-element="list"
      data-bespoke-list-mode="process"
      data-bespoke-data-geometry="ordered-nodes"
      data-bespoke-direction="left-to-right"
      style={{
        ...elementGridStyle(element),
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: `repeat(${count},minmax(0,1fr))`,
        gap: 26,
        padding: '30px 20px 18px',
        overflow: 'hidden',
      }}
    >
      <div
        aria-hidden="true"
        data-editable-skip="true"
        style={{
          position: 'absolute',
          left: 42,
          right: 48,
          top: 75,
          height: 4,
          background: `linear-gradient(90deg,${profile.accent},${profile.accent2})`,
        }}
      >
        <span style={{ position: 'absolute', right: -2, top: -8, width: 0, height: 0, borderTop: '10px solid transparent', borderBottom: '10px solid transparent', borderLeft: `18px solid ${profile.accent2}` }} />
      </div>
      {items.map((item, itemIndex) => {
        const normalized = normalizeListItem(item);
        const nodeColor = itemIndex === items.length - 1 ? profile.accent2 : profile.accent;
        return (
          <div key={normalized.id || itemIndex} data-bespoke-node-index={itemIndex + 1} style={{ position: 'relative', zIndex: 1, minWidth: 0 }}>
            <span
              aria-hidden="true"
              data-editable-skip="true"
              style={{
                width: 46,
                height: 46,
                display: 'grid',
                placeItems: 'center',
                border: `4px solid ${nodeColor}`,
                background: profile.bg,
                color: nodeColor,
                fontFamily: profile.fontMono,
                fontSize: 16,
                fontWeight: 800,
                lineHeight: 1,
              }}
            >
              {String(itemIndex + 1).padStart(2, '0')}
            </span>
            <div style={{ paddingTop: 30, paddingRight: 8 }}>
              <div
                data-editable-path={editablePath(element, index, `items.${itemIndex}.title`)}
                style={{ color: profile.ink, fontSize: 23, fontWeight: 760, lineHeight: 1.22, overflowWrap: 'anywhere' }}
              >
                {normalized.title}
              </div>
              {normalized.body && (
                <div
                  data-editable-path={editablePath(element, index, `items.${itemIndex}.body`)}
                  style={{ color: profile.muted, fontSize: 17, lineHeight: 1.4, marginTop: 8, overflowWrap: 'anywhere' }}
                >
                  {normalized.body}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TimelineListElement({ element, index, profile }) {
  const items = Array.isArray(element.items) ? element.items.slice(0, 8) : [];
  return (
    <div
      data-bespoke-element="list"
      data-bespoke-list-mode="timeline"
      data-bespoke-data-geometry="ordered-spine"
      data-bespoke-direction="top-to-bottom"
      style={{
        ...elementGridStyle(element),
        position: 'relative',
        display: 'grid',
        gridTemplateRows: `repeat(${Math.max(1, items.length)},minmax(0,1fr))`,
        gap: 8,
        padding: '16px 0 16px 10px',
        overflow: 'hidden',
      }}
    >
      <div
        aria-hidden="true"
        data-editable-skip="true"
        style={{
          position: 'absolute',
          left: 41,
          top: 24,
          bottom: 24,
          width: 4,
          background: `linear-gradient(180deg,${profile.accent},${profile.accent2})`,
        }}
      />
      {items.map((item, itemIndex) => {
        const normalized = normalizeListItem(item);
        const nodeColor = itemIndex === items.length - 1 ? profile.accent2 : profile.accent;
        return (
          <div key={normalized.id || itemIndex} data-bespoke-node-index={itemIndex + 1} style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: '68px minmax(0,1fr)', gap: 20, alignItems: 'center', minHeight: 0 }}>
            <span
              aria-hidden="true"
              data-editable-skip="true"
              style={{
                width: 34,
                height: 34,
                justifySelf: 'center',
                display: 'grid',
                placeItems: 'center',
                background: profile.bg,
                border: `4px solid ${nodeColor}`,
                color: nodeColor,
                fontFamily: profile.fontMono,
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              {String(itemIndex + 1).padStart(2, '0')}
            </span>
            <div style={{ minWidth: 0, padding: '9px 0', borderBottom: itemIndex < items.length - 1 ? `1px solid ${profile.line}` : 0 }}>
              <div
                data-editable-path={editablePath(element, index, `items.${itemIndex}.title`)}
                style={{ color: profile.ink, fontSize: 23, fontWeight: 760, lineHeight: 1.22, overflowWrap: 'anywhere' }}
              >
                {normalized.title}
              </div>
              {normalized.body && (
                <div
                  data-editable-path={editablePath(element, index, `items.${itemIndex}.body`)}
                  style={{ color: profile.muted, fontSize: 17, lineHeight: 1.36, marginTop: 5, overflowWrap: 'anywhere' }}
                >
                  {normalized.body}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function QuoteElement({ element, index, profile, recipe }) {
  const mode = recipe.quoteMode || 'card';
  const framed = mode === 'card';
  const palette = elementPalette(profile, framed);
  const matrix = mode === 'matrix';
  const pull = mode === 'pull';
  const sequence = elementSequenceNumber(element, index);
  return (
    <blockquote
      className={framed ? nativePanelClass(profile, element) : undefined}
      data-bespoke-element="quote"
      data-bespoke-quote-mode={mode}
      style={{
        ...elementGridStyle(element),
        ...cardStyle(profile, framed, element.grid, true),
        display: 'flex',
        flexDirection: 'column',
        justifyContent: matrix ? 'flex-start' : 'center',
        gap: matrix ? 12 : pull ? 22 : 26,
        margin: 0,
        overflow: 'hidden',
        borderTop: matrix ? `4px solid ${toneColor(profile, element.tone || 'accent')}` : undefined,
        borderBottom: matrix ? `1px solid ${profile.line}` : undefined,
        borderLeft: pull ? `7px solid ${toneColor(profile, element.tone || 'accent')}` : undefined,
        padding: matrix ? '18px 22px 16px' : undefined,
        paddingLeft: pull ? 32 : undefined,
      }}
    >
      <div
        aria-hidden="true"
        data-editable-skip="true"
        style={{
          color: toneColor(profile, element.tone || 'accent'),
          fontFamily: profile.fontMono,
          fontSize: matrix ? 17 : 64,
          fontWeight: 900,
          lineHeight: matrix ? 1.2 : 0.65,
          letterSpacing: matrix ? '.08em' : undefined,
        }}
      >
        {matrix ? sequence : '“'}
      </div>
      <div
        data-editable-path={editablePath(element, index, 'text')}
        style={{
          color: palette.ink,
          fontFamily: profile.fontDisplay,
          fontSize: matrix ? 27 : framed ? 42 : 54,
          fontWeight: 760,
          letterSpacing: '-.018em',
          lineHeight: matrix ? 1.18 : 1.24,
          textAlign: 'left',
          textWrap: 'balance',
          overflowWrap: 'anywhere',
        }}
      >
        {plainText(element.quote)}
      </div>
      {element.attribution != null && (
        <cite
          data-editable-path={editablePath(element, index, 'attribution')}
          style={{
            color: palette.muted,
            fontFamily: profile.fontMono,
            fontSize: matrix ? 16 : 20,
            lineHeight: matrix ? 1.25 : 1.4,
            fontStyle: 'normal',
            letterSpacing: '.05em',
            overflowWrap: 'anywhere',
          }}
        >
          {plainText(element.attribution)}
        </cite>
      )}
    </blockquote>
  );
}

function MediaElement({ element, index, profile }) {
  const src = safeMediaSource(element.src);
  const fit = element.fit === 'contain' ? 'contain' : 'cover';
  const isVideo = /\.(mp4|webm|mov|m4v)(?:[?#].*)?$/i.test(src) || /^data:video\//i.test(src);
  return (
    <figure
      data-bespoke-element="media"
      style={{
        ...elementGridStyle(element),
        position: 'relative',
        margin: 0,
        overflow: 'hidden',
        borderRadius: profile.mediaTreatment.radius,
        border: profile.mediaTreatment.border,
        background: profile.surface,
        boxShadow: profile.shadow,
      }}
    >
      {src ? (
        isVideo ? (
          <video
            src={src}
            muted
            loop
            playsInline
            preload="metadata"
            style={{ width: '100%', height: '100%', display: 'block', objectFit: fit, filter: profile.mediaTreatment.filter }}
          />
        ) : (
          <img
            src={src}
            alt={plainText(element.alt)}
            loading="lazy"
            decoding="async"
            style={{ width: '100%', height: '100%', display: 'block', objectFit: fit, filter: profile.mediaTreatment.filter }}
          />
        )
      ) : (
        <div
          aria-hidden="true"
          data-editable-skip="true"
          style={{
            width: '100%',
            height: '100%',
            display: 'grid',
            placeItems: 'center',
            color: profile.muted,
            fontFamily: profile.fontMono,
            fontSize: 18,
            letterSpacing: '.14em',
            background: `linear-gradient(135deg,${profile.surface},transparent)`,
          }}
        >
          MEDIA
        </div>
      )}
      <div
        aria-hidden="true"
        data-editable-skip="true"
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: profile.mediaTreatment.overlay }}
      />
    </figure>
  );
}

function ShapeElement({ element, index, profile }) {
  const shape = ['rect', 'circle', 'line', 'panel'].includes(element.shape)
    ? element.shape
    : 'panel';
  const color = shape === 'panel' && (!element.tone || element.tone === 'default')
    ? profile.surface
    : toneColor(profile, element.tone || 'accent');
  const direction = Number(element?.grid?.width) >= Number(element?.grid?.height) ? 'horizontal' : 'vertical';
  const line = shape === 'line';
  return (
    <div
      aria-hidden="true"
      data-editable-skip="true"
      data-bespoke-element="shape"
      data-bespoke-shape={shape}
      data-bespoke-index={index}
      style={{
        ...elementGridStyle(element),
        width: line && direction === 'vertical' ? profile.shapeTreatment.lineWidth : '100%',
        height: line && direction === 'horizontal' ? profile.shapeTreatment.lineWidth : '100%',
        alignSelf: line ? 'center' : 'stretch',
        justifySelf: line ? 'center' : 'stretch',
        borderRadius: shape === 'circle'
          ? 999
          : shape === 'panel'
            ? profile.shapeTreatment.panelRadius
            : 0,
        border: shape === 'panel'
          ? `${profile.shapeTreatment.panelBorderWidth}px solid ${profile.line}`
          : '0',
        background: color,
        boxShadow: shape === 'panel' ? profile.shadow : 'none',
        opacity: element.tone === 'muted' ? 0.32 : 1,
        pointerEvents: 'none',
      }}
    />
  );
}

function ChartElement({ element, index, profile, recipe }) {
  const chartType = ['bar', 'line', 'donut', 'progress'].includes(element.chartType) ? element.chartType : 'bar';
  const data = normalizeChartData(element.data, chartType);
  const framed = recipe.chartMode !== 'plot';
  const palette = elementPalette(profile, framed);
  return (
    <div
      className={framed ? nativePanelClass(profile, {...element, tone: element.tone || 'accent'}) : undefined}
      data-bespoke-element="chart"
      data-bespoke-chart={chartType}
      data-bespoke-chart-language={recipe.chartMode}
      data-bespoke-data-geometry={`chart-${chartType}`}
      style={{
        ...elementGridStyle(element),
        ...cardStyle(profile, framed, element.grid, true),
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
        overflow: 'hidden',
        borderTop: framed ? undefined : `4px solid ${profile.accent}`,
        borderBottom: framed ? undefined : `2px solid ${profile.line}`,
        paddingTop: framed ? undefined : 18,
      }}
    >
      <div style={{ flex: '1 1 auto', minHeight: 0, overflow: 'hidden', lineHeight: 0 }}>
        {chartType === 'line' && <LineChart data={data} profile={palette} showValues={element.showValues === true} />}
        {chartType === 'donut' && <DonutChart data={data} profile={palette} showValues={element.showValues === true} />}
        {chartType === 'progress' && <ProgressChart data={data} profile={palette} showValues={element.showValues === true} />}
        {chartType === 'bar' && <BarChart data={data} profile={palette} showValues={element.showValues === true} />}
      </div>
    </div>
  );
}

function BarChart({ data, profile, showValues }) {
  const min = Math.min(0, ...data.map(item => item.value));
  const max = Math.max(0, ...data.map(item => item.value));
  const range = Math.max(1, max - min);
  const yFor = value => 50 + (max - value) / range * 290;
  const zeroY = yFor(0);
  const slot = 900 / Math.max(1, data.length);
  const barWidth = Math.min(96, slot * 0.58);
  return (
    <svg viewBox="0 0 1000 420" width="100%" height="100%" preserveAspectRatio="none" aria-hidden="true" data-editable-skip="true">
      {gridLines(profile)}
      {data.map((item, index) => {
        const valueY = yFor(item.value);
        const height = Math.max(2, Math.abs(zeroY - valueY));
        const x = 60 + index * slot + (slot - barWidth) / 2;
        const y = Math.min(zeroY, valueY);
        const color = chartColor(profile, index);
        return (
          <g key={`${item.label}-${index}`}>
            <rect x={x} y={y} width={barWidth} height={height} rx={profile.chartTreatment.barRadius} fill={color} />
            {showValues && (
              <text x={x + barWidth / 2} y={Math.max(28, y - 12)} textAnchor="middle" fill={profile.ink} fontSize="19" fontWeight="700">
                {formatChartValue(item)}
              </text>
            )}
            <text x={x + barWidth / 2} y="382" textAnchor="middle" fill={profile.chartTreatment.label} fontSize="20">
              {truncateLabel(item.label)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function LineChart({ data, profile, showValues }) {
  const min = Math.min(0, ...data.map(item => item.value));
  const max = Math.max(0, ...data.map(item => item.value));
  const range = Math.max(1, max - min);
  const denominator = Math.max(1, data.length - 1);
  const points = data.map((item, index) => ({
    ...item,
    x: 70 + index / denominator * 860,
    y: 50 + (max - item.value) / range * 286,
  }));
  return (
    <svg viewBox="0 0 1000 420" width="100%" height="100%" preserveAspectRatio="none" aria-hidden="true" data-editable-skip="true">
      {gridLines(profile)}
      <polyline
        points={points.map(point => `${point.x},${point.y}`).join(' ')}
        fill="none"
        stroke={profile.chartTreatment.series[0] || profile.accent}
        strokeWidth={profile.chartTreatment.strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {points.map((point, index) => (
        <g key={`${point.label}-${index}`}>
          <circle cx={point.x} cy={point.y} r="9" fill={chartColor(profile, index)} />
          {showValues && (
            <text x={point.x} y={Math.max(24, point.y - 18)} textAnchor="middle" fill={profile.ink} fontSize="18" fontWeight="700">
              {formatChartValue(point)}
            </text>
          )}
          <text x={point.x} y="382" textAnchor="middle" fill={profile.chartTreatment.label} fontSize="20">
            {truncateLabel(point.label)}
          </text>
        </g>
      ))}
    </svg>
  );
}

function DonutChart({ data, profile, showValues }) {
  const total = Math.max(1, data.reduce((sum, item) => sum + item.value, 0));
  const radius = 125;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  const segments = data.map((item, index) => {
    const length = item.value / total * circumference;
    const segment = { ...item, index, length, offset };
    offset += length;
    return segment;
  });
  return (
    <div style={{ width: '100%', height: '100%', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(180px,.72fr)', gap: 24, alignItems: 'center' }}>
      <svg viewBox="0 0 420 420" width="100%" height="100%" aria-hidden="true" data-editable-skip="true">
        <circle cx="210" cy="210" r={radius} fill="none" stroke={profile.chartTreatment.grid} strokeWidth="58" />
        {segments.map(segment => (
          <circle
            key={`${segment.label}-${segment.index}`}
            cx="210"
            cy="210"
            r={radius}
            fill="none"
            stroke={chartColor(profile, segment.index)}
            strokeWidth="58"
            strokeDasharray={`${segment.length} ${Math.max(0, circumference - segment.length)}`}
            strokeDashoffset={-segment.offset}
            transform="rotate(-90 210 210)"
          />
        ))}
      </svg>
      <div style={{ display: 'grid', gap: 12, minWidth: 0 }}>
        {segments.map(segment => (
          <div key={`${segment.label}-${segment.index}`} style={{ display: 'grid', gridTemplateColumns: '12px minmax(0,1fr) auto', gap: 10, alignItems: 'center' }}>
            <span aria-hidden="true" data-editable-skip="true" style={{ width: 10, height: 10, borderRadius: 99, background: chartColor(profile, segment.index) }} />
            <span style={{ color: profile.muted, fontSize: 18, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {segment.label}
            </span>
            {showValues && (
              <strong style={{ color: profile.ink, fontFamily: profile.fontMono, fontSize: 18 }}>
                {formatChartValue(segment)}
              </strong>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ProgressChart({ data, profile, showValues }) {
  const max = Math.max(100, ...data.map(item => item.value));
  return (
    <div style={{ width: '100%', height: '100%', display: 'grid', alignContent: 'center', gap: 18 }}>
      {data.map((item, index) => {
        const width = Math.min(100, item.value / max * 100);
        return (
          <div key={`${item.label}-${index}`} style={{ display: 'grid', gridTemplateColumns: showValues ? 'minmax(120px,.8fr) minmax(0,2fr) 70px' : 'minmax(120px,.8fr) minmax(0,2fr)', gap: 16, alignItems: 'center' }}>
            <span style={{ color: profile.muted, fontSize: 20, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item.label}
            </span>
            <span aria-hidden="true" data-editable-skip="true" style={{ height: 14, overflow: 'hidden', borderRadius: 999, background: profile.chartTreatment.grid }}>
              <span style={{ display: 'block', width: `${width}%`, height: '100%', borderRadius: 999, background: chartColor(profile, index) }} />
            </span>
            {showValues && (
              <strong style={{ color: profile.ink, fontFamily: profile.fontMono, fontSize: 18, textAlign: 'right' }}>
                {formatChartValue(item)}
              </strong>
            )}
          </div>
        );
      })}
    </div>
  );
}

function gridLines(profile) {
  return [0, 1, 2, 3].map(index => {
    const y = 66 + index * 91;
    return <line key={y} x1="50" x2="950" y1={y} y2={y} stroke={profile.chartTreatment.grid} strokeWidth="2" />;
  });
}

function rootStyle(profile) {
  return {
    '--bespoke-bg': profile.bg,
    '--bespoke-surface': profile.surface,
    '--bespoke-ink': profile.ink,
    '--bespoke-muted': profile.muted,
    '--bespoke-accent': profile.accent,
    '--bespoke-accent-2': profile.accent2,
    '--bespoke-line': profile.line,
    '--bespoke-pad': `${profile.pad}px`,
    '--bespoke-gap': `${profile.gap}px`,
    '--bespoke-radius': `${profile.radius}px`,
    position: 'absolute',
    top: 0,
    left: 0,
    width: 1920,
    height: 1080,
    overflow: 'hidden',
    transform: 'scale(var(--deck-scale,1))',
    transformOrigin: 'top left',
    isolation: 'isolate',
    background: 'transparent',
    color: profile.ink,
    fontFamily: profile.fontBody,
    WebkitFontSmoothing: 'antialiased',
  };
}

function themeLayerStyle(profile) {
  return {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',
    overflow: 'hidden',
    background: profile.bg,
    color: profile.ink,
    fontFamily: profile.fontBody,
    ...themeRootVars(profile.rootVars),
  };
}

function decorationLayerStyle() {
  return {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    overflow: 'hidden',
    zIndex: 0,
  };
}

function orbStyle(color, dimensions) {
  return {
    position: 'absolute',
    borderRadius: '50%',
    background: `radial-gradient(circle at 50% 50%,${color},transparent 70%)`,
    filter: 'blur(12px)',
    opacity: 0.28,
    ...dimensions,
  };
}

function gxnAuroraStyle({ cool = false, ...dimensions }) {
  return {
    position: 'absolute',
    borderRadius: '50%',
    background: cool
      ? 'radial-gradient(circle,rgba(78,162,255,.34),rgba(78,162,255,.08) 42%,transparent 72%)'
      : 'radial-gradient(circle,rgba(var(--gxn-glow),.4),rgba(var(--gxn-glow),.08) 44%,transparent 72%)',
    filter: 'blur(18px)',
    ...dimensions,
  };
}

function theme03TextStyle(roleName, recipe, profile) {
  if (roleName === 'kicker') {
    return {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '9px 12px 8px',
      background: profile.accent,
      color: profile.bg,
      fontWeight: 700,
      lineHeight: 1,
      letterSpacing: '.10em',
      textTransform: 'uppercase',
      whiteSpace: 'nowrap',
    };
  }
  if (roleName === 'label') {
    return {
      color: profile.muted,
      fontWeight: 500,
      lineHeight: 1.2,
      letterSpacing: '.06em',
      textTransform: 'uppercase',
    };
  }
  if (roleName === 'title') {
    if (recipe.titleClass === 'display') {
      return { fontWeight: 900, lineHeight: 1.07, letterSpacing: '-.02em' };
    }
    if (recipe.titleClass === 'headline') {
      return { fontWeight: 800, lineHeight: 1.05, letterSpacing: '-.01em' };
    }
    return { fontWeight: 800, lineHeight: 1.08, letterSpacing: '-.015em' };
  }
  if (roleName === 'subtitle') {
    return { fontWeight: 700, lineHeight: 1.2, letterSpacing: '-.005em' };
  }
  if (roleName === 'body') {
    return { fontWeight: 400, lineHeight: 1.5, letterSpacing: 0 };
  }
  if (roleName === 'caption') {
    return { color: profile.muted, fontWeight: 400, lineHeight: 1.45, letterSpacing: 0 };
  }
  return {};
}

function nativeTextClass(profile, roleName, recipe, tone) {
  if (profile.themeKey === 'theme02') {
    if (roleName === 'kicker') return 'gxn-kicker';
    if (roleName === 'label') return 'gxn-mono';
    if (roleName === 'title') return 'gxn-title';
    if (roleName === 'subtitle') return 'gxn-sub';
    return undefined;
  }
  if (profile.themeKey === 'theme03') {
    if (roleName === 'kicker') return `rd-tag${tone === 'positive' ? ' rd-tag--lime' : ''}`;
    if (roleName === 'label') return 'rd-mono';
    if (roleName === 'title') {
      if (recipe.titleClass === 'display') return 'rd-display';
      if (recipe.titleClass === 'headline') return 'rd-headline';
      return 'rd-title';
    }
    if (roleName === 'subtitle') return 'rd-sub';
    if (roleName === 'body') return 'rd-body';
    if (roleName === 'caption') return 'rd-cap';
  }
  return undefined;
}

function nativePanelClass(profile, element) {
  if (profile.themeKey !== 'theme02') return undefined;
  return `gxn-panel${element?.tone === 'accent' ? ' is-focus' : ''}`;
}

function themeRootVars(values) {
  return Object.fromEntries(Object.entries(values || {}).filter(([key]) => key.startsWith('--')));
}

function canvasStyle(profile) {
  return {
    position: 'absolute',
    top: profile.frame?.top || 0,
    right: 0,
    bottom: profile.frame?.bottom || 0,
    left: 0,
    zIndex: 1,
    display: 'grid',
    gridTemplateColumns: `repeat(${BESPOKE_GRID_COLUMNS},minmax(0,1fr))`,
    gridTemplateRows: `repeat(${BESPOKE_GRID_ROWS},minmax(0,1fr))`,
    gap: 'var(--bespoke-gap)',
    padding: 'var(--bespoke-pad)',
  };
}

function elementGridStyle(element) {
  const grid = element?.grid || {};
  const column = clampInteger(grid.column, 1, BESPOKE_GRID_COLUMNS, 1);
  const row = clampInteger(grid.row, 1, BESPOKE_GRID_ROWS, 1);
  const width = clampInteger(grid.width, 1, BESPOKE_GRID_COLUMNS - column + 1, 1);
  const height = clampInteger(grid.height, 1, BESPOKE_GRID_ROWS - row + 1, 1);
  return {
    gridColumn: `${column} / span ${width}`,
    gridRow: `${row} / span ${height}`,
    minWidth: 0,
    minHeight: 0,
    position: 'relative',
    zIndex: element.type === 'shape' ? 0 : 2,
  };
}

function cardStyle(profile, enabled, grid, accented = false) {
  if (!enabled) return { padding: 0, background: 'transparent', border: 0, borderRadius: 0, boxShadow: 'none' };
  const treatment = profile.cardTreatment;
  if (treatment.mode === 'rules') {
    return {
      padding: cardPadding(profile, grid),
      background: 'transparent',
      borderTop: `${Math.max(3, treatment.borderWidth)}px solid ${profile.ink}`,
      borderRight: 0,
      borderBottom: `${treatment.borderWidth}px solid ${profile.line}`,
      borderLeft: 0,
      borderRadius: 0,
      boxShadow: 'none',
      boxSizing: 'border-box',
    };
  }
  if (treatment.mode === 'neon-ticket') {
    return {
      padding: cardPadding(profile, grid),
      background: accented
        ? 'radial-gradient(130% 130% at 50% 44%,rgba(7,9,11,0) 46%,rgba(var(--gxn-glow),.07) 82%,rgba(var(--gxn-glow),.16) 100%),linear-gradient(165deg,var(--gxn-panel-a),var(--gxn-panel-b))'
        : 'radial-gradient(132% 132% at 50% 50%,rgba(255,255,255,0) 58%,rgba(var(--gxn-glow),.035) 90%,rgba(var(--gxn-glow),.085) 100%),linear-gradient(165deg,var(--gxn-panel-a),var(--gxn-panel-b))',
      border: accented ? '1px solid rgba(var(--gxn-glow),.62)' : '1px solid var(--gxn-line)',
      borderRadius: profile.radius,
      boxShadow: accented
        ? 'inset 0 0 30px -4px rgba(var(--gxn-glow),.46),inset 0 0 96px 8px rgba(var(--gxn-glow),.14),0 0 84px -8px rgba(var(--gxn-glow),.44),0 26px 70px -42px rgba(0,0,0,.9)'
        : profile.shadow,
      boxSizing: 'border-box',
    };
  }
  return {
    padding: cardPadding(profile, grid),
    background: profile.surface,
    border: `${treatment.borderWidth}px ${treatment.borderStyle} ${profile.cardLine || profile.line}`,
    borderRadius: profile.radius,
    boxShadow: profile.shadow,
    backdropFilter: treatment.backdropFilter,
    WebkitBackdropFilter: treatment.backdropFilter,
    boxSizing: 'border-box',
  };
}

function cardPalette(profile) {
  return {
    ...profile,
    ink: profile.cardInk || profile.ink,
    muted: profile.cardMuted || profile.muted,
    line: profile.cardLine || profile.line,
    chartTreatment: {
      ...profile.chartTreatment,
      grid: profile.cardLine || profile.chartTreatment.grid,
      label: profile.cardMuted || profile.chartTreatment.label,
    },
  };
}

function fitTextToGrid(text, roleName, grid, profile, familyRecipe) {
  const recipe = {
    ...TEXT_ROLE_RECIPES[roleName],
    ...(profile.textTreatment?.[roleName] || {}),
  };
  const bounds = gridPixelBounds(grid, profile);
  const configuredScale = roleName === 'title' && Number.isFinite(Number(familyRecipe?.titleScale))
    ? Number(familyRecipe.titleScale)
    : null;
  const baseSize = configuredScale || profile.typeScale[roleName] || profile.typeScale.body;
  return fitFont(text, {
    width: bounds.width,
    height: bounds.height * 0.9,
    baseSize,
    minSize: Math.min(baseSize, recipe.minSize),
    lineHeight: recipe.lineHeight,
  });
}

function fitMetricToGrid(element, profile, recipe, framed) {
  const bounds = gridPixelBounds(element.grid, profile);
  const padding = framed ? cardPadding(profile, element.grid) : 0;
  const width = Math.max(40, bounds.width - padding * 2);
  const height = Math.max(40, bounds.height - padding * 2 - (framed ? 0 : 42));
  const compact = Number(element?.grid?.height) <= 2;
  const labelSize = Math.min(profile.typeScale.label, compact ? 17 : profile.typeScale.label);
  const detailSize = Math.min(profile.typeScale.caption, compact ? 17 : profile.typeScale.caption);
  const trendSize = Math.min(profile.typeScale.label, compact ? 14 : 17);
  const gap = compact ? 7 : framed ? 12 : 16;
  const reserve = labelSize * 1.2
    + (element.detail != null ? detailSize * 1.35 : 0)
    + (element.trend != null ? trendSize * 1.2 + (framed ? (trendSize <= 14 ? 8 : 14) : 0) : 0)
    + gap * (1 + Number(element.detail != null) + Number(element.trend != null));
  const valueHeight = Math.max(24, height - reserve);
  const baseSize = profile.themeKey === 'theme03' && recipe?.metricMode === 'band'
    ? 168
    : profile.typeScale.metric;
  const valueFit = fitFont(formatMetricValue(element.value, element.unit), {
    width,
    height: valueHeight,
    baseSize,
    minSize: 24,
    lineHeight: 0.92,
    maxLines: compact ? 2 : 3,
  });
  return {
    fits: valueFit.fits,
    valueSize: valueFit.fontSize,
    labelSize,
    detailSize,
    trendSize,
    gap,
  };
}

function fitFont(text, options) {
  const width = Math.max(1, options.width);
  const height = Math.max(1, options.height);
  const maxLines = Math.max(1, options.maxLines || 8);
  const units = Math.max(0.25, textWidthUnits(text));
  const baseSize = Math.max(options.minSize, options.baseSize);
  for (let fontSize = baseSize; fontSize >= options.minSize; fontSize -= 1) {
    const lines = Math.max(1, Math.ceil((units * fontSize) / width));
    const availableLines = Math.max(1, Math.min(maxLines, Math.floor(height / (fontSize * options.lineHeight))));
    if (lines <= availableLines) return { fontSize, fits: true, lines };
  }
  const lines = Math.max(1, Math.ceil((units * options.minSize) / width));
  return { fontSize: options.minSize, fits: lines * options.minSize * options.lineHeight <= height, lines };
}

function textWidthUnits(value) {
  let units = 0;
  for (const char of plainText(value)) {
    if (/\s/u.test(char)) units += 0.34;
    else if (/[\u2e80-\u9fff\uac00-\ud7af\uff01-\uff60]/u.test(char)) units += 1;
    else if (/[A-Z0-9]/u.test(char)) units += 0.64;
    else if (/[a-z]/u.test(char)) units += 0.54;
    else if (/[,.;:!?'"()[\]{}%+\-/]/u.test(char)) units += 0.42;
    else units += 0.9;
  }
  return units;
}

function gridPixelBounds(grid, profile) {
  const column = clampInteger(grid?.column, 1, BESPOKE_GRID_COLUMNS, 1);
  const row = clampInteger(grid?.row, 1, BESPOKE_GRID_ROWS, 1);
  const width = clampInteger(grid?.width, 1, BESPOKE_GRID_COLUMNS - column + 1, 1);
  const height = clampInteger(grid?.height, 1, BESPOKE_GRID_ROWS - row + 1, 1);
  const usableWidth = Math.max(1, 1920 - profile.pad * 2 - profile.gap * (BESPOKE_GRID_COLUMNS - 1));
  const usableHeight = Math.max(
    1,
    1080
      - (profile.frame?.top || 0)
      - (profile.frame?.bottom || 0)
      - profile.pad * 2
      - profile.gap * (BESPOKE_GRID_ROWS - 1),
  );
  const columnWidth = usableWidth / BESPOKE_GRID_COLUMNS;
  const rowHeight = usableHeight / BESPOKE_GRID_ROWS;
  return {
    width: columnWidth * width + profile.gap * (width - 1),
    height: rowHeight * height + profile.gap * (height - 1),
  };
}

function cardPadding(profile, grid) {
  const base = profile.cardTreatment.padding;
  const width = Number(grid?.width) || BESPOKE_GRID_COLUMNS;
  const height = Number(grid?.height) || BESPOKE_GRID_ROWS;
  if (height <= 1 || width <= 2) return Math.min(base, 14);
  if (height <= 2 || width <= 3) return Math.min(base, 20);
  return base;
}

function toneColor(profile, tone) {
  if (tone === 'accent') return profile.accent;
  if (tone === 'positive') return profile.accent2;
  if (tone === 'warning') return profile.chartTreatment.series[2] || profile.accent2;
  if (tone === 'critical') return profile.chartTreatment.series[3] || profile.accent;
  if (tone === 'inverse') return '#ffffff';
  if (tone === 'muted') return profile.muted;
  return profile.ink;
}

function chartColor(profile, index) {
  const series = profile.chartTreatment.series;
  return series[index % series.length] || profile.accent;
}

function normalizeChartData(source, chartType) {
  if (!Array.isArray(source)) return [];
  return source.map((item, index) => {
    const value = item?.value;
    const permitsNegative = chartTypeAllowsNegativeValues(chartType);
    if (!isValidBespokeChartValue(chartType, value)) {
      throw new Error(
        `${chartType} chart value at index ${index} must be a `
        + `${permitsNegative ? '' : 'non-negative '}finite number`,
      );
    }
    return {
      label: plainText(item?.label ?? item?.name ?? index + 1),
      value,
      displayValue: plainText(item?.displayValue),
      unit: plainText(item?.unit),
    };
  });
}

function normalizeListItem(item) {
  if (typeof item === 'string' || typeof item === 'number') {
    return { title: plainText(item), body: '' };
  }
  return {
    id: plainText(item?.id),
    title: plainText(item?.title),
    body: plainText(item?.body),
  };
}

function familyRecipe(profile, family) {
  return profile.familyRecipes?.[family]
    || profile.familyRecipes?.editorial
    || {
      frame: 'neutral',
      surface: 'cards',
      titleClass: 'title',
      titleScale: null,
      listMode: 'stack',
      quoteMode: 'card',
      metricMode: 'card',
      chartMode: 'card',
    };
}

function elementPalette(profile, framed) {
  return framed ? cardPalette(profile) : profile;
}

function formatMetricValue(value, unit) {
  const raw = plainText(value).trim();
  const suffix = plainText(unit).trim();
  if (!suffix) return raw;
  const compactRaw = raw.replace(/\s+/g, '').toLowerCase();
  const compactSuffix = suffix.replace(/\s+/g, '').toLowerCase();
  if (compactSuffix && compactRaw.endsWith(compactSuffix)) return raw;
  return formatValueWithUnit(value, unit);
}

function elementSequenceNumber(element, index) {
  const matched = String(element?.id || '').match(/(?:^|[-_])(\d+)$/);
  const value = matched ? Number(matched[1]) : index + 1;
  return String(value).padStart(2, '0');
}

function safeMediaSource(value) {
  const source = plainText(value).trim();
  if (!source || /^(?:javascript|vbscript):/i.test(source)) return '';
  if (/^data:/i.test(source) && !/^data:(?:image|video)\//i.test(source)) return '';
  return source;
}

function editablePath(element, index, slot) {
  const id = String(element?.id || `element-${index + 1}`).replace(/[^a-zA-Z0-9_-]/g, '-');
  return `composition.${id}.${slot}`;
}

function truncateLabel(value) {
  const text = plainText(value);
  return text.length > 10 ? `${text.slice(0, 9)}…` : text;
}

function formatChartValue(item) {
  const value = Number.isInteger(item?.value)
    ? item.value
    : Number(item?.value).toFixed(1);
  return formatValueWithUnit(value, item?.unit, item?.displayValue);
}

function plainText(value) {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  return '';
}

function clampInteger(value, min, max, fallback) {
  const number = Math.round(Number(value));
  if (!Number.isFinite(number)) return fallback;
  return Math.max(min, Math.min(max, number));
}

export default BespokeSlide;
