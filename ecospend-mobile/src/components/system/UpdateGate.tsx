import { ReactNode, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, StyleSheet, Text, View } from 'react-native';
import type { AppStateStatus } from 'react-native';
import * as Updates from 'expo-updates';

import { useThemedStyles } from '../../theme';
import type { ThemeColors } from '../../theme';

/**
 * Force-applies EAS OTA updates.
 *
 * On launch — and each time the app returns to the foreground — this checks
 * for a published update on the build's channel. If one exists it downloads
 * it and calls Updates.reloadAsync(), so the new JS bundle takes effect
 * immediately rather than on some later cold start (Expo's lazy default).
 *
 * Fail-open by design: any error, timeout, or slow network just proceeds into
 * the app with the current bundle — a failed update check must never lock a
 * user out. Disabled in dev (Expo Go / __DEV__) where Updates is inert.
 */
export default function UpdateGate({ children }: { children: ReactNode }) {
  const styles = useThemedStyles(createStyles);
  // Show the blocking overlay only while actively fetching+reloading a found
  // update, so users on a fresh install don't stare at a spinner for nothing.
  const [applying, setApplying] = useState(false);
  const checking = useRef(false);

  async function checkAndApply() {
    // Guard: never run twice concurrently, and skip entirely in dev where
    // expo-updates is disabled and isEnabled is false.
    if (checking.current || __DEV__ || !Updates.isEnabled) {
      return;
    }
    checking.current = true;
    try {
      const result = await Updates.checkForUpdateAsync();
      if (result.isAvailable) {
        setApplying(true);
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync(); // relaunches with the new bundle
      }
    } catch {
      // Offline, timed out, or check failed — proceed with the current bundle.
      setApplying(false);
    } finally {
      checking.current = false;
    }
  }

  useEffect(() => {
    void checkAndApply();

    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') {
        void checkAndApply();
      }
    });
    return () => sub.remove();
    // checkAndApply is stable for the component's lifetime; run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (applying) {
    return (
      <View style={styles.overlay}>
        <ActivityIndicator size="large" color={styles.spinner.color} />
        <Text style={styles.text}>Updating EcoSpend…</Text>
      </View>
    );
  }

  return <>{children}</>;
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    overlay: {
      alignItems: 'center',
      backgroundColor: colors.pageBackground,
      flex: 1,
      justifyContent: 'center',
    },
    spinner: {
      color: colors.primary,
    },
    text: {
      color: colors.textMuted,
      marginTop: 16,
    },
  });
