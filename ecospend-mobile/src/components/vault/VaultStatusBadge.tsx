import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../../theme';
import type { VaultStatus } from '../../types/vault';
import type { VaultThemeColors } from './vaultTheme';

export interface VaultStatusBadgeProps {
  status: VaultStatus;
  theme: VaultThemeColors;
}

const statusConfig: Record<
  VaultStatus,
  { label: string; background: string; text: string }
> = {
  active: {
    label: 'Active',
    background: 'rgba(46, 125, 50, 0.14)',
    text: '#2E7D32',
  },
  locked: {
    label: 'Locked',
    background: 'rgba(230, 81, 0, 0.14)',
    text: '#E65100',
  },
  matured: {
    label: 'Matured',
    background: 'rgba(106, 27, 154, 0.14)',
    text: '#6A1B9A',
  },
  pending: {
    label: 'Pending',
    background: 'rgba(21, 101, 192, 0.14)',
    text: '#1565C0',
  },
  withdrawn: {
    label: 'Withdrawn',
    background: colors.chipBg,
    text: colors.textGrey,
  },
};

export default function VaultStatusBadge({
  status,
  theme,
}: VaultStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor:
            theme.background === '#0B1220'
              ? `${config.text}22`
              : config.background,
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
