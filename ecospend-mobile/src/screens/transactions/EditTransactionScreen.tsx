import { StyleSheet, Text, View } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import AmountDisplayInput from '../../components/finance/AmountDisplayInput';
import CategoryChipGrid from '../../components/finance/CategoryChipGrid';
import ProviderChipRow from '../../components/finance/ProviderChipRow';
import SuccessToast from '../../components/finance/SuccessToast';
import TypeToggle from '../../components/finance/TypeToggle';
import AppButton from '../../components/ui/AppButton';
import AppInput from '../../components/ui/AppInput';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import IconButton from '../../components/ui/IconButton';
import ScreenHeader from '../../components/ui/ScreenHeader';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import { Icon } from '../../components/ui/icons';
import { useEditTransaction } from '../../hooks/useEditTransaction';
import type { TransactionsStackParamList } from '../../navigation/types';
import { radius, spacing, typography, useTheme, useThemedStyles } from '../../theme';
import type { ThemeColors } from '../../theme';
import { formatHeaderDate } from '../../utils/formatDate';
import type { Provider, TransactionCategory } from '../../types';

type EditTransactionNavigationProp = StackNavigationProp<
  TransactionsStackParamList,
  'EditTransaction'
>;
type EditTransactionRouteProp = RouteProp<
  TransactionsStackParamList,
  'EditTransaction'
>;

interface EditTransactionScreenProps {
  navigation: EditTransactionNavigationProp;
  route: EditTransactionRouteProp;
}

export default function EditTransactionScreen({
  navigation,
  route,
}: EditTransactionScreenProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const {
    isFound,
    formState,
    setField,
    handleSubmit,
    handleDelete,
    isLoading,
    isDeleting,
    errors,
    showSuccessToast,
  } = useEditTransaction(route.params.transactionId, navigation);

  if (!isFound) {
    return (
      <ScreenWrapper background="white">
        <ScreenHeader
          title="Edit Transaction"
          right={
            <IconButton
              icon="x"
              variant="soft"
              onPress={() => navigation.goBack()}
              accessibilityLabel="Close"
            />
          }
        />
        <EmptyState
          icon="receipt"
          title="Transaction not found"
          subtitle="This entry may have been removed."
          actionLabel="Go back"
          onAction={() => navigation.goBack()}
        />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper background="white" scrollable keyboardAvoiding>
      <View style={styles.handleBar} />

      <ScreenHeader
        title="Edit Transaction"
        subtitle="Update or delete this entry"
        right={
          <IconButton
            icon="x"
            variant="soft"
            onPress={() => navigation.goBack()}
            accessibilityLabel="Close"
          />
        }
        style={styles.header}
      />

      {showSuccessToast ? (
        <SuccessToast message="Transaction updated!" />
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
          <Icon name="calendar" size={18} color={colors.textMuted} />
          <Text style={styles.dateText} numberOfLines={1}>
            {formatHeaderDate(formState.date)}
          </Text>
        </View>
      </Card>

      <AppButton
        title="Save changes"
        onPress={() => {
          void handleSubmit();
        }}
        loading={isLoading}
        style={styles.saveButton}
      />

      <AppButton
        title="Delete transaction"
        variant="destructive"
        onPress={() => {
          void handleDelete();
        }}
        loading={isDeleting}
        style={styles.deleteButton}
      />
    </ScreenWrapper>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
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
    amountSection: {
      marginBottom: spacing.lg,
    },
    sectionTitle: {
      ...typography.subheading,
      color: colors.textDark,
      marginBottom: spacing.sm,
    },
    detailsCard: {
      marginBottom: spacing.lg,
    },
    notesCard: {
      marginBottom: spacing.lg,
    },
    fieldLabel: {
      ...typography.overline,
      color: colors.textMuted,
      marginBottom: spacing.sm,
      textTransform: 'uppercase',
    },
    errorText: {
      ...typography.bodySm,
      color: colors.error,
      marginBottom: spacing.sm,
    },
    dateField: {
      alignItems: 'center',
      backgroundColor: colors.chipBg,
      borderRadius: radius.md,
      flexDirection: 'row',
      gap: spacing.sm,
      marginTop: spacing.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
    },
    dateText: {
      ...typography.label,
      color: colors.textDark,
      flex: 1,
    },
    saveButton: {
      marginBottom: spacing.md,
    },
    deleteButton: {
      marginBottom: spacing.xl,
    },
  });
