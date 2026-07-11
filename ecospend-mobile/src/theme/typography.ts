/**
 * Type system.
 *
 * `fontSize` / `fontWeight` remain as primitive scales (used widely), while
 * `typography` exposes named, ready-to-spread text roles so screens stay
 * consistent: spread a role onto a Text style and override only color.
 */

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  amountHero: 40,
  amountDisplay: 48,
} as const;

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const lineHeight = {
  tight: 1.2,
  snug: 1.35,
  normal: 1.5,
} as const;

/** Letter spacing tuned for the SF/Roboto system stacks. */
export const letterSpacing = {
  tighter: -0.6,
  tight: -0.3,
  normal: 0,
  wide: 0.4,
  wider: 0.8,
} as const;

type TextRole = {
  fontSize: number;
  fontWeight: '400' | '500' | '600' | '700';
  lineHeight: number;
  letterSpacing?: number;
};

/**
 * Named roles — display → label. Spread directly:
 *   <Text style={[typography.h2, { color: colors.textDark }]}>
 */
export const typography: Record<
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'subheading'
  | 'bodyLg'
  | 'body'
  | 'bodySm'
  | 'label'
  | 'caption'
  | 'overline'
  | 'amount',
  TextRole
> = {
  display: {
    fontSize: 34,
    fontWeight: fontWeight.bold,
    lineHeight: 40,
    letterSpacing: letterSpacing.tighter,
  },
  h1: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    lineHeight: 34,
    letterSpacing: letterSpacing.tight,
  },
  h2: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    lineHeight: 30,
    letterSpacing: letterSpacing.tight,
  },
  h3: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    lineHeight: 26,
    letterSpacing: letterSpacing.tight,
  },
  subheading: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    lineHeight: 24,
  },
  bodyLg: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.regular,
    lineHeight: 26,
  },
  body: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.regular,
    lineHeight: 22,
  },
  bodySm: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    lineHeight: 20,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    lineHeight: 18,
  },
  caption: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    lineHeight: 16,
  },
  overline: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    lineHeight: 16,
    letterSpacing: letterSpacing.wider,
  },
  amount: {
    fontSize: fontSize.amountHero,
    fontWeight: fontWeight.bold,
    lineHeight: 46,
    letterSpacing: letterSpacing.tight,
  },
};
