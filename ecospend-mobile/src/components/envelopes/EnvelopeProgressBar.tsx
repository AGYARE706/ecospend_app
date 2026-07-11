import { useEffect, useRef, useState } from 'react';
import { Animated, LayoutChangeEvent, StyleSheet, View } from 'react-native';

import { radius, spacing, useTheme, useThemedStyles } from '../../theme';
import type { ThemeColors } from '../../theme';
import type { EnvelopeStatus } from '../../types';
import { getStatusColor } from '../../utils/envelopes';

/**
 * Status-colored progress bar with optional exhausted pulse glow.
 */
export interface EnvelopeProgressBarProps {
  percent: number;
  status: EnvelopeStatus;
}

export default function EnvelopeProgressBar({
  percent,
  status,
}: EnvelopeProgressBarProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const fillAnim = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(1)).current;
  const [trackWidth, setTrackWidth] = useState(0);

  const fillColor = getStatusColor(status, colors);
  const isExhausted = status === 'exhausted';

  useEffect(() => {
    if (trackWidth <= 0) {
      return;
    }

    const targetWidth = (percent / 100) * trackWidth;
    Animated.spring(fillAnim, {
      toValue: targetWidth,
      useNativeDriver: false,
      friction: 7,
      tension: 40,
    }).start();
  }, [fillAnim, percent, trackWidth]);

  useEffect(() => {
    if (!isExhausted) {
      return;
    }

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(glowOpacity, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(glowOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );

    pulse.start();

    return () => {
      pulse.stop();
    };
  }, [glowOpacity, isExhausted]);

  const handleTrackLayout = (event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
  };

  return (
    <View style={styles.container}>
      <View style={styles.track} onLayout={handleTrackLayout}>
        <Animated.View
          style={[styles.fill, { width: fillAnim, backgroundColor: fillColor }]}
        />
        {isExhausted ? (
          <Animated.View
            style={[styles.glowOverlay, { opacity: glowOpacity }]}
            pointerEvents="none"
          />
        ) : null}
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  container: {
    width: '100%',
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
  glowOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.exhausted,
    borderRadius: radius.full,
  },
});
