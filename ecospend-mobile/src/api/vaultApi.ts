import { apiClient } from './apiClient';
import { mapVault, mapVaultContribution } from './mappers/vaultMappers';
import type { Vault } from '../types/vault';

export async function listVaults(): Promise<Vault[]> {
  const { data } = await apiClient.get('/api/vault');
  return (data as unknown[]).map((item) =>
    mapVault(item as Parameters<typeof mapVault>[0]),
  );
}

export async function getVault(id: string): Promise<Vault> {
  const { data } = await apiClient.get(`/api/vault/${id}`);
  return mapVault(data);
}

export async function getVaultTransactions(id: string) {
  const { data } = await apiClient.get(`/api/vault/${id}/transactions`);
  return (data as unknown[]).map((item) =>
    mapVaultContribution(item as Parameters<typeof mapVaultContribution>[0]),
  );
}

export async function createVault(payload: {
  name: string;
  targetAmount: number;
  lockedUntil: string;
}): Promise<Vault> {
  const { data } = await apiClient.post('/api/vault', payload);
  return mapVault(data);
}

export async function depositToVault(
  id: string,
  amount: number,
  note?: string,
): Promise<Vault> {
  const { data } = await apiClient.post(`/api/vault/${id}/deposit`, {
    amount,
    note,
  });
  return mapVault(data);
}

export interface PayoutDestination {
  momoNumber: string;
  momoProvider: string;
}

export async function withdrawFromVault(
  id: string,
  amount: number,
  destination?: PayoutDestination,
): Promise<Vault> {
  const { data } = await apiClient.post(`/api/vault/${id}/withdraw`, {
    amount,
    ...destination,
  });
  return mapVault(data);
}

export async function breakVault(
  id: string,
  destination?: PayoutDestination,
): Promise<Vault> {
  const { data } = await apiClient.post(
    `/api/vault/${id}/break`,
    destination ?? undefined,
  );
  return mapVault(data);
}

export async function deleteVault(id: string): Promise<void> {
  await apiClient.delete(`/api/vault/${id}`);
}
