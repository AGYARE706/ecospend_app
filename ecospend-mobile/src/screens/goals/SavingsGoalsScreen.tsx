import { useCallback, useMemo } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

import CompletedGoalCard from '../../components/goals/CompletedGoalCard';
import GoalCard from '../../components/goals/GoalCard';
import GoalsSummaryBar from '../../components/goals/GoalsSummaryBar';
import GoalsTabToggle from '../../components/goals/GoalsTabToggle';
import GoalToast from '../../components/goals/GoalToast';
import CollapsedHeaderBar from '../../components/ui/CollapsedHeaderBar';
import EmptyState from '../../components/ui/EmptyState';
import IconButton from '../../components/ui/IconButton';
import ScreenHeader from '../../components/ui/ScreenHeader';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import SkeletonBox from '../../components/ui/SkeletonBox';
import { useCollapsingHeader } from '../../hooks/useCollapsingHeader';
import { useSavingsGoals } from '../../hooks/useSavingsGoals';
import { navigateApp } from '../../navigation/navigationRef';
import type { GoalsStackParamList } from '../../navigation/types';
import { spacing } from '../../theme';
import type { SavingsGoal } from '../../types';

type SavingsGoalsNavigationProp = StackNavigationProp<
  GoalsStackParamList,
  'SavingsGoals'
>;

/**
 * Savings Goals tab with active/completed views and modal create/contribute flows.
 */
export default function SavingsGoalsScreen() {
  const navigation = useNavigation<SavingsGoalsNavigationProp>();
  const {
    activeGoals,
    completedGoals,
    loading,
    activeTab,
    setActiveTab,
    toastMessage,
    totalSaved,
    activeGoalCount,
  } = useSavingsGoals();

  const listData = activeTab === 'active' ? activeGoals : completedGoals;
  const { onScroll, scrollEventThrottle, heroStyle, barStyle } = useCollapsingHeader();

  const listHeader = useMemo(
    () => (
      <View>
        <Animated.View style={heroStyle}>
          <ScreenHeader
            title="Savings Goals"
            subtitle="Save towards what matters"
            right={
              <>
                <IconButton
                  icon="notifications-outline"
                  variant="soft"
                  onPress={() => navigateApp('Notifications')}
                  accessibilityLabel="Notifications"
                />
                <IconButton
                  icon="add"
                  variant="solid"
                  onPress={() => navigateApp('CreateGoal')}
                  accessibilityLabel="Create goal"
                />
              </>
            }
          />

          <GoalsSummaryBar
            activeGoalCount={activeGoalCount}
            totalSaved={totalSaved}
          />
        </Animated.View>

        <GoalsTabToggle activeTab={activeTab} onTabChange={setActiveTab} />

        {loading ? (
          <View>
            <SkeletonBox height={220} style={styles.skeletonGap} />
            <SkeletonBox height={220} style={styles.skeletonGap} />
            <SkeletonBox height={220} />
          </View>
        ) : null}
      </View>
    ),
    [activeGoalCount, activeTab, heroStyle, loading, setActiveTab, totalSaved],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: SavingsGoal; index: number }) => {
      if (activeTab === 'completed') {
        return <CompletedGoalCard goal={item} index={index} />;
      }

      return (
        <GoalCard
          goal={item}
          index={index}
          onAddMoney={(goal) =>
            navigateApp('AddGoalContribution', { goalId: goal.id })
          }
          onDetails={(goal) =>
            navigation.navigate('GoalDetails', { goalId: goal.id })
          }
        />
      );
    },
    [activeTab, navigation],
  );

  const emptyComponent = useMemo(() => {
    if (loading) {
      return null;
    }

    if (activeTab === 'active') {
      return (
        <EmptyState
          icon="target"
          title="No active goals"
          subtitle="Tap the + button to create your first savings goal"
        />
      );
    }

    return (
      <EmptyState
        icon="trophy"
        title="No completed goals yet"
        subtitle="Keep going — you're making progress!"
      />
    );
  }, [activeTab, loading]);

  return (
    <ScreenWrapper background="page" padded={false} edges={['top']}>
      {toastMessage ? <GoalToast message={toastMessage} /> : null}

      <CollapsedHeaderBar
        title="Savings Goals"
        rightActions={
          <IconButton
            icon="add"
            variant="solid"
            size="sm"
            onPress={() => navigateApp('CreateGoal')}
            accessibilityLabel="Create goal"
          />
        }
        style={barStyle}
      />

      <Animated.FlatList
        style={styles.list}
        data={loading ? [] : listData}
        keyExtractor={(item: SavingsGoal) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={emptyComponent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  skeletonGap: {
    marginBottom: spacing.md,
  },
  list: {
    flex: 1,
  },
  separator: {
    height: spacing.md,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
});
