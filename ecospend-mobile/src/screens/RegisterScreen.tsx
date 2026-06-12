import type { StackScreenProps } from '@react-navigation/stack';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';

import { registerUser } from '../api/authApi';
import AppButton from '../components/AppButton';
import PhoneInput from '../components/PhoneInput';
import type { AuthStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { getApiErrorMessage } from '../utils/getApiErrorMessage';
import {
  validateConfirmPassword,
  validatePassword,
  validatePhone,
} from '../utils/validation';

type Props = StackScreenProps<AuthStackParamList, 'Register'>;

interface FieldErrors {
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

export default function RegisterScreen({ navigation }: Props) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const validateForm = (): boolean => {
    const errors: FieldErrors = {
      phone: validatePhone(phone) ?? undefined,
      password: validatePassword(password) ?? undefined,
      confirmPassword:
        validateConfirmPassword(password, confirmPassword) ?? undefined,
    };

    setFieldErrors(errors);
    return !errors.phone && !errors.password && !errors.confirmPassword;
  };

  const handleRegister = async () => {
    setApiError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await registerUser({ phoneNumber: phone, password });
      navigation.navigate('Login', {
        successMessage: 'Account created. Please sign in.',
      });
    } catch (error) {
      setApiError(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>EcoSpend</Text>
        <Text style={styles.subtitle}>Create your account</Text>

        {apiError ? <Text style={styles.apiError}>{apiError}</Text> : null}

        <PhoneInput
          value={phone}
          onChangeText={setPhone}
          error={fieldErrors.phone}
        />

        <View style={styles.field}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={[
              styles.input,
              fieldErrors.password ? styles.inputError : undefined,
            ]}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Minimum 8 characters"
            placeholderTextColor={colors.textSecondary}
          />
          {fieldErrors.password ? (
            <Text style={styles.fieldError}>{fieldErrors.password}</Text>
          ) : null}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Confirm password</Text>
          <TextInput
            style={[
              styles.input,
              fieldErrors.confirmPassword ? styles.inputError : undefined,
            ]}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholder="Re-enter your password"
            placeholderTextColor={colors.textSecondary}
          />
          {fieldErrors.confirmPassword ? (
            <Text style={styles.fieldError}>{fieldErrors.confirmPassword}</Text>
          ) : null}
        </View>

        <AppButton
          title="Create Account"
          onPress={handleRegister}
          loading={loading}
        />

        <TouchableOpacity
          style={styles.linkContainer}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.linkText}>
            Already have an account?{' '}
            <Text style={styles.linkHighlight}>Sign in</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  apiError: {
    color: colors.error,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.background,
  },
  inputError: {
    borderColor: colors.error,
  },
  fieldError: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
  },
  linkContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  linkHighlight: {
    color: colors.primary,
    fontWeight: '600',
  },
});
