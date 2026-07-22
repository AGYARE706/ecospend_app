import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { getApiErrorMessage } from '../api/getApiErrorMessage';
import * as usersApi from '../api/usersApi';
import type { SubscriptionPlan } from '../api/usersApi';
import { useAuth } from '../context/AuthContext';
import { useEnvelopes } from '../context/EnvelopesContext';
import { useFinance } from '../context/FinanceContext';
import { useTheme } from '../context/ThemeContext';
import { useWallet } from '../context/WalletContext';

export const PLUS_MONTHLY_PRICE = 15;
export const PLUS_YEARLY_PRICE = 165;
/** How much cheaper yearly is per-month-equivalent, vs paying monthly all year. */
export const YEARLY_SAVINGS_PERCENT = Math.round(
  (1 - PLUS_YEARLY_PRICE / (PLUS_MONTHLY_PRICE * 12)) * 100,
);

export interface SubscriptionBenefit {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBackground: string;
}

export interface PlanComparisonRow {
  feature: string;
  freeLabel: string;
  plusLabel: string;
  plusIncluded: boolean;
  freeIncluded: boolean;
}

function formatRenewalDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function useSubscription() {
  const { tier, upgradeToPlus } = useAuth();
  const { refreshWallet } = useWallet();
  const { refreshTransactions } = useFinance();
  const { refreshEnvelopes } = useEnvelopes();
  const { colors } = useTheme();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>('YEARLY');

  const isPlus = tier === 'PLUS';

  // Renewal/auto-renew details live only here, fetched on demand — nothing
  // else in the app needs them, so this stays out of the global AuthUser
  // state that every profile-touching flow would otherwise have to carry.
  const [subscriptionPlan, setSubscriptionPlan] = useState<SubscriptionPlan | null>(null);
  const [subscriptionExpiresAt, setSubscriptionExpiresAt] = useState<string | null>(null);
  const [autoRenew, setAutoRenew] = useState(true);

  const refreshSubscriptionDetails = useCallback(async () => {
    try {
      const profile = await usersApi.getMe();
      setSubscriptionPlan(profile.subscriptionPlan ?? null);
      setSubscriptionExpiresAt(profile.subscriptionExpiresAt ?? null);
      setAutoRenew(profile.autoRenew);
    } catch {
      // Best-effort — the screen still works without the renewal details.
    }
  }, []);

  useEffect(() => {
    if (isPlus) {
      void refreshSubscriptionDetails();
    }
  }, [isPlus, refreshSubscriptionDetails]);

  const benefits = useMemo<SubscriptionBenefit[]>(
    () => [
      {
        id: 'vault-access',
        title: 'Vault Access',
        description: 'Create personal vaults with maturity goals and lock periods.',
        icon: 'lock-closed-outline',
        iconColor: colors.primary,
        iconBackground: colors.primaryBackground,
      },
      {
        id: 'group-vaults',
        title: 'Group Vaults',
        description: 'Save together with friends, family, or your chama.',
        icon: 'people-outline',
        iconColor: colors.purple,
        iconBackground: colors.purpleLight,
      },
      {
        id: 'priority-notifications',
        title: 'Priority Notifications',
        description: 'Get alerts first for vault maturity, votes, and milestones.',
        icon: 'notifications-outline',
        iconColor: colors.blue,
        iconBackground: colors.blueLight,
      },
      {
        id: 'vault-analytics',
        title: 'Vault Analytics',
        description: 'Track savings trends, projections, and group contributions.',
        icon: 'analytics-outline',
        iconColor: colors.warning,
        iconBackground: colors.warningLight,
      },
    ],
    [colors],
  );

  const comparisonRows = useMemo<PlanComparisonRow[]>(
    () => [
      {
        feature: 'Vault Access',
        freeLabel: 'Basic',
        plusLabel: 'Full',
        freeIncluded: true,
        plusIncluded: true,
      },
      {
        feature: 'Group Vaults',
        freeLabel: '—',
        plusLabel: 'Included',
        freeIncluded: false,
        plusIncluded: true,
      },
      {
        feature: 'Priority Notifications',
        freeLabel: '—',
        plusLabel: 'Included',
        freeIncluded: false,
        plusIncluded: true,
      },
      {
        feature: 'Vault Analytics',
        freeLabel: '—',
        plusLabel: 'Included',
        freeIncluded: false,
        plusIncluded: true,
      },
    ],
    [],
  );

  const planTitle = isPlus ? 'EcoSpend Plus' : 'Free Plan';
  const planSubtitle = isPlus
    ? 'Premium vault tools and insights are active on your account.'
    : 'Upgrade to unlock advanced savings features.';

  const renewsOn = formatRenewalDate(subscriptionExpiresAt);
  const activePrice = subscriptionPlan === 'MONTHLY' ? PLUS_MONTHLY_PRICE : PLUS_YEARLY_PRICE;
  const activePeriodLabel = subscriptionPlan === 'MONTHLY' ? 'month' : 'year';

  const confirmUpgrade = useCallback((plan: SubscriptionPlan): Promise<boolean> => {
    const price = plan === 'MONTHLY' ? PLUS_MONTHLY_PRICE : PLUS_YEARLY_PRICE;
    const period = plan === 'MONTHLY' ? 'month' : 'year';
    return new Promise((resolve) => {
      Alert.alert(
        'Upgrade to Plus?',
        `GHS ${price.toFixed(2)} will be deducted from your wallet now, then again every ${period} until you cancel auto-renewal.`,
        [
          { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
          { text: 'Upgrade', onPress: () => resolve(true) },
        ],
        { cancelable: true, onDismiss: () => resolve(false) },
      );
    });
  }, []);

  const handleUpgrade = useCallback(async () => {
    if (isPlus || isUpgrading) {
      return false;
    }

    const confirmed = await confirmUpgrade(selectedPlan);
    if (!confirmed) {
      return false;
    }

    setIsUpgrading(true);
    try {
      const ok = await upgradeToPlus(selectedPlan);
      if (ok) {
        // The upgrade charged the wallet and auto-recorded the expense —
        // refresh both so the UI reflects it immediately.
        void refreshWallet();
        void refreshTransactions();
        void refreshEnvelopes();
        void refreshSubscriptionDetails();
        const price = selectedPlan === 'MONTHLY' ? PLUS_MONTHLY_PRICE : PLUS_YEARLY_PRICE;
        Alert.alert(
          'Welcome to Plus!',
          `GHS ${price.toFixed(2)} was paid from your wallet.`,
        );
      }
      return ok;
    } catch (error) {
      Alert.alert(
        'Upgrade failed',
        getApiErrorMessage(error, 'Could not complete the payment'),
      );
      return false;
    } finally {
      setIsUpgrading(false);
    }
  }, [
    confirmUpgrade,
    isPlus,
    isUpgrading,
    refreshEnvelopes,
    refreshSubscriptionDetails,
    refreshTransactions,
    refreshWallet,
    selectedPlan,
    upgradeToPlus,
  ]);

  const handleCancelAutoRenew = useCallback(() => {
    Alert.alert(
      'Cancel auto-renewal?',
      renewsOn
        ? `Plus stays active until ${renewsOn}, then your account moves to the Free plan. You won't be charged again.`
        : "Plus stays active until your current period ends, then your account moves to the Free plan. You won't be charged again.",
      [
        { text: 'Keep auto-renewal', style: 'cancel' },
        {
          text: 'Cancel renewal',
          style: 'destructive',
          onPress: () => {
            void usersApi
              .cancelAutoRenew()
              .then(() => refreshSubscriptionDetails())
              .catch((error) => {
                Alert.alert('Could not cancel', getApiErrorMessage(error, 'Please try again'));
              });
          },
        },
      ],
    );
  }, [refreshSubscriptionDetails, renewsOn]);

  return {
    tier,
    isPlus,
    isUpgrading,
    benefits,
    comparisonRows,
    planTitle,
    planSubtitle,
    selectedPlan,
    setSelectedPlan,
    monthlyPrice: PLUS_MONTHLY_PRICE,
    yearlyPrice: PLUS_YEARLY_PRICE,
    yearlySavingsPercent: YEARLY_SAVINGS_PERCENT,
    activePrice,
    activePeriodLabel,
    renewsOn,
    autoRenew,
    handleUpgrade,
    handleCancelAutoRenew,
  };
}
