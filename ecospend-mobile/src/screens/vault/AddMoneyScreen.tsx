import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
    walletBalance,
    amount,
    setAmount,
    isAmountValid,
    hasEnoughBalance,
    parsedAmount,
    phase,
    error,
    handleDeposit,
    reset,
  } = useAddMoney(vaultId);

  if (!vault) {
    return (
      <ScreenWrapper background="page">
        <Text style={styles.title}>Vault not found</Text>
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
          <Text style={styles.headerTitle}>Add Money</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.vaultCard}>
            <Text style={styles.vaultName}>{vault.name}</Text>
            <Text style={styles.vaultBalance}>
              Vault balance {ghs(vault.currentBalance)}
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
                label="Amount to move from wallet (GHS)"
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                keyboardType="decimal-pad"
                error={error ?? undefined}
                hint="Moves instantly from your EcoSpend wallet into this vault"
              />
              <AppButton
                title={phase === 'processing' ? 'Moving money…' : 'Deposit from Wallet'}
                icon="wallet-outline"
                onPress={() => void handleDeposit()}
                loading={phase === 'processing'}
                disabled={!isAmountValid || !hasEnoughBalance || phase === 'processing'}
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
                Vault deposits come from your wallet, so every move is backed by
                real money and recorded automatically in your transactions.
              </Text>
            </>
          ) : null}

          {phase === 'success' ? (
            <View style={styles.stateCard}>
              <Ionicons name="checkmark-circle" size={56} color={colors.success} />
              <Text style={styles.stateTitle}>Deposit complete</Text>
              <Text style={styles.stateBody}>
                {ghs(parsedAmount)} moved from your wallet into “{vault.name}”.
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
