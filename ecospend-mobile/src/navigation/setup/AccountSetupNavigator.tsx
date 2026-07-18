import { createStackNavigator } from '@react-navigation/stack';

import SetupBudgetsScreen from '../../screens/setup/SetupBudgetsScreen';
import SetupIncomeScreen from '../../screens/setup/SetupIncomeScreen';
import SetupNotificationsScreen from '../../screens/setup/SetupNotificationsScreen';
import SetupWelcomeScreen from '../../screens/setup/SetupWelcomeScreen';
import type { AccountSetupStackParamList } from '../types';

const Stack = createStackNavigator<AccountSetupStackParamList>();

/**
 * Gated by RootNavigator whenever the signed-in user's setupCompleted flag is
 * false — there is no way to reach AppNavigator without finishing this stack.
 */
export default function AccountSetupNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, gestureEnabled: false }}
      initialRouteName="SetupWelcome"
    >
      <Stack.Screen name="SetupWelcome" component={SetupWelcomeScreen} />
      <Stack.Screen name="SetupIncome" component={SetupIncomeScreen} />
      <Stack.Screen name="SetupBudgets" component={SetupBudgetsScreen} />
      <Stack.Screen name="SetupNotifications" component={SetupNotificationsScreen} />
    </Stack.Navigator>
  );
}
