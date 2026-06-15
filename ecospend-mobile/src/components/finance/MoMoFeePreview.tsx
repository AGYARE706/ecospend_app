import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import GhsText from '../ui/GhsText';
import { colors, fontSize, fontWeight, radius, spacing } from '../../theme';

/**
 * providerFee — calculated provider fee amount
 * totalCost — total amount including fee
 */
export interface MoMoFeePreviewProps {
  providerFee: number;
  totalCost: number;
}

export default function MoMoFeePreview({
  providerFee,
  totalCost,
}: MoMoFeePreviewProps) {
  return (
    <View style={styles.container}>
      <Ionicons
        name="information-circle-outline"
        size={fontSize.lg}
        color={colors.warning}
        style={styles.icon}
      />
      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.label}>Provider fee: </Text>
          <GhsText amount={providerFee} size="sm" />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Total cost: </Text>
          <GhsText amount={totalCost} size="sm" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    backgroundColor: colors.warningLight,
    borderRadius: radius.md,
    flexDirection: 'row',
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  icon: {
    marginRight: spacing.sm,
    marginTop: spacing.xs,
  },
  content: {
    flex: 1,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  label: {
    color: colors.textGrey,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
});
