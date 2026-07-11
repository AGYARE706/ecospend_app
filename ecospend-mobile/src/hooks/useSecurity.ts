import { useCallback, useMemo, useState } from 'react';

import { useAuth } from '../context/AuthContext';
import { MOCK_SAVE_DELAY_MS } from '../data/mock/mockData';

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

const MOCK_SESSIONS: ActiveSession[] = [
  {
    id: 'session-current',
    device: 'iPhone 15',
    platform: 'iOS',
    location: 'Accra, Ghana',
    lastActive: 'Active now',
    isCurrent: true,
  },
  {
    id: 'session-android',
    device: 'Samsung Galaxy A54',
    platform: 'Android',
    location: 'Kumasi, Ghana',
    lastActive: '2 days ago',
    isCurrent: false,
  },
];

export function useSecurity() {
  const { signOut } = useAuth();

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessions, setSessions] = useState(MOCK_SESSIONS);
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
    await new Promise((resolve) => setTimeout(resolve, MOCK_SAVE_DELAY_MS));
    setIsSavingPassword(false);
    setPasswordSuccessMessage('Password updated successfully.');
    resetPasswordForm();
    setShowPasswordSheet(false);
  }, [resetPasswordForm, validatePasswordForm]);

  const toggleTwoFactor = useCallback(() => {
    setTwoFactorEnabled((current) => !current);
  }, []);

  const openSessionsSheet = useCallback(() => {
    setShowSessionsSheet(true);
  }, []);

  const closeSessionsSheet = useCallback(() => {
    setShowSessionsSheet(false);
  }, []);

  const revokeSession = useCallback((sessionId: string) => {
    setSessions((current) =>
      current.filter((session) => session.id !== sessionId || session.isCurrent),
    );
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
    sessions,
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
