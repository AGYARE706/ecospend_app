import type { Vault } from '../types/vault';

export function getVaultProgress(vault: Vault): number {
  if (vault.targetAmount <= 0) {
    return 0;
  }

  return Math.min(
    100,
    Math.round((vault.currentBalance / vault.targetAmount) * 100),
  );
}

export function getDaysRemaining(maturityDate: string, referenceDate = new Date()): number {
  const maturity = new Date(maturityDate);
  const diffMs = maturity.getTime() - referenceDate.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

export function formatVaultDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-GH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDaysRemaining(days: number): string {
  if (days === 0) {
    return 'Matures today';
  }

  if (days === 1) {
    return '1 day left';
  }

  return `${days} days left`;
}

/**
 * Mirrors the backend's group-vault fee tiers exactly (Fees.java, used by
 * GroupVaultService.execute()/exit()): early beats the lock date entirely
 * (5%); on-time-but-the-group-never-hit-its-target is a shortfall (4%);
 * on-time-and-target-met is the standard rate (2%).
 */
export function groupWithdrawalFeeRate(group: {
  maturityDate: string;
  amountSaved: number;
  targetAmount: number;
}): number {
  const isEarly = new Date() < new Date(group.maturityDate);
  if (isEarly) {
    return 0.05;
  }
  const isShortfall = group.targetAmount > 0 && group.amountSaved < group.targetAmount;
  return isShortfall ? 0.04 : 0.02;
}
