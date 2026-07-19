import { useCallback, useMemo, useState } from 'react';
import type { StackNavigationProp } from '@react-navigation/stack';

import { useAuth } from '../context/AuthContext';
import { useEnvelopes } from '../context/EnvelopesContext';
import { useFinance } from '../context/FinanceContext';
import { useVaults } from '../context/VaultContext';
import { useWallet } from '../context/WalletContext';
import { getApiErrorMessage } from '../api/getApiErrorMessage';
import * as paymentsApi from '../api/paymentsApi';
import type { MomoProvider } from './useSendMoney';
import type { AppStackParamList } from '../navigation/types';
import type { Vault } from '../types/vault';
import { formatVaultDate, getDaysRemaining } from '../utils/vault';

export const ON_TIME_FEE_RATE = 0.02;
export const SHORTFALL_FEE_RATE = 0.04;
export const EARLY_FEE_RATE = 0.05;

export type WithdrawalType = 'matured' | 'early';
export type PayoutDestination = 'wallet' | 'momo';

export interface WithdrawalFeeBreakdown {
  balance: number;
  feeRate: number;
  feeAmount: number;
  netAmount: number;
  type: WithdrawalType;
  /** On time, but the vault never actually hit its target — the 4% tier instead of the standard 2%. */
  isShortfall: boolean;
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
  destination: PayoutDestination;
  setDestination: (destination: PayoutDestination) => void;
  provider: MomoProvider | null;
  setProvider: (provider: MomoProvider) => void;
  ownPhone: string;
  payoutError: string | null;
}

type WithdrawNavProp = StackNavigationProp<AppStackParamList, 'WithdrawVault'>;

export function useWithdrawVault(
  vaultId: string,
  navigation: WithdrawNavProp,
): WithdrawVaultData {
  const { getVaultById, vaults, withdrawVault } = useVaults();
  const { refreshWallet } = useWallet();
  const { refreshTransactions } = useFinance();
  const { refreshEnvelopes } = useEnvelopes();
  const { user, setMomoProvider: persistMomoProvider } = useAuth();
  const vault: Vault = getVaultById(vaultId) ?? vaults[0]!;

  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [destination, setDestination] = useState<PayoutDestination>('wallet');
  const [provider, setProvider] = useState<MomoProvider | null>(
    (user?.momoProvider as MomoProvider) ?? null,
  );
  const [payoutError, setPayoutError] = useState<string | null>(null);
  const ownPhone = user?.phone?.trim() ?? '';

  const daysRemaining = useMemo(
    () => getDaysRemaining(vault.maturityDate),
    [vault.maturityDate],
  );

  const withdrawalType: WithdrawalType =
    vault.status === 'matured' || daysRemaining <= 0 ? 'matured' : 'early';

  // On time, but the target was never actually hit — the date was kept,
  // the commitment wasn't. Mirrors the backend's Fees.java tiers exactly.
  const isShortfall =
    withdrawalType === 'matured' &&
    vault.targetAmount > 0 &&
    vault.currentBalance < vault.targetAmount;
  const feeRate = withdrawalType === 'early'
    ? EARLY_FEE_RATE
    : isShortfall
      ? SHORTFALL_FEE_RATE
      : ON_TIME_FEE_RATE;
  const feeAmount = vault.currentBalance * feeRate;
  const netAmount = vault.currentBalance - feeAmount;

  const fees: WithdrawalFeeBreakdown = {
    balance: vault.currentBalance,
    feeRate,
    feeAmount,
    netAmount,
    type: withdrawalType,
    isShortfall,
  };

  const toggleConfirm = useCallback(() => {
    setIsConfirmed((prev) => !prev);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!isConfirmed) return;
    if (destination === 'momo' && (!provider || !ownPhone)) return;

    setPayoutError(null);
    setIsLoading(true);
    try {
      await withdrawVault(vault.id, netAmount, feeAmount, withdrawalType);
      void refreshWallet();
      void refreshTransactions();

      if (destination === 'wallet') {
        navigation.replace('VaultSuccess', {
          isWithdrawal: true,
          vaultName: vault.name,
          amountReceived: netAmount,
          feeCharged: feeAmount,
          message: 'The net amount has been credited to your wallet.',
          vaultId: vault.id,
        });
        return;
      }

      // Straight to MoMo: the wallet credit above already landed, now send
      // it straight back out — one confirmation instead of two separate trips.
      if (!provider) {
        return;
      }
      if (provider !== user?.momoProvider) {
        void persistMomoProvider(provider).catch(() => undefined);
      }
      try {
        await paymentsApi.sendMoney({
          amount: netAmount,
          momoNumber: ownPhone,
          momoProvider: provider,
          category: 'Savings',
        });
        void refreshWallet();
        void refreshTransactions();
        void refreshEnvelopes();
        navigation.replace('VaultSuccess', {
          isWithdrawal: true,
          vaultName: vault.name,
          amountReceived: netAmount,
          feeCharged: feeAmount,
          message: 'The net amount was sent directly to your MoMo number.',
          vaultId: vault.id,
        });
      } catch (payoutErr) {
        setPayoutError(
          getApiErrorMessage(
            payoutErr,
            'Withdrawn to your wallet, but the direct payout failed — the money is safe, you can retry from Send Money.',
          ),
        );
      }
    } catch (error) {
      console.warn(getApiErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [
    destination,
    feeAmount,
    isConfirmed,
    navigation,
    netAmount,
    ownPhone,
    persistMomoProvider,
    provider,
    refreshEnvelopes,
    refreshTransactions,
    refreshWallet,
    user?.momoProvider,
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
    destination,
    setDestination,
    provider,
    setProvider,
    ownPhone,
    payoutError,
  };
}
