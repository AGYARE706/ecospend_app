import { StyleSheet, Text, View } from 'react-native';

export default function VaultScreen() {
  return (
    <View style={styles.container}>
      <Text>Vault</Text>
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
