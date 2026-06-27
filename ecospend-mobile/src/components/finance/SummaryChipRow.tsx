import { StyleSheet, Text, View } from 'react-native';

import GhsText from '../ui/GhsText';
import { Icon } from '../ui/icons';
import { colors, radius, shadowSm, spacing, typography } from '../../theme';
import type { TransactionSummaryBar } from '../../types';

/**
 * Single stat card showing income, expenses, and net with hairline dividers
 * and small directional glyphs for quick scanning.
 */
export interface SummaryChipRowProps {
  summary: TransactionSummaryBar;
}

export default function SummaryChipRow({ summary }: SummaryChipRowProps) {
  const netPositive = summary.net >= 0;

  return (
    <View style={styles.card}>
      <View style={styles.segment}>
        <View style={styles.labelRow}>
          <Icon name="arrow-down" size={12} color={colors.success} strokeWidth={2.4} />
          <Text style={styles.label}>Income</Text>
        </View>
        <GhsText amount={summary.income} variant="income" size="sm" />
      </View>

      <View style={styles.divider} />

      <View style={styles.segment}>
        <View style={styles.labelRow}>
          <Icon name="arrow-up" size={12} color={colors.error} strokeWidth={2.4} />
          <Text style={styles.label}>Expenses</Text>
        </View>
        <GhsText amount={summary.expense} variant="expense" size="sm" />
      </View>

      <View style={styles.divider} />

      <View style={styles.segment}>
        <View style={styles.labelRow}>
          <Icon
            name="trending-up"
            size={12}
            color={netPositive ? colors.success : colors.error}
            strokeWidth={2.4}
          />
          <Text style={styles.label}>Net</Text>
        </View>
        <GhsText amount={summary.net} variant={netPositive ? 'income' : 'expense'} size="sm" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: spacing.md,
    paddingVertical: spacing.md,
    ...shadowSm,
  },
  segment: {
    alignItems: 'center',
    flex: 1,
  },
  labelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.overline,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  divider: {
    backgroundColor: colors.divider,
    width: 1,
  },
});
