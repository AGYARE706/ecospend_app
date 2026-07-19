import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

import { getApiErrorMessage } from '../api/getApiErrorMessage';
import * as notificationsApi from '../api/notificationsApi';
import { useAuth } from '../context/AuthContext';
import type { AppStackParamList } from '../navigation/types';
import type {
  AppNotification,
  NotificationAction,
  NotificationSection,
} from '../types/notification';
import { groupNotifications } from '../utils/notifications';

type NotificationsNavigationProp = StackNavigationProp<
  AppStackParamList,
  'Notifications'
>;

const SECTION_TITLES = {
  today: 'Today',
  thisWeek: 'This Week',
  earlier: 'Earlier',
} as const;

export function useNotifications(navigation: NotificationsNavigationProp) {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      return;
    }

    setLoading(true);
    try {
      const list = await notificationsApi.listNotifications();
      setNotifications(list);
      setError(null);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not load notifications'));
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications],
  );

  const sections = useMemo<NotificationSection[]>(() => {
    const grouped = groupNotifications(notifications);

    return (Object.keys(SECTION_TITLES) as Array<keyof typeof SECTION_TITLES>)
      .map((key) => ({
        key,
        title: SECTION_TITLES[key],
        data: grouped[key],
      }))
      .filter((section) => section.data.length > 0);
  }, [notifications]);

  const dismissNotification = useCallback(async (id: string) => {
    setNotifications((current) => current.filter((item) => item.id !== id));
    try {
      await notificationsApi.dismissNotification(id);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not dismiss notification'));
      void refresh();
    }
  }, [refresh]);

  const markAsRead = useCallback(async (id: string) => {
    setNotifications((current) =>
      current.map((item) => (item.id === id ? { ...item, read: true } : item)),
    );
    try {
      await notificationsApi.markNotificationRead(id);
    } catch {
      // keep optimistic update
    }
  }, []);

  const markAllRead = useCallback(async () => {
    setNotifications((current) =>
      current.map((item) => ({ ...item, read: true })),
    );
    try {
      await notificationsApi.markAllNotificationsRead();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not mark all as read'));
      void refresh();
    }
  }, [refresh]);

  const handleNotificationPress = useCallback(
    (notification: AppNotification) => {
      void markAsRead(notification.id);
      navigateFromAction(notification.action, navigation);
    },
    [markAsRead, navigation],
  );

  return {
    sections,
    unreadCount,
    isEmpty: notifications.length === 0,
    loading,
    error,
    dismissNotification,
    markAllRead,
    handleNotificationPress,
    refresh,
  };
}

function navigateFromAction(
  action: NotificationAction,
  navigation: NotificationsNavigationProp,
): void {
  const navigate = () => {
    switch (action.type) {
      case 'weekly_insights':
        navigation.navigate('WeeklyInsights');
        break;
      case 'budget_envelopes':
        navigation.navigate('BudgetEnvelopes');
        break;
      case 'goal_details':
        navigation.navigate('MainTabs', {
          screen: 'GoalsTab',
          params: {
            screen: 'GoalDetails',
            params: { goalId: action.goalId },
          },
        });
        break;
      case 'vault_details':
        navigation.navigate('MainTabs', {
          screen: 'VaultTab',
          params: {
            screen: 'VaultDetails',
            params: { vaultId: action.vaultId },
          },
        });
        break;
      case 'withdrawal_approval':
        navigation.navigate('MainTabs', {
          screen: 'VaultTab',
          params: {
            screen: 'WithdrawalApproval',
            params: {
              groupVaultId: action.groupVaultId,
              requestId: action.requestId,
            },
          },
        });
        break;
      case 'group_vault_details':
        navigation.navigate('MainTabs', {
          screen: 'VaultTab',
          params: {
            screen: 'GroupVaultDetails',
            params: { groupVaultId: action.groupVaultId },
          },
        });
        break;
      case 'join_group_vault':
        navigation.navigate('JoinGroupVault', { inviteCode: action.inviteCode });
        break;
      case 'subscription':
        navigation.navigate('MainTabs', {
          screen: 'ProfileTab',
          params: { screen: 'Subscription' },
        });
        break;
      case 'none':
      default:
        break;
    }
  };

  if (action.type === 'none') {
    return;
  }

  navigation.goBack();
  setTimeout(navigate, 0);
}
