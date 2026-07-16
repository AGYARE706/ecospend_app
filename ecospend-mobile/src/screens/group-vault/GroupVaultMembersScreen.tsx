import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import { useVaults } from '../../context/VaultContext';
import { formatGroupVaultDate } from '../../hooks/useGroupVaultDetails';
import type { VaultStackParamList } from '../../navigation/types';
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
import type { GroupVaultInvite, GroupVaultMember, MemberPlanStatus } from '../../types/groupVault';

type MembersRouteProp = RouteProp<VaultStackParamList, 'GroupVaultMembers'>;
type MembersNavProp = StackNavigationProp<VaultStackParamList, 'GroupVaultMembers'>;

export default function GroupVaultMembersScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { params } = useRoute<MembersRouteProp>();
  const navigation = useNavigation<MembersNavProp>();
  const { getGroupVaultById } = useVaults();
  const vault = getGroupVaultById(params.groupVaultId);

  const invites = vault?.invites ?? [];
  const members = vault?.members ?? [];
  const plansByUserId: Record<string, MemberPlanStatus> = {};
  for (const plan of vault?.memberPlans ?? []) {
    plansByUserId[plan.userId] = plan;
  }

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
            <Text style={styles.headerTitle}>Manage Members</Text>
            <Text style={styles.headerSub}>{vault?.name ?? ''}</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <SectionLabel text="Invited by phone" />
          {invites.length === 0 ? (
            <View style={styles.card}>
              <Text style={styles.emptyText}>
                No pending invites. You can invite by phone number when creating a group vault.
              </Text>
            </View>
          ) : (
            <View style={styles.card}>
              {invites.map((invite, index) => (
                <InviteRow key={invite.id} invite={invite} isLast={index === invites.length - 1} />
              ))}
            </View>
          )}

          <SectionLabel text="Members & instalment progress" />
          {members.length === 0 ? (
            <EmptyState icon="people-outline" title="No members yet" subtitle="" />
          ) : (
            <View style={styles.card}>
              {members.map((member, index) => (
                <MemberProgressRow
                  key={member.id}
                  member={member}
                  plan={plansByUserId[member.id]}
                  isLast={index === members.length - 1}
                />
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
}

function SectionLabel({ text }: { text: string }) {
  const styles = useThemedStyles(createSectionStyles);
  return <Text style={styles.label}>{text}</Text>;
}

function InviteRow({ invite, isLast }: { invite: GroupVaultInvite; isLast: boolean }) {
  const rowStyles = useThemedStyles(createInviteRowStyles);
  return (
    <View style={[rowStyles.row, isLast && rowStyles.rowLast]}>
      <View style={rowStyles.iconRing}>
        <Ionicons name="call-outline" size={15} color="#6B7280" />
      </View>
      <View style={rowStyles.info}>
        <Text style={rowStyles.phone}>{invite.phoneNumber}</Text>
        <Text style={rowStyles.date}>
          Invited {formatGroupVaultDate(invite.createdAt.slice(0, 10))}
        </Text>
      </View>
      {invite.status === 'JOINED' ? (
        <Badge label="Joined" tone="success" icon="check-circle" size="sm" />
      ) : (
        <Badge label="Pending" tone="warning" icon="time-outline" size="sm" />
      )}
    </View>
  );
}

function MemberProgressRow({
  member,
  plan,
  isLast,
}: {
  member: GroupVaultMember;
  plan?: MemberPlanStatus;
  isLast: boolean;
}) {
  const rowStyles = useThemedStyles(createInviteRowStyles);
  const isAdmin = member.role === 'admin';
  const paidCount = plan?.instalments.filter((i) => i.paid).length ?? 0;
  const totalCount = plan?.instalments.length ?? 0;

  const tone = plan?.status === 'COMPLETED' ? 'success' : plan?.status === 'BEHIND' ? 'warning' : 'primary';
  const label =
    plan?.status === 'COMPLETED' ? 'Completed' : plan?.status === 'BEHIND' ? 'Behind' : 'On track';

  return (
    <View style={[rowStyles.row, isLast && rowStyles.rowLast]}>
      <View style={[rowStyles.avatar, isAdmin && rowStyles.avatarAdmin]}>
        <Text style={rowStyles.avatarText}>{member.initials}</Text>
      </View>
      <View style={rowStyles.info}>
        <Text style={rowStyles.phone}>
          {member.name} {isAdmin ? '· Admin' : ''}
        </Text>
        <Text style={rowStyles.date}>
          {totalCount > 0 ? `${paidCount}/${totalCount} instalments paid` : 'No plan yet'}
        </Text>
      </View>
      {plan ? <Badge label={label} tone={tone} size="sm" /> : null}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    screen: { flex: 1 },
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
    backBtnPressed: { backgroundColor: colors.chipBg },
    headerCenter: { alignItems: 'center', flex: 1 },
    headerTitle: { color: colors.textDark, fontSize: fontSize.lg, fontWeight: fontWeight.bold },
    headerSub: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: 2 },
    headerSpacer: { width: 40 },
    scrollContent: {
      paddingBottom: spacing.xs,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
    },
    card: {
      backgroundColor: colors.cardBackground,
      borderColor: colors.cardBorder,
      borderRadius: radius.card,
      borderWidth: 1,
      marginBottom: spacing.lg,
      padding: spacing.md,
      ...shadowSm,
    },
    emptyText: {
      color: colors.textMuted,
      fontSize: fontSize.sm,
    },
  });

const createSectionStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    label: {
      color: colors.textDark,
      fontSize: fontSize.xs,
      fontWeight: fontWeight.bold,
      letterSpacing: 0.5,
      marginBottom: spacing.sm,
      textTransform: 'uppercase',
    },
  });

const createInviteRowStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    row: {
      alignItems: 'center',
      borderBottomColor: colors.divider,
      borderBottomWidth: 1,
      flexDirection: 'row',
      paddingVertical: spacing.sm,
    },
    rowLast: { borderBottomWidth: 0, paddingBottom: 0 },
    iconRing: {
      alignItems: 'center',
      backgroundColor: colors.chipBg,
      borderRadius: radius.full,
      height: 36,
      justifyContent: 'center',
      marginRight: spacing.sm,
      width: 36,
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
    avatarAdmin: { backgroundColor: colors.primaryDark },
    avatarText: { color: colors.white, fontSize: fontSize.xs, fontWeight: fontWeight.bold },
    info: { flex: 1 },
    phone: {
      color: colors.textDark,
      fontSize: fontSize.sm,
      fontWeight: fontWeight.semibold,
      marginBottom: 2,
    },
    date: { color: colors.textMuted, fontSize: fontSize.xs },
  });
