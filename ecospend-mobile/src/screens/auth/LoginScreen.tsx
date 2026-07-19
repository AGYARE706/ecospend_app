import { Pressable, StyleSheet, Text, View } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';

import AuthWordmark from '../../components/auth/AuthWordmark';
import AppButton from '../../components/ui/AppButton';
import AppInput from '../../components/ui/AppInput';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import { useLogin } from '../../hooks/useLogin';
import type { AuthStackParamList } from '../../navigation/types';
import { fontSize, fontWeight, spacing, useThemedStyles } from '../../theme';
import type { ThemeColors } from '../../theme';

type LoginScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'Login'
>;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const styles = useThemedStyles(createStyles);
  const {
    phone,
    setPhone,
    password,
    setPassword,
    loading,
    handleSubmit,
    getFieldError,
  } = useLogin(navigation);

  return (
    <ScreenWrapper background="white" scrollable keyboardAvoiding>
      <AuthWordmark />

      <Text style={styles.heading}>Welcome back</Text>
      <Text style={styles.subheading}>Log in to your account</Text>

      <View style={styles.form}>
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

        {getFieldError('form') ? (
          <Text style={styles.formError}>{getFieldError('form')}</Text>
        ) : null}

        <Pressable
          style={styles.forgotPasswordRow}
          onPress={() => navigation.navigate('ForgotPassword')}
        >
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </Pressable>

        <AppButton title="Log in" onPress={handleSubmit} loading={loading} />

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.signUpRow}>
          <Text style={styles.signUpPrompt}>Don&apos;t have an account? </Text>
          <Pressable onPress={() => navigation.navigate('Register')}>
            <Text style={styles.signUpLink}>Sign up</Text>
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
  form: {
    gap: spacing.md,
  },
  formError: {
    color: colors.error,
    fontSize: fontSize.sm,
  },
  forgotPasswordRow: {
    alignSelf: 'flex-end',
  },
  forgotPasswordText: {
    color: colors.primary,
    fontSize: fontSize.sm,
  },
  dividerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginVertical: spacing.sm,
  },
  dividerLine: {
    backgroundColor: colors.divider,
    flex: 1,
    height: 1,
  },
  dividerText: {
    color: colors.textGrey,
    fontSize: fontSize.sm,
    marginHorizontal: spacing.md,
  },
  signUpRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signUpPrompt: {
    color: colors.textGrey,
    fontSize: fontSize.md,
  },
  signUpLink: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
});
