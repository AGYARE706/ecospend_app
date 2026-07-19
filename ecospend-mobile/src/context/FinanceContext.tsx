import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import * as financeApi from '../api/financeApi';
import { getApiErrorMessage } from '../api/getApiErrorMessage';
import { useAuth } from './AuthContext';
import type { MonthlySummary, Transaction } from '../types';
import { computeSummary } from '../utils/transactions';

/**
 * Transactions are written exclusively by the backend when real money
 * moves through Paystack/the wallet, and are immutable afterwards —
 * there is intentionally no add or update here.
 */
interface FinanceContextValue {
  transactions: Transaction[];
  loading: boolean;
  refreshTransactions: () => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  getTransactionById: (id: string) => Transaction | undefined;
  getMonthlySummary: () => MonthlySummary;
  /** Expected fixed income per month; 0 = not set. */
  incomeTarget: number;
  setIncomeTarget: (monthlyAmount: number) => Promise<void>;
}

const FinanceContext = createContext<FinanceContextValue | undefined>(undefined);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [incomeTarget, setIncomeTargetState] = useState(0);
  const [loading, setLoading] = useState(false);

  const refreshTransactions = useCallback(async () => {
    if (!isAuthenticated) {
      setTransactions([]);
      setSummary(null);
      setIncomeTargetState(0);
      return;
    }

    setLoading(true);
    try {
      const now = new Date();
      const [list, monthly, target] = await Promise.all([
        financeApi.listTransactions(),
        financeApi.getTransactionSummary(now.getMonth() + 1, now.getFullYear()),
        financeApi.getIncomeTarget(),
      ]);
      setTransactions(list);
      setSummary(monthly);
      setIncomeTargetState(target);
    } catch (error) {
      console.warn('Failed to load finance data', getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const setIncomeTarget = useCallback(async (monthlyAmount: number) => {
    const saved = await financeApi.setIncomeTarget(monthlyAmount);
    setIncomeTargetState(saved);
  }, []);

  useEffect(() => {
    void refreshTransactions();
  }, [refreshTransactions]);

  const deleteTransaction = useCallback(
    async (id: string) => {
      await financeApi.deleteTransaction(id);
      setTransactions((current) => current.filter((item) => item.id !== id));
      void refreshTransactions();
    },
    [refreshTransactions],
  );

  const getTransactionById = useCallback(
    (id: string) => transactions.find((item) => item.id === id),
    [transactions],
  );

  const getMonthlySummary = useCallback((): MonthlySummary => {
    if (summary) {
      return summary;
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthTransactions = transactions.filter((item) => {
      const date = new Date(item.date);
      return (
        date.getMonth() === currentMonth && date.getFullYear() === currentYear
      );
    });
    const monthSummary = computeSummary(monthTransactions);
    const allTime = computeSummary(transactions);

    return {
      totalIncome: monthSummary.income,
      totalExpense: monthSummary.expense,
      netBalance: allTime.net,
      transactionCount: monthTransactions.length,
    };
  }, [summary, transactions]);

  const value = useMemo(
    () => ({
      transactions,
      loading,
      refreshTransactions,
      deleteTransaction,
      getTransactionById,
      getMonthlySummary,
      incomeTarget,
      setIncomeTarget,
    }),
    [
      deleteTransaction,
      getMonthlySummary,
      getTransactionById,
      incomeTarget,
      loading,
      refreshTransactions,
      setIncomeTarget,
      transactions,
    ],
  );

  return (
    <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
  );
}

export function useFinance(): FinanceContextValue {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}
