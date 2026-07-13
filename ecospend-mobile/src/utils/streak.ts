const DAY_MS = 24 * 60 * 60 * 1000;

function toLocalDayNumber(date: Date): number {
  return Math.floor(
    new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() /
      DAY_MS,
  );
}

/**
 * Consecutive-day logging streak derived from transaction dates.
 * The streak ends today, or yesterday when nothing is logged yet today —
 * logging later in the day keeps it alive rather than resetting it.
 */
export function computeSavingsStreak(
  transactionDates: string[],
  now: Date = new Date(),
): number {
  if (transactionDates.length === 0) {
    return 0;
  }

  const loggedDays = new Set<number>();
  for (const iso of transactionDates) {
    const parsed = new Date(iso);
    if (!Number.isNaN(parsed.getTime())) {
      loggedDays.add(toLocalDayNumber(parsed));
    }
  }

  const today = toLocalDayNumber(now);
  let cursor = loggedDays.has(today) ? today : today - 1;

  let streak = 0;
  while (loggedDays.has(cursor)) {
    streak += 1;
    cursor -= 1;
  }

  return streak;
}
