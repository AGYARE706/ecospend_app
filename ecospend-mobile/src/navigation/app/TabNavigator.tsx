import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '../../components/ui/icons';
import type { IconName } from '../../components/ui/icons';
import { colors, fontWeight, shadowSm } from '../../theme';
import type { TabParamList } from '../types';
import DashboardStack from './stacks/DashboardStack';
import GoalsStack from './stacks/GoalsStack';
import ProfileStack from './stacks/ProfileStack';
import TransactionsStack from './stacks/TransactionsStack';
import VaultStack from './stacks/VaultStack';

const Tab = createBottomTabNavigator<TabParamList>();

const tabIcons: Record<keyof TabParamList, IconName> = {
  DashboardTab: 'home',
  TransactionsTab: 'list',
  GoalsTab: 'flag',
  VaultTab: 'lock',
  ProfileTab: 'user',
};

const tabLabels: Record<keyof TabParamList, string> = {
  DashboardTab: 'Home',
  TransactionsTab: 'Activity',
  GoalsTab: 'Goals',
  VaultTab: 'Vault',
  ProfileTab: 'Profile',
};

export default function TabNavigator() {
  const insets = useSafeAreaInsets();
  // Reserve room for the system gesture/nav bar so tab items never sit under it.
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'ios' ? 28 : 10);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textGrey,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.borderSubtle,
          borderTopWidth: 1,
          height: 58 + bottomInset,
          paddingTop: 8,
          paddingBottom: bottomInset,
          ...shadowSm,
        },
        tabBarItemStyle: {
          paddingTop: 2,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: fontWeight.semibold,
          letterSpacing: 0.1,
          marginTop: 2,
        },
        tabBarIcon: ({ color, focused }) => (
          <Icon
            name={tabIcons[route.name]}
            size={24}
            color={color}
            filled={focused}
            strokeWidth={focused ? 2 : 1.8}
          />
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
