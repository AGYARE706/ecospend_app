import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import AmountDisplayInput from '../../components/finance/AmountDisplayInput';
import AppButton from '../../components/ui/AppButton';
import AppInput from '../../components/ui/AppInput';
import Card from '../../components/ui/Card';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import {
  DATE_PRESETS,
  formatDisplayDate,
  useCreateVault,
  type DatePreset,
} from '../../hooks/useCreateVault';
import type { AppStackParamList } from '../../navigation/types';
import {
  colors,
  fontSize,
  fontWeight,
  radius,
  shadowMd,
  shadowSm,
  spacing,
} from '../../theme';

// ─── Types ────────────────────────────────────────────────────────────────────
type CreateVaultNavigationProp = StackNavigationProp<
  AppStackParamList,
  'CreateVault'
>;

interface CreateVaultScreenProps {
  navigation: CreateVaultNavigationProp;
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function CreateVaultScreen({
  navigation,
}: CreateVaultScreenProps) {
  const {
    form,
    errors,
    isLoading,
    feePreview,
    parsedTarget,
    parsedDeposit,
    daysRemaining,
    setField,
    selectPreset,
    handleCreate,
  } = useCreateVault(navigation);

  return (
    <ScreenWrapper background="page" keyboardAvoiding padded={false}>
      <View style={styles.screen}>
        {/* ─── Header ────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.backButtonPressed,
            ]}
            hitSlop={spacing.sm}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={colors.textDark}
            />
          </Pressable>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Create Vault</Text>
            <Text style={styles.headerSubtitle}>Secure your savings</Text>
          </View>

          <View style={styles.headerRight}>
            <View style={styles.shieldBadge}>
              <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
            </View>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="always"
        >
          {/* ─── Educational Banner ────────────────────────────────── */}
          <LinearGradient
            colors={[colors.primary, '#0D9488']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.banner}
          >
            <View style={styles.bannerGlow} />
            <View style={styles.bannerContent}>
              <View style={styles.bannerIconRing}>
                <Ionicons name="lock-closed" size={22} color={colors.white} />
              </View>
              <View style={styles.bannerText}>
                <Text style={styles.bannerTitle}>How Vaults Work</Text>
                <Text style={styles.bannerBody}>
                  Lock your savings until a chosen date and stay committed to
                  your goals. Early access incurs a small fee.
                </Text>
              </View>
            </View>
          </LinearGradient>

          {/* ─── Form: Vault Name ──────────────────────────────────── */}
          <SectionLabel title="Vault Details" icon="create-outline" />

          <Card style={styles.formCard}>
            <AppInput
              label="Vault Name"
              value={form.vaultName}
              onChangeText={(v) => setField('vaultName', v)}
              placeholder="e.g. Emergency Fund, School Fees"
              error={errors.vaultName}
            />
          </Card>

          {/* ─── Form: Amounts ─────────────────────────────────────── */}
          <SectionLabel title="Amounts" icon="cash-outline" />

          <Card style={styles.formCard}>
            <Text style={styles.fieldLabel}>Target Amount</Text>
            <AmountDisplayInput
              value={form.targetAmount}
              onChangeText={(v) => setField('targetAmount', v)}
              error={errors.targetAmount}
            />

            <View style={styles.divider} />

            <Text style={styles.fieldLabel}>Initial Deposit</Text>
            <Text style={styles.fieldHint}>
              Optional — how much you're locking in right now
            </Text>
            <AmountDisplayInput
              value={form.initialDeposit}
              onChangeText={(v) => setField('initialDeposit', v)}
              error={errors.initialDeposit}
            />
          </Card>

          {/* ─── Form: Target Date ─────────────────────────────────── */}
          <SectionLabel title="Target Date" icon="calendar-outline" />

          <Card style={styles.formCard}>
            <Text style={styles.fieldLabel}>Lock Duration</Text>
            <View style={styles.presetRow}>
              {DATE_PRESETS.map((preset) => (
                <DatePresetChip
                  key={preset.key}
                  preset={preset}
                  selected={form.selectedPreset === preset.key}
                  onSelect={selectPreset}
                />
              ))}
            </View>

            <View style={styles.dateDisplay}>
              <Ionicons
                name="calendar"
                size={18}
                color={colors.primary}
              />
              <Text style={styles.dateValue}>
                {formatDisplayDate(form.maturityDate)}
              </Text>
              <View style={styles.dateBadge}>
                <Text style={styles.dateBadgeText}>{daysRemaining}d</Text>
              </View>
            </View>
          </Card>

          {/* ─── Fee Preview Card ──────────────────────────────────── */}
          <SectionLabel title="Fee Breakdown" icon="receipt-outline" />

          <Card style={styles.feeCard}>
            <View style={styles.feeHeaderRow}>
              <Text style={styles.feeCardTitle}>Withdrawal Fees</Text>
              <View style={styles.feeLockBadge}>
                <Ionicons name="information-circle-outline" size={14} color={colors.textMuted} />
                <Text style={styles.feeLockLabel}>Transparent pricing</Text>
              </View>
            </View>

            <FeeRow
              icon="checkmark-circle"
              iconColor={colors.success}
              label="On-Time Withdrawal"
              rateLabel="2% fee"
              feeAmount={feePreview.onTimeFee}
              netAmount={feePreview.onTimeWithdrawal}
              locked={feePreview.lockedAmount}
              highlight="success"
            />

            <View style={styles.feeDivider} />

            <FeeRow
              icon="alert-circle"
              iconColor={colors.warning}
              label="Early Withdrawal"
              rateLabel="5% fee"
              feeAmount={feePreview.earlyFee}
              netAmount={feePreview.earlyWithdrawal}
              locked={feePreview.lockedAmount}
              highlight="warning"
            />

            {feePreview.lockedAmount <= 0 ? (
              <Text style={styles.feeHint}>
                Enter an amount above to see your fee calculations.
              </Text>
            ) : null}
          </Card>

          {/* ─── Vault Summary Card ────────────────────────────────── */}
          {(parsedTarget > 0 || form.vaultName.trim().length > 0) ? (
            <>
              <SectionLabel title="Vault Preview" icon="eye-outline" />
              <VaultSummaryPreview
                name={form.vaultName.trim() || 'My Vault'}
                targetAmount={parsedTarget}
                lockedAmount={parsedDeposit > 0 ? parsedDeposit : parsedTarget}
                maturityDate={form.maturityDate}
                daysRemaining={daysRemaining}
                netWithdrawal={feePreview.onTimeWithdrawal}
              />
            </>
          ) : null}

          {/* ─── Bottom spacer for sticky button ─────────────────── */}
          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* ─── Sticky Create Button ──────────────────────────────── */}
        <View style={styles.stickyFooter}>
          <AppButton
            title="Create Vault"
            icon="lock-closed-outline"
            onPress={() => {
              void handleCreate();
            }}
            loading={isLoading}
          />
        </View>
      </View>
    </ScreenWrapper>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({
  title,
  icon,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={labelStyles.row}>
      <Ionicons name={icon} size={15} color={colors.primary} />
      <Text style={labelStyles.text}>{title}</Text>
    </View>
  );
}

const labelStyles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  text: {
    color: colors.textDark,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.4,
    marginLeft: spacing.xs,
    textTransform: 'uppercase',
  },
});

// ─────────────────────────────────────────────────────────────────────────────

function DatePresetChip({
  preset,
  selected,
  onSelect,
}: {
  preset: { key: DatePreset; label: string };
  selected: boolean;
  onSelect: (key: DatePreset) => void;
}) {
  return (
    <Pressable
      onPress={() => onSelect(preset.key)}
      style={({ pressed }) => [
        chipStyles.chip,
        selected && chipStyles.chipSelected,
        pressed && chipStyles.chipPressed,
      ]}
    >
      <Text
        style={[
          chipStyles.label,
          selected && chipStyles.labelSelected,
        ]}
      >
        {preset.label}
      </Text>
    </Pressable>
  );
}

const chipStyles = StyleSheet.create({
  chip: {
    backgroundColor: colors.chipBg,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.borderSubtle,
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  chipSelected: {
    backgroundColor: colors.primaryBackground,
    borderColor: colors.primary,
  },
  chipPressed: {
    opacity: 0.8,
  },
  label: {
    color: colors.textGrey,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  labelSelected: {
    color: colors.primary,
  },
});

// ─────────────────────────────────────────────────────────────────────────────

function formatGhs(amount: number): string {
  return `GH₵ ${new Intl.NumberFormat('en-GH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)}`;
}

function FeeRow({
  icon,
  iconColor,
  label,
  rateLabel,
  feeAmount,
  netAmount,
  locked,
  highlight,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  label: string;
  rateLabel: string;
  feeAmount: number;
  netAmount: number;
  locked: number;
  highlight: 'success' | 'warning';
}) {
  const bgColor =
    highlight === 'success' ? colors.successLight : colors.warningLight;
  const textColor =
    highlight === 'success' ? colors.success : colors.warning;

  return (
    <View style={feeRowStyles.row}>
      <View style={feeRowStyles.left}>
        <Ionicons name={icon} size={18} color={iconColor} />
        <View style={feeRowStyles.info}>
          <Text style={feeRowStyles.label}>{label}</Text>
          <View style={[feeRowStyles.badge, { backgroundColor: bgColor }]}>
            <Text style={[feeRowStyles.badgeText, { color: textColor }]}>
              {rateLabel}
            </Text>
          </View>
        </View>
      </View>

      <View style={feeRowStyles.right}>
        {locked > 0 ? (
          <>
            <Text style={feeRowStyles.fee}>- {formatGhs(feeAmount)}</Text>
            <Text style={feeRowStyles.net}>{formatGhs(netAmount)}</Text>
          </>
        ) : (
          <Text style={feeRowStyles.empty}>—</Text>
        )}
      </View>
    </View>
  );
}

const feeRowStyles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  left: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
  },
  info: {
    marginLeft: spacing.sm,
  },
  label: {
    color: colors.textDark,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  right: {
    alignItems: 'flex-end',
  },
  fee: {
    color: colors.error,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.xs,
  },
  net: {
    color: colors.textDark,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  empty: {
    color: colors.textLight,
    fontSize: fontSize.md,
  },
});

// ─────────────────────────────────────────────────────────────────────────────

function VaultSummaryPreview({
  name,
  targetAmount,
  lockedAmount,
  maturityDate,
  daysRemaining,
  netWithdrawal,
}: {
  name: string;
  targetAmount: number;
  lockedAmount: number;
  maturityDate: Date;
  daysRemaining: number;
  netWithdrawal: number;
}) {
  const progress =
    targetAmount > 0
      ? Math.min(100, Math.round((lockedAmount / targetAmount) * 100))
      : 0;

  return (
    <LinearGradient
      colors={[colors.primaryDark, colors.primary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={summaryStyles.card}
    >
      <View style={summaryStyles.glowOrb} />

      <View style={summaryStyles.topRow}>
        <View style={summaryStyles.iconRing}>
          <Ionicons name="lock-closed" size={16} color={colors.white} />
        </View>
        <Text style={summaryStyles.previewBadge}>Live Preview</Text>
      </View>

      <Text style={summaryStyles.vaultName} numberOfLines={1}>{name}</Text>

      <View style={summaryStyles.amountRow}>
        <View>
          <Text style={summaryStyles.amountLabel}>Amount Locked</Text>
          <Text style={summaryStyles.amountValue}>{formatGhs(lockedAmount)}</Text>
        </View>
        {targetAmount > 0 && (
          <View style={summaryStyles.targetBlock}>
            <Text style={summaryStyles.amountLabel}>Target</Text>
            <Text style={summaryStyles.targetValue}>{formatGhs(targetAmount)}</Text>
          </View>
        )}
      </View>

      {/* Progress bar */}
      <View style={summaryStyles.progressTrack}>
        <View
          style={[summaryStyles.progressFill, { width: `${progress}%` }]}
        />
      </View>

      <View style={summaryStyles.divider} />

      <View style={summaryStyles.metaGrid}>
        <MetaItem
          icon="calendar-outline"
          label="Matures"
          value={formatDisplayDate(maturityDate)}
        />
        <MetaItem
          icon="time-outline"
          label="Days Left"
          value={`${daysRemaining} days`}
        />
        <MetaItem
          icon="cash-outline"
          label="You'll Receive"
          value={formatGhs(netWithdrawal)}
        />
      </View>
    </LinearGradient>
  );
}

function MetaItem({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={metaItemStyles.container}>
      <Ionicons name={icon} size={13} color="rgba(255,255,255,0.7)" />
      <Text style={metaItemStyles.label}>{label}</Text>
      <Text style={metaItemStyles.value} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const metaItemStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  label: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  value: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    textAlign: 'center',
  },
});

const summaryStyles = StyleSheet.create({
  card: {
    borderRadius: radius.heroCard,
    overflow: 'hidden',
    padding: spacing.lg,
    ...shadowMd,
  },
  glowOrb: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: radius.full,
    height: 100,
    position: 'absolute',
    right: -20,
    top: -20,
    width: 100,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  iconRing: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: radius.full,
    height: 28,
    justifyContent: 'center',
    marginRight: spacing.sm,
    width: 28,
  },
  previewBadge: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: radius.full,
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  vaultName: {
    color: colors.white,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.md,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  amountLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: fontSize.xs,
    marginBottom: spacing.xs,
  },
  amountValue: {
    color: colors.white,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  targetBlock: {
    alignItems: 'flex-end',
  },
  targetValue: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  progressTrack: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radius.full,
    height: 6,
    marginBottom: spacing.md,
    overflow: 'hidden',
    width: '100%',
  },
  progressFill: {
    backgroundColor: colors.white,
    borderRadius: radius.full,
    height: 6,
  },
  divider: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    height: 1,
    marginBottom: spacing.md,
  },
  metaGrid: {
    flexDirection: 'row',
  },
});

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderBottomColor: colors.borderSubtle,
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  backButton: {
    alignItems: 'center',
    borderRadius: radius.full,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  backButtonPressed: {
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
  headerRight: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  shieldBadge: {
    alignItems: 'center',
    backgroundColor: colors.primaryBackground,
    borderRadius: radius.full,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  banner: {
    borderRadius: radius.card,
    marginBottom: spacing.xs,
    overflow: 'hidden',
    ...shadowSm,
  },
  bannerGlow: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: radius.full,
    height: 80,
    position: 'absolute',
    right: -16,
    top: -16,
    width: 80,
  },
  bannerContent: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    padding: spacing.md,
  },
  bannerIconRing: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: radius.full,
    height: 44,
    justifyContent: 'center',
    marginRight: spacing.md,
    width: 44,
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
  },
  bannerBody: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  formCard: {
    marginBottom: spacing.xs,
  },
  fieldLabel: {
    color: colors.textDark,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
  },
  fieldHint: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginBottom: spacing.sm,
    marginTop: -spacing.xs,
  },
  divider: {
    backgroundColor: colors.divider,
    height: 1,
    marginVertical: spacing.md,
  },
  presetRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  dateDisplay: {
    alignItems: 'center',
    backgroundColor: colors.primaryBackground,
    borderColor: colors.primary,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  dateValue: {
    color: colors.primary,
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    marginLeft: spacing.sm,
  },
  dateBadge: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  dateBadgeText: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  feeCard: {
    marginBottom: spacing.xs,
  },
  feeHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  feeCardTitle: {
    color: colors.textDark,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  feeLockBadge: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  feeLockLabel: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginLeft: spacing.xs,
  },
  feeDivider: {
    backgroundColor: colors.divider,
    height: 1,
    marginVertical: spacing.xs,
  },
  feeHint: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontStyle: 'italic',
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  bottomSpacer: {
    height: spacing.xl,
  },
  stickyFooter: {
    backgroundColor: colors.white,
    borderTopColor: colors.borderSubtle,
    borderTopWidth: 1,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    ...shadowMd,
  },
});
