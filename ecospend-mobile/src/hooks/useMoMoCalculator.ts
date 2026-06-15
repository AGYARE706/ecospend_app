import { useMemo, useState } from 'react';

import type { ProviderType } from '../types';
import { calculateFee, getProviderTip, isLargeTransfer } from '../utils/fees';

/**
 * Manages MoMo fee calculator state and instant tier-based fee calculation.
 */
export function useMoMoCalculator() {
  const [selectedProvider, setProvider] = useState<ProviderType>('MTN MoMo');
  const [amount, setAmount] = useState('');

  const parsedAmount = useMemo(() => {
    const value = parseFloat(amount);
    return Number.isFinite(value) ? value : 0;
  }, [amount]);

  const feeResult = useMemo(
    () => calculateFee(parsedAmount, selectedProvider),
    [parsedAmount, selectedProvider],
  );

  const hasResult = parsedAmount > 0;
  const largeTransfer = isLargeTransfer(parsedAmount);
  const providerTip = useMemo(
    () => getProviderTip(selectedProvider),
    [selectedProvider],
  );

  return {
    selectedProvider,
    setProvider,
    amount,
    setAmount,
    fee: feeResult.fee,
    totalCost: feeResult.totalCost,
    hasResult,
    isLargeTransfer: largeTransfer,
    providerTip,
  };
}
