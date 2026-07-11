import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import * as authApi from '../api/authApi';
import {
  clearSession,
  getRefreshToken,
  loadTokensFromStorage,
  persistAccessTokenAndTier,
  persistSession,
  setSignOutListener,
  updateStoredUser,
} from '../api/authTokenAccessor';
import { getApiErrorMessage } from '../api/getApiErrorMessage';
import { registerPushTokenIfAvailable } from '../api/registerPushToken';
import * as usersApi from '../api/usersApi';
import type { UserTier } from '../types';

export interface AuthUser {
  name: string;
  phone: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  tier: string;
  user: AuthUser;
}

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  tier: UserTier;
  signIn: (session: AuthSession) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<AuthUser>) => Promise<void>;
  upgradeToPlus: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [tier, setTier] = useState<UserTier>('FREE');

  const applyLocalSignOut = useCallback(async () => {
    await clearSession();
    setUser(null);
    setTier('FREE');
    setIsAuthenticated(false);
  }, []);

  useEffect(() => {
    setSignOutListener(() => {
      void applyLocalSignOut();
    });
    return () => setSignOutListener(null);
  }, [applyLocalSignOut]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const stored = await loadTokensFromStorage();
        if (cancelled) {
          return;
        }

        if (!stored.accessToken || !stored.refreshToken || !stored.user) {
          setIsAuthenticated(false);
          return;
        }

        try {
          const profile = await usersApi.getMe();
          if (cancelled) {
            return;
          }
          setUser({ name: profile.name, phone: profile.phone });
          setTier(
            profile.tier === 'PLUS' || profile.tier === 'PREMIUM' ? 'PLUS' : 'FREE',
          );
          setIsAuthenticated(true);
        } catch {
          try {
            const refreshed = await authApi.refresh(stored.refreshToken);
            if (cancelled) {
              return;
            }
            await persistSession({
              accessToken: refreshed.accessToken,
              refreshToken: refreshed.refreshToken,
              tier: refreshed.tier,
              user: refreshed.user,
            });
            setUser(refreshed.user);
            setTier(
              refreshed.tier === 'PLUS' || refreshed.tier === 'PREMIUM'
                ? 'PLUS'
                : 'FREE',
            );
            setIsAuthenticated(true);
          } catch {
            await applyLocalSignOut();
          }
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [applyLocalSignOut]);

  const signIn = useCallback(async (session: AuthSession) => {
    await persistSession(session);
    setUser(session.user);
    setTier(
      session.tier === 'PLUS' || session.tier === 'PREMIUM' ? 'PLUS' : 'FREE',
    );
    setIsAuthenticated(true);
    // Push token registration is a no-op until expo-notifications supplies a token.
    void registerPushTokenIfAvailable(null).catch(() => undefined);
  }, []);

  const signOut = useCallback(async () => {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch {
        // best-effort logout
      }
    }
    await applyLocalSignOut();
  }, [applyLocalSignOut]);

  const updateProfile = useCallback(async (updates: Partial<AuthUser>) => {
    if (!updates.name?.trim()) {
      return;
    }
    const profile = await usersApi.updateMe({ name: updates.name.trim() });
    const nextUser = { name: profile.name, phone: profile.phone };
    setUser(nextUser);
    await updateStoredUser(nextUser);
  }, []);

  const upgradeToPlus = useCallback(async (): Promise<boolean> => {
    try {
      const response = await usersApi.upgradeToPlus();
      const nextUser = response.user ?? user ?? { name: '', phone: '' };
      if (response.refreshToken) {
        await persistSession({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          tier: response.tier,
          user: nextUser,
        });
      } else {
        await persistAccessTokenAndTier(response.accessToken, response.tier);
        await updateStoredUser(nextUser);
      }
      setUser(nextUser);
      setTier('PLUS');
      return true;
    } catch (error) {
      console.warn('upgradeToPlus failed', getApiErrorMessage(error));
      return false;
    }
  }, [user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      isLoading,
      user,
      tier,
      signIn,
      signOut,
      updateProfile,
      upgradeToPlus,
    }),
    [
      isAuthenticated,
      isLoading,
      signIn,
      signOut,
      tier,
      updateProfile,
      upgradeToPlus,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
