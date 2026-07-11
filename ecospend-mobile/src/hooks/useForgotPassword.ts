import { useCallback, useState } from 'react';
import { StackNavigationProp } from '@react-navigation/stack';

import { mockRequestPasswordReset } from '../data/mock/auth';
import type { AuthStackParamList } from '../navigation/types';
import { isValidGhanaPhone, normalizePhone } from '../utils/validation';

type ForgotPasswordNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'ForgotPassword'
>;

export interface ForgotPasswordFieldErrors {
  phone?: string;
}

export function useForgotPassword(navigation: ForgotPasswordNavigationProp) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [errors, setErrors] = useState<ForgotPasswordFieldErrors>({});

  const validate = useCallback((): ForgotPasswordFieldErrors => {
    const nextErrors: ForgotPasswordFieldErrors = {};

    if (!isValidGhanaPhone(phone)) {
      nextErrors.phone = 'Enter a valid 10-digit phone number starting with 0';
    }

    return nextErrors;
  }, [phone]);

  const handleSubmit = useCallback(async () => {
    setHasAttemptedSubmit(true);
    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const normalizedPhone = normalizePhone(phone);
    setLoading(true);
    try {
      await mockRequestPasswordReset(normalizedPhone);
      navigation.navigate('ResetPassword', { phone: normalizedPhone });
    } finally {
      setLoading(false);
    }
  }, [navigation, phone, validate]);

  const getFieldError = useCallback(
    (field: keyof ForgotPasswordFieldErrors): string | undefined => {
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
    loading,
    handleSubmit,
    getFieldError,
  };
}
