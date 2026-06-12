import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';

export interface StatCardProps {
  label: string;
  value: string;
  labelColor: string;
  valueColor?: string;
}

export default function StatCard({
  label,
  value,
  labelColor,
  valueColor,
}: StatCardProps) {
  return (
    <View style={[styles.card, { borderLeftColor: labelColor }]}>
      <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
      <Text style={[styles.value, { color: valueColor ?? colors.text }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    borderRadius: 12,
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
