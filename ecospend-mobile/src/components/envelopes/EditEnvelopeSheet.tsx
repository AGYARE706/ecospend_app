import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import AmountDisplayInput from '../finance/AmountDisplayInput';
import AppButton from '../ui/AppButton';
import GhsText from '../ui/GhsText';
import EnvelopeSheetContainer from './EnvelopeSheetContainer';
import { colors, fontSize, fontWeight, spacing } from '../../theme';
import type { EditEnvelopePayload, Envelope, EnvelopeFormErrors } from '../../types';

/**
 * Bottom sheet for editing an envelope monthly limit with live spend warning.
 */
export interface EditEnvelopeSheetProps {
  visible: boolean;
  envelope: Envelope | null;
  loading: boolean;
  onClose: () => void;
  onSave: (payload: EditEnvelopePayload) => Promise<boolean>;
}

export default function EditEnvelopeSheet({
  visible,
  envelope,
  loading,
  onClose,
  onSave,
}: EditEnvelopeSheetProps) {
  const [monthlyLimit, setMonthlyLimit] = useState('');
  const [errors, setErrors] = useState<EnvelopeFormErrors>({});

  useEffect(() => {
    if (envelope) {
      setMonthlyLimit(envelope.monthlyLimit.toString());
      setErrors({});
    }
  }, [envelope]);

  const parsedLimit = parseFloat(monthlyLimit);
  const limitBelowSpend =
    envelope !== null &&
    Number.isFinite(parsedLimit) &&
    parsedLimit > 0 &&
    parsedLimit < envelope.currentSpend;

  const resetForm = () => {
    setMonthlyLimit('');
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validate = (): EnvelopeFormErrors => {
    const nextErrors: EnvelopeFormErrors = {};

    if (!parsedLimit || parsedLimit <= 0) {
      nextErrors.monthlyLimit = 'Monthly limit must be greater than 0';
    }

    return nextErrors;
  };

  const handleSave = async () => {
    if (!envelope) {
      return;
    }

    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const success = await onSave({
      id: envelope.id,
      monthlyLimit: parsedLimit,
    });

    if (success) {
      resetForm();
      onClose();
    }
  };

  if (!envelope) {
    return null;
  }

  return (
    <EnvelopeSheetContainer visible={visible} onClose={handleClose}>
      <Text style={styles.title}>Edit {envelope.category} Envelope</Text>
      <Text style={styles.subtitle}>Adjust your monthly spending limit</Text>

      <View style={styles.spendRow}>
        <Text style={styles.spendLabel}>Current spend (read-only)</Text>
        <GhsText amount={envelope.currentSpend} variant="expense" size="sm" />
      </View>

      <Text style={styles.label}>Monthly limit</Text>
      <AmountDisplayInput
        value={monthlyLimit}
        onChangeText={setMonthlyLimit}
        error={errors.monthlyLimit}
      />

      {limitBelowSpend ? (
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            Limit is below current spend of GHS {envelope.currentSpend.toFixed(2)}.
            This envelope will show as exhausted.
          </Text>
        </View>
      ) : null}

      <AppButton title="Update Limit" loading={loading} onPress={handleSave} />
    </EnvelopeSheetContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.textDark,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.textGrey,
    fontSize: fontSize.sm,
    marginBottom: spacing.lg,
  },
  spendRow: {
    alignItems: 'center',
    backgroundColor: colors.pageBackground,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  spendLabel: {
    color: colors.textGrey,
    fontSize: fontSize.sm,
  },
  label: {
    color: colors.textDark,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.sm,
  },
  warningBox: {
    backgroundColor: colors.errorLight,
    borderRadius: 8,
    marginBottom: spacing.md,
    padding: spacing.sm,
  },
  warningText: {
    color: colors.error,
    fontSize: fontSize.sm,
  },
});
