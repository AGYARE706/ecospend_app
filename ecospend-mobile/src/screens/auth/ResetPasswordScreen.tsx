import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import AuthWordmark from '../../components/auth/AuthWordmark';
import AppButton from '../../components/ui/AppButton';
import AppInput from '../../components/ui/AppInput';
import { Icon } from '../../components/ui/icons';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import { useResetPassword } from '../../hooks/useResetPassword';
import type { AuthStackParamList } from '../../navigation/types';
import { fontSize, fontWeight, radius, spacing, useThemedStyles } from '../../theme';
import type { ThemeColors } from '../../theme';
import { maskPhone } from '../../utils/strings';

type ResetPasswordScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'ResetPassword'
>;
type ResetPasswordRouteProp = RouteProp<AuthStackParamList, 'ResetPassword'>;

interface ResetPasswordScreenProps {
  navigation: ResetPasswordScreenNavigationProp;
  route: ResetPasswordRouteProp;
}

export default function ResetPasswordScreen({
  navigation,
  route,
}: ResetPasswordScreenProps) {
  const styles = useThemedStyles(createStyles);
  const { phone } = route.params;
  const {
    code,
    setCode,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    loading,
    successMessage,
    handleSubmit,
    getFieldError,
  } = useResetPassword(navigation, phone);

  return (
    <ScreenWrapper background="white" scrollable keyboardAvoiding>
      <Pressable style={styles.backRow} onPress={() => navigation.goBack()}>
        <Icon name="chevron-left" size={20} color={styles.backText.color} />
        <Text style={styles.backText}>Back</Text>
      </Pressable>

      <AuthWordmark />

      <Text style={styles.heading}>Reset password</Text>
      <Text style={styles.subheading}>
        Enter the 6-digit code sent to your email and choose a new password.
      </Text>

      {successMessage ? (
        <View style={styles.successBanner}>
          <Text style={styles.successText}>{successMessage}</Text>
        </View>
      ) : null}

      <View style={styles.form}>
        <AppInput
          label="Verification code"
          value={code}
          onChangeText={setCode}
          placeholder="123456"
          keyboardType="number-pad"
          maxLength={6}
          error={getFieldError('code')}
          hint={__DEV__ ? 'Dev: OTP is logged by the identity service' : undefined}
        />

        <AppInput
          label="New password"
          value={password}
          onChangeText={setPassword}
          placeholder="At least 8 characters"
          secureTextEntry
          showToggle
          error={getFieldError('password')}
        />

        <AppInput
          label="Confirm new password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Re-enter your new password"
          secureTextEntry
          showToggle
          error={getFieldError('confirmPassword')}
        />

        <AppButton
          title="Update password"
          onPress={handleSubmit}
          loading={loading}
        />

        <View style={styles.loginRow}>
          <Text style={styles.loginPrompt}>Didn&apos;t get a code? </Text>
          <Pressable onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.loginLink}>Resend</Text>
          </Pressable>
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
    successBanner: {
      backgroundColor: colors.successLight,
      borderRadius: radius.sm,
      marginBottom: spacing.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    successText: {
      color: colors.success,
      fontSize: fontSize.sm,
      textAlign: 'center',
    },
    form: {
      gap: spacing.md,
    },
    loginRow: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
    },
    loginPrompt: {
      color: colors.textGrey,
      fontSize: fontSize.md,
    },
    loginLink: {
      color: colors.primary,
      fontSize: fontSize.md,
      fontWeight: fontWeight.bold,
    },
  });
