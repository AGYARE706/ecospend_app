import { Pressable, StyleSheet, Text, View } from 'react-native';

import GhsText from '../ui/GhsText';
import { CATEGORY_CONFIG } from '../../constants/categories';
import { fontSize, fontWeight, radius, spacing, useTheme, useThemedStyles } from '../../theme';
import type { ThemeColors } from '../../theme';
import { formatShortDate } from '../../utils/formatDate';
import type { Transaction } from '../../types';

/**
 * transaction — transaction data to display
 * onPress — callback when the row is tapped
 */
export interface DashboardTransactionRowProps {
  transaction: Transaction;
  onPress: () => void;
}

export default function DashboardTransactionRow({
  transaction,
  onPress,
}: DashboardTransactionRowProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const config = CATEGORY_CONFIG[transaction.category];
  const amountVariant = transaction.type === 'income' ? 'income' : 'expense';

  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View
        style={[
          styles.emojiCircle,
          { backgroundColor: colors[config.circleBackground] },
        ]}
      >
        <Text style={styles.emoji}>{config.emoji}</Text>
      </View>

      <View style={styles.center}>
        <Text style={styles.category}>{transaction.category}</Text>
        <Text style={styles.provider}>
          {transaction.provider ?? transaction.type}
        </Text>
      </View>

      <View style={styles.right}>
        <GhsText amount={transaction.amount} variant={amountVariant} size="sm" />
        <Text style={styles.date}>{formatShortDate(transaction.date)}</Text>
      </View>
    </Pressable>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  emojiCircle: {
    alignItems: 'center',
    borderRadius: radius.full,
    height: 44,
    justifyContent: 'center',
    marginRight: spacing.md,
    width: 44,
  },
  emoji: {
    fontSize: fontSize.lg,
  },
  center: {
    flex: 1,
  },
  category: {
    color: colors.textDark,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  provider: {
    color: colors.textGrey,
    fontSize: fontSize.sm,
  },
  right: {
    alignItems: 'flex-end',
  },
  date: {
    color: colors.textGrey,
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
});
