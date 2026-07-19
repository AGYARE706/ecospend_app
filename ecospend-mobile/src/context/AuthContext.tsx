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
import { registerPushTokenIfAvailable } from '../api/registerPushToken';
import * as usersApi from '../api/usersApi';
import type { UserTier } from '../types';

export interface AuthUser {
  name: string;
  phone: string;
  photoUrl?: string | null;
  setupCompleted: boolean;
  momoProvider?: string | null;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  tier: string;
  user: { name: string; phone: string };
}

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  tier: UserTier;
  signIn: (session: AuthSession) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<AuthUser>) => Promise<void>;
  updatePhoto: (photoBase64: string) => Promise<void>;
  upgradeToPlus: () => Promise<boolean>;
  markSetupComplete: () => Promise<void>;
  setMomoProvider: (momoProvider: string) => Promise<void>;
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
          setUser({
            name: profile.name,
            phone: profile.phone,
            photoUrl: profile.photoUrl,
            setupCompleted: profile.setupCompleted,
            momoProvider: profile.momoProvider,
          });
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
            setTier(
              refreshed.tier === 'PLUS' || refreshed.tier === 'PREMIUM'
                ? 'PLUS'
                : 'FREE',
            );
            setIsAuthenticated(true);
            // The refresh response only carries name+phone — fetch the
            // full profile (photo, setupCompleted) the same way the
            // primary getMe() branch above does.
            try {
              const profile = await usersApi.getMe();
              if (!cancelled) {
                setUser({
                  name: profile.name,
                  phone: profile.phone,
                  photoUrl: profile.photoUrl,
                  setupCompleted: profile.setupCompleted,
                  momoProvider: profile.momoProvider,
                });
              }
            } catch {
              setUser({ ...refreshed.user, setupCompleted: true });
            }
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
    // The login/register response only carries name+phone — default
    // setupCompleted to false until the follow-up getMe() below resolves,
    // so a brand-new registration isn't briefly shown the main app before
    // the setup wizard gate kicks in.
    setUser({ ...session.user, setupCompleted: false });
    setTier(
      session.tier === 'PLUS' || session.tier === 'PREMIUM' ? 'PLUS' : 'FREE',
    );
    setIsAuthenticated(true);
    // Push token registration is a no-op until expo-notifications supplies a token.
    void registerPushTokenIfAvailable(null).catch(() => undefined);

    // The login/register response only carries name+phone. If this account
    // already has a saved photo from an earlier session, fetch it now so it
    // doesn't appear "lost" after logging back in.
    try {
      const profile = await usersApi.getMe();
      const fullUser = {
        name: profile.name,
        phone: profile.phone,
        photoUrl: profile.photoUrl,
        setupCompleted: profile.setupCompleted,
        momoProvider: profile.momoProvider,
      };
      setUser(fullUser);
      await updateStoredUser(fullUser);
    } catch {
      // Keep the bare session.user already set — not fatal.
    }
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
    const nextUser = {
      name: profile.name,
      phone: profile.phone,
      photoUrl: profile.photoUrl,
      setupCompleted: profile.setupCompleted,
      momoProvider: profile.momoProvider,
    };
    setUser(nextUser);
    await updateStoredUser(nextUser);
  }, []);

  const updatePhoto = useCallback(async (photoBase64: string) => {
    const profile = await usersApi.updateProfilePhoto(photoBase64);
    const nextUser = {
      name: profile.name,
      phone: profile.phone,
      photoUrl: profile.photoUrl,
      setupCompleted: profile.setupCompleted,
      momoProvider: profile.momoProvider,
    };
    setUser(nextUser);
    await updateStoredUser(nextUser);
  }, []);

  /** Persists the account's MoMo provider once, so send-to-self flows never have to ask again. */
  const setMomoProvider = useCallback(async (momoProvider: string) => {
    const profile = await usersApi.updateMomoProvider(momoProvider);
    const nextUser = {
      name: profile.name,
      phone: profile.phone,
      photoUrl: profile.photoUrl,
      setupCompleted: profile.setupCompleted,
      momoProvider: profile.momoProvider,
    };
    setUser(nextUser);
    await updateStoredUser(nextUser);
  }, []);

  /**
   * Paid upgrade: the backend charges GHS 36 from the wallet before
   * flipping the tier, so failures (e.g. insufficient balance) are
   * rethrown for the caller to surface to the user.
   */
  const upgradeToPlus = useCallback(async (): Promise<boolean> => {
    const response = await usersApi.upgradeToPlus();
    // AuthResponse's user summary carries only name/phone — preserve the
    // photo and setup state already held rather than silently dropping them.
    const nextUser = {
      ...(response.user ?? user ?? { name: '', phone: '' }),
      photoUrl: user?.photoUrl,
      setupCompleted: user?.setupCompleted ?? true,
    };
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
  }, [user]);

  const markSetupComplete = useCallback(async () => {
    const profile = await usersApi.completeSetup();
    setUser((current) =>
      current ? { ...current, setupCompleted: profile.setupCompleted } : current,
    );
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      isLoading,
      user,
      tier,
      signIn,
      signOut,
      updateProfile,
      updatePhoto,
      upgradeToPlus,
      markSetupComplete,
      setMomoProvider,
    }),
    [
      isAuthenticated,
      isLoading,
      markSetupComplete,
      setMomoProvider,
      signIn,
      signOut,
      tier,
      updateProfile,
      updatePhoto,
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
