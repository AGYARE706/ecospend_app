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
import type {
  AddTransactionPayload,
  MonthlySummary,
  Transaction,
} from '../types';
import { computeSummary } from '../utils/transactions';

export type UpdateTransactionPayload = Partial<
  Omit<AddTransactionPayload, 'date'>
> & {
  date?: string;
};

interface FinanceContextValue {
  transactions: Transaction[];
  loading: boolean;
  refreshTransactions: () => Promise<void>;
  addTransaction: (payload: AddTransactionPayload) => Promise<Transaction>;
  updateTransaction: (
    id: string,
    payload: UpdateTransactionPayload,
  ) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  getTransactionById: (id: string) => Transaction | undefined;
  getMonthlySummary: () => MonthlySummary;
}

const FinanceContext = createContext<FinanceContextValue | undefined>(undefined);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshTransactions = useCallback(async () => {
    if (!isAuthenticated) {
      setTransactions([]);
      setSummary(null);
      return;
    }

    setLoading(true);
    try {
      const now = new Date();
      const [list, monthly] = await Promise.all([
        financeApi.listTransactions(),
        financeApi.getTransactionSummary(now.getMonth() + 1, now.getFullYear()),
      ]);
      setTransactions(list);
      setSummary(monthly);
    } catch (error) {
      console.warn('Failed to load finance data', getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void refreshTransactions();
  }, [refreshTransactions]);

  const addTransaction = useCallback(
    async (payload: AddTransactionPayload): Promise<Transaction> => {
      const created = await financeApi.createTransaction(payload);
      setTransactions((current) => [created, ...current]);
      void refreshTransactions();
      return created;
    },
    [refreshTransactions],
  );

  const updateTransaction = useCallback(
    async (id: string, payload: UpdateTransactionPayload) => {
      const updated = await financeApi.updateTransaction(id, payload);
      setTransactions((current) =>
        current.map((item) => (item.id === id ? updated : item)),
      );
      void refreshTransactions();
    },
    [refreshTransactions],
  );

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
      addTransaction,
      updateTransaction,
      deleteTransaction,
      getTransactionById,
      getMonthlySummary,
    }),
    [
      addTransaction,
      deleteTransaction,
      getMonthlySummary,
      getTransactionById,
      loading,
      refreshTransactions,
      transactions,
      updateTransaction,
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
