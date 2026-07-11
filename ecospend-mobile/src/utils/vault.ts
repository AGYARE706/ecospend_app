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
