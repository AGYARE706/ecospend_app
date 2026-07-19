import { apiClient } from './apiClient';
import { mapNotification } from './mappers/notificationMappers';
import type { AppNotification } from '../types/notification';

export async function listNotifications(
  unreadOnly = false,
): Promise<AppNotification[]> {
  const { data } = await apiClient.get('/api/notifications', {
    params: { unreadOnly },
  });
  return (data as unknown[]).map((item) =>
    mapNotification(item as Parameters<typeof mapNotification>[0]),
  );
}

export async function getUnreadCount(): Promise<number> {
  const { data } = await apiClient.get<{ count: number }>(
    '/api/notifications/unread-count',
  );
  return Number(data.count ?? 0);
}

export async function markNotificationRead(
  id: string,
): Promise<AppNotification> {
  const { data } = await apiClient.patch(`/api/notifications/${id}/read`);
  return mapNotification(data);
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiClient.post('/api/notifications/read-all');
}

export async function dismissNotification(id: string): Promise<void> {
  await apiClient.delete(`/api/notifications/${id}`);
}

export async function registerPushToken(
  expoPushToken: string,
  platform?: string,
): Promise<void> {
  await apiClient.post('/api/notifications/tokens', {
    expoPushToken,
    platform,
  });
}
