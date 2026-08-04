import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as Device from 'expo-device';

import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  notifySessionExpired,
  persistSession,
} from './authTokenAccessor';

const DEFAULT_BASE_URL = 'http://10.0.2.2:8080';

/**
 * Friendly device label sent on every request so the backend can show
 * something better than a raw User-Agent in Active Sessions / Login
 * History (see identity-service's AuthController#deviceLabel). Computed
 * once — device identity doesn't change mid-session.
 */
function computeDeviceLabel(): string | undefined {
  const model = Device.modelName;
  const os = Device.osName && Device.osVersion ? `${Device.osName} ${Device.osVersion}` : undefined;
  if (model && os) {
    return `${model} (${os})`;
  }
  return model ?? os ?? undefined;
}

const deviceLabel = computeDeviceLabel();

export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    ...(deviceLabel ? { 'X-Device-Label': deviceLabel } : {}),
  },
});

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  try {
    const { data } = await axios.post(
      `${apiClient.defaults.baseURL}/api/auth/refresh`,
      { refreshToken },
      { headers: { 'Content-Type': 'application/json' }, timeout: 30000 },
    );

    await persistSession({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken ?? refreshToken,
      tier: data.tier ?? 'FREE',
      user: data.user ?? { name: '', phone: '' },
    });

    return data.accessToken as string;
  } catch {
    await clearSession();
    notifySessionExpired();
    return null;
  }
}

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    if (
      !original ||
      error.response?.status !== 401 ||
      original._retry ||
      original.url?.includes('/api/auth/login') ||
      original.url?.includes('/api/auth/register') ||
      original.url?.includes('/api/auth/refresh')
    ) {
      return Promise.reject(error);
    }

    original._retry = true;

    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    }

    const nextToken = await refreshPromise;
    if (!nextToken) {
      return Promise.reject(error);
    }

    original.headers.Authorization = `Bearer ${nextToken}`;
    return apiClient(original);
  },
);
