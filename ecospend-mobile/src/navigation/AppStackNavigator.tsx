import { createStackNavigator } from '@react-navigation/stack';

import AddTransactionScreen from '../screens/app/AddTransactionScreen';
import AppNavigator from './AppNavigator';
import type { AppStackParamList } from './types';

const Stack = createStackNavigator<AppStackParamList>();

export default function AppStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={AppNavigator} />
      <Stack.Screen
        name="AddTransaction"
        component={AddTransactionScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
    </Stack.Navigator>
  );
}
