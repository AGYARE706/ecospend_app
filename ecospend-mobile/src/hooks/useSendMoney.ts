import { useCallback, useState } from 'react';

import { getApiErrorMessage } from '../api/getApiErrorMessage';
import * as paymentsApi from '../api/paymentsApi';
import { useEnvelopes } from '../context/EnvelopesContext';
import { useFinance } from '../context/FinanceContext';
import { useWallet } from '../context/WalletContext';
import type { TransactionCategory } from '../types';

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
 * Paystack transfer (auto-succeeds in simulated mode). The user must
 * say what the money is for — the category lands on the auto-recorded
 * EXPENSE so budget analysis stays meaningful.
 */
export function useSendMoney() {
  const { balance, refreshWallet } = useWallet();
  const { refreshTransactions } = useFinance();
  const { refreshEnvelopes } = useEnvelopes();

  const [amount, setAmount] = useState('');
  const [momoNumber, setMomoNumber] = useState('');
  const [momoProvider, setMomoProvider] = useState<MomoProvider>('MTN');
  const [category, setCategory] = useState<TransactionCategory | null>(null);
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
    if (!category) {
      setError('Select what you are spending on');
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
        category,
      });
      setPhase('success');
      void refreshWallet();
      void refreshTransactions();
      // The send was tagged with a spending category — reflect it against
      // that category's budget envelope, if the user tracks one.
      void refreshEnvelopes();
    } catch (err) {
      setPhase('failed');
      setError(getApiErrorMessage(err, 'Could not send the money'));
    }
  }, [
    category,
    hasEnoughBalance,
    isAmountValid,
    momoNumber,
    momoProvider,
    parsedAmount,
    refreshEnvelopes,
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
    category,
    setCategory,
    parsedAmount,
    isAmountValid,
    hasEnoughBalance,
    phase,
    error,
    handleSend,
    reset,
  };
}
