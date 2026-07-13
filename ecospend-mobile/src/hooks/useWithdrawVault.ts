import { useCallback, useMemo, useState } from 'react';
import type { StackNavigationProp } from '@react-navigation/stack';

import { useVaults } from '../context/VaultContext';
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
  momoNumber: string;
  momoProvider: MomoProvider;
  momoError: string | null;
  setMomoNumber: (value: string) => void;
  setMomoProvider: (value: MomoProvider) => void;
  toggleConfirm: () => void;
  handleConfirm: () => Promise<void>;
}

export type MomoProvider = 'MTN' | 'TELECEL' | 'AT';

export const MOMO_PROVIDERS: { key: MomoProvider; label: string }[] = [
  { key: 'MTN', label: 'MTN MoMo' },
  { key: 'TELECEL', label: 'Telecel Cash' },
  { key: 'AT', label: 'AT Money' },
];

const GHANA_PHONE_PATTERN = /^(0|\+233)\d{9}$/;

type WithdrawNavProp = StackNavigationProp<AppStackParamList, 'WithdrawVault'>;

export function useWithdrawVault(
  vaultId: string,
  navigation: WithdrawNavProp,
): WithdrawVaultData {
  const { getVaultById, vaults, withdrawVault } = useVaults();
  const vault: Vault = getVaultById(vaultId) ?? vaults[0]!;

  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [momoNumber, setMomoNumberState] = useState('');
  const [momoProvider, setMomoProvider] = useState<MomoProvider>('MTN');
  const [momoError, setMomoError] = useState<string | null>(null);

  const setMomoNumber = useCallback((value: string) => {
    setMomoNumberState(value);
    setMomoError(null);
  }, []);

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

    const trimmedNumber = momoNumber.trim();
    if (!GHANA_PHONE_PATTERN.test(trimmedNumber)) {
      setMomoError('Enter the MoMo number to receive the payout (e.g. 0241234567)');
      return;
    }

    setIsLoading(true);
    try {
      await withdrawVault(vault.id, netAmount, feeAmount, withdrawalType, {
        momoNumber: trimmedNumber,
        momoProvider,
      });
      navigation.replace('VaultSuccess', {
        isWithdrawal: true,
        vaultName: vault.name,
        amountReceived: netAmount,
        feeCharged: feeAmount,
        message: `GHS ${netAmount.toFixed(2)} is on its way to ${trimmedNumber}.`,
      });
    } catch (error) {
      setMomoError(getApiErrorMessage(error, 'Withdrawal failed'));
    } finally {
      setIsLoading(false);
    }
  }, [
    feeAmount,
    isConfirmed,
    momoNumber,
    momoProvider,
    navigation,
    netAmount,
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
    momoNumber,
    momoProvider,
    momoError,
    setMomoNumber,
    setMomoProvider,
    toggleConfirm,
    handleConfirm,
  };
}
