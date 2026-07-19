import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

import { useAuth } from './AuthContext';

const BIOMETRIC_LOCK_KEY = 'ecospend_biometric_lock_enabled';

interface AppLockContextValue {
  /** Whether the user has turned the lock on in Security settings. */
  biometricLockEnabled: boolean;
  /** Whether this device actually has enrolled Face ID/fingerprint to use. */
  biometricAvailable: boolean;
  /** True only once authenticated AND the lock hasn't been cleared yet this foreground session. */
  isLocked: boolean;
  setBiometricLockEnabled: (enabled: boolean) => Promise<void>;
  /** Prompts Face ID/fingerprint (falls back to device passcode). Returns whether it unlocked. */
  unlock: () => Promise<boolean>;
}

const AppLockContext = createContext<AppLockContextValue | undefined>(undefined);

export function AppLockProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [biometricLockEnabled, setBiometricLockEnabledState] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const appState = useRef<AppStateStatus>(AppState.currentState);

  // Cold start: load the saved preference and hardware capability once,
  // and start locked if the preference is on — closes the gap where an
  // app relaunch would otherwise skip the lock screen entirely.
  useEffect(() => {
    (async () => {
      const [stored, hasHardware, isEnrolled] = await Promise.all([
        SecureStore.getItemAsync(BIOMETRIC_LOCK_KEY),
        LocalAuthentication.hasHardwareAsync(),
        LocalAuthentication.isEnrolledAsync(),
      ]);
      const available = hasHardware && isEnrolled;
      setBiometricAvailable(available);

      const enabled = stored === 'true' && available;
      setBiometricLockEnabledState(enabled);
      if (enabled) {
        setIsLocked(true);
      }
    })();
  }, []);

  // Re-lock whenever the app returns from background — not just on cold
  // start — so switching away and back doesn't leave financial data
  // exposed with no further check.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      const cameToForeground =
        /inactive|background/.test(appState.current) && nextState === 'active';
      if (cameToForeground && biometricLockEnabled && isAuthenticated) {
        setIsLocked(true);
      }
      appState.current = nextState;
    });
    return () => subscription.remove();
  }, [biometricLockEnabled, isAuthenticated]);

  const setBiometricLockEnabled = useCallback(async (enabled: boolean) => {
    if (enabled) {
      await SecureStore.setItemAsync(BIOMETRIC_LOCK_KEY, 'true');
    } else {
      await SecureStore.deleteItemAsync(BIOMETRIC_LOCK_KEY);
    }
    // Turning it on takes effect from the next backgrounding, not
    // immediately — surprising a user with a lock screen right after
    // they flip the switch reads as a bug, not a feature.
    setBiometricLockEnabledState(enabled);
  }, []);

  const unlock = useCallback(async (): Promise<boolean> => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Unlock EcoSpend',
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
    });
    if (result.success) {
      setIsLocked(false);
      return true;
    }
    return false;
  }, []);

  const value: AppLockContextValue = {
    biometricLockEnabled,
    biometricAvailable,
    isLocked: isAuthenticated && isLocked,
    setBiometricLockEnabled,
    unlock,
  };

  return <AppLockContext.Provider value={value}>{children}</AppLockContext.Provider>;
}

export function useAppLock(): AppLockContextValue {
  const context = useContext(AppLockContext);
  if (!context) {
    throw new Error('useAppLock must be used within an AppLockProvider');
  }
  return context;
}
