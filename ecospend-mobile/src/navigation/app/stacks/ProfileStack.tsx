import { createStackNavigator } from '@react-navigation/stack';

import BadgesAndStreaksScreen from '../../../screens/gamification/BadgesAndStreaksScreen';
import AboutScreen from '../../../screens/profile/AboutScreen';
import EditProfileScreen from '../../../screens/profile/EditProfileScreen';
import HelpSupportScreen from '../../../screens/profile/HelpSupportScreen';
import NotificationSettingsScreen from '../../../screens/profile/NotificationSettingsScreen';
import ProfileScreen from '../../../screens/profile/ProfileScreen';
import SecurityScreen from '../../../screens/profile/SecurityScreen';
import SubscriptionScreen from '../../../screens/profile/SubscriptionScreen';
import type { ProfileStackParamList } from '../../types';

const Stack = createStackNavigator<ProfileStackParamList>();

export default function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Subscription" component={SubscriptionScreen} />
      <Stack.Screen name="Security" component={SecurityScreen} />
      <Stack.Screen
        name="NotificationSettings"
        component={NotificationSettingsScreen}
      />
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="BadgesAndStreaks" component={BadgesAndStreaksScreen} />
    </Stack.Navigator>
  );
}
