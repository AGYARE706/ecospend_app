import { useEffect, useMemo, useState } from 'react';

import { useAuth } from '../context/AuthContext';
import { useEnvelopes } from '../context/EnvelopesContext';
import { useFinance } from '../context/FinanceContext';
import { MOCK_LOADING_DELAY_MS, mockUser } from '../data/mock/mockData';
import type { DashboardAnalytics, WeeklyInsight } from '../types';
import { computeDashboardAnalytics } from '../utils/dashboardAnalytics';
import { formatHeaderDate, getFirstName } from '../utils/formatDate';
import {
  computeWeeklyInsight,
  getRecentTransactions,
} from '../utils/transactions';

export function useDashboard() {
  const { user } = useAuth();
  const { transactions, getMonthlySummary } = useFinance();
  const { dashboardEnvelopes } = useEnvelopes();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), MOCK_LOADING_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const displayName = user?.name ?? mockUser.name;
  const summary = getMonthlySummary();
  const recentTransactions = useMemo(
    () => getRecentTransactions(transactions, 5),
    [transactions],
  );
  const weeklyInsight = useMemo(
    (): WeeklyInsight => computeWeeklyInsight(transactions),
    [transactions],
  );
  const analytics = useMemo(
    (): DashboardAnalytics => computeDashboardAnalytics(transactions),
    [transactions],
  );

  return {
    userName: getFirstName(displayName),
    todayLabel: formatHeaderDate(new Date()),
    balance: summary.netBalance,
    income: summary.totalIncome,
    expense: summary.totalExpense,
    recentTransactions,
    budgetEnvelopes: dashboardEnvelopes,
    weeklyInsight,
    analytics,
    loading,
  };
}
