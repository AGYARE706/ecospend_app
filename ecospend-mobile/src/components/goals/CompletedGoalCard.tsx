import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import GhsText from '../ui/GhsText';
import { Icon } from '../ui/icons';
import GoalDeadlineBadge from './GoalDeadlineBadge';
import GoalProgressBar from './GoalProgressBar';
import {
  cardShadow,
  pressScale,
  radius,
  spacing,
  typography,
  useTheme,
  useThemedStyles,
} from '../../theme';
import type { ThemeColors } from '../../theme';
import {
  formatCompletedDate,
  getGoalAccentColors,
  getGoalProgress,
} from '../../utils/goals';
import type { SavingsGoal } from '../../types';

/**
 * Completed savings goal card with green tint and simplified layout.
 * Tappable — completed goals only surface a withdraw action on the
 * details screen, so this is the sole path back in from the list.
 */
export interface CompletedGoalCardProps {
  goal: SavingsGoal;
  index: number;
  onPress?: (goal: SavingsGoal) => void;
}

export default function CompletedGoalCard({ goal, index, onPress }: CompletedGoalCardProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progress = getGoalProgress(goal);
  const completedDate = goal.completedAt ?? goal.createdAt;
  const accent = getGoalAccentColors(goal.color, colors);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      delay: index * 100,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, index]);

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}
        onPress={() => onPress?.(goal)}
        accessibilityRole="button"
        accessibilityLabel={`View ${goal.name} — completed, ready to withdraw`}
      >
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
            Completed on {formatCompletedDate(completedDate)} — tap to withdraw
          </Text>
          <Icon name="chevron-forward" size={16} color={colors.success} />
        </View>
      </Pressable>
    </Animated.View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderColor: colors.successLight,
    borderRadius: radius.goalCard,
    borderWidth: 1,
    padding: spacing.lg,
    ...cardShadow,
  },
  pressed: {
    opacity: 0.96,
    transform: [{ scale: pressScale.card }],
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
