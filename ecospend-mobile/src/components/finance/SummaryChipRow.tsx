import { StyleSheet, Text, View } from 'react-native';

import GhsText from '../ui/GhsText';
import { cardShadow, colors, fontSize, fontWeight, radius, spacing } from '../../theme';
import type { TransactionSummaryBar } from '../../types';

/**
 * Single stat card showing income, expenses, and net with hairline dividers.
 */
export interface SummaryChipRowProps {
  summary: TransactionSummaryBar;
}

export default function SummaryChipRow({ summary }: SummaryChipRowProps) {
  return (
    <View style={styles.card}>
      <View style={styles.segment}>
        <Text style={styles.label}>Income</Text>
        <GhsText amount={summary.income} variant="income" size="sm" />
      </View>

      <View style={styles.divider} />

      <View style={styles.segment}>
        <Text style={styles.label}>Expenses</Text>
        <GhsText amount={summary.expense} variant="expense" size="sm" />
      </View>

      <View style={styles.divider} />

      <View style={styles.segment}>
        <Text style={styles.label}>Net</Text>
        <GhsText
          amount={summary.net}
          variant={summary.net >= 0 ? 'income' : 'expense'}
          size="sm"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    flexDirection: 'row',
    marginBottom: spacing.md,
    paddingVertical: spacing.md,
    ...cardShadow,
  },
  segment: {
    alignItems: 'center',
    flex: 1,
  },
  label: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  divider: {
    backgroundColor: colors.divider,
    width: 1,
  },
});
