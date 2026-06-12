import { StyleSheet, View } from 'react-native';

import { colors } from '../theme/colors';

export default function SummarySkeleton() {
  return (
    <View style={styles.container}>
      <View style={styles.placeholder} />
      <View style={styles.placeholder} />
      <View style={styles.placeholder} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  placeholder: {
    height: 100,
    borderRadius: 12,
    backgroundColor: colors.skeleton,
  },
});
