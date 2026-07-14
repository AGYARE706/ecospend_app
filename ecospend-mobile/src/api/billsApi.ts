import { apiClient } from './apiClient';

export type BillingCycle = 'MONTHLY' | 'YEARLY';
export type BillStatus = 'ACTIVE' | 'CANCELLED';

/** A recurring bill ("subscription") paid from the wallet. */
export interface Bill {
  id: string;
  name: string;
  amount: number;
  category: string;
  billingCycle: BillingCycle;
  nextDueDate: string;
  status: BillStatus;
  createdAt?: string;
}

interface ApiBill {
  id: string;
  name: string;
  amount: number | string;
  category?: string;
  billingCycle?: string;
  nextDueDate?: string;
  status?: string;
  createdAt?: string;
}

function mapBill(raw: ApiBill): Bill {
  return {
    id: raw.id,
    name: raw.name,
    amount: Number(raw.amount),
    category: raw.category ?? 'Subscription',
    billingCycle: raw.billingCycle === 'YEARLY' ? 'YEARLY' : 'MONTHLY',
    nextDueDate: raw.nextDueDate ?? '',
    status: raw.status === 'CANCELLED' ? 'CANCELLED' : 'ACTIVE',
    createdAt: raw.createdAt,
  };
}

export async function listBills(): Promise<Bill[]> {
  const { data } = await apiClient.get('/api/finance/subscriptions');
  return (data as ApiBill[]).map(mapBill);
}

export async function createBill(payload: {
  name: string;
  amount: number;
  billingCycle: BillingCycle;
  nextDueDate?: string;
  category?: string;
}): Promise<Bill> {
  const { data } = await apiClient.post('/api/finance/subscriptions', payload);
  return mapBill(data);
}

export async function updateBill(
  id: string,
  payload: Partial<{
    name: string;
    amount: number;
    billingCycle: BillingCycle;
    nextDueDate: string;
    status: BillStatus;
    category: string;
  }>,
): Promise<Bill> {
  const { data } = await apiClient.put(`/api/finance/subscriptions/${id}`, payload);
  return mapBill(data);
}

export async function deleteBill(id: string): Promise<void> {
  await apiClient.delete(`/api/finance/subscriptions/${id}`);
}

/**
 * Pays the bill from the wallet: the backend debits the wallet,
 * auto-records the expense, and advances the due date by one cycle.
 */
export async function payBill(id: string): Promise<Bill> {
  const { data } = await apiClient.post(`/api/finance/subscriptions/${id}/pay`);
  return mapBill(data);
}
