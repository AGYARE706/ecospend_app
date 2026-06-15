import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import AmountDisplayInput from '../finance/AmountDisplayInput';
import AppButton from '../ui/AppButton';
import GhsText from '../ui/GhsText';
import GoalProgressBar from './GoalProgressBar';
import GoalSheetContainer from './GoalSheetContainer';
import { colors, fontSize, fontWeight, radius, spacing } from '../../theme';
import {
  capContributionAmount,
  getGoalProgress,
  getRemainingAmount,
} from '../../utils/goals';
import type { SavingsGoal } from '../../types';

/**
 * Bottom sheet for contributing money to an active savings goal.
 */
export interface ContributeSheetProps {
  visible: boolean;
  goal: SavingsGoal | null;
  loading: boolean;
  onClose: () => void;
  onContribute: (goalId: string, amount: number) => Promise<boolean>;
}

export default function ContributeSheet({
  visible,
  goal,
  loading,
  onClose,
  onContribute,
}: ContributeSheetProps) {
  const [amount, setAmount] = useState('');

  const parsedAmount = parseFloat(amount) || 0;
  const remaining = goal ? getRemainingAmount(goal) : 0;
  const cappedAmount = goal ? capContributionAmount(goal, parsedAmount) : 0;
  const progress = goal ? getGoalProgress(goal) : 0;

  const willComplete = goal !== null && parsedAmount > 0 && cappedAmount >= remaining;
  const exceedsRemaining = goal !== null && parsedAmount > remaining && remaining > 0;

  const buttonTitle = useMemo(() => {
    const displayAmount = cappedAmount > 0 ? cappedAmount : parsedAmount;
    return `Add GHS ${displayAmount.toFixed(2)}`;
  }, [cappedAmount, parsedAmount]);

  const handleClose = () => {
    setAmount('');
    onClose();
  };

  const handleSave = async () => {
    if (!goal || cappedAmount <= 0) {
      return;
    }

    const success = await onContribute(goal.id, cappedAmount);
    if (success) {
      setAmount('');
      onClose();
    }
  };

  if (!goal) {
    return null;
  }

  return (
    <GoalSheetContainer visible={visible} onClose={handleClose}>
      <Text style={styles.title}>Add Money</Text>
      <Text style={styles.goalName}>{goal.name}</Text>

      <View style={styles.progressSection}>
        <GoalProgressBar progress={progress} animate={false} />
        <View style={styles.progressAmountRow}>
          <GhsText amount={goal.currentAmount} size="sm" />
          <Text style={styles.progressOf}> of </Text>
          <GhsText amount={goal.targetAmount} size="sm" />
        </View>
      </View>

      <AmountDisplayInput value={amount} onChangeText={setAmount} />

      <Text style={styles.remainingText}>
        Remaining to goal: GHS {remaining.toFixed(2)}
      </Text>

      {willComplete ? (
        <View style={styles.completeBanner}>
          <Text style={styles.completeBannerText}>
            🎉 This will complete your goal!
          </Text>
        </View>
      ) : null}

      {exceedsRemaining ? (
        <View style={styles.warningBanner}>
          <Text style={styles.warningBannerText}>
            Amount exceeds remaining goal balance — we&apos;ll cap it at GHS{' '}
            {remaining.toFixed(2)}
          </Text>
        </View>
      ) : null}

      <AppButton
        title={buttonTitle}
        onPress={() => void handleSave()}
        loading={loading}
        disabled={cappedAmount <= 0}
      />
    </GoalSheetContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.textDark,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  goalName: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.lg,
  },
  progressSection: {
    marginBottom: spacing.lg,
  },
  progressAmountRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  progressOf: {
    color: colors.textGrey,
    fontSize: fontSize.sm,
  },
  remainingText: {
    color: colors.textGrey,
    fontSize: fontSize.sm,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  completeBanner: {
    backgroundColor: colors.successLight,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  completeBannerText: {
    color: colors.success,
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  warningBanner: {
    backgroundColor: colors.warningLight,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  warningBannerText: {
    color: colors.warning,
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
});
