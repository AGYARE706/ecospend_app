import type { ThemeColors } from '../theme';
import type { GoalColorKey, SavingsGoal } from '../types';

export type DeadlineBadgeType =
  | 'daysLeft'
  | 'noDeadline'
  | 'overdue'
  | 'completed';

/**
 * Completion is permanent once reached (mirrors the backend: completedAt is
 * only ever set, never cleared) — so this checks the persistent flag rather
 * than recomputing from the live balance, which would go back to "false"
 * the moment a completed goal is withdrawn from.
 */
export function isGoalCompleted(goal: SavingsGoal): boolean {
  return goal.completedAt != null;
}

export function getGoalProgress(goal: SavingsGoal): number {
  if (goal.targetAmount <= 0) {
    return 0;
  }

  return Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100);
}

export function getDaysRemaining(deadline: string | null): number | null {
  if (!deadline) {
    return null;
  }

  const now = new Date();
  const target = new Date(deadline);
  const diffMs = target.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function getDeadlineBadgeType(goal: SavingsGoal): DeadlineBadgeType {
  if (isGoalCompleted(goal)) {
    return 'completed';
  }

  if (!goal.deadline) {
    return 'noDeadline';
  }

  const days = getDaysRemaining(goal.deadline);
  if (days === null) {
    return 'noDeadline';
  }

  if (days < 0) {
    return 'overdue';
  }

  return 'daysLeft';
}

export function getWeeklyTarget(goal: SavingsGoal): number | null {
  if (!goal.deadline || isGoalCompleted(goal)) {
    return null;
  }

  const daysRemaining = getDaysRemaining(goal.deadline);
  if (daysRemaining === null || daysRemaining <= 0) {
    return null;
  }

  const weeksRemaining = daysRemaining / 7;
  const remainingAmount = goal.targetAmount - goal.currentAmount;

  if (remainingAmount <= 0 || weeksRemaining <= 0) {
    return null;
  }

  return remainingAmount / weeksRemaining;
}

export function getProjectedWeekly(targetAmount: number): number {
  return targetAmount / 12;
}

export function getRemainingAmount(goal: SavingsGoal): number {
  return Math.max(goal.targetAmount - goal.currentAmount, 0);
}

export function capContributionAmount(goal: SavingsGoal, amount: number): number {
  return Math.min(amount, getRemainingAmount(goal));
}

export function formatMonthYear(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-GH', {
    month: 'long',
    year: 'numeric',
  });
}

export function formatCompletedDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-GH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function getGoalAccentColors(colorKey: GoalColorKey, colors: ThemeColors): {
  background: string;
  accent: string;
} {
  switch (colorKey) {
    case 'blueLight':
      return { background: colors.blueLight, accent: colors.blue };
    case 'warningLight':
      return { background: colors.warningLight, accent: colors.warning };
    case 'successLight':
      return { background: colors.successLight, accent: colors.success };
    case 'primaryBackground':
    default:
      return { background: colors.primaryBackground, accent: colors.primary };
  }
}

export function getProgressFillColor(progress: number): 'low' | 'mid' | 'high' {
  if (progress >= 80) {
    return 'high';
  }

  if (progress >= 40) {
    return 'mid';
  }

  return 'low';
}
