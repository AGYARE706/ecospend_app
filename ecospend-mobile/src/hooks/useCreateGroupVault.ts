import { useCallback, useMemo, useState } from 'react';
import type { StackNavigationProp } from '@react-navigation/stack';

import { MOCK_SAVE_DELAY_MS } from '../data/mock/mockData';
import type { AppStackParamList } from '../navigation/types';
import {
  addMonths,
  DATE_PRESETS,
  formatDisplayDate,
  formatIsoDate,
  type DatePreset,
} from './useCreateVault';
import { getDaysRemaining } from '../utils/vault';

// ─── Types ────────────────────────────────────────────────────────────────────
type CreateGroupVaultNavProp = StackNavigationProp<
  AppStackParamList,
  'CreateGroupVault'
>;

export interface MemberInvite {
  id: string;
  phone: string;
  /** Derived friendly label, e.g. "+233 24 123 4567" */
  displayPhone: string;
}

export interface CreateGroupVaultFormState {
  groupName: string;
  goalName: string;
  targetAmount: string;
  selectedPreset: DatePreset;
  maturityDate: Date;
  memberLimit: number;
  phoneInput: string;
  members: MemberInvite[];
}

export interface CreateGroupVaultFormErrors {
  groupName?: string;
  goalName?: string;
  targetAmount?: string;
  phoneInput?: string;
  members?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const MIN_MEMBERS = 2;
const MAX_MEMBERS = 8;

/** Normalises a Ghana phone number string for display */
function normalisePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '');

  // Accept 10-digit (0XX) or 12-digit (233XX) or 13-digit (+233XX stripped)
  if (digits.length === 10 && digits.startsWith('0')) {
    const local = digits.slice(1); // strip leading 0
    return `+233 ${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5)}`;
  }
  if (digits.length === 12 && digits.startsWith('233')) {
    const local = digits.slice(3);
    return `+233 ${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5)}`;
  }
  return null;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useCreateGroupVault(navigation: CreateGroupVaultNavProp) {
  const [form, setForm] = useState<CreateGroupVaultFormState>({
    groupName: '',
    goalName: '',
    targetAmount: '',
    selectedPreset: '6m',
    maturityDate: addMonths(new Date(), 6),
    memberLimit: 4,
    phoneInput: '',
    members: [],
  });
  const [errors, setErrors] = useState<CreateGroupVaultFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  // ─── Derived values ────────────────────────────────────────────────────
  const parsedTarget = parseFloat(form.targetAmount.replace(/,/g, '')) || 0;
  const daysRemaining = useMemo(
    () => getDaysRemaining(formatIsoDate(form.maturityDate)),
    [form.maturityDate],
  );
  const perMemberTarget = useMemo(
    () =>
      parsedTarget > 0 && form.memberLimit > 0
        ? parsedTarget / form.memberLimit
        : 0,
    [parsedTarget, form.memberLimit],
  );
  const formattedDate = useMemo(
    () => formatDisplayDate(form.maturityDate),
    [form.maturityDate],
  );
  const canAddMember =
    form.members.length < form.memberLimit - 1; // -1 because creator counts

  // ─── Field setters ─────────────────────────────────────────────────────
  const setField = useCallback(
    <K extends keyof CreateGroupVaultFormState>(
      field: K,
      value: CreateGroupVaultFormState[K],
    ) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    },
    [],
  );

  const selectPreset = useCallback((preset: DatePreset) => {
    const months = DATE_PRESETS.find((p) => p.key === preset)?.months ?? 6;
    setForm((prev) => ({
      ...prev,
      selectedPreset: preset,
      maturityDate: addMonths(new Date(), months),
    }));
  }, []);

  const adjustMemberLimit = useCallback((delta: number) => {
    setForm((prev) => {
      const next = Math.max(MIN_MEMBERS, Math.min(MAX_MEMBERS, prev.memberLimit + delta));
      // Trim invite list if new limit is smaller than current invitees + creator
      const trimmed = prev.members.slice(0, next - 1);
      return { ...prev, memberLimit: next, members: trimmed };
    });
  }, []);

  // ─── Member management ─────────────────────────────────────────────────
  const addMember = useCallback(() => {
    const normalised = normalisePhone(form.phoneInput);

    if (!normalised) {
      setErrors((prev) => ({
        ...prev,
        phoneInput: 'Enter a valid Ghana mobile number (e.g. 0244 123 456)',
      }));
      return;
    }

    const alreadyAdded = form.members.some(
      (m) => m.displayPhone === normalised,
    );
    if (alreadyAdded) {
      setErrors((prev) => ({
        ...prev,
        phoneInput: 'This number has already been added',
      }));
      return;
    }

    if (!canAddMember) {
      setErrors((prev) => ({
        ...prev,
        phoneInput: `Member limit reached (${form.memberLimit} slots)`,
      }));
      return;
    }

    const newMember: MemberInvite = {
      id: `invite-${Date.now()}`,
      phone: form.phoneInput.trim(),
      displayPhone: normalised,
    };

    setForm((prev) => ({
      ...prev,
      members: [...prev.members, newMember],
      phoneInput: '',
    }));
    setErrors((prev) => ({ ...prev, phoneInput: undefined }));
  }, [canAddMember, form.memberLimit, form.members, form.phoneInput]);

  const removeMember = useCallback((id: string) => {
    setForm((prev) => ({
      ...prev,
      members: prev.members.filter((m) => m.id !== id),
    }));
  }, []);

  // ─── Validation ────────────────────────────────────────────────────────
  const validate = useCallback((): CreateGroupVaultFormErrors => {
    const next: CreateGroupVaultFormErrors = {};

    if (!form.groupName.trim()) {
      next.groupName = 'Group name is required';
    } else if (form.groupName.trim().length < 3) {
      next.groupName = 'Must be at least 3 characters';
    }

    if (!form.goalName.trim()) {
      next.goalName = 'Goal name is required';
    }

    if (parsedTarget <= 0) {
      next.targetAmount = 'Enter a valid target amount';
    }

    return next;
  }, [form.goalName, form.groupName, parsedTarget]);

  // ─── Submit ────────────────────────────────────────────────────────────
  const handleCreate = useCallback(async () => {
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, MOCK_SAVE_DELAY_MS));
    setIsLoading(false);

    navigation.replace('VaultSuccess', {
      message: `"${form.groupName.trim()}" group vault created! Invites sent to ${form.members.length} member${form.members.length !== 1 ? 's' : ''}.`,
    });
  }, [form.groupName, form.members.length, navigation, validate]);

  return {
    form,
    errors,
    isLoading,
    parsedTarget,
    perMemberTarget,
    daysRemaining,
    formattedDate,
    canAddMember,
    setField,
    selectPreset,
    adjustMemberLimit,
    addMember,
    removeMember,
    handleCreate,
    MIN_MEMBERS,
    MAX_MEMBERS,
  };
}
