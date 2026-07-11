import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { ALL_CATEGORIES } from '../../constants/categories';
import { radius, shadowXs, spacing, typography, useThemedStyles } from '../../theme';
import type { ThemeColors } from '../../theme';
import type { TransactionFilter } from '../../types';

const FILTERS: TransactionFilter[] = ['All', 'Income', 'Expense', ...ALL_CATEGORIES];

/**
 * Horizontal filter chips for transaction list filtering.
 */
export interface FilterTabRowProps {
  activeFilter: TransactionFilter;
  onFilterChange: (filter: TransactionFilter) => void;
}

export default function FilterTabRow({ activeFilter, onFilterChange }: FilterTabRowProps) {
  const styles = useThemedStyles(createStyles);
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {FILTERS.map((filter) => {
        const isActive = filter === activeFilter;

        return (
          <Pressable
            key={filter}
            style={({ pressed }) => [
              styles.tab,
              isActive ? styles.tabActive : styles.tabInactive,
              pressed && styles.tabPressed,
            ]}
            onPress={() => onFilterChange(filter)}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
          >
            <Text
              style={[styles.tabText, isActive ? styles.tabTextActive : styles.tabTextInactive]}
              numberOfLines={1}
            >
              {filter}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  container: {
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingRight: spacing.lg,
  },
  tab: {
    alignItems: 'center',
    borderRadius: radius.chip,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  tabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    ...shadowXs,
  },
  tabInactive: {
    backgroundColor: colors.cardBackground,
    borderColor: colors.border,
  },
  tabPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  tabText: {
    ...typography.label,
  },
  tabTextActive: {
    color: colors.white,
  },
  tabTextInactive: {
    color: colors.textSecondary,
  },
});
