import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import AppButton from '../ui/AppButton';
import GhsText from '../ui/GhsText';
import GoalDeadlineBadge from './GoalDeadlineBadge';
import GoalProgressBar from './GoalProgressBar';
import { cardShadow, colors, fontSize, fontWeight, radius, spacing } from '../../theme';
import {
  formatMonthYear,
  getGoalProgress,
  getWeeklyTarget,
} from '../../utils/goals';
import type { SavingsGoal } from '../../types';

/**
 * Active savings goal card with progress, weekly target, and action buttons.
 */
export interface GoalCardProps {
  goal: SavingsGoal;
  index: number;
  onAddMoney: (goal: SavingsGoal) => void;
  onDetails: (goal: SavingsGoal) => void;
}

export default function GoalCard({
  goal,
  index,
  onAddMoney,
  onDetails,
}: GoalCardProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progress = getGoalProgress(goal);
  const weeklyTarget = getWeeklyTarget(goal);
  const isHighWeeklyTarget =
    weeklyTarget !== null && weeklyTarget > goal.targetAmount * 0.5;

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

      <GoalProgressBar progress={progress} />

      {weeklyTarget !== null && goal.deadline ? (
        <View style={styles.weeklyRow}>
          <Ionicons
            name="calendar-outline"
            size={fontSize.sm}
            color={colors.textGrey}
          />
          <Text
            style={[
              styles.weeklyText,
              isHighWeeklyTarget && styles.weeklyWarningText,
            ]}
          >
            Save GHS {weeklyTarget.toFixed(2)}/week to reach your goal by{' '}
            {formatMonthYear(goal.deadline)}
          </Text>
        </View>
      ) : null}

      <View style={styles.divider} />

      <View style={styles.actionRow}>
        <AppButton
          title="Add Money"
          variant="outline"
          onPress={() => onAddMoney(goal)}
          style={styles.addMoneyButton}
        />
        <AppButton
          title="Details"
          variant="ghost"
          onPress={() => onDetails(goal)}
          style={styles.detailsButton}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
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
  weeklyRow: {
    alignItems: 'flex-start',
    backgroundColor: colors.pageBackground,
    borderRadius: radius.sm,
    flexDirection: 'row',
    marginTop: spacing.sm,
    padding: spacing.sm,
  },
  weeklyText: {
    color: colors.textGrey,
    flex: 1,
    fontSize: fontSize.xs,
    marginLeft: spacing.sm,
  },
  weeklyWarningText: {
    color: colors.warning,
  },
  divider: {
    backgroundColor: colors.divider,
    height: 1,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  addMoneyButton: {
    flex: 0.6,
  },
  detailsButton: {
    flex: 0.4,
  },
});
