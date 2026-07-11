import { useCallback, useMemo, useState } from 'react';
import type { StackNavigationProp } from '@react-navigation/stack';

import { mockNotifications } from '../data/mock/notifications';
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
  const [notifications, setNotifications] = useState(mockNotifications);

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

  const dismissNotification = useCallback((id: string) => {
    setNotifications((current) => current.filter((item) => item.id !== id));
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((current) =>
      current.map((item) => (item.id === id ? { ...item, read: true } : item)),
    );
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((current) => current.map((item) => ({ ...item, read: true })));
  }, []);

  const handleNotificationPress = useCallback(
    (notification: AppNotification) => {
      markAsRead(notification.id);
      navigateFromAction(notification.action, navigation);
    },
    [markAsRead, navigation],
  );

  return {
    sections,
    unreadCount,
    isEmpty: notifications.length === 0,
    dismissNotification,
    markAllRead,
    handleNotificationPress,
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
