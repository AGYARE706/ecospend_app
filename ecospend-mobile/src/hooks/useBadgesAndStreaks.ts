import { useMemo } from 'react';

import { ACHIEVEMENT_DEFINITIONS, ACHIEVEMENT_ORDER } from '../constants/achievements';
import { useFinance } from '../context/FinanceContext';
import { mockGroupVaults } from '../data/mock/groupVaults';
import { mockSavingsGoals } from '../data/mock/mockData';
import { mockVaults } from '../data/mock/vaults';
import type {
  AchievementProgress,
  BadgesAndStreaksData,
  StreakStats,
} from '../types/achievement';

interface AchievementMetrics {
  goalsCompleted: number;
  vaultsCreated: number;
  vaultsMatured: number;
  daysActive: number;
  transactionsLogged: number;
}

function getAchievementMetrics(): AchievementMetrics {
  const goalsCompleted = mockSavingsGoals.filter(
    (goal) => goal.completedAt != null,
  ).length;

  const vaultsCreated = mockVaults.length + mockGroupVaults.length;
  const vaultsMatured = mockVaults.filter(
    (vault) => vault.status === 'matured' || vault.status === 'withdrawn',
  ).length;

  return {
    goalsCompleted,
    vaultsCreated,
    vaultsMatured,
    daysActive: 12,
    transactionsLogged: 0,
  };
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
): AchievementProgress[] {
  return ACHIEVEMENT_ORDER.map((id) => {
    const definition = ACHIEVEMENT_DEFINITIONS.find((item) => item.id === id)!;
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

  return useMemo(() => {
    const metrics = getAchievementMetrics();
    metrics.transactionsLogged = transactions.length;

    const achievements = buildAchievementProgress(metrics);
    const unlockedAchievements = achievements.filter((item) => item.unlocked);
    const lockedAchievements = achievements.filter((item) => !item.unlocked);

    return {
      streak: buildStreakStats(metrics),
      unlockedAchievements,
      lockedAchievements,
      totalAchievements: achievements.length,
      unlockedCount: unlockedAchievements.length,
    };
  }, [transactions.length]);
}
