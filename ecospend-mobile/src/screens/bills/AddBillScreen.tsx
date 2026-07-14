import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { StackNavigationProp } from '@react-navigation/stack';

import * as billsApi from '../../api/billsApi';
import { getApiErrorMessage } from '../../api/getApiErrorMessage';
import AppButton from '../../components/ui/AppButton';
import AppInput from '../../components/ui/AppInput';
import Card from '../../components/ui/Card';
import IconButton from '../../components/ui/IconButton';
import ScreenHeader from '../../components/ui/ScreenHeader';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import type { BillingCycle } from '../../api/billsApi';
import type { AppStackParamList } from '../../navigation/types';
import {
  fontSize,
  fontWeight,
  radius,
  spacing,
  useThemedStyles,
} from '../../theme';
import type { ThemeColors } from '../../theme';

type AddBillNavProp = StackNavigationProp<AppStackParamList, 'AddBill'>;

interface AddBillScreenProps {
  navigation: AddBillNavProp;
}

const CYCLES: { key: BillingCycle; label: string }[] = [
  { key: 'MONTHLY', label: 'Monthly' },
  { key: 'YEARLY', label: 'Yearly' },
];

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export default function AddBillScreen({ navigation }: AddBillScreenProps) {
  const styles = useThemedStyles(createStyles);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [cycle, setCycle] = useState<BillingCycle>('MONTHLY');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setError(null);
    const parsedAmount = parseFloat(amount);

    if (!name.trim()) {
      setError('Enter a name for the bill');
      return;
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError('Enter an amount greater than 0');
      return;
    }
    if (dueDate.trim() && !DATE_PATTERN.test(dueDate.trim())) {
      setError('Due date must be YYYY-MM-DD (or leave it empty for today)');
      return;
    }

    setIsSaving(true);
    try {
      await billsApi.createBill({
        name: name.trim(),
        amount: parsedAmount,
        billingCycle: cycle,
        nextDueDate: dueDate.trim() || undefined,
      });
      navigation.goBack();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not save the bill'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScreenWrapper background="white" scrollable keyboardAvoiding>
      <View style={styles.handleBar} />

      <ScreenHeader
        title="Add Bill"
        subtitle="Track a recurring payment"
        right={
          <IconButton
            icon="x"
            variant="soft"
            onPress={() => navigation.goBack()}
            accessibilityLabel="Close"
          />
        }
      />

      <Card style={styles.card}>
        <AppInput
          label="Name"
          value={name}
          onChangeText={setName}
          placeholder="e.g. Netflix, DSTV, Gym"
        />
        <AppInput
          label="Amount (GHS)"
          value={amount}
          onChangeText={setAmount}
          placeholder="0.00"
          keyboardType="decimal-pad"
        />

        <Text style={styles.fieldLabel}>Billing cycle</Text>
        <View style={styles.cycleRow}>
          {CYCLES.map((item) => (
            <Pressable
              key={item.key}
              onPress={() => setCycle(item.key)}
              style={[styles.cycleChip, cycle === item.key && styles.cycleChipActive]}
              accessibilityRole="radio"
              accessibilityState={{ selected: cycle === item.key }}
            >
              <Text
                style={[
                  styles.cycleChipText,
                  cycle === item.key && styles.cycleChipTextActive,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <AppInput
          label="First due date (optional)"
          value={dueDate}
          onChangeText={setDueDate}
          placeholder="YYYY-MM-DD — defaults to today"
          error={error ?? undefined}
        />
      </Card>

      <AppButton
        title="Save Bill"
        onPress={() => {
          void handleSave();
        }}
        loading={isSaving}
        style={styles.saveButton}
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
    card: {
      gap: spacing.sm,
      marginBottom: spacing.lg,
    },
    fieldLabel: {
      color: colors.textMuted,
      fontSize: fontSize.xs,
      fontWeight: fontWeight.semibold,
      marginTop: spacing.xs,
      textTransform: 'uppercase',
    },
    cycleRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    cycleChip: {
      backgroundColor: colors.chipBg,
      borderColor: colors.borderSubtle,
      borderRadius: radius.chip,
      borderWidth: 1.5,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
    },
    cycleChipActive: {
      backgroundColor: colors.primaryBackground,
      borderColor: colors.primary,
    },
    cycleChipText: {
      color: colors.textMuted,
      fontSize: fontSize.sm,
      fontWeight: fontWeight.medium,
    },
    cycleChipTextActive: {
      color: colors.primary,
      fontWeight: fontWeight.semibold,
    },
    saveButton: {
      marginBottom: spacing.xl,
    },
  });
