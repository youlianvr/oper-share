import { THEME04_TOKENS } from '../../themes/theme04/source/theme-adapter.mjs';
import { adapter, onColor } from '../theme-profile-core.mjs';

const theme04Series = THEME04_TOKENS.palette;

export default adapter({
  sourceTokens: THEME04_TOKENS,
  sourcePath: 'theme04/source/theme-adapter.mjs',
  rootClass: THEME04_TOKENS.rootClass,
  base: {
    bg: THEME04_TOKENS.background.default,
    surface: 'linear-gradient(180deg,#1c1c1c,#111111)',
    ink: THEME04_TOKENS.ink,
    muted: THEME04_TOKENS.muted,
    accent: theme04Series[0],
    accent2: theme04Series[1],
    line: THEME04_TOKENS.line,
    fontDisplay: THEME04_TOKENS.font.sans,
    fontBody: THEME04_TOKENS.font.sans,
    fontMono: THEME04_TOKENS.font.mono,
    typeScale: { kicker: 24, title: 54, subtitle: 34, body: 22, label: 20, caption: 20, metric: 104 },
    pad: THEME04_TOKENS.spacing.pad,
    gap: THEME04_TOKENS.spacing.gap,
    radius: THEME04_TOKENS.radius,
    shadow: THEME04_TOKENS.shadow,
    cardTreatment: { padding: 34, borderWidth: 1, borderStyle: 'solid', backdropFilter: 'none' },
    mediaTreatment: {
      radius: 18,
      filter: 'none',
      overlay: 'linear-gradient(180deg,transparent 56%,rgba(0,0,0,.48))',
      border: '1.5px solid rgba(255,255,255,.08)',
    },
    chartTreatment: {
      grid: 'rgba(255,255,255,.08)',
      label: '#bdbdbd',
      series: [...theme04Series, '#FF9FE2', '#15A7F0'],
      barRadius: 999,
      strokeWidth: 4,
    },
    shapeTreatment: { lineWidth: 4, panelRadius: 22, panelBorderWidth: 1 },
    decoration: 'theme04-sparks',
  },
  backgrounds: {
    default: {},
    surface: { bg: THEME04_TOKENS.background.surface },
    muted: { bg: THEME04_TOKENS.background.muted },
    accent: onColor(theme04Series[0], THEME04_TOKENS.lightInk, theme04Series[1]),
    dark: { bg: THEME04_TOKENS.background.default },
    light: onColor(theme04Series[1], THEME04_TOKENS.lightInk, theme04Series[0]),
  },
});
