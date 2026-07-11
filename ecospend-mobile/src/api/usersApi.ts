import { apiClient } from './apiClient';
import type { AuthResponse } from './authApi';

export interface UserProfileResponse {
  id: string;
  name: string;
  phone: string;
  tier: string;
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

export async function upgradeToPlus(): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/api/users/upgrade-to-plus');
  return data;
}
