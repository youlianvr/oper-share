import {
  THEME as THEME07,
  themeVars as theme07Vars,
} from '../../themes/theme07/source/src/theme.js';
import { adapter, onColor } from '../theme-profile-core.mjs';

export default adapter({
  sourceTokens: THEME07,
  sourcePath: 'theme07/source/src/theme.js',
  rootVars: theme07Vars(),
  rootClass: 'aic-bespoke',
  base: {
    bg: THEME07.paper,
    surface: THEME07.card,
    ink: THEME07.ink,
    muted: THEME07.muted,
    accent: THEME07.accent,
    accent2: THEME07.accentBright,
    line: THEME07.hair,
    fontDisplay: THEME07.fontDisplay,
    fontBody: THEME07.fontText,
    fontMono: THEME07.fontDisplay,
    typeScale: { kicker: 22, title: 72, subtitle: 40, body: 28, label: 20, caption: 22, metric: 112 },
    pad: 96,
    gap: 24,
    radius: 20,
    shadow: '0 18px 52px rgba(14,17,11,.08)',
    cardTreatment: { padding: 30, borderWidth: 1.5, borderStyle: 'solid', backdropFilter: 'none' },
    mediaTreatment: {
      radius: 26,
      filter: 'none',
      overlay: 'linear-gradient(180deg,transparent 66%,rgba(14,17,11,.24))',
      border: `1.5px solid ${THEME07.hair}`,
    },
    chartTreatment: {
      grid: THEME07.hair,
      label: THEME07.muted,
      series: [THEME07.accent, THEME07.ink, '#9AA08F', THEME07.warn, THEME07.faint],
      barRadius: 10,
      strokeWidth: 5,
    },
    shapeTreatment: { lineWidth: 3, panelRadius: 20, panelBorderWidth: 1.5 },
    decoration: 'theme07-lens',
  },
  backgrounds: {
    default: {},
    surface: { bg: THEME07.card },
    muted: { bg: THEME07.accentSoft },
    accent: onColor(THEME07.accent, THEME07.ink, THEME07.accentBright),
    dark: {
      bg: THEME07.ink,
      surface: THEME07.inkDim,
      ink: THEME07.paper,
      muted: THEME07.faint,
      line: 'rgba(250,250,246,.16)',
    },
    light: { bg: THEME07.paper },
  },
});
