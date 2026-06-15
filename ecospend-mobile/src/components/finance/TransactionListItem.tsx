import { Pressable, StyleSheet, Text, View } from 'react-native';

import GhsText from '../ui/GhsText';
import { CATEGORY_CONFIG } from '../../constants/categories';
import { colors, fontSize, fontWeight, radius, spacing } from '../../theme';
import { formatTime } from '../../utils/formatDate';
import type { Transaction } from '../../types';

/**
 * Transaction row for list display — flat variant for grouped sections or card variant.
 */
export interface TransactionListItemProps {
  transaction: Transaction;
  variant?: 'flat' | 'card';
  onPress?: () => void;
  showDivider?: boolean;
}

export default function TransactionListItem({
  transaction,
  variant = 'flat',
  onPress,
  showDivider = false,
}: TransactionListItemProps) {
  const config = CATEGORY_CONFIG[transaction.category];
  const amountVariant = transaction.type === 'income' ? 'income' : 'expense';

  const content = (
    <View style={styles.row}>
      <View
        style={[styles.emojiCircle, { backgroundColor: config.circleBackground }]}
      >
        <Text style={styles.emoji}>{config.emoji}</Text>
      </View>

      <View style={styles.center}>
        <Text style={styles.category}>{transaction.category}</Text>
        <Text style={styles.meta}>
          {transaction.provider ?? transaction.type}
          {transaction.notes ? ` · ${transaction.notes}` : ''}
        </Text>
      </View>

      <View style={styles.right}>
        <GhsText amount={transaction.amount} variant={amountVariant} size="sm" />
        <Text style={styles.time}>{formatTime(transaction.date)}</Text>
      </View>
    </View>
  );

  if (variant === 'card') {
    return (
      <View style={styles.cardWrapper}>
        {onPress ? (
          <Pressable onPress={onPress}>{content}</Pressable>
        ) : (
          content
        )}
      </View>
    );
  }

  return (
    <View>
      {onPress ? (
        <Pressable style={styles.flatRow} onPress={onPress}>
          {content}
        </Pressable>
      ) : (
        <View style={styles.flatRow}>{content}</View>
      )}
      {showDivider ? <View style={styles.hairline} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flatRow: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  cardWrapper: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
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
    marginBottom: 2,
  },
  meta: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  right: {
    alignItems: 'flex-end',
  },
  time: {
    color: colors.textLight,
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
  hairline: {
    backgroundColor: colors.divider,
    height: 1,
    marginLeft: spacing.md + 44 + spacing.md,
  },
});
