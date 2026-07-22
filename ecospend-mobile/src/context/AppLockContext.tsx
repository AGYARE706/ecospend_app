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
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [biometricLockEnabled, setBiometricLockEnabledState] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [capabilityChecked, setCapabilityChecked] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const appState = useRef<AppStateStatus>(AppState.currentState);
  // Guards against overlapping authenticateAsync calls — iOS rejects/cancels
  // a second evaluatePolicy call while one is already in flight, which reads
  // as the prompt silently glitching.
  const isAuthenticatingRef = useRef(false);
  const hasGatedColdStartRef = useRef(false);

  // Cold start: load the saved preference and device capability once.
  // Locking itself is decided separately below, once we also know whether
  // this launch restored an existing session.
  useEffect(() => {
    (async () => {
      const [stored, hasHardware, isEnrolled, enrolledLevel] = await Promise.all([
        SecureStore.getItemAsync(BIOMETRIC_LOCK_KEY),
        LocalAuthentication.hasHardwareAsync(),
        LocalAuthentication.isEnrolledAsync(),
        LocalAuthentication.getEnrolledLevelAsync(),
      ]);
      setBiometricAvailable(hasHardware && isEnrolled);

      // Any device credential (passcode or biometric) can drive the lock.
      const canLock = enrolledLevel !== LocalAuthentication.SecurityLevel.NONE;
      // Default ON: only 'false' (an explicit opt-out) disables it.
      const enabled = stored !== 'false' && canLock;
      setBiometricLockEnabledState(enabled);
      setCapabilityChecked(true);
    })();
  }, []);

  // Gate exactly once, at the moment the auth restore AND the capability
  // check have both settled. If the app launched with an existing session
  // already restored, lock immediately (a true cold start). If not — the
  // user is about to log in interactively — don't lock, since typing a
  // password already proves identity for this run; biometrics should only
  // re-engage the next time the app actually leaves and returns. Without
  // this distinction, signIn() flipping isAuthenticated right after login
  // was immediately re-triggering a redundant Face ID prompt.
  useEffect(() => {
    if (authLoading || !capabilityChecked || hasGatedColdStartRef.current) {
      return;
    }
    hasGatedColdStartRef.current = true;
    if (isAuthenticated && biometricLockEnabled) {
      setIsLocked(true);
    }
  }, [authLoading, capabilityChecked, isAuthenticated, biometricLockEnabled]);

  // Re-lock whenever the app returns from background — not just on cold
  // start — so switching away and back doesn't leave financial data
  // exposed with no further check. Only 'background' counts as having left
  // the app: iOS also flips to 'inactive' (without ever reaching
  // 'background') for transient system UI — Control Center, an incoming
  // call, and notably the Face ID/passcode sheet itself. Treating
  // 'inactive' as "left the app" was re-locking the app the instant a
  // biometric prompt resolved, right after a successful unlock.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      const cameToForeground = appState.current === 'background' && nextState === 'active';
      if (cameToForeground && biometricLockEnabled && isAuthenticated && !isAuthenticatingRef.current) {
        setIsLocked(true);
      }
      appState.current = nextState;
    });
    return () => subscription.remove();
  }, [biometricLockEnabled, isAuthenticated]);

  const setBiometricLockEnabled = useCallback(async (enabled: boolean) => {
    // Store 'false' explicitly on opt-out — the lock is on by default, so
    // deleting the key would silently re-enable it on the next launch.
    await SecureStore.setItemAsync(BIOMETRIC_LOCK_KEY, enabled ? 'true' : 'false');
    // Turning it on takes effect from the next backgrounding, not
    // immediately — surprising a user with a lock screen right after
    // they flip the switch reads as a bug, not a feature.
    setBiometricLockEnabledState(enabled);
  }, []);

  const unlock = useCallback(async (): Promise<boolean> => {
    if (isAuthenticatingRef.current) {
      return false;
    }
    isAuthenticatingRef.current = true;
    try {
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
    } finally {
      isAuthenticatingRef.current = false;
    }
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
