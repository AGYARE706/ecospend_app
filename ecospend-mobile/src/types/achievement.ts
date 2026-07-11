import type { Ionicons } from '@expo/vector-icons';

export type AchievementId =
  | 'first_goal_achieved'
  | 'first_vault_created'
  | 'first_vault_matured'
  | 'thirty_day_streak'
  | 'hundred_transactions';

export interface AchievementDefinition {
  id: AchievementId;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBackground: string;
  accentColor: string;
  target: number;
}

export interface AchievementProgress extends AchievementDefinition {
  current: number;
  unlocked: boolean;
  progressPercent: number;
  unlockedLabel?: string;
}

export interface StreakStats {
  daysActive: number;
  savingsConsistency: number;
  consistencyLabel: string;
  nextMilestone: number;
}

export interface BadgesAndStreaksData {
  streak: StreakStats;
  unlockedAchievements: AchievementProgress[];
  lockedAchievements: AchievementProgress[];
  totalAchievements: number;
  unlockedCount: number;
}
