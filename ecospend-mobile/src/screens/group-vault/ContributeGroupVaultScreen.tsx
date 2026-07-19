import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import AppButton from '../../components/ui/AppButton';
import AppInput from '../../components/ui/AppInput';
import CompletionCelebration from '../../components/ui/CompletionCelebration';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import { getApiErrorMessage } from '../../api/getApiErrorMessage';
import { useEnvelopes } from '../../context/EnvelopesContext';
import { useFinance } from '../../context/FinanceContext';
import { useVaults } from '../../context/VaultContext';
import { useWallet } from '../../context/WalletContext';
import type { AppStackParamList } from '../../navigation/types';
import {
  fontSize,
  fontWeight,
  radius,
  shadowSm,
  spacing,
  useTheme,
  useThemedStyles,
} from '../../theme';
import type { ThemeColors } from '../../theme';

type ContributeRouteProp = RouteProp<AppStackParamList, 'ContributeGroup'>;
type ContributeNavProp = StackNavigationProp<AppStackParamList, 'ContributeGroup'>;

interface ContributeGroupVaultScreenProps {
  route: ContributeRouteProp;
  navigation: ContributeNavProp;
}

function ghs(amount: number): string {
  return `GH₵ ${new Intl.NumberFormat('en-GH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)}`;
}

type Phase = 'input' | 'processing' | 'success' | 'failed';

export default function ContributeGroupVaultScreen({
  route,
  navigation,
}: ContributeGroupVaultScreenProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { groupVaultId } = route.params;
  const { getGroupVaultById, contributeToGroup } = useVaults();
  const { balance, refreshWallet } = useWallet();
  const { refreshTransactions } = useFinance();
  const { refreshEnvelopes } = useEnvelopes();

  const group = getGroupVaultById(groupVaultId);
  const [amount, setAmount] = useState('');
  const [phase, setPhase] = useState<Phase>('input');
  const [error, setError] = useState<string | null>(null);
  const [justCompleted, setJustCompleted] = useState(false);
  const [celebrationClosed, setCelebrationClosed] = useState(false);

  const parsedAmount = parseFloat(amount);
  const isAmountValid = Number.isFinite(parsedAmount) && parsedAmount > 0;
  const walletBalance = balance ?? 0;
  const hasEnoughBalance = isAmountValid && parsedAmount <= walletBalance;
  const remaining = group && group.targetAmount > 0
    ? Math.max(group.targetAmount - group.amountSaved, 0)
    : Infinity;
  const exceedsRemaining = isAmountValid && parsedAmount > remaining;

  const handleContribute = useCallback(async () => {
    if (!group || !isAmountValid) {
      setError('Enter an amount greater than 0');
      return;
    }
    if (exceedsRemaining) {
      setError(
        remaining <= 0
          ? 'This group vault has already hit its target — no further deposits accepted'
          : `That's more than this group vault needs — enter GHS ${remaining.toFixed(2)} or less`,
      );
      return;
    }
    if (!hasEnoughBalance) {
      setError('Amount exceeds your wallet balance — top up first');
      return;
    }

    const wasComplete = group.targetAmount > 0 && group.amountSaved >= group.targetAmount;

    setPhase('processing');
    setError(null);
    try {
      const updated = await contributeToGroup(group.id, parsedAmount);
      setPhase('success');
      setJustCompleted(
        updated.targetAmount > 0 && updated.amountSaved >= updated.targetAmount && !wasComplete,
      );
      void refreshWallet();
      void refreshTransactions();
      void refreshEnvelopes();
    } catch (err) {
      setPhase('failed');
      setError(getApiErrorMessage(err, 'Could not contribute to the group vault'));
    }
  }, [
    contributeToGroup,
    exceedsRemaining,
    group,
    hasEnoughBalance,
    isAmountValid,
    parsedAmount,
    refreshEnvelopes,
    refreshTransactions,
    refreshWallet,
    remaining,
  ]);

  if (!group) {
    return (
      <ScreenWrapper background="page">
        <Text style={styles.title}>Group vault not found</Text>
      </ScreenWrapper>
    );
  }

  const showTopUpPrompt =
    isAmountValid && !hasEnoughBalance && phase !== 'success';

  return (
    <ScreenWrapper background="page" padded={false}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]}
            hitSlop={spacing.sm}
          >
            <Ionicons name="chevron-back" size={24} color={colors.textDark} />
          </Pressable>
          <Text style={styles.headerTitle}>Contribute Funds</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.groupCard}>
            <Text style={styles.groupName}>{group.name}</Text>
            <Text style={styles.groupBalance}>
              Your contribution {ghs(group.myContribution)}
            </Text>
            <View style={styles.walletRow}>
              <Ionicons name="wallet-outline" size={16} color={colors.primary} />
              <Text style={styles.walletRowText}>
                Wallet balance {ghs(walletBalance)}
              </Text>
            </View>
          </View>

          {phase !== 'success' ? (
            <>
              <AppInput
                label="Amount to contribute (GHS)"
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                keyboardType="decimal-pad"
                error={
                  exceedsRemaining
                    ? `That's more than this group vault needs — enter GHS ${remaining.toFixed(2)} or less`
                    : error ?? undefined
                }
                hint="Moves instantly from your wallet into your group balance"
              />
              <AppButton
                title={phase === 'processing' ? 'Contributing…' : 'Contribute from Wallet'}
                icon="wallet-outline"
                onPress={() => void handleContribute()}
                loading={phase === 'processing'}
                disabled={!isAmountValid || exceedsRemaining || !hasEnoughBalance || phase === 'processing'}
              />
              {showTopUpPrompt ? (
                <AppButton
                  title="Top up wallet first"
                  variant="outline"
                  icon="add-circle-outline"
                  onPress={() => navigation.navigate('TopUpWallet')}
                />
              ) : null}
              <Text style={styles.securityNote}>
                Contributions stay in your own member balance and are recorded
                automatically in your transactions. Withdrawals need a majority
                vote from the group.
              </Text>
            </>
          ) : null}

          {phase === 'success' ? (
            <View style={styles.stateCard}>
              <Ionicons name="checkmark-circle" size={56} color={colors.success} />
              <Text style={styles.stateTitle}>Contribution complete</Text>
              <Text style={styles.stateBody}>
                {ghs(parsedAmount)} moved from your wallet into “{group.name}”.
              </Text>
              <AppButton
                title="Done"
                icon="checkmark-outline"
                onPress={() => navigation.goBack()}
              />
            </View>
          ) : null}

          {phase === 'failed' && error ? (
            <Pressable
              onPress={() => {
                setPhase('input');
                setError(null);
              }}
              style={styles.retryLink}
            >
              <Text style={styles.retryLinkText}>Start over</Text>
            </Pressable>
          ) : null}
        </ScrollView>
      </View>

      <CompletionCelebration
        visible={phase === 'success' && justCompleted && !celebrationClosed}
        icon="lock-closed"
        title="Group Target Reached! 🎯"
        subtitle={`"${group.name}" has hit its target — but it's still locked until ${new Date(group.maturityDate).toLocaleDateString('en-GH', { day: 'numeric', month: 'long', year: 'numeric' })}. Reaching the target early doesn't unlock a withdrawal — only the date, or a group vote, does.`}
        primaryLabel="Got it"
        primaryIcon="checkmark"
        onPrimaryPress={() => setCelebrationClosed(true)}
      />
    </ScreenWrapper>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    screen: { flex: 1 },
    header: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    backBtn: {
      borderRadius: radius.chip,
      padding: spacing.xs,
    },
    backBtnPressed: { opacity: 0.6 },
    headerTitle: {
      color: colors.textDark,
      fontSize: fontSize.lg,
      fontWeight: fontWeight.semibold,
    },
    headerSpacer: { width: 32 },
    content: {
      gap: spacing.md,
      padding: spacing.md,
    },
    title: {
      color: colors.textDark,
      fontSize: fontSize.lg,
      fontWeight: fontWeight.semibold,
    },
    groupCard: {
      backgroundColor: colors.cardBackground,
      borderColor: colors.borderSubtle,
      borderRadius: radius.card,
      borderWidth: 1.5,
      padding: spacing.md,
      ...shadowSm,
    },
    groupName: {
      color: colors.textDark,
      fontSize: fontSize.md,
      fontWeight: fontWeight.semibold,
    },
    groupBalance: {
      color: colors.textMuted,
      fontSize: fontSize.sm,
      marginTop: spacing.xs,
    },
    walletRow: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: spacing.xs,
      marginTop: spacing.sm,
    },
    walletRowText: {
      color: colors.primary,
      fontSize: fontSize.sm,
      fontWeight: fontWeight.medium,
    },
    securityNote: {
      color: colors.textMuted,
      fontSize: fontSize.xs,
      lineHeight: 18,
      textAlign: 'center',
    },
    stateCard: {
      alignItems: 'center',
      backgroundColor: colors.cardBackground,
      borderColor: colors.borderSubtle,
      borderRadius: radius.card,
      borderWidth: 1.5,
      gap: spacing.md,
      padding: spacing.lg,
      ...shadowSm,
    },
    stateTitle: {
      color: colors.textDark,
      fontSize: fontSize.lg,
      fontWeight: fontWeight.semibold,
    },
    stateBody: {
      color: colors.textMuted,
      fontSize: fontSize.sm,
      lineHeight: 20,
      textAlign: 'center',
    },
    retryLink: {
      alignSelf: 'center',
      padding: spacing.sm,
    },
    retryLinkText: {
      color: colors.primary,
      fontSize: fontSize.sm,
      fontWeight: fontWeight.semibold,
    },
  });
