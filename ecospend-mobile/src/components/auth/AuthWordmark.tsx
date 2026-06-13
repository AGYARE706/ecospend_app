import { StyleSheet, Text, View } from 'react-native';

import { colors, fontSize, fontWeight, spacing } from '../../theme';

export default function AuthWordmark() {
  return (
    <View style={styles.container}>
      <Text style={styles.wordmark}>EcoSpend</Text>
      <Text style={styles.leaf}>🌿</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.xl,
  },
  wordmark: {
    color: colors.primary,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  leaf: {
    fontSize: fontSize.lg,
    marginLeft: spacing.xs,
  },
});
