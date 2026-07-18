import { apiClient } from './apiClient';
import { getRefreshToken } from './authTokenAccessor';

export interface ApiSession {
  id: string;
  deviceLabel: string | null;
  ipAddress: string | null;
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
  isCurrent: boolean;
}

export async function listSessions(): Promise<ApiSession[]> {
  const refreshToken = getRefreshToken();
  const { data } = await apiClient.get<ApiSession[]>('/api/users/me/sessions', {
    headers: refreshToken ? { 'X-Refresh-Token': refreshToken } : undefined,
  });
  return data;
}

export async function revokeSession(sessionId: string): Promise<void> {
  await apiClient.delete(`/api/users/me/sessions/${sessionId}`);
}

export async function getLoginHistory(): Promise<ApiSession[]> {
  const { data } = await apiClient.get<ApiSession[]>('/api/users/me/login-history');
  return data;
}
