import { useCallback, useState } from 'react';

import { getApiErrorMessage } from '../api/getApiErrorMessage';
import * as paymentsApi from '../api/paymentsApi';
import { useFinance } from '../context/FinanceContext';
import { useWallet } from '../context/WalletContext';

export type MomoProvider = 'MTN' | 'TELECEL' | 'AT';

export const MOMO_PROVIDERS: { key: MomoProvider; label: string }[] = [
  { key: 'MTN', label: 'MTN MoMo' },
  { key: 'TELECEL', label: 'Telecel Cash' },
  { key: 'AT', label: 'AT Money' },
];

const GHANA_PHONE_PATTERN = /^(0|\+233)\d{9}$/;

export type SendMoneyPhase = 'input' | 'sending' | 'success' | 'failed';

/**
 * Wallet money-out: sends the amount to an external MoMo number via a
 * Paystack transfer (auto-succeeds in simulated mode). An EXPENSE
 * transaction is auto-recorded server-side.
 */
export function useSendMoney() {
  const { balance, refreshWallet } = useWallet();
  const { refreshTransactions } = useFinance();

  const [amount, setAmount] = useState('');
  const [momoNumber, setMomoNumber] = useState('');
  const [momoProvider, setMomoProvider] = useState<MomoProvider>('MTN');
  const [phase, setPhase] = useState<SendMoneyPhase>('input');
  const [error, setError] = useState<string | null>(null);

  const parsedAmount = parseFloat(amount);
  const isAmountValid = Number.isFinite(parsedAmount) && parsedAmount > 0;
  const walletBalance = balance ?? 0;
  const hasEnoughBalance = isAmountValid && parsedAmount <= walletBalance;

  const handleSend = useCallback(async () => {
    setError(null);

    if (!isAmountValid) {
      setError('Enter an amount greater than 0');
      return;
    }
    if (!hasEnoughBalance) {
      setError('Amount exceeds your wallet balance');
      return;
    }
    const trimmedNumber = momoNumber.trim();
    if (!GHANA_PHONE_PATTERN.test(trimmedNumber)) {
      setError('Enter a valid MoMo number (e.g. 0241234567)');
      return;
    }

    setPhase('sending');
    try {
      await paymentsApi.sendMoney({
        amount: parsedAmount,
        momoNumber: trimmedNumber,
        momoProvider,
      });
      setPhase('success');
      void refreshWallet();
      void refreshTransactions();
    } catch (err) {
      setPhase('failed');
      setError(getApiErrorMessage(err, 'Could not send the money'));
    }
  }, [
    hasEnoughBalance,
    isAmountValid,
    momoNumber,
    momoProvider,
    parsedAmount,
    refreshTransactions,
    refreshWallet,
  ]);

  const reset = useCallback(() => {
    setPhase('input');
    setError(null);
  }, []);

  return {
    walletBalance,
    amount,
    setAmount,
    momoNumber,
    setMomoNumber,
    momoProvider,
    setMomoProvider,
    parsedAmount,
    isAmountValid,
    hasEnoughBalance,
    phase,
    error,
    handleSend,
    reset,
  };
}
