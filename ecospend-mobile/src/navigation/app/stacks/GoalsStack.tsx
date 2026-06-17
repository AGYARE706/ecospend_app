import { createStackNavigator } from '@react-navigation/stack';

import EditGoalScreen from '../../../screens/goals/EditGoalScreen';
import GoalDetailsScreen from '../../../screens/goals/GoalDetailsScreen';
import SavingsGoalsScreen from '../../../screens/goals/SavingsGoalsScreen';
import type { GoalsStackParamList } from '../../types';

const Stack = createStackNavigator<GoalsStackParamList>();

export default function GoalsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SavingsGoals" component={SavingsGoalsScreen} />
      <Stack.Screen name="GoalDetails" component={GoalDetailsScreen} />
      <Stack.Screen name="EditGoal" component={EditGoalScreen} />
    </Stack.Navigator>
  );
}
