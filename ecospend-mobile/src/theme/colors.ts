/**
 * EcoSpend color system.
 *
 * The design language is a premium eco-fintech identity anchored on a refined
 * emerald-forest green. Colors are organized into tonal palettes (25 → 900)
 * so elevation, states, and accents stay internally consistent.
 *
 * `palette` holds the raw scales. `lightColors` and `darkColors` expose the
 * same set of semantic, intent-based tokens for each scheme — components get
 * the active map via `useTheme()` / `useThemedStyles()` and must never
 * hard-code hex values; always reference a token here.
 */

export const palette = {
  // Brand — emerald / forest green
  green: {
    25: '#F4FDF7',
    50: '#E7F8EE',
    100: '#C7EED7',
    200: '#97DFB6',
    300: '#5FC98D',
    400: '#33B06C',
    500: '#159A54',
    600: '#0B7E43', // primary action
    700: '#0A6638',
    800: '#0A5230',
    900: '#073B23',
  },

  // Neutral — cool slate
  neutral: {
    0: '#FFFFFF',
    25: '#FCFCFD',
    50: '#F8F9FB',
    100: '#F1F3F6',
    200: '#E6E9EE',
    300: '#D2D7DF',
    400: '#9BA3B0',
    500: '#69707E',
    600: '#4B515E',
    700: '#343A45',
    800: '#1E232C',
    900: '#11151B',
  },

  // Accent — teal, used for secondary highlights & data viz
  teal: {
    50: '#E6F8FA',
    100: '#C2EDF2',
    300: '#6FD3DE',
    500: '#119CAD',
    600: '#0C7E8C',
    700: '#0A636E',
  },

  // Accent — gold, used for rewards, streaks & gamification
  gold: {
    50: '#FEF7E6',
    100: '#FBE9BE',
    300: '#F4CC63',
    500: '#E2A914',
    600: '#BE8A09',
    700: '#946B07',
  },

  success: {
    50: '#E7F8EE',
    100: '#C7EED7',
    500: '#159A54',
    600: '#0B7E43',
    700: '#0A6638',
  },
  warning: {
    50: '#FEF4E6',
    100: '#FBE2BE',
    500: '#F2920C',
    600: '#D17609',
    700: '#A05705',
  },
  error: {
    50: '#FDECEC',
    100: '#F9CFCF',
    500: '#E5484D',
    600: '#CE2C31',
    700: '#A81F23',
  },
  info: {
    50: '#EAF2FE',
    100: '#CADEFC',
    500: '#2E7CF6',
    600: '#1862DD',
    700: '#124BAE',
  },
} as const;

const light = {
  // ---- Brand ----
  primary: palette.green[600],
  primaryHover: palette.green[700],
  primaryPressed: palette.green[800],
  primaryLight: palette.green[500],
  primaryDark: palette.green[700],
  primaryBackground: palette.green[50],
  primarySubtle: palette.green[25],
  onPrimary: palette.neutral[0],

  // ---- Accents ----
  accent: palette.teal[600],
  accentLight: palette.teal[50],
  gold: palette.gold[600],
  goldLight: palette.gold[50],
  purple: '#6A1B9A',
  purpleLight: '#F3E5F5',
  tealDeep: '#0D9488',
  tealDeepLight: '#E0F2F1',

  // ---- Surfaces ----
  white: palette.neutral[0],
  cardBackground: palette.neutral[0],
  surfaceRaised: palette.neutral[0],
  surfaceSunken: palette.neutral[50],
  pageBackground: palette.neutral[50],
  cardBorder: palette.neutral[200],
  border: palette.neutral[200],
  borderStrong: palette.neutral[300],
  borderSubtle: palette.neutral[100],
  divider: palette.neutral[100],
  chipBg: palette.neutral[100],
  overlay: 'rgba(17, 21, 27, 0.55)',
  scrim: 'rgba(17, 21, 27, 0.32)',

  // ---- Text ----
  textDark: palette.neutral[900],
  textPrimary: palette.neutral[900],
  textSecondary: palette.neutral[600],
  textGrey: palette.neutral[500],
  textMuted: palette.neutral[500],
  textLight: palette.neutral[400],
  textDisabled: palette.neutral[400],
  buttonText: palette.neutral[0],

  // ---- Semantic ----
  success: palette.success[600],
  successLight: palette.success[50],
  successStrong: palette.success[700],
  warning: palette.warning[600],
  warningLight: palette.warning[50],
  warningStrong: palette.warning[700],
  error: palette.error[600],
  errorLight: palette.error[50],
  errorStrong: palette.error[700],
  blue: palette.info[600],
  blueLight: palette.info[50],
  info: palette.info[600],
  infoLight: palette.info[50],

  // ---- Budget / health states ----
  healthy: palette.success[500],
  atRisk: palette.warning[500],
  critical: palette.warning[600],
  exhausted: palette.error[600],
  progressLow: palette.error[100],
  progressMid: palette.gold[300],
  goalCompletedTint: palette.green[25],
  orangeLight: palette.warning[50],

  // ---- Mobile money providers ----
  providerMtn: '#FFCC00',
  providerTelecel: '#E53935',
  providerAt: '#1565C0',

  // ---- Hero / on-color overlays ----
  heroOverlay: 'rgba(255,255,255,0.16)',
  heroDivider: 'rgba(255,255,255,0.22)',

  // ---- Hero gradient stops ----
  heroGradientStart: '#1B5E20',
  heroGradientMid: '#2E7D32',
  heroGradientEnd: '#0D9488',
  heroBlueStart: '#1565C0',
  heroBlueMid: '#1976D2',
  streakGradientStart: '#FF6F00',
  streakGradientMid: '#F57F17',
  streakGradientEnd: '#E65100',
} as const;

/**
 * Structural contract for a semantic color map. `lightColors` and `darkColors`
 * expose the exact same token names so components can be written once and
 * themed at runtime via `useTheme()` / `useThemedStyles()`.
 */
export type ThemeColors = Record<keyof typeof light, string>;

export const lightColors: ThemeColors = light;

/**
 * Dark scheme — same premium eco-fintech identity on deep slate surfaces.
 * Surfaces walk down the neutral scale, text walks up, the emerald brand
 * brightens one step for contrast, and pastel tint tokens become low-alpha
 * washes of their 500-level color so they read as subtle fills on dark cards.
 */
export const darkColors: ThemeColors = {
  // ---- Brand ----
  primary: palette.green[400],
  primaryHover: palette.green[300],
  primaryPressed: palette.green[500],
  primaryLight: palette.green[300],
  primaryDark: palette.green[600],
  primaryBackground: 'rgba(21, 154, 84, 0.15)', // green[500] wash
  primarySubtle: 'rgba(21, 154, 84, 0.08)',
  onPrimary: palette.neutral[0],

  // ---- Accents ----
  accent: palette.teal[300],
  accentLight: 'rgba(17, 156, 173, 0.16)', // teal[500] wash
  gold: palette.gold[500],
  goldLight: 'rgba(226, 169, 20, 0.16)', // gold[500] wash
  purple: '#B07CE8',
  purpleLight: 'rgba(176, 124, 232, 0.16)',
  tealDeep: '#14B8A6',
  tealDeepLight: 'rgba(20, 184, 166, 0.16)',

  // ---- Surfaces ----
  white: palette.neutral[0],
  cardBackground: palette.neutral[800],
  surfaceRaised: palette.neutral[800],
  surfaceSunken: palette.neutral[900],
  pageBackground: palette.neutral[900],
  cardBorder: palette.neutral[700],
  border: palette.neutral[700],
  borderStrong: palette.neutral[600],
  borderSubtle: palette.neutral[700],
  divider: palette.neutral[700],
  chipBg: palette.neutral[700],
  overlay: 'rgba(0, 0, 0, 0.6)',
  scrim: 'rgba(0, 0, 0, 0.45)',

  // ---- Text ----
  textDark: palette.neutral[50],
  textPrimary: palette.neutral[50],
  textSecondary: palette.neutral[300],
  textGrey: palette.neutral[400],
  textMuted: palette.neutral[400],
  textLight: palette.neutral[500],
  textDisabled: palette.neutral[500],
  buttonText: palette.neutral[0],

  // ---- Semantic ----
  success: palette.success[500],
  successLight: 'rgba(21, 154, 84, 0.16)', // success[500] wash
  successStrong: palette.green[300],
  warning: palette.warning[500],
  warningLight: 'rgba(242, 146, 12, 0.16)', // warning[500] wash
  warningStrong: '#F6A83A',
  error: palette.error[500],
  errorLight: 'rgba(229, 72, 77, 0.16)', // error[500] wash
  errorStrong: '#EE6F73',
  blue: palette.info[500],
  blueLight: 'rgba(46, 124, 246, 0.16)', // info[500] wash
  info: palette.info[500],
  infoLight: 'rgba(46, 124, 246, 0.16)',

  // ---- Budget / health states ----
  healthy: palette.green[400],
  atRisk: palette.warning[500],
  critical: palette.warning[600],
  exhausted: palette.error[500],
  progressLow: 'rgba(229, 72, 77, 0.2)', // error[500] wash
  progressMid: palette.gold[300],
  goalCompletedTint: 'rgba(21, 154, 84, 0.12)',
  orangeLight: 'rgba(242, 146, 12, 0.16)',

  // ---- Mobile money providers ----
  providerMtn: '#FFCC00',
  providerTelecel: '#E53935',
  providerAt: '#1565C0',

  // ---- Hero / on-color overlays ----
  heroOverlay: 'rgba(255,255,255,0.16)',
  heroDivider: 'rgba(255,255,255,0.22)',

  // ---- Hero gradient stops (deeper emerald so heroes stay rich on dark) ----
  heroGradientStart: '#064E3B',
  heroGradientMid: '#047857',
  heroGradientEnd: '#0F766E',
  heroBlueStart: '#104E93',
  heroBlueMid: '#1565C0',
  // Flame streak gradient stays rich on both schemes.
  streakGradientStart: '#FF6F00',
  streakGradientMid: '#F57F17',
  streakGradientEnd: '#E65100',
};

/**
 * @deprecated Static light-only map kept for backwards compatibility while
 * screens migrate to `useTheme()` / `useThemedStyles()`. Do not add new usages.
 */
export const colors = lightColors;

export type ColorToken = keyof ThemeColors;
