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

  const parsedAmount = parseFloat(amount);
  const isAmountValid = Number.isFinite(parsedAmount) && parsedAmount > 0;
  const walletBalance = balance ?? 0;
  const hasEnoughBalance = isAmountValid && parsedAmount <= walletBalance;

  const handleDeposit = useCallback(async () => {
    if (!vault || !isAmountValid) {
      setError('Enter an amount greater than 0');
      return;
    }
    if (!hasEnoughBalance) {
      setError('Amount exceeds your wallet balance — top up first');
      return;
    }

    setPhase('processing');
    setError(null);
    try {
      await depositFromWallet(vault.id, parsedAmount);
      setPhase('success');
      void refreshWallet();
      void refreshTransactions();
      void refreshEnvelopes();
    } catch (err) {
      setPhase('failed');
      setError(getApiErrorMessage(err, 'Could not move money into the vault'));
    }
  }, [
    depositFromWallet,
    hasEnoughBalance,
    isAmountValid,
    parsedAmount,
    refreshEnvelopes,
    refreshTransactions,
    refreshWallet,
    vault,
  ]);

  const reset = useCallback(() => {
    setPhase('input');
    setError(null);
  }, []);

  return {
    vault,
    walletBalance,
    amount,
    setAmount,
    isAmountValid,
    hasEnoughBalance,
    parsedAmount,
    phase,
    error,
    handleDeposit,
    reset,
  };
}
