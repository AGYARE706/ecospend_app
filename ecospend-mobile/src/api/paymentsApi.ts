import { apiClient } from './apiClient';

export type DepositStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

export interface DepositView {
  reference: string;
  amount: number;
  status: DepositStatus;
  authorizationUrl: string | null;
  createdAt: string;
}

export interface WalletView {
  balance: number;
}

/** A payment-service money-movement record (top-ups, sends, transfers). */
export interface PaymentRecordView {
  id: string;
  type: 'DEPOSIT' | 'PAYOUT' | 'CREDIT' | 'DEBIT';
  amountGhs: number;
  reference: string;
  status: DepositStatus;
  momoNumber?: string | null;
  momoProvider?: string | null;
  createdAt: string;
}

export async function getWallet(): Promise<WalletView> {
  const { data } = await apiClient.get<WalletView>('/api/payments/wallet');
  return data;
}

/**
 * Starts a Paystack wallet top-up. The wallet is only credited
 * server-side after the payment verifies — never from here.
 */
export async function initializeTopUp(payload: {
  amount: number;
  phone?: string;
  redirectUrl?: string;
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

/**
 * Sends money from the wallet to an external MoMo number via Paystack.
 * The spending category lands on the auto-recorded expense so budget
 * analysis reflects what the money was spent on.
 */
export async function sendMoney(payload: {
  amount: number;
  momoNumber: string;
  momoProvider: string;
  category: string;
}): Promise<PaymentRecordView> {
  const { data } = await apiClient.post<PaymentRecordView>(
    '/api/payments/withdrawals',
    payload,
  );
  return data;
}

/**
 * Polls the current status of a MoMo payout — Paystack transfers are
 * asynchronous, so a payout can still be PENDING right after sendMoney
 * resolves, settling moments later via webhook.
 */
export async function getPayoutStatus(reference: string): Promise<PaymentRecordView> {
  const { data } = await apiClient.get<PaymentRecordView>(
    `/api/payments/withdrawals/${reference}`,
  );
  return data;
}

/** Moves money from the wallet into a personal vault. */
export async function transferToVault(
  vaultId: string,
  amount: number,
): Promise<PaymentRecordView> {
  const { data } = await apiClient.post<PaymentRecordView>(
    '/api/payments/transfers/vault',
    { vaultId, amount },
  );
  return data;
}

/** Moves money from the wallet into the member's own group-vault balance. */
export async function transferToGroup(
  groupId: string,
  amount: number,
): Promise<PaymentRecordView> {
  const { data } = await apiClient.post<PaymentRecordView>(
    '/api/payments/transfers/group',
    { groupId, amount },
  );
  return data;
}

export async function getPaymentHistory(): Promise<PaymentRecordView[]> {
  const { data } = await apiClient.get<PaymentRecordView[]>('/api/payments/history');
  return data;
}
