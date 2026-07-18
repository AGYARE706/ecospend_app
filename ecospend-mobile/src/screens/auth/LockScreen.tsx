import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import AuthWordmark from '../../components/auth/AuthWordmark';
import AppButton from '../../components/ui/AppButton';
import { Icon } from '../../components/ui/icons';
import { useAppLock } from '../../context/AppLockContext';
import { useAuth } from '../../context/AuthContext';
import { fontSize, fontWeight, radius, spacing, useTheme, useThemedStyles } from '../../theme';
import type { ThemeColors } from '../../theme';

/**
 * Shown whenever the app is authenticated but locked (cold start or
 * returning from background with the biometric lock on). No back button
 * — the only ways out are unlocking or signing out entirely.
 */
export default function LockScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { unlock, biometricAvailable } = useAppLock();
  const { signOut } = useAuth();
  const [failed, setFailed] = useState(false);
  const [attempting, setAttempting] = useState(false);

  const handleUnlock = async () => {
    setAttempting(true);
    setFailed(false);
    const success = await unlock();
    setAttempting(false);
    if (!success) {
      setFailed(true);
    }
  };

  // Prompt automatically on arrival so most people never have to tap anything.
  useEffect(() => {
    void handleUnlock();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={[styles.screen, { backgroundColor: colors.pageBackground }]}>
      <AuthWordmark />

      <View style={styles.iconRing}>
        <Icon name="lock" size={36} color={colors.primary} strokeWidth={1.6} />
      </View>

      <Text style={styles.heading}>EcoSpend is locked</Text>
      <Text style={styles.subheading}>
        {biometricAvailable
          ? 'Use Face ID or your fingerprint to continue.'
          : 'Biometric unlock isn’t set up on this device.'}
      </Text>

      {failed ? (
        <Text style={styles.errorText}>That didn&apos;t work — try again.</Text>
      ) : null}

      <AppButton
        title={attempting ? 'Checking…' : 'Unlock'}
        onPress={handleUnlock}
        loading={attempting}
        style={styles.unlockButton}
      />

      <Pressable onPress={() => void signOut()} style={styles.signOutRow}>
        <Text style={styles.signOutText}>Sign out instead</Text>
      </Pressable>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    screen: {
      alignItems: 'center',
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: spacing.xl,
    },
    iconRing: {
      alignItems: 'center',
      backgroundColor: colors.primaryBackground,
      borderRadius: radius.full,
      height: 88,
      justifyContent: 'center',
      marginBottom: spacing.lg,
      width: 88,
    },
    heading: {
      color: colors.textDark,
      fontSize: fontSize.xl,
      fontWeight: fontWeight.bold,
      marginBottom: spacing.sm,
      textAlign: 'center',
    },
    subheading: {
      color: colors.textGrey,
      fontSize: fontSize.md,
      lineHeight: fontSize.xl,
      marginBottom: spacing.xl,
      textAlign: 'center',
    },
    errorText: {
      color: colors.error,
      fontSize: fontSize.sm,
      marginBottom: spacing.md,
      textAlign: 'center',
    },
    unlockButton: {
      width: '100%',
    },
    signOutRow: {
      marginTop: spacing.xl,
      padding: spacing.sm,
    },
    signOutText: {
      color: colors.textMuted,
      fontSize: fontSize.sm,
      fontWeight: fontWeight.medium,
    },
  });
