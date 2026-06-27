import { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

import AddGoalSheet from '../../components/goals/AddGoalSheet';
import CompletedGoalCard from '../../components/goals/CompletedGoalCard';
import ContributeSheet from '../../components/goals/ContributeSheet';
import GoalCard from '../../components/goals/GoalCard';
import GoalsSummaryBar from '../../components/goals/GoalsSummaryBar';
import GoalsTabToggle from '../../components/goals/GoalsTabToggle';
import GoalToast from '../../components/goals/GoalToast';
import EmptyState from '../../components/ui/EmptyState';
import IconButton from '../../components/ui/IconButton';
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
 * Savings Goals tab with active/completed views, add/contribute sheets, and animated goal cards.
 */
export default function SavingsGoalsScreen() {
  const navigation = useNavigation<SavingsGoalsNavigationProp>();
  const {
    activeGoals,
    completedGoals,
    loading,
    activeTab,
    setActiveTab,
    addGoal,
    contributeToGoal,
    toastMessage,
    totalSaved,
    activeGoalCount,
    isSavingGoal,
    isContributing,
  } = useSavingsGoals();

  const [showAddSheet, setShowAddSheet] = useState(false);
  const [contributeGoal, setContributeGoal] = useState<SavingsGoal | null>(null);

  const listData = activeTab === 'active' ? activeGoals : completedGoals;

  const listHeader = useMemo(
    () => (
      <View>
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
          emoji="🎯"
          title="No active goals"
          subtitle="Tap the + button to create your first savings goal"
        />
      );
    }

    return (
      <EmptyState
        emoji="🏆"
        title="No completed goals yet"
        subtitle="Keep going — you're making progress!"
      />
    );
  }, [activeTab, loading]);

  return (
    <ScreenWrapper background="page" padded={false}>
      {toastMessage ? <GoalToast message={toastMessage} /> : null}

      <FlatList
        style={styles.list}
        data={loading ? [] : listData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={emptyComponent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <AddGoalSheet
        visible={showAddSheet}
        loading={isSavingGoal}
        onClose={() => setShowAddSheet(false)}
        onSave={addGoal}
      />

      <ContributeSheet
        visible={contributeGoal !== null}
        goal={contributeGoal}
        loading={isContributing}
        onClose={() => setContributeGoal(null)}
        onContribute={contributeToGoal}
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
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
});
