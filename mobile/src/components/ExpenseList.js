import { StyleSheet, Text, View } from 'react-native';

export default function ExpenseList({ expenses = [] }) {
  return (
    <View style={styles.container}>
      {expenses.length === 0 ? (
        <Text style={styles.empty}>No expenses yet</Text>
      ) : (
        expenses.map((item) => (
          <Text key={item.id}>{item.category}: ${item.amount}</Text>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  empty: { color: '#999' },
});
