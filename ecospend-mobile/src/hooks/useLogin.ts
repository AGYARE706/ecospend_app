import { useCallback, useState } from 'react';

import { useAuth } from '../context/AuthContext';
import { mockLogin } from '../data/mock/auth';
import { isValidGhanaPhone } from '../utils/validation';

export interface LoginFieldErrors {
  phone?: string;
  password?: string;
}

export function useLogin() {
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
      const response = await mockLogin(phone, password);
      signIn(response.user);
    } finally {
      setLoading(false);
    }
  }, [password, phone, signIn, validate]);

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
