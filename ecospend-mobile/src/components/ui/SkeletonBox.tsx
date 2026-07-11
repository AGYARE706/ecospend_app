import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, ViewStyle } from 'react-native';

import { radius, useThemedStyles } from '../../theme';
import type { ThemeColors } from '../../theme';

/**
 * width — skeleton width (number or percentage string)
 * height — skeleton height
 * borderRadius — corner radius token key value
 * style — optional layout overrides
 */
export interface SkeletonBoxProps {
  width?: number | `${number}%`;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export default function SkeletonBox({
  width = '100%',
  height,
  borderRadius = radius.md,
  style,
}: SkeletonBoxProps) {
  const styles = useThemedStyles(createStyles);
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.box,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  box: {
    backgroundColor: colors.border,
  },
});
