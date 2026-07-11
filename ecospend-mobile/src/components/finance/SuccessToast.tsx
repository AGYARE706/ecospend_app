import { StyleSheet, Text, View } from 'react-native';

import { fontSize, fontWeight, radius, spacing, useThemedStyles } from '../../theme';
import type { ThemeColors } from '../../theme';

/**
 * message — success message text to display
 */
export interface SuccessToastProps {
  message: string;
}

export default function SuccessToast({ message }: SuccessToastProps) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  container: {
    backgroundColor: colors.successLight,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  message: {
    color: colors.success,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    textAlign: 'center',
  },
});
