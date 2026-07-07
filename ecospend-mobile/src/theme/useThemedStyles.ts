import { useMemo } from 'react';

import { useTheme } from '../context/ThemeContext';
import type { ThemeColors } from './colors';

/**
 * Builds a memoized style object from the active theme's colors.
 *
 * Usage:
 *   const createStyles = (colors: ThemeColors) => StyleSheet.create({ ... });
 *   const styles = useThemedStyles(createStyles);
 *
 * Pass a module-level factory (stable reference) so the styles are only
 * rebuilt when the resolved theme actually changes.
 */
export function useThemedStyles<T>(factory: (colors: ThemeColors) => T): T {
  const { colors } = useTheme();
  return useMemo(() => factory(colors), [colors, factory]);
}
