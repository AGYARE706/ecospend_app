import { Ionicons } from '@expo/vector-icons';

import type { ThemeColors } from '../theme';
import type {
  AppNotification,
  NotificationGroupKey,
  NotificationType,
} from '../types/notification';

export function getNotificationGroup(
  createdAt: string,
  now = new Date(),
): NotificationGroupKey {
  const date = new Date(createdAt);
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  if (date >= startOfToday) {
    return 'today';
  }

  const startOfWeekWindow = new Date(startOfToday);
  startOfWeekWindow.setDate(startOfWeekWindow.getDate() - 7);

  if (date >= startOfWeekWindow) {
    return 'thisWeek';
  }

  return 'earlier';
}

export function formatNotificationTime(createdAt: string, now = new Date()): string {
  const date = new Date(createdAt);
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffMinutes < 1) {
    return 'Just now';
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  if (diffHours < 24 && date.toDateString() === now.toDateString()) {
    return `${diffHours}h ago`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }

  return date.toLocaleDateString('en-GH', {
    day: 'numeric',
    month: 'short',
  });
}

export function getNotificationTypeLabel(type: NotificationType): string {
  switch (type) {
    case 'vault_matured':
      return 'Vault Matured';
    case 'budget_alert':
      return 'Budget Alert';
    case 'goal_completed':
      return 'Goal Completed';
    case 'weekly_insight':
      return 'Weekly Insight';
    case 'group_vault_vote':
      return 'Group Vault Vote';
    default:
      return 'Notification';
  }
}

export interface NotificationVisual {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBackground: string;
  accentColor: string;
}

export function getNotificationVisual(
  type: NotificationType,
  colors: ThemeColors,
): NotificationVisual {
  switch (type) {
    case 'vault_matured':
      return {
        icon: 'lock-open-outline',
        iconColor: colors.primary,
        iconBackground: colors.primaryBackground,
        accentColor: colors.primary,
      };
    case 'budget_alert':
      return {
        icon: 'pie-chart-outline',
        iconColor: colors.warning,
        iconBackground: colors.warningLight,
        accentColor: colors.warning,
      };
    case 'goal_completed':
      return {
        icon: 'flag-outline',
        iconColor: colors.success,
        iconBackground: colors.successLight,
        accentColor: colors.success,
      };
    case 'weekly_insight':
      return {
        icon: 'bulb-outline',
        iconColor: colors.blue,
        iconBackground: colors.blueLight,
        accentColor: colors.blue,
      };
    case 'group_vault_vote':
      return {
        icon: 'people-outline',
        iconColor: colors.purple,
        iconBackground: colors.purpleLight,
        accentColor: colors.purple,
      };
    default:
      return {
        icon: 'notifications-outline',
        iconColor: colors.textMuted,
        iconBackground: colors.chipBg,
        accentColor: colors.textMuted,
      };
  }
}

export function groupNotifications(
  notifications: AppNotification[],
): Record<NotificationGroupKey, AppNotification[]> {
  const grouped: Record<NotificationGroupKey, AppNotification[]> = {
    today: [],
    thisWeek: [],
    earlier: [],
  };

  const sorted = [...notifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  for (const notification of sorted) {
    grouped[getNotificationGroup(notification.createdAt)].push(notification);
  }

  return grouped;
}
