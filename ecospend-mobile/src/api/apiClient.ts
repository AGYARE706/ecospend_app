import axios, { type InternalAxiosRequestConfig } from 'axios';

import { getCurrentToken } from './authTokenAccessor';

const baseURL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8080';

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getCurrentToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
