import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { getApiErrorMessage } from '../api/getApiErrorMessage';
import { useAuth } from '../context/AuthContext';
import { useEnvelopes } from '../context/EnvelopesContext';
import { useFinance } from '../context/FinanceContext';
import { useTheme } from '../context/ThemeContext';
import { useWallet } from '../context/WalletContext';

export const PLUS_ANNUAL_PRICE = 36;

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

export function useSubscription() {
  const { tier, upgradeToPlus } = useAuth();
  const { refreshWallet } = useWallet();
  const { refreshTransactions } = useFinance();
  const { refreshEnvelopes } = useEnvelopes();
  const { colors } = useTheme();
  const [isUpgrading, setIsUpgrading] = useState(false);

  const isPlus = tier === 'PLUS';

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

  const monthlyEquivalent = useMemo(
    () => (PLUS_ANNUAL_PRICE / 12).toFixed(2),
    [],
  );

  const confirmUpgrade = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      Alert.alert(
        'Upgrade to Plus?',
        `GHS ${PLUS_ANNUAL_PRICE.toFixed(2)} will be deducted from your wallet right away. This can't be undone.`,
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

    const confirmed = await confirmUpgrade();
    if (!confirmed) {
      return false;
    }

    setIsUpgrading(true);
    try {
      const ok = await upgradeToPlus();
      if (ok) {
        // The upgrade charged GHS 36 from the wallet and auto-recorded
        // the expense — refresh both so the UI reflects it immediately.
        void refreshWallet();
        void refreshTransactions();
        void refreshEnvelopes();
        Alert.alert(
          'Welcome to Plus!',
          `GHS ${PLUS_ANNUAL_PRICE.toFixed(2)} was paid from your wallet.`,
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
    refreshTransactions,
    refreshWallet,
    upgradeToPlus,
  ]);

  return {
    tier,
    isPlus,
    isUpgrading,
    benefits,
    comparisonRows,
    planTitle,
    planSubtitle,
    annualPrice: PLUS_ANNUAL_PRICE,
    monthlyEquivalent,
    handleUpgrade,
  };
}
