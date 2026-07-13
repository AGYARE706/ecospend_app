import { apiClient } from './apiClient';
import { getRefreshToken } from './authTokenAccessor';
import type { AuthResponse } from './authApi';

export interface SessionDto {
  id: string;
  createdAt: string;
  expiresAt: string;
  current: boolean;
}

/**
 * Changes the password and rotates every session server-side.
 * The response carries a fresh token pair for this device —
 * callers must persist it or the app will be signed out on refresh.
 */
export async function changePassword(payload: {
  currentPassword: string;
  newPassword: string;
}): Promise<AuthResponse> {
  const { data } = await apiClient.put<AuthResponse>(
    '/api/users/me/password',
    payload,
  );
  return data;
}

export async function listSessions(): Promise<SessionDto[]> {
  const refreshToken = getRefreshToken();
  const { data } = await apiClient.get<SessionDto[]>('/api/users/me/sessions', {
    headers: refreshToken ? { 'X-Session-Token': refreshToken } : undefined,
  });
  return data;
}

export async function revokeSession(sessionId: string): Promise<void> {
  await apiClient.delete(`/api/users/me/sessions/${sessionId}`);
}

export async function deleteAccount(): Promise<void> {
  await apiClient.delete('/api/users/me');
}
