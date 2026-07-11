import type { Transaction, TransactionCategory } from '../types';

export interface WeeklySummary {
  income: number;
  expenses: number;
  savings: number;
  weekLabel: string;
}

export interface TopCategoryInsight {
  category: TransactionCategory;
  amount: number;
  transactionCount: number;
  percentOfSpending: number;
}

export interface LargestTransactionInsight {
  id: string;
  amount: number;
  category: TransactionCategory;
  notes?: string;
  date: string;
}

export interface DailySpendingPoint {
  label: string;
  amount: number;
}

export interface SpendingTrendInsight {
  dailyTotals: DailySpendingPoint[];
  trendPercent: number;
  direction: 'up' | 'down' | 'flat';
  thisWeekTotal: number;
  lastWeekTotal: number;
}

export interface MonthEndProjectionInsight {
  projectedExpenses: number;
  projectedIncome: number;
  projectedNet: number;
  currentExpenses: number;
  currentIncome: number;
  daysElapsed: number;
  daysInMonth: number;
  daysRemaining: number;
}

export interface WeeklyInsightsData {
  summary: WeeklySummary;
  topCategory: TopCategoryInsight | null;
  largestTransaction: LargestTransactionInsight | null;
  spendingTrend: SpendingTrendInsight;
  monthEndProjection: MonthEndProjectionInsight;
}

function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

function getWeekRange(reference = new Date()): { start: Date; end: Date; label: string } {
  const end = endOfDay(reference);
  const start = startOfDay(new Date(reference));
  start.setDate(start.getDate() - 6);

  const startLabel = start.toLocaleDateString('en-GH', {
    day: 'numeric',
    month: 'short',
  });
  const endLabel = end.toLocaleDateString('en-GH', {
    day: 'numeric',
    month: 'short',
  });

  return {
    start,
    end,
    label: `${startLabel} – ${endLabel}`,
  };
}

function filterByDateRange(
  transactions: Transaction[],
  start: Date,
  end: Date,
): Transaction[] {
  return transactions.filter((item) => {
    const date = new Date(item.date);
    return date >= start && date <= end;
  });
}

function sumByType(transactions: Transaction[], type: Transaction['type']): number {
  return transactions
    .filter((item) => item.type === type)
    .reduce((sum, item) => sum + item.amount, 0);
}

export function computeWeeklySummary(
  transactions: Transaction[],
  reference = new Date(),
): WeeklySummary {
  const { start, end, label } = getWeekRange(reference);
  const weekTransactions = filterByDateRange(transactions, start, end);
  const income = sumByType(weekTransactions, 'income');
  const expenses = sumByType(weekTransactions, 'expense');

  return {
    income,
    expenses,
    savings: income - expenses,
    weekLabel: label,
  };
}

export function computeTopCategory(
  transactions: Transaction[],
  reference = new Date(),
): TopCategoryInsight | null {
  const { start, end } = getWeekRange(reference);
  const expenses = filterByDateRange(transactions, start, end).filter(
    (item) => item.type === 'expense',
  );

  if (expenses.length === 0) {
    return null;
  }

  const totals = expenses.reduce<Record<string, { total: number; count: number }>>(
    (acc, item) => {
      const current = acc[item.category] ?? { total: 0, count: 0 };
      current.total += item.amount;
      current.count += 1;
      acc[item.category] = current;
      return acc;
    },
    {},
  );

  const totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0);
  const [category, stats] = Object.entries(totals).sort(
    (a, b) => b[1].total - a[1].total,
  )[0];

  return {
    category: category as TransactionCategory,
    amount: stats.total,
    transactionCount: stats.count,
    percentOfSpending: totalSpent > 0 ? Math.round((stats.total / totalSpent) * 100) : 0,
  };
}

export function computeLargestTransaction(
  transactions: Transaction[],
  reference = new Date(),
): LargestTransactionInsight | null {
  const { start, end } = getWeekRange(reference);
  const expenses = filterByDateRange(transactions, start, end).filter(
    (item) => item.type === 'expense',
  );

  if (expenses.length === 0) {
    return null;
  }

  const largest = expenses.reduce((max, item) =>
    item.amount > max.amount ? item : max,
  );

  return {
    id: largest.id,
    amount: largest.amount,
    category: largest.category,
    notes: largest.notes,
    date: largest.date,
  };
}

export function computeSpendingTrend(
  transactions: Transaction[],
  reference = new Date(),
): SpendingTrendInsight {
  const { start, end } = getWeekRange(reference);
  const thisWeekExpenses = filterByDateRange(transactions, start, end).filter(
    (item) => item.type === 'expense',
  );

  const dailyTotals: DailySpendingPoint[] = [];

  for (let offset = 6; offset >= 0; offset -= 1) {
    const day = startOfDay(new Date(reference));
    day.setDate(day.getDate() - offset);
    const dayEnd = endOfDay(day);

    const amount = thisWeekExpenses
      .filter((item) => {
        const date = new Date(item.date);
        return date >= day && date <= dayEnd;
      })
      .reduce((sum, item) => sum + item.amount, 0);

    dailyTotals.push({
      label: day.toLocaleDateString('en-GH', { weekday: 'short' }),
      amount,
    });
  }

  const thisWeekTotal = thisWeekExpenses.reduce((sum, item) => sum + item.amount, 0);

  const lastWeekEnd = startOfDay(new Date(start));
  lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);
  const lastWeekStart = startOfDay(new Date(lastWeekEnd));
  lastWeekStart.setDate(lastWeekStart.getDate() - 6);

  const lastWeekExpenses = filterByDateRange(transactions, lastWeekStart, endOfDay(lastWeekEnd))
    .filter((item) => item.type === 'expense')
    .reduce((sum, item) => sum + item.amount, 0);

  let trendPercent = 0;
  let direction: SpendingTrendInsight['direction'] = 'flat';

  if (lastWeekExpenses > 0) {
    trendPercent = Math.round(
      ((thisWeekTotal - lastWeekExpenses) / lastWeekExpenses) * 100,
    );
    direction = trendPercent > 0 ? 'up' : trendPercent < 0 ? 'down' : 'flat';
  } else if (thisWeekTotal > 0) {
    trendPercent = 100;
    direction = 'up';
  }

  return {
    dailyTotals,
    trendPercent: Math.abs(trendPercent),
    direction,
    thisWeekTotal,
    lastWeekTotal: lastWeekExpenses,
  };
}

export function computeMonthEndProjection(
  transactions: Transaction[],
  reference = new Date(),
): MonthEndProjectionInsight {
  const month = reference.getMonth();
  const year = reference.getFullYear();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysElapsed = reference.getDate();
  const daysRemaining = daysInMonth - daysElapsed;

  const monthTransactions = transactions.filter((item) => {
    const date = new Date(item.date);
    return date.getMonth() === month && date.getFullYear() === year;
  });

  const currentIncome = sumByType(monthTransactions, 'income');
  const currentExpenses = sumByType(monthTransactions, 'expense');

  const projectedIncome =
    daysElapsed > 0 ? (currentIncome / daysElapsed) * daysInMonth : currentIncome;
  const projectedExpenses =
    daysElapsed > 0 ? (currentExpenses / daysElapsed) * daysInMonth : currentExpenses;

  return {
    projectedExpenses,
    projectedIncome,
    projectedNet: projectedIncome - projectedExpenses,
    currentExpenses,
    currentIncome,
    daysElapsed,
    daysInMonth,
    daysRemaining,
  };
}

export function computeWeeklyInsights(
  transactions: Transaction[],
  reference = new Date(),
): WeeklyInsightsData {
  return {
    summary: computeWeeklySummary(transactions, reference),
    topCategory: computeTopCategory(transactions, reference),
    largestTransaction: computeLargestTransaction(transactions, reference),
    spendingTrend: computeSpendingTrend(transactions, reference),
    monthEndProjection: computeMonthEndProjection(transactions, reference),
  };
}
