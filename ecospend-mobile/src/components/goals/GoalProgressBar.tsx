import { useEffect, useRef, useState } from 'react';
import { Animated, LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';

import {
  fontSize,
  fontWeight,
  radius,
  spacing,
  useTheme,
  useThemedStyles,
} from '../../theme';
import type { ThemeColors } from '../../theme';
import { getProgressFillColor } from '../../utils/goals';

/**
 * Animated goal progress bar with percentage label and spring fill animation.
 */
export interface GoalProgressBarProps {
  progress: number;
  animate?: boolean;
  forceHighColor?: boolean;
  accentColor?: string;
}

export default function GoalProgressBar({
  progress,
  animate = true,
  forceHighColor = false,
  accentColor,
}: GoalProgressBarProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const fillAnim = useRef(new Animated.Value(0)).current;
  const [trackWidth, setTrackWidth] = useState(0);

  const fillTier = forceHighColor ? 'high' : getProgressFillColor(progress);
  const fillColor =
    accentColor ??
    (fillTier === 'high'
      ? colors.primary
      : fillTier === 'mid'
        ? colors.progressMid
        : colors.progressLow);

  useEffect(() => {
    if (trackWidth <= 0) {
      return;
    }

    const targetWidth = (progress / 100) * trackWidth;

    if (animate) {
      Animated.spring(fillAnim, {
        toValue: targetWidth,
        useNativeDriver: false,
        friction: 7,
        tension: 40,
      }).start();
      return;
    }

    fillAnim.setValue(targetWidth);
  }, [animate, fillAnim, progress, trackWidth]);

  const handleTrackLayout = (event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.progressLabel}>Progress</Text>
        <Text style={[styles.percentLabel, { color: fillColor }]}>{progress}%</Text>
      </View>
      <View style={styles.track} onLayout={handleTrackLayout}>
        <Animated.View style={[styles.fill, { width: fillAnim, backgroundColor: fillColor }]} />
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  container: {
    width: '100%',
  },
  labelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  progressLabel: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    textTransform: 'uppercase',
  },
  percentLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  track: {
    backgroundColor: colors.divider,
    borderRadius: radius.full,
    height: 8,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    borderRadius: radius.full,
    height: 8,
  },
});
