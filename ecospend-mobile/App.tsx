import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  Theme,
} from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useMemo } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppLockProvider } from './src/context/AppLockContext';
import { AuthProvider } from './src/context/AuthContext';
import { EnvelopesProvider } from './src/context/EnvelopesContext';
import { FinanceProvider } from './src/context/FinanceContext';
import { GoalsProvider } from './src/context/GoalsContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { VaultProvider } from './src/context/VaultContext';
import { WalletProvider } from './src/context/WalletContext';
import UpdateGate from './src/components/system/UpdateGate';
import { linking } from './src/navigation/linking';
import { navigationRef } from './src/navigation/navigationRef';
import RootNavigator from './src/navigation/RootNavigator';

function ThemedApp() {
  const { colors, isDark } = useTheme();

  const navigationTheme = useMemo<Theme>(() => {
    const base = isDark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.primary,
        background: colors.pageBackground,
        card: colors.cardBackground,
        text: colors.textPrimary,
        border: colors.border,
      },
    };
  }, [colors, isDark]);

  return (
    <NavigationContainer ref={navigationRef} linking={linking} theme={navigationTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <UpdateGate>
            <AuthProvider>
              <AppLockProvider>
                <WalletProvider>
                  <FinanceProvider>
                    {/* Envelopes must wrap Goals/Vault: their contribute flows
                        call useEnvelopes() to refresh spend after an expense. */}
                    <EnvelopesProvider>
                      <GoalsProvider>
                        <VaultProvider>
                          <ThemedApp />
                        </VaultProvider>
                      </GoalsProvider>
                    </EnvelopesProvider>
                  </FinanceProvider>
                </WalletProvider>
              </AppLockProvider>
            </AuthProvider>
          </UpdateGate>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
