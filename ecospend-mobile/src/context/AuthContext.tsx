import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

import { mockUser } from '../data/mock/mockData';
import type { UserTier } from '../types';

export interface AuthUser {
  name: string;
  phone: string;
}

interface AuthContextValue {
  isAuthenticated: boolean;
  user: AuthUser | null;
  tier: UserTier;
  signIn: (user: AuthUser) => void;
  signOut: () => void;
  updateProfile: (updates: Partial<AuthUser>) => void;
  upgradeToPlus: () => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [tier, setTier] = useState<UserTier>(mockUser.tier);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      user,
      tier,
      signIn: (nextUser: AuthUser) => {
        setUser(nextUser);
        setTier(mockUser.tier);
        setIsAuthenticated(true);
      },
      signOut: () => {
        setUser(null);
        setTier(mockUser.tier);
        setIsAuthenticated(false);
      },
      updateProfile: (updates: Partial<AuthUser>) => {
        setUser((current) => (current ? { ...current, ...updates } : current));
      },
      upgradeToPlus: () => {
        if (tier === 'PLUS') {
          return true;
        }

        setTier('PLUS');
        mockUser.tier = 'PLUS';
        return true;
      },
    }),
    [isAuthenticated, tier, user],
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
