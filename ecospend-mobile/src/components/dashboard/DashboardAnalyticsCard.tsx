import { StyleSheet, Text, View } from 'react-native';

import SpendingTrendChart from '../insights/SpendingTrendChart';
import { Icon } from '../ui/icons';
import GhsText from '../ui/GhsText';
import Card from '../ui/Card';
import {
  fontSize,
  fontWeight,
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
    return 'Spending steady';
  }

  const verb = direction === 'up' ? 'Up' : 'Down';
  return `${verb} ${percent}% vs last week`;
}

export default function DashboardAnalyticsCard({ analytics }: DashboardAnalyticsCardProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { spendingTrend } = analytics;
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
    <Card variant="default" padding="lg" style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>Overview</Text>
          <Text style={styles.title}>{analytics.monthLabel}</Text>
          <Text style={styles.subtitle}>
            {analytics.transactionCount} transactions tracked
          </Text>
        </View>
        <SavingsRateRing rate={analytics.savingsRate} />
      </View>

      <View style={styles.savingsRow}>
        <Text style={styles.savingsLabel}>Net saved this month</Text>
        <GhsText
          amount={analytics.savingsAmount}
          variant={analytics.savingsAmount >= 0 ? 'income' : 'expense'}
          size="sm"
        />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>7-day spending</Text>
          <View style={styles.trendPill}>
            <Icon name={trendIcon} size={14} color={trendColor} strokeWidth={2.2} />
            <Text style={[styles.trendText, { color: trendColor }]}>
              {getTrendLabel(spendingTrend.direction, spendingTrend.trendPercent)}
            </Text>
          </View>
        </View>
        <SpendingTrendChart data={spendingTrend.dailyTotals} compact />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Where it went</Text>
        <CategoryBreakdownBar categories={analytics.topCategories} />
      </View>
    </Card>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      marginBottom: spacing.lg,
    },
    headerRow: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.md,
    },
    headerText: {
      flex: 1,
      marginRight: spacing.md,
    },
    eyebrow: {
      ...typography.overline,
      color: colors.primary,
      marginBottom: spacing.xs,
      textTransform: 'uppercase',
    },
    title: {
      ...typography.subheading,
      color: colors.textDark,
      marginBottom: 2,
    },
    subtitle: {
      ...typography.caption,
      color: colors.textMuted,
    },
    savingsRow: {
      alignItems: 'center',
      backgroundColor: colors.chipBg,
      borderRadius: spacing.smd,
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.lg,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.smd,
    },
    savingsLabel: {
      color: colors.textMuted,
      fontSize: fontSize.sm,
      fontWeight: fontWeight.medium,
    },
    section: {
      marginBottom: spacing.md,
    },
    sectionHeader: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.xs,
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
  });
