import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import GhsText from '../ui/GhsText';
import { cardShadow, colors, fontSize, fontWeight, radius, spacing } from '../../theme';

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
      <Text style={styles.label}>Total Balance</Text>
      <GhsText amount={balance} variant="white" size="hero" style={styles.balance} />

      <View style={styles.divider} />

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <View style={styles.statHeader}>
            <Ionicons name="arrow-up" size={fontSize.sm} color={colors.white} />
            <Text style={styles.statLabel}>Income</Text>
          </View>
          <GhsText amount={income} variant="white" size="sm" />
        </View>

        <View style={styles.statItem}>
          <View style={styles.statHeader}>
            <Ionicons name="arrow-down" size={fontSize.sm} color={colors.white} />
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
    padding: spacing.lg,
    ...cardShadow,
  },
  label: {
    color: colors.white,
    fontSize: fontSize.sm,
    marginBottom: spacing.sm,
    opacity: 0.9,
  },
  balance: {
    marginBottom: spacing.md,
  },
  divider: {
    backgroundColor: colors.heroDivider,
    height: 1,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
  },
  statHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  statLabel: {
    color: colors.white,
    fontSize: fontSize.sm,
    opacity: 0.9,
  },
});
