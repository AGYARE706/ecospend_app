import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CATEGORY_CONFIG, ALL_CATEGORIES } from '../../constants/categories';
import { fontSize, fontWeight, radius, spacing, useThemedStyles } from '../../theme';
import type { ThemeColors } from '../../theme';
import type { TransactionCategory } from '../../types';

/**
 * selectedCategory — currently selected category
 * onSelect — callback when a category chip is selected
 */
export interface CategoryChipGridProps {
  selectedCategory: TransactionCategory | null;
  onSelect: (category: TransactionCategory) => void;
}

export default function CategoryChipGrid({
  selectedCategory,
  onSelect,
}: CategoryChipGridProps) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.grid}>
      {ALL_CATEGORIES.map((category) => {
        const config = CATEGORY_CONFIG[category];
        const isSelected = selectedCategory === category;

        return (
          <Pressable
            key={category}
            style={[styles.chip, isSelected ? styles.chipSelected : styles.chipDefault]}
            onPress={() => onSelect(category)}
          >
            <Text style={styles.emoji}>{config.emoji}</Text>
            <Text
              style={[
                styles.label,
                isSelected ? styles.labelSelected : styles.labelDefault,
              ]}
            >
              {config.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  chip: {
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
    width: '31%',
  },
  chipDefault: {
    backgroundColor: colors.chipBg,
    borderColor: colors.chipBg,
  },
  chipSelected: {
    backgroundColor: colors.primaryBackground,
    borderColor: colors.primary,
  },
  emoji: {
    fontSize: fontSize.xl,
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    textAlign: 'center',
  },
  labelDefault: {
    color: colors.textGrey,
  },
  labelSelected: {
    color: colors.primary,
  },
});
