import { useCallback, useState } from 'react';
import { StackNavigationProp } from '@react-navigation/stack';

import * as authApi from '../api/authApi';
import { getApiErrorMessage } from '../api/getApiErrorMessage';
import type { AuthStackParamList } from '../navigation/types';
import { getPasswordRequirementError, isValidEmail, isValidGhanaPhone, normalizePhone } from '../utils/validation';

type RegisterNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'Register'
>;

export interface RegisterFieldErrors {
  name?: string;
  phone?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  form?: string;
}

export function useRegister(navigation: RegisterNavigationProp) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [errors, setErrors] = useState<RegisterFieldErrors>({});

  const validate = useCallback((): RegisterFieldErrors => {
    const nextErrors: RegisterFieldErrors = {};

    if (!name.trim()) {
      nextErrors.name = 'Full name is required';
    }

    if (!isValidGhanaPhone(phone)) {
      nextErrors.phone = 'Enter a valid 10-digit phone number starting with 0';
    }

    if (!email.trim()) {
      nextErrors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      nextErrors.email = 'Enter a valid email address';
    }

    const passwordError = getPasswordRequirementError(password);
    if (passwordError) {
      nextErrors.password = passwordError;
    }

    if (confirmPassword !== password) {
      nextErrors.confirmPassword = 'Passwords do not match';
    }

    return nextErrors;
  }, [confirmPassword, email, name, password, phone]);

  const handleSubmit = useCallback(async () => {
    setHasAttemptedSubmit(true);
    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setLoading(true);
    try {
      const normalizedPhone = normalizePhone(phone);
      await authApi.register({
        name: name.trim(),
        phoneNumber: normalizedPhone,
        email: email.trim().toLowerCase(),
        password,
      });
      navigation.navigate('VerifyOtp', { phone: normalizedPhone, purpose: 'register' });
    } catch (error) {
      setErrors({ form: getApiErrorMessage(error, 'Registration failed') });
    } finally {
      setLoading(false);
    }
  }, [email, name, navigation, password, phone, validate]);

  const getFieldError = useCallback(
    (field: keyof RegisterFieldErrors): string | undefined => {
      if (!hasAttemptedSubmit) {
        return undefined;
      }
      return errors[field];
    },
    [errors, hasAttemptedSubmit],
  );

  return {
    name,
    setName,
    phone,
    setPhone,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    loading,
    handleSubmit,
    getFieldError,
  };
}
