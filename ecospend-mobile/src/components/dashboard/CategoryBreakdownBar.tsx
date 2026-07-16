import { StyleSheet, Text, View } from 'react-native';

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

/**
 * Categorical series tokens in fixed rank order (validated palette —
 * see theme/colors.ts). Identity is never color alone: every segment
 * has a labeled legend row with its amount.
 */
const SERIES = ['chart1', 'chart2', 'chart3', 'chart4', 'chart5'] as const;

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

  const shown = categories.slice(0, SERIES.length);

  return (
    <View style={styles.container}>
      <View style={styles.barTrack}>
        {shown.map((item, index) => (
          <View
            key={item.category}
            style={[
              styles.barSegment,
              {
                flex: Math.max(item.percent, 2),
                backgroundColor: colors[SERIES[index]],
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.legend}>
        {shown.map((item, index) => (
          <View key={item.category} style={styles.legendItem}>
            <View style={[styles.legendSwatch, { backgroundColor: colors[SERIES[index]] }]} />
            <Text style={styles.legendLabel} numberOfLines={1}>
              {item.category}
            </Text>
            <Text style={styles.legendPercent}>{item.percent}%</Text>
            <GhsText amount={item.amount} size="sm" style={styles.legendAmount} />
          </View>
        ))}
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      marginTop: spacing.sm,
    },
    // 2px surface gaps between segments keep adjacent fills legible.
    barTrack: {
      borderRadius: radius.xs,
      columnGap: 2,
      flexDirection: 'row',
      height: 12,
      overflow: 'hidden',
    },
    barSegment: {
      borderRadius: 3,
      height: '100%',
    },
    legend: {
      gap: spacing.sm + 2,
      marginTop: spacing.smd,
    },
    legendItem: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: spacing.sm,
    },
    legendSwatch: {
      borderRadius: 3,
      height: 10,
      width: 10,
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
      marginRight: spacing.sm,
      minWidth: 32,
      textAlign: 'right',
    },
    legendAmount: {
      color: colors.textSecondary,
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
