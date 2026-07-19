import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import {
  fontSize,
  fontWeight,
  spacing,
  useTheme,
  useThemedStyles,
} from '../../theme';
import type { ThemeColors } from '../../theme';
import type { DailySpendingPoint } from '../../utils/weeklyInsights';

export interface SpendingTrendChartProps {
  data: DailySpendingPoint[];
  barColor?: string;
  compact?: boolean;
}

function formatShort(amount: number): string {
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(amount >= 10000 ? 0 : 1)}k`;
  }
  return `${Math.round(amount)}`;
}

/**
 * Single-series daily bars: one hue, rounded only at the data end,
 * anchored to a hairline baseline. The peak day carries the only
 * direct label — selective, not a number on every bar.
 */
export default function SpendingTrendChart({
  data,
  barColor,
  compact = false,
}: SpendingTrendChartProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const resolvedBarColor = barColor ?? colors.chart1;
  const maxAmount = Math.max(...data.map((point) => point.amount), 1);
  const maxIndex = data.reduce(
    (best, point, index) => (point.amount > data[best].amount ? index : best),
    0,
  );
  const hasSpending = data.some((point) => point.amount > 0);
  const animations = useRef(data.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const anims = data.map((point, index) =>
      Animated.spring(animations[index], {
        toValue: point.amount / maxAmount,
        useNativeDriver: false,
        friction: 8,
        tension: 50,
      }),
    );

    Animated.stagger(40, anims).start();
  }, [animations, data, maxAmount]);

  return (
    <View style={styles.container}>
      <View style={[styles.chartArea, compact && styles.chartAreaCompact]}>
        {data.map((point, index) => {
          const height = animations[index].interpolate({
            inputRange: [0, 1],
            outputRange: ['3%', '100%'],
          });
          const isPeak = hasSpending && index === maxIndex && point.amount > 0;

          return (
            <View key={`${point.label}-${index}`} style={styles.barColumn}>
              <View style={styles.barTrack}>
                {isPeak ? (
                  <Text style={styles.peakLabel} numberOfLines={1}>
                    {formatShort(point.amount)}
                  </Text>
                ) : null}
                <Animated.View
                  style={[
                    styles.barFill,
                    {
                      height,
                      backgroundColor: resolvedBarColor,
                      opacity: !hasSpending || isPeak ? 1 : 0.55,
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.baseline} />

      <View style={styles.labelsRow}>
        {data.map((point, index) => (
          <Text
            key={`label-${point.label}-${index}`}
            style={[
              styles.barLabel,
              hasSpending && index === maxIndex && styles.barLabelPeak,
            ]}
          >
            {point.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  container: {
    marginTop: spacing.smd,
  },
  chartArea: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: spacing.xs,
    height: 108,
    // Headroom for the peak day's value label so a tall bar never crowds
    // the row above (e.g. the "up X% vs last week" pill).
    paddingTop: spacing.md,
  },
  chartAreaCompact: {
    height: 76,
    paddingTop: spacing.smd,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barTrack: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
    width: '100%',
  },
  // Rounded at the data end only; flat where it meets the baseline.
  barFill: {
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    minHeight: 3,
    width: '55%',
  },
  peakLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    marginBottom: 3,
  },
  baseline: {
    backgroundColor: colors.border,
    height: StyleSheet.hairlineWidth,
    width: '100%',
  },
  labelsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xs + 2,
  },
  barLabel: {
    color: colors.textMuted,
    flex: 1,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    textAlign: 'center',
  },
  barLabelPeak: {
    color: colors.textSecondary,
    fontWeight: fontWeight.semibold,
  },
});
