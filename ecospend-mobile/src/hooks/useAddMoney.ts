import { useCallback, useEffect, useRef, useState } from 'react';
import { Linking } from 'react-native';

import { getApiErrorMessage } from '../api/getApiErrorMessage';
import { useVaults } from '../context/VaultContext';
import type { Vault } from '../types/vault';

export type AddMoneyPhase =
  | 'input'      // entering an amount
  | 'starting'   // initializing the Paystack transaction
  | 'awaiting'   // checkout opened in browser; polling for confirmation
  | 'success'    // deposit verified and vault credited
  | 'failed';

const POLL_INTERVAL_MS = 5000;
const MAX_POLLS = 36; // three minutes

/**
 * Paystack-backed vault funding. The vault balance is only credited after
 * the payment service verifies the charge — never from this client.
 */
export function useAddMoney(vaultId: string) {
  const { getVaultById, vaults, startPaystackDeposit, verifyPaystackDeposit } =
    useVaults();
  const vault: Vault | undefined = getVaultById(vaultId) ?? vaults[0];

  const [amount, setAmount] = useState('');
  const [phase, setPhase] = useState<AddMoneyPhase>('input');
  const [error, setError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const pollCount = useRef(0);

  const parsedAmount = parseFloat(amount);
  const isAmountValid = Number.isFinite(parsedAmount) && parsedAmount > 0;

  const handlePay = useCallback(async () => {
    if (!vault || !isAmountValid) {
      setError('Enter an amount greater than 0');
      return;
    }

    setPhase('starting');
    setError(null);
    try {
      const deposit = await startPaystackDeposit(vault.id, parsedAmount);
      setReference(deposit.reference);

      // In simulated mode (no Paystack key on the backend) the very first
      // verify succeeds, so the user never leaves the app.
      const verified = await verifyPaystackDeposit(deposit.reference);
      if (verified.status === 'SUCCESS') {
        setPhase('success');
        return;
      }
      if (verified.status === 'FAILED') {
        setPhase('failed');
        setError('The payment was declined. No money left your wallet.');
        return;
      }

      // Real checkout: open the Paystack page and poll until it settles.
      if (deposit.authorizationUrl) {
        await Linking.openURL(deposit.authorizationUrl);
      }
      pollCount.current = 0;
      setPhase('awaiting');
    } catch (err) {
      setPhase('failed');
      setError(getApiErrorMessage(err, 'Could not start the deposit'));
    }
  }, [
    isAmountValid,
    parsedAmount,
    startPaystackDeposit,
    vault,
    verifyPaystackDeposit,
  ]);

  const checkNow = useCallback(async () => {
    if (!reference) return;
    try {
      const deposit = await verifyPaystackDeposit(reference);
      if (deposit.status === 'SUCCESS') {
        setPhase('success');
      } else if (deposit.status === 'FAILED') {
        setPhase('failed');
        setError('The payment was declined. No money left your wallet.');
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not check the payment status'));
    }
  }, [reference, verifyPaystackDeposit]);

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
    vault,
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
