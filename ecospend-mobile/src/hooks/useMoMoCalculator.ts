import { useEffect, useMemo, useState } from 'react';

import { getMomoFee } from '../api/financeApi';
import { getApiErrorMessage } from '../api/getApiErrorMessage';
import type { ProviderType } from '../types';
import { getProviderTip, isLargeTransfer } from '../utils/fees';

/**
 * Manages MoMo fee calculator state via live /api/finance/momo-fee.
 */
export function useMoMoCalculator() {
  const [selectedProvider, setProvider] = useState<ProviderType>('MTN MoMo');
  const [amount, setAmount] = useState('');
  const [fee, setFee] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const parsedAmount = useMemo(() => {
    const value = parseFloat(amount);
    return Number.isFinite(value) ? value : 0;
  }, [amount]);

  useEffect(() => {
    if (parsedAmount <= 0) {
      setFee(0);
      setError(null);
      setIsCalculating(false);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(() => {
      setIsCalculating(true);
      void (async () => {
        try {
          const nextFee = await getMomoFee(parsedAmount, selectedProvider);
          if (!cancelled) {
            setFee(nextFee);
            setError(null);
          }
        } catch (err) {
          if (!cancelled) {
            setFee(0);
            setError(getApiErrorMessage(err, 'Could not calculate fee'));
          }
        } finally {
          if (!cancelled) {
            setIsCalculating(false);
          }
        }
      })();
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [parsedAmount, selectedProvider]);

  const totalCost = parsedAmount + fee;
  const hasResult = parsedAmount > 0 && !error;
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
    fee,
    totalCost,
    hasResult,
    isLargeTransfer: largeTransfer,
    providerTip,
    error,
    isCalculating,
  };
}
