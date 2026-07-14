import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';

import AppButton from '../../components/ui/AppButton';
import AppInput from '../../components/ui/AppInput';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import { Icon } from '../../components/ui/icons';
import { useGoals } from '../../context/GoalsContext';
import type { AppStackParamList } from '../../navigation/types';
import {
  fontSize,
  fontWeight,
  radius,
  spacing,
  typography,
  useTheme,
  useThemedStyles,
} from '../../theme';
import type { ThemeColors } from '../../theme';

type WithdrawFromGoalRouteProp = RouteProp<AppStackParamList, 'WithdrawFromGoal'>;

export default function WithdrawFromGoalScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { params } = useRoute<WithdrawFromGoalRouteProp>();
  const navigation = useNavigation();
  const { getGoalById, withdrawFromGoal, isContributing } = useGoals();
  const [amount, setAmount] = useState('');

  const goal = getGoalById(params.goalId);

  if (!goal) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <EmptyState
          icon="target"
          title="Goal not found"
          subtitle="This goal may have been deleted."
          actionLabel="Go back"
          onAction={() => navigation.goBack()}
        />
      </SafeAreaView>
    );
  }

  const parsedAmount = Number(amount) || 0;
  const isValid = parsedAmount > 0 && parsedAmount <= goal.currentAmount;

  const handleWithdraw = async () => {
    if (!isValid) {
      return;
    }
    const ok = await withdrawFromGoal(goal.id, parsedAmount);
    if (ok) {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        enabled={Platform.OS === 'ios'}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
              <Icon name="chevron-left" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={[typography.h3, styles.headerTitle]}>Withdraw from Goal</Text>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.section}>
            <Card variant="default" padding="lg" style={styles.goalCard}>
              <Text style={[typography.overline, styles.goalEyebrow]} numberOfLines={1}>
                {goal.name.toUpperCase()}
              </Text>
              <Text style={[typography.h2, styles.goalAmount]} numberOfLines={1}>
                GHS{' '}
                {goal.currentAmount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
              <Text style={styles.goalMetaText}>Available to withdraw</Text>
            </Card>
          </View>

          <View style={styles.section}>
            <AppInput
              label="Withdrawal Amount"
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              keyboardType="decimal-pad"
              leadingIcon="cash"
              hint="Moves back into your EcoSpend wallet — no fees, no lock"
              error={
                parsedAmount > goal.currentAmount
                  ? 'Amount exceeds the goal balance'
                  : undefined
              }
            />
          </View>

          <View style={styles.section}>
            <AppButton
              title="Withdraw to Wallet"
              onPress={() => {
                void handleWithdraw();
              }}
              loading={isContributing}
              disabled={!isValid}
              icon="wallet"
              variant="primary"
              size="lg"
              fullWidth
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.pageBackground,
    },
    flex: {
      flex: 1,
    },
    container: {
      flex: 1,
      backgroundColor: colors.pageBackground,
    },
    contentContainer: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.md,
      paddingBottom: spacing.xl,
    },
    header: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.lg,
    },
    iconButton: {
      alignItems: 'center',
      backgroundColor: colors.cardBackground,
      borderColor: colors.border,
      borderRadius: radius.button,
      borderWidth: 1,
      height: 44,
      justifyContent: 'center',
      width: 44,
    },
    headerTitle: {
      color: colors.textPrimary,
      fontWeight: fontWeight.bold,
    },
    headerSpacer: {
      width: 44,
    },
    section: {
      marginBottom: spacing.lg,
    },
    goalCard: {
      gap: spacing.xs,
    },
    goalEyebrow: {
      color: colors.textLight,
    },
    goalAmount: {
      color: colors.textPrimary,
    },
    goalMetaText: {
      color: colors.textSecondary,
      fontSize: fontSize.xs,
      fontWeight: fontWeight.medium,
    },
  });
