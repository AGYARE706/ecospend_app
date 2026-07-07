import { Pressable, StyleSheet, Text, View } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';

import AuthWordmark from '../../components/auth/AuthWordmark';
import AppButton from '../../components/ui/AppButton';
import AppInput from '../../components/ui/AppInput';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import { useRegister } from '../../hooks/useRegister';
import type { AuthStackParamList } from '../../navigation/types';
import { fontSize, fontWeight, radius, spacing, useThemedStyles } from '../../theme';
import type { ThemeColors } from '../../theme';

type RegisterScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'Register'
>;

interface RegisterScreenProps {
  navigation: RegisterScreenNavigationProp;
}

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const styles = useThemedStyles(createStyles);
  const {
    name,
    setName,
    phone,
    setPhone,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    loading,
    successMessage,
    handleSubmit,
    getFieldError,
  } = useRegister(navigation);

  return (
    <ScreenWrapper background="white" scrollable keyboardAvoiding>
      <AuthWordmark />

      <Text style={styles.heading}>Create account</Text>
      <Text style={styles.subheading}>
        Join thousands of Ghanaians saving smarter
      </Text>

      {successMessage ? (
        <View style={styles.successBanner}>
          <Text style={styles.successText}>{successMessage}</Text>
        </View>
      ) : null}

      <View style={styles.form}>
        <AppInput
          label="Full Name"
          value={name}
          onChangeText={setName}
          placeholder="Enter your full name"
          error={getFieldError('name')}
        />

        <AppInput
          label="Phone Number"
          value={phone}
          onChangeText={setPhone}
          placeholder="0XX XXX XXXX"
          keyboardType="phone-pad"
          error={getFieldError('phone')}
        />

        <AppInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          secureTextEntry
          showToggle
          error={getFieldError('password')}
        />

        <AppInput
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm your password"
          secureTextEntry
          showToggle
          error={getFieldError('confirmPassword')}
        />

        <Text style={styles.termsText}>
          By creating an account, you agree to our{' '}
          <Text style={styles.termsLink} onPress={() => undefined}>
            Terms of Service
          </Text>{' '}
          and{' '}
          <Text style={styles.termsLink} onPress={() => undefined}>
            Privacy Policy
          </Text>
        </Text>

        <AppButton
          title="Create Account"
          onPress={handleSubmit}
          loading={loading}
        />

        <View style={styles.loginRow}>
          <Text style={styles.loginPrompt}>Already have an account? </Text>
          <Pressable onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Log in</Text>
          </Pressable>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  heading: {
    color: colors.textDark,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.sm,
  },
  subheading: {
    color: colors.textGrey,
    fontSize: fontSize.md,
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
  termsText: {
    color: colors.textGrey,
    fontSize: fontSize.sm,
    lineHeight: fontSize.xl,
  },
  termsLink: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
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
