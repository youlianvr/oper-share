import {
  Corners as Theme11Corners,
  Edge as Theme11Edge,
  Grain as Theme11Grain,
  Slide as Theme11Slide,
  makeTheme as makeTheme11,
} from '../../themes/theme11/source/ignBase.jsx';
import { adapter } from '../theme-profile-core.mjs';

const theme11Ink = makeTheme11('ink');
const theme11Paper = makeTheme11('paper');
const theme11Ember = makeTheme11('ember');

function theme11Background(tokens) {
  return {
    rootVars: tokens,
    bg: tokens['--ign-bg'],
    surface: tokens['--ign-panel'],
    ink: tokens['--ign-ink'],
    muted: tokens['--ign-ink2'],
    line: tokens['--ign-hair'],
    chartTreatment: {
      grid: tokens['--ign-hair'],
      label: tokens['--ign-ink2'],
    },
  };
}

export default adapter({
  sourceTokens: theme11Ink,
  sourcePath: 'theme11/source/ignBase.jsx',
  rootVars: theme11Ink,
  sourcePrimitives: { Slide: Theme11Slide, Grain: Theme11Grain, Edge: Theme11Edge, Corners: Theme11Corners },
  rootClass: 'ign-slide',
  base: {
    bg: theme11Ink['--ign-bg'],
    surface: theme11Ink['--ign-panel'],
    ink: theme11Ink['--ign-ink'],
    muted: theme11Ink['--ign-ink2'],
    accent: theme11Ink['--ign-b'],
    accent2: theme11Ink['--ign-a'],
    line: theme11Ink['--ign-hair'],
    fontDisplay: "'Space Grotesk','Noto Sans SC',sans-serif",
    fontBody: "'Noto Sans SC',sans-serif",
    fontMono: "'Space Grotesk','Noto Sans SC',sans-serif",
    typeScale: { kicker: 24, title: 68, subtitle: 40, body: 27, label: 24, caption: 24, metric: 116 },
    pad: 128,
    gap: 26,
    radius: 4,
    shadow: 'none',
    cardTreatment: { padding: 30, borderWidth: 1, borderStyle: 'solid', backdropFilter: 'none' },
    mediaTreatment: {
      radius: 4,
      filter: 'none',
      overlay: 'none',
      border: `1px solid ${theme11Ink['--ign-hair']}`,
    },
    chartTreatment: {
      grid: theme11Ink['--ign-hair'],
      label: theme11Ink['--ign-ink2'],
      series: [theme11Ink['--ign-a'], theme11Ink['--ign-b'], theme11Ink['--ign-c']],
      barRadius: 2,
      strokeWidth: 5,
    },
    shapeTreatment: { lineWidth: 2, panelRadius: 4, panelBorderWidth: 1 },
    decoration: 'theme11-ignis',
  },
  backgrounds: {
    default: {},
    surface: theme11Background(theme11Paper),
    muted: { bg: theme11Ink['--ign-panel'] },
    accent: theme11Background(theme11Ember),
    dark: {},
    light: theme11Background(theme11Paper),
  },
});
