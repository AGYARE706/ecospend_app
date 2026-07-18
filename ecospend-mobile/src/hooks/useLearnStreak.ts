import { useCallback, useState } from 'react';

import { getStreak } from '../api/engagementApi';
import type { StreakStats } from '../types/engagement';

const EMPTY_STREAK: StreakStats = { currentStreak: 0, totalActiveDays: 0 };

/** Powers the Dashboard's "Financial Lessons" teaser card. */
export function useLearnStreak() {
  const [streak, setStreak] = useState<StreakStats>(EMPTY_STREAK);

  const refresh = useCallback(async () => {
    try {
      setStreak(await getStreak());
    } catch {
      // Leave whatever was last successfully loaded.
    }
  }, []);

  return { streak, refresh };
}
