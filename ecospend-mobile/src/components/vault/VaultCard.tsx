import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import GhsText from '../ui/GhsText';
import type { Vault } from '../../types/vault';
import {
  formatDaysRemaining,
  formatVaultDate,
  getDaysRemaining,
  getVaultProgress,
} from '../../utils/vault';
import { fontSize, fontWeight, radius, shadowSm, spacing } from '../../theme';
import VaultProgressBar from './VaultProgressBar';
import VaultStatusBadge from './VaultStatusBadge';
import type { VaultThemeColors } from './vaultTheme';

export interface VaultCardProps {
  vault: Vault;
  theme: VaultThemeColors;
  onPress: (vault: Vault) => void;
}

export default function VaultCard({ vault, theme, onPress }: VaultCardProps) {
  const progress = getVaultProgress(vault);
  const daysRemaining = getDaysRemaining(vault.maturityDate);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.cardBorder,
        },
        pressed && styles.pressed,
      ]}
      onPress={() => onPress(vault)}
    >
      <View style={styles.topRow}>
        <View style={styles.titleBlock}>
          <View
            style={[styles.accentDot, { backgroundColor: vault.accentColor }]}
          />
          <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
            {vault.name}
          </Text>
        </View>
        <VaultStatusBadge status={vault.status} theme={theme} />
      </View>

      <View style={styles.balanceRow}>
        <View>
          <Text style={[styles.metaLabel, { color: theme.textMuted }]}>
            Current Balance
          </Text>
          <GhsText amount={vault.currentBalance} size="md" style={{ color: theme.text }} />
        </View>
        <View style={styles.targetBlock}>
          <Text style={[styles.metaLabel, { color: theme.textMuted }]}>
            Target
          </Text>
          <GhsText
            amount={vault.targetAmount}
            size="sm"
            style={{ color: theme.textSubtle }}
          />
        </View>
      </View>

      <VaultProgressBar
        progress={progress}
        accentColor={vault.accentColor}
        theme={theme}
      />

      <View style={styles.footerRow}>
        <View style={styles.footerItem}>
          <Ionicons
            name="calendar-outline"
            size={14}
            color={theme.textMuted}
          />
          <Text style={[styles.footerText, { color: theme.textMuted }]}>
            {formatDaysRemaining(daysRemaining)}
          </Text>
        </View>

        <View style={styles.footerItem}>
          <Ionicons name="time-outline" size={14} color={theme.textMuted} />
          <Text style={[styles.footerText, { color: theme.textMuted }]}>
            {formatVaultDate(vault.maturityDate)}
          </Text>
        </View>

        <View style={styles.footerItem}>
          <Ionicons name="cash-outline" size={14} color={theme.textMuted} />
          <Text style={[styles.footerText, { color: theme.textMuted }]}>
            Fee GH₵ {vault.estimatedWithdrawalFee.toFixed(2)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.card,
    borderWidth: 1,
    marginBottom: spacing.md,
    padding: spacing.md,
    ...shadowSm,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.995 }],
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  titleBlock: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    marginRight: spacing.sm,
  },
  accentDot: {
    borderRadius: radius.full,
    height: 10,
    marginRight: spacing.sm,
    width: 10,
  },
  name: {
    flex: 1,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  targetBlock: {
    alignItems: 'flex-end',
  },
  metaLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  footerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  footerItem: {
    alignItems: 'center',
    flexDirection: 'row',
    marginRight: spacing.sm,
  },
  footerText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    marginLeft: spacing.xs,
  },
});
