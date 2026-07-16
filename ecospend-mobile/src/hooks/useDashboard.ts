import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from '../context/AuthContext';
import { useEnvelopes } from '../context/EnvelopesContext';
import { useFinance } from '../context/FinanceContext';
import { useWallet } from '../context/WalletContext';
import { MOCK_LOADING_DELAY_MS, mockUser } from '../data/mock/mockData';
import type { DashboardAnalytics, WeeklyInsight } from '../types';
import { computeDashboardAnalytics } from '../utils/dashboardAnalytics';
import { formatHeaderDate, getFirstName } from '../utils/formatDate';
import { capitalizeWords } from '../utils/strings';
import {
  computeWeeklyInsight,
  getRecentTransactions,
} from '../utils/transactions';

export function useDashboard() {
  const { user } = useAuth();
  const { transactions, getMonthlySummary, refreshTransactions } = useFinance();
  const { balance: walletBalance, refreshWallet } = useWallet();
  const { dashboardEnvelopes, refreshEnvelopes } = useEnvelopes();
  const [loading, setLoading] = useState(true);

  // Called on screen focus so the home tab never shows stale data after
  // a transaction, budget change, or wallet move made elsewhere.
  const refresh = useCallback(async () => {
    await Promise.all([refreshTransactions(), refreshWallet(), refreshEnvelopes()]);
  }, [refreshEnvelopes, refreshTransactions, refreshWallet]);

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
    userName: capitalizeWords(getFirstName(displayName)),
    todayLabel: formatHeaderDate(new Date()),
    // The hero number is the real wallet balance; income/expense stay
    // as this month's tracked flows.
    balance: walletBalance ?? 0,
    income: summary.totalIncome,
    expense: summary.totalExpense,
    recentTransactions,
    budgetEnvelopes: dashboardEnvelopes,
    weeklyInsight,
    analytics,
    loading,
    refresh,
  };
}
