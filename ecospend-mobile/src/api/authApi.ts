import apiClient from './apiClient';

export interface AuthCredentials {
  phoneNumber: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  tier: string;
}

export async function registerUser(credentials: AuthCredentials): Promise<void> {
  await apiClient.post('/auth/register', credentials);
}

export async function loginUser(
  credentials: AuthCredentials,
): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>(
    '/auth/login',
    credentials,
  );
  return data;
}
