import { Pressable, StyleSheet, Text, View } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import AmountDisplayInput from '../../components/finance/AmountDisplayInput';
import CategoryChipGrid from '../../components/finance/CategoryChipGrid';
import MoMoFeePreview from '../../components/finance/MoMoFeePreview';
import ProviderChipRow from '../../components/finance/ProviderChipRow';
import SuccessToast from '../../components/finance/SuccessToast';
import TypeToggle from '../../components/finance/TypeToggle';
import AppButton from '../../components/ui/AppButton';
import AppInput from '../../components/ui/AppInput';
import Card from '../../components/ui/Card';
import ScreenHeader from '../../components/ui/ScreenHeader';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import { useAddTransaction } from '../../hooks/useAddTransaction';
import type { AppStackParamList } from '../../navigation/types';
import { colors, fontSize, fontWeight, radius, spacing } from '../../theme';
import { formatHeaderDate } from '../../utils/formatDate';
import type { Provider, TransactionCategory } from '../../types';

type AddTransactionNavigationProp = StackNavigationProp<
  AppStackParamList,
  'AddTransaction'
>;

interface AddTransactionScreenProps {
  navigation: AddTransactionNavigationProp;
}

export default function AddTransactionScreen({
  navigation,
}: AddTransactionScreenProps) {
  const {
    formState,
    setField,
    handleSubmit,
    isLoading,
    errors,
    feePreview,
    showSuccessToast,
  } = useAddTransaction(navigation);

  return (
    <ScreenWrapper background="white" scrollable keyboardAvoiding>
      <View style={styles.handleBar} />

      <ScreenHeader
        title="Add Transaction"
        subtitle="Record income or expense"
        right={
          <Pressable onPress={() => navigation.goBack()} style={styles.closeButton}>
            <Ionicons name="close" size={fontSize.xl} color={colors.textDark} />
          </Pressable>
        }
        style={styles.header}
      />

      {showSuccessToast ? (
        <SuccessToast message="Transaction saved!" />
      ) : null}

      <TypeToggle
        selectedType={formState.type}
        onSelect={(type) => setField('type', type)}
      />

      <View style={styles.amountSection}>
        <AmountDisplayInput
          value={formState.amount}
          onChangeText={(text) => setField('amount', text)}
          error={errors.amount}
        />
      </View>

      <Text style={styles.sectionTitle}>Details</Text>
      <Card style={styles.detailsCard}>
        {formState.type === 'expense' ? (
          <>
            <Text style={styles.fieldLabel}>Provider</Text>
            <ProviderChipRow
              selectedProvider={formState.provider}
              onSelect={(provider: Provider) => setField('provider', provider)}
            />
          </>
        ) : null}

        <Text style={styles.fieldLabel}>Category</Text>
        <CategoryChipGrid
          selectedCategory={formState.category}
          onSelect={(category: TransactionCategory) =>
            setField('category', category)
          }
        />
        {errors.category ? (
          <Text style={styles.errorText}>{errors.category}</Text>
        ) : null}

        {feePreview ? (
          <MoMoFeePreview
            providerFee={feePreview.providerFee}
            totalCost={feePreview.totalCost}
          />
        ) : null}
      </Card>

      <Text style={styles.sectionTitle}>Notes & date</Text>
      <Card style={styles.notesCard}>
        <AppInput
          label="Notes"
          value={formState.notes}
          onChangeText={(text) => setField('notes', text)}
          placeholder="Add a note (optional)"
          multiline
          numberOfLines={3}
        />

        <View style={styles.dateField}>
          <Ionicons
            name="calendar-outline"
            size={fontSize.lg}
            color={colors.textMuted}
          />
          <Text style={styles.dateText}>{formatHeaderDate(formState.date)}</Text>
        </View>
      </Card>

      <AppButton
        title="Save Transaction"
        onPress={() => {
          void handleSubmit();
        }}
        loading={isLoading}
        style={styles.saveButton}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  handleBar: {
    alignSelf: 'center',
    backgroundColor: colors.border,
    borderRadius: radius.full,
    height: spacing.xs,
    marginBottom: spacing.md,
    width: spacing.xxl,
  },
  header: {
    marginBottom: spacing.md,
  },
  closeButton: {
    padding: spacing.xs,
  },
  amountSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    color: colors.textDark,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.sm,
  },
  detailsCard: {
    marginBottom: spacing.lg,
  },
  notesCard: {
    marginBottom: spacing.lg,
  },
  fieldLabel: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  errorText: {
    color: colors.error,
    fontSize: fontSize.sm,
    marginBottom: spacing.sm,
  },
  dateField: {
    alignItems: 'center',
    backgroundColor: colors.chipBg,
    borderRadius: radius.md,
    flexDirection: 'row',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  dateText: {
    color: colors.textDark,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    marginLeft: spacing.sm,
  },
  saveButton: {
    marginBottom: spacing.xl,
  },
});
