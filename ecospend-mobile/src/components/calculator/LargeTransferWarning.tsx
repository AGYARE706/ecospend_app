import { StyleSheet, Text, View } from 'react-native';

import { colors, fontSize, fontWeight, radius, spacing } from '../../theme';

/**
 * Warning banner shown when transfer amount exceeds GHS 10,000.
 */
export interface LargeTransferWarningProps {
  visible: boolean;
}

export default function LargeTransferWarning({ visible }: LargeTransferWarningProps) {
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Large transfer</Text>
      <Text style={styles.message}>
        Amounts above GHS 10,000 may require additional verification with your
        provider. Confirm limits in your MoMo app before sending.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.errorLight,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  title: {
    color: colors.error,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
  },
  message: {
    color: colors.textDark,
    fontSize: fontSize.sm,
  },
});
