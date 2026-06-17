import { useCallback, useMemo, useState } from 'react';
import type { StackNavigationProp } from '@react-navigation/stack';

import { MOCK_SAVE_DELAY_MS } from '../data/mock/mockData';
import type { AppStackParamList } from '../navigation/types';
import { getDaysRemaining } from '../utils/vault';

type CreateVaultNavProp = StackNavigationProp<AppStackParamList, 'CreateVault'>;

// ─── Fee rates ────────────────────────────────────────────────────────────────
export const ON_TIME_FEE_RATE = 0.02; // 2%
export const EARLY_FEE_RATE = 0.05; // 5%

// ─── Date preset helpers ──────────────────────────────────────────────────────
export type DatePreset = '3m' | '6m' | '1y' | '2y';

export const DATE_PRESETS: { key: DatePreset; label: string; months: number }[] = [
  { key: '3m', label: '3 Months', months: 3 },
  { key: '6m', label: '6 Months', months: 6 },
  { key: '1y', label: '1 Year', months: 12 },
  { key: '2y', label: '2 Years', months: 24 },
];

export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

export function formatIsoDate(date: Date): string {
  return date.toISOString().split('T')[0] ?? '';
}

export function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString('en-GH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// ─── Form types ───────────────────────────────────────────────────────────────
export interface CreateVaultFormState {
  vaultName: string;
  targetAmount: string;
  initialDeposit: string;
  selectedPreset: DatePreset;
  maturityDate: Date;
}

export interface CreateVaultFormErrors {
  vaultName?: string;
  targetAmount?: string;
  initialDeposit?: string;
}

export interface VaultFeePreview {
  lockedAmount: number;
  onTimeFeeRate: number;
  earlyFeeRate: number;
  onTimeFee: number;
  earlyFee: number;
  onTimeWithdrawal: number;
  earlyWithdrawal: number;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useCreateVault(navigation: CreateVaultNavProp) {
  const [form, setForm] = useState<CreateVaultFormState>({
    vaultName: '',
    targetAmount: '',
    initialDeposit: '',
    selectedPreset: '6m',
    maturityDate: addMonths(new Date(), 6),
  });
  const [errors, setErrors] = useState<CreateVaultFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  // ─── Parsed values ──────────────────────────────────────────────────────
  const parsedTarget = parseFloat(form.targetAmount.replace(/,/g, '')) || 0;
  const parsedDeposit = parseFloat(form.initialDeposit.replace(/,/g, '')) || 0;
  const lockedAmount = parsedDeposit > 0 ? parsedDeposit : parsedTarget;

  // ─── Fee preview ────────────────────────────────────────────────────────
  const feePreview = useMemo<VaultFeePreview>(() => {
    const onTimeFee = lockedAmount * ON_TIME_FEE_RATE;
    const earlyFee = lockedAmount * EARLY_FEE_RATE;
    return {
      lockedAmount,
      onTimeFeeRate: ON_TIME_FEE_RATE,
      earlyFeeRate: EARLY_FEE_RATE,
      onTimeFee,
      earlyFee,
      onTimeWithdrawal: lockedAmount - onTimeFee,
      earlyWithdrawal: lockedAmount - earlyFee,
    };
  }, [lockedAmount]);

  // ─── Live summary ───────────────────────────────────────────────────────
  const daysRemaining = useMemo(
    () => getDaysRemaining(formatIsoDate(form.maturityDate)),
    [form.maturityDate],
  );

  // ─── Field setters ──────────────────────────────────────────────────────
  const setField = useCallback(
    <K extends keyof CreateVaultFormState>(
      field: K,
      value: CreateVaultFormState[K],
    ) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    },
    [],
  );

  const selectPreset = useCallback((preset: DatePreset) => {
    const months =
      DATE_PRESETS.find((p) => p.key === preset)?.months ?? 6;
    setForm((prev) => ({
      ...prev,
      selectedPreset: preset,
      maturityDate: addMonths(new Date(), months),
    }));
  }, []);

  // ─── Validation ─────────────────────────────────────────────────────────
  const validate = useCallback((): CreateVaultFormErrors => {
    const next: CreateVaultFormErrors = {};

    if (!form.vaultName.trim()) {
      next.vaultName = 'Vault name is required';
    } else if (form.vaultName.trim().length < 3) {
      next.vaultName = 'Name must be at least 3 characters';
    }

    if (parsedTarget <= 0) {
      next.targetAmount = 'Enter a valid target amount';
    }

    if (parsedDeposit < 0) {
      next.initialDeposit = 'Deposit cannot be negative';
    } else if (parsedDeposit > parsedTarget && parsedTarget > 0) {
      next.initialDeposit = 'Deposit cannot exceed the target amount';
    }

    return next;
  }, [form.vaultName, parsedDeposit, parsedTarget]);

  // ─── Submit ─────────────────────────────────────────────────────────────
  const handleCreate = useCallback(async () => {
    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, MOCK_SAVE_DELAY_MS));
    setIsLoading(false);

    navigation.replace('VaultSuccess', {
      message: `"${form.vaultName.trim()}" vault created successfully!`,
    });
  }, [form.vaultName, navigation, validate]);

  return {
    form,
    errors,
    isLoading,
    feePreview,
    parsedTarget,
    parsedDeposit,
    daysRemaining,
    setField,
    selectPreset,
    handleCreate,
  };
}
