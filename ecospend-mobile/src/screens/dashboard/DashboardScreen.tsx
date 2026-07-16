import { useCallback } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  CompositeNavigationProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';

import DashboardAnalyticsCard from '../../components/dashboard/DashboardAnalyticsCard';
import DashboardInsightTeaser from '../../components/dashboard/DashboardInsightTeaser';
import { Icon } from '../../components/ui/icons';
import CollapsedHeaderBar from '../../components/ui/CollapsedHeaderBar';
import FadeSlideIn from '../../components/ui/FadeSlideIn';
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
import { useCollapsingHeader } from '../../hooks/useCollapsingHeader';
import { useDashboard } from '../../hooks/useDashboard';
import { useUnreadNotificationsCount } from '../../hooks/useUnreadNotificationsCount';
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
    refresh,
  } = useDashboard();

  const fullName = user?.name ?? mockUser.name;
  const unreadNotifications = useUnreadNotificationsCount();

  const tabNavigation = navigation.getParent<BottomTabNavigationProp<TabParamList>>();
  const { onScroll, scrollEventThrottle, heroStyle, barStyle } = useCollapsingHeader();

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  return (
    <ScreenWrapper background="page" padded={false} edges={['top']}>
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
        <>
          <CollapsedHeaderBar
            title="Dashboard"
            rightActions={
              <IconButton
                icon="bell"
                variant="soft"
                size="sm"
                onPress={() => navigateApp('Notifications')}
                accessibilityLabel="Notifications"
                badgeCount={unreadNotifications}
              />
            }
            style={barStyle}
          />
          <Animated.ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            onScroll={onScroll}
            scrollEventThrottle={scrollEventThrottle}
          >
          <Animated.View style={[styles.header, heroStyle]}>
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
                badgeCount={unreadNotifications}
              />
              <Pressable
                onPress={() =>
                  tabNavigation?.navigate('ProfileTab', { screen: 'Profile' })
                }
                accessibilityRole="button"
                accessibilityLabel="Open profile"
                hitSlop={spacing.xs}
              >
                <AvatarInitials name={fullName} photoUrl={user?.photoUrl} />
              </Pressable>
            </View>
          </Animated.View>

          <FadeSlideIn delay={0}>
            <BalanceCard
              balance={balance}
              income={income}
              expense={expense}
              onTopUpPress={() => navigateApp('TopUpWallet')}
              onSendPress={() => navigateApp('SendMoney')}
            />
          </FadeSlideIn>

          <FadeSlideIn delay={70}>
            <QuickActionRow
              onAddPress={() => navigateApp('TopUpWallet')}
              onGoalsPress={() =>
                tabNavigation?.navigate('GoalsTab', { screen: 'SavingsGoals' })
              }
              onTransferPress={() => navigateApp('SendMoney')}
              onMorePress={() => navigateApp('Bills')}
            />
          </FadeSlideIn>

          <FadeSlideIn delay={140}>
            <DashboardAnalyticsCard analytics={analytics} />
          </FadeSlideIn>

          <FadeSlideIn delay={210}>
            <SectionHeader
              title="Budget this month"
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
          </FadeSlideIn>

          <FadeSlideIn delay={280}>
            <SectionHeader
              title="Recent transactions"
              actionLabel="See all"
              onActionPress={() =>
                tabNavigation?.navigate('TransactionsTab', {
                  screen: 'TransactionsList',
                })
              }
            />

            {recentTransactions.length === 0 ? (
              <EmptyState
                icon="receipt"
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
                        initial: false,
                      })
                    }
                  />
                ))}
              </View>
            )}
          </FadeSlideIn>

          <FadeSlideIn delay={350}>
            <DashboardInsightTeaser
              insight={weeklyInsight}
              onPress={() => navigateApp('WeeklyInsights')}
            />
          </FadeSlideIn>
          </Animated.ScrollView>
        </>
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
    paddingBottom: spacing.xs,
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
    marginBottom: spacing.mlg,
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
    paddingBottom: spacing.md,
    paddingRight: spacing.lg,
  },
  transactionsCard: {
    backgroundColor: colors.cardBackground,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.mlg,
    overflow: 'hidden',
    ...cardShadow,
  },
});
