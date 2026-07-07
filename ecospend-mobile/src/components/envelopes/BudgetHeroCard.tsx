import { useEffect, useRef, useState } from 'react';
import { Animated, LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

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

/**
 * Green gradient hero card showing monthly budget totals and progress bar.
 */
export interface BudgetHeroCardProps {
  totalLimit: number;
  totalSpent: number;
  totalRemaining: number;
  overallPercent: number;
}

export default function BudgetHeroCard({
  totalLimit,
  totalSpent,
  totalRemaining,
  overallPercent,
}: BudgetHeroCardProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const heroFillAnim = useRef(new Animated.Value(0)).current;
  const [trackWidth, setTrackWidth] = useState(0);

  useEffect(() => {
    if (trackWidth <= 0) {
      return;
    }

    const targetWidth = (overallPercent / 100) * trackWidth;
    Animated.spring(heroFillAnim, {
      toValue: targetWidth,
      useNativeDriver: false,
      friction: 7,
      tension: 40,
    }).start();
  }, [heroFillAnim, overallPercent, trackWidth]);

  const handleTrackLayout = (event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
  };

  return (
    <LinearGradient
      colors={[colors.primary, colors.primaryDark]}
      style={styles.card}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Text style={styles.label}>Monthly budget</Text>
      <GhsText amount={totalLimit} variant="white" size="hero" style={styles.limitAmount} />

      <View style={styles.divider} />

      <View style={styles.statsRow}>
        <View style={styles.statBlock}>
          <Text style={styles.statLabel}>Spent</Text>
          <GhsText amount={totalSpent} variant="white" size="sm" />
        </View>
        <View style={styles.statBlock}>
          <Text style={styles.statLabel}>Remaining</Text>
          <GhsText amount={totalRemaining} variant="white" size="sm" />
        </View>
      </View>

      <View style={styles.progressTrack} onLayout={handleTrackLayout}>
        <Animated.View style={[styles.progressFill, { width: heroFillAnim }]} />
      </View>
      <Text style={styles.percentLabel}>{overallPercent}% used</Text>
    </LinearGradient>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  card: {
    borderRadius: radius.heroCard,
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  label: {
    color: colors.white,
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
    opacity: 0.9,
  },
  limitAmount: {
    marginBottom: spacing.md,
  },
  divider: {
    backgroundColor: colors.heroDivider,
    height: 1,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  statBlock: {
    flex: 1,
  },
  statLabel: {
    color: colors.white,
    fontSize: fontSize.xs,
    marginBottom: spacing.xs,
    opacity: 0.85,
  },
  progressTrack: {
    backgroundColor: colors.heroOverlay,
    borderRadius: radius.full,
    height: spacing.sm,
    marginBottom: spacing.xs,
    overflow: 'hidden',
    width: '100%',
  },
  progressFill: {
    backgroundColor: colors.white,
    borderRadius: radius.full,
    height: spacing.sm,
  },
  percentLabel: {
    color: colors.white,
    fontSize: fontSize.xs,
    opacity: 0.9,
    textAlign: 'right',
  },
});
