import { THEME05_TOKENS } from '../../themes/theme05/source/theme-adapter.mjs';
import { adapter, cssVar, onColor } from '../theme-profile-core.mjs';

const theme05Series = THEME05_TOKENS.palette;

export default adapter({
  sourceTokens: THEME05_TOKENS,
  sourcePath: 'theme05/source/theme-adapter.mjs',
  rootClass: 'pulse-slide',
  base: {
    bg: cssVar('--pulse-paper', THEME05_TOKENS.paper),
    surface: cssVar('--pulse-paper-2', THEME05_TOKENS.paper2),
    ink: cssVar('--pulse-ink', THEME05_TOKENS.ink),
    muted: cssVar('--pulse-mute', THEME05_TOKENS.muted),
    accent: cssVar('--pulse-red', theme05Series[0]),
    accent2: cssVar('--pulse-blue', theme05Series[5]),
    line: cssVar('--pulse-hair', THEME05_TOKENS.hair),
    fontDisplay: THEME05_TOKENS.font.sans,
    fontBody: THEME05_TOKENS.font.sans,
    fontMono: THEME05_TOKENS.font.mono,
    typeScale: { kicker: 19, title: 78, subtitle: 36, body: 27, label: 19, caption: 22, metric: 124 },
    pad: THEME05_TOKENS.spacing.padX,
    gap: 28,
    radius: 0,
    shadow: 'none',
    frame: { kind: 'theme05-pulse', top: 88, bottom: 60 },
    textTreatment: {
      kicker: { fontWeight: 700, letterSpacing: '.18em' },
      title: { fontWeight: 800, letterSpacing: '-.01em', lineHeight: 0.98 },
      subtitle: { fontWeight: 600, letterSpacing: 0, lineHeight: 1.3 },
      body: { fontWeight: 500, letterSpacing: 0, lineHeight: 1.45 },
    },
    metricWeight: 800,
    listMarker: 'index',
    cardTreatment: { mode: 'rules', padding: 28, borderWidth: 1, borderStyle: 'solid', backdropFilter: 'none' },
    mediaTreatment: {
      radius: 0,
      filter: 'none',
      overlay: 'none',
      border: `1px solid ${cssVar('--pulse-hair', THEME05_TOKENS.hair)}`,
    },
    chartTreatment: {
      grid: cssVar('--pulse-hair', THEME05_TOKENS.hair),
      label: cssVar('--pulse-mute', THEME05_TOKENS.muted),
      series: theme05Series,
      barRadius: 0,
      strokeWidth: 3,
    },
    shapeTreatment: { lineWidth: 3, panelRadius: 0, panelBorderWidth: 1 },
    decoration: 'theme05-spectrum',
  },
  backgrounds: {
    default: {},
    surface: { bg: cssVar('--pulse-paper-2', THEME05_TOKENS.paper2) },
    muted: { bg: cssVar('--pulse-paper-2', THEME05_TOKENS.paper2) },
    accent: onColor(cssVar('--pulse-red', theme05Series[0]), '#ffffff', cssVar('--pulse-yellow', theme05Series[2])),
    dark: {
      bg: cssVar('--pulse-dark', THEME05_TOKENS.dark),
      surface: cssVar('--pulse-dark-2', THEME05_TOKENS.dark2),
      ink: cssVar('--pulse-on-dark', THEME05_TOKENS.onDark),
      muted: cssVar('--pulse-on-dark-mute', THEME05_TOKENS.onDarkMuted),
      line: 'rgba(255,255,255,.14)',
    },
    light: { bg: cssVar('--pulse-paper', THEME05_TOKENS.paper) },
  },
});
