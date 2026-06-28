import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import GhsText from '../ui/GhsText';
import { Icon } from '../ui/icons';
import GoalDeadlineBadge from './GoalDeadlineBadge';
import GoalProgressBar from './GoalProgressBar';
import { cardShadow, colors, fontSize, radius, spacing, typography } from '../../theme';
import {
  formatMonthYear,
  getGoalAccentColors,
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
      <View style={[styles.accentStrip, { backgroundColor: accent.accent }]} />

      <View style={styles.topRow}>
        <View style={[styles.goalIcon, { backgroundColor: accent.background }]}>
          <Icon name="flag-outline" size={18} color={accent.accent} />
        </View>
        <View style={styles.titleBlock}>
          <Text style={styles.name} numberOfLines={1}>
            {goal.name}
          </Text>
          <View style={styles.targetRow}>
            <GhsText amount={goal.currentAmount} variant="income" size="sm" numberOfLines={1} style={styles.targetCurrent} />
            <Text style={styles.targetLabel}> of </Text>
            <GhsText amount={goal.targetAmount} size="sm" numberOfLines={1} style={styles.targetAmount} />
          </View>
        </View>
        <GoalDeadlineBadge goal={goal} />
      </View>

      <GoalProgressBar progress={progress} accentColor={accent.accent} />

      {weeklyTarget !== null && goal.deadline ? (
        <View style={[styles.weeklyRow, { backgroundColor: accent.background }]}>
          <Icon name="calendar-outline" size={fontSize.sm} color={accent.accent} />
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

      <View style={styles.actionRow}>
        <Pressable
          style={({ pressed }) => [
            styles.primaryAction,
            { backgroundColor: accent.accent },
            pressed && styles.actionPressed,
          ]}
          onPress={() => onAddMoney(goal)}
        >
          <Icon name="add" size={18} color={colors.white} />
          <Text style={styles.primaryActionText}>Add Money</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.secondaryAction, pressed && styles.actionPressed]}
          onPress={() => onDetails(goal)}
        >
          <Text style={styles.secondaryActionText}>Details</Text>
          <Icon name="chevron-forward" size={16} color={colors.textMuted} />
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderColor: colors.borderSubtle,
    borderRadius: radius.goalCard,
    borderWidth: 1,
    overflow: 'hidden',
    padding: spacing.lg,
    ...cardShadow,
  },
  accentStrip: {
    height: 4,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
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
  targetRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  targetCurrent: {
    flexShrink: 1,
  },
  targetLabel: {
    ...typography.bodySm,
    color: colors.textGrey,
  },
  targetAmount: {
    color: colors.textGrey,
    flexShrink: 1,
  },
  weeklyRow: {
    alignItems: 'flex-start',
    borderRadius: radius.md,
    flexDirection: 'row',
    marginTop: spacing.sm,
    padding: spacing.sm,
  },
  weeklyText: {
    ...typography.caption,
    color: colors.textGrey,
    flex: 1,
    lineHeight: 18,
    marginLeft: spacing.sm,
  },
  weeklyWarningText: {
    color: colors.warning,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  primaryAction: {
    alignItems: 'center',
    borderRadius: radius.md,
    flex: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    minHeight: 44,
    paddingVertical: spacing.sm,
  },
  primaryActionText: {
    ...typography.label,
    color: colors.white,
  },
  secondaryAction: {
    alignItems: 'center',
    backgroundColor: colors.chipBg,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.xxs,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  secondaryActionText: {
    ...typography.label,
    color: colors.textDark,
  },
  actionPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
});
