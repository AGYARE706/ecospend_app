import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import GhsText from '../ui/GhsText';
import GoalDeadlineBadge from './GoalDeadlineBadge';
import GoalProgressBar from './GoalProgressBar';
import { cardShadow, colors, fontSize, fontWeight, radius, spacing } from '../../theme';
import { formatCompletedDate, getGoalProgress } from '../../utils/goals';
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
        <Text style={styles.name} numberOfLines={1}>
          {goal.name}
        </Text>
        <GoalDeadlineBadge goal={goal} />
      </View>

      <View style={styles.amountRow}>
        <GhsText amount={goal.currentAmount} variant="income" size="md" />
        <Text style={styles.savedLabel}> saved</Text>
      </View>
      <View style={styles.targetRow}>
        <Text style={styles.targetLabel}>of </Text>
        <GhsText amount={goal.targetAmount} size="sm" style={styles.targetAmount} />
        <Text style={styles.targetLabel}> goal</Text>
      </View>

      <GoalProgressBar progress={progress} animate={false} forceHighColor />

      <Text style={styles.completedDate}>
        Completed on {formatCompletedDate(completedDate)}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.goalCompletedTint,
    borderRadius: radius.goalCard,
    padding: spacing.lg,
    ...cardShadow,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  name: {
    color: colors.textDark,
    flex: 1,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    marginRight: spacing.sm,
  },
  amountRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  savedLabel: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  targetRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  targetLabel: {
    color: colors.textGrey,
    fontSize: fontSize.sm,
  },
  targetAmount: {
    color: colors.textGrey,
  },
  completedDate: {
    color: colors.textGrey,
    fontSize: fontSize.sm,
    marginTop: spacing.sm,
  },
});
