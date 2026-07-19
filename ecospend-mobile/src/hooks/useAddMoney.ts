import { useCallback, useState } from 'react';

import { getApiErrorMessage } from '../api/getApiErrorMessage';
import { useEnvelopes } from '../context/EnvelopesContext';
import { useFinance } from '../context/FinanceContext';
import { useVaults } from '../context/VaultContext';
import { useWallet } from '../context/WalletContext';
import type { Vault } from '../types/vault';

export type AddMoneyPhase =
  | 'input'       // entering an amount
  | 'processing'  // moving money from the wallet into the vault
  | 'success'
  | 'failed';

/**
 * Wallet-funded vault deposit: the amount is debited from the central
 * wallet and credited to the vault in one server-side transaction. An
 * EXPENSE (Savings) transaction is auto-recorded.
 */
export function useAddMoney(vaultId: string) {
  const { getVaultById, vaults, depositFromWallet } = useVaults();
  const { balance, refreshWallet } = useWallet();
  const { refreshTransactions } = useFinance();
  const { refreshEnvelopes } = useEnvelopes();
  const vault: Vault | undefined = getVaultById(vaultId) ?? vaults[0];

  const [amount, setAmount] = useState('');
  const [phase, setPhase] = useState<AddMoneyPhase>('input');
  const [error, setError] = useState<string | null>(null);
  const [justCompleted, setJustCompleted] = useState(false);

  const parsedAmount = parseFloat(amount);
  const isAmountValid = Number.isFinite(parsedAmount) && parsedAmount > 0;
  const walletBalance = balance ?? 0;
  const hasEnoughBalance = isAmountValid && parsedAmount <= walletBalance;
  const remaining = vault && vault.targetAmount > 0
    ? Math.max(vault.targetAmount - vault.currentBalance, 0)
    : Infinity;
  const exceedsRemaining = isAmountValid && parsedAmount > remaining;

  const handleDeposit = useCallback(async () => {
    if (!vault || !isAmountValid) {
      setError('Enter an amount greater than 0');
      return;
    }
    if (exceedsRemaining) {
      setError(
        remaining <= 0
          ? 'This vault has already hit its target — no further deposits accepted'
          : `That's more than this vault needs — enter GHS ${remaining.toFixed(2)} or less`,
      );
      return;
    }
    if (!hasEnoughBalance) {
      setError('Amount exceeds your wallet balance — top up first');
      return;
    }

    const wasComplete = vault.targetAmount > 0 && vault.currentBalance >= vault.targetAmount;

    setPhase('processing');
    setError(null);
    try {
      const updated = await depositFromWallet(vault.id, parsedAmount);
      setPhase('success');
      setJustCompleted(
        updated.targetAmount > 0 && updated.currentBalance >= updated.targetAmount && !wasComplete,
      );
      void refreshWallet();
      void refreshTransactions();
      void refreshEnvelopes();
    } catch (err) {
      setPhase('failed');
      setError(getApiErrorMessage(err, 'Could not move money into the vault'));
    }
  }, [
    depositFromWallet,
    exceedsRemaining,
    hasEnoughBalance,
    isAmountValid,
    parsedAmount,
    refreshEnvelopes,
    refreshTransactions,
    refreshWallet,
    remaining,
    vault,
  ]);

  const reset = useCallback(() => {
    setPhase('input');
    setError(null);
    setJustCompleted(false);
  }, []);

  return {
    vault,
    walletBalance,
    amount,
    setAmount,
    isAmountValid,
    hasEnoughBalance,
    remaining,
    exceedsRemaining,
    parsedAmount,
    phase,
    error,
    justCompleted,
    handleDeposit,
    reset,
  };
}
