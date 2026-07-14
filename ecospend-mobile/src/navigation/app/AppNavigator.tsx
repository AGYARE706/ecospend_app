import { createStackNavigator } from '@react-navigation/stack';

import { BudgetEnvelopesScreen } from '../../screens/budget';
import AddBillScreen from '../../screens/bills/AddBillScreen';
import BillsScreen from '../../screens/bills/BillsScreen';
import ContributeGroupVaultScreen from '../../screens/group-vault/ContributeGroupVaultScreen';
import CreateGroupVaultScreen from '../../screens/group-vault/CreateGroupVaultScreen';
import JoinGroupVaultScreen from '../../screens/group-vault/JoinGroupVaultScreen';
import AddGoalContributionScreen from '../../screens/goals/AddGoalContributionScreen';
import CreateGoalScreen from '../../screens/goals/CreateGoalScreen';
import WithdrawFromGoalScreen from '../../screens/goals/WithdrawFromGoalScreen';
import WeeklyInsightsScreen from '../../screens/insights/WeeklyInsightsScreen';
import NotificationsScreen from '../../screens/notifications/NotificationsScreen';
import AddTransactionScreen from '../../screens/transactions/AddTransactionScreen';
import AddMoneyScreen from '../../screens/vault/AddMoneyScreen';
import CreateVaultScreen from '../../screens/vault/CreateVaultScreen';
import VaultSuccessScreen from '../../screens/vault/VaultSuccessScreen';
import WithdrawVaultScreen from '../../screens/vault/WithdrawVaultScreen';
import SendMoneyScreen from '../../screens/wallet/SendMoneyScreen';
import TopUpWalletScreen from '../../screens/wallet/TopUpWalletScreen';
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
        <Stack.Screen name="WithdrawFromGoal" component={WithdrawFromGoalScreen} />
        <Stack.Screen name="TopUpWallet" component={TopUpWalletScreen} />
        <Stack.Screen name="SendMoney" component={SendMoneyScreen} />
        <Stack.Screen name="AddBill" component={AddBillScreen} />
        <Stack.Screen name="CreateVault" component={CreateVaultScreen} />
        <Stack.Screen name="AddMoney" component={AddMoneyScreen} />
        <Stack.Screen name="WithdrawVault" component={WithdrawVaultScreen} />
        <Stack.Screen name="VaultSuccess" component={VaultSuccessScreen} />
        <Stack.Screen name="CreateGroupVault" component={CreateGroupVaultScreen} />
        <Stack.Screen name="JoinGroupVault" component={JoinGroupVaultScreen} />
        <Stack.Screen name="ContributeGroup" component={ContributeGroupVaultScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
      </Stack.Group>

      <Stack.Group screenOptions={fullscreenModalOptions}>
        <Stack.Screen name="BudgetEnvelopes" component={BudgetEnvelopesScreen} />
        <Stack.Screen name="Bills" component={BillsScreen} />
        <Stack.Screen name="WeeklyInsights" component={WeeklyInsightsScreen} />
      </Stack.Group>
    </Stack.Navigator>
  );
}
