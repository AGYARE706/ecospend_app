import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import AppButton from '../../components/ui/AppButton';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import {
  formatGroupVaultDate,
  useGroupVaultDetails,
  type GroupContributionTimelineItem,
} from '../../hooks/useGroupVaultDetails';
import type { VaultStackParamList } from '../../navigation/types';
import {
  colors,
  fontSize,
  fontWeight,
  radius,
  shadowMd,
  shadowSm,
  spacing,
} from '../../theme';
import type { GroupVaultMember, WithdrawalRequest } from '../../types/groupVault';

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

  return (
    <ScreenWrapper background="page" padded={false}>
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
            <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* 1. Group Summary Card */}
          <LinearGradient
            colors={['#1B5E20', '#2E7D32', '#0D9488']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.summaryCard}
          >
            <View style={styles.summaryGlow} />
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

          {/* 2. Members Section */}
          <SectionHeader title="Members" icon="people-outline" />
          <View style={styles.card}>
            {vault.members.map((member, index) => (
              <MemberRow
                key={member.id}
                member={member}
                contribution={memberContributionMap[member.id] ?? 0}
                isLast={index === vault.members.length - 1}
              />
            ))}
          </View>

          {/* 3. Progress Visualization */}
          <SectionHeader title="Progress Visualization" icon="stats-chart-outline" />
          <View style={styles.card}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Funding Path</Text>
              <Text style={styles.chartMeta}>
                {daysRemaining > 0 ? `${daysRemaining} days left` : 'Matured'}
              </Text>
            </View>

            <View style={styles.chartArea}>
              <View style={styles.chartYLabels}>
                <Text style={styles.chartYText}>100%</Text>
                <Text style={styles.chartYText}>75%</Text>
                <Text style={styles.chartYText}>50%</Text>
                <Text style={styles.chartYText}>25%</Text>
                <Text style={styles.chartYText}>0%</Text>
              </View>
              <View style={styles.chartCanvas}>
                <View style={styles.chartGrid} />
                <View style={styles.chartGridMid} />
                <View style={styles.chartGridLow} />
                <View style={styles.chartLineContainer}>
                  <View style={[styles.chartLineBar, { height: `${Math.max(8, progressPct)}%` }]} />
                  <View style={[styles.chartDot, { bottom: `${Math.max(8, progressPct)}%` }]} />
                </View>
              </View>
            </View>

            <View style={styles.chartStatsRow}>
              <StatPill icon="wallet-outline" label="Saved" value={ghs(vault.amountSaved)} />
              <StatPill icon="flag-outline" label="Remaining" value={ghs(remainingAmount)} />
              <StatPill icon="calendar-outline" label="Matures" value={formatGroupVaultDate(vault.maturityDate)} />
            </View>
          </View>

          {/* 4. Approval Requests */}
          <SectionHeader title="Approval Requests" icon="hourglass-outline" />
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
                onPress={() => navigation.navigate('GroupVaultDashboard')}
              />
            </View>
            <View style={styles.actionSpacer} />
            <View style={styles.actionBtn}>
              <AppButton
                title="Request Withdrawal"
                icon="cash-outline"
                onPress={() =>
                  navigation.navigate('WithdrawalApproval', {
                    groupVaultId: vault.id,
                    requestId: pendingRequests[0]?.id ?? 'new-request',
                  })
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
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={sectionStyles.row}>
      <Ionicons name={icon} size={15} color={colors.primary} />
      <Text style={sectionStyles.title}>{title}</Text>
    </View>
  );
}

function MemberRow({
  member,
  contribution,
  isLast,
}: {
  member: GroupVaultMember;
  contribution: number;
  isLast: boolean;
}) {
  const isAdmin = member.role === 'admin';
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
        <View style={[memberStyles.statusPill, isAdmin && memberStyles.statusPillAdmin]}>
          <Text style={[memberStyles.statusText, isAdmin && memberStyles.statusTextAdmin]}>
            {isAdmin ? 'Lead' : 'Active'}
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
  const icon =
    item.kind === 'created'
      ? 'flag-outline'
      : item.kind === 'milestone'
        ? 'sparkles-outline'
        : 'add-circle-outline';
  const tone =
    item.kind === 'milestone'
      ? colors.blue
      : item.kind === 'created'
        ? colors.warning
        : colors.primary;

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
          <Text style={timelineStyles.name}>{item.memberName}</Text>
          <Text style={timelineStyles.date}>{formatGroupVaultDate(item.date)}</Text>
        </View>
        {item.note ? <Text style={timelineStyles.note}>{item.note}</Text> : null}
        {item.amount > 0 ? (
          <Text style={timelineStyles.amount}>+ {ghs(item.amount)}</Text>
        ) : null}
      </View>
    </View>
  );
}

const sectionStyles = StyleSheet.create({
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

const memberStyles = StyleSheet.create({
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

const statStyles = StyleSheet.create({
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

const approvalStyles = StyleSheet.create({
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

const timelineStyles = StyleSheet.create({
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
    backgroundColor: colors.white,
    borderColor: colors.cardBorder,
    borderRadius: radius.card,
    borderWidth: 1,
    padding: spacing.md,
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
    backgroundColor: colors.white,
    borderColor: colors.primary,
    borderRadius: radius.full,
    borderWidth: 2,
    height: 12,
    position: 'absolute',
    width: 12,
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
