import type {
  GroupedTransactions,
  Transaction,
  TransactionFilter,
  TransactionSummaryBar,
  WeeklyInsight,
} from '../types';
import { formatGroupLabel } from './formatDate';

export function filterTransactions(
  transactions: Transaction[],
  filter: TransactionFilter,
  searchQuery: string,
): Transaction[] {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  return transactions.filter((transaction) => {
    const matchesFilter =
      filter === 'All' ||
      (filter === 'Income' && transaction.type === 'income') ||
      (filter === 'Expense' && transaction.type === 'expense') ||
      transaction.category === filter;

    if (!matchesFilter) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const provider = transaction.provider?.toLowerCase() ?? '';
    const category = transaction.category.toLowerCase();
    const notes = transaction.notes?.toLowerCase() ?? '';

    return (
      category.includes(normalizedQuery) ||
      provider.includes(normalizedQuery) ||
      notes.includes(normalizedQuery)
    );
  });
}

export function groupTransactionsByDate(
  transactions: Transaction[],
): GroupedTransactions[] {
  const sorted = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const groups = new Map<string, Transaction[]>();

  sorted.forEach((transaction) => {
    const title = formatGroupLabel(transaction.date);
    const existing = groups.get(title) ?? [];
    existing.push(transaction);
    groups.set(title, existing);
  });

  return Array.from(groups.entries()).map(([title, data]) => ({
    title,
    data,
  }));
}

export function computeSummary(transactions: Transaction[]): TransactionSummaryBar {
  const income = transactions
    .filter((item) => item.type === 'income')
    .reduce((sum, item) => sum + item.amount, 0);

  const expense = transactions
    .filter((item) => item.type === 'expense')
    .reduce((sum, item) => sum + item.amount, 0);

  return {
    income,
    expense,
    net: income - expense,
  };
}

export function getRecentTransactions(
  transactions: Transaction[],
  count: number,
): Transaction[] {
  return [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, count);
}

export function getTransactionById(
  transactions: Transaction[],
  transactionId: string,
): Transaction | undefined {
  return transactions.find((item) => item.id === transactionId);
}

export function computeWeeklyInsight(transactions: Transaction[]): WeeklyInsight {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const weeklyExpenses = transactions.filter(
    (item) => item.type === 'expense' && new Date(item.date) >= weekAgo,
  );

  if (weeklyExpenses.length === 0) {
    return {
      heading: "This week's insight",
      message: 'No spending recorded this week yet. Keep tracking to unlock insights.',
    };
  }

  const totals = weeklyExpenses.reduce<Record<string, { total: number; count: number }>>(
    (acc, item) => {
      const current = acc[item.category] ?? { total: 0, count: 0 };
      current.total += item.amount;
      current.count += 1;
      acc[item.category] = current;
      return acc;
    },
    {},
  );

  const topCategory = Object.entries(totals).sort(
    (a, b) => b[1].total - a[1].total,
  )[0];

  const [category, stats] = topCategory;

  return {
    heading: "This week's insight",
    message: `${category} is your top spend this week — GHS ${stats.total.toFixed(0)} in ${stats.count} transaction${stats.count === 1 ? '' : 's'}`,
  };
}
