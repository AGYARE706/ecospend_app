import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import GhsText from '../ui/GhsText';
import type { VaultSummary } from '../../types/vault';
import { formatVaultDate } from '../../utils/vault';
import { fontSize, fontWeight, radius, shadowMd, spacing } from '../../theme';
import type { VaultThemeColors } from './vaultTheme';

export interface VaultSummaryCardProps {
  summary: VaultSummary;
  theme: VaultThemeColors;
}

export default function VaultSummaryCard({
  summary,
  theme,
}: VaultSummaryCardProps) {
  return (
    <LinearGradient
      colors={[...theme.heroGradient]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.glowOrb} />

      <View style={styles.headerRow}>
        <View style={styles.iconBadge}>
          <Ionicons name="shield-checkmark" size={18} color="#FFFFFF" />
        </View>
        <Text style={styles.headerLabel}>Total Vault Balance</Text>
      </View>

      <GhsText
        amount={summary.totalBalance}
        variant="white"
        size="hero"
        style={styles.balance}
      />

      <View style={styles.divider} />

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Active Vaults</Text>
          <Text style={styles.statValue}>{summary.activeVaultCount}</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={[styles.statItem, styles.statItemWide]}>
          <Text style={styles.statLabel}>Next Maturity</Text>
          <Text style={styles.statValue} numberOfLines={1}>
            {summary.nextMaturityDate
              ? formatVaultDate(summary.nextMaturityDate)
              : 'None scheduled'}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.heroCard,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    padding: spacing.lg,
    ...shadowMd,
  },
  glowOrb: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radius.full,
    height: 120,
    position: 'absolute',
    right: -24,
    top: -24,
    width: 120,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  iconBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: radius.full,
    height: 32,
    justifyContent: 'center',
    marginRight: spacing.sm,
    width: 32,
  },
  headerLabel: {
    color: '#FFFFFF',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    opacity: 0.92,
  },
  balance: {
    marginBottom: spacing.md,
  },
  divider: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    height: 1,
    marginBottom: spacing.md,
  },
  statsRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  statItem: {
    flex: 1,
  },
  statItemWide: {
    flex: 1.4,
  },
  statDivider: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    height: 36,
    marginHorizontal: spacing.md,
    width: 1,
  },
  statLabel: {
    color: '#FFFFFF',
    fontSize: fontSize.xs,
    marginBottom: spacing.xs,
    opacity: 0.82,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
});
