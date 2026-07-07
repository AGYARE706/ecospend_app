import { useCallback, useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { MOCK_SAVE_DELAY_MS } from '../data/mock/mockData';

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

  const handleUpgrade = useCallback(async () => {
    if (isPlus || isUpgrading) {
      return false;
    }

    setIsUpgrading(true);
    await new Promise((resolve) => setTimeout(resolve, MOCK_SAVE_DELAY_MS));
    const success = upgradeToPlus();
    setIsUpgrading(false);
    return success;
  }, [isPlus, isUpgrading, upgradeToPlus]);

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
