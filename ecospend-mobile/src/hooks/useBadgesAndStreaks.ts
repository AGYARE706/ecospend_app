import { useMemo } from 'react';

import { getAchievementDefinitions, ACHIEVEMENT_ORDER } from '../constants/achievements';
import { useFinance } from '../context/FinanceContext';
import { useGoals } from '../context/GoalsContext';
import { useTheme } from '../context/ThemeContext';
import { useVaults } from '../context/VaultContext';
import type { ThemeColors } from '../theme';
import type {
  AchievementProgress,
  BadgesAndStreaksData,
  StreakStats,
} from '../types/achievement';
import { computeSavingsStreak } from '../utils/streak';

interface AchievementMetrics {
  goalsCompleted: number;
  vaultsCreated: number;
  vaultsMatured: number;
  daysActive: number;
  transactionsLogged: number;
}

function getMetricValue(
  id: AchievementProgress['id'],
  metrics: AchievementMetrics,
): number {
  switch (id) {
    case 'first_goal_achieved':
      return metrics.goalsCompleted;
    case 'first_vault_created':
      return metrics.vaultsCreated;
    case 'first_vault_matured':
      return metrics.vaultsMatured;
    case 'thirty_day_streak':
      return metrics.daysActive;
    case 'hundred_transactions':
      return metrics.transactionsLogged;
    default:
      return 0;
  }
}

function buildAchievementProgress(
  metrics: AchievementMetrics,
  colors: ThemeColors,
): AchievementProgress[] {
  const definitions = getAchievementDefinitions(colors);
  return ACHIEVEMENT_ORDER.map((id) => {
    const definition = definitions.find((item) => item.id === id)!;
    const current = getMetricValue(id, metrics);
    const unlocked = current >= definition.target;
    const progressPercent = Math.min(
      Math.round((current / definition.target) * 100),
      100,
    );

    return {
      ...definition,
      current,
      unlocked,
      progressPercent,
      unlockedLabel: unlocked ? 'Earned' : undefined,
    };
  });
}

function buildStreakStats(metrics: AchievementMetrics): StreakStats {
  const savingsConsistency = Math.min(
    Math.round((metrics.daysActive / 30) * 100),
    100,
  );

  let consistencyLabel = 'Building momentum';
  if (savingsConsistency >= 80) {
    consistencyLabel = 'Excellent consistency';
  } else if (savingsConsistency >= 50) {
    consistencyLabel = 'Strong habit forming';
  }

  return {
    daysActive: metrics.daysActive,
    savingsConsistency,
    consistencyLabel,
    nextMilestone: 30,
  };
}

export function useBadgesAndStreaks(): BadgesAndStreaksData {
  const { transactions } = useFinance();
  const { completedGoals } = useGoals();
  const { vaults, groupVaults } = useVaults();
  const { colors } = useTheme();

  return useMemo(() => {
    const metrics: AchievementMetrics = {
      goalsCompleted: completedGoals.length,
      vaultsCreated: vaults.length + groupVaults.length,
      vaultsMatured: vaults.filter(
        (vault) => vault.status === 'matured' || vault.status === 'withdrawn',
      ).length,
      daysActive: computeSavingsStreak(
        transactions.map((transaction) => transaction.date),
      ),
      transactionsLogged: transactions.length,
    };

    const achievements = buildAchievementProgress(metrics, colors);
    const unlockedAchievements = achievements.filter((item) => item.unlocked);
    const lockedAchievements = achievements.filter((item) => !item.unlocked);

    return {
      streak: buildStreakStats(metrics),
      unlockedAchievements,
      lockedAchievements,
      totalAchievements: achievements.length,
      unlockedCount: unlockedAchievements.length,
    };
  }, [
    colors,
    completedGoals.length,
    groupVaults.length,
    transactions,
    vaults,
  ]);
}
