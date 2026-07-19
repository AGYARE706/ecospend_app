import { useMemo } from 'react';

import { useVaults } from '../context/VaultContext';
import type { Vault } from '../types/vault';
import {
  formatVaultDate,
  getDaysRemaining,
  getVaultProgress,
} from '../utils/vault';

const ON_TIME_RATE = 0.02;
const SHORTFALL_RATE = 0.04;
const EARLY_RATE = 0.05;

export interface VaultFeeDetails {
  /** The rate that would actually apply to an on-time withdrawal right now — 2% if target is met, 4% if not. */
  onTimeRate: number;
  /** True when the on-time rate above is the 4% shortfall tier rather than the standard 2%. */
  onTimeIsShortfall: boolean;
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
          onTimeIsShortfall: false,
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

    const onTimeIsShortfall = vault.targetAmount > 0 && vault.currentBalance < vault.targetAmount;
    const onTimeRate = onTimeIsShortfall ? SHORTFALL_RATE : ON_TIME_RATE;
    const onTimeFeeGhs = vault.currentBalance * onTimeRate;
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
        onTimeRate,
        onTimeIsShortfall,
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
