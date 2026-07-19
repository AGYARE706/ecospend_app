import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import AppButton from '../../components/ui/AppButton';
import AppInput from '../../components/ui/AppInput';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import { getApiErrorMessage } from '../../api/getApiErrorMessage';
import { useVaults } from '../../context/VaultContext';
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
import { groupWithdrawalFeeRate } from '../../utils/vault';

type RequestRouteProp = RouteProp<AppStackParamList, 'RequestGroupWithdrawal'>;
type RequestNavProp = StackNavigationProp<AppStackParamList, 'RequestGroupWithdrawal'>;

interface RequestGroupWithdrawalScreenProps {
  route: RequestRouteProp;
  navigation: RequestNavProp;
}

function ghs(amount: number): string {
  return `GH₵ ${new Intl.NumberFormat('en-GH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)}`;
}

type Phase = 'input' | 'processing' | 'success' | 'failed';

export default function RequestGroupWithdrawalScreen({
  route,
  navigation,
}: RequestGroupWithdrawalScreenProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { groupVaultId } = route.params;
  const { getGroupVaultById, requestWithdrawal } = useVaults();

  const group = getGroupVaultById(groupVaultId);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [phase, setPhase] = useState<Phase>('input');
  const [error, setError] = useState<string | null>(null);

  const parsedAmount = parseFloat(amount);
  const ownBalance = group?.myContribution ?? 0;
  const isAmountValid = Number.isFinite(parsedAmount) && parsedAmount > 0;
  const withinOwnBalance = isAmountValid && parsedAmount <= ownBalance;

  const feeRate = group ? groupWithdrawalFeeRate(group) : 0.02;
  const feeAmount = isAmountValid ? parsedAmount * feeRate : 0;
  const netAmount = isAmountValid ? parsedAmount - feeAmount : 0;
  const isEarly = group ? new Date() < new Date(group.maturityDate) : false;
  const isShortfall = !isEarly && group ? group.amountSaved < group.targetAmount && group.targetAmount > 0 : false;

  const handleRequest = useCallback(async () => {
    if (!group || !isAmountValid) {
      setError('Enter an amount greater than 0');
      return;
    }
    if (!withinOwnBalance) {
      setError('Amount exceeds your own balance in this group vault');
      return;
    }

    setPhase('processing');
    setError(null);
    try {
      await requestWithdrawal(group.id, parsedAmount, note.trim() || undefined);
      setPhase('success');
    } catch (err) {
      setPhase('failed');
      setError(getApiErrorMessage(err, 'Could not request a withdrawal'));
    }
  }, [group, isAmountValid, note, parsedAmount, requestWithdrawal, withinOwnBalance]);

  if (!group) {
    return (
      <ScreenWrapper background="page">
        <Text style={styles.title}>Group vault not found</Text>
      </ScreenWrapper>
    );
  }

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
          <Text style={styles.headerTitle}>Request Withdrawal</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.groupCard}>
            <Text style={styles.groupName}>{group.name}</Text>
            <Text style={styles.groupBalance}>
              Your balance in this vault {ghs(ownBalance)}
            </Text>
          </View>

          {phase !== 'success' ? (
            <>
              <AppInput
                label="Amount to request (GHS)"
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                keyboardType="decimal-pad"
                error={error ?? undefined}
                hint="Capped at your own balance — never another member's"
              />

              <View style={styles.noteField}>
                <Text style={styles.noteLabel}>Reason (optional)</Text>
                <TextInput
                  style={styles.noteInput}
                  value={note}
                  onChangeText={setNote}
                  placeholder="Let the group know why you're withdrawing"
                  placeholderTextColor={colors.textLight}
                  multiline
                  maxLength={280}
                />
              </View>

              {isAmountValid ? (
                <View style={styles.feePreview}>
                  <View style={styles.feePreviewRow}>
                    <Text style={styles.feePreviewLabel}>
                      Fee if approved ({Math.round(feeRate * 100)}%
                      {isEarly ? ' — before the lock date' : isShortfall ? ' — group under target' : ''})
                    </Text>
                    <Text style={styles.feePreviewValue}>− {ghs(feeAmount)}</Text>
                  </View>
                  <View style={styles.feePreviewRow}>
                    <Text style={styles.feePreviewLabel}>You'd receive</Text>
                    <Text style={styles.feePreviewNet}>{ghs(netAmount)}</Text>
                  </View>
                </View>
              ) : null}

              <AppButton
                title={phase === 'processing' ? 'Submitting…' : 'Submit for Group Vote'}
                icon="thumbs-up-outline"
                onPress={() => void handleRequest()}
                loading={phase === 'processing'}
                disabled={!isAmountValid || !withinOwnBalance || phase === 'processing'}
              />
              <Text style={styles.securityNote}>
                Your own approval is counted automatically. A majority of
                active members must approve for this to pay out — it never
                touches other members' funds.
              </Text>
            </>
          ) : null}

          {phase === 'success' ? (
            <View style={styles.stateCard}>
              <Ionicons name="checkmark-circle" size={56} color={colors.success} />
              <Text style={styles.stateTitle}>Request submitted</Text>
              <Text style={styles.stateBody}>
                Your request for {ghs(parsedAmount)} from “{group.name}” is
                now up for a group vote.
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
    noteField: {
      gap: spacing.xs,
    },
    noteLabel: {
      color: colors.textMuted,
      fontSize: fontSize.xs,
      fontWeight: fontWeight.semibold,
      textTransform: 'uppercase',
    },
    noteInput: {
      backgroundColor: colors.cardBackground,
      borderColor: colors.borderSubtle,
      borderRadius: radius.card,
      borderWidth: 1.5,
      color: colors.textDark,
      fontSize: fontSize.sm,
      minHeight: 72,
      padding: spacing.md,
      textAlignVertical: 'top',
    },
    feePreview: {
      backgroundColor: colors.chipBg,
      borderRadius: radius.card,
      gap: spacing.xs,
      padding: spacing.md,
    },
    feePreviewRow: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    feePreviewLabel: {
      color: colors.textMuted,
      flex: 1,
      fontSize: fontSize.xs,
    },
    feePreviewValue: {
      color: colors.error,
      fontSize: fontSize.sm,
      fontWeight: fontWeight.semibold,
    },
    feePreviewNet: {
      color: colors.textDark,
      fontSize: fontSize.sm,
      fontWeight: fontWeight.bold,
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
