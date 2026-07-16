import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import SpendingTrendChart from '../insights/SpendingTrendChart';
import { Icon } from '../ui/icons';
import GhsText from '../ui/GhsText';
import Card from '../ui/Card';
import InfoTooltip from '../ui/InfoTooltip';
import { useFinance } from '../../context/FinanceContext';
import {
  fontSize,
  fontWeight,
  radius,
  spacing,
  typography,
  useTheme,
  useThemedStyles,
} from '../../theme';
import type { ThemeColors } from '../../theme';
import type { DashboardAnalytics } from '../../types';
import CategoryBreakdownBar from './CategoryBreakdownBar';
import SavingsRateRing from './SavingsRateRing';

export interface DashboardAnalyticsCardProps {
  analytics: DashboardAnalytics;
}

function getTrendLabel(
  direction: DashboardAnalytics['spendingTrend']['direction'],
  percent: number,
): string {
  if (direction === 'flat' || percent === 0) {
    return 'Steady';
  }

  const verb = direction === 'up' ? 'Up' : 'Down';
  return `${verb} ${percent}% vs last week`;
}

export default function DashboardAnalyticsCard({ analytics }: DashboardAnalyticsCardProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { incomeTarget, getMonthlySummary } = useFinance();
  const { spendingTrend } = analytics;

  const receivedIncome = getMonthlySummary().totalIncome;
  const incomePercent =
    incomeTarget > 0
      ? Math.min(Math.round((receivedIncome / incomeTarget) * 100), 100)
      : 0;
  const incomeAhead = receivedIncome >= incomeTarget;
  const trendColor =
    spendingTrend.direction === 'up'
      ? colors.error
      : spendingTrend.direction === 'down'
        ? colors.success
        : colors.textMuted;
  const trendIcon =
    spendingTrend.direction === 'up'
      ? 'trending-up'
      : spendingTrend.direction === 'down'
        ? 'arrow-down'
        : 'minus';

  return (
    <LinearGradient
      colors={[colors.primary + '55', colors.blue + '45', colors.gold + '40']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.glowRing}
    >
      <Card variant="default" padding="lg" style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>{analytics.monthLabel} overview</Text>
          <View style={styles.savedRow}>
            <GhsText
              amount={analytics.savingsAmount}
              variant={analytics.savingsAmount >= 0 ? 'income' : 'expense'}
              size="md"
            />
            <Text style={styles.savedCaption}>net saved</Text>
          </View>
          <Text style={styles.subtitle}>
            {analytics.transactionCount} transactions tracked
          </Text>
        </View>
        <View style={styles.ringWrap}>
          <SavingsRateRing rate={analytics.savingsRate} />
          <InfoTooltip
            title="Savings Rate"
            body="The share of this month's income you kept rather than spent: (income − expenses) ÷ income, based only on real transactions recorded through Paystack and the wallet."
            size="sm"
          />
        </View>
      </View>

      {incomeTarget > 0 ? (
        <>
          <View style={styles.divider} />
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Income vs expected</Text>
              <Text
                style={[
                  styles.incomePercent,
                  { color: incomeAhead ? colors.success : colors.textMuted },
                ]}
              >
                {incomePercent}% of GHS {incomeTarget.toLocaleString()}
              </Text>
            </View>
            <View style={styles.incomeTrack}>
              <View
                style={[
                  styles.incomeFill,
                  {
                    width: `${incomePercent}%`,
                    backgroundColor: incomeAhead ? colors.success : colors.primary,
                  },
                ]}
              />
            </View>
          </View>
        </>
      ) : null}

      <View style={styles.divider} />

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Last 7 days</Text>
          <View style={styles.trendPill}>
            <Icon name={trendIcon} size={13} color={trendColor} strokeWidth={2.2} />
            <Text style={[styles.trendText, { color: trendColor }]} numberOfLines={1}>
              {getTrendLabel(spendingTrend.direction, spendingTrend.trendPercent)}
            </Text>
          </View>
        </View>
        <SpendingTrendChart data={spendingTrend.dailyTotals} compact />
      </View>

      <View style={styles.divider} />

      <View style={styles.sectionLast}>
        <Text style={styles.sectionTitle}>Where it went</Text>
        <CategoryBreakdownBar categories={analytics.topCategories} />
      </View>
      </Card>
    </LinearGradient>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    glowRing: {
      borderRadius: radius.card + 2,
      marginBottom: spacing.mlg,
      padding: 1.5,
    },
    card: {
      borderColor: 'transparent',
      borderWidth: 0,
      marginBottom: 0,
    },
    headerRow: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    headerText: {
      flex: 1,
      marginRight: spacing.md,
    },
    eyebrow: {
      ...typography.overline,
      color: colors.textMuted,
      marginBottom: spacing.xs,
      textTransform: 'uppercase',
    },
    savedRow: {
      alignItems: 'baseline',
      flexDirection: 'row',
      gap: spacing.xs,
      marginBottom: 2,
    },
    savedCaption: {
      ...typography.bodySm,
      color: colors.textMuted,
    },
    subtitle: {
      ...typography.caption,
      color: colors.textLight,
    },
    ringWrap: {
      alignItems: 'center',
    },
    divider: {
      backgroundColor: colors.divider,
      height: StyleSheet.hairlineWidth,
      marginVertical: spacing.md,
    },
    section: {},
    sectionLast: {},
    sectionHeader: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    sectionTitle: {
      ...typography.label,
      color: colors.textDark,
    },
    trendPill: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 4,
      maxWidth: '58%',
    },
    trendText: {
      flexShrink: 1,
      fontSize: fontSize.xs,
      fontWeight: fontWeight.medium,
    },
    incomePercent: {
      fontSize: fontSize.xs,
      fontWeight: fontWeight.semibold,
    },
    incomeTrack: {
      backgroundColor: colors.divider,
      borderRadius: 999,
      height: 6,
      marginTop: spacing.sm,
      overflow: 'hidden',
    },
    incomeFill: {
      borderRadius: 999,
      height: '100%',
    },
  });
