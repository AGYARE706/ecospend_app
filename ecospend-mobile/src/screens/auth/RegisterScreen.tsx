import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';

import AuthWordmark from '../../components/auth/AuthWordmark';
import AppButton from '../../components/ui/AppButton';
import AppInput from '../../components/ui/AppInput';
import { Icon } from '../../components/ui/icons';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import {
  PRIVACY_POLICY_TEXT,
  TERMS_OF_SERVICE_TEXT,
} from '../../hooks/useHelpSupport';
import { useRegister } from '../../hooks/useRegister';
import type { AuthStackParamList } from '../../navigation/types';
import { fontSize, fontWeight, radius, spacing, useTheme, useThemedStyles } from '../../theme';
import type { ThemeColors } from '../../theme';

type RegisterScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'Register'
>;

interface RegisterScreenProps {
  navigation: RegisterScreenNavigationProp;
}

type LegalSheet = 'terms' | 'privacy' | null;

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [legalSheet, setLegalSheet] = useState<LegalSheet>(null);
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
    handleSubmit,
    getFieldError,
  } = useRegister(navigation);

  return (
    <ScreenWrapper background="white" scrollable keyboardAvoiding>
      <Pressable style={styles.backRow} onPress={() => navigation.goBack()}>
        <Icon name="chevron-left" size={20} color={colors.primary} />
        <Text style={styles.backText}>Back to log in</Text>
      </Pressable>

      <AuthWordmark />

      <Text style={styles.heading}>Create account</Text>
      <Text style={styles.subheading}>
        Join thousands of Ghanaians saving smarter
      </Text>

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
          <Text style={styles.termsLink} onPress={() => setLegalSheet('terms')}>
            Terms of Service
          </Text>{' '}
          and{' '}
          <Text style={styles.termsLink} onPress={() => setLegalSheet('privacy')}>
            Privacy Policy
          </Text>
        </Text>

        {getFieldError('form') ? (
          <Text style={styles.formError}>{getFieldError('form')}</Text>
        ) : null}

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

      <Modal
        visible={legalSheet !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setLegalSheet(null)}
      >
        <View style={styles.legalSheet}>
          <View style={styles.legalHeader}>
            <Text style={styles.legalTitle}>
              {legalSheet === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
            </Text>
            <Pressable onPress={() => setLegalSheet(null)} hitSlop={spacing.sm}>
              <Icon name="x" size={22} color={colors.textDark} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.legalContent}>
            <Text style={styles.legalBody}>
              {legalSheet === 'terms' ? TERMS_OF_SERVICE_TEXT : PRIVACY_POLICY_TEXT}
            </Text>
          </ScrollView>
        </View>
      </Modal>
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
  formError: {
    color: colors.error,
    fontSize: fontSize.sm,
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
  legalSheet: {
    backgroundColor: colors.cardBackground,
    flex: 1,
    paddingTop: spacing.lg,
  },
  legalHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  legalTitle: {
    color: colors.textDark,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  legalContent: {
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  legalBody: {
    color: colors.textGrey,
    fontSize: fontSize.sm,
    lineHeight: fontSize.xl,
  },
});
