import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import AppButton from '../../components/ui/AppButton';
import AppInput from '../../components/ui/AppInput';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import CategoryChipGrid from '../../components/finance/CategoryChipGrid';
import { SPENDING_CATEGORIES } from '../../constants/categories';
import { MOMO_PROVIDERS, useSendMoney } from '../../hooks/useSendMoney';
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

type SendMoneyNavProp = StackNavigationProp<AppStackParamList, 'SendMoney'>;

interface SendMoneyScreenProps {
  navigation: SendMoneyNavProp;
}

function ghs(amount: number): string {
  return `GH₵ ${new Intl.NumberFormat('en-GH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)}`;
}

export default function SendMoneyScreen({ navigation }: SendMoneyScreenProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const {
    walletBalance,
    amount,
    setAmount,
    momoNumber,
    setMomoNumber,
    momoProvider,
    setMomoProvider,
    category,
    setCategory,
    parsedAmount,
    isAmountValid,
    hasEnoughBalance,
    phase,
    error,
    handleSend,
    reset,
    ownPhone,
    isOwnNumber,
    useMyNumber,
  } = useSendMoney();

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
          <Text style={styles.headerTitle}>Send Money</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.walletCard}>
            <Text style={styles.walletLabel}>EcoSpend Wallet</Text>
            <Text style={styles.walletBalance}>
              Balance {ghs(walletBalance)}
            </Text>
          </View>

          {phase !== 'success' ? (
            <>
              <AppInput
                label="Amount to send (GHS)"
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                keyboardType="decimal-pad"
                error={error ?? undefined}
              />

              <Text style={styles.fieldLabel}>What are you spending on?</Text>
              <CategoryChipGrid
                selectedCategory={category}
                onSelect={setCategory}
                categories={SPENDING_CATEGORIES}
              />

              <Text style={styles.fieldLabel}>Recipient provider</Text>
              <View style={styles.providerRow}>
                {MOMO_PROVIDERS.map((provider) => (
                  <Pressable
                    key={provider.key}
                    onPress={() => setMomoProvider(provider.key)}
                    style={[
                      styles.providerChip,
                      momoProvider === provider.key && styles.providerChipActive,
                    ]}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: momoProvider === provider.key }}
                  >
                    <Text
                      style={[
                        styles.providerChipText,
                        momoProvider === provider.key && styles.providerChipTextActive,
                      ]}
                    >
                      {provider.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View style={styles.numberLabelRow}>
                <Text style={styles.fieldLabel}>Recipient MoMo number</Text>
                {ownPhone ? (
                  <Pressable
                    onPress={useMyNumber}
                    style={({ pressed }) => [styles.useMyNumberChip, pressed && styles.useMyNumberChipPressed]}
                  >
                    <Ionicons name="person-circle-outline" size={14} color={colors.primary} />
                    <Text style={styles.useMyNumberText}>Use my number</Text>
                  </Pressable>
                ) : null}
              </View>
              <AppInput
                value={momoNumber}
                onChangeText={setMomoNumber}
                placeholder="0241234567"
                keyboardType="phone-pad"
                hint="The money is transferred via Paystack and recorded automatically"
                maxLength={13}
              />
              {isOwnNumber ? (
                <View style={styles.selfBadge}>
                  <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
                  <Text style={styles.selfBadgeText}>Sending to your own EcoSpend number</Text>
                </View>
              ) : null}

              <AppButton
                title={phase === 'sending' ? 'Sending…' : 'Send Money'}
                icon="send-outline"
                onPress={() => void handleSend()}
                loading={phase === 'sending'}
                disabled={!isAmountValid || !category || phase === 'sending'}
              />
              {showTopUpPrompt ? (
                <AppButton
                  title="Top up wallet first"
                  variant="outline"
                  icon="add-circle-outline"
                  onPress={() => navigation.navigate('TopUpWallet')}
                />
              ) : null}
            </>
          ) : null}

          {phase === 'success' ? (
            <View style={styles.stateCard}>
              <Ionicons name="checkmark-circle" size={56} color={colors.success} />
              <Text style={styles.stateTitle}>Money sent</Text>
              <Text style={styles.stateBody}>
                {ghs(parsedAmount)} is on its way to {momoNumber} and has been
                recorded in your transactions.
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
    fieldLabel: {
      color: colors.textMuted,
      fontSize: fontSize.xs,
      fontWeight: fontWeight.semibold,
      textTransform: 'uppercase',
    },
    numberLabelRow: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    useMyNumberChip: {
      alignItems: 'center',
      backgroundColor: colors.primaryBackground,
      borderRadius: radius.chip,
      flexDirection: 'row',
      gap: spacing.xxs,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xxs,
    },
    useMyNumberChipPressed: {
      opacity: 0.7,
    },
    useMyNumberText: {
      color: colors.primary,
      fontSize: fontSize.xs,
      fontWeight: fontWeight.semibold,
    },
    selfBadge: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: spacing.xxs,
      marginTop: -spacing.xs,
    },
    selfBadgeText: {
      color: colors.primary,
      fontSize: fontSize.xs,
      fontWeight: fontWeight.medium,
    },
    providerRow: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    providerChip: {
      backgroundColor: colors.chipBg,
      borderColor: colors.borderSubtle,
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
      color: colors.textMuted,
      fontSize: fontSize.sm,
      fontWeight: fontWeight.medium,
    },
    providerChipTextActive: {
      color: colors.primary,
      fontWeight: fontWeight.semibold,
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
