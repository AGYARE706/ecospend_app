import { useCallback, useState } from 'react';
import { StackNavigationProp } from '@react-navigation/stack';

import { mockRegister, REGISTER_SUCCESS_NAV_DELAY_MS } from '../data/mock/auth';
import type { AuthStackParamList } from '../navigation/types';
import { isValidGhanaPhone } from '../utils/validation';

type RegisterNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'Register'
>;

export interface RegisterFieldErrors {
  name?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

export function useRegister(navigation: RegisterNavigationProp) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [errors, setErrors] = useState<RegisterFieldErrors>({});
  const [successMessage, setSuccessMessage] = useState('');

  const validate = useCallback((): RegisterFieldErrors => {
    const nextErrors: RegisterFieldErrors = {};

    if (!name.trim()) {
      nextErrors.name = 'Full name is required';
    }

    if (!isValidGhanaPhone(phone)) {
      nextErrors.phone = 'Enter a valid 10-digit phone number starting with 0';
    }

    if (password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters';
    }

    if (confirmPassword !== password) {
      nextErrors.confirmPassword = 'Passwords do not match';
    }

    return nextErrors;
  }, [confirmPassword, name, password, phone]);

  const handleSubmit = useCallback(async () => {
    setHasAttemptedSubmit(true);
    setSuccessMessage('');
    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setLoading(true);
    try {
      await mockRegister({ name, phone, password });
      setSuccessMessage('Account created successfully!');
      setTimeout(() => {
        navigation.navigate('Login');
      }, REGISTER_SUCCESS_NAV_DELAY_MS);
    } finally {
      setLoading(false);
    }
  }, [name, navigation, password, phone, validate]);

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
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    loading,
    successMessage,
    handleSubmit,
    getFieldError,
  };
}
