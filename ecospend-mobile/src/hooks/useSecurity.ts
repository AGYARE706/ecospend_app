import { useCallback, useEffect, useMemo, useState } from 'react';

import * as sessionsApi from '../api/sessionsApi';
import type { ApiSession } from '../api/sessionsApi';
import * as usersApi from '../api/usersApi';
import { useAppLock } from '../context/AppLockContext';
import { useAuth } from '../context/AuthContext';
import { MOCK_SAVE_DELAY_MS } from '../data/mock/mockData';
import { formatNotificationTime } from '../utils/notifications';

export interface ActiveSession {
  id: string;
  device: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface SessionHistoryEntry {
  id: string;
  device: string;
  loggedInAt: string;
  revoked: boolean;
}

export interface PasswordFormErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

function mapSession(session: ApiSession): ActiveSession {
  return {
    id: session.id,
    device: session.deviceLabel ?? 'Unknown device',
    lastActive: formatNotificationTime(session.lastUsedAt ?? session.createdAt),
    isCurrent: session.isCurrent,
  };
}

function mapHistoryEntry(session: ApiSession): SessionHistoryEntry {
  return {
    id: session.id,
    device: session.deviceLabel ?? 'Unknown device',
    loggedInAt: formatNotificationTime(session.createdAt),
    revoked: session.revokedAt != null,
  };
}

export function useSecurity() {
  const { signOut } = useAuth();
  const {
    biometricLockEnabled,
    biometricAvailable,
    setBiometricLockEnabled: persistBiometricLock,
  } = useAppLock();

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorSaving, setTwoFactorSaving] = useState(false);
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [loginHistory, setLoginHistory] = useState<SessionHistoryEntry[]>([]);
  const [loginHistoryLoading, setLoginHistoryLoading] = useState(false);
  const [showPasswordSheet, setShowPasswordSheet] = useState(false);
  const [showSessionsSheet, setShowSessionsSheet] = useState(false);
  const [showLoginHistorySheet, setShowLoginHistorySheet] = useState(false);
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

  // The auth response never carries twoFactorEnabled (only name+phone) —
  // fetch the real value from the profile once this screen is opened.
  useEffect(() => {
    let cancelled = false;
    void usersApi.getMe().then((profile) => {
      if (!cancelled) {
        setTwoFactorEnabled(profile.twoFactorEnabled);
      }
    }).catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const refreshSessions = useCallback(async () => {
    try {
      const list = await sessionsApi.listSessions();
      setSessions(list.map(mapSession));
    } catch {
      // Keep whatever was already shown — a failed refresh isn't worth surfacing here.
    }
  }, []);

  useEffect(() => {
    void refreshSessions();
  }, [refreshSessions]);

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
    await new Promise((resolve) => setTimeout(resolve, MOCK_SAVE_DELAY_MS));
    setIsSavingPassword(false);
    setPasswordSuccessMessage('Password updated successfully.');
    resetPasswordForm();
    setShowPasswordSheet(false);
  }, [resetPasswordForm, validatePasswordForm]);

  const toggleTwoFactor = useCallback(async () => {
    const next = !twoFactorEnabled;
    setTwoFactorEnabled(next);
    setTwoFactorSaving(true);
    try {
      const profile = await usersApi.updateTwoFactor(next);
      setTwoFactorEnabled(profile.twoFactorEnabled);
    } catch {
      // Roll back — the toggle didn't actually take on the server.
      setTwoFactorEnabled(!next);
    } finally {
      setTwoFactorSaving(false);
    }
  }, [twoFactorEnabled]);

  const toggleBiometricLock = useCallback(async () => {
    await persistBiometricLock(!biometricLockEnabled);
  }, [biometricLockEnabled, persistBiometricLock]);

  const openSessionsSheet = useCallback(() => {
    setShowSessionsSheet(true);
    void refreshSessions();
  }, [refreshSessions]);

  const closeSessionsSheet = useCallback(() => {
    setShowSessionsSheet(false);
  }, []);

  const revokeSession = useCallback(
    async (sessionId: string) => {
      const previous = sessions;
      setSessions((current) =>
        current.filter((session) => session.id !== sessionId || session.isCurrent),
      );
      try {
        await sessionsApi.revokeSession(sessionId);
      } catch {
        setSessions(previous);
      }
    },
    [sessions],
  );

  const openLoginHistorySheet = useCallback(() => {
    setShowLoginHistorySheet(true);
    setLoginHistoryLoading(true);
    sessionsApi
      .getLoginHistory()
      .then((list) => setLoginHistory(list.map(mapHistoryEntry)))
      .catch(() => undefined)
      .finally(() => setLoginHistoryLoading(false));
  }, []);

  const closeLoginHistorySheet = useCallback(() => {
    setShowLoginHistorySheet(false);
  }, []);

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
    await new Promise((resolve) => setTimeout(resolve, MOCK_SAVE_DELAY_MS));
    setIsDeletingAccount(false);
    setShowDeleteConfirm(false);
    signOut();
  }, [signOut]);

  return {
    twoFactorEnabled,
    twoFactorSaving,
    biometricLockEnabled,
    biometricAvailable,
    toggleBiometricLock,
    sessions,
    activeSessionCount,
    loginHistory,
    loginHistoryLoading,
    securityStatus,
    showPasswordSheet,
    showSessionsSheet,
    showLoginHistorySheet,
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
    openLoginHistorySheet,
    closeLoginHistorySheet,
    openLogoutConfirm,
    closeLogoutConfirm,
    handleLogout,
    openDeleteConfirm,
    closeDeleteConfirm,
    handleDeleteAccount,
  };
}
