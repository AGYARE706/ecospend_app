import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import AppButton from '../../components/ui/AppButton';
import AppInput from '../../components/ui/AppInput';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import { useAddMoney } from '../../hooks/useAddMoney';
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

type AddMoneyRouteProp = RouteProp<AppStackParamList, 'AddMoney'>;
type AddMoneyNavProp = StackNavigationProp<AppStackParamList, 'AddMoney'>;

interface AddMoneyScreenProps {
  route: AddMoneyRouteProp;
  navigation: AddMoneyNavProp;
}

function ghs(amount: number): string {
  return `GH₵ ${new Intl.NumberFormat('en-GH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)}`;
}

export default function AddMoneyScreen({ route, navigation }: AddMoneyScreenProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { vaultId } = route.params;
  const {
    vault,
    amount,
    setAmount,
    isAmountValid,
    parsedAmount,
    phase,
    error,
    handlePay,
    checkNow,
    reset,
  } = useAddMoney(vaultId);

  if (!vault) {
    return (
      <ScreenWrapper background="page">
        <Text style={styles.title}>Vault not found</Text>
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
          <Text style={styles.headerTitle}>Add Money</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.vaultCard}>
            <Text style={styles.vaultName}>{vault.name}</Text>
            <Text style={styles.vaultBalance}>
              Balance {ghs(vault.currentBalance)}
            </Text>
          </View>

          {phase === 'input' || phase === 'starting' || phase === 'failed' ? (
            <>
              <AppInput
                label="Amount to deposit (GHS)"
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
                Your vault is only credited after Paystack confirms the payment.
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
              <Text style={styles.stateTitle}>Deposit confirmed</Text>
              <Text style={styles.stateBody}>
                {ghs(parsedAmount)} has been added to “{vault.name}”.
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
    title: {
      color: colors.textDark,
      fontSize: fontSize.lg,
      fontWeight: fontWeight.semibold,
    },
    vaultCard: {
      backgroundColor: colors.cardBackground,
      borderColor: colors.borderSubtle,
      borderRadius: radius.card,
      borderWidth: 1.5,
      padding: spacing.md,
      ...shadowSm,
    },
    vaultName: {
      color: colors.textDark,
      fontSize: fontSize.md,
      fontWeight: fontWeight.semibold,
    },
    vaultBalance: {
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
