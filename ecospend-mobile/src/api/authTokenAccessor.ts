import AsyncStorage from '@react-native-async-storage/async-storage';

import type { UserTier } from '../types';

export const ACCESS_TOKEN_KEY = 'ecospend_access_token';
export const REFRESH_TOKEN_KEY = 'ecospend_refresh_token';
export const TIER_KEY = 'ecospend_tier';
export const USER_KEY = 'ecospend_user';

type SignOutListener = () => void;

let accessTokenMemory: string | null = null;
let refreshTokenMemory: string | null = null;
let tierMemory: UserTier = 'FREE';
let signOutListener: SignOutListener | null = null;

export function setSignOutListener(listener: SignOutListener | null): void {
  signOutListener = listener;
}

export function notifySessionExpired(): void {
  signOutListener?.();
}

export function getAccessToken(): string | null {
  return accessTokenMemory;
}

export function getRefreshToken(): string | null {
  return refreshTokenMemory;
}

export function getCachedTier(): UserTier {
  return tierMemory;
}

export async function loadTokensFromStorage(): Promise<{
  accessToken: string | null;
  refreshToken: string | null;
  tier: UserTier;
  user: { name: string; phone: string } | null;
}> {
  const [accessToken, refreshToken, tier, userRaw] = await Promise.all([
    AsyncStorage.getItem(ACCESS_TOKEN_KEY),
    AsyncStorage.getItem(REFRESH_TOKEN_KEY),
    AsyncStorage.getItem(TIER_KEY),
    AsyncStorage.getItem(USER_KEY),
  ]);

  accessTokenMemory = accessToken;
  refreshTokenMemory = refreshToken;
  tierMemory = tier === 'PLUS' || tier === 'PREMIUM' ? 'PLUS' : 'FREE';

  let user: { name: string; phone: string } | null = null;
  if (userRaw) {
    try {
      user = JSON.parse(userRaw) as { name: string; phone: string };
    } catch {
      user = null;
    }
  }

  return {
    accessToken,
    refreshToken,
    tier: tierMemory,
    user,
  };
}

export async function persistSession(session: {
  accessToken: string;
  refreshToken: string;
  tier: string;
  user: { name: string; phone: string };
}): Promise<void> {
  const tier: UserTier =
    session.tier === 'PLUS' || session.tier === 'PREMIUM' ? 'PLUS' : 'FREE';

  accessTokenMemory = session.accessToken;
  refreshTokenMemory = session.refreshToken;
  tierMemory = tier;

  await Promise.all([
    AsyncStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken),
    AsyncStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken),
    AsyncStorage.setItem(TIER_KEY, tier),
    AsyncStorage.setItem(USER_KEY, JSON.stringify(session.user)),
  ]);
}

export async function persistAccessTokenAndTier(
  accessToken: string,
  tier: string,
): Promise<void> {
  const nextTier: UserTier =
    tier === 'PLUS' || tier === 'PREMIUM' ? 'PLUS' : 'FREE';
  accessTokenMemory = accessToken;
  tierMemory = nextTier;
  await Promise.all([
    AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken),
    AsyncStorage.setItem(TIER_KEY, nextTier),
  ]);
}

export async function updateStoredUser(user: {
  name: string;
  phone: string;
}): Promise<void> {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function clearSession(): Promise<void> {
  accessTokenMemory = null;
  refreshTokenMemory = null;
  tierMemory = 'FREE';
  await Promise.all([
    AsyncStorage.removeItem(ACCESS_TOKEN_KEY),
    AsyncStorage.removeItem(REFRESH_TOKEN_KEY),
    AsyncStorage.removeItem(TIER_KEY),
    AsyncStorage.removeItem(USER_KEY),
  ]);
}
