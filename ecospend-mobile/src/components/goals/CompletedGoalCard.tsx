import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import GhsText from '../ui/GhsText';
import { Icon } from '../ui/icons';
import GoalDeadlineBadge from './GoalDeadlineBadge';
import GoalProgressBar from './GoalProgressBar';
import { cardShadow, colors, radius, spacing, typography } from '../../theme';
import {
  formatCompletedDate,
  getGoalAccentColors,
  getGoalProgress,
} from '../../utils/goals';
import type { SavingsGoal } from '../../types';

/**
 * Completed savings goal card with green tint and simplified layout.
 */
export interface CompletedGoalCardProps {
  goal: SavingsGoal;
  index: number;
}

export default function CompletedGoalCard({ goal, index }: CompletedGoalCardProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progress = getGoalProgress(goal);
  const completedDate = goal.completedAt ?? goal.createdAt;
  const accent = getGoalAccentColors(goal.color);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      delay: index * 100,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, index]);

  return (
    <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
      <View style={styles.topRow}>
        <View style={[styles.goalIcon, { backgroundColor: colors.successLight }]}>
          <Icon name="trophy-outline" size={18} color={colors.success} />
        </View>
        <View style={styles.titleBlock}>
          <Text style={styles.name} numberOfLines={1}>
            {goal.name}
          </Text>
          <View style={styles.amountRow}>
            <GhsText amount={goal.currentAmount} variant="income" size="sm" />
            <Text style={styles.savedLabel}> saved</Text>
          </View>
        </View>
        <GoalDeadlineBadge goal={goal} />
      </View>

      <GoalProgressBar
        progress={progress}
        animate={false}
        forceHighColor
        accentColor={colors.success}
      />

      <View style={[styles.completedBanner, { backgroundColor: accent.background }]}>
        <Icon name="checkmark-circle" size={16} color={colors.success} />
        <Text style={styles.completedDate}>
          Completed on {formatCompletedDate(completedDate)}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderColor: colors.successLight,
    borderRadius: radius.goalCard,
    borderWidth: 1,
    padding: spacing.lg,
    ...cardShadow,
  },
  topRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  goalIcon: {
    alignItems: 'center',
    borderRadius: radius.md,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    ...typography.subheading,
    color: colors.textDark,
    marginBottom: spacing.xs,
  },
  amountRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  savedLabel: {
    ...typography.label,
    color: colors.primary,
  },
  completedBanner: {
    alignItems: 'center',
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  completedDate: {
    ...typography.bodySm,
    color: colors.textGrey,
    flex: 1,
  },
});
