import { createStackNavigator } from '@react-navigation/stack';

import ForgotPasswordScreen from '../../screens/auth/ForgotPasswordScreen';
import LoginScreen from '../../screens/auth/LoginScreen';
import OnboardingScreen from '../../screens/auth/OnboardingScreen';
import RegisterScreen from '../../screens/auth/RegisterScreen';
import ResetPasswordScreen from '../../screens/auth/ResetPasswordScreen';
import SplashScreen from '../../screens/auth/SplashScreen';
import VerifyOtpScreen from '../../screens/auth/VerifyOtpScreen';
import type { AuthStackParamList } from '../types';

const Stack = createStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="VerifyOtp" component={VerifyOtpScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
}
