import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import BudgetEnvelopesScreen from '../screens/app/BudgetEnvelopesScreen';
import DashboardScreen from '../screens/app/DashboardScreen';
import MoMoCalculatorScreen from '../screens/app/MoMoCalculatorScreen';
import SavingsGoalsScreen from '../screens/app/SavingsGoalsScreen';
import ProfileScreen from '../screens/stubs/ProfileScreen';
import TransactionsScreen from '../screens/app/TransactionsScreen';
import { colors, fontSize } from '../theme';
import type { AppTabParamList } from './types';

const Tab = createBottomTabNavigator<AppTabParamList>();

type TabIconName = keyof typeof Ionicons.glyphMap;

const tabIcons: Record<keyof AppTabParamList, TabIconName> = {
  Dashboard: 'home-outline',
  Transactions: 'list-outline',
  Goals: 'flag-outline',
  Budget: 'wallet-outline',
  Calculator: 'calculator-outline',
  Profile: 'person-outline',
};

const hiddenHeaderRoutes: Array<keyof AppTabParamList> = [
  'Dashboard',
  'Transactions',
  'Goals',
  'Budget',
  'Calculator',
];

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: !hiddenHeaderRoutes.includes(route.name),
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
      <Tab.Screen name="Goals" component={SavingsGoalsScreen} />
      <Tab.Screen name="Budget" component={BudgetEnvelopesScreen} />
      <Tab.Screen
        name="Calculator"
        component={MoMoCalculatorScreen}
        options={{ title: 'Calc' }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
