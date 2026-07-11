import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  CompositeNavigationProp,
  useNavigation,
} from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';

import DashboardAnalyticsCard from '../../components/dashboard/DashboardAnalyticsCard';
import DashboardInsightTeaser from '../../components/dashboard/DashboardInsightTeaser';
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
  spacing,
  typography,
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
    analytics,
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
          <SkeletonBox height={280} style={styles.skeletonGap} />
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

          <DashboardAnalyticsCard analytics={analytics} />

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

          <DashboardInsightTeaser
            insight={weeklyInsight}
            onPress={() => navigateApp('WeeklyInsights')}
          />
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
});
