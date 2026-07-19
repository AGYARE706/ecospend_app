import { useCallback, useEffect, useState } from 'react';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

import * as authApi from '../api/authApi';
import { getApiErrorMessage } from '../api/getApiErrorMessage';
import { useAuth } from '../context/AuthContext';
import type { AuthStackParamList } from '../navigation/types';
import { isValidOtpCode } from '../utils/validation';

const RESEND_COOLDOWN_SECONDS = 45;

type VerifyOtpNavigationProp = StackNavigationProp<AuthStackParamList, 'VerifyOtp'>;
type VerifyOtpRouteProp = RouteProp<AuthStackParamList, 'VerifyOtp'>;

export function useVerifyOtp(route: VerifyOtpRouteProp, _navigation: VerifyOtpNavigationProp) {
  const { signIn } = useAuth();
  const { phone, purpose } = route.params;
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

  // Ticks the resend cooldown down to 0 once per second.
  useEffect(() => {
    if (cooldown <= 0) {
      return;
    }
    const timer = setTimeout(() => setCooldown((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleVerify = useCallback(async () => {
    if (!isValidOtpCode(code)) {
      setError('Enter the 6-digit code sent to your phone');
      return;
    }

    setError(undefined);
    setLoading(true);
    try {
      const auth =
        purpose === 'register'
          ? await authApi.verifyRegistrationOtp({ phoneNumber: phone, code: code.trim() })
          : await authApi.verifyLoginOtp({ phoneNumber: phone, code: code.trim() });
      await signIn(auth);
      // On success, AuthContext flips isAuthenticated and RootNavigator
      // swaps to AppNavigator on its own — no explicit navigation call needed.
    } catch (err) {
      setError(getApiErrorMessage(err, 'Invalid or expired code. Check the SMS and try again.'));
    } finally {
      setLoading(false);
    }
  }, [code, phone, purpose, signIn]);

  const handleResend = useCallback(async () => {
    if (cooldown > 0 || resending) {
      return;
    }

    setResending(true);
    setError(undefined);
    try {
      if (purpose === 'register') {
        await authApi.resendRegistrationOtp(phone);
      } else {
        await authApi.resendLoginOtp(phone);
      }
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not resend the code — try again shortly.'));
    } finally {
      setResending(false);
    }
  }, [cooldown, phone, purpose, resending]);

  return {
    phone,
    purpose,
    code,
    setCode,
    loading,
    resending,
    error,
    cooldown,
    handleVerify,
    handleResend,
  };
}
