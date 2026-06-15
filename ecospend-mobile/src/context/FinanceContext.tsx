import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import { mockMonthlySummary, mockTransactions } from '../data/mock/mockData';
import type {
  AddTransactionPayload,
  MonthlySummary,
  Transaction,
} from '../types';
import { computeSummary } from '../utils/transactions';

interface FinanceContextValue {
  transactions: Transaction[];
  addTransaction: (payload: AddTransactionPayload) => void;
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

    return {
      totalIncome: summary.income,
      totalExpense: summary.expense,
      netBalance: mockMonthlySummary.netBalance,
      transactionCount: monthTransactions.length,
    };
  }, [transactions]);

  const value = useMemo(
    () => ({
      transactions,
      addTransaction,
      getMonthlySummary,
    }),
    [addTransaction, getMonthlySummary, transactions],
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
