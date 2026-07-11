import { Pressable, StyleSheet, Text, View } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';

import AuthWordmark from '../../components/auth/AuthWordmark';
import AppButton from '../../components/ui/AppButton';
import AppInput from '../../components/ui/AppInput';
import { Icon } from '../../components/ui/icons';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import { useForgotPassword } from '../../hooks/useForgotPassword';
import type { AuthStackParamList } from '../../navigation/types';
import { fontSize, fontWeight, spacing, useTheme, useThemedStyles } from '../../theme';
import type { ThemeColors } from '../../theme';

type ForgotPasswordScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'ForgotPassword'
>;

interface ForgotPasswordScreenProps {
  navigation: ForgotPasswordScreenNavigationProp;
}

export default function ForgotPasswordScreen({
  navigation,
}: ForgotPasswordScreenProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { phone, setPhone, loading, handleSubmit, getFieldError } =
    useForgotPassword(navigation);

  return (
    <ScreenWrapper background="white" scrollable keyboardAvoiding>
      <Pressable style={styles.backRow} onPress={() => navigation.goBack()}>
        <Icon name="chevron-left" size={20} color={styles.backText.color} />
        <Text style={styles.backText}>Back to log in</Text>
      </Pressable>

      <AuthWordmark />

      <Text style={styles.heading}>Forgot password?</Text>
      <Text style={styles.subheading}>
        Enter your phone number and we&apos;ll send you a verification code via SMS.
      </Text>

      <View style={styles.form}>
        <AppInput
          label="Phone Number"
          value={phone}
          onChangeText={setPhone}
          placeholder="0XX XXX XXXX"
          keyboardType="phone-pad"
          error={getFieldError('phone')}
        />

        {getFieldError('form') ? (
          <Text style={{ color: colors.error, marginBottom: 8 }}>{getFieldError('form')}</Text>
        ) : null}

        <AppButton
          title="Send verification code"
          onPress={handleSubmit}
          loading={loading}
        />

        <View style={styles.loginRow}>
          <Text style={styles.loginPrompt}>Remember your password? </Text>
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
