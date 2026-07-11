import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import { mockTransactions } from '../data/mock/mockData';
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
  addTransaction: (payload: AddTransactionPayload) => void;
  updateTransaction: (id: string, payload: UpdateTransactionPayload) => void;
  deleteTransaction: (id: string) => void;
  getTransactionById: (id: string) => Transaction | undefined;
  getMonthlySummary: () => MonthlySummary;
}

const FinanceContext = createContext<FinanceContextValue | undefined>(undefined);

function createTransactionId(): string {
  return `tx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);

  const addTransaction = useCallback((payload: AddTransactionPayload) => {
    const newTransaction: Transaction = {
      id: createTransactionId(),
      type: payload.type,
      amount: payload.amount,
      category: payload.category,
      provider: payload.provider,
      notes: payload.notes,
      date: payload.date,
    };

    setTransactions((current) => [newTransaction, ...current]);
  }, []);

  const updateTransaction = useCallback(
    (id: string, payload: UpdateTransactionPayload) => {
      setTransactions((current) =>
        current.map((item) => {
          if (item.id !== id) {
            return item;
          }

          const next: Transaction = {
            ...item,
            ...payload,
            provider:
              payload.type === 'income'
                ? undefined
                : (payload.provider ?? item.provider),
          };

          if (payload.type === 'income') {
            next.provider = undefined;
          }

          return next;
        }),
      );
    },
    [],
  );

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((current) => current.filter((item) => item.id !== id));
  }, []);

  const getTransactionById = useCallback(
    (id: string) => transactions.find((item) => item.id === id),
    [transactions],
  );

  const getMonthlySummary = useCallback((): MonthlySummary => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthTransactions = transactions.filter((item) => {
      const date = new Date(item.date);
      return (
        date.getMonth() === currentMonth && date.getFullYear() === currentYear
      );
    });

    const summary = computeSummary(monthTransactions);
    const allTime = computeSummary(transactions);

    return {
      totalIncome: summary.income,
      totalExpense: summary.expense,
      netBalance: allTime.net,
      transactionCount: monthTransactions.length,
    };
  }, [transactions]);

  const value = useMemo(
    () => ({
      transactions,
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
