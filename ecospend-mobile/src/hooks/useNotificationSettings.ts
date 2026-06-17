import { useCallback, useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../theme';

export type NotificationPreferenceKey =
  | 'weeklyInsights'
  | 'budgetAlerts'
  | 'goalReminders'
  | 'vaultReminders'
  | 'groupVaultUpdates'
  | 'marketingUpdates';

export interface NotificationPreference {
  key: NotificationPreferenceKey;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBackground: string;
  section: 'insights' | 'vaults' | 'general';
}

export type NotificationPreferences = Record<NotificationPreferenceKey, boolean>;

const DEFAULT_PREFERENCES: NotificationPreferences = {
  weeklyInsights: true,
  budgetAlerts: true,
  goalReminders: true,
  vaultReminders: true,
  groupVaultUpdates: true,
  marketingUpdates: false,
};

export const NOTIFICATION_PREFERENCE_ITEMS: NotificationPreference[] = [
  {
    key: 'weeklyInsights',
    title: 'Weekly Insights',
    description: 'Summary of spending trends and savings progress each week.',
    icon: 'bulb-outline',
    iconColor: colors.warning,
    iconBackground: colors.warningLight,
    section: 'insights',
  },
  {
    key: 'budgetAlerts',
    title: 'Budget Alerts',
    description: 'Warnings when envelopes are close to or over their limit.',
    icon: 'pie-chart-outline',
    iconColor: colors.blue,
    iconBackground: colors.blueLight,
    section: 'insights',
  },
  {
    key: 'goalReminders',
    title: 'Goal Reminders',
    description: 'Nudges to stay on track with your savings goals.',
    icon: 'flag-outline',
    iconColor: colors.primary,
    iconBackground: colors.primaryBackground,
    section: 'insights',
  },
  {
    key: 'vaultReminders',
    title: 'Vault Reminders',
    description: 'Alerts for maturity dates, lock periods, and withdrawals.',
    icon: 'lock-closed-outline',
    iconColor: colors.primary,
    iconBackground: colors.primaryBackground,
    section: 'vaults',
  },
  {
    key: 'groupVaultUpdates',
    title: 'Group Vault Updates',
    description: 'Votes, contributions, and activity from shared vaults.',
    icon: 'people-outline',
    iconColor: '#6A1B9A',
    iconBackground: '#F3E5F5',
    section: 'vaults',
  },
  {
    key: 'marketingUpdates',
    title: 'Marketing Updates',
    description: 'Product news, offers, and EcoSpend Plus promotions.',
    icon: 'megaphone-outline',
    iconColor: colors.warning,
    iconBackground: colors.orangeLight,
    section: 'general',
  },
];

export interface NotificationSettingsSection {
  id: 'insights' | 'vaults' | 'general';
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  items: NotificationPreference[];
}

export function useNotificationSettings() {
  const [preferences, setPreferences] =
    useState<NotificationPreferences>(DEFAULT_PREFERENCES);

  const enabledCount = useMemo(
    () => Object.values(preferences).filter(Boolean).length,
    [preferences],
  );

  const totalCount = NOTIFICATION_PREFERENCE_ITEMS.length;

  const sections = useMemo<NotificationSettingsSection[]>(
    () => [
      {
        id: 'insights',
        title: 'Savings & Budget',
        icon: 'analytics-outline',
        items: NOTIFICATION_PREFERENCE_ITEMS.filter(
          (item) => item.section === 'insights',
        ),
      },
      {
        id: 'vaults',
        title: 'Vaults',
        icon: 'shield-outline',
        items: NOTIFICATION_PREFERENCE_ITEMS.filter(
          (item) => item.section === 'vaults',
        ),
      },
      {
        id: 'general',
        title: 'General',
        icon: 'mail-outline',
        items: NOTIFICATION_PREFERENCE_ITEMS.filter(
          (item) => item.section === 'general',
        ),
      },
    ],
    [],
  );

  const togglePreference = useCallback((key: NotificationPreferenceKey) => {
    setPreferences((current) => ({
      ...current,
      [key]: !current[key],
    }));
  }, []);

  const enableAll = useCallback(() => {
    setPreferences({
      weeklyInsights: true,
      budgetAlerts: true,
      goalReminders: true,
      vaultReminders: true,
      groupVaultUpdates: true,
      marketingUpdates: true,
    });
  }, []);

  const disableAll = useCallback(() => {
    setPreferences({
      weeklyInsights: false,
      budgetAlerts: false,
      goalReminders: false,
      vaultReminders: false,
      groupVaultUpdates: false,
      marketingUpdates: false,
    });
  }, []);

  const statusMessage = useMemo(() => {
    if (enabledCount === totalCount) {
      return 'All notification types are enabled.';
    }

    if (enabledCount === 0) {
      return 'All notifications are turned off. You may miss important alerts.';
    }

    return `${enabledCount} of ${totalCount} notification types are enabled.`;
  }, [enabledCount, totalCount]);

  return {
    preferences,
    sections,
    enabledCount,
    totalCount,
    statusMessage,
    togglePreference,
    enableAll,
    disableAll,
  };
}
