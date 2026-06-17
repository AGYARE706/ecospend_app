import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { colors, fontSize, fontWeight, radius, spacing } from '../../theme';
import type { DailySpendingPoint } from '../../utils/weeklyInsights';

export interface SpendingTrendChartProps {
  data: DailySpendingPoint[];
  barColor?: string;
}

export default function SpendingTrendChart({
  data,
  barColor = colors.primary,
}: SpendingTrendChartProps) {
  const maxAmount = Math.max(...data.map((point) => point.amount), 1);
  const animations = useRef(data.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const anims = data.map((point, index) =>
      Animated.spring(animations[index], {
        toValue: point.amount / maxAmount,
        useNativeDriver: false,
        friction: 7,
        tension: 40,
      }),
    );

    Animated.stagger(60, anims).start();
  }, [animations, data, maxAmount]);

  return (
    <View style={styles.container}>
      <View style={styles.chartArea}>
        {data.map((point, index) => {
          const height = animations[index].interpolate({
            inputRange: [0, 1],
            outputRange: ['4%', '100%'],
          });

          return (
            <View key={`${point.label}-${index}`} style={styles.barColumn}>
              <View style={styles.barTrack}>
                <Animated.View
                  style={[
                    styles.barFill,
                    { height, backgroundColor: barColor },
                  ]}
                />
              </View>
              <Text style={styles.barLabel}>{point.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.sm,
  },
  chartArea: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: spacing.xs,
    height: 120,
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
  barFill: {
    borderRadius: radius.sm,
    minHeight: 4,
    width: '72%',
  },
  barLabel: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    marginTop: spacing.xs,
  },
});
