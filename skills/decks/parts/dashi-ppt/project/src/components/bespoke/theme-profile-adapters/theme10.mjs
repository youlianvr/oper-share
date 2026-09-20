import {
  DECK_THEMES as THEME10_BACKGROUNDS,
} from '../../themes/theme10/source/components/DeckPrimitives.jsx';
import { adapter } from '../theme-profile-core.mjs';

function theme10Background(key) {
  const theme = THEME10_BACKGROUNDS[key];
  return {
    bg: theme.bg,
    ink: theme.fg,
    muted: theme.sub,
    line: theme.fg.startsWith('#1') ? 'rgba(21,22,26,.16)' : 'rgba(242,243,246,.13)',
    surface: theme.fg.startsWith('#1') ? 'rgba(21,22,26,.045)' : 'rgba(255,255,255,.045)',
  };
}

export default adapter({
  sourceTokens: THEME10_BACKGROUNDS,
  sourcePath: 'theme10/source/components/DeckPrimitives.jsx',
  rootClass: 'deck-theme',
  base: {
    bg: THEME10_BACKGROUNDS.dusk.bg,
    surface: 'rgba(255,255,255,.045)',
    ink: THEME10_BACKGROUNDS.dusk.fg,
    muted: THEME10_BACKGROUNDS.dusk.sub,
    accent: '#5479e8',
    accent2: '#8fa8e6',
    line: 'rgba(242,243,246,.13)',
    fontDisplay: "'IBM Plex Sans','Noto Sans SC',sans-serif",
    fontBody: "'IBM Plex Sans','Noto Sans SC',sans-serif",
    fontMono: "'IBM Plex Mono',monospace",
    typeScale: { kicker: 26, title: 68, subtitle: 40, body: 30, label: 24, caption: 24, metric: 116 },
    pad: 120,
    gap: 28,
    radius: 18,
    shadow: 'inset 0 0 0 1px rgba(242,243,246,.13)',
    cardTreatment: { padding: 30, borderWidth: 1, borderStyle: 'solid', backdropFilter: 'none' },
    mediaTreatment: {
      radius: 18,
      filter: 'none',
      overlay: 'none',
      border: '1px solid rgba(242,243,246,.13)',
    },
    chartTreatment: {
      grid: 'rgba(242,243,246,.13)',
      label: THEME10_BACKGROUNDS.dusk.sub,
      series: ['#5479e8', '#8fa8e6', '#c8a77b', '#8e9a91', '#7a6c91', '#b46f5c'],
      barRadius: 8,
      strokeWidth: 5,
    },
    shapeTreatment: { lineWidth: 2, panelRadius: 18, panelBorderWidth: 1 },
    decoration: 'theme10-grain',
  },
  backgrounds: {
    default: {},
    surface: theme10Background('paper'),
    muted: theme10Background('graphite'),
    accent: theme10Background('dawn'),
    dark: theme10Background('midnight'),
    light: theme10Background('paper'),
  },
});
