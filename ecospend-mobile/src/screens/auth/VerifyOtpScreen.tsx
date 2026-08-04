import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

import AuthWordmark from '../../components/auth/AuthWordmark';
import AppButton from '../../components/ui/AppButton';
import AppInput from '../../components/ui/AppInput';
import { Icon } from '../../components/ui/icons';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import { useVerifyOtp } from '../../hooks/useVerifyOtp';
import type { AuthStackParamList } from '../../navigation/types';
import { fontSize, fontWeight, spacing, useThemedStyles } from '../../theme';
import type { ThemeColors } from '../../theme';

type VerifyOtpNavigationProp = StackNavigationProp<AuthStackParamList, 'VerifyOtp'>;
type VerifyOtpRouteProp = RouteProp<AuthStackParamList, 'VerifyOtp'>;

export default function VerifyOtpScreen() {
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation<VerifyOtpNavigationProp>();
  const route = useRoute<VerifyOtpRouteProp>();
  const {
    phone,
    purpose,
    code,
    setCode,
    loading,
    resending,
    error,
    cooldown,
    handleVerify,
    handleResend,
  } = useVerifyOtp(route, navigation);

  const heading = purpose === 'register' ? 'Verify your email' : 'Enter your login code';
  const subheading =
    purpose === 'register'
      ? `We emailed a 6-digit code to confirm it's really you. It expires in 10 minutes.`
      : `Two-factor authentication is on for this account. Enter the code we emailed you.`;

  return (
    <ScreenWrapper background="white" scrollable keyboardAvoiding>
      <Pressable style={styles.backRow} onPress={() => navigation.goBack()}>
        <Icon name="chevron-left" size={20} color={styles.backText.color} />
        <Text style={styles.backText}>Back</Text>
      </Pressable>

      <AuthWordmark />

      <Text style={styles.heading}>{heading}</Text>
      <Text style={styles.subheading}>{subheading}</Text>

      <View style={styles.form}>
        <AppInput
          label="Verification code"
          value={code}
          onChangeText={setCode}
          placeholder="123456"
          keyboardType="number-pad"
          maxLength={6}
          error={error}
          hint={__DEV__ ? 'Dev: OTP is logged by identity-service unless a real email provider is configured' : undefined}
        />

        <AppButton title="Verify" onPress={handleVerify} loading={loading} />

        <View style={styles.resendRow}>
          <Text style={styles.resendPrompt}>Didn&apos;t get a code? </Text>
          {cooldown > 0 ? (
            <Text style={styles.resendCooldown}>Resend in {cooldown}s</Text>
          ) : (
            <Pressable onPress={handleResend} disabled={resending}>
              <Text style={styles.resendLink}>{resending ? 'Sending…' : 'Resend'}</Text>
            </Pressable>
          )}
        </View>
      </View>
    </ScreenWrapper>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    backRow: {
      alignItems: 'center',
      alignSelf: 'flex-start',
      flexDirection: 'row',
      gap: spacing.xs,
      marginBottom: spacing.md,
    },
    backText: {
      color: colors.primary,
      fontSize: fontSize.sm,
      fontWeight: fontWeight.medium,
    },
    heading: {
      color: colors.textDark,
      fontSize: fontSize.xxl,
      fontWeight: fontWeight.bold,
      marginBottom: spacing.sm,
    },
    subheading: {
      color: colors.textGrey,
      fontSize: fontSize.md,
      lineHeight: fontSize.xl,
      marginBottom: spacing.xl,
    },
    form: {
      gap: spacing.md,
    },
    resendRow: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
    },
    resendPrompt: {
      color: colors.textGrey,
      fontSize: fontSize.md,
    },
    resendLink: {
      color: colors.primary,
      fontSize: fontSize.md,
      fontWeight: fontWeight.bold,
    },
    resendCooldown: {
      color: colors.textLight,
      fontSize: fontSize.sm,
    },
  });
