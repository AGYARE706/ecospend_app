import type { StackScreenProps } from '@react-navigation/stack';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';

import { loginUser } from '../api/authApi';
import AppButton from '../components/AppButton';
import PhoneInput from '../components/PhoneInput';
import { useAuth } from '../context/AuthContext';
import type { AuthStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { getApiErrorMessage } from '../utils/getApiErrorMessage';
import { validatePassword, validatePhone } from '../utils/validation';

type Props = StackScreenProps<AuthStackParamList, 'Login'>;

interface FieldErrors {
  phone?: string;
  password?: string;
}

export default function LoginScreen({ navigation, route }: Props) {
  const { login: saveSession } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const message = route.params?.successMessage;
    if (message) {
      setSuccessMessage(message);
      navigation.setParams({ successMessage: undefined });
    }
  }, [navigation, route.params?.successMessage]);

  const validateForm = (): boolean => {
    const errors: FieldErrors = {
      phone: validatePhone(phone) ?? undefined,
      password: validatePassword(password) ?? undefined,
    };

    setFieldErrors(errors);
    return !errors.phone && !errors.password;
  };

  const handleLogin = async () => {
    setApiError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const data = await loginUser({ phoneNumber: phone, password });
      await saveSession(data.token, data.tier);
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
        <Text style={styles.subtitle}>Sign in to your account</Text>

        {successMessage ? (
          <Text style={styles.success}>{successMessage}</Text>
        ) : null}

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
            placeholder="Enter your password"
            placeholderTextColor={colors.textSecondary}
          />
          {fieldErrors.password ? (
            <Text style={styles.fieldError}>{fieldErrors.password}</Text>
          ) : null}
        </View>

        <AppButton title="Sign In" onPress={handleLogin} loading={loading} />

        <TouchableOpacity
          style={styles.linkContainer}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.linkText}>
            Don&apos;t have an account?{' '}
            <Text style={styles.linkHighlight}>Register</Text>
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
  success: {
    color: colors.success,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
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
