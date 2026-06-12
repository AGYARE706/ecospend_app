import axios from 'axios';

interface ApiErrorBody {
  message?: string;
  error?: string;
}

export function getApiErrorMessage(
  error: unknown,
  fallback = 'Something went wrong',
): string {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    const data = error.response?.data;
    if (data?.message) {
      return data.message;
    }
    if (data?.error) {
      return data.error;
    }
  }
  return fallback;
}
