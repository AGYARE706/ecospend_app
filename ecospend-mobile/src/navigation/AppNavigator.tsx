import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import DashboardScreen from '../screens/stubs/DashboardScreen';
import GoalsScreen from '../screens/stubs/GoalsScreen';
import ProfileScreen from '../screens/stubs/ProfileScreen';
import TransactionsScreen from '../screens/stubs/TransactionsScreen';
import VaultScreen from '../screens/stubs/VaultScreen';
import { colors, fontSize } from '../theme';
import type { AppTabParamList } from './types';

const Tab = createBottomTabNavigator<AppTabParamList>();

type TabIconName = keyof typeof Ionicons.glyphMap;

const tabIcons: Record<keyof AppTabParamList, TabIconName> = {
  Dashboard: 'home-outline',
  Transactions: 'list-outline',
  Goals: 'flag-outline',
  Vault: 'lock-closed-outline',
  Profile: 'person-outline',
};

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textGrey,
        tabBarLabelStyle: {
          fontSize: fontSize.xs,
        },
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={tabIcons[route.name]} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Transactions" component={TransactionsScreen} />
      <Tab.Screen name="Goals" component={GoalsScreen} />
      <Tab.Screen name="Vault" component={VaultScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
