import { useMemo } from 'react';

import { useAuth } from '../context/AuthContext';
import { mockGroupVaults } from '../data/mock/groupVaults';
import { mockUser, mockSavingsGoals } from '../data/mock/mockData';
import { mockVaults } from '../data/mock/vaults';
import type { UserTier } from '../types';

export interface ProfileStats {
  goalsCompleted: number;
  vaultsCreated: number;
  savingsStreak: number;
}

export interface ProfileData {
  name: string;
  phone: string;
  formattedPhone: string;
  tier: UserTier;
  isPlus: boolean;
  stats: ProfileStats;
}

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');

  if (digits.length === 10 && digits.startsWith('0')) {
    const local = digits.slice(1);
    return `+233 ${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5)}`;
  }

  if (digits.length === 12 && digits.startsWith('233')) {
    const local = digits.slice(3);
    return `+233 ${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5)}`;
  }

  return phone;
}

export function useProfile(): ProfileData {
  const { user, tier } = useAuth();

  return useMemo(() => {
    const name = user?.name ?? mockUser.name;
    const phone = user?.phone ?? mockUser.phone;

    const goalsCompleted = mockSavingsGoals.filter(
      (goal) => goal.completedAt != null,
    ).length;

    return {
      name,
      phone,
      formattedPhone: formatPhone(phone),
      tier,
      isPlus: tier === 'PLUS',
      stats: {
        goalsCompleted,
        vaultsCreated: mockVaults.length + mockGroupVaults.length,
        savingsStreak: 12,
      },
    };
  }, [tier, user?.name, user?.phone]);
}
