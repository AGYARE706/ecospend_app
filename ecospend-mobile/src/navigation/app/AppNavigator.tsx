import { createStackNavigator } from '@react-navigation/stack';

import { BudgetEnvelopesScreen } from '../../screens/budget';
import MoMoCalculatorScreen from '../../screens/calculator/MoMoCalculatorScreen';
import CreateGroupVaultScreen from '../../screens/group-vault/CreateGroupVaultScreen';
import JoinGroupVaultScreen from '../../screens/group-vault/JoinGroupVaultScreen';
import AddGoalContributionScreen from '../../screens/goals/AddGoalContributionScreen';
import CreateGoalScreen from '../../screens/goals/CreateGoalScreen';
import WeeklyInsightsScreen from '../../screens/insights/WeeklyInsightsScreen';
import NotificationsScreen from '../../screens/notifications/NotificationsScreen';
import AddTransactionScreen from '../../screens/transactions/AddTransactionScreen';
import CreateVaultScreen from '../../screens/vault/CreateVaultScreen';
import VaultSuccessScreen from '../../screens/vault/VaultSuccessScreen';
import WithdrawVaultScreen from '../../screens/vault/WithdrawVaultScreen';
import type { AppStackParamList } from '../types';
import TabNavigator from './TabNavigator';

const Stack = createStackNavigator<AppStackParamList>();

const modalScreenOptions = {
  presentation: 'modal' as const,
  animation: 'slide_from_bottom' as const,
  headerShown: false,
};

const fullscreenModalOptions = {
  animation: 'slide_from_bottom' as const,
  headerShown: false,
};

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={TabNavigator} />

      <Stack.Group screenOptions={modalScreenOptions}>
        <Stack.Screen name="AddTransaction" component={AddTransactionScreen} />
        <Stack.Screen name="CreateGoal" component={CreateGoalScreen} />
        <Stack.Screen
          name="AddGoalContribution"
          component={AddGoalContributionScreen}
        />
        <Stack.Screen name="CreateVault" component={CreateVaultScreen} />
        <Stack.Screen name="WithdrawVault" component={WithdrawVaultScreen} />
        <Stack.Screen name="VaultSuccess" component={VaultSuccessScreen} />
        <Stack.Screen name="CreateGroupVault" component={CreateGroupVaultScreen} />
        <Stack.Screen name="JoinGroupVault" component={JoinGroupVaultScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
      </Stack.Group>

      <Stack.Group screenOptions={fullscreenModalOptions}>
        <Stack.Screen name="BudgetEnvelopes" component={BudgetEnvelopesScreen} />
        <Stack.Screen name="MoMoCalculator" component={MoMoCalculatorScreen} />
        <Stack.Screen name="WeeklyInsights" component={WeeklyInsightsScreen} />
      </Stack.Group>
    </Stack.Navigator>
  );
}
