import { useCallback, useEffect, useRef, useState } from 'react';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import { getApiErrorMessage } from '../api/getApiErrorMessage';
import * as paymentsApi from '../api/paymentsApi';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';
import { useWallet } from '../context/WalletContext';

export type TopUpPhase =
  | 'input'      // entering an amount
  | 'starting'   // initializing the Paystack transaction
  | 'awaiting'   // checkout opened in browser; polling for confirmation
  | 'success'    // deposit verified and wallet credited
  | 'failed';

const POLL_INTERVAL_MS = 5000;
const MAX_POLLS = 36; // three minutes

/**
 * Paystack-backed wallet top-up. The wallet balance is only credited after
 * the payment service verifies the charge — never from this client. An
 * INCOME transaction is auto-recorded server-side.
 */
export function useTopUp() {
  const { balance, refreshWallet } = useWallet();
  const { refreshTransactions } = useFinance();
  const { user } = useAuth();

  const [amount, setAmount] = useState('');
  const [phase, setPhase] = useState<TopUpPhase>('input');
  const [error, setError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const pollCount = useRef(0);

  const parsedAmount = parseFloat(amount);
  const isAmountValid = Number.isFinite(parsedAmount) && parsedAmount > 0;

  const finishSuccess = useCallback(() => {
    setPhase('success');
    void refreshWallet();
    void refreshTransactions();
  }, [refreshTransactions, refreshWallet]);

  const handlePay = useCallback(async () => {
    if (!isAmountValid) {
      setError('Enter an amount greater than 0');
      return;
    }

    setPhase('starting');
    setError(null);
    try {
      // Computed once and sent to the backend so Paystack's callback_url
      // always matches what openAuthSessionAsync below is listening for —
      // Linking.createURL resolves to a different scheme in Expo Go than
      // in a standalone build, so the server can't hardcode this.
      const redirectUrl = Linking.createURL('payments/callback');
      const deposit = await paymentsApi.initializeTopUp({
        amount: parsedAmount,
        redirectUrl,
        phone: user?.phone,
      });
      setReference(deposit.reference);

      // In simulated mode (no Paystack key on the backend) the very first
      // verify succeeds, so the user never leaves the app.
      const verified = await paymentsApi.verifyDeposit(deposit.reference);
      if (verified.status === 'SUCCESS') {
        finishSuccess();
        return;
      }
      if (verified.status === 'FAILED') {
        setPhase('failed');
        setError('The payment was declined. No money left your MoMo wallet.');
        return;
      }

      // Real checkout: open the Paystack page inside the app. The poll loop
      // (keyed on phase 'awaiting') is the fallback confirmation path.
      pollCount.current = 0;
      setPhase('awaiting');
      if (deposit.authorizationUrl) {
        // Paystack redirects here after checkout; the in-app browser closes
        // itself when it sees this URL, since it's the same one we sent as
        // callback_url when initializing the transaction above.
        try {
          await WebBrowser.openAuthSessionAsync(deposit.authorizationUrl, redirectUrl);
        } catch {
          // Could not open the in-app browser — the poll loop still confirms.
        }

        // Back in the app (completed, redirected, or dismissed): verify once
        // immediately so a finished payment reflects without waiting for a poll.
        const settled = await paymentsApi.verifyDeposit(deposit.reference);
        if (settled.status === 'SUCCESS') {
          finishSuccess();
        } else if (settled.status === 'FAILED') {
          setPhase('failed');
          setError('The payment was declined. No money left your MoMo wallet.');
        }
      }
    } catch (err) {
      setPhase('failed');
      setError(getApiErrorMessage(err, 'Could not start the top-up'));
    }
  }, [finishSuccess, isAmountValid, parsedAmount, user?.phone]);

  const checkNow = useCallback(async () => {
    if (!reference) return;
    try {
      const deposit = await paymentsApi.verifyDeposit(reference);
      if (deposit.status === 'SUCCESS') {
        finishSuccess();
      } else if (deposit.status === 'FAILED') {
        setPhase('failed');
        setError('The payment was declined. No money left your MoMo wallet.');
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not check the payment status'));
    }
  }, [finishSuccess, reference]);

  useEffect(() => {
    if (phase !== 'awaiting') {
      return;
    }

    const timer = setInterval(() => {
      pollCount.current += 1;
      if (pollCount.current > MAX_POLLS) {
        clearInterval(timer);
        setPhase('failed');
        setError(
          'The payment was not confirmed in time. If you completed it, tap "Check status" — your money is safe either way.',
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
    walletBalance: balance,
    amount,
    setAmount,
    isAmountValid,
    parsedAmount,
    phase,
    error,
    handlePay,
    checkNow,
    reset,
  };
}
