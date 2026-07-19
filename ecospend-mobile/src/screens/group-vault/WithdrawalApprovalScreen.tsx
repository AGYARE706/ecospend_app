import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useMemo, useState } from 'react';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import AppButton from '../../components/ui/AppButton';
import EmptyState from '../../components/ui/EmptyState';
import InfoTooltip from '../../components/ui/InfoTooltip';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import { useVaults } from '../../context/VaultContext';
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
import type {
  GroupVaultMember,
  WithdrawalRequest,
} from '../../types/groupVault';
import { formatVaultDate, groupWithdrawalFeeRate } from '../../utils/vault';

type WithdrawalApprovalRouteProp = RouteProp<
  VaultStackParamList,
  'WithdrawalApproval'
>;
type WithdrawalApprovalNavProp = StackNavigationProp<
  VaultStackParamList,
  'WithdrawalApproval'
>;

type MemberVoteStatus = 'approved' | 'rejected' | 'pending' | 'you' | 'voted';

function ghs(amount: number): string {
  return `GH₵ ${new Intl.NumberFormat('en-GH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)}`;
}

/**
 * Who voted which way, for display. The backend only tells us the totals
 * plus whether *I* voted (not which way) — so "you" only gets a definite
 * approve/reject badge for a vote just cast in this session; a vote from
 * an earlier session shows as a neutral "already voted" state rather than
 * guessing which way it went.
 */
function buildMemberVotes(
  members: GroupVaultMember[],
  request: WithdrawalRequest,
  myVoteThisSession: 'approve' | 'reject' | null,
): Array<{ member: GroupVaultMember; vote: MemberVoteStatus }> {
  const votes: Array<{ member: GroupVaultMember; vote: MemberVoteStatus }> = [];
  let remainingFor = request.votesFor;
  let remainingAgainst = request.votesAgainst;

  for (const member of members) {
    if (member.isMe) {
      if (myVoteThisSession === 'approve') {
        votes.push({ member, vote: 'approved' });
        remainingFor = Math.max(0, remainingFor - 1);
      } else if (myVoteThisSession === 'reject') {
        votes.push({ member, vote: 'rejected' });
        remainingAgainst = Math.max(0, remainingAgainst - 1);
      } else if (request.hasVoted) {
        // Voted in an earlier session — we know *that*, not which way.
        votes.push({ member, vote: 'voted' });
      } else {
        votes.push({ member, vote: 'you' });
      }
      continue;
    }

    if (remainingFor > 0) {
      votes.push({ member, vote: 'approved' });
      remainingFor -= 1;
    } else if (remainingAgainst > 0) {
      votes.push({ member, vote: 'rejected' });
      remainingAgainst -= 1;
    } else {
      votes.push({ member, vote: 'pending' });
    }
  }

  return votes;
}

export default function WithdrawalApprovalScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { params } = useRoute<WithdrawalApprovalRouteProp>();
  const navigation = useNavigation<WithdrawalApprovalNavProp>();
  const {
    getGroupVaultById,
    getWithdrawalRequestById,
    withdrawalRequests,
    voteWithdrawal,
  } = useVaults();

  const group = getGroupVaultById(params.groupVaultId);
  const request =
    getWithdrawalRequestById(params.requestId) ??
    withdrawalRequests.find((r) => r.groupVaultId === params.groupVaultId);

  if (!group || !request) {
    return (
      <ScreenWrapper background="page">
        <EmptyState
          icon="hourglass-outline"
          title="Withdrawal request not found"
          subtitle="This request may have already been resolved or removed."
          actionLabel="Go back"
          onAction={() => navigation.goBack()}
        />
      </ScreenWrapper>
    );
  }

  // Vote counts/status come straight from context — voteWithdrawal() already
  // reconciles the real server response into withdrawalRequests, so `request`
  // here is always current, including if this vote executes or rejects it.
  const [myVote, setMyVote] = useState<'approve' | 'reject' | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [voteError, setVoteError] = useState<string | null>(null);

  const requiredVotes = request.requiredVotes;
  const votesRemaining = Math.max(0, requiredVotes - request.votesFor - request.votesAgainst);
  const feeRate = groupWithdrawalFeeRate(group);
  const feeAmount = request.amount * feeRate;
  const netPayout = request.amount - feeAmount;
  const alreadyVoted = request.hasVoted || myVote !== null;

  const memberVotes = useMemo(
    () => buildMemberVotes(group.members, request, myVote),
    [group.members, myVote, request],
  );

  const castVote = async (approve: boolean) => {
    if (alreadyVoted || isVoting) return;
    setIsVoting(true);
    setVoteError(null);
    try {
      await voteWithdrawal(request.id, approve);
      setMyVote(approve ? 'approve' : 'reject');
    } catch {
      setVoteError('Could not submit your vote — try again.');
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <ScreenWrapper background="page" padded={false} edges={['top']}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]}
            hitSlop={spacing.sm}
          >
            <Ionicons name="chevron-back" size={24} color={colors.textDark} />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Withdrawal Approval</Text>
            <Text style={styles.headerSub}>{group.name}</Text>
          </View>
          <View style={styles.headerShield}>
            <Ionicons name="shield-checkmark" size={18} color={colors.primary} />
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Request Summary Card */}
          <LinearGradient
            colors={[colors.heroGradientStart, colors.heroGradientMid, colors.heroGradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.requestCard}
          >
            <Text style={styles.requestLabel}>Request Summary</Text>
            <Text style={styles.requestAmount}>{ghs(request.amount)}</Text>

            <View style={styles.requestMetaRow}>
              <MetaItem icon="person-outline" label="Requestor" value={request.requestedBy.name} />
              <MetaItem icon="calendar-outline" label="Date" value={formatVaultDate(request.requestedDate)} />
            </View>

            <View style={styles.requestReasonBox}>
              <Text style={styles.requestReasonLabel}>Reason</Text>
              <Text style={styles.requestReason}>{request.reason}</Text>
            </View>

            <View style={styles.feeRow}>
              <Text style={styles.feeRowLabel}>
                If approved: {Math.round(feeRate * 100)}% fee (−{ghs(feeAmount)})
                {feeRate === 0.05 ? ' — before the lock date' : feeRate === 0.04 ? ' — group never hit its target' : ''}
              </Text>
              <Text style={styles.feeRowValue}>{ghs(netPayout)} net to requester</Text>
            </View>
          </LinearGradient>

          {request.status !== 'pending' ? (
            <View
              style={[
                styles.resolvedBanner,
                { backgroundColor: request.status === 'executed' ? colors.successLight : colors.errorLight },
              ]}
            >
              <Ionicons
                name={request.status === 'executed' ? 'checkmark-circle' : 'close-circle'}
                size={18}
                color={request.status === 'executed' ? colors.success : colors.error}
              />
              <Text
                style={[
                  styles.resolvedBannerText,
                  { color: request.status === 'executed' ? colors.success : colors.error },
                ]}
              >
                {request.status === 'executed'
                  ? 'Approved and paid out.'
                  : 'Rejected by the group.'}
              </Text>
            </View>
          ) : null}

          {/* Approval Status Card */}
          <SectionHeader
            title="Approval Status"
            icon="stats-chart-outline"
            right={
              <InfoTooltip
                title="How voting works"
                body="More than half of the group's active members must approve for a withdrawal to execute automatically — there's no separate confirmation step. If enough members reject it that a majority becomes impossible, the request is automatically rejected instead. The fee depends on timing: 2% on time with target met, 4% on time but under target, 5% if executed before the lock date — it's always deducted from the requester's own balance and never touches other members' funds."
              />
            }
          />
          <View style={styles.card}>
            <View style={styles.statusGrid}>
              <StatusMetric
                icon="thumbs-up-outline"
                iconColor={colors.success}
                label="Approvals"
                value={String(request.votesFor)}
                tone="success"
              />
              <StatusMetric
                icon="thumbs-down-outline"
                iconColor={colors.error}
                label="Rejections"
                value={String(request.votesAgainst)}
                tone="error"
              />
              <StatusMetric
                icon="hourglass-outline"
                iconColor={colors.warning}
                label="Votes Remaining"
                value={String(votesRemaining)}
                tone="warning"
              />
            </View>

            <View style={styles.trackWrap}>
              <View style={styles.track}>
                <View style={[styles.fillApprove, { width: `${Math.min(100, (request.votesFor / requiredVotes) * 100)}%` }]} />
              </View>
              <Text style={styles.trackText}>
                {request.status === 'executed'
                  ? 'Approved by majority'
                  : request.status === 'rejected'
                    ? 'Rejected by the group'
                    : `${requiredVotes} approvals required`}
              </Text>
            </View>
          </View>

          {/* Member Voting List */}
          <SectionHeader title="Member Votes" icon="people-outline" />
          <View style={styles.card}>
            {memberVotes.map((entry, idx) => (
              <MemberVoteRow
                key={entry.member.id}
                member={entry.member}
                vote={entry.vote}
                isLast={idx === memberVotes.length - 1}
              />
            ))}
          </View>

          {/* Actions */}
          {request.status === 'pending' ? (
            <>
              <SectionHeader title="Actions" icon="flash-outline" />
              <View style={styles.actionRow}>
                <View style={styles.actionBtn}>
                  <AppButton
                    title={myVote === 'approve' ? 'Approved' : 'Approve'}
                    variant={myVote === 'approve' ? 'primary' : 'outline'}
                    icon="thumbs-up-outline"
                    disabled={alreadyVoted || isVoting}
                    loading={isVoting}
                    onPress={() => void castVote(true)}
                  />
                </View>
                <View style={styles.actionSpacer} />
                <View style={styles.actionBtn}>
                  <AppButton
                    title={myVote === 'reject' ? 'Rejected' : 'Reject'}
                    variant={myVote === 'reject' ? 'primary' : 'outline'}
                    icon="thumbs-down-outline"
                    disabled={alreadyVoted || isVoting}
                    loading={isVoting}
                    onPress={() => void castVote(false)}
                  />
                </View>
              </View>
            </>
          ) : null}

          {voteError ? (
            <View style={styles.toast}>
              <Ionicons name="alert-circle" size={16} color={colors.error} />
              <Text style={styles.toastText}>{voteError}</Text>
            </View>
          ) : alreadyVoted ? (
            <View style={styles.toast}>
              <Ionicons
                name={myVote === 'approve' ? 'checkmark-circle' : myVote === 'reject' ? 'alert-circle' : 'information-circle-outline'}
                size={16}
                color={myVote === 'approve' ? colors.success : myVote === 'reject' ? colors.warning : colors.textMuted}
              />
              <Text style={styles.toastText}>
                Your vote has been recorded. Thanks for participating in group governance.
              </Text>
            </View>
          ) : request.status === 'pending' ? (
            <View style={styles.toast}>
              <Ionicons name="information-circle-outline" size={16} color={colors.textMuted} />
              <Text style={styles.toastText}>
                Vote once. Your decision helps protect all members' funds.
              </Text>
            </View>
          ) : null}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
}

function SectionHeader({
  title,
  icon,
  right,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  right?: ReactNode;
}) {
  const sectionStyles = useThemedStyles(createSectionStyles);
  const { colors } = useTheme();
  return (
    <View style={sectionStyles.row}>
      <Ionicons name={icon} size={15} color={colors.primary} />
      <Text style={sectionStyles.title}>{title}</Text>
      {right ? <View style={sectionStyles.right}>{right}</View> : null}
    </View>
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
  const metaStyles = useThemedStyles(createMetaStyles);
  return (
    <View style={metaStyles.item}>
      <Ionicons name={icon} size={13} color="rgba(255,255,255,0.7)" />
      <Text style={metaStyles.label}>{label}</Text>
      <Text style={metaStyles.value} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function StatusMetric({
  icon,
  iconColor,
  label,
  value,
  tone,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  label: string;
  value: string;
  tone: 'success' | 'error' | 'warning';
}) {
  const metricStyles = useThemedStyles(createMetricStyles);
  const { colors } = useTheme();
  const bg =
    tone === 'success'
      ? colors.successLight
      : tone === 'error'
        ? colors.errorLight
        : colors.warningLight;
  return (
    <View style={[metricStyles.metric, { backgroundColor: bg }]}>
      <Ionicons name={icon} size={14} color={iconColor} />
      <Text style={metricStyles.label}>{label}</Text>
      <Text style={metricStyles.value}>{value}</Text>
    </View>
  );
}

function MemberVoteRow({
  member,
  vote,
  isLast,
}: {
  member: GroupVaultMember;
  vote: MemberVoteStatus;
  isLast: boolean;
}) {
  const memberStyles = useThemedStyles(createMemberStyles);
  const { colors } = useTheme();
  const cfg =
    vote === 'approved'
      ? { text: 'Approved', color: colors.success, bg: colors.successLight, icon: 'checkmark-circle' as const }
      : vote === 'rejected'
        ? { text: 'Rejected', color: colors.error, bg: colors.errorLight, icon: 'close-circle' as const }
        : vote === 'you'
          ? { text: 'Awaiting your vote', color: colors.warning, bg: colors.warningLight, icon: 'person-circle' as const }
          : vote === 'voted'
            ? { text: 'You voted', color: colors.primary, bg: colors.primaryBackground, icon: 'checkmark-done-circle-outline' as const }
            : { text: 'Pending', color: colors.textMuted, bg: colors.chipBg, icon: 'time' as const };

  return (
    <View style={[memberStyles.row, isLast && memberStyles.rowLast]}>
      <View style={memberStyles.avatar}>
        <Text style={memberStyles.avatarText}>{member.initials}</Text>
      </View>
      <View style={memberStyles.info}>
        <Text style={memberStyles.name}>{member.name}</Text>
        <Text style={memberStyles.role}>{member.role === 'admin' ? 'Admin' : 'Member'}</Text>
      </View>
      <View style={[memberStyles.badge, { backgroundColor: cfg.bg }]}>
        <Ionicons name={cfg.icon} size={12} color={cfg.color} />
        <Text style={[memberStyles.badgeText, { color: cfg.color }]}>{cfg.text}</Text>
      </View>
    </View>
  );
}

const createSectionStyles = (colors: ThemeColors) =>
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
  right: {
    marginLeft: 'auto',
  },
});

const createMetaStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  item: {
    flex: 1,
  },
  label: {
    color: 'rgba(255,255,255,0.68)',
    fontSize: 10,
    marginBottom: spacing.xs,
    marginTop: spacing.xs,
  },
  value: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
});

const createMetricStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  metric: {
    alignItems: 'center',
    borderRadius: radius.md,
    flex: 1,
    marginRight: spacing.sm,
    paddingVertical: spacing.sm,
  },
  label: {
    color: colors.textMuted,
    fontSize: 10,
    marginBottom: spacing.xs,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  value: {
    color: colors.textDark,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
});

const createMemberStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  row: {
    alignItems: 'center',
    borderBottomColor: colors.divider,
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingVertical: spacing.sm,
  },
  rowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    height: 34,
    justifyContent: 'center',
    marginRight: spacing.sm,
    width: 34,
  },
  avatarText: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  info: {
    flex: 1,
  },
  name: {
    color: colors.textDark,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    marginBottom: 2,
  },
  role: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
  badge: {
    alignItems: 'center',
    borderRadius: radius.full,
    flexDirection: 'row',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: fontWeight.bold,
    marginLeft: 4,
  },
});

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
  headerSub: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  headerShield: {
    alignItems: 'center',
    backgroundColor: colors.primaryBackground,
    borderRadius: radius.full,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  requestCard: {
    borderRadius: radius.heroCard,
    overflow: 'hidden',
    padding: spacing.lg,
    ...shadowMd,
  },
  requestGlow: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radius.full,
    height: 110,
    position: 'absolute',
    right: -20,
    top: -20,
    width: 110,
  },
  requestLabel: {
    color: 'rgba(255,255,255,0.74)',
    fontSize: fontSize.xs,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  requestAmount: {
    color: colors.white,
    fontSize: fontSize.amountHero,
    fontWeight: fontWeight.bold,
    lineHeight: 46,
    marginBottom: spacing.md,
  },
  requestMetaRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  requestReasonBox: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  requestReasonLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: fontSize.xs,
    marginBottom: spacing.xs,
  },
  requestReason: {
    color: colors.white,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  feeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  feeRowLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: fontSize.xs,
  },
  feeRowValue: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  resolvedBanner: {
    alignItems: 'center',
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    padding: spacing.smd,
  },
  resolvedBannerText: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderColor: colors.cardBorder,
    borderRadius: radius.card,
    borderWidth: 1,
    padding: spacing.md,
    ...shadowSm,
  },
  statusGrid: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  trackWrap: {
    marginTop: spacing.xs,
  },
  track: {
    backgroundColor: colors.divider,
    borderRadius: radius.full,
    height: 8,
    overflow: 'hidden',
  },
  fillApprove: {
    backgroundColor: colors.success,
    borderRadius: radius.full,
    height: 8,
  },
  trackText: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
    textAlign: 'right',
  },
  actionRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  actionBtn: {
    flex: 1,
  },
  actionSpacer: {
    width: spacing.md,
  },
  toast: {
    alignItems: 'center',
    backgroundColor: colors.chipBg,
    borderRadius: radius.md,
    flexDirection: 'row',
    marginTop: spacing.sm,
    padding: spacing.sm,
  },
  toastText: {
    color: colors.textGrey,
    flex: 1,
    fontSize: fontSize.xs,
    lineHeight: 18,
    marginLeft: spacing.xs,
  },
  bottomSpacer: {
    height: spacing.lg,
  },
});
