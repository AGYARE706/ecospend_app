import { useEffect, useState } from 'react';

import { getMomoFee } from '../api/financeApi';
import type { Provider } from '../types';

export interface FeePreview {
  providerFee: number;
  totalCost: number;
}

const FEE_DEBOUNCE_MS = 300;

/**
 * Debounced live MoMo fee preview via /api/finance/momo-fee.
 * Returns null while the inputs are incomplete or the lookup fails,
 * so callers can simply hide the fee card.
 */
export function useLiveMomoFee(
  amount: number,
  provider: Provider | null,
  enabled: boolean,
): FeePreview | null {
  const [preview, setPreview] = useState<FeePreview | null>(null);

  useEffect(() => {
    if (!enabled || !provider || !Number.isFinite(amount) || amount <= 0) {
      setPreview(null);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(() => {
      void (async () => {
        try {
          const providerFee = await getMomoFee(amount, provider);
          if (!cancelled) {
            setPreview({ providerFee, totalCost: amount + providerFee });
          }
        } catch {
          if (!cancelled) {
            setPreview(null);
          }
        }
      })();
    }, FEE_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [amount, enabled, provider]);

  return preview;
}
