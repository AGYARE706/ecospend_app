import { useCallback } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import AskCoachFab from '../../components/dashboard/AskCoachFab';
import DashboardAnalyticsCard from '../../components/dashboard/DashboardAnalyticsCard';
import DashboardInsightTeaser from '../../components/dashboard/DashboardInsightTeaser';
import InsightOfTheDayCard from '../../components/dashboard/InsightOfTheDayCard';
import LearnTeaserCard from '../../components/dashboard/LearnTeaserCard';
import FadeSlideIn from '../../components/ui/FadeSlideIn';
import { Icon } from '../../components/ui/icons';
import BalanceCard from '../../components/finance/BalanceCard';
import BudgetEnvelopeCard from '../../components/finance/BudgetEnvelopeCard';
import QuickActionRow from '../../components/finance/QuickActionRow';
import TransactionListItem from '../../components/finance/TransactionListItem';
import EmptyState from '../../components/ui/EmptyState';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import SectionHeader from '../../components/ui/SectionHeader';
import SkeletonBox from '../../components/ui/SkeletonBox';
import { useDashboard } from '../../hooks/useDashboard';
import { useInsightOfTheDay } from '../../hooks/useInsightOfTheDay';
import { useLearnStreak } from '../../hooks/useLearnStreak';
import {
  navigateApp,
  navigateToLearn,
  navigateToTabScreen,
} from '../../navigation/navigationRef';
import {
  cardShadow,
  radius,
  spacing,
  typography,
  useTheme,
  useThemedStyles,
} from '../../theme';
import type { ThemeColors } from '../../theme';

const LOGO_ASPECT_RATIO = 531 / 484;
const LOGO_HEIGHT = 50;

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

/** Sun during the day, moon once it's evening — mirrors getGreeting's own boundary. */
function getGreetingIcon(date = new Date()): 'sun' | 'moon' {
  return date.getHours() < 16 ? 'sun' : 'moon';
}

export default function DashboardScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
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

  const { insight, refresh: refreshInsight } = useInsightOfTheDay();
  const { streak, refresh: refreshStreak } = useLearnStreak();

  useFocusEffect(
    useCallback(() => {
      void refresh();
      void refreshInsight();
      void refreshStreak();
    }, [refresh, refreshInsight, refreshStreak]),
  );

  return (
    <ScreenWrapper background="page" padded={false} edges={[]}>
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
            <View style={styles.headerText}>
              <View style={styles.greetingRow}>
                <Icon
                  name={getGreetingIcon()}
                  size={16}
                  color={getGreetingIcon() === 'sun' ? colors.gold : colors.blue}
                  strokeWidth={2}
                />
                <Text style={styles.greeting}>{`${getGreeting()},`}</Text>
              </View>
              <Text style={styles.userName} numberOfLines={1}>
                {userName}
              </Text>
              <Text style={styles.dateLabel}>{todayLabel}</Text>
            </View>
            <Image
              source={require('../../../assets/logo.png')}
              style={styles.headerLogo}
              resizeMode="contain"
              accessibilityLabel="EcoSpend"
            />
          </View>

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
              onGoalsPress={() => navigateToTabScreen('GoalsTab', 'SavingsGoals')}
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
                navigateToTabScreen('TransactionsTab', 'TransactionsList')
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
                      navigateToTabScreen('TransactionsTab', 'TransactionDetails', {
                        transactionId: transaction.id,
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

          {insight ? (
            <FadeSlideIn delay={420}>
              <InsightOfTheDayCard insight={insight} onPress={() => navigateApp('AskCoach')} />
            </FadeSlideIn>
          ) : null}

          <FadeSlideIn delay={490}>
            <LearnTeaserCard currentStreak={streak.currentStreak} onPress={navigateToLearn} />
          </FadeSlideIn>
        </ScrollView>
      )}

      <AskCoachFab onPress={() => navigateApp('AskCoach')} />
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
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.mlg,
  },
  headerText: {
    flex: 1,
  },
  headerLogo: {
    height: LOGO_HEIGHT,
    marginLeft: spacing.md,
    width: LOGO_HEIGHT * LOGO_ASPECT_RATIO,
  },
  greetingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: 2,
  },
  greeting: {
    ...typography.body,
    color: colors.textMuted,
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
