import { useAuth } from '../context/AuthContext';
import AppStackNavigator from './AppStackNavigator';
import AuthNavigator from './AuthNavigator';

export default function RootNavigator() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <AppStackNavigator />;
  }

  return <AuthNavigator />;
}
