import { useCallback, useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

import CompletedGoalCard from '../../components/goals/CompletedGoalCard';
import GoalCard from '../../components/goals/GoalCard';
import GoalsSummaryBar from '../../components/goals/GoalsSummaryBar';
import GoalsTabToggle from '../../components/goals/GoalsTabToggle';
import GoalToast from '../../components/goals/GoalToast';
import FloatingActionButton from '../../components/finance/FloatingActionButton';
import EmptyState from '../../components/ui/EmptyState';
import ScreenHeader from '../../components/ui/ScreenHeader';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import SkeletonBox from '../../components/ui/SkeletonBox';
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

  const listHeader = useMemo(
    () => (
      <View>
        <ScreenHeader title="Savings Goals" subtitle="Save towards what matters" />

        <GoalsSummaryBar
          activeGoalCount={activeGoalCount}
          totalSaved={totalSaved}
        />

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
    [activeGoalCount, activeTab, loading, setActiveTab, totalSaved],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: SavingsGoal; index: number }) => {
      if (activeTab === 'completed') {
        return (
          <CompletedGoalCard
            goal={item}
            index={index}
            onPress={(goal) => navigation.navigate('GoalDetails', { goalId: goal.id })}
          />
        );
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
          imageSource={require('../../../assets/goal.png')}
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
    <ScreenWrapper background="page" padded={false} edges={[]}>
      {toastMessage ? <GoalToast message={toastMessage} /> : null}

      <FlatList
        style={styles.list}
        data={loading ? [] : listData}
        keyExtractor={(item: SavingsGoal) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={emptyComponent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <FloatingActionButton onPress={() => navigateApp('CreateGoal')} />
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
