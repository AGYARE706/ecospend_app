import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { colors, fontSize } from '../../theme';
import type { TabParamList } from '../types';
import DashboardStack from './stacks/DashboardStack';
import GoalsStack from './stacks/GoalsStack';
import ProfileStack from './stacks/ProfileStack';
import TransactionsStack from './stacks/TransactionsStack';
import VaultStack from './stacks/VaultStack';

const Tab = createBottomTabNavigator<TabParamList>();

type TabIconName = keyof typeof Ionicons.glyphMap;

const tabIcons: Record<keyof TabParamList, TabIconName> = {
  DashboardTab: 'home-outline',
  TransactionsTab: 'list-outline',
  GoalsTab: 'flag-outline',
  VaultTab: 'lock-closed-outline',
  ProfileTab: 'person-outline',
};

const tabLabels: Record<keyof TabParamList, string> = {
  DashboardTab: 'Dashboard',
  TransactionsTab: 'Transactions',
  GoalsTab: 'Goals',
  VaultTab: 'Vault',
  ProfileTab: 'Profile',
};

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textGrey,
        tabBarLabelStyle: {
          fontSize: fontSize.xs,
        },
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={tabIcons[route.name]} size={size} color={color} />
        ),
        tabBarLabel: tabLabels[route.name],
      })}
    >
      <Tab.Screen name="DashboardTab" component={DashboardStack} />
      <Tab.Screen name="TransactionsTab" component={TransactionsStack} />
      <Tab.Screen name="GoalsTab" component={GoalsStack} />
      <Tab.Screen name="VaultTab" component={VaultStack} />
      <Tab.Screen name="ProfileTab" component={ProfileStack} />
    </Tab.Navigator>
  );
}
