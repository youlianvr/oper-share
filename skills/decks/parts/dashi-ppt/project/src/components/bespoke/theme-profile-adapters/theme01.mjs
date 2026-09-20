import {
  THEME as THEME01,
  THEME_CSS as THEME01_CSS,
} from '../../themes/theme01/source/slides/theme.js';
import {
  SANS_CJK,
  adapter,
  onColor,
  readCssPxToken,
  readRuleDeclaration,
} from '../theme-profile-core.mjs';

const theme01BackgroundA = readRuleDeclaration(THEME01_CSS, '.aip-bg-a', 'background');
const theme01BackgroundB = readRuleDeclaration(THEME01_CSS, '.aip-bg-b', 'background');
const theme01GlassBackground = readRuleDeclaration(THEME01_CSS, '.aip-glass', 'background');
const theme01GlassShadow = readRuleDeclaration(THEME01_CSS, '.aip-glass', 'box-shadow');
const theme01Pad = readCssPxToken(THEME01_CSS, '--aip-pad-x');
const theme01Gap = readCssPxToken(THEME01_CSS, '--aip-gap');

export default adapter({
  sourceTokens: THEME01,
  sourcePath: 'theme01/source/slides/theme.js',
  cssText: THEME01_CSS,
  rootClass: 'aip-root',
  base: {
    bg: theme01BackgroundA,
    surface: theme01GlassBackground,
    ink: THEME01.ink,
    muted: THEME01.ink2,
    accent: THEME01.red,
    accent2: THEME01.blue,
    line: 'rgba(43,43,48,.14)',
    fontDisplay: SANS_CJK,
    fontBody: SANS_CJK,
    fontMono: "'Space Mono',monospace",
    typeScale: { kicker: 24, title: 78, subtitle: 42, body: 30, label: 24, caption: 24, metric: 128 },
    pad: theme01Pad,
    gap: theme01Gap,
    radius: 24,
    shadow: theme01GlassShadow,
    cardTreatment: {
      padding: 30,
      borderWidth: 1,
      borderStyle: 'solid',
      backdropFilter: 'blur(28px) saturate(140%)',
    },
    mediaTreatment: {
      radius: 20,
      filter: 'none',
      overlay: 'linear-gradient(180deg,transparent 62%,rgba(43,43,48,.18))',
      border: '1px solid rgba(255,255,255,.7)',
    },
    chartTreatment: {
      grid: 'rgba(43,43,48,.14)',
      label: THEME01.ink2,
      series: THEME01.series,
      barRadius: 9,
      strokeWidth: 6,
    },
    shapeTreatment: { lineWidth: 3, panelRadius: 24, panelBorderWidth: 1 },
    decoration: 'theme01-bokeh',
  },
  backgrounds: {
    default: {},
    surface: { bg: theme01GlassBackground },
    muted: { bg: theme01BackgroundB },
    accent: onColor(THEME01.red, '#ffffff', THEME01.blue),
    dark: onColor(THEME01.ink, '#ffffff', THEME01.red),
    light: { bg: theme01BackgroundA },
  },
});
