import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import CategoryChipGrid from '../finance/CategoryChipGrid';
import AmountDisplayInput from '../finance/AmountDisplayInput';
import AppButton from '../ui/AppButton';
import EnvelopePreviewCard from './EnvelopePreviewCard';
import EnvelopeSheetContainer from './EnvelopeSheetContainer';
import { CATEGORY_CONFIG } from '../../constants/categories';
import { fontSize, fontWeight, spacing, useThemedStyles } from '../../theme';
import type { ThemeColors } from '../../theme';
import type {
  AddEnvelopePayload,
  EnvelopeFormErrors,
  TransactionCategory,
} from '../../types';

/**
 * Bottom sheet for creating a monthly budget envelope with validation and preview.
 */
export interface AddEnvelopeSheetProps {
  visible: boolean;
  loading: boolean;
  hasCategoryThisMonth: (category: TransactionCategory) => boolean;
  onClose: () => void;
  onSave: (payload: AddEnvelopePayload) => Promise<boolean>;
}

export default function AddEnvelopeSheet({
  visible,
  loading,
  hasCategoryThisMonth,
  onClose,
  onSave,
}: AddEnvelopeSheetProps) {
  const styles = useThemedStyles(createStyles);
  const [selectedCategory, setSelectedCategory] = useState<TransactionCategory | null>(
    null,
  );
  const [monthlyLimit, setMonthlyLimit] = useState('');
  const [errors, setErrors] = useState<EnvelopeFormErrors>({});

  const parsedLimit = parseFloat(monthlyLimit);
  const isDuplicate =
    selectedCategory !== null && hasCategoryThisMonth(selectedCategory);

  const preview = useMemo(() => {
    if (!selectedCategory || !parsedLimit || parsedLimit <= 0) {
      return null;
    }

    const config = CATEGORY_CONFIG[selectedCategory];
    return {
      category: config.label,
      monthlyLimit: parsedLimit,
    };
  }, [parsedLimit, selectedCategory]);

  const resetForm = () => {
    setSelectedCategory(null);
    setMonthlyLimit('');
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validate = (): EnvelopeFormErrors => {
    const nextErrors: EnvelopeFormErrors = {};

    if (!selectedCategory) {
      nextErrors.category = 'Select a category';
    }

    if (!parsedLimit || parsedLimit <= 0) {
      nextErrors.monthlyLimit = 'Monthly limit must be greater than 0';
    }

    return nextErrors;
  };

  const handleSave = async () => {
    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0 || !selectedCategory) {
      return;
    }

    const success = await onSave({
      category: selectedCategory,
      monthlyLimit: parsedLimit,
    });

    if (success) {
      resetForm();
      onClose();
    }
  };

  return (
    <EnvelopeSheetContainer visible={visible} onClose={handleClose}>
      <Text style={styles.title}>New Budget Envelope</Text>
      <Text style={styles.subtitle}>Set a monthly spending limit for a category</Text>

      <Text style={styles.label}>Category</Text>
      <CategoryChipGrid
        selectedCategory={selectedCategory}
        onSelect={setSelectedCategory}
      />
      {errors.category ? <Text style={styles.errorText}>{errors.category}</Text> : null}

      {isDuplicate ? (
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            An envelope for {selectedCategory} already exists this month. Saving will
            replace it.
          </Text>
        </View>
      ) : null}

      <Text style={styles.label}>Monthly limit</Text>
      <AmountDisplayInput
        value={monthlyLimit}
        onChangeText={setMonthlyLimit}
        error={errors.monthlyLimit}
      />

      {preview ? (
        <EnvelopePreviewCard
          category={preview.category}
          monthlyLimit={preview.monthlyLimit}
        />
      ) : null}

      <AppButton title="Save Envelope" loading={loading} onPress={handleSave} />
    </EnvelopeSheetContainer>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
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
  label: {
    color: colors.textDark,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.sm,
  },
  errorText: {
    color: colors.error,
    fontSize: fontSize.sm,
    marginBottom: spacing.sm,
  },
  warningBox: {
    backgroundColor: colors.warningLight,
    borderRadius: 8,
    marginBottom: spacing.md,
    padding: spacing.sm,
  },
  warningText: {
    color: colors.textDark,
    fontSize: fontSize.sm,
  },
});
