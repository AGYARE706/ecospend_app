import { useCallback, useMemo, useState } from 'react';
import type { StackNavigationProp } from '@react-navigation/stack';

import { useFinance } from '../context/FinanceContext';
import { useVaults } from '../context/VaultContext';
import { useWallet } from '../context/WalletContext';
import { getApiErrorMessage } from '../api/getApiErrorMessage';
import type { AppStackParamList } from '../navigation/types';
import type { Vault } from '../types/vault';
import { formatVaultDate, getDaysRemaining } from '../utils/vault';

export const ON_TIME_FEE_RATE = 0.02;
export const EARLY_FEE_RATE = 0.05;

export type WithdrawalType = 'matured' | 'early';

export interface WithdrawalFeeBreakdown {
  balance: number;
  feeRate: number;
  feeAmount: number;
  netAmount: number;
  type: WithdrawalType;
}

export interface WithdrawVaultData {
  vault: Vault;
  withdrawalType: WithdrawalType;
  daysRemaining: number;
  fees: WithdrawalFeeBreakdown;
  formattedMaturity: string;
  formattedCreated: string;
  isConfirmed: boolean;
  isLoading: boolean;
  toggleConfirm: () => void;
  handleConfirm: () => Promise<void>;
}

type WithdrawNavProp = StackNavigationProp<AppStackParamList, 'WithdrawVault'>;

export function useWithdrawVault(
  vaultId: string,
  navigation: WithdrawNavProp,
): WithdrawVaultData {
  const { getVaultById, vaults, withdrawVault } = useVaults();
  const { refreshWallet } = useWallet();
  const { refreshTransactions } = useFinance();
  const vault: Vault = getVaultById(vaultId) ?? vaults[0]!;

  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const daysRemaining = useMemo(
    () => getDaysRemaining(vault.maturityDate),
    [vault.maturityDate],
  );

  const withdrawalType: WithdrawalType =
    vault.status === 'matured' || daysRemaining <= 0 ? 'matured' : 'early';

  const feeRate =
    withdrawalType === 'matured' ? ON_TIME_FEE_RATE : EARLY_FEE_RATE;
  const feeAmount = vault.currentBalance * feeRate;
  const netAmount = vault.currentBalance - feeAmount;

  const fees: WithdrawalFeeBreakdown = {
    balance: vault.currentBalance,
    feeRate,
    feeAmount,
    netAmount,
    type: withdrawalType,
  };

  const toggleConfirm = useCallback(() => {
    setIsConfirmed((prev) => !prev);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!isConfirmed) return;

    setIsLoading(true);
    try {
      await withdrawVault(vault.id, netAmount, feeAmount, withdrawalType);
      void refreshWallet();
      void refreshTransactions();
      navigation.replace('VaultSuccess', {
        isWithdrawal: true,
        vaultName: vault.name,
        amountReceived: netAmount,
        feeCharged: feeAmount,
        message: 'The net amount has been credited to your wallet.',
        vaultId: vault.id,
      });
    } catch (error) {
      console.warn(getApiErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [
    feeAmount,
    isConfirmed,
    navigation,
    netAmount,
    refreshTransactions,
    refreshWallet,
    vault.id,
    vault.name,
    withdrawalType,
    withdrawVault,
  ]);

  return {
    vault,
    withdrawalType,
    daysRemaining,
    fees,
    formattedMaturity: formatVaultDate(vault.maturityDate),
    formattedCreated: formatVaultDate(vault.createdDate),
    isConfirmed,
    isLoading,
    toggleConfirm,
    handleConfirm,
  };
}
