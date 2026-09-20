import {
  swSeriesColors,
  swTheme,
} from '../../themes/theme12/source/src/swTheme.js';
import { Shape as Theme12Shape } from '../../themes/theme12/source/src/swBase.jsx';
import { adapter, onColor } from '../theme-profile-core.mjs';

const theme12Colors = swTheme.color;

export default adapter({
  sourceTokens: swTheme,
  sourcePath: 'theme12/source/src/swTheme.js',
  sourcePrimitives: { Shape: Theme12Shape },
  rootClass: 'sw-root',
  base: {
    bg: theme12Colors.blush,
    surface: theme12Colors.paper,
    ink: theme12Colors.ink,
    muted: theme12Colors.inkMut,
    accent: theme12Colors.orange,
    accent2: theme12Colors.cyan,
    line: theme12Colors.line,
    fontDisplay: swTheme.font.sans,
    fontBody: swTheme.font.sans,
    fontMono: swTheme.font.mono,
    typeScale: {
      kicker: swTheme.type.label,
      title: swTheme.type.h1,
      subtitle: swTheme.type.h3,
      body: swTheme.type.body,
      label: swTheme.type.label,
      caption: swTheme.type.label,
      metric: swTheme.type.hero,
    },
    pad: swTheme.pad.x,
    gap: 24,
    radius: swTheme.radius,
    shadow: 'none',
    cardTreatment: { padding: 30, borderWidth: 1, borderStyle: 'solid', backdropFilter: 'none' },
    mediaTreatment: {
      radius: 18,
      filter: 'none',
      overlay: 'none',
      border: `1px solid ${theme12Colors.line}`,
    },
    chartTreatment: {
      grid: theme12Colors.line,
      label: theme12Colors.inkMut,
      series: swSeriesColors,
      barRadius: 9,
      strokeWidth: 6,
    },
    shapeTreatment: { lineWidth: 4, panelRadius: swTheme.radius, panelBorderWidth: 1 },
    decoration: 'theme12-shapes',
  },
  backgrounds: {
    default: {},
    surface: { bg: theme12Colors.paper },
    muted: { bg: theme12Colors.blush, surface: theme12Colors.paper },
    accent: onColor(theme12Colors.orange, '#ffffff', theme12Colors.hlO),
    dark: {
      bg: theme12Colors.dark,
      surface: '#241e20',
      ink: theme12Colors.blush,
      muted: theme12Colors.plum,
      line: theme12Colors.lineD,
      accent: theme12Colors.orange,
      accent2: theme12Colors.cyan,
    },
    light: { bg: theme12Colors.blush },
  },
});
