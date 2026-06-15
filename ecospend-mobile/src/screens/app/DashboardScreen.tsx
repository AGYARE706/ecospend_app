import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';

import AvatarInitials from '../../components/finance/AvatarInitials';
import BalanceCard from '../../components/finance/BalanceCard';
import BudgetEnvelopeCard from '../../components/finance/BudgetEnvelopeCard';
import QuickActionRow from '../../components/finance/QuickActionRow';
import TransactionListItem from '../../components/finance/TransactionListItem';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import ScreenHeader from '../../components/ui/ScreenHeader';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import SectionHeader from '../../components/ui/SectionHeader';
import SkeletonBox from '../../components/ui/SkeletonBox';
import { useDashboard } from '../../hooks/useDashboard';
import type { AppStackParamList, AppTabParamList } from '../../navigation/types';
import { cardShadow, colors, fontSize, fontWeight, radius, spacing } from '../../theme';
import { mockUser } from '../../data/mock/mockData';
import { useAuth } from '../../context/AuthContext';

type DashboardNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<AppTabParamList, 'Dashboard'>,
  StackNavigationProp<AppStackParamList>
>;

export default function DashboardScreen() {
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

  const openAddTransaction = () => {
    navigation.getParent()?.navigate('AddTransaction');
  };

  return (
    <ScreenWrapper background="page" scrollable>
      {loading ? (
        <View style={styles.section}>
          <SkeletonBox height={28} width="70%" />
          <SkeletonBox height={16} width="50%" style={styles.skeletonGap} />
          <SkeletonBox height={180} style={styles.skeletonGap} />
          <SkeletonBox height={80} style={styles.skeletonGap} />
          <SkeletonBox height={120} style={styles.skeletonGap} />
        </View>
      ) : (
        <>
          <ScreenHeader
            title={`Good morning, ${userName}`}
            subtitle={todayLabel}
            right={<AvatarInitials name={fullName} />}
          />

          <BalanceCard balance={balance} income={income} expense={expense} />

          <QuickActionRow
            onAddPress={openAddTransaction}
            onGoalsPress={() => navigation.navigate('Goals')}
          />

          <SectionHeader
            title="Budget This Month"
            actionLabel="See all"
            onActionPress={() => navigation.navigate('Budget')}
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.budgetScroll}
          >
            {budgetEnvelopes.map((envelope) => (
              <BudgetEnvelopeCard key={envelope.id} envelope={envelope} />
            ))}
          </ScrollView>

          <SectionHeader
            title="Recent Transactions"
            actionLabel="See all"
            onActionPress={() => navigation.navigate('Transactions')}
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
                  onPress={() => navigation.navigate('Transactions')}
                />
              ))}
            </View>
          )}

          <Card variant="insight" style={styles.insightCard}>
            <View style={styles.insightRow}>
              <View style={styles.insightIconCircle}>
                <Text style={styles.insightEmoji}>💡</Text>
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightHeading}>{weeklyInsight.heading}</Text>
                <Text style={styles.insightMessage}>{weeklyInsight.message}</Text>
              </View>
            </View>
            <Text style={styles.insightLink}>View full report</Text>
          </Card>
        </>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.lg,
  },
  skeletonGap: {
    marginTop: spacing.md,
  },
  budgetScroll: {
    paddingBottom: spacing.sm,
    paddingRight: spacing.lg,
  },
  transactionsCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    ...cardShadow,
  },
  insightCard: {
    marginBottom: spacing.lg,
  },
  insightRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  insightIconCircle: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.full,
    height: 44,
    justifyContent: 'center',
    marginRight: spacing.md,
    width: 44,
  },
  insightEmoji: {
    fontSize: fontSize.xl,
  },
  insightContent: {
    flex: 1,
  },
  insightHeading: {
    color: colors.textDark,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
  },
  insightMessage: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  insightLink: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    textAlign: 'right',
  },
});
