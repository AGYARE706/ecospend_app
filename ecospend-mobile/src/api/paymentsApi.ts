import { apiClient } from './apiClient';

export type DepositStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

export interface DepositView {
  reference: string;
  vaultId: string;
  amount: number;
  status: DepositStatus;
  authorizationUrl: string | null;
  createdAt: string;
}

/**
 * Starts a Paystack deposit for a vault. The vault balance is only
 * credited server-side after the payment verifies — never from here.
 */
export async function initializeDeposit(payload: {
  vaultId: string;
  amount: number;
  phone?: string;
}): Promise<DepositView> {
  const { data } = await apiClient.post<DepositView>('/api/payments/deposits', payload);
  return data;
}

export async function getDeposit(reference: string): Promise<DepositView> {
  const { data } = await apiClient.get<DepositView>(
    `/api/payments/deposits/${reference}`,
  );
  return data;
}

export async function verifyDeposit(reference: string): Promise<DepositView> {
  const { data } = await apiClient.post<DepositView>(
    `/api/payments/deposits/${reference}/verify`,
  );
  return data;
}
