import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { ALL_CATEGORIES } from '../../constants/categories';
import { colors, fontSize, fontWeight, radius, spacing } from '../../theme';
import type { TransactionFilter } from '../../types';

const FILTERS: TransactionFilter[] = [
  'All',
  'Income',
  'Expense',
  ...ALL_CATEGORIES,
];

/**
 * Horizontal filter chips for transaction list filtering.
 */
export interface FilterTabRowProps {
  activeFilter: TransactionFilter;
  onFilterChange: (filter: TransactionFilter) => void;
}

export default function FilterTabRow({
  activeFilter,
  onFilterChange,
}: FilterTabRowProps) {
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
            style={[styles.tab, isActive ? styles.tabActive : styles.tabInactive]}
            onPress={() => onFilterChange(filter)}
          >
            <Text
              style={[
                styles.tabText,
                isActive ? styles.tabTextActive : styles.tabTextInactive,
              ]}
            >
              {filter}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingRight: spacing.lg,
  },
  tab: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabInactive: {
    backgroundColor: colors.chipBg,
  },
  tabText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  tabTextActive: {
    color: colors.white,
  },
  tabTextInactive: {
    color: colors.textMuted,
  },
});
