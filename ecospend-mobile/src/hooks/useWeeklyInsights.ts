import { useMemo } from 'react';

import { useFinance } from '../context/FinanceContext';
import { computeWeeklyInsights } from '../utils/weeklyInsights';

export function useWeeklyInsights() {
  const { transactions } = useFinance();

  const data = useMemo(
    () => computeWeeklyInsights(transactions),
    [transactions],
  );

  return data;
}
