import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import AppButton from '../ui/AppButton';
import AppInput from '../ui/AppInput';
import { Icon } from '../ui/icons';
import GoalSheetContainer from './GoalSheetContainer';
import { colors, fontSize, fontWeight, radius, spacing, typography } from '../../theme';
import { getProjectedWeekly } from '../../utils/goals';
import type { AddGoalFormErrors, AddGoalPayload } from '../../types';

/**
 * Bottom sheet for creating a new savings goal with validation and preview.
 */
export interface AddGoalSheetProps {
  visible: boolean;
  loading: boolean;
  onClose: () => void;
  onSave: (payload: AddGoalPayload) => Promise<boolean>;
}

export default function AddGoalSheet({
  visible,
  loading,
  onClose,
  onSave,
}: AddGoalSheetProps) {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [selectedDeadline, setSelectedDeadline] = useState<string | null>(null);
  const [errors, setErrors] = useState<AddGoalFormErrors>({});

  const parsedTarget = parseFloat(targetAmount);

  const projectedWeekly = useMemo(() => {
    if (!name.trim() || !parsedTarget || parsedTarget <= 0) {
      return null;
    }

    return getProjectedWeekly(parsedTarget);
  }, [name, parsedTarget]);

  const resetForm = () => {
    setName('');
    setTargetAmount('');
    setSelectedDeadline(null);
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validate = (): AddGoalFormErrors => {
    const nextErrors: AddGoalFormErrors = {};

    if (!name.trim()) {
      nextErrors.name = 'Goal name is required';
    }

    if (!parsedTarget || parsedTarget <= 0) {
      nextErrors.targetAmount = 'Target amount must be greater than 0';
    }

    return nextErrors;
  };

  const handleSave = async () => {
    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const success = await onSave({
      name: name.trim(),
      targetAmount: parsedTarget,
      deadline: selectedDeadline,
    });

    if (success) {
      resetForm();
      onClose();
    }
  };

  return (
    <GoalSheetContainer visible={visible} onClose={handleClose}>
      <Text style={styles.title}>New Savings Goal</Text>

      <AppInput
        label="What are you saving for?"
        value={name}
        onChangeText={setName}
        placeholder="e.g. School Fees, New Phone"
        error={errors.name}
      />

      <View style={styles.fieldGap} />

      <AppInput
        label="Target Amount (GHS)"
        value={targetAmount}
        onChangeText={setTargetAmount}
        placeholder="0.00"
        keyboardType="decimal-pad"
        error={errors.targetAmount}
      />

      <View style={styles.fieldGap} />

      <Text style={styles.dateLabel}>Target Date (optional)</Text>
      <Text style={styles.dateHint}>(leave blank for open-ended)</Text>
      <Pressable style={styles.dateRow}>
        <Icon
          name="calendar-outline"
          size={fontSize.lg}
          color={colors.textGrey}
        />
        <Text style={styles.datePlaceholder} numberOfLines={1}>
          {selectedDeadline ? 'June 2026' : 'Select a date'}
        </Text>
        <Icon
          name="chevron-forward"
          size={fontSize.lg}
          color={colors.textGrey}
        />
      </Pressable>

      {projectedWeekly !== null ? (
        <View style={styles.previewCard}>
          <Text style={styles.previewEmoji}>⚡</Text>
          <Text style={styles.previewText}>
            You need to save{' '}
            <Text style={styles.previewAmount}>
              GHS {projectedWeekly.toFixed(2)}/week
            </Text>{' '}
            to reach this goal
          </Text>
        </View>
      ) : null}

      <AppButton title="Create Goal" onPress={() => void handleSave()} loading={loading} />

      <Pressable onPress={handleClose} style={styles.cancelButton}>
        <Text style={styles.cancelText}>Cancel</Text>
      </Pressable>
    </GoalSheetContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.h3,
    color: colors.textDark,
    marginBottom: spacing.lg,
  },
  fieldGap: {
    height: spacing.md,
  },
  dateLabel: {
    color: colors.textDark,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  dateHint: {
    color: colors.textGrey,
    fontSize: fontSize.xs,
    marginBottom: spacing.sm,
  },
  dateRow: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: spacing.md,
    minHeight: 52,
    paddingHorizontal: spacing.md,
  },
  datePlaceholder: {
    color: colors.textGrey,
    flex: 1,
    fontSize: fontSize.md,
    marginLeft: spacing.sm,
  },
  previewCard: {
    alignItems: 'flex-start',
    backgroundColor: colors.primaryBackground,
    borderRadius: radius.md,
    flexDirection: 'row',
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  previewEmoji: {
    fontSize: fontSize.lg,
    marginRight: spacing.sm,
  },
  previewText: {
    color: colors.primary,
    flex: 1,
    fontSize: fontSize.sm,
  },
  previewAmount: {
    fontWeight: fontWeight.bold,
  },
  cancelButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
    minHeight: 44,
  },
  cancelText: {
    color: colors.textGrey,
    fontSize: fontSize.sm,
  },
});
