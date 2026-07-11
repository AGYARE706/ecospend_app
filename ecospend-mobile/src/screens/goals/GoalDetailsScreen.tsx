import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import type { GoalsStackParamList } from '../../navigation/types';
import Card from '../../components/ui/Card';
import AppButton from '../../components/ui/AppButton';
import EmptyState from '../../components/ui/EmptyState';
import { Icon } from '../../components/ui/icons';
import { useGoals } from '../../context/GoalsContext';
import { navigateApp } from '../../navigation/navigationRef';
import {
  spacing,
  fontSize,
  fontWeight,
  radius,
  typography,
  useTheme,
  useThemedStyles,
} from '../../theme';
import type { ThemeColors } from '../../theme';
import {
  formatMonthYear,
  getDaysRemaining,
  getGoalProgress,
  getWeeklyTarget,
} from '../../utils/goals';

type GoalDetailsRouteProp = RouteProp<GoalsStackParamList, 'GoalDetails'>;

interface Milestone {
  id: string;
  percentage: number;
  title: string;
  amount: number;
  icon: string;
  isCompleted: boolean;
}

export default function GoalDetailsScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { params } = useRoute<GoalDetailsRouteProp>();
  const navigation = useNavigation<any>();
  const { getGoalById } = useGoals();
  const savingsGoal = getGoalById(params.goalId);

  if (!savingsGoal) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="chevron-left" size={22} color={colors.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Goal</Text>
          <View style={styles.headerSpacer} />
        </View>
        <EmptyState
          icon="target"
          title="Goal not found"
          subtitle="This goal may have been deleted."
          actionLabel="Go back"
          onAction={() => navigation.goBack()}
        />
      </SafeAreaView>
    );
  }

  const daysRemaining = getDaysRemaining(savingsGoal.deadline);
  const weeklyTarget = getWeeklyTarget(savingsGoal);
  const goal = {
    id: savingsGoal.id,
    title: savingsGoal.name,
    description: savingsGoal.deadline
      ? `Target by ${formatMonthYear(savingsGoal.deadline)}`
      : 'No deadline set',
    currentAmount: savingsGoal.currentAmount,
    targetAmount: savingsGoal.targetAmount,
    daysRemaining: daysRemaining ?? 0,
    avgContribution: weeklyTarget ?? Math.round(savingsGoal.targetAmount / 12),
    weeklyProjection: weeklyTarget ?? Math.round(savingsGoal.targetAmount / 12),
    projectedFinish: savingsGoal.deadline
      ? formatMonthYear(savingsGoal.deadline)
      : 'No deadline',
  };

  const progress = getGoalProgress(savingsGoal);

  const milestones: Milestone[] = [100, 75, 50, 25].map((percentage) => ({
    id: String(percentage),
    percentage,
    title:
      percentage === 100
        ? 'Complete'
        : percentage === 75
          ? 'Almost there'
          : percentage === 50
            ? 'Halfway There'
            : 'First Steps',
    amount: Math.round((percentage / 100) * savingsGoal.targetAmount),
    icon:
      percentage === 100
        ? '🚩'
        : percentage === 75
          ? '🔒'
          : percentage === 50
            ? '⏱️'
            : '✓',
    isCompleted: savingsGoal.currentAmount >= (percentage / 100) * savingsGoal.targetAmount,
  }));

  const handleAddContribution = () => {
    navigateApp('AddGoalContribution', { goalId: params.goalId });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-left" size={22} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{goal.title}</Text>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => navigation.navigate('EditGoal', { goalId: params.goalId })}
        >
          <Icon name="edit" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Card variant="default" padding="lg" style={styles.heroCard}>
          <View style={styles.heroContent}>
            <Text style={[typography.h2, styles.heroTitle]}>{goal.title}</Text>
            <Text style={[typography.body, styles.heroSubtitle]}>{goal.description}</Text>
          </View>
        </Card>
      </View>

      {/* Progress Overview */}
      <View style={styles.progressSection}>
        {/* Main Circular Progress Card */}
        <Card variant="default" padding="lg" style={styles.progressCard}>
          <View style={styles.progressContent}>
            {/* Circular Progress */}
            <View style={styles.circleContainer}>
              <Svg width={160} height={160} viewBox="0 0 100 100">
                {/* Background circle */}
                <Circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke={colors.chipBg}
                  strokeWidth="8"
                  fill="none"
                />
                {/* Progress circle */}
                <Circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke={colors.primary}
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${(progress / 100) * 282.7} 282.7`}
                  strokeLinecap="round"
                  rotation="-90"
                  originX="50"
                  originY="50"
                />
              </Svg>
              <View style={styles.progressText}>
                <Text style={[typography.h3, styles.progressPercentage]}>
                  {Math.round(progress)}%
                </Text>
                <Text style={[typography.bodySm, styles.progressLabel]}>Completed</Text>
              </View>
            </View>

            {/* Amount Details */}
            <View style={styles.amountDetails}>
              <View style={styles.amountRow}>
                <Text style={[typography.bodySm, styles.amountLabel]} numberOfLines={1}>Saved</Text>
                <Text style={[typography.body, styles.amountValue]} numberOfLines={1}>
                  GH¢ {goal.currentAmount.toLocaleString()}
                </Text>
              </View>
              <View style={styles.amountRow}>
                <Text style={[typography.bodySm, styles.amountLabel]} numberOfLines={1}>Target</Text>
                <Text style={[typography.body, styles.amountValue]} numberOfLines={1}>
                  GH¢ {goal.targetAmount.toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <Card variant="default" padding="md" style={styles.statCard}>
            <Text style={styles.statIcon}>💰</Text>
            <Text style={[typography.label, styles.statLabel]} numberOfLines={2}>Avg. Contribution</Text>
            <Text style={[typography.body, styles.statValue]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>GH¢ {goal.avgContribution}</Text>
          </Card>
          <Card variant="default" padding="md" style={styles.statCard}>
            <Text style={styles.statIcon}>📅</Text>
            <Text style={[typography.label, styles.statLabel]} numberOfLines={2}>Days Remaining</Text>
            <Text style={[typography.body, styles.statValue]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>{goal.daysRemaining} Days</Text>
          </Card>
          <Card variant="default" padding="md" style={styles.statCard}>
            <Text style={styles.statIcon}>📈</Text>
            <Text style={[typography.label, styles.statLabel]} numberOfLines={2}>Est. Weekly Saving</Text>
            <Text style={[typography.body, styles.statValue]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>GH¢ {goal.weeklyProjection}</Text>
          </Card>
          <Card variant="default" padding="md" style={styles.statCard}>
            <Text style={styles.statIcon}>✨</Text>
            <Text style={[typography.label, styles.statLabel]} numberOfLines={2}>Projected Finish</Text>
            <Text style={[typography.body, styles.statValue]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>{goal.projectedFinish}</Text>
          </Card>
        </View>
      </View>

      {/* Timeline Section */}
      <View style={styles.timelineSection}>
        <Text style={[typography.h3, styles.timelineTitle]}>Milestone Timeline</Text>
        <Card variant="default" padding="lg" style={styles.timelineCard}>
          <View style={styles.timelineContainer}>
            {/* Timeline line */}
            <View style={styles.timelineLine} />

            {/* Milestones */}
            {milestones.map((milestone, index) => (
              <View key={milestone.id} style={styles.milestoneItem}>
                <View style={styles.milestoneContent}>
                  {index % 2 === 0 ? (
                    <>
                      <View style={styles.milestoneTextContainer}>
                        <Text
                          style={[
                            typography.label,
                            styles.milestoneTitle,
                            !milestone.isCompleted && styles.milestoneTitleInactive,
                          ]}
                        >
                          {milestone.title}
                        </Text>
                        <Text style={[typography.bodySm, styles.milestoneAmount]}>
                          GH¢ {milestone.amount.toLocaleString()}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.milestoneCircle,
                          milestone.isCompleted && styles.milestoneCircleActive,
                        ]}
                      >
                        <Text style={styles.milestoneIcon}>{milestone.icon}</Text>
                      </View>
                    </>
                  ) : (
                    <>
                      <View
                        style={[
                          styles.milestoneCircle,
                          milestone.isCompleted && styles.milestoneCircleActive,
                        ]}
                      >
                        <Text style={styles.milestoneIcon}>{milestone.icon}</Text>
                      </View>
                      <View style={styles.milestoneTextContainer}>
                        <Text
                          style={[
                            typography.label,
                            styles.milestoneTitle,
                            !milestone.isCompleted && styles.milestoneTitleInactive,
                          ]}
                        >
                          {milestone.title}
                        </Text>
                        <Text style={[typography.bodySm, styles.milestoneAmount]}>
                          GH¢ {milestone.amount.toLocaleString()}
                        </Text>
                      </View>
                    </>
                  )}
                </View>
              </View>
            ))}
          </View>
        </Card>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <AppButton
          title="Add Contribution"
          onPress={handleAddContribution}
          variant="primary"
          size="lg"
          fullWidth
          style={styles.button}
        />
        <AppButton
          title="Edit Goal"
          onPress={() => navigation.navigate('EditGoal' as any, { goalId: params.goalId })}
          variant="secondary"
          size="lg"
          fullWidth
          style={styles.button}
        />
      </View>

      {/* Bottom spacing */}
      <View style={styles.bottomSpacer} />
    </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.pageBackground,
  },
  container: {
    flex: 1,
    backgroundColor: colors.pageBackground,
  },
  contentContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.chipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: colors.textPrimary,
    fontWeight: fontWeight.semibold,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    flex: 1,
    marginHorizontal: spacing.sm,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 44,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.chipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationIcon: {
    fontSize: 20,
  },
  heroSection: {
    marginBottom: spacing.lg,
  },
  heroCard: {
    alignItems: 'center',
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    color: colors.textPrimary,
    marginBottom: spacing.smd,
    textAlign: 'center',
  },
  heroSubtitle: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
  progressSection: {
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  progressCard: {
    alignItems: 'center',
  },
  progressContent: {
    alignItems: 'center',
    width: '100%',
  },
  circleContainer: {
    position: 'relative',
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  progressText: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressPercentage: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  progressLabel: {
    color: colors.textSecondary,
    marginTop: spacing.smd,
  },
  amountDetails: {
    width: '100%',
    gap: spacing.md,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountLabel: {
    color: colors.textSecondary,
  },
  amountValue: {
    color: colors.textPrimary,
    fontWeight: fontWeight.bold,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.md,
  },
  statCard: {
    width: '48%',
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: spacing.smd,
  },
  statLabel: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.smd,
  },
  statValue: {
    color: colors.textPrimary,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
  },
  timelineSection: {
    marginBottom: spacing.lg,
  },
  timelineTitle: {
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  timelineCard: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  timelineContainer: {
    position: 'relative',
    paddingHorizontal: spacing.md,
  },
  timelineLine: {
    position: 'absolute',
    left: '50%',
    top: spacing.lg,
    bottom: spacing.lg,
    width: 2,
    backgroundColor: colors.chipBg,
    marginLeft: -1,
  },
  milestoneItem: {
    marginBottom: spacing.lg,
  },
  milestoneContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  milestoneTextContainer: {
    flex: 1,
  },
  milestoneTitle: {
    color: colors.textPrimary,
  },
  milestoneTitleInactive: {
    color: colors.textSecondary,
    opacity: 0.6,
  },
  milestoneAmount: {
    color: colors.textSecondary,
    marginTop: spacing.smd,
  },
  milestoneCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.chipBg,
    backgroundColor: colors.pageBackground,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  milestoneCircleActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  milestoneIcon: {
    fontSize: 18,
  },
  buttonContainer: {
    gap: spacing.md,
  },
  button: {
    marginBottom: spacing.smd,
  },
  bottomSpacer: {
    height: spacing.lg,
  },
});