import { useCallback, useEffect, useRef, useState } from 'react';

import { getApiErrorMessage } from '../api/getApiErrorMessage';
import * as paymentsApi from '../api/paymentsApi';
import { useAuth } from '../context/AuthContext';
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
const POLL_INTERVAL_MS = 5000;
const MAX_POLLS = 24; // two minutes

export type SendMoneyPhase = 'input' | 'sending' | 'processing' | 'success' | 'failed';

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
  const { user, setMomoProvider: persistMomoProvider } = useAuth();

  const [amount, setAmount] = useState('');
  const [momoNumber, setMomoNumber] = useState('');
  const [momoProvider, setMomoProviderState] = useState<MomoProvider>('MTN');
  const [category, setCategory] = useState<TransactionCategory | null>(null);
  const [phase, setPhase] = useState<SendMoneyPhase>('input');
  const [error, setError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const pollCount = useRef(0);

  const parsedAmount = parseFloat(amount);
  const isAmountValid = Number.isFinite(parsedAmount) && parsedAmount > 0;
  const walletBalance = balance ?? 0;
  const hasEnoughBalance = isAmountValid && parsedAmount <= walletBalance;

  const ownPhone = user?.phone?.trim() ?? '';
  const isOwnNumber = momoNumber.trim().length > 0 && momoNumber.trim() === ownPhone;

  /** Fills the field with the account's own linked number — and its saved provider, if known — instead of typing it. */
  const useMyNumber = useCallback(() => {
    if (!ownPhone) {
      return;
    }
    setMomoNumber(ownPhone);
    if (user?.momoProvider && MOMO_PROVIDERS.some((p) => p.key === user.momoProvider)) {
      setMomoProviderState(user.momoProvider as MomoProvider);
    }
  }, [ownPhone, user?.momoProvider]);

  /**
   * Selecting a provider while the number matches the user's own is what
   * "links" it to the account — persisted silently so it's remembered
   * next time, with no separate settings screen needed.
   */
  const selectMomoProvider = useCallback(
    (provider: MomoProvider) => {
      setMomoProviderState(provider);
      if (momoNumber.trim() === ownPhone && ownPhone && provider !== user?.momoProvider) {
        void persistMomoProvider(provider).catch(() => undefined);
      }
    },
    [momoNumber, ownPhone, persistMomoProvider, user?.momoProvider],
  );

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
      const record = await paymentsApi.sendMoney({
        amount: parsedAmount,
        momoNumber: trimmedNumber,
        momoProvider,
        category,
      });
      // Paystack transfers are asynchronous — the request being accepted
      // doesn't mean the money has moved yet. If it's not already final,
      // poll until the webhook confirms it, instead of claiming success
      // for a transfer that might still fail.
      if (record.status === 'SUCCESS') {
        setPhase('success');
      } else if (record.status === 'FAILED') {
        setPhase('failed');
        setError('The transfer failed. Your wallet was not charged.');
      } else {
        pollCount.current = 0;
        setReference(record.reference);
        setPhase('processing');
      }
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

  const checkNow = useCallback(async () => {
    if (!reference) return;
    try {
      const record = await paymentsApi.getPayoutStatus(reference);
      if (record.status === 'SUCCESS') {
        setPhase('success');
        void refreshWallet();
        void refreshTransactions();
      } else if (record.status === 'FAILED') {
        setPhase('failed');
        setError("The transfer didn't go through — your wallet was refunded.");
        void refreshWallet();
      }
    } catch {
      // Transient network hiccup — the poll interval retries on its own.
    }
  }, [reference, refreshTransactions, refreshWallet]);

  useEffect(() => {
    if (phase !== 'processing') {
      return;
    }

    const timer = setInterval(() => {
      pollCount.current += 1;
      if (pollCount.current > MAX_POLLS) {
        clearInterval(timer);
        setPhase('failed');
        setError(
          "This is taking longer than usual to confirm. Check your transaction history in a moment — if it didn't go through, your wallet is automatically refunded.",
        );
        return;
      }
      void checkNow();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [checkNow, phase]);

  const reset = useCallback(() => {
    setPhase('input');
    setError(null);
    setReference(null);
  }, []);

  return {
    walletBalance,
    amount,
    setAmount,
    momoNumber,
    setMomoNumber,
    momoProvider,
    setMomoProvider: selectMomoProvider,
    category,
    setCategory,
    parsedAmount,
    isAmountValid,
    hasEnoughBalance,
    phase,
    error,
    handleSend,
    reset,
    ownPhone,
    isOwnNumber,
    useMyNumber,
  };
}
