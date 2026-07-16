import { useMemo } from 'react';

import { useAuth } from '../context/AuthContext';
import { useGoals } from '../context/GoalsContext';
import { useVaults } from '../context/VaultContext';
import { mockUser } from '../data/mock/mockData';
import type { UserTier } from '../types';
import { capitalizeWords } from '../utils/strings';

export interface ProfileStats {
  goalsCompleted: number;
  vaultsCreated: number;
  savingsStreak: number;
}

export interface ProfileData {
  name: string;
  phone: string;
  formattedPhone: string;
  photoUrl?: string | null;
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
  const { completedGoals } = useGoals();
  const { vaults, groupVaults } = useVaults();

  return useMemo(() => {
    const name = capitalizeWords(user?.name ?? mockUser.name);
    const phone = user?.phone ?? mockUser.phone;

    return {
      name,
      phone,
      formattedPhone: formatPhone(phone),
      photoUrl: user?.photoUrl,
      tier,
      isPlus: tier === 'PLUS',
      stats: {
        goalsCompleted: completedGoals.length,
        vaultsCreated: vaults.length + groupVaults.length,
        savingsStreak: 12,
      },
    };
  }, [
    completedGoals.length,
    groupVaults.length,
    tier,
    user?.name,
    user?.phone,
    user?.photoUrl,
    vaults.length,
  ]);
}
