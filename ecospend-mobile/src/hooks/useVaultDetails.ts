import { useMemo } from 'react';

import { mockVaults } from '../data/mock/vaults';
import type { Vault } from '../types/vault';
import {
  formatVaultDate,
  getDaysRemaining,
  getVaultProgress,
} from '../utils/vault';

// ─── Fee rates (matches CreateVault) ─────────────────────────────────────────
const ON_TIME_RATE = 0.02;
const EARLY_RATE = 0.05;

// ─── Derived interfaces ───────────────────────────────────────────────────────
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
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useVaultDetails(vaultId: string): VaultDetailsData {
  const vault: Vault =
    mockVaults.find((v) => v.id === vaultId) ?? mockVaults[0]!;

  return useMemo(() => {
    const progress = getVaultProgress(vault);
    const daysRemaining = getDaysRemaining(vault.maturityDate);
    const remaining = Math.max(0, vault.targetAmount - vault.currentBalance);

    const dailySavingsNeeded =
      daysRemaining > 0 && remaining > 0
        ? Math.ceil(remaining / daysRemaining)
        : 0;

    const onTimeFeeGhs = vault.currentBalance * ON_TIME_RATE;
    const earlyFeeGhs = vault.currentBalance * EARLY_RATE;

    // Simple "on track" heuristic: saved at least as much as time elapsed implies
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
    };
  }, [vault]);
}
