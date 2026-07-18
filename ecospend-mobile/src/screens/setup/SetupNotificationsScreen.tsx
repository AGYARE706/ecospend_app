import { useMemo, useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

import SetupProgressBar from '../../components/setup/SetupProgressBar';
import AppButton from '../../components/ui/AppButton';
import { Icon } from '../../components/ui/icons';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import { useAuth } from '../../context/AuthContext';
import {
  getNotificationPreferenceItems,
  useNotificationSettings,
} from '../../hooks/useNotificationSettings';
import {
  fontSize,
  fontWeight,
  radius,
  spacing,
  useTheme,
  useThemedStyles,
} from '../../theme';
import type { ThemeColors } from '../../theme';

export default function SetupNotificationsScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { markSetupComplete } = useAuth();
  const { preferences, togglePreference } = useNotificationSettings();
  const preferenceItems = useMemo(() => getNotificationPreferenceItems(colors), [colors]);

  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const handleFinish = async () => {
    setFinishing(true);
    setError(undefined);
    try {
      await markSetupComplete();
    } catch {
      setError('Could not finish setup. Please try again.');
      setFinishing(false);
    }
  };

  return (
    <ScreenWrapper background="page" scrollable>
      <SetupProgressBar step={3} total={3} label="Step 3 of 3" />

      <View style={styles.iconRing}>
        <Icon name="bell" size={28} color={colors.primary} strokeWidth={1.8} />
      </View>

      <Text style={styles.title}>Stay in the loop</Text>
      <Text style={styles.subtitle}>
        Choose what EcoSpend can notify you about. You can change these anytime in
        Profile &gt; Notifications.
      </Text>

      <View style={styles.settingsCard}>
        {preferenceItems.map((item, index) => (
          <View key={item.key}>
            <View style={styles.toggleRow}>
              <View style={[styles.rowIcon, { backgroundColor: item.iconBackground }]}>
                <Icon name={item.icon} size={18} color={item.iconColor} strokeWidth={1.8} />
              </View>
              <View style={styles.rowTextBlock}>
                <Text style={styles.rowTitle}>{item.title}</Text>
                <Text style={styles.rowDescription}>{item.description}</Text>
              </View>
              <Switch
                value={preferences[item.key]}
                onValueChange={() => togglePreference(item.key)}
                trackColor={{ false: colors.divider, true: `${colors.primary}66` }}
                thumbColor={preferences[item.key] ? colors.primary : colors.white}
              />
            </View>
            {index < preferenceItems.length - 1 ? <View style={styles.rowDivider} /> : null}
          </View>
        ))}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.footer}>
        <AppButton title="Finish Setup" loading={finishing} onPress={handleFinish} />
      </View>
    </ScreenWrapper>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    iconRing: {
      alignItems: 'center',
      alignSelf: 'center',
      backgroundColor: colors.primaryBackground,
      borderRadius: radius.full,
      height: 56,
      justifyContent: 'center',
      marginBottom: spacing.lg,
      width: 56,
    },
    title: {
      color: colors.textDark,
      fontSize: fontSize.xl,
      fontWeight: fontWeight.bold,
      marginBottom: spacing.sm,
      textAlign: 'center',
    },
    subtitle: {
      color: colors.textMuted,
      fontSize: fontSize.sm,
      lineHeight: 20,
      marginBottom: spacing.xl,
      textAlign: 'center',
    },
    settingsCard: {
      backgroundColor: colors.cardBackground,
      borderColor: colors.borderSubtle,
      borderRadius: radius.card,
      borderWidth: 1,
      padding: spacing.sm,
    },
    toggleRow: {
      alignItems: 'center',
      flexDirection: 'row',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.md,
    },
    rowDivider: {
      backgroundColor: colors.divider,
      height: 1,
      marginHorizontal: spacing.sm,
    },
    rowIcon: {
      alignItems: 'center',
      borderRadius: radius.md,
      height: 40,
      justifyContent: 'center',
      marginRight: spacing.sm,
      width: 40,
    },
    rowTextBlock: {
      flex: 1,
      marginRight: spacing.sm,
    },
    rowTitle: {
      color: colors.textDark,
      fontSize: fontSize.md,
      fontWeight: fontWeight.semibold,
      marginBottom: 2,
    },
    rowDescription: {
      color: colors.textMuted,
      fontSize: fontSize.sm,
      lineHeight: 18,
    },
    errorText: {
      color: colors.error,
      fontSize: fontSize.sm,
      marginTop: spacing.md,
      textAlign: 'center',
    },
    footer: {
      marginTop: spacing.xl,
    },
  });
