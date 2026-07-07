import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  CompositeNavigationProp,
  useNavigation,
} from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';

import { Icon } from '../../components/ui/icons';
import IconButton from '../../components/ui/IconButton';
import AvatarInitials from '../../components/finance/AvatarInitials';
import BalanceCard from '../../components/finance/BalanceCard';
import BudgetEnvelopeCard from '../../components/finance/BudgetEnvelopeCard';
import QuickActionRow from '../../components/finance/QuickActionRow';
import TransactionListItem from '../../components/finance/TransactionListItem';
import EmptyState from '../../components/ui/EmptyState';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import SectionHeader from '../../components/ui/SectionHeader';
import SkeletonBox from '../../components/ui/SkeletonBox';
import { useAuth } from '../../context/AuthContext';
import { mockUser } from '../../data/mock/mockData';
import { useDashboard } from '../../hooks/useDashboard';
import { navigateApp } from '../../navigation/navigationRef';
import type {
  DashboardStackParamList,
  TabParamList,
} from '../../navigation/types';
import {
  cardShadow,
  radius,
  shadowMd,
  spacing,
  typography,
  useTheme,
  useThemedStyles,
} from '../../theme';
import type { ThemeColors } from '../../theme';

type DashboardNavigationProp = CompositeNavigationProp<
  StackNavigationProp<DashboardStackParamList, 'Dashboard'>,
  BottomTabNavigationProp<TabParamList, 'DashboardTab'>
>;

function getGreeting(date = new Date()): string {
  const hour = date.getHours();

  if (hour < 12) {
    return 'Good Morning';
  }

  if (hour < 16) {
    return 'Good Afternoon';
  }

  return 'Good Evening';
}

export default function DashboardScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation<DashboardNavigationProp>();
  const { user } = useAuth();
  const {
    userName,
    todayLabel,
    balance,
    income,
    expense,
    recentTransactions,
    budgetEnvelopes,
    weeklyInsight,
    loading,
  } = useDashboard();

  const fullName = user?.name ?? mockUser.name;

  const tabNavigation = navigation.getParent<BottomTabNavigationProp<TabParamList>>();

  return (
    <ScreenWrapper background="page" padded={false}>
      {loading ? (
        <View style={styles.loadingContent}>
          <SkeletonBox height={28} width="70%" />
          <SkeletonBox height={16} width="50%" style={styles.skeletonGap} />
          <SkeletonBox height={180} style={styles.skeletonGap} />
          <SkeletonBox height={80} style={styles.skeletonGap} />
          <SkeletonBox height={120} style={styles.skeletonGap} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.headerTextBlock}>
              <Text style={styles.greeting}>{`${getGreeting()},`}</Text>
              <Text style={styles.userName} numberOfLines={1}>
                {userName}
              </Text>
              <Text style={styles.dateLabel}>{todayLabel}</Text>
            </View>

            <View style={styles.headerActions}>
              <IconButton
                icon="bell"
                variant="soft"
                onPress={() => navigateApp('Notifications')}
                accessibilityLabel="Notifications"
              />
              <AvatarInitials name={fullName} />
            </View>
          </View>

          <BalanceCard balance={balance} income={income} expense={expense} />

          <QuickActionRow
            onAddPress={() => navigateApp('AddTransaction')}
            onGoalsPress={() =>
              tabNavigation?.navigate('GoalsTab', { screen: 'SavingsGoals' })
            }
            onTransferPress={() => navigateApp('MoMoCalculator')}
          />

          <SectionHeader
            title="Budget This Month"
            icon="pie-chart-outline"
            actionLabel="See all"
            onActionPress={() => navigateApp('BudgetEnvelopes')}
          />

          <ScrollView
            horizontal
            nestedScrollEnabled
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.budgetScroll}
          >
            {budgetEnvelopes.map((envelope) => (
              <BudgetEnvelopeCard key={envelope.id} envelope={envelope} />
            ))}
          </ScrollView>

          <SectionHeader
            title="Recent Transactions"
            icon="receipt-outline"
            actionLabel="See all"
            onActionPress={() =>
              tabNavigation?.navigate('TransactionsTab', {
                screen: 'TransactionsList',
              })
            }
          />

          {recentTransactions.length === 0 ? (
            <EmptyState
              emoji="📭"
              title="No transactions yet"
              subtitle="Your recent activity will appear here."
            />
          ) : (
            <View style={styles.transactionsCard}>
              {recentTransactions.map((transaction, index) => (
                <TransactionListItem
                  key={transaction.id}
                  transaction={transaction}
                  variant="flat"
                  showDivider={index < recentTransactions.length - 1}
                  onPress={() =>
                    tabNavigation?.navigate('TransactionsTab', {
                      screen: 'TransactionDetails',
                      params: { transactionId: transaction.id },
                    })
                  }
                />
              ))}
            </View>
          )}

          <Pressable
            style={({ pressed }) => [styles.insightCard, pressed && styles.insightPressed]}
            onPress={() => navigateApp('WeeklyInsights')}
          >
            <LinearGradient
              colors={[colors.primaryBackground, colors.white]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.insightGradient}
            >
              <View style={styles.insightRow}>
                <View style={styles.insightIconCircle}>
                  <Icon name="bulb" size={22} color={colors.primary} />
                </View>
                <View style={styles.insightContent}>
                  <Text style={styles.insightEyebrow}>Weekly insight</Text>
                  <Text style={styles.insightHeading}>{weeklyInsight.heading}</Text>
                  <Text style={styles.insightMessage} numberOfLines={2}>
                    {weeklyInsight.message}
                  </Text>
                </View>
              </View>
              <View style={styles.insightFooter}>
                <Text style={styles.insightLink}>View full report</Text>
                <Icon name="arrow-right" size={16} color={colors.primary} strokeWidth={2.2} />
              </View>
            </LinearGradient>
          </Pressable>
        </ScrollView>
      )}
    </ScreenWrapper>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  loadingContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  skeletonGap: {
    marginTop: spacing.md,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  headerTextBlock: {
    flex: 1,
    marginRight: spacing.md,
  },
  greeting: {
    ...typography.bodySm,
    color: colors.textMuted,
    marginBottom: 2,
  },
  userName: {
    ...typography.h1,
    color: colors.textDark,
    marginBottom: spacing.xs,
  },
  dateLabel: {
    ...typography.bodySm,
    color: colors.textMuted,
  },
  headerActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  budgetScroll: {
    paddingBottom: spacing.sm,
    paddingRight: spacing.lg,
  },
  transactionsCard: {
    backgroundColor: colors.cardBackground,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    ...cardShadow,
  },
  insightCard: {
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    ...shadowMd,
  },
  insightPressed: {
    opacity: 0.95,
    transform: [{ scale: 0.99 }],
  },
  insightGradient: {
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
  },
  insightRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  insightIconCircle: {
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: radius.full,
    height: 48,
    justifyContent: 'center',
    marginRight: spacing.md,
    width: 48,
    ...cardShadow,
  },
  insightContent: {
    flex: 1,
  },
  insightEyebrow: {
    ...typography.overline,
    color: colors.primary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  insightHeading: {
    ...typography.subheading,
    color: colors.textDark,
    marginBottom: spacing.xs,
  },
  insightMessage: {
    ...typography.bodySm,
    color: colors.textMuted,
  },
  insightFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'flex-end',
  },
  insightLink: {
    ...typography.label,
    color: colors.primary,
  },
});
