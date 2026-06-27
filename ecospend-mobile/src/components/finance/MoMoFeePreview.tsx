import { StyleSheet, Text, View } from 'react-native';

import GhsText from '../ui/GhsText';
import { Icon } from '../ui/icons';
import { colors, radius, spacing, typography } from '../../theme';

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
      <View style={styles.icon}>
        <Icon name="info" size={20} color={colors.warning} />
      </View>
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
    marginTop: spacing.xxs,
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
    ...typography.bodySm,
    color: colors.textGrey,
  },
});
