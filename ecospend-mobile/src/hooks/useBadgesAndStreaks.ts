import { useCallback, useEffect, useState } from 'react';

import { getBadges, getStreak } from '../api/engagementApi';
import type { Badge, StreakStats } from '../types/engagement';

export interface BadgesAndStreaksData {
  streak: StreakStats;
  unlockedAchievements: Badge[];
  lockedAchievements: Badge[];
  totalAchievements: number;
  unlockedCount: number;
  refresh: () => Promise<void>;
}

const EMPTY_STREAK: StreakStats = { currentStreak: 0, totalActiveDays: 0 };

/** Real badges/streaks, sourced from engagement-service — no more hardcoded "12". */
export function useBadgesAndStreaks(): BadgesAndStreaksData {
  const [streak, setStreak] = useState<StreakStats>(EMPTY_STREAK);
  const [badges, setBadges] = useState<Badge[]>([]);

  const refresh = useCallback(async () => {
    try {
      const [streakResult, badgesResult] = await Promise.all([getStreak(), getBadges()]);
      setStreak(streakResult);
      setBadges(badgesResult);
    } catch {
      // Leave whatever was last successfully loaded on screen.
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const unlockedAchievements = badges.filter((badge) => badge.unlocked);
  const lockedAchievements = badges.filter((badge) => !badge.unlocked);

  return {
    streak,
    unlockedAchievements,
    lockedAchievements,
    totalAchievements: badges.length,
    unlockedCount: unlockedAchievements.length,
    refresh,
  };
}
