import { apiClient } from './apiClient';
import {
  mapSummary,
  mapTransaction,
  providerToApi,
  toCreateTransactionBody,
} from './mappers/financeMappers';
import type {
  AddTransactionPayload,
  MonthlySummary,
  Provider,
  Transaction,
  TransactionCategory,
  TransactionType,
} from '../types';

export type UpdateTransactionApiPayload = Partial<{
  type: TransactionType;
  amount: number;
  category: TransactionCategory;
  provider: Provider;
  notes: string;
  date: string;
}>;

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

export async function createTransaction(
  payload: AddTransactionPayload,
): Promise<Transaction> {
  const { data } = await apiClient.post(
    '/api/finance/transactions',
    toCreateTransactionBody(payload),
  );
  return mapTransaction(data);
}

export async function updateTransaction(
  id: string,
  payload: UpdateTransactionApiPayload,
): Promise<Transaction> {
  const body: Record<string, unknown> = {};
  if (payload.type !== undefined) {
    body.type = payload.type.toUpperCase();
  }
  if (payload.amount !== undefined) {
    body.amount = payload.amount;
  }
  if (payload.category !== undefined) {
    body.category = payload.category;
  }
  if (payload.notes !== undefined) {
    body.notes = payload.notes;
  }
  if (payload.type === 'income') {
    body.provider = null;
  } else if (payload.provider !== undefined) {
    body.provider = providerToApi(payload.provider);
  }

  const { data } = await apiClient.put(`/api/finance/transactions/${id}`, body);
  return mapTransaction(data);
}

export async function deleteTransaction(id: string): Promise<void> {
  await apiClient.delete(`/api/finance/transactions/${id}`);
}
