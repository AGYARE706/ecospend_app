import { useMemo } from 'react';

import { useTheme } from '../../context/ThemeContext';

export interface VaultThemeColors {
  background: string;
  card: string;
  cardBorder: string;
  text: string;
  textMuted: string;
  textSubtle: string;
  chipBg: string;
  progressTrack: string;
  heroGradient: readonly [string, string, string];
  heroOverlay: string;
  heroDivider: string;
  fabShadow: string;
}

/**
 * Vault surfaces derive from the app-wide theme so they follow the in-app
 * Light/Dark/System toggle; only the hero gradient keeps bespoke stops so it
 * stays rich on both schemes.
 */
export function useVaultTheme(): VaultThemeColors {
  const { colors, isDark } = useTheme();

  return useMemo<VaultThemeColors>(
    () => ({
      background: colors.pageBackground,
      card: colors.cardBackground,
      cardBorder: colors.cardBorder,
      text: colors.textDark,
      textMuted: colors.textMuted,
      textSubtle: colors.textGrey,
      chipBg: colors.chipBg,
      progressTrack: colors.divider,
      heroGradient: [
        colors.heroGradientStart,
        colors.heroGradientMid,
        colors.heroGradientEnd,
      ],
      heroOverlay: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.12)',
      heroDivider: colors.heroDivider,
      fabShadow: isDark ? '#000000' : '#0F172A',
    }),
    [colors, isDark],
  );
}
