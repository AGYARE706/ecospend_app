export interface TransactionSummary {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  transactionCount: number;
}

export function buildSummaryUrl(month: number, year: number): string {
  return `/api/finance/transactions/summary?month=${month}&year=${year}`;
}
