import { useCallback, useState } from 'react';
import { StackNavigationProp } from '@react-navigation/stack';

import * as authApi from '../api/authApi';
import { getApiErrorMessage } from '../api/getApiErrorMessage';
import { useAuth } from '../context/AuthContext';
import type { AuthStackParamList } from '../navigation/types';
import { isValidGhanaPhone, normalizePhone } from '../utils/validation';

type LoginNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

export interface LoginFieldErrors {
  phone?: string;
  password?: string;
  form?: string;
}

export function useLogin(navigation: LoginNavigationProp) {
  const { signIn } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [errors, setErrors] = useState<LoginFieldErrors>({});

  const validate = useCallback((): LoginFieldErrors => {
    const nextErrors: LoginFieldErrors = {};

    if (!isValidGhanaPhone(phone)) {
      nextErrors.phone = 'Enter a valid 10-digit phone number starting with 0';
    }

    if (!password.trim()) {
      nextErrors.password = 'Password is required';
    }

    return nextErrors;
  }, [password, phone]);

  const handleSubmit = useCallback(async () => {
    setHasAttemptedSubmit(true);
    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.login({
        phoneNumber: normalizePhone(phone),
        password,
      });

      if (response.status === 'SUCCESS' && response.auth) {
        await signIn(response.auth);
        return;
      }

      const targetPhone = response.phone ?? normalizePhone(phone);
      navigation.navigate('VerifyOtp', {
        phone: targetPhone,
        purpose: response.status === 'OTP_REQUIRED' ? 'login' : 'register',
      });
    } catch (error) {
      setErrors({ form: getApiErrorMessage(error, 'Login failed') });
    } finally {
      setLoading(false);
    }
  }, [navigation, password, phone, signIn, validate]);

  const getFieldError = useCallback(
    (field: keyof LoginFieldErrors): string | undefined => {
      if (!hasAttemptedSubmit) {
        return undefined;
      }
      return errors[field];
    },
    [errors, hasAttemptedSubmit],
  );

  return {
    phone,
    setPhone,
    password,
    setPassword,
    loading,
    hasAttemptedSubmit,
    handleSubmit,
    getFieldError,
  };
}
