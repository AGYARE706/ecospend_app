import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import GhsText from '../ui/GhsText';
import { cardShadow, colors, fontSize, fontWeight, radius, spacing } from '../../theme';

/**
 * Summary stat card showing active goal count and total saved amount.
 */
export interface GoalsSummaryBarProps {
  activeGoalCount: number;
  totalSaved: number;
}

export default function GoalsSummaryBar({
  activeGoalCount,
  totalSaved,
}: GoalsSummaryBarProps) {
  return (
    <View style={styles.card}>
      <View style={styles.segment}>
        <Ionicons name="flag-outline" size={fontSize.md} color={colors.primary} />
        <Text style={styles.segmentLabel}>Active</Text>
        <Text style={styles.segmentValue}>{activeGoalCount}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.segment}>
        <Ionicons name="wallet-outline" size={fontSize.md} color={colors.blue} />
        <Text style={styles.segmentLabel}>Total saved</Text>
        <GhsText amount={totalSaved} size="sm" style={styles.savedAmount} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    flexDirection: 'row',
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
    ...cardShadow,
  },
  segment: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.xs,
  },
  segmentLabel: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    textTransform: 'uppercase',
  },
  segmentValue: {
    color: colors.primary,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  savedAmount: {
    color: colors.blue,
  },
  divider: {
    backgroundColor: colors.divider,
    width: 1,
  },
});
