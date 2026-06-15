import { StyleSheet, Text, View } from 'react-native';

import { colors, fontSize, fontWeight, radius, spacing } from '../../theme';

/**
 * Fixed top toast for budget envelope success messages.
 */
export interface EnvelopeToastProps {
  message: string;
}

export default function EnvelopeToast({ message }: EnvelopeToastProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.successLight,
    borderRadius: radius.md,
    left: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    position: 'absolute',
    right: spacing.lg,
    top: spacing.sm,
    zIndex: 10,
  },
  message: {
    color: colors.success,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    textAlign: 'center',
  },
});
