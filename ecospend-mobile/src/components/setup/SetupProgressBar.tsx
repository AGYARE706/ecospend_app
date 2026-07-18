import { StyleSheet, Text, View } from 'react-native';

import { fontSize, fontWeight, radius, spacing, useThemedStyles } from '../../theme';
import type { ThemeColors } from '../../theme';

export interface SetupProgressBarProps {
  step: number;
  total: number;
  label: string;
}

export default function SetupProgressBar({ step, total, label }: SetupProgressBarProps) {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.container}>
      <View style={styles.trackRow}>
        {Array.from({ length: total }, (_, index) => (
          <View
            key={index}
            style={[styles.segment, index < step && styles.segmentActive]}
          />
        ))}
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      marginBottom: spacing.lg,
    },
    trackRow: {
      flexDirection: 'row',
      gap: spacing.xs,
      marginBottom: spacing.sm,
    },
    segment: {
      backgroundColor: colors.border,
      borderRadius: radius.full,
      flex: 1,
      height: 4,
    },
    segmentActive: {
      backgroundColor: colors.primary,
    },
    label: {
      color: colors.textMuted,
      fontSize: fontSize.xs,
      fontWeight: fontWeight.semibold,
      textTransform: 'uppercase',
    },
  });
