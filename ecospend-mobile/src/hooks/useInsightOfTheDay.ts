import { useCallback, useState } from 'react';

import { getInsightOfTheDay, type DailyInsight } from '../api/coachApi';

/** Null means either "not loaded yet" or "coach not configured" — callers should just hide the card. */
export function useInsightOfTheDay() {
  const [insight, setInsight] = useState<DailyInsight | null>(null);

  const refresh = useCallback(async () => {
    try {
      setInsight(await getInsightOfTheDay());
    } catch {
      setInsight(null);
    }
  }, []);

  return { insight, refresh };
}
