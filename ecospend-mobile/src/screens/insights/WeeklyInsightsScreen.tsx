import { type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import SpendingTrendChart from '../../components/insights/SpendingTrendChart';
import GhsText from '../../components/ui/GhsText';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import { CATEGORY_CONFIG } from '../../constants/categories';
import { useWeeklyInsights } from '../../hooks/useWeeklyInsights';
import type { AppStackParamList } from '../../navigation/types';
import {
  cardShadow,
  fontSize,
  fontWeight,
  radius,
  shadowMd,
  spacing,
  useTheme,
  useThemedStyles,
} from '../../theme';
import type { ThemeColors } from '../../theme';
import { formatNotificationTime } from '../../utils/notifications';

type WeeklyInsightsNavProp = StackNavigationProp<
  AppStackParamList,
  'WeeklyInsights'
>;

export default function WeeklyInsightsScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation<WeeklyInsightsNavProp>();
  const { summary, topCategory, largestTransaction, spendingTrend, monthEndProjection } =
    useWeeklyInsights();

  const trendIsUp = spendingTrend.direction === 'up';
  const trendIsFlat = spendingTrend.direction === 'flat';
  const trendColor = trendIsFlat
    ? colors.textMuted
    : trendIsUp
      ? colors.warning
      : colors.primary;
  const trendIcon: keyof typeof Ionicons.glyphMap = trendIsFlat
    ? 'remove-outline'
    : trendIsUp
      ? 'trending-up'
      : 'trending-down';
  const trendLabel =
    spendingTrend.direction === 'flat'
      ? 'Flat vs last week'
      : `${spendingTrend.trendPercent}% ${trendIsUp ? 'higher' : 'lower'} than last week`;

  const monthProgress =
    monthEndProjection.daysInMonth > 0
      ? monthEndProjection.daysElapsed / monthEndProjection.daysInMonth
      : 0;

  return (
    <ScreenWrapper background="page" padded={false}>
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
            <Text style={styles.headerTitle}>Weekly Insights</Text>
            <Text style={styles.headerSub}>{summary.weekLabel}</Text>
          </View>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.summaryCard}
          >
            <View style={styles.summaryGlow} />

            <View style={styles.summaryHeader}>
              <View style={styles.summaryIconBadge}>
                <Ionicons name="analytics" size={18} color={colors.white} />
              </View>
              <Text style={styles.summaryEyebrow}>Weekly Summary</Text>
            </View>

            <View style={styles.summaryStats}>
              <SummaryStat
                icon="arrow-up"
                label="Income"
                amount={summary.income}
              />
              <View style={styles.summaryDivider} />
              <SummaryStat
                icon="arrow-down"
                label="Expenses"
                amount={summary.expenses}
              />
              <View style={styles.summaryDivider} />
              <SummaryStat
                icon="wallet-outline"
                label="Savings"
                amount={summary.savings}
                highlight={summary.savings >= 0}
              />
            </View>
          </LinearGradient>

          <SectionLabel title="Insights" icon="bulb-outline" />

          <View style={styles.insightGrid}>
            <InsightCard style={styles.gridCard}>
              <CardHeader
                icon="pie-chart-outline"
                iconColor={colors.warning}
                iconBackground={colors.warningLight}
                title="Top Spending Category"
              />
              {topCategory ? (
                <>
                  <View style={styles.categoryRow}>
                    <View style={styles.categoryEmojiWrap}>
                      <Text style={styles.categoryEmoji}>
                        {CATEGORY_CONFIG[topCategory.category].emoji}
                      </Text>
                    </View>
                    <View style={styles.categoryTextBlock}>
                      <Text style={styles.categoryName} numberOfLines={1}>{topCategory.category}</Text>
                      <GhsText amount={topCategory.amount} size="md" numberOfLines={1} adjustsFontSizeToFit />
                    </View>
                  </View>
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${topCategory.percentOfSpending}%`,
                          backgroundColor: colors.warning,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.cardMeta}>
                    {topCategory.percentOfSpending}% of weekly spending ·{' '}
                    {topCategory.transactionCount} transaction
                    {topCategory.transactionCount === 1 ? '' : 's'}
                  </Text>
                </>
              ) : (
                <Text style={styles.emptyInsight}>No spending recorded this week.</Text>
              )}
            </InsightCard>

            <InsightCard style={styles.gridCard}>
              <CardHeader
                icon="receipt-outline"
                iconColor={colors.blue}
                iconBackground={colors.blueLight}
                title="Largest Transaction"
              />
              {largestTransaction ? (
                <>
                  <GhsText
                    amount={largestTransaction.amount}
                    size="hero"
                    style={styles.largestAmount}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  />
                  <Text style={styles.largestCategory} numberOfLines={1}>
                    {CATEGORY_CONFIG[largestTransaction.category].emoji}{' '}
                    {largestTransaction.category}
                  </Text>
                  <Text style={styles.cardMeta} numberOfLines={2}>
                    {largestTransaction.notes ?? 'No description provided'}
                  </Text>
                  <Text style={styles.cardTime}>
                    {formatNotificationTime(largestTransaction.date)}
                  </Text>
                </>
              ) : (
                <Text style={styles.emptyInsight}>No transactions this week.</Text>
              )}
            </InsightCard>

            <InsightCard style={styles.fullWidthCard}>
              <View style={styles.trendHeaderRow}>
                <CardHeader
                  icon="bar-chart-outline"
                  iconColor={colors.primary}
                  iconBackground={colors.primaryBackground}
                  title="Spending Trend"
                />
                <View style={[styles.trendPill, { backgroundColor: `${trendColor}18` }]}>
                  <Ionicons name={trendIcon} size={14}  color={trendColor} />
                  <Text style={[styles.trendPillText, { color: trendColor }]} numberOfLines={1}>
                    {trendLabel}
                  </Text>
                </View>
              </View>

              <SpendingTrendChart
                data={spendingTrend.dailyTotals}
                barColor={colors.primary}
              />

              <View style={styles.trendFooter}>
                <TrendFooterItem
                  label="This week"
                  amount={spendingTrend.thisWeekTotal}
                />
                <TrendFooterItem
                  label="Last week"
                  amount={spendingTrend.lastWeekTotal}
                  muted
                />
              </View>
            </InsightCard>

            <InsightCard style={styles.fullWidthCard}>
              <CardHeader
                icon="calendar-outline"
                iconColor={colors.purple}
                iconBackground={colors.purpleLight}
                title="Month-End Projection"
              />

              <View style={styles.projectionRow}>
                <View style={styles.projectionMain}>
                  <Text style={styles.projectionLabel}>Projected net balance</Text>
                  <GhsText
                    amount={monthEndProjection.projectedNet}
                    variant={monthEndProjection.projectedNet >= 0 ? 'income' : 'expense'}
                    size="hero"
                    style={styles.projectionAmount}
                  />
                  <Text style={styles.cardMeta}>
                    Based on {monthEndProjection.daysElapsed} days of activity ·{' '}
                    {monthEndProjection.daysRemaining} days left
                  </Text>
                </View>

                <View style={styles.ringWrap}>
                  <View style={styles.ringOuter}>
                    <View
                      style={[
                        styles.ringProgress,
                        {
                          height: `${Math.min(Math.max(monthProgress, 0.08), 1) * 100}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.ringLabel}>
                    {Math.round(monthProgress * 100)}%
                  </Text>
                  <Text style={styles.ringSubLabel}>of month</Text>
                </View>
              </View>

              <View style={styles.projectionStats}>
                <ProjectionStat
                  label="Projected income"
                  amount={monthEndProjection.projectedIncome}
                  positive
                />
                <ProjectionStat
                  label="Projected expenses"
                  amount={monthEndProjection.projectedExpenses}
                />
              </View>
            </InsightCard>
          </View>

          <Text style={styles.footerHint}>
            Insights are calculated from your tracked transactions and update as you add
            new activity.
          </Text>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
}

function SummaryStat({
  icon,
  label,
  amount,
  highlight = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  amount: number;
  highlight?: boolean;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.summaryStat}>
      <View style={styles.summaryStatHeader}>
        <Ionicons name={icon} size={12} color={colors.white} />
        <Text style={styles.summaryStatLabel}>{label}</Text>
      </View>
      <GhsText
        amount={amount}
        variant="white"
        size="sm"
        style={highlight && amount < 0 ? styles.summaryStatNegative : undefined}
      />
    </View>
  );
}

function SectionLabel({
  title,
  icon,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.sectionLabel}>
      <View style={styles.sectionIconBadge}>
        <Ionicons name={icon} size={14} color={colors.primary} />
      </View>
      <Text style={styles.sectionLabelText}>{title}</Text>
    </View>
  );
}

function InsightCard({
  children,
  style,
}: {
  children: ReactNode;
  style?: object;
}) {
  const styles = useThemedStyles(createStyles);
  return <View style={[styles.insightCard, style]}>{children}</View>;
}

function CardHeader({
  icon,
  iconColor,
  iconBackground,
  title,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBackground: string;
  title: string;
}) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.cardHeader}>
      <View style={[styles.cardIcon, { backgroundColor: iconBackground }]}>
        <Ionicons name={icon} size={16} color={iconColor} />
      </View>
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
  );
}

function TrendFooterItem({
  label,
  amount,
  muted = false,
}: {
  label: string;
  amount: number;
  muted?: boolean;
}) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.trendFooterItem}>
      <Text style={styles.trendFooterLabel}>{label}</Text>
      <GhsText
        amount={amount}
        size="sm"
        style={muted ? styles.trendFooterAmountMuted : undefined}
      />
    </View>
  );
}

function ProjectionStat({
  label,
  amount,
  positive = false,
}: {
  label: string;
  amount: number;
  positive?: boolean;
}) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.projectionStat}>
      <Text style={styles.projectionStatLabel}>{label}</Text>
      <GhsText
        amount={amount}
        size="sm"
        variant={positive ? 'income' : 'default'}
        style={!positive ? styles.projectionStatExpense : undefined}
      />
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    borderBottomColor: colors.borderSubtle,
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backBtn: {
    alignItems: 'center',
    borderRadius: radius.full,
    height: 44,
    justifyContent: 'center',
    width: 44,
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
  headerRight: {
    width: 44,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  summaryCard: {
    borderRadius: radius.heroCard,
    marginBottom: spacing.xl,
    overflow: 'hidden',
    padding: spacing.lg,
    ...shadowMd,
  },
  summaryGlow: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radius.full,
    height: 120,
    position: 'absolute',
    right: -24,
    top: -24,
    width: 120,
  },
  summaryHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  summaryIconBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: radius.full,
    height: 32,
    justifyContent: 'center',
    marginRight: spacing.sm,
    width: 32,
  },
  summaryEyebrow: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    opacity: 0.92,
  },
  summaryStats: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  summaryStat: {
    flex: 1,
  },
  summaryStatHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  summaryStatLabel: {
    color: colors.white,
    fontSize: fontSize.xs,
    opacity: 0.82,
  },
  summaryStatNegative: {
    opacity: 0.95,
  },
  summaryDivider: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    height: 40,
    marginHorizontal: spacing.sm,
    width: 1,
  },
  sectionLabel: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionIconBadge: {
    alignItems: 'center',
    backgroundColor: colors.primaryBackground,
    borderRadius: radius.full,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  sectionLabelText: {
    color: colors.textDark,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  insightGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  insightCard: {
    backgroundColor: colors.cardBackground,
    borderColor: colors.borderSubtle,
    borderRadius: radius.card,
    borderWidth: 1,
    padding: spacing.md,
    ...cardShadow,
  },
  gridCard: {
    width: '48%',
  },
  fullWidthCard: {
    width: '100%',
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  cardIcon: {
    alignItems: 'center',
    borderRadius: radius.full,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  cardTitle: {
    color: colors.textDark,
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  categoryRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  categoryEmojiWrap: {
    alignItems: 'center',
    backgroundColor: colors.chipBg,
    borderRadius: radius.md,
    height: 40,
    justifyContent: 'center',
    marginRight: spacing.sm,
    width: 40,
  },
  categoryEmoji: {
    fontSize: fontSize.lg,
  },
  categoryTextBlock: {
    flex: 1,
  },
  categoryName: {
    color: colors.textDark,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    marginBottom: 2,
  },
  progressTrack: {
    backgroundColor: colors.divider,
    borderRadius: radius.full,
    height: 8,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: radius.full,
    height: 8,
  },
  cardMeta: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    lineHeight: 17,
  },
  emptyInsight: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  largestAmount: {
    lineHeight: 40,
    marginBottom: spacing.xs,
  },
  largestCategory: {
    color: colors.textDark,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  cardTime: {
    color: colors.textLight,
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
  trendHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: spacing.xs,
  },
  trendPill: {
    alignItems: 'center',
    borderRadius: radius.full,
    flexDirection: 'row',
    flexShrink: 1,
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  trendPillText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  trendFooter: {
    borderTopColor: colors.divider,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
    paddingTop: spacing.md,
  },
  trendFooterItem: {
    flex: 1,
  },
  trendFooterLabel: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginBottom: spacing.xs,
  },
  trendFooterAmountMuted: {
    color: colors.textMuted,
  },
  projectionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  projectionMain: {
    flex: 1,
  },
  projectionLabel: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  projectionAmount: {
    lineHeight: 42,
    marginBottom: spacing.xs,
  },
  ringWrap: {
    alignItems: 'center',
    width: 72,
  },
  ringOuter: {
    backgroundColor: colors.divider,
    borderRadius: radius.md,
    height: 72,
    justifyContent: 'flex-end',
    marginBottom: spacing.xs,
    overflow: 'hidden',
    width: 18,
  },
  ringProgress: {
    backgroundColor: colors.purple,
    borderRadius: radius.sm,
    width: '100%',
  },
  ringLabel: {
    color: colors.textDark,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  ringSubLabel: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
  projectionStats: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  projectionStat: {
    backgroundColor: colors.pageBackground,
    borderRadius: radius.md,
    flex: 1,
    padding: spacing.sm,
  },
  projectionStatLabel: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginBottom: spacing.xs,
  },
  projectionStatExpense: {
    color: colors.textDark,
  },
  footerHint: {
    color: colors.textLight,
    fontSize: fontSize.xs,
    lineHeight: 18,
    textAlign: 'center',
  },
  bottomSpacer: {
    height: spacing.xxl,
  },
});
