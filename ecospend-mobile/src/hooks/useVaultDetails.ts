import { useMemo } from 'react';

import { useVaults } from '../context/VaultContext';
import type { Vault } from '../types/vault';
import {
  formatVaultDate,
  getDaysRemaining,
  getVaultProgress,
} from '../utils/vault';

const ON_TIME_RATE = 0.02;
const EARLY_RATE = 0.05;

export interface VaultFeeDetails {
  onTimeRate: number;
  earlyRate: number;
  onTimeFeeGhs: number;
  earlyFeeGhs: number;
  onTimeNetGhs: number;
  earlyNetGhs: number;
}

export interface VaultStats {
  amountSaved: number;
  remainingAmount: number;
  dailySavingsNeeded: number;
  progressPct: number;
}

export interface VaultDetailsData {
  vault: Vault;
  progress: number;
  daysRemaining: number;
  fees: VaultFeeDetails;
  stats: VaultStats;
  formattedMaturity: string;
  formattedCreated: string;
  isMatured: boolean;
  isOnTrack: boolean;
  isFound: boolean;
}

export function useVaultDetails(vaultId: string): VaultDetailsData {
  const { getVaultById, vaults } = useVaults();
  const vault = getVaultById(vaultId) ?? vaults[0];
  const isFound = Boolean(getVaultById(vaultId));

  return useMemo(() => {
    if (!vault) {
      return {
        vault: {
          id: vaultId,
          name: 'Unknown Vault',
          currentBalance: 0,
          targetAmount: 0,
          maturityDate: new Date().toISOString().slice(0, 10),
          createdDate: new Date().toISOString().slice(0, 10),
          estimatedWithdrawalFee: 0,
          status: 'pending' as const,
          accentColor: '#2E7D32',
          contributions: [],
        },
        progress: 0,
        daysRemaining: 0,
        fees: {
          onTimeRate: ON_TIME_RATE,
          earlyRate: EARLY_RATE,
          onTimeFeeGhs: 0,
          earlyFeeGhs: 0,
          onTimeNetGhs: 0,
          earlyNetGhs: 0,
        },
        stats: {
          amountSaved: 0,
          remainingAmount: 0,
          dailySavingsNeeded: 0,
          progressPct: 0,
        },
        formattedMaturity: '',
        formattedCreated: '',
        isMatured: false,
        isOnTrack: false,
        isFound: false,
      };
    }

    const progress = getVaultProgress(vault);
    const daysRemaining = getDaysRemaining(vault.maturityDate);
    const remaining = Math.max(0, vault.targetAmount - vault.currentBalance);

    const dailySavingsNeeded =
      daysRemaining > 0 && remaining > 0
        ? Math.ceil(remaining / daysRemaining)
        : 0;

    const onTimeFeeGhs = vault.currentBalance * ON_TIME_RATE;
    const earlyFeeGhs = vault.currentBalance * EARLY_RATE;

    const totalDays =
      getDaysRemaining(vault.createdDate, new Date(vault.maturityDate)) || 1;
    const elapsedDays = totalDays - daysRemaining;
    const expectedByNow = vault.targetAmount * (elapsedDays / totalDays);
    const isOnTrack = vault.currentBalance >= expectedByNow;

    return {
      vault,
      progress,
      daysRemaining,
      fees: {
        onTimeRate: ON_TIME_RATE,
        earlyRate: EARLY_RATE,
        onTimeFeeGhs,
        earlyFeeGhs,
        onTimeNetGhs: vault.currentBalance - onTimeFeeGhs,
        earlyNetGhs: vault.currentBalance - earlyFeeGhs,
      },
      stats: {
        amountSaved: vault.currentBalance,
        remainingAmount: remaining,
        dailySavingsNeeded,
        progressPct: progress,
      },
      formattedMaturity: formatVaultDate(vault.maturityDate),
      formattedCreated: formatVaultDate(vault.createdDate),
      isMatured: vault.status === 'matured',
      isOnTrack,
      isFound,
    };
  }, [isFound, vault, vaultId]);
}
