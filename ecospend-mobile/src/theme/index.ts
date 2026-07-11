// NOTE: the legacy static `colors` export is intentionally NOT re-exported
// here — components must use useTheme()/useThemedStyles() so they react to
// the Light/Dark/System toggle.
export { darkColors, lightColors, palette } from './colors';
export type { ColorToken, ThemeColors } from './colors';
export { useThemedStyles } from './useThemedStyles';
export { useTheme, ThemeProvider } from '../context/ThemeContext';
export type { ThemeMode, ResolvedScheme } from '../context/ThemeContext';
export { spacing } from './spacing';
export {
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  typography,
} from './typography';
export { radius } from './radius';
export {
  cardShadow,
  subtleShadow,
  shadowXs,
  shadowSm,
  shadowMd,
  shadowLg,
  shadowBrand,
} from './shadows';
export { duration, easing, pressScale, spring } from './motion';
