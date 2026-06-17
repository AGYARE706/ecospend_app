import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import GhsText from '../ui/GhsText';
import { colors, fontSize, fontWeight, radius, shadowMd, spacing } from '../../theme';

/**
 * Hero balance card with gradient background and income/expense stats.
 */
export interface BalanceCardProps {
  balance: number;
  income: number;
  expense: number;
}

export default function BalanceCard({
  balance,
  income,
  expense,
}: BalanceCardProps) {
  return (
    <LinearGradient
      colors={[colors.primary, colors.primaryDark]}
      style={styles.card}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.glowOrb} />

      <View style={styles.headerRow}>
        <View style={styles.iconBadge}>
          <Ionicons name="wallet-outline" size={18} color={colors.white} />
        </View>
        <Text style={styles.label}>Total Balance</Text>
      </View>

      <GhsText amount={balance} variant="white" size="hero" style={styles.balance} />

      <View style={styles.divider} />

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <View style={styles.statHeader}>
            <View style={styles.statIconCircle}>
              <Ionicons name="arrow-up" size={12} color={colors.white} />
            </View>
            <Text style={styles.statLabel}>Income</Text>
          </View>
          <GhsText amount={income} variant="white" size="sm" />
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <View style={styles.statHeader}>
            <View style={styles.statIconCircle}>
              <Ionicons name="arrow-down" size={12} color={colors.white} />
            </View>
            <Text style={styles.statLabel}>Expenses</Text>
          </View>
          <GhsText amount={expense} variant="white" size="sm" />
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
  label: {
    color: colors.white,
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
  statDivider: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    height: 36,
    marginHorizontal: spacing.md,
    width: 1,
  },
  statHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  statIconCircle: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: radius.full,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  statLabel: {
    color: colors.white,
    fontSize: fontSize.xs,
    opacity: 0.82,
  },
});
