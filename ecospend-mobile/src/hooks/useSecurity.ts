import { useCallback, useMemo, useState } from 'react';

import { getApiErrorMessage } from '../api/getApiErrorMessage';
import * as securityApi from '../api/securityApi';
import { useAuth } from '../context/AuthContext';

export interface ActiveSession {
  id: string;
  device: string;
  platform: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface PasswordFormErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

function toActiveSession(dto: securityApi.SessionDto): ActiveSession {
  const signedIn = new Date(dto.createdAt);
  return {
    id: dto.id,
    device: dto.current ? 'This device' : 'Signed-in device',
    platform: 'Mobile',
    location: 'EcoSpend Mobile',
    lastActive: `Signed in ${signedIn.toLocaleDateString()}`,
    isCurrent: dto.current,
  };
}

export function useSecurity() {
  const { signIn, signOut } = useAuth();

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState<string | null>(null);
  const [showPasswordSheet, setShowPasswordSheet] = useState(false);
  const [showSessionsSheet, setShowSessionsSheet] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<PasswordFormErrors>({});
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState<string | null>(
    null,
  );

  const activeSessionCount = sessions.length;

  const securityStatus = useMemo(() => {
    if (twoFactorEnabled) {
      return {
        title: 'Strong protection',
        subtitle: 'Two-factor authentication is enabled on your account.',
        tone: 'strong' as const,
      };
    }

    return {
      title: 'Good, but can improve',
      subtitle: 'Enable two-factor authentication for stronger account security.',
      tone: 'moderate' as const,
    };
  }, [twoFactorEnabled]);

  const resetPasswordForm = useCallback(() => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordErrors({});
  }, []);

  const openPasswordSheet = useCallback(() => {
    resetPasswordForm();
    setPasswordSuccessMessage(null);
    setShowPasswordSheet(true);
  }, [resetPasswordForm]);

  const closePasswordSheet = useCallback(() => {
    setShowPasswordSheet(false);
    resetPasswordForm();
  }, [resetPasswordForm]);

  const validatePasswordForm = useCallback((): boolean => {
    const errors: PasswordFormErrors = {};

    if (!currentPassword.trim()) {
      errors.currentPassword = 'Enter your current password';
    }

    if (newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
    }

    if (confirmPassword !== newPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  }, [confirmPassword, currentPassword, newPassword]);

  const handleSavePassword = useCallback(async () => {
    if (!validatePasswordForm()) {
      return;
    }

    setIsSavingPassword(true);
    try {
      const response = await securityApi.changePassword({
        currentPassword,
        newPassword,
      });

      // The server revoked every session and issued this device a new pair —
      // persist it so the next token refresh doesn't sign the user out.
      await signIn({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        tier: String(response.tier),
        user: response.user,
      });

      setPasswordSuccessMessage('Password updated successfully.');
      resetPasswordForm();
      setShowPasswordSheet(false);
    } catch (error) {
      setPasswordErrors({
        currentPassword: getApiErrorMessage(error, 'Could not update password'),
      });
    } finally {
      setIsSavingPassword(false);
    }
  }, [
    currentPassword,
    newPassword,
    resetPasswordForm,
    signIn,
    validatePasswordForm,
  ]);

  const toggleTwoFactor = useCallback(() => {
    // 2FA has no backend yet — this toggle is a local placeholder.
    setTwoFactorEnabled((current) => !current);
  }, []);

  const refreshSessions = useCallback(async () => {
    setSessionsLoading(true);
    try {
      const list = await securityApi.listSessions();
      setSessions(list.map(toActiveSession));
      setSessionsError(null);
    } catch (error) {
      setSessionsError(getApiErrorMessage(error, 'Could not load sessions'));
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  const openSessionsSheet = useCallback(() => {
    setShowSessionsSheet(true);
    void refreshSessions();
  }, [refreshSessions]);

  const closeSessionsSheet = useCallback(() => {
    setShowSessionsSheet(false);
  }, []);

  const revokeSession = useCallback(async (sessionId: string) => {
    setSessions((current) =>
      current.filter((session) => session.id !== sessionId || session.isCurrent),
    );
    try {
      await securityApi.revokeSession(sessionId);
    } catch (error) {
      setSessionsError(getApiErrorMessage(error, 'Could not revoke session'));
      void refreshSessions();
    }
  }, [refreshSessions]);

  const openLogoutConfirm = useCallback(() => {
    setShowLogoutConfirm(true);
  }, []);

  const closeLogoutConfirm = useCallback(() => {
    setShowLogoutConfirm(false);
  }, []);

  const handleLogout = useCallback(() => {
    setShowLogoutConfirm(false);
    signOut();
  }, [signOut]);

  const openDeleteConfirm = useCallback(() => {
    setShowDeleteConfirm(true);
  }, []);

  const closeDeleteConfirm = useCallback(() => {
    setShowDeleteConfirm(false);
  }, []);

  const handleDeleteAccount = useCallback(async () => {
    setIsDeletingAccount(true);
    try {
      await securityApi.deleteAccount();
      setShowDeleteConfirm(false);
      await signOut();
    } catch {
      // The account may already be gone server-side; sign out regardless
      // so no session lingers on this device.
      setShowDeleteConfirm(false);
      await signOut();
    } finally {
      setIsDeletingAccount(false);
    }
  }, [signOut]);

  return {
    twoFactorEnabled,
    sessions,
    sessionsLoading,
    sessionsError,
    activeSessionCount,
    securityStatus,
    showPasswordSheet,
    showSessionsSheet,
    showLogoutConfirm,
    showDeleteConfirm,
    currentPassword,
    newPassword,
    confirmPassword,
    passwordErrors,
    isSavingPassword,
    isDeletingAccount,
    passwordSuccessMessage,
    setCurrentPassword,
    setNewPassword,
    setConfirmPassword,
    openPasswordSheet,
    closePasswordSheet,
    handleSavePassword,
    toggleTwoFactor,
    openSessionsSheet,
    closeSessionsSheet,
    revokeSession,
    openLogoutConfirm,
    closeLogoutConfirm,
    handleLogout,
    openDeleteConfirm,
    closeDeleteConfirm,
    handleDeleteAccount,
  };
}
