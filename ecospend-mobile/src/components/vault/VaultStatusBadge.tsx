import { StyleSheet, Text, View } from 'react-native';

import { radius, spacing, typography, useTheme } from '../../theme';
import type { ThemeColors } from '../../theme';
import type { VaultStatus } from '../../types/vault';
import type { VaultThemeColors } from './vaultTheme';

export interface VaultStatusBadgeProps {
  status: VaultStatus;
  theme: VaultThemeColors;
}

const getStatusConfig = (
  colors: ThemeColors,
): Record<VaultStatus, { label: string; background: string; text: string }> => ({
  active: {
    label: 'Active',
    background: 'rgba(46, 125, 50, 0.14)',
    text: colors.healthy,
  },
  locked: {
    label: 'Locked',
    background: 'rgba(230, 81, 0, 0.14)',
    text: colors.warning,
  },
  matured: {
    label: 'Matured',
    background: 'rgba(106, 27, 154, 0.14)',
    text: colors.purple,
  },
  pending: {
    label: 'Pending',
    background: 'rgba(21, 101, 192, 0.14)',
    text: colors.blue,
  },
  withdrawn: {
    label: 'Withdrawn',
    background: colors.chipBg,
    text: colors.textGrey,
  },
});

export default function VaultStatusBadge({
  status,
  theme,
}: VaultStatusBadgeProps) {
  const { colors, isDark } = useTheme();
  const config = getStatusConfig(colors)[status];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: isDark ? `${config.text}22` : config.background,
        },
      ]}
    >
      <Text style={[styles.label, { color: config.text }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  label: {
    ...typography.overline,
    textTransform: 'uppercase',
  },
});
