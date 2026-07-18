import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import FloatingHeaderBar from '../../components/ui/FloatingHeaderBar';
import { Icon } from '../../components/ui/icons';
import type { IconName } from '../../components/ui/icons';
import { useTheme } from '../../theme';
import type { TabParamList } from '../types';
import FloatingTabBar from './FloatingTabBar';
import DashboardStack from './stacks/DashboardStack';
import GoalsStack from './stacks/GoalsStack';
import ProfileStack from './stacks/ProfileStack';
import TransactionsStack from './stacks/TransactionsStack';
import VaultStack from './stacks/VaultStack';

const Tab = createBottomTabNavigator<TabParamList>();

const tabIcons: Record<keyof TabParamList, IconName> = {
  DashboardTab: 'home',
  TransactionsTab: 'list',
  GoalsTab: 'target',
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
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.pageBackground }}>
      <FloatingHeaderBar />
      <Tab.Navigator
        tabBar={(props) => <FloatingTabBar {...props} />}
        screenOptions={({ route }) => ({
          headerShown: false,
          // Reset nested stacks when leaving a tab so deep screens don't linger.
          popToTopOnBlur: true,
          sceneContainerStyle: { backgroundColor: colors.pageBackground },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textGrey,
          tabBarStyle: {
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
          },
          // Always render the outline variant: swapping the SVG tree between
          // outline and solid on focus intermittently paints black on
          // Android. Focus is signalled by color, weight and the pill.
          tabBarIcon: ({ color, focused, size }) => (
            <Icon
              name={tabIcons[route.name]}
              size={size}
              color={color}
              strokeWidth={focused ? 2.4 : 1.8}
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
    </View>
  );
}
