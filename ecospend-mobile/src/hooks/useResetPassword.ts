import { useCallback, useState } from 'react';
import { StackNavigationProp } from '@react-navigation/stack';

import {
  mockResetPassword,
  RESET_SUCCESS_NAV_DELAY_MS,
} from '../data/mock/auth';
import type { AuthStackParamList } from '../navigation/types';
import { isValidOtpCode } from '../utils/validation';

type ResetPasswordNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'ResetPassword'
>;

export interface ResetPasswordFieldErrors {
  code?: string;
  password?: string;
  confirmPassword?: string;
  form?: string;
}

export function useResetPassword(
  navigation: ResetPasswordNavigationProp,
  phone: string,
) {
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [errors, setErrors] = useState<ResetPasswordFieldErrors>({});
  const [successMessage, setSuccessMessage] = useState('');

  const validate = useCallback((): ResetPasswordFieldErrors => {
    const nextErrors: ResetPasswordFieldErrors = {};

    if (!isValidOtpCode(code)) {
      nextErrors.code = 'Enter the 6-digit code sent to your phone';
    }

    if (password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters';
    }

    if (confirmPassword !== password) {
      nextErrors.confirmPassword = 'Passwords do not match';
    }

    return nextErrors;
  }, [code, confirmPassword, password]);

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
      await mockResetPassword({ phone, code: code.trim(), password });
      setSuccessMessage('Password updated! You can log in with your new password.');
      setTimeout(() => {
        navigation.replace('Login');
      }, RESET_SUCCESS_NAV_DELAY_MS);
    } catch {
      setErrors({
        code: 'Invalid or expired code. Check the SMS and try again.',
      });
    } finally {
      setLoading(false);
    }
  }, [code, navigation, password, phone, validate]);

  const getFieldError = useCallback(
    (field: keyof ResetPasswordFieldErrors): string | undefined => {
      if (!hasAttemptedSubmit) {
        return undefined;
      }
      return errors[field];
    },
    [errors, hasAttemptedSubmit],
  );

  return {
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
  };
}
