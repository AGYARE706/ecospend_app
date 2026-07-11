import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';

import ScreenWrapper from '../../components/ui/ScreenWrapper';
import { useAuth } from '../../context/AuthContext';
import { useGroupVaultDashboard } from '../../hooks/useGroupVaultDashboard';
import { navigateApp, navigateToSubscription } from '../../navigation/navigationRef';
import type { VaultStackParamList } from '../../navigation/types';
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
import type { GroupVault, GroupVaultStatus, WithdrawalRequest } from '../../types/groupVault';
import { getDaysRemaining, formatVaultDate } from '../../utils/vault';

// ─── Navigation ───────────────────────────────────────────────────────────────
type GroupVaultDashNavProp = StackNavigationProp<
  VaultStackParamList,
  'GroupVaultDashboard'
>;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function ghs(amount: number): string {
  return `GH₵ ${new Intl.NumberFormat('en-GH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)}`;
}

function ghsShort(amount: number): string {
  if (amount >= 1_000_000) return `GH₵ ${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1000) return `GH₵ ${(amount / 1000).toFixed(1)}k`;
  return ghs(amount);
}

type StatusMeta = { label: string; color: string; bg: string };

function statusMeta(status: GroupVaultStatus, colors: ThemeColors): StatusMeta {
  switch (status) {
    case 'active':
      return { label: 'Active', color: colors.success, bg: colors.successLight };
    case 'locked':
      return { label: 'Locked', color: colors.warning, bg: colors.warningLight };
    case 'matured':
      return { label: 'Matured', color: colors.blue, bg: colors.blueLight };
    case 'closed':
      return { label: 'Closed', color: colors.textGrey, bg: colors.chipBg };
  }
}

function progress(vault: GroupVault): number {
  if (vault.targetAmount <= 0) return 0;
  return Math.min(100, Math.round((vault.amountSaved / vault.targetAmount) * 100));
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function GroupVaultDashboardScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation<GroupVaultDashNavProp>();
  const { tier } = useAuth();
  const {
    groups,
    pendingRequests,
    summary,
    isEmpty,
    hasPendingRequests,
  } = useGroupVaultDashboard();

  useEffect(() => {
    if (tier === 'FREE') {
      navigateToSubscription();
    }
  }, [tier]);

  const openDetails = (vault: GroupVault) => {
    navigation.navigate('GroupVaultDetails', { groupVaultId: vault.id });
  };

  const openApproval = (req: WithdrawalRequest) => {
    navigation.navigate('WithdrawalApproval', {
      groupVaultId: req.groupVaultId,
      requestId: req.id,
    });
  };

  const openCreateGroup = () => {
    if (tier === 'FREE') {
      navigateToSubscription();
      return;
    }
    navigateApp('CreateGroupVault');
  };
  const openJoinGroup = () => {
    if (tier === 'FREE') {
      navigateToSubscription();
      return;
    }
    navigateApp('JoinGroupVault');
  };

  if (tier === 'FREE') {
    return null;
  }

  return (
    <ScreenWrapper background="page" padded={false}>
      <View style={styles.screen}>
        {/* ─── 1. Header ──────────────────────────────────────── */}
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
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Group Vaults</Text>
            <Text style={styles.headerSub}>
              Save together, reach goals faster
            </Text>
          </View>
          <View style={styles.headerActions}>
            <HeaderIconBtn
              icon="notifications-outline"
              onPress={() => navigateApp('Notifications')}
              badge={summary.pendingApprovals > 0 ? summary.pendingApprovals : undefined}
            />
            <HeaderIconBtn
              icon="enter-outline"
              onPress={openJoinGroup}
              tooltip="Join"
            />
            <HeaderIconBtn
              icon="add"
              onPress={openCreateGroup}
              primary
            />
          </View>
        </View>

        {isEmpty ? (
          /* ─── 5. Empty state ─────────────────────────────────── */
          <GroupVaultEmptyState />
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* ─── 2. Summary Card ──────────────────────────────── */}
            <GroupSummaryCard
              totalSavings={summary.totalGroupSavings}
              activeGroups={summary.activeGroups}
              pendingApprovals={summary.pendingApprovals}
            />

            {/* ─── Quick Actions ────────────────────────────────── */}
            <View style={styles.quickActions}>
              <Pressable
                onPress={openCreateGroup}
                style={({ pressed }) => [
                  styles.quickAction,
                  pressed && styles.quickActionPressed,
                ]}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: colors.primaryBackground }]}>
                  <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
                </View>
                <Text style={styles.quickActionLabel}>Create Group</Text>
              </Pressable>

              <Pressable
                onPress={openJoinGroup}
                style={({ pressed }) => [
                  styles.quickAction,
                  styles.quickActionJoin,
                  pressed && styles.quickActionPressed,
                ]}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: `${colors.blue}18` }]}>
                  <Ionicons name="enter-outline" size={20} color={colors.blue} />
                </View>
                <Text style={[styles.quickActionLabel, { color: colors.blue }]}>
                  Join a Group
                </Text>
              </Pressable>
            </View>

            {/* ─── 4. Pending Requests ──────────────────────────── */}
            {hasPendingRequests ? (
              <>
                <SectionHeader
                  title="Pending Approvals"
                  icon="hourglass-outline"
                  badge={pendingRequests.length}
                  badgeColor={colors.warning}
                />
                {pendingRequests.map((req) => (
                  <WithdrawalRequestCard
                    key={req.id}
                    request={req}
                    onPress={() => openApproval(req)}
                  />
                ))}
              </>
            ) : null}

            {/* ─── 3. My Groups ─────────────────────────────────── */}
            <SectionHeader
              title="My Groups"
              icon="people-outline"
              badge={groups.length}
            />
            {groups.map((vault) => (
              <GroupVaultCard
                key={vault.id}
                vault={vault}
                onPress={() => openDetails(vault)}
              />
            ))}

            <View style={styles.bottomSpacer} />
          </ScrollView>
        )}
      </View>
    </ScreenWrapper>
  );
}

// ─── HeaderIconBtn ────────────────────────────────────────────────────────────
function HeaderIconBtn({
  icon,
  onPress,
  badge,
  primary = false,
  tooltip,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  badge?: number;
  primary?: boolean;
  tooltip?: string;
}) {
  const headerBtnStyles = useThemedStyles(createHeaderBtnStyles);
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        headerBtnStyles.btn,
        primary && headerBtnStyles.btnPrimary,
        pressed && headerBtnStyles.btnPressed,
      ]}
    >
      <Ionicons
        name={icon}
        size={22}
        color={primary ? colors.white : colors.textDark}
      />
      {badge != null && badge > 0 ? (
        <View style={headerBtnStyles.badge}>
          <Text style={headerBtnStyles.badgeText}>{badge}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const createHeaderBtnStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  btn: {
    alignItems: 'center',
    backgroundColor: colors.chipBg,
    borderRadius: radius.full,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  btnPrimary: {
    backgroundColor: colors.primary,
  },
  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.95 }],
  },
  badge: {
    alignItems: 'center',
    backgroundColor: colors.error,
    borderColor: colors.cardBackground,
    borderRadius: radius.full,
    borderWidth: 1.5,
    height: 18,
    justifyContent: 'center',
    minWidth: 18,
    position: 'absolute',
    right: -2,
    top: -2,
  },
  badgeText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: fontWeight.bold,
    paddingHorizontal: 2,
  },
});

// ─── GroupSummaryCard ─────────────────────────────────────────────────────────
function GroupSummaryCard({
  totalSavings,
  activeGroups,
  pendingApprovals,
}: {
  totalSavings: number;
  activeGroups: number;
  pendingApprovals: number;
}) {
  const summaryStyles = useThemedStyles(createSummaryStyles);
  const { colors } = useTheme();
  return (
    <LinearGradient
      colors={[colors.heroGradientStart, colors.heroGradientMid, colors.heroGradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={summaryStyles.card}
    >
      {/* Decorative orbs */}
      <View style={[summaryStyles.orb, summaryStyles.orbTopRight]} />
      <View style={[summaryStyles.orb, summaryStyles.orbBottomLeft]} />

      <View style={summaryStyles.topRow}>
        <View style={summaryStyles.iconRing}>
          <Ionicons name="people" size={18} color={colors.white} />
        </View>
        <Text style={summaryStyles.cardTitle}>Group Vault Overview</Text>
      </View>

      <Text style={summaryStyles.totalLabel}>Total Group Savings</Text>
      <Text style={summaryStyles.totalValue}>{ghs(totalSavings)}</Text>

      <View style={summaryStyles.divider} />

      <View style={summaryStyles.metricRow}>
        <SummaryMetric
          icon="layers-outline"
          label="Active Groups"
          value={String(activeGroups)}
        />
        <View style={summaryStyles.metricDivider} />
        <SummaryMetric
          icon="hourglass-outline"
          label="Pending Votes"
          value={String(pendingApprovals)}
          highlight={pendingApprovals > 0}
        />
        <View style={summaryStyles.metricDivider} />
        <SummaryMetric
          icon="people-outline"
          label="My Groups"
          value="4"
        />
      </View>
    </LinearGradient>
  );
}

function SummaryMetric({
  icon,
  label,
  value,
  highlight = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  const summaryStyles = useThemedStyles(createSummaryStyles);
  const { colors } = useTheme();
  return (
    <View style={summaryStyles.metric}>
      <Ionicons
        name={icon}
        size={14}
        color={highlight ? colors.progressMid : 'rgba(255,255,255,0.72)'}
      />
      <Text style={summaryStyles.metricLabel}>{label}</Text>
      <Text
        style={[
          summaryStyles.metricValue,
          highlight && summaryStyles.metricValueHighlight,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const createSummaryStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  card: {
    borderRadius: radius.heroCard,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    padding: spacing.lg,
    ...shadowMd,
  },
  orb: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: radius.full,
    height: 120,
    position: 'absolute',
    width: 120,
  },
  orbTopRight: { right: -30, top: -30 },
  orbBottomLeft: { bottom: -40, left: -20 },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  iconRing: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: radius.full,
    height: 34,
    justifyContent: 'center',
    marginRight: spacing.sm,
    width: 34,
  },
  cardTitle: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  totalLabel: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
  totalValue: {
    color: colors.white,
    fontSize: 34,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.5,
    marginBottom: spacing.md,
  },
  divider: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    height: 1,
    marginBottom: spacing.md,
  },
  metricRow: {
    flexDirection: 'row',
  },
  metric: {
    alignItems: 'center',
    flex: 1,
  },
  metricLabel: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: fontSize.xs,
    marginBottom: spacing.xs,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  metricValue: {
    color: colors.white,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  metricValueHighlight: {
    color: colors.progressMid,
  },
  metricDivider: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 1,
  },
});

// ─── SectionHeader ────────────────────────────────────────────────────────────
function SectionHeader({
  title,
  icon,
  badge,
  badgeColor,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  badge?: number;
  badgeColor?: string;
}) {
  const sectionStyles = useThemedStyles(createSectionStyles);
  const { colors } = useTheme();
  const resolvedBadgeColor = badgeColor ?? colors.primary;
  return (
    <View style={sectionStyles.row}>
      <Ionicons name={icon} size={16} color={colors.primary} />
      <Text style={sectionStyles.title}>{title}</Text>
      {badge != null ? (
        <View style={[sectionStyles.badge, { backgroundColor: `${resolvedBadgeColor}22` }]}>
          <Text style={[sectionStyles.badgeText, { color: resolvedBadgeColor }]}>
            {badge}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const createSectionStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  title: {
    color: colors.textDark,
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    marginLeft: spacing.sm,
  },
  badge: {
    alignItems: 'center',
    borderRadius: radius.full,
    height: 22,
    justifyContent: 'center',
    minWidth: 22,
    paddingHorizontal: spacing.sm,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
});

// ─── GroupVaultCard ───────────────────────────────────────────────────────────
function GroupVaultCard({
  vault,
  onPress,
}: {
  vault: GroupVault;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const gvCardStyles = useThemedStyles(createGvCardStyles);
  const pct = progress(vault);
  const meta = statusMeta(vault.status, colors);
  const days = getDaysRemaining(vault.maturityDate);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        gvCardStyles.card,
        pressed && gvCardStyles.cardPressed,
      ]}
    >
      {/* Left accent bar */}
      <View style={[gvCardStyles.accent, { backgroundColor: vault.accentColor }]} />

      <View style={gvCardStyles.body}>
        {/* Top row */}
        <View style={gvCardStyles.topRow}>
          <View style={gvCardStyles.titleBlock}>
            <Text style={gvCardStyles.name} numberOfLines={1}>
              {vault.name}
            </Text>
            <Text style={gvCardStyles.goalName} numberOfLines={1}>
              {vault.goalName}
            </Text>
          </View>
          <View style={[gvCardStyles.statusPill, { backgroundColor: meta.bg }]}>
            <Text style={[gvCardStyles.statusText, { color: meta.color }]}>
              {meta.label}
            </Text>
          </View>
        </View>

        {/* Members avatar row */}
        <MemberAvatarRow
          members={vault.members}
          myContribution={vault.myContribution}
        />

        {/* Amounts */}
        <View style={gvCardStyles.amountRow}>
          <View>
            <Text style={gvCardStyles.amountLabel}>Pool Balance</Text>
            <Text style={gvCardStyles.amountValue}>
              {ghs(vault.amountSaved)}
            </Text>
          </View>
          <View style={gvCardStyles.amountRight}>
            <Text style={gvCardStyles.amountLabel}>Target</Text>
            <Text style={gvCardStyles.targetValue}>
              {ghsShort(vault.targetAmount)}
            </Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={gvCardStyles.progressRow}>
          <View style={gvCardStyles.progressTrack}>
            <View
              style={[
                gvCardStyles.progressFill,
                {
                  backgroundColor: vault.accentColor,
                  width: `${pct}%`,
                },
              ]}
            />
          </View>
          <Text style={gvCardStyles.progressPct}>{pct}%</Text>
        </View>

        {/* Footer meta */}
        <View style={gvCardStyles.footer}>
          <MetaChip
            icon="people-outline"
            label={`${vault.members.length} members`}
          />
          <MetaChip
            icon="hourglass-outline"
            label={days > 0 ? `${days}d left` : 'Matured'}
            highlight={days <= 30 && days > 0}
          />
          <MetaChip
            icon="wallet-outline"
            label={`My: ${ghsShort(vault.myContribution)}`}
            iconColor={vault.accentColor}
          />
        </View>
      </View>
    </Pressable>
  );
}

function MemberAvatarRow({
  members,
  myContribution,
}: {
  members: GroupVault['members'];
  myContribution: number;
}) {
  const avatarStyles = useThemedStyles(createAvatarStyles);
  const visible = members.slice(0, 4);
  const overflow = members.length - visible.length;

  return (
    <View style={avatarStyles.row}>
      {visible.map((m, i) => (
        <View
          key={m.id}
          style={[
            avatarStyles.avatar,
            { marginLeft: i === 0 ? 0 : -8, zIndex: visible.length - i },
          ]}
        >
          <Text style={avatarStyles.initials}>{m.initials}</Text>
        </View>
      ))}
      {overflow > 0 ? (
        <View style={[avatarStyles.avatar, avatarStyles.overflow, { marginLeft: -8 }]}>
          <Text style={avatarStyles.overflowText}>+{overflow}</Text>
        </View>
      ) : null}
      <Text style={avatarStyles.myLabel}>
        You contributed {ghsShort(myContribution)}
      </Text>
    </View>
  );
}

const createAvatarStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderColor: colors.cardBackground,
    borderRadius: radius.full,
    borderWidth: 2,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  initials: {
    color: colors.white,
    fontSize: 10,
    fontWeight: fontWeight.bold,
  },
  overflow: {
    backgroundColor: colors.chipBg,
  },
  overflowText: {
    color: colors.textGrey,
    fontSize: 10,
    fontWeight: fontWeight.bold,
  },
  myLabel: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginLeft: spacing.sm,
  },
});

function MetaChip({
  icon,
  label,
  highlight = false,
  iconColor,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  highlight?: boolean;
  iconColor?: string;
}) {
  const metaChipStyles = useThemedStyles(createMetaChipStyles);
  const { colors } = useTheme();
  return (
    <View
      style={[
        metaChipStyles.chip,
        highlight && metaChipStyles.chipHighlight,
      ]}
    >
      <Ionicons
        name={icon}
        size={11}
        color={
          highlight ? colors.warning : iconColor ?? colors.textMuted
        }
      />
      <Text
        style={[
          metaChipStyles.label,
          highlight && metaChipStyles.labelHighlight,
          iconColor ? { color: iconColor } : null,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const createMetaChipStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  chip: {
    alignItems: 'center',
    backgroundColor: colors.chipBg,
    borderRadius: radius.full,
    flexDirection: 'row',
    marginRight: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  chipHighlight: {
    backgroundColor: colors.warningLight,
  },
  label: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    marginLeft: 3,
  },
  labelHighlight: {
    color: colors.warning,
  },
});

const createGvCardStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderColor: colors.cardBorder,
    borderRadius: radius.card,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadowSm,
  },
  cardPressed: {
    opacity: 0.96,
    transform: [{ scale: 0.995 }],
  },
  accent: {
    width: 4,
  },
  body: {
    flex: 1,
    padding: spacing.md,
  },
  topRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  titleBlock: {
    flex: 1,
    marginRight: spacing.sm,
  },
  name: {
    color: colors.textDark,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    marginBottom: 2,
  },
  goalName: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
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
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  amountRight: {
    alignItems: 'flex-end',
  },
  amountLabel: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginBottom: spacing.xs,
  },
  amountValue: {
    color: colors.textDark,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  targetValue: {
    color: colors.textGrey,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  progressRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  progressTrack: {
    backgroundColor: colors.divider,
    borderRadius: radius.full,
    flex: 1,
    height: 6,
    marginRight: spacing.sm,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: radius.full,
    height: 6,
  },
  progressPct: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    textAlign: 'right',
    width: 32,
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});

// ─── WithdrawalRequestCard ────────────────────────────────────────────────────
function WithdrawalRequestCard({
  request,
  onPress,
}: {
  request: WithdrawalRequest;
  onPress: () => void;
}) {
  const reqStyles = useThemedStyles(createReqStyles);
  const { colors } = useTheme();
  const voteProgress = Math.min(
    100,
    Math.round((request.votesFor / request.requiredVotes) * 100),
  );

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        reqStyles.card,
        request.hasVoted && reqStyles.cardVoted,
        pressed && reqStyles.cardPressed,
      ]}
    >
      {/* Urgent left stripe */}
      <View
        style={[
          reqStyles.stripe,
          { backgroundColor: request.hasVoted ? colors.borderSubtle : colors.warning },
        ]}
      />

      <View style={reqStyles.body}>
        {/* Header row */}
        <View style={reqStyles.headerRow}>
          <View style={reqStyles.avatarRing}>
            <Text style={reqStyles.avatarText}>
              {request.requestedBy.initials}
            </Text>
          </View>
          <View style={reqStyles.reqInfo}>
            <Text style={reqStyles.reqName}>
              {request.requestedBy.name}
            </Text>
            <Text style={reqStyles.reqGroup}>{request.groupVaultName}</Text>
          </View>
          <View style={reqStyles.amountBlock}>
            <Text style={reqStyles.reqAmount}>{ghs(request.amount)}</Text>
            <Text style={reqStyles.reqDate}>
              {formatVaultDate(request.requestedDate)}
            </Text>
          </View>
        </View>

        {/* Reason */}
        <View style={reqStyles.reasonRow}>
          <Ionicons
            name="chatbubble-outline"
            size={13}
            color={colors.textMuted}
          />
          <Text style={reqStyles.reason} numberOfLines={2}>
            {request.reason}
          </Text>
        </View>

        {/* Vote bar */}
        <View style={reqStyles.voteSection}>
          <View style={reqStyles.voteStats}>
            <Text style={reqStyles.voteLabel}>
              {request.votesFor} of {request.requiredVotes} votes
            </Text>
            <Text style={reqStyles.voteAgainst}>
              {request.votesAgainst} against
            </Text>
          </View>
          <View style={reqStyles.voteTrack}>
            <View
              style={[
                reqStyles.voteFill,
                {
                  backgroundColor:
                    voteProgress >= 100 ? colors.success : colors.warning,
                  width: `${voteProgress}%`,
                },
              ]}
            />
          </View>
        </View>

        {/* CTA */}
        {request.hasVoted ? (
          <View style={reqStyles.votedBadge}>
            <Ionicons
              name="checkmark-circle"
              size={14}
              color={colors.success}
            />
            <Text style={reqStyles.votedText}>You've voted</Text>
          </View>
        ) : (
          <View style={reqStyles.ctaRow}>
            <View style={reqStyles.ctaBtn}>
              <Ionicons name="thumbs-up-outline" size={14} color={colors.success} />
              <Text style={reqStyles.ctaApprove}>Approve</Text>
            </View>
            <View style={reqStyles.ctaBtn}>
              <Ionicons name="thumbs-down-outline" size={14} color={colors.error} />
              <Text style={reqStyles.ctaReject}>Reject</Text>
            </View>
            <View style={reqStyles.ctaViewBtn}>
              <Text style={reqStyles.ctaView}>View Details →</Text>
            </View>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const createReqStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  card: {
    backgroundColor: colors.warningLight,
    borderColor: `${colors.warning}40`,
    borderRadius: radius.card,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadowSm,
  },
  cardVoted: {
    backgroundColor: colors.cardBackground,
    borderColor: colors.cardBorder,
  },
  cardPressed: {
    opacity: 0.94,
    transform: [{ scale: 0.997 }],
  },
  stripe: {
    width: 4,
  },
  body: {
    flex: 1,
    padding: spacing.md,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  avatarRing: {
    alignItems: 'center',
    backgroundColor: colors.warning,
    borderRadius: radius.full,
    height: 38,
    justifyContent: 'center',
    marginRight: spacing.sm,
    width: 38,
  },
  avatarText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  reqInfo: {
    flex: 1,
  },
  reqName: {
    color: colors.textDark,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    marginBottom: 2,
  },
  reqGroup: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
  amountBlock: {
    alignItems: 'flex-end',
  },
  reqAmount: {
    color: colors.textDark,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    marginBottom: 2,
  },
  reqDate: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
  reasonRow: {
    alignItems: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderRadius: radius.md,
    flexDirection: 'row',
    marginBottom: spacing.sm,
    padding: spacing.sm,
  },
  reason: {
    color: colors.textGrey,
    flex: 1,
    fontSize: fontSize.xs,
    lineHeight: 18,
    marginLeft: spacing.xs,
  },
  voteSection: {
    marginBottom: spacing.sm,
  },
  voteStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  voteLabel: {
    color: colors.textDark,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  voteAgainst: {
    color: colors.error,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  voteTrack: {
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: radius.full,
    height: 6,
    overflow: 'hidden',
  },
  voteFill: {
    borderRadius: radius.full,
    height: 6,
  },
  ctaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  ctaBtn: {
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: radius.button,
    flexDirection: 'row',
    flex: 1,
    height: 36,
    justifyContent: 'center',
    ...shadowSm,
  },
  ctaApprove: {
    color: colors.success,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    marginLeft: 4,
  },
  ctaReject: {
    color: colors.error,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    marginLeft: 4,
  },
  ctaViewBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  ctaView: {
    color: colors.primary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  votedBadge: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: spacing.xs,
  },
  votedText: {
    color: colors.success,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    marginLeft: spacing.xs,
  },
});

// ─── GroupVaultEmptyState ─────────────────────────────────────────────────────
function GroupVaultEmptyState() {
  const emptyStyles = useThemedStyles(createEmptyStyles);
  const { colors } = useTheme();
  return (
    <View style={emptyStyles.container}>
      {/* Illustration */}
      <View style={emptyStyles.illustrationWrapper}>
        <View style={emptyStyles.outerRing} />
        <View style={emptyStyles.midRing} />
        <LinearGradient
          colors={[colors.primaryDark, colors.primary]}
          style={emptyStyles.circle}
        >
          <Ionicons name="people" size={40} color={colors.white} />
        </LinearGradient>
        {/* Floating chips */}
        <View style={[emptyStyles.chip, emptyStyles.chipTR]}>
          <Ionicons name="lock-closed" size={12} color={colors.primary} />
        </View>
        <View style={[emptyStyles.chip, emptyStyles.chipBL]}>
          <Ionicons name="trending-up" size={12} color={colors.primary} />
        </View>
      </View>

      <Text style={emptyStyles.title}>No group vaults yet</Text>
      <Text style={emptyStyles.body}>
        You haven't joined any group vaults yet.{'\n'}
        Create one or join a friend's group.
      </Text>

      <Pressable
        onPress={() => navigateApp('CreateGroupVault')}
        style={({ pressed }) => [
          emptyStyles.primaryBtn,
          pressed && emptyStyles.btnPressed,
        ]}
      >
        <Ionicons
          name="add-circle-outline"
          size={18}
          color={colors.white}
          style={emptyStyles.btnIcon}
        />
        <Text style={emptyStyles.primaryBtnText}>Create Group Vault</Text>
      </Pressable>

      <Pressable
        onPress={() => navigateApp('JoinGroupVault')}
        style={({ pressed }) => [
          emptyStyles.outlineBtn,
          pressed && emptyStyles.btnPressed,
        ]}
      >
        <Ionicons
          name="enter-outline"
          size={18}
          color={colors.primary}
          style={emptyStyles.btnIcon}
        />
        <Text style={emptyStyles.outlineBtnText}>Join Group Vault</Text>
      </Pressable>
    </View>
  );
}

const createEmptyStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xxl,
  },
  illustrationWrapper: {
    alignItems: 'center',
    height: 180,
    justifyContent: 'center',
    marginBottom: spacing.xl,
    width: 180,
  },
  outerRing: {
    borderColor: `${colors.primary}14`,
    borderRadius: radius.full,
    borderWidth: 2,
    height: 170,
    position: 'absolute',
    width: 170,
  },
  midRing: {
    borderColor: `${colors.primary}24`,
    borderRadius: radius.full,
    borderWidth: 2,
    height: 138,
    position: 'absolute',
    width: 138,
  },
  circle: {
    alignItems: 'center',
    borderRadius: radius.full,
    height: 100,
    justifyContent: 'center',
    width: 100,
    ...shadowMd,
  },
  chip: {
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderColor: colors.cardBorder,
    borderRadius: radius.full,
    borderWidth: 1,
    height: 32,
    justifyContent: 'center',
    position: 'absolute',
    width: 32,
    ...shadowSm,
  },
  chipTR: { right: 8, top: 16 },
  chipBL: { bottom: 14, left: 10 },
  title: {
    color: colors.textDark,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  body: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    lineHeight: 22,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  primaryBtn: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.button,
    flexDirection: 'row',
    height: 52,
    justifyContent: 'center',
    marginBottom: spacing.md,
    width: '100%',
    ...shadowSm,
  },
  outlineBtn: {
    alignItems: 'center',
    borderColor: colors.primary,
    borderRadius: radius.button,
    borderWidth: 1.5,
    flexDirection: 'row',
    height: 48,
    justifyContent: 'center',
    width: '100%',
  },
  btnIcon: {
    marginRight: spacing.sm,
  },
  btnPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  primaryBtnText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  outlineBtnText: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
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
    justifyContent: 'space-between',
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  backBtn: {
    alignItems: 'center',
    backgroundColor: colors.chipBg,
    borderRadius: radius.full,
    height: 40,
    justifyContent: 'center',
    marginRight: spacing.sm,
    width: 40,
  },
  backBtnPressed: {
    opacity: 0.85,
  },
  headerText: {
    flex: 1,
    marginRight: spacing.md,
  },
  headerTitle: {
    color: colors.textDark,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
  },
  headerSub: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  quickAction: {
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderColor: colors.cardBorder,
    borderRadius: radius.card,
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
    ...shadowSm,
  },
  quickActionJoin: {
    borderColor: `${colors.blue}30`,
  },
  quickActionPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.97 }],
  },
  quickActionIcon: {
    alignItems: 'center',
    borderRadius: radius.full,
    height: 42,
    justifyContent: 'center',
    marginBottom: spacing.sm,
    width: 42,
  },
  quickActionLabel: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    textAlign: 'center',
  },
  bottomSpacer: {
    height: spacing.xxl,
  },
});
