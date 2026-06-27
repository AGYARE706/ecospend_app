import { Pressable, StyleSheet, Text, View } from 'react-native';

import GhsText from '../ui/GhsText';
import { Icon } from '../ui/icons';
import { getCategoryVisual } from '../../constants/categories';
import { colors, radius, spacing, typography } from '../../theme';
import { formatTime } from '../../utils/formatDate';
import type { Transaction } from '../../types';

/**
 * Transaction row — flat variant for grouped sections, card variant standalone.
 * Each row leads with the category's SVG medallion and a small in/out badge.
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
  const visual = getCategoryVisual(transaction.category);
  const isIncome = transaction.type === 'income';

  const content = (
    <View style={styles.row}>
      <View style={[styles.iconCircle, { backgroundColor: visual.background }]}>
        <Icon name={visual.icon} size={20} color={visual.tint} strokeWidth={1.9} />
        <View
          style={[
            styles.badge,
            { backgroundColor: isIncome ? colors.success : colors.error },
          ]}
        >
          <Icon
            name={isIncome ? 'arrow-down' : 'arrow-up'}
            size={9}
            color={colors.white}
            strokeWidth={3}
          />
        </View>
      </View>

      <View style={styles.center}>
        <Text style={styles.category} numberOfLines={1}>
          {transaction.category}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {transaction.provider ?? transaction.type}
          {transaction.notes ? ` · ${transaction.notes}` : ''}
        </Text>
      </View>

      <View style={styles.right}>
        <GhsText amount={transaction.amount} variant={isIncome ? 'income' : 'expense'} size="sm" />
        <Text style={styles.time} numberOfLines={1}>
          {formatTime(transaction.date)}
        </Text>
      </View>
    </View>
  );

  if (variant === 'card') {
    return (
      <View style={styles.cardWrapper}>
        {onPress ? <Pressable onPress={onPress}>{content}</Pressable> : content}
      </View>
    );
  }

  return (
    <View>
      {onPress ? (
        <Pressable
          style={({ pressed }) => [styles.flatRow, pressed && styles.pressed]}
          onPress={onPress}
        >
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
    paddingVertical: spacing.smd,
  },
  pressed: {
    backgroundColor: colors.surfaceSunken,
  },
  cardWrapper: {
    backgroundColor: colors.white,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  iconCircle: {
    alignItems: 'center',
    borderRadius: radius.full,
    height: 46,
    justifyContent: 'center',
    marginRight: spacing.md,
    width: 46,
  },
  badge: {
    alignItems: 'center',
    borderColor: colors.white,
    borderRadius: radius.full,
    borderWidth: 1.5,
    bottom: -2,
    height: 18,
    justifyContent: 'center',
    position: 'absolute',
    right: -2,
    width: 18,
  },
  center: {
    flex: 1,
    marginRight: spacing.sm,
  },
  category: {
    ...typography.label,
    color: colors.textDark,
    fontSize: 15,
    marginBottom: 2,
  },
  meta: {
    ...typography.bodySm,
    color: colors.textMuted,
  },
  right: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  time: {
    ...typography.caption,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  hairline: {
    backgroundColor: colors.divider,
    height: 1,
    marginLeft: spacing.md + 46 + spacing.md,
  },
});
