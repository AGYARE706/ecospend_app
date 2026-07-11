import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import AppButton from '../../components/ui/AppButton';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import { useWithdrawVault } from '../../hooks/useWithdrawVault';
import type { AppStackParamList } from '../../navigation/types';
import {
  fontSize,
  fontWeight,
  radius,
  shadowMd,
  shadowSm,
  spacing,
  useTheme,
  useThemedStyles,
} from '../../theme';
import type { ThemeColors } from '../../theme';

// ─── Navigation ───────────────────────────────────────────────────────────────
type WithdrawRouteProp = RouteProp<AppStackParamList, 'WithdrawVault'>;
type WithdrawNavProp = StackNavigationProp<AppStackParamList, 'WithdrawVault'>;

interface WithdrawVaultScreenProps {
  route: WithdrawRouteProp;
  navigation: WithdrawNavProp;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function ghs(amount: number): string {
  return `GH₵ ${new Intl.NumberFormat('en-GH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)}`;
}

function pct(rate: number): string {
  return `${(rate * 100).toFixed(0)}%`;
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function WithdrawVaultScreen({
  route,
  navigation,
}: WithdrawVaultScreenProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { vaultId } = route.params;
  const {
    vault,
    withdrawalType,
    daysRemaining,
    fees,
    formattedMaturity,
    isConfirmed,
    isLoading,
    toggleConfirm,
    handleConfirm,
  } = useWithdrawVault(vaultId, navigation);

  const isEarly = withdrawalType === 'early';

  return (
    <ScreenWrapper background="page" padded={false}>
      <View style={styles.screen}>
        {/* ─── Header ──────────────────────────────────────────────── */}
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [
              styles.backBtn,
              pressed && styles.backBtnPressed,
            ]}
            hitSlop={spacing.sm}
          >
            <Ionicons name="chevron-back" size={24} color={colors.textDark} />
          </Pressable>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Withdraw Funds</Text>
            <Text style={styles.headerSubtitle}>{vault.name}</Text>
          </View>

          {/* Security badge — reinforces trust */}
          <View style={styles.securityBadge}>
            <Ionicons name="shield-checkmark" size={18} color={colors.primary} />
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* ─── 1. Withdrawal Summary Card ────────────────────── */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryTopRow}>
              <View style={styles.vaultIconRing}>
                <Ionicons
                  name="lock-closed"
                  size={22}
                  color={colors.primary}
                />
              </View>
              <View style={styles.summaryTextBlock}>
                <Text style={styles.summaryVaultName}>{vault.name}</Text>
                <Text style={styles.summarySubLabel}>Savings Vault</Text>
              </View>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryGrid}>
              <SummaryItem
                label="Vault Balance"
                value={ghs(vault.currentBalance)}
                valueSize="large"
              />
              <SummaryItem
                label="Maturity Date"
                value={formattedMaturity}
              />
              <SummaryItem
                label="Days Remaining"
                value={daysRemaining <= 0 ? 'Matured' : `${daysRemaining} days`}
                valueColor={daysRemaining <= 0 ? colors.success : undefined}
              />
            </View>
          </View>

          {/* ─── 2. Withdrawal Status Banner ───────────────────── */}
          {isEarly ? (
            <EarlyWithdrawalBanner daysRemaining={daysRemaining} />
          ) : (
            <MaturedBanner />
          )}

          {/* ─── 3. Fee Breakdown ──────────────────────────────── */}
          <SectionLabel title="Fee Breakdown" icon="calculator-outline" />
          <View style={styles.feeCard}>
            <FeeRow
              label="Vault Balance"
              value={ghs(fees.balance)}
              isHeader
            />

            <View style={styles.feeCardDivider} />

            <FeeRow
              label="Withdrawal Type"
              value={isEarly ? 'Early Withdrawal' : 'On-Time Withdrawal'}
              valueColor={isEarly ? colors.warning : colors.success}
            />

            <FeeRow
              label="Fee Rate"
              value={pct(fees.feeRate)}
              icon={isEarly ? 'alert-circle' : 'checkmark-circle'}
              iconColor={isEarly ? colors.warning : colors.success}
            />

            <FeeRow
              label="Fee Amount"
              value={`− ${ghs(fees.feeAmount)}`}
              valueColor={colors.error}
            />

            <View style={styles.feeCardDivider} />

            {/* Net amount — the key number */}
            <View style={styles.netAmountRow}>
              <View>
                <Text style={styles.netLabel}>You Will Receive</Text>
                <Text style={styles.netSubLabel}>After fee deduction</Text>
              </View>
              <Text style={styles.netAmount}>{ghs(fees.netAmount)}</Text>
            </View>
          </View>

          {/* ─── 4. Warning Section (early only) ───────────────── */}
          {isEarly ? (
            <>
              <SectionLabel title="Important Notice" icon="warning-outline" />
              <View style={styles.warningCard}>
                <View style={styles.warningIconRow}>
                  <View style={styles.warningIconRing}>
                    <Ionicons
                      name="warning"
                      size={22}
                      color={colors.warning}
                    />
                  </View>
                  <Text style={styles.warningTitle}>
                    Early Withdrawal Penalty
                  </Text>
                </View>

                <Text style={styles.warningBody}>
                  You are withdrawing before your target date of{' '}
                  <Text style={styles.warningBold}>{formattedMaturity}</Text>.
                  A{' '}
                  <Text style={styles.warningBold}>5% early withdrawal fee</Text>{' '}
                  will be applied to your balance.
                </Text>

                <View style={styles.warningTipRow}>
                  <Ionicons
                    name="bulb-outline"
                    size={15}
                    color={colors.warning}
                  />
                  <Text style={styles.warningTip}>
                    Waiting {daysRemaining} more{' '}
                    {daysRemaining === 1 ? 'day' : 'days'} reduces your fee
                    from 5% to 2%, saving you{' '}
                    <Text style={styles.warningBold}>
                      {ghs(fees.feeAmount - fees.balance * 0.02)}
                    </Text>
                    .
                  </Text>
                </View>
              </View>
            </>
          ) : null}

          {/* ─── 5. Confirmation Checkbox ──────────────────────── */}
          <SectionLabel
            title="Confirmation"
            icon="checkmark-done-circle-outline"
          />
          <Pressable
            onPress={toggleConfirm}
            style={({ pressed }) => [
              styles.checkboxCard,
              isConfirmed && styles.checkboxCardChecked,
              pressed && styles.checkboxCardPressed,
            ]}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isConfirmed }}
          >
            <View
              style={[
                styles.checkbox,
                isConfirmed && styles.checkboxChecked,
              ]}
            >
              {isConfirmed ? (
                <Ionicons name="checkmark" size={14} color={colors.white} />
              ) : null}
            </View>

            <View style={styles.checkboxTextBlock}>
              <Text style={styles.checkboxLabel}>
                I understand the withdrawal fee
              </Text>
              <Text style={styles.checkboxSub}>
                {isEarly
                  ? `A 5% fee (${ghs(fees.feeAmount)}) will be deducted from my balance`
                  : `A 2% fee (${ghs(fees.feeAmount)}) will be deducted from my balance`}
              </Text>
            </View>
          </Pressable>

          {/* Amount preview that appears once confirmed */}
          {isConfirmed ? (
            <View style={styles.confirmedPreview}>
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={colors.success}
              />
              <Text style={styles.confirmedPreviewText}>
                You will receive{' '}
                <Text style={styles.confirmedPreviewAmount}>
                  {ghs(fees.netAmount)}
                </Text>
              </Text>
            </View>
          ) : null}

          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* ─── Sticky Footer ─────────────────────────────────────── */}
        <View style={styles.stickyFooter}>
          <AppButton
            title={isLoading ? 'Processing…' : 'Confirm Withdrawal'}
            icon={isConfirmed ? 'checkmark-circle-outline' : 'lock-closed-outline'}
            onPress={() => {
              void handleConfirm();
            }}
            loading={isLoading}
            disabled={!isConfirmed}
          />

          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [
              styles.cancelBtn,
              pressed && styles.cancelBtnPressed,
            ]}
          >
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </ScreenWrapper>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MaturedBanner() {
  const bannerStyles = useThemedStyles(createBannerStyles);
  const { colors } = useTheme();
  return (
    <LinearGradient
      colors={[colors.primaryDark, colors.primary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={bannerStyles.base}
    >
      <View style={bannerStyles.glow} />
      <View style={bannerStyles.iconRing}>
        <Ionicons name="checkmark-circle" size={28} color={colors.white} />
      </View>
      <View style={bannerStyles.textBlock}>
        <Text style={bannerStyles.title}>Vault Matured</Text>
        <Text style={bannerStyles.body}>
          Your vault has reached its target date. Withdraw at the standard 2%
          fee — the lowest available rate.
        </Text>
      </View>
    </LinearGradient>
  );
}

function EarlyWithdrawalBanner({ daysRemaining }: { daysRemaining: number }) {
  const bannerStyles = useThemedStyles(createBannerStyles);
  const { colors } = useTheme();
  return (
    <View style={bannerStyles.earlyBase}>
      <View style={bannerStyles.earlyAccent} />
      <View style={bannerStyles.earlyIconRing}>
        <Ionicons name="time" size={24} color={colors.warning} />
      </View>
      <View style={bannerStyles.textBlock}>
        <Text style={bannerStyles.earlyTitle}>Early Withdrawal</Text>
        <Text style={bannerStyles.earlyBody}>
          Your vault matures in{' '}
          <Text style={bannerStyles.earlyBold}>{daysRemaining}</Text>{' '}
          {daysRemaining === 1 ? 'day' : 'days'}. Withdrawing now applies a
          higher 5% fee.
        </Text>
      </View>
    </View>
  );
}

const createBannerStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: radius.card,
    flexDirection: 'row',
    marginBottom: spacing.xs,
    overflow: 'hidden',
    padding: spacing.md,
    ...shadowSm,
  },
  glow: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: radius.full,
    height: 80,
    position: 'absolute',
    right: -16,
    top: -16,
    width: 80,
  },
  iconRing: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: radius.full,
    height: 48,
    justifyContent: 'center',
    marginRight: spacing.md,
    width: 48,
  },
  textBlock: {
    flex: 1,
  },
  title: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
  },
  body: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  earlyBase: {
    alignItems: 'center',
    backgroundColor: colors.warningLight,
    borderColor: `${colors.warning}40`,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    marginBottom: spacing.xs,
    overflow: 'hidden',
    padding: spacing.md,
  },
  earlyAccent: {
    backgroundColor: colors.warning,
    bottom: 0,
    left: 0,
    position: 'absolute',
    top: 0,
    width: 4,
  },
  earlyIconRing: {
    alignItems: 'center',
    backgroundColor: `${colors.warning}22`,
    borderRadius: radius.full,
    height: 48,
    justifyContent: 'center',
    marginRight: spacing.md,
    width: 48,
  },
  earlyTitle: {
    color: colors.warning,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
  },
  earlyBody: {
    color: colors.textDark,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  earlyBold: {
    color: colors.warning,
    fontWeight: fontWeight.bold,
  },
});

// ─────────────────────────────────────────────────────────────────────────────

function SectionLabel({
  title,
  icon,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  const labelStyles = useThemedStyles(createLabelStyles);
  const { colors } = useTheme();
  return (
    <View style={labelStyles.row}>
      <Ionicons name={icon} size={14} color={colors.primary} />
      <Text style={labelStyles.text}>{title}</Text>
    </View>
  );
}

const createLabelStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  text: {
    color: colors.textDark,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.5,
    marginLeft: spacing.xs,
    textTransform: 'uppercase',
  },
});

// ─────────────────────────────────────────────────────────────────────────────

function SummaryItem({
  label,
  value,
  valueSize = 'normal',
  valueColor,
}: {
  label: string;
  value: string;
  valueSize?: 'normal' | 'large';
  valueColor?: string;
}) {
  const summaryItemStyles = useThemedStyles(createSummaryItemStyles);
  return (
    <View style={summaryItemStyles.container}>
      <Text style={summaryItemStyles.label}>{label}</Text>
      <Text
        style={[
          valueSize === 'large'
            ? summaryItemStyles.valueLarge
            : summaryItemStyles.value,
          valueColor ? { color: valueColor } : null,
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </Text>
    </View>
  );
}

const createSummaryItemStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  container: {
    flex: 1,
  },
  label: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.xs,
  },
  value: {
    color: colors.textDark,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  valueLarge: {
    color: colors.textDark,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
});

// ─────────────────────────────────────────────────────────────────────────────

function FeeRow({
  label,
  value,
  isHeader = false,
  valueColor,
  icon,
  iconColor,
}: {
  label: string;
  value: string;
  isHeader?: boolean;
  valueColor?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
}) {
  const feeRowStyles = useThemedStyles(createFeeRowStyles);
  return (
    <View style={feeRowStyles.row}>
      <Text
        style={[
          feeRowStyles.label,
          isHeader && feeRowStyles.labelBold,
        ]}
      >
        {label}
      </Text>
      <View style={feeRowStyles.valueRow}>
        {icon && iconColor ? (
          <Ionicons
            name={icon}
            size={14}
            color={iconColor}
            style={feeRowStyles.icon}
          />
        ) : null}
        <Text
          style={[
            feeRowStyles.value,
            isHeader && feeRowStyles.valueBold,
            valueColor ? { color: valueColor } : null,
          ]}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

const createFeeRowStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  label: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  labelBold: {
    color: colors.textDark,
    fontWeight: fontWeight.semibold,
  },
  valueRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  icon: {
    marginRight: spacing.xs,
  },
  value: {
    color: colors.textDark,
    fontSize: fontSize.sm,
    textAlign: 'right',
  },
  valueBold: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
});

// ─── Screen styles ────────────────────────────────────────────────────────────
const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderBottomColor: colors.borderSubtle,
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  backBtn: {
    alignItems: 'center',
    borderRadius: radius.full,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  backBtnPressed: {
    backgroundColor: colors.chipBg,
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    color: colors.textDark,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  headerSubtitle: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  securityBadge: {
    alignItems: 'center',
    backgroundColor: colors.primaryBackground,
    borderRadius: radius.full,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  summaryCard: {
    backgroundColor: colors.cardBackground,
    borderColor: colors.cardBorder,
    borderRadius: radius.card,
    borderWidth: 1,
    marginBottom: spacing.md,
    padding: spacing.md,
    ...shadowMd,
  },
  summaryTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  vaultIconRing: {
    alignItems: 'center',
    backgroundColor: colors.primaryBackground,
    borderRadius: radius.full,
    height: 48,
    justifyContent: 'center',
    marginRight: spacing.md,
    width: 48,
  },
  summaryTextBlock: {
    flex: 1,
  },
  summaryVaultName: {
    color: colors.textDark,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  summarySubLabel: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  summaryDivider: {
    backgroundColor: colors.divider,
    height: 1,
    marginBottom: spacing.md,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  feeCard: {
    backgroundColor: colors.cardBackground,
    borderColor: colors.cardBorder,
    borderRadius: radius.card,
    borderWidth: 1,
    padding: spacing.md,
    ...shadowSm,
  },
  feeCardDivider: {
    backgroundColor: colors.divider,
    height: 1,
    marginVertical: spacing.xs,
  },
  netAmountRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
  },
  netLabel: {
    color: colors.textDark,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
  },
  netSubLabel: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
  netAmount: {
    color: colors.primary,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
  },
  warningCard: {
    backgroundColor: colors.warningLight,
    borderColor: `${colors.warning}44`,
    borderRadius: radius.card,
    borderWidth: 1,
    padding: spacing.md,
  },
  warningIconRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  warningIconRing: {
    alignItems: 'center',
    backgroundColor: `${colors.warning}22`,
    borderRadius: radius.full,
    height: 38,
    justifyContent: 'center',
    marginRight: spacing.sm,
    width: 38,
  },
  warningTitle: {
    color: colors.warning,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  warningBody: {
    color: colors.textDark,
    fontSize: fontSize.sm,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  warningBold: {
    color: colors.textDark,
    fontWeight: fontWeight.bold,
  },
  warningTipRow: {
    alignItems: 'flex-start',
    backgroundColor: `${colors.warning}14`,
    borderRadius: radius.md,
    flexDirection: 'row',
    padding: spacing.sm,
  },
  warningTip: {
    color: colors.textGrey,
    flex: 1,
    fontSize: fontSize.xs,
    lineHeight: 18,
    marginLeft: spacing.sm,
  },
  checkboxCard: {
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderColor: colors.borderSubtle,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    padding: spacing.md,
    ...shadowSm,
  },
  checkboxCardChecked: {
    backgroundColor: colors.primaryBackground,
    borderColor: colors.primary,
  },
  checkboxCardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.995 }],
  },
  checkbox: {
    alignItems: 'center',
    borderColor: colors.borderSubtle,
    borderRadius: radius.sm,
    borderWidth: 2,
    height: 24,
    justifyContent: 'center',
    marginRight: spacing.md,
    width: 24,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxTextBlock: {
    flex: 1,
  },
  checkboxLabel: {
    color: colors.textDark,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  checkboxSub: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    lineHeight: 18,
  },
  confirmedPreview: {
    alignItems: 'center',
    backgroundColor: colors.successLight,
    borderRadius: radius.md,
    flexDirection: 'row',
    marginTop: spacing.sm,
    padding: spacing.md,
  },
  confirmedPreviewText: {
    color: colors.textDark,
    fontSize: fontSize.sm,
    marginLeft: spacing.sm,
  },
  confirmedPreviewAmount: {
    color: colors.success,
    fontWeight: fontWeight.bold,
  },
  bottomSpacer: {
    height: spacing.xl,
  },
  stickyFooter: {
    backgroundColor: colors.cardBackground,
    borderTopColor: colors.borderSubtle,
    borderTopWidth: 1,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    ...shadowMd,
  },
  cancelBtn: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  cancelBtnPressed: {
    opacity: 0.6,
  },
  cancelBtnText: {
    color: colors.textGrey,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
});
