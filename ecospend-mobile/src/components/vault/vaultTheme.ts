import { useColorScheme } from 'react-native';

import { colors as lightColors } from '../../theme';

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

const lightTheme: VaultThemeColors = {
  background: lightColors.pageBackground,
  card: lightColors.cardBackground,
  cardBorder: lightColors.cardBorder,
  text: lightColors.textDark,
  textMuted: lightColors.textMuted,
  textSubtle: lightColors.textGrey,
  chipBg: lightColors.chipBg,
  progressTrack: lightColors.divider,
  heroGradient: ['#1B5E20', '#2E7D32', '#0D9488'],
  heroOverlay: 'rgba(255,255,255,0.12)',
  heroDivider: lightColors.heroDivider,
  fabShadow: '#0F172A',
};

const darkTheme: VaultThemeColors = {
  background: '#0B1220',
  card: '#151D2E',
  cardBorder: '#243044',
  text: '#F8FAFC',
  textMuted: '#94A3B8',
  textSubtle: '#64748B',
  chipBg: '#1E293B',
  progressTrack: '#334155',
  heroGradient: ['#064E3B', '#047857', '#0F766E'],
  heroOverlay: 'rgba(255,255,255,0.08)',
  heroDivider: 'rgba(255,255,255,0.14)',
  fabShadow: '#000000',
};

export function useVaultTheme(): VaultThemeColors {
  const scheme = useColorScheme();
  return scheme === 'dark' ? darkTheme : lightTheme;
}
