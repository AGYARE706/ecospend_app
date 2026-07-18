import { ActivityIndicator, View } from 'react-native';

import { useAppLock } from '../context/AppLockContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import AppNavigator from './app/AppNavigator';
import AuthNavigator from './auth/AuthNavigator';
import AccountSetupNavigator from './setup/AccountSetupNavigator';
import LockScreen from '../screens/auth/LockScreen';

export default function RootNavigator() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { isLocked } = useAppLock();
  const { colors } = useTheme();

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.pageBackground,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isAuthenticated && isLocked) {
    return <LockScreen />;
  }

  if (isAuthenticated && !user?.setupCompleted) {
    return <AccountSetupNavigator />;
  }

  if (isAuthenticated) {
    return <AppNavigator />;
  }

  return <AuthNavigator />;
}
