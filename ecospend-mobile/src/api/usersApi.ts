import { apiClient } from './apiClient';
import type { AuthResponse } from './authApi';

export type SubscriptionPlan = 'MONTHLY' | 'YEARLY';

export interface UserProfileResponse {
  id: string;
  name: string;
  phone: string;
  tier: string;
  subscriptionPlan?: SubscriptionPlan | null;
  subscriptionExpiresAt?: string | null;
  autoRenew: boolean;
  photoUrl?: string | null;
  twoFactorEnabled: boolean;
  setupCompleted: boolean;
  momoProvider?: string | null;
  createdAt?: string;
}

export async function getMe(): Promise<UserProfileResponse> {
  const { data } = await apiClient.get<UserProfileResponse>('/api/users/me');
  return data;
}

export async function updateMe(payload: { name: string }): Promise<UserProfileResponse> {
  const { data } = await apiClient.put<UserProfileResponse>('/api/users/me', payload);
  return data;
}

/** photoBase64 is a data URI, e.g. "data:image/jpeg;base64,...". */
export async function updateProfilePhoto(photoBase64: string): Promise<UserProfileResponse> {
  const { data } = await apiClient.put<UserProfileResponse>('/api/users/me/photo', {
    photoBase64,
  });
  return data;
}

export async function upgradeToPlus(plan: SubscriptionPlan): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/api/users/upgrade-to-plus', { plan });
  return data;
}

/** Keeps Plus active until the current period ends, then it lapses to Free instead of re-charging the wallet. */
export async function cancelAutoRenew(): Promise<UserProfileResponse> {
  const { data } = await apiClient.post<UserProfileResponse>('/api/users/cancel-plus-renewal');
  return data;
}

export async function updateTwoFactor(enabled: boolean): Promise<UserProfileResponse> {
  const { data } = await apiClient.put<UserProfileResponse>('/api/users/me/two-factor', {
    enabled,
  });
  return data;
}

export async function completeSetup(): Promise<UserProfileResponse> {
  const { data } = await apiClient.put<UserProfileResponse>('/api/users/me/setup-completed', {
    completed: true,
  });
  return data;
}

/** Persists the provider (MTN/Telecel/AT) for the account's own linked number, for "send to myself" MoMo transfers. */
export async function updateMomoProvider(momoProvider: string): Promise<UserProfileResponse> {
  const { data } = await apiClient.put<UserProfileResponse>('/api/users/me/momo-provider', {
    momoProvider,
  });
  return data;
}
