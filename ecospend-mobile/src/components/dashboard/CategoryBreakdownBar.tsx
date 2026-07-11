import { StyleSheet, Text, View } from 'react-native';

import { CATEGORY_CONFIG } from '../../constants/categories';
import GhsText from '../ui/GhsText';
import {
  fontSize,
  fontWeight,
  radius,
  spacing,
  useTheme,
  useThemedStyles,
} from '../../theme';
import type { ThemeColors } from '../../theme';
import type { CategoryBreakdownPoint } from '../../types';

export interface CategoryBreakdownBarProps {
  categories: CategoryBreakdownPoint[];
}

const BAR_COLORS = [
  'primary',
  'warning',
  'blue',
  'accent',
  'textSecondary',
] as const;

export default function CategoryBreakdownBar({ categories }: CategoryBreakdownBarProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  if (categories.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyText}>No spending data this month yet.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.barTrack}>
        {categories.map((item, index) => {
          const colorKey = BAR_COLORS[index % BAR_COLORS.length];
          const segmentColor = colors[colorKey];

          return (
            <View
              key={item.category}
              style={[
                styles.barSegment,
                {
                  flex: item.percent,
                  backgroundColor: segmentColor,
                },
                index === 0 && styles.barSegmentFirst,
                index === categories.length - 1 && styles.barSegmentLast,
              ]}
            />
          );
        })}
      </View>

      <View style={styles.legend}>
        {categories.map((item, index) => {
          const colorKey = BAR_COLORS[index % BAR_COLORS.length];
          const config = CATEGORY_CONFIG[item.category];

          return (
            <View key={item.category} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors[colorKey] }]} />
              <Text style={styles.legendEmoji}>{config.emoji}</Text>
              <View style={styles.legendTextBlock}>
                <Text style={styles.legendLabel} numberOfLines={1}>
                  {config.label}
                </Text>
                <Text style={styles.legendPercent}>{item.percent}%</Text>
              </View>
              <GhsText amount={item.amount} size="sm" style={styles.legendAmount} />
            </View>
          );
        })}
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      marginTop: spacing.sm,
    },
    barTrack: {
      backgroundColor: colors.chipBg,
      borderRadius: radius.full,
      flexDirection: 'row',
      height: 10,
      overflow: 'hidden',
    },
    barSegment: {
      height: '100%',
    },
    barSegmentFirst: {
      borderBottomLeftRadius: radius.full,
      borderTopLeftRadius: radius.full,
    },
    barSegmentLast: {
      borderBottomRightRadius: radius.full,
      borderTopRightRadius: radius.full,
    },
    legend: {
      gap: spacing.sm,
      marginTop: spacing.md,
    },
    legendItem: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: spacing.xs,
    },
    legendDot: {
      borderRadius: radius.full,
      height: 8,
      width: 8,
    },
    legendEmoji: {
      fontSize: fontSize.sm,
      width: 20,
    },
    legendTextBlock: {
      flex: 1,
      flexDirection: 'row',
      gap: spacing.xs,
    },
    legendLabel: {
      color: colors.textDark,
      flex: 1,
      fontSize: fontSize.sm,
      fontWeight: fontWeight.medium,
    },
    legendPercent: {
      color: colors.textMuted,
      fontSize: fontSize.xs,
      fontWeight: fontWeight.medium,
    },
    legendAmount: {
      color: colors.textMuted,
    },
    emptyWrap: {
      alignItems: 'center',
      paddingVertical: spacing.md,
    },
    emptyText: {
      color: colors.textMuted,
      fontSize: fontSize.sm,
    },
  });
