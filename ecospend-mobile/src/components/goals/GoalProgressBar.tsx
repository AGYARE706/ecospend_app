import { useEffect, useRef, useState } from 'react';
import { Animated, LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';

import { colors, fontSize, fontWeight, radius, spacing } from '../../theme';
import { getProgressFillColor } from '../../utils/goals';

/**
 * Animated goal progress bar with percentage label and spring fill animation.
 */
export interface GoalProgressBarProps {
  progress: number;
  animate?: boolean;
  forceHighColor?: boolean;
}

export default function GoalProgressBar({
  progress,
  animate = true,
  forceHighColor = false,
}: GoalProgressBarProps) {
  const fillAnim = useRef(new Animated.Value(0)).current;
  const [trackWidth, setTrackWidth] = useState(0);

  const fillTier = forceHighColor ? 'high' : getProgressFillColor(progress);
  const fillStyle =
    fillTier === 'high'
      ? styles.fillHigh
      : fillTier === 'mid'
        ? styles.fillMid
        : styles.fillLow;

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
      <Text style={styles.percentLabel}>{progress}%</Text>
      <View style={styles.track} onLayout={handleTrackLayout}>
        <Animated.View style={[styles.fill, fillStyle, { width: fillAnim }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  percentLabel: {
    color: colors.textDark,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
    textAlign: 'right',
  },
  track: {
    backgroundColor: colors.divider,
    borderRadius: radius.full,
    height: spacing.sm,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    borderRadius: radius.full,
    height: spacing.sm,
  },
  fillLow: {
    backgroundColor: colors.progressLow,
  },
  fillMid: {
    backgroundColor: colors.progressMid,
  },
  fillHigh: {
    backgroundColor: colors.primary,
  },
});
