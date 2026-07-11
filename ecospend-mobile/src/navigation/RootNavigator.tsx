import { useAuth } from '../context/AuthContext';
import AppNavigator from './app/AppNavigator';
import AuthNavigator from './auth/AuthNavigator';

export default function RootNavigator() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <AppNavigator />;
  }

  return <AuthNavigator />;
}
