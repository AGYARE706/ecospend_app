import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

/**
 * Expo push-notification integration for EcoSpend.
 *
 * Responsibilities:
 *  - foreground presentation behaviour (banner/list/badge)
 *  - requesting OS permission + Android channel setup
 *  - obtaining the Expo push token used by the backend to deliver pushes
 *  - keeping the app-icon badge in sync with the unread count
 *
 * Remote push requires a development/production build — it does NOT work in
 * Expo Go on Android (SDK 53+). All calls are wrapped so a failure (offline,
 * denied permission, unsupported launcher) degrades gracefully to a no-op.
 */

const ANDROID_CHANNEL_ID = 'default';

// Present notifications while the app is foregrounded, and let the OS keep the
// badge in step with what the server sends.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function resolveProjectId(): string | undefined {
  return (
    Constants?.expoConfig?.extra?.eas?.projectId ??
    // easConfig is populated in builds; expoConfig covers dev.
    (Constants as unknown as { easConfig?: { projectId?: string } })?.easConfig
      ?.projectId
  );
}

/**
 * Creates the Android notification channel. On Android 13+ the OS permission
 * prompt will not appear until at least one channel exists, so this must run
 * before requesting permission / fetching the token.
 */
async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: 'General',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#16A34A',
  });
}

export interface PushRegistration {
  token: string;
  platform: string;
}

/**
 * Requests notification permission and returns the Expo push token, or null if
 * unavailable (simulator, permission denied, offline, or Expo Go).
 * Safe to call repeatedly — permission is only re-prompted when undetermined.
 */
export async function registerForPushNotifications(): Promise<PushRegistration | null> {
  try {
    if (!Device.isDevice) {
      // Push tokens are only issued to physical devices.
      return null;
    }

    await ensureAndroidChannel();

    const existing = await Notifications.getPermissionsAsync();
    let status = existing.status;
    if (status !== 'granted') {
      const requested = await Notifications.requestPermissionsAsync();
      status = requested.status;
    }
    if (status !== 'granted') {
      return null;
    }

    const projectId = resolveProjectId();
    if (!projectId) {
      return null;
    }

    const tokenResult = await Notifications.getExpoPushTokenAsync({ projectId });
    const token = tokenResult.data?.trim();
    if (!token) {
      return null;
    }

    return { token, platform: Platform.OS };
  } catch {
    // Offline / denied / unsupported — proceed without a token.
    return null;
  }
}

/**
 * Sets the app-icon badge to the given unread count. Values <= 0 clear it.
 * Silently ignored on launchers/platforms that don't support badges.
 */
export async function syncBadgeCount(count: number): Promise<void> {
  try {
    await Notifications.setBadgeCountAsync(Math.max(0, Math.floor(count)));
  } catch {
    // Unsupported launcher or missing permission — nothing to do.
  }
}

/** Clears the app-icon badge (e.g. on logout or after marking all read). */
export async function clearBadgeCount(): Promise<void> {
  await syncBadgeCount(0);
}
