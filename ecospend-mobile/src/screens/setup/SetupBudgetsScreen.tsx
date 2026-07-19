import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

import AmountDisplayInput from '../../components/finance/AmountDisplayInput';
import CategoryChipGrid from '../../components/finance/CategoryChipGrid';
import SetupProgressBar from '../../components/setup/SetupProgressBar';
import AppButton from '../../components/ui/AppButton';
import { Icon } from '../../components/ui/icons';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import { useEnvelopes } from '../../context/EnvelopesContext';
import type { AccountSetupStackParamList } from '../../navigation/types';
import {
  fontSize,
  fontWeight,
  radius,
  spacing,
  useTheme,
  useThemedStyles,
} from '../../theme';
import type { ThemeColors } from '../../theme';
import type { EnvelopeFormErrors, TransactionCategory } from '../../types';

type SetupBudgetsNavProp = StackNavigationProp<AccountSetupStackParamList, 'SetupBudgets'>;

export default function SetupBudgetsScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation<SetupBudgetsNavProp>();
  const { allEnvelopes, addEnvelope, isSaving, hasCategoryThisMonth } = useEnvelopes();

  const [selectedCategory, setSelectedCategory] = useState<TransactionCategory | null>(
    null,
  );
  const [monthlyLimit, setMonthlyLimit] = useState('');
  const [errors, setErrors] = useState<EnvelopeFormErrors>({});

  const isDuplicate =
    selectedCategory !== null && hasCategoryThisMonth(selectedCategory);

  const handleAddBudget = async () => {
    const parsedLimit = parseFloat(monthlyLimit);
    const nextErrors: EnvelopeFormErrors = {};

    if (!selectedCategory) {
      nextErrors.category = 'Select a category';
    }
    if (!parsedLimit || parsedLimit <= 0) {
      nextErrors.monthlyLimit = 'Monthly limit must be greater than 0';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !selectedCategory) {
      return;
    }

    const success = await addEnvelope({
      category: selectedCategory,
      monthlyLimit: parsedLimit,
    });

    if (success) {
      setSelectedCategory(null);
      setMonthlyLimit('');
      setErrors({});
    }
  };

  const handleContinue = () => {
    navigation.navigate('SetupNotifications');
  };

  return (
    <ScreenWrapper background="page" scrollable keyboardAvoiding>
      <SetupProgressBar step={2} total={3} label="Step 2 of 3" />

      <View style={styles.iconRing}>
        <Icon name="target" size={28} color={colors.primary} strokeWidth={1.8} />
      </View>

      <Text style={styles.title}>Set a few budgets</Text>
      <Text style={styles.subtitle}>
        Give spending categories a monthly limit. You can add more or adjust these later
        from the Budget screen.
      </Text>

      <Text style={styles.label}>Category</Text>
      <CategoryChipGrid selectedCategory={selectedCategory} onSelect={setSelectedCategory} />
      {errors.category ? <Text style={styles.errorText}>{errors.category}</Text> : null}

      {isDuplicate ? (
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            You already added a budget for {selectedCategory} this month. Adding again
            will replace it.
          </Text>
        </View>
      ) : null}

      <Text style={styles.label}>Monthly limit</Text>
      <AmountDisplayInput
        value={monthlyLimit}
        onChangeText={setMonthlyLimit}
        error={errors.monthlyLimit}
      />

      <AppButton
        title="Add Budget"
        variant="secondary"
        loading={isSaving}
        onPress={handleAddBudget}
      />

      {allEnvelopes.length > 0 ? (
        <View style={styles.addedList}>
          <Text style={styles.addedLabel}>Added so far</Text>
          {allEnvelopes.map((envelope) => (
            <View key={envelope.id} style={styles.addedRow}>
              <Text style={styles.addedEmoji}>{envelope.emoji}</Text>
              <Text style={styles.addedCategory}>{envelope.category}</Text>
              <Text style={styles.addedAmount}>
                GHS {envelope.monthlyLimit.toFixed(2)}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.footer}>
        <AppButton title="Continue" onPress={handleContinue} />
        <AppButton title="Skip for now" variant="text" onPress={handleContinue} />
      </View>
    </ScreenWrapper>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    iconRing: {
      alignItems: 'center',
      alignSelf: 'center',
      backgroundColor: colors.primaryBackground,
      borderRadius: radius.full,
      height: 56,
      justifyContent: 'center',
      marginBottom: spacing.lg,
      width: 56,
    },
    title: {
      color: colors.textDark,
      fontSize: fontSize.xl,
      fontWeight: fontWeight.bold,
      marginBottom: spacing.sm,
      textAlign: 'center',
    },
    subtitle: {
      color: colors.textMuted,
      fontSize: fontSize.sm,
      lineHeight: 20,
      marginBottom: spacing.xl,
      textAlign: 'center',
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
      borderRadius: radius.md,
      marginBottom: spacing.md,
      padding: spacing.sm,
    },
    warningText: {
      color: colors.textDark,
      fontSize: fontSize.sm,
    },
    addedList: {
      marginTop: spacing.xl,
    },
    addedLabel: {
      color: colors.textMuted,
      fontSize: fontSize.xs,
      fontWeight: fontWeight.semibold,
      marginBottom: spacing.sm,
      textTransform: 'uppercase',
    },
    addedRow: {
      alignItems: 'center',
      backgroundColor: colors.cardBackground,
      borderColor: colors.borderSubtle,
      borderRadius: radius.md,
      borderWidth: 1,
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: spacing.sm,
      padding: spacing.sm,
    },
    addedEmoji: {
      fontSize: fontSize.lg,
    },
    addedCategory: {
      color: colors.textDark,
      flex: 1,
      fontSize: fontSize.sm,
      fontWeight: fontWeight.medium,
    },
    addedAmount: {
      color: colors.textDark,
      fontSize: fontSize.sm,
      fontWeight: fontWeight.semibold,
    },
    footer: {
      alignItems: 'center',
      gap: spacing.sm,
      marginTop: spacing.xl,
    },
  });
