import { mockFeeSchedules } from '../data/mock/mockData';
import type { FeeResult, FeeSchedule, Provider, ProviderType } from '../types';

const LARGE_TRANSFER_THRESHOLD = 10000;

export function calculateFeeFromSchedule(
  amount: number,
  schedule: FeeSchedule,
): FeeResult {
  if (amount <= 0) {
    return { fee: 0, totalCost: 0, amount, provider: schedule.provider };
  }

  const tier = schedule.tiers.find((item) => {
    const withinMin = amount >= item.minAmount;
    const withinMax = item.maxAmount === null || amount <= item.maxAmount;
    return withinMin && withinMax;
  });

  if (!tier) {
    return { fee: 0, totalCost: amount, amount, provider: schedule.provider };
  }

  let fee = 0;

  if (tier.flatFee !== undefined) {
    fee = tier.flatFee;
  } else if (tier.percentRate !== undefined) {
    fee = amount * tier.percentRate;
    if (tier.maxFee !== undefined) {
      fee = Math.min(fee, tier.maxFee);
    }
  }

  return {
    fee,
    totalCost: amount + fee,
    amount,
    provider: schedule.provider,
  };
}

export function calculateFee(amount: number, provider: ProviderType): FeeResult {
  const schedule = mockFeeSchedules.find((item) => item.provider === provider);

  if (!schedule) {
    return { fee: 0, totalCost: amount, amount, provider };
  }

  return calculateFeeFromSchedule(amount, schedule);
}

/** @deprecated Use calculateFee for tier-based fees */
export function calculateMoMoFee(amount: number, provider: Provider): number {
  return calculateFee(amount, provider).fee;
}

export function isLargeTransfer(amount: number): boolean {
  return amount > LARGE_TRANSFER_THRESHOLD;
}

export function getProviderTip(provider: ProviderType): string {
  if (provider === 'MTN MoMo') {
    return 'MTN MoMo fees are capped at GHS 20 for amounts above GHS 1,000. Sending larger amounts saves you proportionally.';
  }

  if (provider === 'Telecel Cash') {
    return 'Telecel Cash rates mirror MTN MoMo. Check the Telecel app for the latest fee schedule.';
  }

  return 'AT Money rates are approximate. Always confirm the fee in your AT Money app before sending.';
}
