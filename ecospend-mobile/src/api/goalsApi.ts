import { apiClient } from './apiClient';
import { mapGoal } from './mappers/goalMappers';
import type { AddGoalPayload, SavingsGoal, UpdateGoalPayload } from '../types';

export async function listGoals(): Promise<SavingsGoal[]> {
  const { data } = await apiClient.get('/api/finance/goals');
  return (data as unknown[]).map((item, index) =>
    mapGoal(item as Parameters<typeof mapGoal>[0], index),
  );
}

export async function createGoal(payload: AddGoalPayload): Promise<SavingsGoal> {
  const { data } = await apiClient.post('/api/finance/goals', {
    name: payload.name,
    targetAmount: payload.targetAmount,
    deadline: payload.deadline,
    currentAmount: 0,
  });
  return mapGoal(data);
}

export async function updateGoal(
  id: string,
  payload: UpdateGoalPayload,
): Promise<SavingsGoal> {
  const { data } = await apiClient.put(`/api/finance/goals/${id}`, payload);
  return mapGoal(data);
}

export async function deleteGoal(id: string): Promise<void> {
  await apiClient.delete(`/api/finance/goals/${id}`);
}

/**
 * Contributes real money from the wallet into the goal. The backend
 * debits the wallet, rejects amounts above the remaining-to-target, and
 * auto-records an EXPENSE transaction.
 */
export async function contributeToGoal(
  id: string,
  amount: number,
): Promise<SavingsGoal> {
  const { data } = await apiClient.post(`/api/finance/goals/${id}/contribute`, {
    amount,
  });
  return mapGoal(data);
}

/**
 * Withdraws money from the goal back into the wallet (no lock, no fee).
 * The backend credits the wallet and auto-records an INCOME transaction.
 */
export async function withdrawFromGoal(
  id: string,
  amount: number,
): Promise<SavingsGoal> {
  const { data } = await apiClient.post(`/api/finance/goals/${id}/withdraw`, {
    amount,
  });
  return mapGoal(data);
}
