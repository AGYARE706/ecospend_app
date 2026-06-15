import { StyleSheet, Text, View } from 'react-native';

import { colors, fontSize, fontWeight, radius, spacing } from '../../theme';
import {
  getDaysRemaining,
  getDeadlineBadgeType,
} from '../../utils/goals';
import type { SavingsGoal } from '../../types';

/**
 * Pill badge showing deadline status for a savings goal.
 */
export interface GoalDeadlineBadgeProps {
  goal: SavingsGoal;
}

export default function GoalDeadlineBadge({ goal }: GoalDeadlineBadgeProps) {
  const badgeType = getDeadlineBadgeType(goal);

  if (badgeType === 'completed') {
    return (
      <View style={[styles.badge, styles.completedBadge]}>
        <Text style={styles.completedText}>✓ Completed</Text>
      </View>
    );
  }

  if (badgeType === 'noDeadline') {
    return (
      <View style={[styles.badge, styles.neutralBadge]}>
        <Text style={styles.neutralText}>No deadline</Text>
      </View>
    );
  }

  if (badgeType === 'overdue') {
    return (
      <View style={[styles.badge, styles.overdueBadge]}>
        <Text style={styles.overdueText}>Overdue</Text>
      </View>
    );
  }

  const days = getDaysRemaining(goal.deadline);
  const label = days === 1 ? '1 day left' : `${days} days left`;

  return (
    <View style={[styles.badge, styles.daysBadge]}>
      <Text style={styles.daysText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  daysBadge: {
    backgroundColor: colors.orangeLight,
  },
  daysText: {
    color: colors.warning,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  neutralBadge: {
    backgroundColor: colors.divider,
  },
  neutralText: {
    color: colors.textGrey,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  overdueBadge: {
    backgroundColor: colors.errorLight,
  },
  overdueText: {
    color: colors.error,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  completedBadge: {
    backgroundColor: colors.primary,
  },
  completedText: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
});
