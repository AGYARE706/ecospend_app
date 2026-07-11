import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import {
  fontSize,
  fontWeight,
  spacing,
  useTheme,
  useThemedStyles,
} from '../../theme';
import type { ThemeColors } from '../../theme';

export interface SavingsRateRingProps {
  rate: number;
  size?: number;
}

const CIRCUMFERENCE = 2 * Math.PI * 45;

export default function SavingsRateRing({ rate, size = 72 }: SavingsRateRingProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const clampedRate = Math.max(0, Math.min(100, rate));
  const strokeDash = `${(clampedRate / 100) * CIRCUMFERENCE} ${CIRCUMFERENCE}`;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Circle
          cx="50"
          cy="50"
          r="45"
          stroke={colors.chipBg}
          strokeWidth="10"
          fill="none"
        />
        <Circle
          cx="50"
          cy="50"
          r="45"
          stroke={colors.primary}
          strokeWidth="10"
          fill="none"
          strokeDasharray={strokeDash}
          strokeLinecap="round"
          rotation="-90"
          originX="50"
          originY="50"
        />
      </Svg>
      <View style={styles.labelWrap}>
        <Text style={styles.rateText}>{clampedRate}%</Text>
        <Text style={styles.caption}>saved</Text>
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    labelWrap: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rateText: {
      color: colors.textDark,
      fontSize: fontSize.md,
      fontWeight: fontWeight.bold,
      lineHeight: fontSize.md + 2,
    },
    caption: {
      color: colors.textMuted,
      fontSize: fontSize.xs,
      fontWeight: fontWeight.medium,
      marginTop: 1,
    },
  });
