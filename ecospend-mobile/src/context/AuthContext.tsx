import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';

import { registerTokenGetter } from '../api/authTokenAccessor';

export const TOKEN_KEY = 'ecospend_token';
export const TIER_KEY = 'ecospend_tier';

export type UserTier = 'FREE' | 'PLUS';

export interface AuthState {
  token: string | null;
  tier: UserTier | null;
  isLoading: boolean;
}

export interface AuthContextValue extends AuthState {
  login: (token: string, tier: string) => Promise<void>;
  logout: () => Promise<void>;
}

type AuthAction =
  | { type: 'RESTORE'; token: string | null; tier: UserTier | null }
  | { type: 'LOGIN'; token: string; tier: UserTier }
  | { type: 'LOGOUT' };

const initialState: AuthState = {
  token: null,
  tier: null,
  isLoading: true,
};

function parseTier(tier: string): UserTier | null {
  if (tier === 'FREE' || tier === 'PLUS') {
    return tier;
  }
  return null;
}

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'RESTORE':
      return {
        token: action.token,
        tier: action.tier,
        isLoading: false,
      };
    case 'LOGIN':
      return {
        token: action.token,
        tier: action.tier,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        token: null,
        tier: null,
        isLoading: false,
      };
    default:
      return state;
  }
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    registerTokenGetter(() => state.token);
  }, [state.token]);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const pairs = await AsyncStorage.multiGet([TOKEN_KEY, TIER_KEY]);
        const storedToken = pairs[0][1];
        const storedTier = pairs[1][1];
        const tier = storedTier ? parseTier(storedTier) : null;

        dispatch({
          type: 'RESTORE',
          token: storedToken,
          tier: storedToken ? tier : null,
        });
      } catch {
        dispatch({ type: 'RESTORE', token: null, tier: null });
      }
    };

    void restoreSession();
  }, []);

  const login = useCallback(async (token: string, tier: string) => {
    const parsedTier = parseTier(tier);
    if (!parsedTier) {
      throw new Error('Invalid tier');
    }

    await AsyncStorage.multiSet([
      [TOKEN_KEY, token],
      [TIER_KEY, parsedTier],
    ]);
    dispatch({ type: 'LOGIN', token, tier: parsedTier });
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.multiRemove([TOKEN_KEY, TIER_KEY]);
    dispatch({ type: 'LOGOUT' });
  }, []);

  const value = useMemo(
    () => ({
      token: state.token,
      tier: state.tier,
      isLoading: state.isLoading,
      login,
      logout,
    }),
    [state.token, state.tier, state.isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
