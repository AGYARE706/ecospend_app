import type { CategoryBreakdownPoint, Transaction, TransactionCategory } from '../types';
import { computeSpendingTrend, type SpendingTrendInsight } from './weeklyInsights';

function filterMonthTransactions(
  transactions: Transaction[],
  reference = new Date(),
): Transaction[] {
  const month = reference.getMonth();
  const year = reference.getFullYear();

  return transactions.filter((item) => {
    const date = new Date(item.date);
    return date.getMonth() === month && date.getFullYear() === year;
  });
}

function sumByType(transactions: Transaction[], type: Transaction['type']): number {
  return transactions
    .filter((item) => item.type === type)
    .reduce((sum, item) => sum + item.amount, 0);
}

export function computeSavingsRate(income: number, expense: number): number {
  if (income <= 0) {
    return 0;
  }

  const rate = ((income - expense) / income) * 100;
  return Math.max(0, Math.min(100, Math.round(rate)));
}

export function computeCategoryBreakdown(
  transactions: Transaction[],
  reference = new Date(),
  maxCategories = 4,
): CategoryBreakdownPoint[] {
  const monthExpenses = filterMonthTransactions(transactions, reference).filter(
    (item) => item.type === 'expense',
  );

  if (monthExpenses.length === 0) {
    return [];
  }

  const totals = monthExpenses.reduce<Record<string, number>>((acc, item) => {
    acc[item.category] = (acc[item.category] ?? 0) + item.amount;
    return acc;
  }, {});

  const totalSpent = monthExpenses.reduce((sum, item) => sum + item.amount, 0);
  const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]);

  const top = sorted.slice(0, maxCategories).map(([category, amount]) => ({
    category: category as TransactionCategory,
    amount,
    percent: totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0,
  }));

  if (sorted.length <= maxCategories) {
    return top;
  }

  const otherAmount = sorted
    .slice(maxCategories)
    .reduce((sum, [, amount]) => sum + amount, 0);

  if (otherAmount > 0) {
    top.push({
      category: 'Other',
      amount: otherAmount,
      percent: totalSpent > 0 ? Math.round((otherAmount / totalSpent) * 100) : 0,
    });
  }

  return top;
}

export function computeDashboardAnalytics(
  transactions: Transaction[],
  reference = new Date(),
): {
  savingsRate: number;
  savingsAmount: number;
  spendingTrend: SpendingTrendInsight;
  topCategories: CategoryBreakdownPoint[];
  monthLabel: string;
  transactionCount: number;
} {
  const monthTransactions = filterMonthTransactions(transactions, reference);
  const income = sumByType(monthTransactions, 'income');
  const expense = sumByType(monthTransactions, 'expense');
  const savingsAmount = income - expense;

  return {
    savingsRate: computeSavingsRate(income, expense),
    savingsAmount,
    spendingTrend: computeSpendingTrend(transactions, reference),
    topCategories: computeCategoryBreakdown(transactions, reference),
    monthLabel: reference.toLocaleDateString('en-GH', {
      month: 'long',
      year: 'numeric',
    }),
    transactionCount: monthTransactions.length,
  };
}
