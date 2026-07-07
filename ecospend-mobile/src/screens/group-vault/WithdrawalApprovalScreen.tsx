import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useMemo, useState } from 'react';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import AppButton from '../../components/ui/AppButton';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import {
  mockGroupVaults,
  mockWithdrawalRequests,
} from '../../data/mock/groupVaults';
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
import { formatVaultDate } from '../../utils/vault';

type WithdrawalApprovalRouteProp = RouteProp<
  VaultStackParamList,
  'WithdrawalApproval'
>;
type WithdrawalApprovalNavProp = StackNavigationProp<
  VaultStackParamList,
  'WithdrawalApproval'
>;

type MemberVoteStatus = 'approved' | 'rejected' | 'pending' | 'you';

function ghs(amount: number): string {
  return `GH₵ ${new Intl.NumberFormat('en-GH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)}`;
}

function buildMemberVotes(
  members: GroupVaultMember[],
  request: WithdrawalRequest,
): Array<{ member: GroupVaultMember; vote: MemberVoteStatus }> {
  const votes: Array<{ member: GroupVaultMember; vote: MemberVoteStatus }> = [];
  let remainingFor = request.votesFor;
  let remainingAgainst = request.votesAgainst;
  let youAssigned = false;

  for (const member of members) {
    const isYou = member.initials === 'FM' || member.name.toLowerCase().includes('frank');
    if (isYou && !youAssigned) {
      votes.push({
        member,
        vote: request.hasVoted
          ? remainingFor > 0
            ? 'approved'
            : remainingAgainst > 0
              ? 'rejected'
              : 'you'
          : 'you',
      });
      if (request.hasVoted && remainingFor > 0) remainingFor -= 1;
      else if (request.hasVoted && remainingAgainst > 0) remainingAgainst -= 1;
      youAssigned = true;
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

  const group = mockGroupVaults.find((g) => g.id === params.groupVaultId) ?? mockGroupVaults[0]!;
  const request =
    mockWithdrawalRequests.find((r) => r.id === params.requestId && r.groupVaultId === params.groupVaultId) ??
    mockWithdrawalRequests.find((r) => r.groupVaultId === group.id) ??
    mockWithdrawalRequests[0]!;

  const [votesFor, setVotesFor] = useState(request.votesFor);
  const [votesAgainst, setVotesAgainst] = useState(request.votesAgainst);
  const [myVote, setMyVote] = useState<'approve' | 'reject' | null>(
    request.hasVoted ? 'approve' : null,
  );

  const requiredVotes = request.requiredVotes;
  const votesRemaining = Math.max(0, requiredVotes - votesFor - votesAgainst);
  const approved = votesFor >= requiredVotes;

  const memberVotes = useMemo(() => {
    const adjustedRequest: WithdrawalRequest = {
      ...request,
      votesFor,
      votesAgainst,
      hasVoted: myVote !== null,
    };
    return buildMemberVotes(group.members, adjustedRequest);
  }, [group.members, myVote, request, votesAgainst, votesFor]);

  const onApprove = () => {
    if (myVote !== null) return;
    setVotesFor((v) => v + 1);
    setMyVote('approve');
  };

  const onReject = () => {
    if (myVote !== null) return;
    setVotesAgainst((v) => v + 1);
    setMyVote('reject');
  };

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
            <View style={styles.requestGlow} />
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
          </LinearGradient>

          {/* Approval Status Card */}
          <SectionHeader title="Approval Status" icon="stats-chart-outline" />
          <View style={styles.card}>
            <View style={styles.statusGrid}>
              <StatusMetric
                icon="thumbs-up-outline"
                iconColor={colors.success}
                label="Approvals"
                value={String(votesFor)}
                tone="success"
              />
              <StatusMetric
                icon="thumbs-down-outline"
                iconColor={colors.error}
                label="Rejections"
                value={String(votesAgainst)}
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
                <View style={[styles.fillApprove, { width: `${Math.min(100, (votesFor / requiredVotes) * 100)}%` }]} />
              </View>
              <Text style={styles.trackText}>
                {approved ? 'Approved by majority' : `${requiredVotes} approvals required`}
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
          <SectionHeader title="Actions" icon="flash-outline" />
          <View style={styles.actionRow}>
            <View style={styles.actionBtn}>
              <AppButton
                title={myVote === 'approve' ? 'Approved' : 'Approve'}
                variant={myVote === 'approve' ? 'primary' : 'outline'}
                icon="thumbs-up-outline"
                disabled={myVote !== null}
                onPress={onApprove}
              />
            </View>
            <View style={styles.actionSpacer} />
            <View style={styles.actionBtn}>
              <AppButton
                title={myVote === 'reject' ? 'Rejected' : 'Reject'}
                variant={myVote === 'reject' ? 'primary' : 'outline'}
                icon="thumbs-down-outline"
                disabled={myVote !== null}
                onPress={onReject}
              />
            </View>
          </View>

          {myVote !== null ? (
            <View style={styles.toast}>
              <Ionicons
                name={myVote === 'approve' ? 'checkmark-circle' : 'alert-circle'}
                size={16}
                color={myVote === 'approve' ? colors.success : colors.warning}
              />
              <Text style={styles.toastText}>
                Your vote has been recorded. Thanks for participating in group governance.
              </Text>
            </View>
          ) : (
            <View style={styles.toast}>
              <Ionicons name="information-circle-outline" size={16} color={colors.textMuted} />
              <Text style={styles.toastText}>
                Vote once. Your decision helps protect all members' funds.
              </Text>
            </View>
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
}

function SectionHeader({
  title,
  icon,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  const sectionStyles = useThemedStyles(createSectionStyles);
  const { colors } = useTheme();
  return (
    <View style={sectionStyles.row}>
      <Ionicons name={icon} size={15} color={colors.primary} />
      <Text style={sectionStyles.title}>{title}</Text>
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
