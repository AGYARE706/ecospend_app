import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import AppButton from '../../components/ui/AppButton';
import IconButton from '../../components/ui/IconButton';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import { Icon } from '../../components/ui/icons';
import type { IconName } from '../../components/ui/icons';
import { useVaultDetails } from '../../hooks/useVaultDetails';
import { navigateApp } from '../../navigation/navigationRef';
import type { VaultStackParamList } from '../../navigation/types';
import {
  fontSize,
  fontWeight,
  radius,
  shadowMd,
  shadowSm,
  spacing,
  typography,
  useTheme,
  useThemedStyles,
} from '../../theme';
import type { ThemeColors } from '../../theme';
import type { VaultContribution, VaultStatus } from '../../types/vault';
import { formatVaultDate } from '../../utils/vault';

// ─── Navigation types ─────────────────────────────────────────────────────────
type VaultDetailsRouteProp = RouteProp<VaultStackParamList, 'VaultDetails'>;
type VaultDetailsNavProp = StackNavigationProp<VaultStackParamList, 'VaultDetails'>;

interface VaultDetailsScreenProps {
  route: VaultDetailsRouteProp;
  navigation: VaultDetailsNavProp;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function ghs(amount: number, decimals = 2): string {
  return `GH₵ ${new Intl.NumberFormat('en-GH', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount)}`;
}

function statusMeta(
  status: VaultStatus,
  colors: ThemeColors,
): { label: string, color: string, bg: string } {
  switch (status) {
    case 'active':
      return { label: 'Active', color: colors.success, bg: colors.successLight };
    case 'locked':
      return { label: 'Locked', color: colors.warning, bg: colors.warningLight };
    case 'matured':
      return { label: 'Matured', color: colors.blue, bg: colors.blueLight };
    case 'pending':
      return { label: 'Pending', color: colors.textGrey, bg: colors.chipBg };
  }

  return { label: 'Pending', color: colors.textGrey, bg: colors.chipBg };
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function VaultDetailsScreen({
  route,
  navigation,
}: VaultDetailsScreenProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { vaultId } = route.params;
  const {
    vault,
    progress,
    daysRemaining,
    fees,
    stats,
    formattedMaturity,
    formattedCreated,
    isMatured,
    isOnTrack,
  } = useVaultDetails(vaultId);

  const badge = statusMeta(vault.status, colors);
  const accentGradient: [string, string] = [
    `${vault.accentColor}DD`,
    vault.accentColor,
  ];
  const isTargetReached = vault.targetAmount > 0 && stats.remainingAmount <= 0;
  const canAddFunds = !isTargetReached;

  function handleWithdraw() {
    navigateApp('WithdrawVault', { vaultId: vault.id });
  }

  function handleAddFunds() {
    navigateApp('AddMoney', { vaultId: vault.id });
  }

  return (
    <ScreenWrapper background="page" padded={false} edges={['top']}>
      <View style={styles.screen}>
        {/* ─── Header ──────────────────────────────────────────────── */}
        <View style={styles.topBar}>
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
          <Text style={styles.topBarTitle} numberOfLines={1}>
            {vault.name}
          </Text>
          <View style={[styles.statusPill, { backgroundColor: badge.bg }]}>
            <Text style={[styles.statusText, { color: badge.color }]}>
              {badge.label}
            </Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* ─── 1. Vault Hero Card ──────────────────────────────── */}
          <LinearGradient
            colors={[colors.primaryDark, vault.accentColor]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >

            <View style={styles.heroTop}>
              <View style={styles.heroBalanceBlock}>
                <Text style={styles.heroLabel}>Current Balance</Text>
                <Text style={styles.heroBalance} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>{ghs(vault.currentBalance)}</Text>
                <Text style={styles.heroTarget} numberOfLines={1}>
                  of {ghs(vault.targetAmount)} target
                </Text>
              </View>

              {/* ─── Circular progress ring ─── */}
              <ProgressRing
                percentage={progress}
                size={96}
                strokeWidth={10}
                color={colors.white}
                trackColor="rgba(255,255,255,0.22)"
              />
            </View>

            {/* ─── Progress bar ─────────────────────────────────── */}
            <View style={styles.heroProgressSection}>
              <View style={styles.heroProgressRow}>
                <Text style={styles.heroProgressLabel}>Progress</Text>
                <Text style={styles.heroProgressPct}>{progress}%</Text>
              </View>
              <View style={styles.heroProgressTrack}>
                <View
                  style={[
                    styles.heroProgressFill,
                    { width: `${progress}%` },
                  ]}
                />
              </View>
              <View style={styles.heroProgressMeta}>
                <Text style={styles.heroMetaText} numberOfLines={1}>
                  {ghs(vault.currentBalance)} saved
                </Text>
                <Text style={[styles.heroMetaText, styles.heroMetaTextRight]} numberOfLines={1}>
                  {ghs(stats.remainingAmount)} left
                </Text>
              </View>
            </View>

            {/* on-track badge */}
            {!isMatured ? (
              <View style={styles.trackBadge}>
                <Ionicons
                  name={isOnTrack ? 'trending-up' : 'trending-down'}
                  size={13}
                  color={isOnTrack ? colors.successLight : colors.warningLight}
                />
                <Text
                  style={[
                    styles.trackBadgeText,
                    { color: isOnTrack ? colors.successLight : colors.warningLight },
                  ]}
                >
                  {isOnTrack ? 'On track' : 'Behind schedule'}
                </Text>
              </View>
            ) : null}
          </LinearGradient>

          {/* ─── 2. Countdown Section ──────────────────────────── */}
          <SectionHeader title="Countdown" icon="hourglass-outline" />
          <View style={styles.countdownCard}>
            <LinearGradient
              colors={
                isMatured
                  ? ([colors.blue, colors.heroBlueMid] as [string, string])
                  : ([colors.primaryDark, colors.primary] as [string, string])
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.countdownGradient}
            >
              <View style={styles.countdownLeft}>
                <Ionicons
                  name="calendar-outline"
                  size={22}
                  color="rgba(255,255,255,0.8)"
                />
                <Text style={styles.countdownDateLabel}>Target Date</Text>
                <Text style={styles.countdownDateValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>{formattedMaturity}</Text>
              </View>

              <View style={styles.countdownDivider} />

              <View style={styles.countdownRight}>
                <Text style={styles.countdownDays}>
                  {isMatured ? '✓' : daysRemaining}
                </Text>
                <Text style={styles.countdownDaysLabel}>
                  {isMatured ? 'Matured' : 'days remaining'}
                </Text>
                {!isMatured && daysRemaining <= 30 && daysRemaining > 0 ? (
                  <View style={styles.urgentBadge}>
                    <Text style={styles.urgentText}>Matures soon</Text>
                  </View>
                ) : null}
              </View>
            </LinearGradient>
          </View>

          {/* ─── 3. Fee Information Card ───────────────────────── */}
          <SectionHeader title="Withdrawal Fees" icon="receipt-outline" />
          <View style={styles.card}>
            <Text style={styles.feeIntroText}>
              Based on your current balance of {ghs(vault.currentBalance)}
            </Text>

            <View style={styles.feeGrid}>
              <FeeBox
                icon={fees.onTimeIsShortfall ? 'alert-circle' : 'checkmark-circle'}
                iconColor={fees.onTimeIsShortfall ? colors.warning : colors.success}
                label={fees.onTimeIsShortfall ? 'On-Time, Under Target' : 'On-Time Withdrawal'}
                rateLabel={`${Math.round(fees.onTimeRate * 100)}% fee`}
                fee={fees.onTimeFeeGhs}
                net={fees.onTimeNetGhs}
                bgColor={fees.onTimeIsShortfall ? colors.warningLight : colors.successLight}
                textColor={fees.onTimeIsShortfall ? colors.warning : colors.success}
              />
              <View style={styles.feeGridSpacer} />
              <FeeBox
                icon="alert-circle"
                iconColor={colors.warning}
                label="Early Withdrawal"
                rateLabel="5% fee"
                fee={fees.earlyFeeGhs}
                net={fees.earlyNetGhs}
                bgColor={colors.warningLight}
                textColor={colors.warning}
              />
            </View>
          </View>

          {/* ─── 4. Vault Statistics ───────────────────────────── */}
          <SectionHeader title="Statistics" icon="bar-chart-outline" />
          <View style={styles.statsGrid}>
            <StatCard
              icon="wallet-outline"
              iconColor={colors.primary}
              label="Amount Saved"
              value={ghs(stats.amountSaved)}
              accent={colors.successLight}
            />
            <StatCard
              icon="trending-up-outline"
              iconColor={colors.blue}
              label="Remaining"
              value={ghs(stats.remainingAmount)}
              accent={colors.blueLight}
            />
            <StatCard
              icon="today-outline"
              iconColor={colors.warning}
              label="Daily Needed"
              value={stats.dailySavingsNeeded > 0 ? ghs(stats.dailySavingsNeeded, 0) : '—'}
              accent={colors.warningLight}
              subLabel={stats.dailySavingsNeeded > 0 ? 'per day' : 'Target met'}
            />
            <StatCard
              icon="pie-chart-outline"
              iconColor={`${vault.accentColor}`}
              label="Completion"
              value={`${progress}%`}
              accent={`${vault.accentColor}18`}
            />
          </View>

          {/* ─── 5. Timeline Section ───────────────────────────── */}
          <SectionHeader title="Timeline" icon="git-branch-outline" />
          <View style={styles.card}>
            <TimelineItem
              icon="flag-outline"
              iconColor={colors.primary}
              label="Vault Created"
              date={formattedCreated}
              isFirst
            />

            {vault.contributions.map((contribution, index) => (
              <TimelineItem
                key={contribution.id}
                icon="add-circle-outline"
                iconColor={colors.blue}
                label={
                  contribution.note ??
                  `Contribution ${index + 1}`
                }
                date={formatVaultDate(contribution.date)}
                amount={contribution.amount}
              />
            ))}

            <TimelineItem
              icon={isMatured ? 'checkmark-circle' : 'lock-closed-outline'}
              iconColor={isMatured ? colors.success : colors.warning}
              label={isMatured ? 'Matured' : 'Matures on'}
              date={formattedMaturity}
              isLast
              highlight={isMatured}
            />
          </View>

          {/* ─── 6. Action Buttons ─────────────────────────────── */}
          <SectionHeader title="Actions" icon="flash-outline" />
          {isTargetReached ? (
            <View style={styles.targetReachedBanner}>
              <Ionicons name="trophy-outline" size={16} color={colors.success} />
              <Text style={styles.targetReachedText}>
                Target reached — locked from further deposits until {formattedMaturity}.
              </Text>
            </View>
          ) : null}
          <View style={styles.actionsRow}>
            {canAddFunds ? (
              <>
                <View style={styles.actionButton}>
                  <AppButton
                    title="Add Funds"
                    variant="outline"
                    icon="add-circle-outline"
                    onPress={handleAddFunds}
                  />
                </View>
                <View style={styles.actionSpacer} />
              </>
            ) : null}
            <View style={styles.actionButton}>
              <AppButton
                title="Withdraw"
                icon="cash-outline"
                onPress={handleWithdraw}
              />
            </View>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
}

// ─── ProgressRing ─────────────────────────────────────────────────────────────
// Two-half clipping approach: right half sweeps 0→180°, left half sweeps 180→360°
function ProgressRing({
  percentage,
  size,
  strokeWidth,
  color,
  trackColor,
}: {
  percentage: number;
  size: number;
  strokeWidth: number;
  color: string;
  trackColor: string;
}) {
  const pct = Math.min(100, Math.max(0, percentage));
  const half = size / 2;

  // Right half rotates from -180° (hidden) to 0° (full right half visible)
  const rightRot = pct <= 50 ? (pct / 50) * 180 - 180 : 0;
  // Left half rotates from -180° (hidden) to 0° (full left half visible)
  const leftRot = pct > 50 ? ((pct - 50) / 50) * 180 - 180 : -180;

  const ringStyle = {
    width: size,
    height: size,
    borderRadius: half,
    borderWidth: strokeWidth,
    position: 'absolute' as const,
  };

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Track */}
      <View style={[ringStyle, { borderColor: trackColor }]} />

      {/* Right clip: reveals 0→180° */}
      <View
        style={{
          position: 'absolute',
          width: half,
          height: size,
          right: 0,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            position: 'absolute',
            right: 0,
            width: size,
            height: size,
            transform: [{ rotate: `${rightRot}deg` }],
          }}
        >
          <View
            style={[
              ringStyle,
              {
                borderTopColor: color,
                borderRightColor: color,
                borderBottomColor: color,
                borderLeftColor: 'transparent',
              },
            ]}
          />
        </View>
      </View>

      {/* Left clip: reveals 180→360° */}
      <View
        style={{
          position: 'absolute',
          width: half,
          height: size,
          left: 0,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            position: 'absolute',
            left: 0,
            width: size,
            height: size,
            transform: [{ rotate: `${leftRot}deg` }],
          }}
        >
          <View
            style={[
              ringStyle,
              {
                borderTopColor: color,
                borderLeftColor: color,
                borderBottomColor: color,
                borderRightColor: 'transparent',
              },
            ]}
          />
        </View>
      </View>

      {/* Center label */}
      <Text
        style={{
          color,
          fontSize: fontSize.sm,
          fontWeight: fontWeight.bold,
          textAlign: 'center',
        }}
      >
        {pct}%
      </Text>
    </View>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({
  title,
  icon,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  const secStyles = useThemedStyles(createSecStyles);
  const { colors } = useTheme();
  return (
    <View style={secStyles.row}>
      <Ionicons name={icon} size={15} color={colors.primary} />
      <Text style={secStyles.title}>{title}</Text>
    </View>
  );
}

const createSecStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  title: {
    color: colors.textDark,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.5,
    marginLeft: spacing.xs,
    textTransform: 'uppercase',
  },
});

// ─────────────────────────────────────────────────────────────────────────────

function FeeBox({
  icon,
  iconColor,
  label,
  rateLabel,
  fee,
  net,
  bgColor,
  textColor,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  label: string;
  rateLabel: string;
  fee: number;
  net: number;
  bgColor: string;
  textColor: string;
}) {
  const feeBoxStyles = useThemedStyles(createFeeBoxStyles);
  const { colors } = useTheme();
  return (
    <View style={[feeBoxStyles.box, { borderColor: bgColor }]}>
      <View style={feeBoxStyles.top}>
        <View style={[feeBoxStyles.iconRing, { backgroundColor: bgColor }]}>
          <Ionicons name={icon} size={16} color={iconColor} />
        </View>
        <View style={[feeBoxStyles.ratePill, { backgroundColor: bgColor }]}>
          <Text style={[feeBoxStyles.rateText, { color: textColor }]}>
            {rateLabel}
          </Text>
        </View>
      </View>
      <Text style={feeBoxStyles.label}>{label}</Text>
      <View style={feeBoxStyles.divider} />
      <Text style={feeBoxStyles.feeLabel}>Fee deducted</Text>
      <Text style={[feeBoxStyles.feeAmount, { color: colors.error }]}>
        - {ghs(fee)}
      </Text>
      <Text style={feeBoxStyles.netLabel}>You receive</Text>
      <Text style={feeBoxStyles.netAmount}>{ghs(net)}</Text>
    </View>
  );
}

const createFeeBoxStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  box: {
    backgroundColor: colors.cardBackground,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flex: 1,
    padding: spacing.md,
    ...shadowSm,
  },
  top: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  iconRing: {
    alignItems: 'center',
    borderRadius: radius.full,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  ratePill: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  rateText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  label: {
    color: colors.textDark,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.sm,
  },
  divider: {
    backgroundColor: colors.divider,
    height: 1,
    marginBottom: spacing.sm,
  },
  feeLabel: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginBottom: spacing.xs,
  },
  feeAmount: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.sm,
  },
  netLabel: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginBottom: spacing.xs,
  },
  netAmount: {
    color: colors.textDark,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
});

// ─────────────────────────────────────────────────────────────────────────────

function StatCard({
  icon,
  iconColor,
  label,
  value,
  accent,
  subLabel,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  label: string;
  value: string;
  accent: string;
  subLabel?: string;
}) {
  const statStyles = useThemedStyles(createStatStyles);
  return (
    <View style={statStyles.card}>
      <View style={[statStyles.iconRing, { backgroundColor: accent }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <Text style={statStyles.label}>{label}</Text>
      <Text style={statStyles.value} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      {subLabel ? (
        <Text style={statStyles.sub}>{subLabel}</Text>
      ) : null}
    </View>
  );
}

const createStatStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderColor: colors.cardBorder,
    borderRadius: radius.card,
    borderWidth: 1,
    padding: spacing.md,
    width: '48%',
    ...shadowSm,
  },
  iconRing: {
    alignItems: 'center',
    borderRadius: radius.full,
    height: 38,
    justifyContent: 'center',
    marginBottom: spacing.sm,
    width: 38,
  },
  label: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.xs,
  },
  value: {
    color: colors.textDark,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  sub: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
});

// ─────────────────────────────────────────────────────────────────────────────

function TimelineItem({
  icon,
  iconColor,
  label,
  date,
  amount,
  isFirst = false,
  isLast = false,
  highlight = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  label: string;
  date: string;
  amount?: number;
  isFirst?: boolean;
  isLast?: boolean;
  highlight?: boolean;
}) {
  const tlStyles = useThemedStyles(createTlStyles);
  return (
    <View style={tlStyles.row}>
      <View style={tlStyles.leftCol}>
        <View style={[tlStyles.dotRing, { borderColor: iconColor, backgroundColor: `${iconColor}18` }]}>
          <Ionicons name={icon} size={14} color={iconColor} />
        </View>
        {!isLast ? <View style={tlStyles.connector} /> : null}
      </View>

      <View
        style={[
          tlStyles.content,
          isFirst && tlStyles.contentFirst,
          isLast && tlStyles.contentLast,
          highlight && tlStyles.contentHighlight,
        ]}
      >
        <View style={tlStyles.contentRow}>
          <View style={tlStyles.contentText}>
            <Text style={[tlStyles.label, highlight && tlStyles.labelHighlight]} numberOfLines={2}>
              {label}
            </Text>
            <Text style={tlStyles.date} numberOfLines={1}>{date}</Text>
          </View>
          {amount !== undefined ? (
            <View style={tlStyles.amountChip}>
              <Text style={tlStyles.amountText} numberOfLines={1}>+ {ghs(amount, 0)}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const createTlStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  row: {
    flexDirection: 'row',
    minHeight: 56,
  },
  leftCol: {
    alignItems: 'center',
    marginRight: spacing.md,
    width: 32,
  },
  dotRing: {
    alignItems: 'center',
    borderRadius: radius.full,
    borderWidth: 2,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  connector: {
    backgroundColor: colors.divider,
    flex: 1,
    marginVertical: spacing.xs,
    width: 2,
  },
  content: {
    flex: 1,
    paddingBottom: spacing.md,
    paddingTop: spacing.xs,
  },
  contentFirst: {
    paddingTop: 0,
  },
  contentLast: {
    paddingBottom: 0,
  },
  contentHighlight: {
    backgroundColor: colors.successLight,
    borderRadius: radius.md,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
  },
  contentRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  contentText: {
    flex: 1,
  },
  label: {
    color: colors.textDark,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  labelHighlight: {
    color: colors.primary,
  },
  date: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
  amountChip: {
    backgroundColor: colors.primaryBackground,
    borderRadius: radius.full,
    flexShrink: 0,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  amountText: {
    color: colors.primary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
});

// ─── Screen styles ────────────────────────────────────────────────────────────
const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  screen: {
    flex: 1,
  },
  topBar: {
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
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  backBtnPressed: {
    backgroundColor: colors.chipBg,
  },
  topBarTitle: {
    color: colors.textDark,
    flex: 1,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    marginHorizontal: spacing.sm,
  },
  statusPill: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  heroCard: {
    borderRadius: radius.heroCard,
    overflow: 'hidden',
    padding: spacing.lg,
    ...shadowMd,
  },
  heroGlow: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: radius.full,
    height: 120,
    position: 'absolute',
    right: -24,
    top: -24,
    width: 120,
  },
  heroTop: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  heroBalanceBlock: {
    flex: 1,
  },
  heroLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.xs,
  },
  heroBalance: {
    color: colors.white,
    fontSize: fontSize.amountHero,
    fontWeight: fontWeight.bold,
    lineHeight: 46,
  },
  heroTarget: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  heroProgressSection: {
    marginBottom: spacing.md,
  },
  heroProgressRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  heroProgressLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  heroProgressPct: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  heroProgressTrack: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: radius.full,
    height: 8,
    overflow: 'hidden',
    width: '100%',
  },
  heroProgressFill: {
    backgroundColor: colors.white,
    borderRadius: radius.full,
    height: 8,
  },
  heroProgressMeta: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  heroMetaText: {
    color: 'rgba(255,255,255,0.72)',
    flexShrink: 1,
    fontSize: fontSize.xs,
  },
  heroMetaTextRight: {
    textAlign: 'right',
  },
  trackBadge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.full,
    flexDirection: 'row',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  trackBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    marginLeft: spacing.xs,
  },
  countdownCard: {
    borderRadius: radius.card,
    overflow: 'hidden',
    ...shadowMd,
  },
  countdownGradient: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  countdownLeft: {
    alignItems: 'flex-start',
    flex: 1,
  },
  countdownDateLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: fontSize.xs,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  countdownDateValue: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  countdownDivider: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    height: '70%',
    marginHorizontal: spacing.lg,
    width: 1,
  },
  countdownRight: {
    alignItems: 'center',
    flex: 1,
  },
  countdownDays: {
    color: colors.white,
    fontSize: 48,
    fontWeight: fontWeight.bold,
    lineHeight: 54,
  },
  countdownDaysLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
  urgentBadge: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: radius.full,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  urgentText: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderColor: colors.cardBorder,
    borderRadius: radius.card,
    borderWidth: 1,
    padding: spacing.md,
    ...shadowSm,
  },
  feeIntroText: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginBottom: spacing.md,
  },
  feeGrid: {
    flexDirection: 'row',
  },
  feeGridSpacer: {
    width: spacing.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  targetReachedBanner: {
    alignItems: 'center',
    backgroundColor: colors.successLight,
    borderRadius: radius.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
    padding: spacing.smd,
  },
  targetReachedText: {
    color: colors.textDark,
    flex: 1,
    fontSize: fontSize.xs,
    minWidth: 140,
  },
  actionsRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  actionSpacer: {
    width: spacing.md,
  },
  bottomSpacer: {
    height: spacing.xl,
  },
});
