import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fontSize, fontWeight, radius, spacing, useThemedStyles } from '../../theme';
import type { ThemeColors } from '../../theme';
import type { TransactionType } from '../../types';

/**
 * Segmented control for selecting income or expense transaction type.
 */
export interface TypeToggleProps {
  selectedType: TransactionType;
  onSelect: (type: TransactionType) => void;
}

export default function TypeToggle({ selectedType, onSelect }: TypeToggleProps) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.track}>
      <Pressable
        style={[
          styles.segment,
          selectedType === 'income' ? styles.incomeActive : styles.inactive,
        ]}
        onPress={() => onSelect('income')}
      >
        <Text
          style={[
            styles.label,
            selectedType === 'income' ? styles.labelActive : styles.labelInactive,
          ]}
        >
          Income
        </Text>
      </Pressable>

      <Pressable
        style={[
          styles.segment,
          selectedType === 'expense' ? styles.expenseActive : styles.inactive,
        ]}
        onPress={() => onSelect('expense')}
      >
        <Text
          style={[
            styles.label,
            selectedType === 'expense' ? styles.labelActive : styles.labelInactive,
          ]}
        >
          Expense
        </Text>
      </Pressable>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  track: {
    backgroundColor: colors.chipBg,
    borderRadius: radius.full,
    flexDirection: 'row',
    marginBottom: spacing.lg,
    padding: spacing.xs,
  },
  segment: {
    alignItems: 'center',
    borderRadius: radius.full,
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  incomeActive: {
    backgroundColor: colors.primary,
  },
  expenseActive: {
    backgroundColor: colors.error,
  },
  inactive: {
    backgroundColor: 'transparent',
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  labelActive: {
    color: colors.white,
  },
  labelInactive: {
    color: colors.textMuted,
  },
});
