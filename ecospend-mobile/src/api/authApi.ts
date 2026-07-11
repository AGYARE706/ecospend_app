import { apiClient } from './apiClient';
import type { UserTier } from '../types';

export interface AuthUserDto {
  name: string;
  phone: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tier: UserTier | string;
  user: AuthUserDto;
}

export async function register(payload: {
  phoneNumber: string;
  password: string;
  name: string;
}): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/api/auth/register', payload);
  return data;
}

export async function login(payload: {
  phoneNumber: string;
  password: string;
}): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/api/auth/login', payload);
  return data;
}

export async function refresh(refreshToken: string): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/api/auth/refresh', {
    refreshToken,
  });
  return data;
}

export async function logout(refreshToken: string): Promise<void> {
  await apiClient.post('/api/auth/logout', { refreshToken });
}

export async function forgotPassword(phoneNumber: string): Promise<{ phone: string }> {
  const { data } = await apiClient.post<{ phone: string }>(
    '/api/auth/forgot-password',
    { phoneNumber },
  );
  return data;
}

export async function resetPassword(payload: {
  phoneNumber: string;
  code: string;
  password: string;
}): Promise<{ success: true }> {
  const { data } = await apiClient.post<{ success: true }>(
    '/api/auth/reset-password',
    payload,
  );
  return data;
}
