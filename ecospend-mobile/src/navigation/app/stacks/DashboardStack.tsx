import { createStackNavigator } from '@react-navigation/stack';

import DashboardScreen from '../../../screens/dashboard/DashboardScreen';
import type { DashboardStackParamList } from '../../types';

const Stack = createStackNavigator<DashboardStackParamList>();

export default function DashboardStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
    </Stack.Navigator>
  );
}
