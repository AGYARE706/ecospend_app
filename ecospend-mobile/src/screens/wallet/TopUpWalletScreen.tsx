import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import AppButton from '../../components/ui/AppButton';
import AppInput from '../../components/ui/AppInput';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import { useTopUp } from '../../hooks/useTopUp';
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

type TopUpNavProp = StackNavigationProp<AppStackParamList, 'TopUpWallet'>;

interface TopUpWalletScreenProps {
  navigation: TopUpNavProp;
}

function ghs(amount: number): string {
  return `GH₵ ${new Intl.NumberFormat('en-GH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)}`;
}

export default function TopUpWalletScreen({ navigation }: TopUpWalletScreenProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const {
    walletBalance,
    amount,
    setAmount,
    isAmountValid,
    parsedAmount,
    phase,
    error,
    handlePay,
    checkNow,
    reset,
  } = useTopUp();

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
          <Text style={styles.headerTitle}>Top Up Wallet</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.walletCard}>
            <Text style={styles.walletLabel}>EcoSpend Wallet</Text>
            <Text style={styles.walletBalance}>
              Balance {ghs(walletBalance ?? 0)}
            </Text>
          </View>

          {phase === 'input' || phase === 'starting' || phase === 'failed' ? (
            <>
              <AppInput
                label="Amount to add (GHS)"
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                keyboardType="decimal-pad"
                error={error ?? undefined}
                hint="You'll pay securely through Paystack — card or Mobile Money"
              />
              <AppButton
                title={phase === 'starting' ? 'Opening checkout…' : 'Pay with Paystack'}
                icon="card-outline"
                onPress={() => void handlePay()}
                loading={phase === 'starting'}
                disabled={!isAmountValid || phase === 'starting'}
              />
              <Text style={styles.securityNote}>
                Your wallet is only credited after Paystack confirms the payment.
                EcoSpend never sees your card or PIN details.
              </Text>
            </>
          ) : null}

          {phase === 'awaiting' ? (
            <View style={styles.stateCard}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.stateTitle}>Waiting for your payment</Text>
              <Text style={styles.stateBody}>
                Complete the {ghs(parsedAmount)} payment in the browser window
                that just opened. This screen updates automatically once
                Paystack confirms it.
              </Text>
              <AppButton
                title="Check status now"
                variant="outline"
                icon="refresh-outline"
                onPress={() => void checkNow()}
              />
            </View>
          ) : null}

          {phase === 'success' ? (
            <View style={styles.stateCard}>
              <Ionicons name="checkmark-circle" size={56} color={colors.success} />
              <Text style={styles.stateTitle}>Top-up confirmed</Text>
              <Text style={styles.stateBody}>
                {ghs(parsedAmount)} has been added to your wallet and recorded
                in your transactions.
              </Text>
              <AppButton
                title="Done"
                icon="checkmark-outline"
                onPress={() => navigation.goBack()}
              />
            </View>
          ) : null}

          {phase === 'failed' && error ? (
            <Pressable onPress={reset} style={styles.retryLink}>
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
    walletCard: {
      backgroundColor: colors.cardBackground,
      borderColor: colors.borderSubtle,
      borderRadius: radius.card,
      borderWidth: 1.5,
      padding: spacing.md,
      ...shadowSm,
    },
    walletLabel: {
      color: colors.textDark,
      fontSize: fontSize.md,
      fontWeight: fontWeight.semibold,
    },
    walletBalance: {
      color: colors.textMuted,
      fontSize: fontSize.sm,
      marginTop: spacing.xs,
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
