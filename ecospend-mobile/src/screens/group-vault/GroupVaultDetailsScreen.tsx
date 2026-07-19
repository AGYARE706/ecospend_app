import type { ReactNode } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import AppButton from '../../components/ui/AppButton';
import InfoTooltip from '../../components/ui/InfoTooltip';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import {
  formatGroupVaultDate,
  useGroupVaultDetails,
  type GroupContributionTimelineItem,
} from '../../hooks/useGroupVaultDetails';
import { navigateApp } from '../../navigation/navigationRef';
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
  MemberInstalment,
  MemberPlanState,
  WithdrawalRequest,
} from '../../types/groupVault';

type GroupVaultDetailsRouteProp = RouteProp<
  VaultStackParamList,
  'GroupVaultDetails'
>;
type GroupVaultDetailsNavProp = StackNavigationProp<
  VaultStackParamList,
  'GroupVaultDetails'
>;

function ghs(amount: number): string {
  return `GH₵ ${new Intl.NumberFormat('en-GH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)}`;
}

export default function GroupVaultDetailsScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { params } = useRoute<GroupVaultDetailsRouteProp>();
  const navigation = useNavigation<GroupVaultDetailsNavProp>();
  const {
    vault,
    pendingRequests,
    progressPct,
    daysRemaining,
    remainingAmount,
    memberContributionMap,
    timeline,
  } = useGroupVaultDetails(params.groupVaultId);

  const me = vault.members.find((member) => member.isMe);
  const isAdmin = me?.role === 'admin';
  const myPlan = me ? vault.memberPlans?.find((plan) => plan.userId === me.id) : undefined;

  return (
    <ScreenWrapper background="page" padded={false} edges={['top']}>
      <View style={styles.screen}>
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
            <Text style={styles.headerTitle}>Group Vault</Text>
            <Text style={styles.headerSub}>{vault.name}</Text>
          </View>
          <View style={styles.headerAction}>
            <InfoTooltip title="How this group vault works">
              <View style={styles.tooltipList}>
                <TooltipPoint
                  icon="people-outline"
                  text="Everyone contributes into their own balance inside the group — contributions are never pooled into one shared pot."
                />
                <TooltipPoint
                  icon="calendar-outline"
                  text={`Contributions follow an automatic ${vault.contributionFrequency === 'WEEKLY' ? 'weekly' : 'monthly'} plan (see the timeline below) — you'll get reminders as each date nears.`}
                />
                <TooltipPoint
                  icon="checkmark-done-outline"
                  text="A withdrawal only pays out once a strict majority of active members approve it."
                />
                <TooltipPoint
                  icon="cash-outline"
                  text="An approved withdrawal charges a 2% fee. Leaving the group early (before the maturity date) charges 5% instead — both only ever apply to your own balance, never anyone else's."
                />
              </View>
            </InfoTooltip>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* 1. Group Summary Card */}
          <LinearGradient
            colors={[colors.heroGradientStart, colors.heroGradientMid, colors.heroGradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.summaryCard}
          >
            <Text style={styles.summaryLabel}>Group Name</Text>
            <Text style={styles.summaryTitle}>{vault.name}</Text>
            <Text style={styles.summaryGoal}>{vault.goalName}</Text>

            <View style={styles.summaryDivider} />
            <View style={styles.summaryTopRow}>
              <View>
                <Text style={styles.summarySmallLabel}>Amount Saved</Text>
                <Text style={styles.summaryAmount}>{ghs(vault.amountSaved)}</Text>
              </View>
              <View style={styles.summaryRight}>
                <Text style={styles.summarySmallLabel}>Target Amount</Text>
                <Text style={styles.summaryTarget}>{ghs(vault.targetAmount)}</Text>
              </View>
            </View>

            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>Progress</Text>
              <Text style={styles.progressPct}>{progressPct}%</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
            </View>
          </LinearGradient>

          {/* Invite more members — admin-only, so membership growth stays
              under the creator's control rather than any member being able
              to circulate the join code. */}
          {vault.inviteCode && isAdmin ? (
            <View style={styles.inviteCard}>
              <View style={styles.inviteTextBlock}>
                <Text style={styles.inviteLabel}>Invite code</Text>
                <Text style={styles.inviteCode}>{vault.inviteCode}</Text>
              </View>
              <Pressable
                onPress={() =>
                  void Share.share({
                    message: `Join my EcoSpend group vault "${vault.name}" — use invite code ${vault.inviteCode} in the app to join.`,
                  })
                }
                style={({ pressed }) => [
                  styles.inviteShareBtn,
                  pressed && styles.inviteShareBtnPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Share invite code"
              >
                <Ionicons name="share-outline" size={16} color={colors.primary} />
                <Text style={styles.inviteShareText}>Share</Text>
              </Pressable>
            </View>
          ) : null}

          {/* 2. Members Section */}
          <SectionHeader title="Members" icon="people-outline" />
          <View style={styles.card}>
            {vault.members.map((member, index) => (
              <MemberRow
                key={member.id}
                member={member}
                contribution={memberContributionMap[member.id] ?? 0}
                planStatus={
                  vault.memberPlans?.find((plan) => plan.userId === member.id)
                    ?.status
                }
                isLast={index === vault.members.length - 1}
              />
            ))}
          </View>

          {/* My Instalments — which ones I've paid, ticked off at a glance */}
          {myPlan && myPlan.instalments.length > 0 ? (
            <>
              <SectionHeader
                title="My Instalments"
                icon="checkmark-done-circle-outline"
                right={
                  <InfoTooltip
                    title="My Instalments"
                    body="Each square is one instalment in your contribution plan. It ticks green once your balance in this vault reaches that instalment's running total — you can pay ahead, so ticks can jump forward as soon as you contribute enough."
                  />
                }
              />
              <View style={styles.card}>
                <InstalmentStrip instalments={myPlan.instalments} />
              </View>
            </>
          ) : null}

          {/* Quick links — real history and, for the admin, member management */}
          <View style={styles.quickLinksRow}>
            <QuickLinkRow
              icon="time-outline"
              label="Activity & History"
              onPress={() =>
                navigation.navigate('GroupVaultActivity', { groupVaultId: vault.id })
              }
              isLast={!isAdmin}
            />
            {isAdmin ? (
              <QuickLinkRow
                icon="people-circle-outline"
                label="Manage Members"
                onPress={() =>
                  navigation.navigate('GroupVaultMembers', { groupVaultId: vault.id })
                }
                isLast
              />
            ) : null}
          </View>

          {/* 3. Funding Progress — one value, shown honestly as a progress bar */}
          <SectionHeader title="Funding Progress" icon="stats-chart-outline" />
          <View style={styles.card}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>{progressPct}% funded</Text>
              <Text style={styles.chartMeta}>
                {daysRemaining > 0 ? `${daysRemaining} days left` : 'Matured'}
              </Text>
            </View>

            <View style={styles.fundTrack}>
              <View
                style={[styles.fundFill, { width: `${Math.min(Math.max(progressPct, 1), 100)}%` }]}
              />
            </View>

            <View style={styles.chartStatsRow}>
              <StatPill icon="wallet-outline" label="Saved" value={ghs(vault.amountSaved)} />
              <StatPill icon="flag-outline" label="Remaining" value={ghs(remainingAmount)} />
              <StatPill icon="calendar-outline" label="Matures" value={formatGroupVaultDate(vault.maturityDate)} />
            </View>
          </View>

          {/* 4. Approval Requests */}
          <SectionHeader
            title="Approval Requests"
            icon="hourglass-outline"
            right={
              <InfoTooltip
                title="Approval Requests"
                body="A withdrawal request needs approval from more than half of active members to execute. If enough members reject it — making a majority impossible — it's automatically rejected. Once approved, a fee is deducted (2% on time with target met, 4% on time but under target, 5% before the lock date) and the net amount is paid to the requester's wallet."
              />
            }
          />
          <View style={styles.card}>
            {pendingRequests.length === 0 ? (
              <Text style={styles.emptyText}>No active withdrawal approvals right now.</Text>
            ) : (
              pendingRequests.map((req, idx) => (
                <ApprovalRequestRow
                  key={req.id}
                  request={req}
                  isLast={idx === pendingRequests.length - 1}
                  onOpen={() =>
                    navigation.navigate('WithdrawalApproval', {
                      groupVaultId: req.groupVaultId,
                      requestId: req.id,
                    })
                  }
                />
              ))
            )}
          </View>

          {/* 5. Contribution Timeline */}
          <SectionHeader title="Contribution Timeline" icon="git-branch-outline" />
          <View style={styles.card}>
            {timeline.map((item, index) => (
              <TimelineItem
                key={item.id}
                item={item}
                isLast={index === timeline.length - 1}
              />
            ))}
          </View>

          {/* 6. Actions */}
          <SectionHeader title="Actions" icon="flash-outline" />
          <View style={styles.actionRow}>
            <View style={styles.actionBtn}>
              <AppButton
                title="Contribute Funds"
                variant="outline"
                icon="add-circle-outline"
                onPress={() =>
                  navigateApp('ContributeGroup', { groupVaultId: vault.id })
                }
              />
            </View>
            <View style={styles.actionSpacer} />
            <View style={styles.actionBtn}>
              <AppButton
                title="Request Withdrawal"
                icon="cash-outline"
                onPress={() =>
                  navigateApp('RequestGroupWithdrawal', { groupVaultId: vault.id })
                }
              />
            </View>
          </View>
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

function TooltipPoint({
  icon,
  text,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}) {
  const pointStyles = useThemedStyles(createTooltipPointStyles);
  const { colors } = useTheme();
  return (
    <View style={pointStyles.row}>
      <Ionicons name={icon} size={16} color={colors.primary} style={pointStyles.icon} />
      <Text style={pointStyles.text}>{text}</Text>
    </View>
  );
}

const createTooltipPointStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    row: {
      alignItems: 'flex-start',
      flexDirection: 'row',
      marginBottom: spacing.md,
    },
    icon: {
      marginRight: spacing.sm,
      marginTop: 2,
    },
    text: {
      color: colors.textSecondary,
      flex: 1,
      fontSize: fontSize.sm,
      lineHeight: 20,
    },
  });

function MemberRow({
  member,
  contribution,
  planStatus,
  isLast,
}: {
  member: GroupVaultMember;
  contribution: number;
  planStatus?: MemberPlanState;
  isLast: boolean;
}) {
  const memberStyles = useThemedStyles(createMemberStyles);
  const { colors } = useTheme();
  const isAdmin = member.role === 'admin';

  // Plan status beats the generic role pill: members care whether
  // everyone is keeping up with the contribution schedule.
  const statusLabel =
    planStatus === 'COMPLETED'
      ? 'Completed'
      : planStatus === 'BEHIND'
        ? 'Behind'
        : planStatus === 'ON_TRACK'
          ? 'On track'
          : isAdmin
            ? 'Lead'
            : 'Active';
  const statusColor =
    planStatus === 'COMPLETED'
      ? colors.success
      : planStatus === 'BEHIND'
        ? colors.warning
        : colors.primary;

  return (
    <View style={[memberStyles.row, isLast && memberStyles.rowLast]}>
      <View style={[memberStyles.avatar, isAdmin && memberStyles.avatarAdmin]}>
        <Text style={memberStyles.avatarText}>{member.initials}</Text>
      </View>
      <View style={memberStyles.info}>
        <Text style={memberStyles.name}>{member.name}</Text>
        <Text style={memberStyles.sub}>
          {isAdmin ? 'Admin' : 'Member'} • Last: {member.lastContribution ? formatGroupVaultDate(member.lastContribution) : '—'}
        </Text>
      </View>
      <View style={memberStyles.right}>
        <Text style={memberStyles.amount}>{ghs(contribution)}</Text>
        <View style={[memberStyles.statusPill, { backgroundColor: `${statusColor}1A` }]}>
          <Text style={[memberStyles.statusText, { color: statusColor }]}>
            {statusLabel}
          </Text>
        </View>
      </View>
    </View>
  );
}

function StatPill({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  const statStyles = useThemedStyles(createStatStyles);
  const { colors } = useTheme();
  return (
    <View style={statStyles.pill}>
      <Ionicons name={icon} size={13} color={colors.textMuted} />
      <Text style={statStyles.label}>{label}</Text>
      <Text style={statStyles.value}>{value}</Text>
    </View>
  );
}

function ApprovalRequestRow({
  request,
  isLast,
  onOpen,
}: {
  request: WithdrawalRequest;
  isLast: boolean;
  onOpen: () => void;
}) {
  const approvalStyles = useThemedStyles(createApprovalStyles);
  const pct = Math.min(100, Math.round((request.votesFor / request.requiredVotes) * 100));
  return (
    <Pressable
      onPress={onOpen}
      style={({ pressed }) => [
        approvalStyles.row,
        isLast && approvalStyles.rowLast,
        pressed && approvalStyles.rowPressed,
      ]}
    >
      <View style={approvalStyles.headRow}>
        <Text style={approvalStyles.amount}>{ghs(request.amount)}</Text>
        <Text style={approvalStyles.date}>{formatGroupVaultDate(request.requestedDate)}</Text>
      </View>
      <Text style={approvalStyles.reason} numberOfLines={2}>{request.reason}</Text>
      <View style={approvalStyles.metaRow}>
        <Text style={approvalStyles.votes}>
          {request.votesFor}/{request.requiredVotes} approvals
        </Text>
        <Text style={approvalStyles.requester}>{request.requestedBy.name}</Text>
      </View>
      <View style={approvalStyles.track}>
        <View style={[approvalStyles.fill, { width: `${pct}%` }]} />
      </View>
    </Pressable>
  );
}

function TimelineItem({
  item,
  isLast,
}: {
  item: GroupContributionTimelineItem;
  isLast: boolean;
}) {
  const timelineStyles = useThemedStyles(createTimelineStyles);
  const { colors } = useTheme();
  const icon: keyof typeof Ionicons.glyphMap =
    item.kind === 'created'
      ? 'flag-outline'
      : item.kind === 'past'
        ? 'checkmark-circle-outline'
        : item.kind === 'next'
          ? 'notifications-outline'
          : 'time-outline';
  const tone =
    item.kind === 'created'
      ? colors.warning
      : item.kind === 'past'
        ? colors.success
        : item.kind === 'next'
          ? colors.primary
          : colors.blue;

  return (
    <View style={timelineStyles.row}>
      <View style={timelineStyles.leftCol}>
        <View style={[timelineStyles.dot, { backgroundColor: `${tone}22` }]}>
          <Ionicons name={icon} size={13} color={tone} />
        </View>
        {!isLast ? <View style={timelineStyles.line} /> : null}
      </View>
      <View style={timelineStyles.content}>
        <View style={timelineStyles.top}>
          <Text style={timelineStyles.name}>{item.title}</Text>
          <Text style={timelineStyles.date}>{formatGroupVaultDate(item.date)}</Text>
        </View>
        {item.note ? <Text style={timelineStyles.note}>{item.note}</Text> : null}
      </View>
    </View>
  );
}

function InstalmentStrip({ instalments }: { instalments: MemberInstalment[] }) {
  const stripStyles = useThemedStyles(createInstalmentStripStyles);
  const { colors } = useTheme();
  const paidCount = instalments.filter((item) => item.paid).length;

  return (
    <View>
      <Text style={stripStyles.summary}>
        {paidCount} of {instalments.length} completed
      </Text>
      <View style={stripStyles.grid}>
        {instalments.map((item) => (
          <View
            key={item.index}
            style={[stripStyles.slot, item.paid && stripStyles.slotPaid]}
          >
            {item.paid ? (
              <Ionicons name="checkmark" size={14} color={colors.white} />
            ) : (
              <Text style={stripStyles.slotIndex}>{item.index}</Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

function QuickLinkRow({
  icon,
  label,
  onPress,
  isLast,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  isLast?: boolean;
}) {
  const rowStyles = useThemedStyles(createQuickLinkStyles);
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        rowStyles.row,
        !isLast && rowStyles.rowBorder,
        pressed && rowStyles.rowPressed,
      ]}
    >
      <Ionicons name={icon} size={18} color={colors.primary} />
      <Text style={rowStyles.label}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
    </Pressable>
  );
}

const createInstalmentStripStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    summary: {
      color: colors.textDark,
      fontSize: fontSize.sm,
      fontWeight: fontWeight.semibold,
      marginBottom: spacing.sm,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
    },
    slot: {
      alignItems: 'center',
      backgroundColor: colors.chipBg,
      borderRadius: radius.md,
      height: 28,
      justifyContent: 'center',
      width: 28,
    },
    slotPaid: {
      backgroundColor: colors.success,
    },
    slotIndex: {
      color: colors.textMuted,
      fontSize: 10,
      fontWeight: fontWeight.semibold,
    },
  });

const createQuickLinkStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    row: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
    },
    rowBorder: {
      borderBottomColor: colors.divider,
      borderBottomWidth: 1,
    },
    rowPressed: {
      opacity: 0.85,
    },
    label: {
      color: colors.textDark,
      flex: 1,
      fontSize: fontSize.sm,
      fontWeight: fontWeight.semibold,
    },
  });

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
    height: 36,
    justifyContent: 'center',
    marginRight: spacing.sm,
    width: 36,
  },
  avatarAdmin: {
    backgroundColor: colors.primaryDark,
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
  sub: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
  right: {
    alignItems: 'flex-end',
  },
  amount: {
    color: colors.textDark,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
  },
  statusPill: {
    backgroundColor: colors.successLight,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  statusPillAdmin: {
    backgroundColor: colors.primaryBackground,
  },
  statusText: {
    color: colors.success,
    fontSize: 10,
    fontWeight: fontWeight.bold,
  },
  statusTextAdmin: {
    color: colors.primary,
  },
});

const createStatStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  pill: {
    alignItems: 'center',
    backgroundColor: colors.chipBg,
    borderRadius: radius.md,
    flex: 1,
    marginRight: spacing.sm,
    paddingVertical: spacing.sm,
  },
  label: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  value: {
    color: colors.textDark,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    marginTop: 2,
    textAlign: 'center',
  },
});

const createApprovalStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  row: {
    backgroundColor: colors.warningLight,
    borderColor: `${colors.warning}33`,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
    padding: spacing.sm,
  },
  rowLast: {
    marginBottom: 0,
  },
  rowPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.995 }],
  },
  headRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  amount: {
    color: colors.textDark,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  date: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
  reason: {
    color: colors.textGrey,
    fontSize: fontSize.xs,
    lineHeight: 18,
    marginBottom: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  votes: {
    color: colors.warning,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  requester: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
  track: {
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: radius.full,
    height: 6,
    overflow: 'hidden',
  },
  fill: {
    backgroundColor: colors.warning,
    borderRadius: radius.full,
    height: 6,
  },
});

const createTimelineStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  row: {
    flexDirection: 'row',
    minHeight: 52,
  },
  leftCol: {
    alignItems: 'center',
    marginRight: spacing.sm,
    width: 28,
  },
  dot: {
    alignItems: 'center',
    borderRadius: radius.full,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  line: {
    backgroundColor: colors.divider,
    flex: 1,
    marginVertical: 2,
    width: 2,
  },
  content: {
    borderBottomColor: colors.divider,
    borderBottomWidth: 1,
    flex: 1,
    paddingBottom: spacing.sm,
    paddingTop: 2,
  },
  top: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  name: {
    color: colors.textDark,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  date: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
  note: {
    color: colors.textGrey,
    fontSize: fontSize.xs,
    marginBottom: spacing.xs,
  },
  amount: {
    color: colors.primary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
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
  headerAction: {
    alignItems: 'center',
    backgroundColor: colors.primaryBackground,
    borderRadius: radius.full,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  summaryCard: {
    borderRadius: radius.heroCard,
    marginBottom: spacing.sm,
    overflow: 'hidden',
    padding: spacing.lg,
    ...shadowMd,
  },
  tooltipList: {
    paddingTop: spacing.xs,
  },
  inviteCard: {
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderColor: colors.cardBorder,
    borderRadius: radius.card,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: spacing.sm,
    padding: spacing.md,
    ...shadowSm,
  },
  inviteTextBlock: {
    flex: 1,
  },
  inviteLabel: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  inviteCode: {
    color: colors.textDark,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    letterSpacing: 2,
  },
  inviteShareBtn: {
    alignItems: 'center',
    backgroundColor: colors.primaryBackground,
    borderRadius: radius.full,
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  inviteShareBtnPressed: {
    opacity: 0.85,
  },
  inviteShareText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    marginLeft: spacing.xs,
  },
  summaryGlow: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radius.full,
    height: 110,
    position: 'absolute',
    right: -20,
    top: -20,
    width: 110,
  },
  summaryLabel: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: fontSize.xs,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  summaryTitle: {
    color: colors.white,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
  },
  summaryGoal: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  summaryDivider: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    height: 1,
    marginVertical: spacing.md,
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  summaryRight: {
    alignItems: 'flex-end',
  },
  summarySmallLabel: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: fontSize.xs,
    marginBottom: spacing.xs,
  },
  summaryAmount: {
    color: colors.white,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  summaryTarget: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  progressRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  progressLabel: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: fontSize.xs,
  },
  progressPct: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  progressTrack: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: radius.full,
    height: 8,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: colors.white,
    borderRadius: radius.full,
    height: 8,
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderColor: colors.cardBorder,
    borderRadius: radius.card,
    borderWidth: 1,
    padding: spacing.md,
    ...shadowSm,
  },
  quickLinksRow: {
    backgroundColor: colors.cardBackground,
    borderColor: colors.cardBorder,
    borderRadius: radius.card,
    borderWidth: 1,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
    overflow: 'hidden',
    ...shadowSm,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  chartTitle: {
    color: colors.textDark,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  chartMeta: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
  chartArea: {
    flexDirection: 'row',
    height: 160,
    marginBottom: spacing.md,
  },
  chartYLabels: {
    justifyContent: 'space-between',
    paddingRight: spacing.sm,
  },
  chartYText: {
    color: colors.textLight,
    fontSize: 10,
  },
  chartCanvas: {
    backgroundColor: colors.chipBg,
    borderRadius: radius.md,
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  chartGrid: {
    backgroundColor: 'rgba(0,0,0,0.06)',
    height: 1,
    left: 0,
    position: 'absolute',
    top: '25%',
    width: '100%',
  },
  chartGridMid: {
    backgroundColor: 'rgba(0,0,0,0.06)',
    height: 1,
    left: 0,
    position: 'absolute',
    top: '50%',
    width: '100%',
  },
  chartGridLow: {
    backgroundColor: 'rgba(0,0,0,0.06)',
    height: 1,
    left: 0,
    position: 'absolute',
    top: '75%',
    width: '100%',
  },
  chartLineContainer: {
    alignItems: 'center',
    bottom: 0,
    height: '100%',
    justifyContent: 'flex-end',
    left: '45%',
    position: 'absolute',
    width: 32,
  },
  chartLineBar: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    bottom: 0,
    position: 'absolute',
    width: 8,
  },
  chartDot: {
    backgroundColor: colors.cardBackground,
    borderColor: colors.primary,
    borderRadius: radius.full,
    borderWidth: 2,
    height: 12,
    position: 'absolute',
    width: 12,
  },
  fundTrack: {
    backgroundColor: colors.divider,
    borderRadius: radius.full,
    height: 10,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  fundFill: {
    backgroundColor: colors.chart1,
    borderRadius: radius.full,
    height: '100%',
  },
  chartStatsRow: {
    flexDirection: 'row',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    textAlign: 'center',
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
  bottomSpacer: {
    height: spacing.lg,
  },
});
