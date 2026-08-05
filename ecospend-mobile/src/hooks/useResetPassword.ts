import { useCallback, useState } from 'react';
import { StackNavigationProp } from '@react-navigation/stack';

import * as authApi from '../api/authApi';
import { getApiErrorMessage } from '../api/getApiErrorMessage';
import type { AuthStackParamList } from '../navigation/types';
import { getPasswordRequirementError, isValidOtpCode } from '../utils/validation';

export const RESET_SUCCESS_NAV_DELAY_MS = 1200;

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
      nextErrors.code = 'Enter the 6-digit code sent to your email';
    }

    const passwordError = getPasswordRequirementError(password);
    if (passwordError) {
      nextErrors.password = passwordError;
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
      await authApi.resetPassword({
        phoneNumber: phone,
        code: code.trim(),
        password,
      });
      setSuccessMessage('Password updated! You can log in with your new password.');
      setTimeout(() => {
        navigation.replace('Login');
      }, RESET_SUCCESS_NAV_DELAY_MS);
    } catch (error) {
      setErrors({
        code: getApiErrorMessage(
          error,
          'Invalid or expired code. Check your email and try again.',
        ),
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
