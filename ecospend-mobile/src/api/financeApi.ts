import { apiClient } from './apiClient';
import { mapSummary, mapTransaction } from './mappers/financeMappers';
import type { MonthlySummary, Transaction } from '../types';

// NOTE: there is intentionally no create or update here. Transactions are
// recorded automatically by the backend when real money moves through
// Paystack/the wallet, and are immutable afterwards for integrity.

export async function listTransactions(): Promise<Transaction[]> {
  const { data } = await apiClient.get('/api/finance/transactions');
  return (data as unknown[]).map((item) =>
    mapTransaction(item as Parameters<typeof mapTransaction>[0]),
  );
}

export async function getTransactionSummary(
  month: number,
  year: number,
): Promise<MonthlySummary> {
  const { data } = await apiClient.get('/api/finance/transactions/summary', {
    params: { month, year },
  });
  return mapSummary(data);
}

export async function deleteTransaction(id: string): Promise<void> {
  await apiClient.delete(`/api/finance/transactions/${id}`);
}

/** Expected fixed income per month — 0 means "not set". */
export async function getIncomeTarget(): Promise<number> {
  const { data } = await apiClient.get<{ monthlyAmount: number | string }>(
    '/api/finance/income-target',
  );
  return Number(data.monthlyAmount);
}

export async function setIncomeTarget(monthlyAmount: number): Promise<number> {
  const { data } = await apiClient.put<{ monthlyAmount: number | string }>(
    '/api/finance/income-target',
    { monthlyAmount },
  );
  return Number(data.monthlyAmount);
}
