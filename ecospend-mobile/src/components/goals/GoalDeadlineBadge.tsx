import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '../ui/icons';
import { colors, radius, spacing, typography } from '../../theme';
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
        <Icon name="checkmark" size={12} color={colors.white} strokeWidth={2.4} />
        <Text style={styles.completedText}>Done</Text>
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
        <Icon name="alert-circle" size={12} color={colors.error} />
        <Text style={styles.overdueText}>Overdue</Text>
      </View>
    );
  }

  const days = getDaysRemaining(goal.deadline);
  const label = days === 1 ? '1 day left' : `${days} days left`;

  return (
    <View style={[styles.badge, styles.daysBadge]}>
      <Icon name="time-outline" size={12} color={colors.warning} />
      <Text style={styles.daysText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    borderRadius: radius.full,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  daysBadge: {
    backgroundColor: colors.orangeLight,
  },
  daysText: {
    ...typography.overline,
    color: colors.warning,
    letterSpacing: 0,
  },
  neutralBadge: {
    backgroundColor: colors.chipBg,
  },
  neutralText: {
    ...typography.caption,
    color: colors.textGrey,
  },
  overdueBadge: {
    backgroundColor: colors.errorLight,
  },
  overdueText: {
    ...typography.overline,
    color: colors.error,
    letterSpacing: 0,
  },
  completedBadge: {
    backgroundColor: colors.primary,
  },
  completedText: {
    ...typography.overline,
    color: colors.white,
    letterSpacing: 0,
  },
});
