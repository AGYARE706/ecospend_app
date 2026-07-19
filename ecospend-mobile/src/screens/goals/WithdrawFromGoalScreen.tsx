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

import * as paymentsApi from '../../api/paymentsApi';
import { getApiErrorMessage } from '../../api/getApiErrorMessage';
import AppButton from '../../components/ui/AppButton';
import AppInput from '../../components/ui/AppInput';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import { Icon } from '../../components/ui/icons';
import { useAuth } from '../../context/AuthContext';
import { useEnvelopes } from '../../context/EnvelopesContext';
import { useFinance } from '../../context/FinanceContext';
import { useGoals } from '../../context/GoalsContext';
import { useWallet } from '../../context/WalletContext';
import { MOMO_PROVIDERS, type MomoProvider } from '../../hooks/useSendMoney';
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
type WithdrawDestination = 'wallet' | 'momo';

export default function WithdrawFromGoalScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { params } = useRoute<WithdrawFromGoalRouteProp>();
  const navigation = useNavigation();
  const { getGoalById, withdrawFromGoal, isContributing } = useGoals();
  const { user, setMomoProvider: persistMomoProvider } = useAuth();
  const { refreshWallet } = useWallet();
  const { refreshTransactions } = useFinance();
  const { refreshEnvelopes } = useEnvelopes();
  const [amount, setAmount] = useState('');
  const [destination, setDestination] = useState<WithdrawDestination>('wallet');
  const [provider, setProvider] = useState<MomoProvider | null>(
    (user?.momoProvider as MomoProvider) ?? null,
  );
  const [payingOut, setPayingOut] = useState(false);
  const [payoutError, setPayoutError] = useState<string | null>(null);

  const goal = getGoalById(params.goalId);
  const ownPhone = user?.phone?.trim() ?? '';

  // Frozen at mount: withdrawFromGoal() updates the goal in context mid-flow
  // (currentAmount drops immediately), which would otherwise flip isValid/error
  // against a live-shrinking balance and flash an error right as the screen
  // navigates away. Validate against the balance as it was when the form opened.
  const [startingBalance] = useState(() => goal?.currentAmount ?? 0);

  if (!goal) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <EmptyState
          imageSource={require('../../../assets/goal.png')}
          title="Goal not found"
          subtitle="This goal may have been deleted."
          actionLabel="Go back"
          onAction={() => navigation.goBack()}
        />
      </SafeAreaView>
    );
  }

  const parsedAmount = Number(amount) || 0;
  const isValid =
    parsedAmount > 0 &&
    parsedAmount <= startingBalance &&
    (destination === 'wallet' || (destination === 'momo' && !!provider && !!ownPhone));

  const handleWithdraw = async () => {
    if (!isValid) {
      return;
    }
    setPayoutError(null);
    const ok = await withdrawFromGoal(goal.id, parsedAmount);
    if (!ok) {
      return;
    }
    if (destination === 'wallet' || !provider || !ownPhone) {
      navigation.goBack();
      return;
    }

    // Straight to MoMo: the wallet credit above already landed, now send
    // it straight back out — one confirmation instead of two separate trips.
    setPayingOut(true);
    if (provider !== user?.momoProvider) {
      void persistMomoProvider(provider).catch(() => undefined);
    }
    try {
      await paymentsApi.sendMoney({
        amount: parsedAmount,
        momoNumber: ownPhone,
        momoProvider: provider,
        category: 'Savings',
      });
      void refreshWallet();
      void refreshTransactions();
      void refreshEnvelopes();
      navigation.goBack();
    } catch (err) {
      setPayoutError(
        getApiErrorMessage(
          err,
          'Withdrawn to your wallet, but the direct payout failed — the money is safe, you can retry from Send Money.',
        ),
      );
    } finally {
      setPayingOut(false);
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
            <Card variant="default" padding="sm" style={styles.goalCard}>
              <Text style={[typography.overline, styles.goalEyebrow]} numberOfLines={1}>
                {goal.name.toUpperCase()}
              </Text>
              <Text style={[typography.h2, styles.goalAmount]} numberOfLines={1}>
                GHS{' '}
                {startingBalance.toLocaleString(undefined, {
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
                parsedAmount > startingBalance
                  ? 'Amount exceeds the goal balance'
                  : undefined
              }
            />
          </View>

          <View style={styles.section}>
            <Text style={[typography.label, styles.destinationLabel]}>Send the money to</Text>
            <View style={styles.destinationRow}>
              <TouchableOpacity
                style={[styles.destinationChip, destination === 'wallet' && styles.destinationChipActive]}
                onPress={() => setDestination('wallet')}
              >
                <Icon name="wallet" size={16} color={destination === 'wallet' ? colors.primary : colors.textSecondary} />
                <Text style={[styles.destinationChipText, destination === 'wallet' && styles.destinationChipTextActive]}>
                  To My Wallet
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.destinationChip, destination === 'momo' && styles.destinationChipActive]}
                onPress={() => setDestination('momo')}
              >
                <Icon name="send" size={16} color={destination === 'momo' ? colors.primary : colors.textSecondary} />
                <Text style={[styles.destinationChipText, destination === 'momo' && styles.destinationChipTextActive]}>
                  Directly to My MoMo
                </Text>
              </TouchableOpacity>
            </View>

            {destination === 'momo' ? (
              <View style={styles.momoBox}>
                <Text style={styles.momoNumberText}>{user?.phone ?? 'No number linked'}</Text>
                <View style={styles.providerRow}>
                  {MOMO_PROVIDERS.map((p) => (
                    <TouchableOpacity
                      key={p.key}
                      style={[styles.providerChip, provider === p.key && styles.providerChipActive]}
                      onPress={() => setProvider(p.key)}
                    >
                      <Text style={[styles.providerChipText, provider === p.key && styles.providerChipTextActive]}>
                        {p.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : null}

            {payoutError ? <Text style={styles.payoutErrorText}>{payoutError}</Text> : null}
          </View>

          <View style={styles.section}>
            <AppButton
              title={destination === 'momo' ? 'Withdraw Directly to MoMo' : 'Withdraw to Wallet'}
              onPress={() => {
                void handleWithdraw();
              }}
              loading={isContributing || payingOut}
              disabled={!isValid}
              icon={destination === 'momo' ? 'send' : 'wallet'}
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
    destinationLabel: {
      color: colors.textSecondary,
      marginBottom: spacing.sm,
    },
    destinationRow: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    destinationChip: {
      alignItems: 'center',
      backgroundColor: colors.cardBackground,
      borderColor: colors.border,
      borderRadius: radius.chip,
      borderWidth: 1.5,
      flex: 1,
      flexDirection: 'row',
      gap: spacing.xs,
      justifyContent: 'center',
      paddingVertical: spacing.sm,
    },
    destinationChipActive: {
      backgroundColor: colors.primaryBackground,
      borderColor: colors.primary,
    },
    destinationChipText: {
      color: colors.textSecondary,
      fontSize: fontSize.sm,
      fontWeight: fontWeight.medium,
    },
    destinationChipTextActive: {
      color: colors.primary,
      fontWeight: fontWeight.semibold,
    },
    momoBox: {
      marginTop: spacing.md,
    },
    momoNumberText: {
      color: colors.textPrimary,
      fontSize: fontSize.sm,
      fontWeight: fontWeight.semibold,
      marginBottom: spacing.sm,
    },
    providerRow: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    providerChip: {
      backgroundColor: colors.chipBg,
      borderColor: colors.border,
      borderRadius: radius.chip,
      borderWidth: 1.5,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    providerChipActive: {
      backgroundColor: colors.primaryBackground,
      borderColor: colors.primary,
    },
    providerChipText: {
      color: colors.textSecondary,
      fontSize: fontSize.sm,
      fontWeight: fontWeight.medium,
    },
    providerChipTextActive: {
      color: colors.primary,
      fontWeight: fontWeight.semibold,
    },
    payoutErrorText: {
      color: colors.error,
      fontSize: fontSize.xs,
      marginTop: spacing.sm,
    },
  });
