import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

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
import type { GroupVaultActivityEntry, GroupVaultActivityType } from '../../types/groupVault';

type ActivityRouteProp = RouteProp<VaultStackParamList, 'GroupVaultActivity'>;
type ActivityNavProp = StackNavigationProp<VaultStackParamList, 'GroupVaultActivity'>;

function ghs(amount: number): string {
  return `GH₵ ${new Intl.NumberFormat('en-GH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)}`;
}

const VISUALS: Record<
  GroupVaultActivityType,
  { icon: keyof typeof Ionicons.glyphMap; tone: 'primary' | 'success' | 'warning' | 'error' | 'blue' | 'muted' }
> = {
  CREATED: { icon: 'flag-outline', tone: 'warning' },
  MEMBER_INVITED: { icon: 'mail-outline', tone: 'blue' },
  MEMBER_JOINED: { icon: 'person-add-outline', tone: 'primary' },
  CONTRIBUTION: { icon: 'cash-outline', tone: 'success' },
  WITHDRAWAL_REQUESTED: { icon: 'hourglass-outline', tone: 'warning' },
  WITHDRAWAL_VOTE: { icon: 'checkmark-done-outline', tone: 'blue' },
  WITHDRAWAL_APPROVED: { icon: 'checkmark-circle-outline', tone: 'success' },
  WITHDRAWAL_REJECTED: { icon: 'close-circle-outline', tone: 'error' },
  WITHDRAWAL_EXECUTED: { icon: 'cash-outline', tone: 'success' },
  MEMBER_EXITED: { icon: 'exit-outline', tone: 'muted' },
};

function toneColor(colors: ThemeColors, tone: string): string {
  switch (tone) {
    case 'success':
      return colors.success;
    case 'warning':
      return colors.warning;
    case 'error':
      return colors.error;
    case 'blue':
      return colors.blue;
    case 'muted':
      return colors.textMuted;
    default:
      return colors.primary;
  }
}

export default function GroupVaultActivityScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { params } = useRoute<ActivityRouteProp>();
  const navigation = useNavigation<ActivityNavProp>();
  const { getGroupVaultById } = useVaults();
  const vault = getGroupVaultById(params.groupVaultId);
  const activity = vault?.activity ?? [];

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
            <Text style={styles.headerTitle}>Activity & History</Text>
            <Text style={styles.headerSub}>{vault?.name ?? ''}</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {activity.length === 0 ? (
            <EmptyState
              icon="time-outline"
              title="No activity yet"
              subtitle="Every join, contribution and withdrawal step in this vault will show up here, visible to all members."
            />
          ) : (
            <View style={styles.card}>
              {activity.map((entry, index) => (
                <ActivityRow
                  key={entry.id}
                  entry={entry}
                  isLast={index === activity.length - 1}
                />
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
}

function ActivityRow({ entry, isLast }: { entry: GroupVaultActivityEntry; isLast: boolean }) {
  const rowStyles = useThemedStyles(createRowStyles);
  const { colors } = useTheme();
  const visual = VISUALS[entry.type] ?? { icon: 'ellipse-outline', tone: 'muted' };
  const tone = toneColor(colors, visual.tone);

  return (
    <View style={[rowStyles.row, isLast && rowStyles.rowLast]}>
      <View style={[rowStyles.iconRing, { backgroundColor: `${tone}1A` }]}>
        <Ionicons name={visual.icon} size={16} color={tone} />
      </View>
      <View style={rowStyles.content}>
        <Text style={rowStyles.message}>{entry.message}</Text>
        <View style={rowStyles.metaRow}>
          <Text style={rowStyles.date}>{formatGroupVaultDate(entry.createdAt.slice(0, 10))}</Text>
          {entry.amount ? <Text style={rowStyles.amount}>{ghs(entry.amount)}</Text> : null}
        </View>
      </View>
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
      padding: spacing.md,
      ...shadowSm,
    },
  });

const createRowStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    row: {
      borderBottomColor: colors.divider,
      borderBottomWidth: 1,
      flexDirection: 'row',
      paddingVertical: spacing.sm,
    },
    rowLast: { borderBottomWidth: 0, paddingBottom: 0 },
    iconRing: {
      alignItems: 'center',
      borderRadius: radius.full,
      height: 32,
      justifyContent: 'center',
      marginRight: spacing.sm,
      width: 32,
    },
    content: { flex: 1 },
    message: {
      color: colors.textDark,
      fontSize: fontSize.sm,
      fontWeight: fontWeight.semibold,
      marginBottom: 2,
    },
    metaRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    date: { color: colors.textMuted, fontSize: fontSize.xs },
    amount: { color: colors.primary, fontSize: fontSize.xs, fontWeight: fontWeight.bold },
  });
