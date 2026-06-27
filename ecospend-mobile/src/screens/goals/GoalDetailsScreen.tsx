import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import type { GoalsStackParamList } from '../../navigation/types';
import Card from '../../components/ui/Card';
import AppButton from '../../components/ui/AppButton';
import { colors, spacing, fontSize, fontWeight, radius, typography } from '../../theme';

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
  const { params } = useRoute<GoalDetailsRouteProp>();
  const navigation = useNavigation<any>();

  // Mock data - replace with actual data from params/hook
  const goal = {
    id: params.goalId,
    title: 'Emergency Fund',
    description: 'Secure your financial foundation',
    currentAmount: 3000,
    targetAmount: 5000,
    daysRemaining: 45,
    avgContribution: 250,
    weeklyProjection: 315,
    projectedFinish: 'Nov 15, 2023',
  };

  const progress = (goal.currentAmount / goal.targetAmount) * 100;

  const milestones: Milestone[] = [
    {
      id: '100',
      percentage: 100,
      title: 'Complete',
      amount: 5000,
      icon: '🚩',
      isCompleted: false,
    },
    {
      id: '75',
      percentage: 75,
      title: 'Vault Secure',
      amount: 3750,
      icon: '🔒',
      isCompleted: false,
    },
    {
      id: '50',
      percentage: 50,
      title: 'Halfway There',
      amount: 2500,
      icon: '⏱️',
      isCompleted: true,
    },
    {
      id: '25',
      percentage: 25,
      title: 'First Steps',
      amount: 1250,
      icon: '✓',
      isCompleted: true,
    },
  ];

  const handleAddContribution = () => {
    navigation.navigate('AddGoalContribution' as any, { goalId: params.goalId });
  };

  return (
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
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{goal.title}</Text>
        <TouchableOpacity style={styles.notificationButton}>
          <Text style={styles.notificationIcon}>🔔</Text>
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
                <Text style={[typography.bodySm, styles.amountLabel]}>Saved</Text>
                <Text style={[typography.body, styles.amountValue]}>
                  GH¢ {goal.currentAmount.toLocaleString()}
                </Text>
              </View>
              <View style={styles.amountRow}>
                <Text style={[typography.bodySm, styles.amountLabel]}>Target</Text>
                <Text style={[typography.body, styles.amountValue]}>
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
            <Text style={[typography.label, styles.statLabel]}>Avg. Contribution</Text>
            <Text style={[typography.body, styles.statValue]}>GH¢ {goal.avgContribution}</Text>
          </Card>
          <Card variant="default" padding="md" style={styles.statCard}>
            <Text style={styles.statIcon}>📅</Text>
            <Text style={[typography.label, styles.statLabel]}>Days Remaining</Text>
            <Text style={[typography.body, styles.statValue]}>{goal.daysRemaining} Days</Text>
          </Card>
          <Card variant="default" padding="md" style={styles.statCard}>
            <Text style={styles.statIcon}>📈</Text>
            <Text style={[typography.label, styles.statLabel]}>Est. Weekly Saving</Text>
            <Text style={[typography.body, styles.statValue]}>GH¢ {goal.weeklyProjection}</Text>
          </Card>
          <Card variant="default" padding="md" style={styles.statCard}>
            <Text style={styles.statIcon}>✨</Text>
            <Text style={[typography.label, styles.statLabel]}>Projected Finish</Text>
            <Text style={[typography.body, styles.statValue]}>{goal.projectedFinish}</Text>
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
  );
}

const styles = StyleSheet.create({
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
    width: 40,
    height: 40,
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
    textAlign: 'center',
  },
  notificationButton: {
    width: 40,
    height: 40,
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
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    minWidth: '48%',
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