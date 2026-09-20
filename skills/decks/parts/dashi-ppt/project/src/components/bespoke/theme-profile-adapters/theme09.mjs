import {
  DECK_THEME as THEME09,
  useDeckStyles as useTheme09Styles,
} from '../../themes/theme09/source/slides/DeckKit.jsx';
import { adapter, onColor } from '../theme-profile-core.mjs';

function Theme09Style() {
  if (typeof document === 'undefined') return null;
  return Theme09StyleClient();
}

function Theme09StyleClient() {
  useTheme09Styles();
  return null;
}

export default adapter({
  sourceTokens: THEME09,
  sourcePath: 'theme09/source/slides/DeckKit.jsx',
  Runtime: Theme09Style,
  rootClass: 'dk-scope bg-deep',
  base: {
    bg: THEME09.navy900,
    surface: 'linear-gradient(150deg,rgba(255,255,255,.14),rgba(255,255,255,.05))',
    ink: THEME09.ink,
    muted: THEME09.inkDim,
    accent: THEME09.accent,
    accent2: THEME09.blue,
    line: THEME09.glassLine,
    fontDisplay: THEME09.fontDisplay,
    fontBody: THEME09.fontCN,
    fontMono: THEME09.fontMono,
    typeScale: {
      kicker: THEME09.type.small,
      title: THEME09.type.title,
      subtitle: THEME09.type.sub,
      body: THEME09.type.body,
      label: THEME09.type.tiny,
      caption: THEME09.type.small,
      metric: 132,
    },
    pad: THEME09.pad.x,
    gap: 28,
    radius: THEME09.radius,
    shadow: '0 24px 60px rgba(3,8,30,.4),inset 0 1px 0 rgba(255,255,255,.25)',
    cardTreatment: {
      padding: 30,
      borderWidth: 1,
      borderStyle: 'solid',
      backdropFilter: 'blur(14px)',
    },
    mediaTreatment: {
      radius: 20,
      filter: 'none',
      overlay: 'linear-gradient(180deg,transparent 58%,rgba(3,8,30,.42))',
      border: `1px solid ${THEME09.glassLine}`,
    },
    chartTreatment: {
      grid: 'rgba(255,255,255,.10)',
      label: THEME09.inkDim,
      series: [THEME09.blue, THEME09.accent, THEME09.violet, THEME09.warn],
      barRadius: 16,
      strokeWidth: 5,
    },
    shapeTreatment: { lineWidth: 3, panelRadius: THEME09.radius, panelBorderWidth: 1 },
    decoration: 'theme09-orbs',
  },
  backgrounds: {
    default: {},
    surface: { rootClass: 'dk-scope bg-blue', bg: THEME09.navyCard },
    muted: { rootClass: 'dk-scope bg-night', bg: THEME09.navy900 },
    accent: { rootClass: 'dk-scope bg-electric', ...onColor(THEME09.blueElectric, '#ffffff', THEME09.accent) },
    dark: { rootClass: 'dk-scope bg-night', bg: THEME09.navy900 },
    light: { rootClass: 'dk-scope bg-blue', bg: THEME09.blueDeep },
  },
});
