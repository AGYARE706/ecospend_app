import { StyleSheet, Text, View } from 'react-native';

export default function GoalsScreen() {
  return (
    <View style={styles.container}>
      <Text>Goals</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
