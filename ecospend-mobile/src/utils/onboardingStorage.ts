import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@ecospend/has_onboarded';

export async function hasSeenOnboarding(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(STORAGE_KEY)) === 'true';
  } catch {
    // If storage is unreadable, showing onboarding again is the safer default.
    return false;
  }
}

export async function markOnboardingSeen(): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, 'true');
  } catch {
    // Best-effort — worst case the user sees onboarding again next launch.
  }
}
