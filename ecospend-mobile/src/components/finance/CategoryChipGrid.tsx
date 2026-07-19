import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '../ui/icons';
import { ALL_CATEGORIES, CATEGORY_CONFIG, getCategoryVisual } from '../../constants/categories';
import { fontSize, fontWeight, radius, spacing, useTheme, useThemedStyles } from '../../theme';
import type { ThemeColors } from '../../theme';
import type { TransactionCategory } from '../../types';

/**
 * selectedCategory — currently selected category
 * onSelect — callback when a category chip is selected
 * categories — optional subset to display (defaults to all categories)
 */
export interface CategoryChipGridProps {
  selectedCategory: TransactionCategory | null;
  onSelect: (category: TransactionCategory) => void;
  categories?: TransactionCategory[];
}

export default function CategoryChipGrid({
  selectedCategory,
  onSelect,
  categories = ALL_CATEGORIES,
}: CategoryChipGridProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.grid}>
      {categories.map((category) => {
        const config = CATEGORY_CONFIG[category];
        const visual = getCategoryVisual(category);
        const isSelected = selectedCategory === category;

        return (
          <Pressable
            key={category}
            style={[styles.chip, isSelected ? styles.chipSelected : styles.chipDefault]}
            onPress={() => onSelect(category)}
          >
            <Icon
              name={visual.icon}
              size={20}
              color={isSelected ? colors.primary : colors.textSecondary}
              strokeWidth={1.9}
            />
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
    gap: spacing.xs + 2,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.smd,
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
