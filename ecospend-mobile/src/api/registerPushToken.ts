import * as notificationsApi from './notificationsApi';

/**
 * Registers an Expo push token when one is provided.
 * Call after login once expo-notifications (or another source) yields a token.
 */
export async function registerPushTokenIfAvailable(
  expoPushToken?: string | null,
  platform?: string,
): Promise<void> {
  if (!expoPushToken?.trim()) {
    return;
  }

  await notificationsApi.registerPushToken(expoPushToken.trim(), platform);
}
