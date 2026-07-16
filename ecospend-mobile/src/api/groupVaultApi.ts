import { apiClient } from './apiClient';
import { mapGroupVault, mapWithdrawalRequest } from './mappers/vaultMappers';
import type { GroupVault, WithdrawalRequest } from '../types/groupVault';

export async function listGroupVaults(): Promise<GroupVault[]> {
  const { data } = await apiClient.get('/api/vault/groups');
  return (data as unknown[]).map((item) =>
    mapGroupVault(item as Parameters<typeof mapGroupVault>[0]),
  );
}

export async function getGroupVault(id: string): Promise<GroupVault> {
  const { data } = await apiClient.get(`/api/vault/groups/${id}`);
  return mapGroupVault(data);
}

export async function createGroupVault(payload: {
  name: string;
  targetAmount: number;
  lockedUntil: string;
  maxMembers: number;
  /** WEEKLY | MONTHLY — cadence of the automatic contribution plan. */
  contributionFrequency: string;
  /** Phone numbers to invite immediately after creation. */
  memberPhones?: string[];
}): Promise<GroupVault> {
  const { data } = await apiClient.post('/api/vault/groups', payload);
  return mapGroupVault(data);
}

export async function previewGroupByCode(code: string): Promise<GroupVault> {
  const { data } = await apiClient.get(`/api/vault/groups/by-code/${encodeURIComponent(code)}`);
  return mapGroupVault(data);
}

export async function joinGroupByCode(inviteCode: string): Promise<GroupVault> {
  const { data } = await apiClient.post('/api/vault/groups/join', { inviteCode });
  return mapGroupVault(data);
}

// NOTE: group contributions go through the wallet — see paymentsApi.transferToGroup.
// The vault-service no longer exposes a public group deposit endpoint.

export async function listWithdrawals(groupId: string): Promise<WithdrawalRequest[]> {
  const { data } = await apiClient.get(`/api/vault/groups/${groupId}/withdrawals`);
  return (data as unknown[]).map((item) => {
    const view = item as Parameters<typeof mapWithdrawalRequest>[0];
    return mapWithdrawalRequest(view, '');
  });
}

export async function requestWithdrawal(
  groupId: string,
  amount: number,
  note?: string,
): Promise<WithdrawalRequest> {
  const { data } = await apiClient.post(`/api/vault/groups/${groupId}/withdrawals`, {
    amount,
    note,
  });
  return mapWithdrawalRequest(data, '');
}

export async function voteWithdrawal(
  groupId: string,
  requestId: string,
  approve: boolean,
): Promise<WithdrawalRequest> {
  const { data } = await apiClient.post(
    `/api/vault/groups/${groupId}/withdrawals/${requestId}/vote`,
    { approve },
  );
  return mapWithdrawalRequest(data, '');
}
