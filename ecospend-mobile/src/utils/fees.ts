import type { ProviderType } from '../types';

const LARGE_TRANSFER_THRESHOLD = 10000;

export function isLargeTransfer(amount: number): boolean {
  return amount > LARGE_TRANSFER_THRESHOLD;
}

export function getProviderTip(provider: ProviderType): string {
  if (provider === 'MTN MoMo') {
    return 'MTN MoMo fees are capped at GHS 10 for larger amounts. Sending larger amounts saves you proportionally.';
  }

  if (provider === 'Telecel Cash') {
    return 'Telecel Cash rates mirror MTN MoMo. Check the Telecel app for the latest fee schedule.';
  }

  return 'AT Money rates are approximate. Always confirm the fee in your AT Money app before sending.';
}
