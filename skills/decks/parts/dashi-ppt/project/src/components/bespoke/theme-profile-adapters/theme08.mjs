import {
  ACL_TOKENS,
  AclTheme,
  Doodle,
} from '../../themes/theme08/source/components/AclPrimitives.jsx';
import { adapter, onColor, readCssTokens } from '../theme-profile-core.mjs';

const theme08 = readCssTokens(ACL_TOKENS);

export default adapter({
  sourceTokens: ACL_TOKENS,
  sourcePath: 'theme08/source/components/AclPrimitives.jsx',
  Runtime: AclTheme,
  sourcePrimitives: { Doodle },
  rootClass: 'acl-root',
  base: {
    bg: theme08['--acl-yellow'],
    surface: theme08['--acl-paper'],
    ink: theme08['--acl-ink'],
    muted: 'rgba(22,21,15,.62)',
    accent: theme08['--acl-pink'],
    accent2: theme08['--acl-blue'],
    line: theme08['--acl-ink'],
    fontDisplay: theme08['--acl-font-num'],
    fontBody: theme08['--acl-font-cn'],
    fontMono: theme08['--acl-font-mono'],
    typeScale: { kicker: 20, title: 72, subtitle: 40, body: 27, label: 19, caption: 21, metric: 120 },
    pad: 100,
    gap: 24,
    radius: 0,
    shadow: '6px 8px 0 rgba(22,21,15,.18)',
    cardTreatment: { padding: 28, borderWidth: 3, borderStyle: 'solid', backdropFilter: 'none' },
    mediaTreatment: {
      radius: 0,
      filter: 'none',
      overlay: 'none',
      border: `8px solid ${theme08['--acl-paper']}`,
    },
    chartTreatment: {
      grid: 'rgba(22,21,15,.18)',
      label: 'rgba(22,21,15,.62)',
      series: [theme08['--acl-ink'], theme08['--acl-pink'], theme08['--acl-blue'], theme08['--acl-red'], theme08['--acl-lilac']],
      barRadius: 0,
      strokeWidth: 4,
    },
    shapeTreatment: { lineWidth: 5, panelRadius: 0, panelBorderWidth: 3 },
    decoration: 'theme08-doodle',
  },
  backgrounds: {
    default: {},
    surface: { bg: theme08['--acl-paper'] },
    muted: { bg: theme08['--acl-lilac'] },
    accent: onColor(theme08['--acl-pink'], theme08['--acl-paper'], theme08['--acl-yellow']),
    dark: {
      bg: theme08['--acl-ink'],
      surface: 'rgba(251,250,244,.08)',
      ink: theme08['--acl-paper'],
      muted: theme08['--acl-lilac'],
      line: theme08['--acl-yellow'],
      accent: theme08['--acl-yellow'],
    },
    light: { bg: theme08['--acl-paper'] },
  },
});
