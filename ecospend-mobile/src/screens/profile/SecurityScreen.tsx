import { type ReactNode } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import AppButton from '../../components/ui/AppButton';
import AppInput from '../../components/ui/AppInput';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import {
  type ActiveSession,
  type SessionHistoryEntry,
  useSecurity,
} from '../../hooks/useSecurity';
import type { ProfileStackParamList } from '../../navigation/types';
import {
  cardShadow,
  fontSize,
  fontWeight,
  radius,
  shadowMd,
  shadowSm,
  spacing,
  useTheme,
  useThemedStyles,
} from '../../theme';
import type { ThemeColors } from '../../theme';

type SecurityNavProp = StackNavigationProp<ProfileStackParamList, 'Security'>;

export default function SecurityScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation<SecurityNavProp>();
  const {
    twoFactorEnabled,
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
  } = useSecurity();

  return (
    <ScreenWrapper background="page" padded={false} edges={['top']}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]}
            hitSlop={spacing.sm}
          >
            <Ionicons name="chevron-back" size={24} color={colors.textDark} />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Security</Text>
            <Text style={styles.headerSub}>Protect your EcoSpend account</Text>
          </View>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <SecurityStatusCard
            title={securityStatus.title}
            subtitle={securityStatus.subtitle}
            tone={securityStatus.tone}
            twoFactorEnabled={twoFactorEnabled}
          />

          {passwordSuccessMessage ? (
            <View style={styles.successBanner}>
              <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
              <Text style={styles.successBannerText}>{passwordSuccessMessage}</Text>
            </View>
          ) : null}

          <SectionLabel title="Security Options" icon="shield-checkmark-outline" />

          <View style={styles.settingsCard}>
            <SettingsRow
              icon="key-outline"
              iconColor={colors.blue}
              iconBackground={colors.blueLight}
              title="Change Password"
              subtitle="Update your login password"
              onPress={openPasswordSheet}
              showChevron
            />
            <View style={styles.rowDivider} />
            <SettingsRow
              icon="phone-portrait-outline"
              iconColor={colors.primary}
              iconBackground={colors.primaryBackground}
              title="Two-Factor Authentication"
              subtitle={
                twoFactorEnabled
                  ? 'Enabled via SMS verification'
                  : 'Add an extra layer of protection'
              }
              trailing={
                <Switch
                  value={twoFactorEnabled}
                  onValueChange={toggleTwoFactor}
                  trackColor={{ false: colors.divider, true: `${colors.primary}66` }}
                  thumbColor={twoFactorEnabled ? colors.primary : colors.white}
                />
              }
            />
            <View style={styles.rowDivider} />
            <SettingsRow
              icon="finger-print-outline"
              iconColor={colors.success}
              iconBackground={colors.successLight}
              title="App Lock"
              subtitle={
                !biometricAvailable
                  ? 'Set up Face ID or a fingerprint on this device first'
                  : biometricLockEnabled
                    ? 'Face ID / fingerprint required to open the app'
                    : 'Require Face ID or fingerprint to open the app'
              }
              trailing={
                <Switch
                  value={biometricLockEnabled}
                  onValueChange={toggleBiometricLock}
                  disabled={!biometricAvailable}
                  trackColor={{ false: colors.divider, true: `${colors.primary}66` }}
                  thumbColor={biometricLockEnabled ? colors.primary : colors.white}
                />
              }
            />
            <View style={styles.rowDivider} />
            <SettingsRow
              icon="laptop-outline"
              iconColor={colors.purple}
              iconBackground={colors.purpleLight}
              title="Active Sessions"
              subtitle={`${activeSessionCount} device${activeSessionCount === 1 ? '' : 's'} signed in`}
              onPress={openSessionsSheet}
              showChevron
            />
            <View style={styles.rowDivider} />
            <SettingsRow
              icon="time-outline"
              iconColor={colors.blue}
              iconBackground={colors.blueLight}
              title="Login History"
              subtitle="See when and where you've signed in"
              onPress={openLoginHistorySheet}
              showChevron
              isLast
            />
          </View>

          <SectionLabel title="Danger Zone" icon="warning-outline" danger />

          <View style={[styles.settingsCard, styles.dangerCard]}>
            <SettingsRow
              icon="log-out-outline"
              iconColor={colors.warning}
              iconBackground={colors.warningLight}
              title="Logout"
              subtitle="Sign out on this device"
              onPress={openLogoutConfirm}
              showChevron
            />
            <View style={styles.rowDivider} />
            <SettingsRow
              icon="trash-outline"
              iconColor={colors.error}
              iconBackground={colors.errorLight}
              title="Delete Account"
              subtitle="Permanently remove your account and data"
              onPress={openDeleteConfirm}
              showChevron
              destructive
              isLast
            />
          </View>

          <Text style={styles.footerHint}>
            For account recovery help, contact support from Help & Support in your
            profile.
          </Text>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>

      <PasswordSheet
        visible={showPasswordSheet}
        currentPassword={currentPassword}
        newPassword={newPassword}
        confirmPassword={confirmPassword}
        errors={passwordErrors}
        loading={isSavingPassword}
        onChangeCurrent={setCurrentPassword}
        onChangeNew={setNewPassword}
        onChangeConfirm={setConfirmPassword}
        onClose={closePasswordSheet}
        onSave={handleSavePassword}
      />

      <SessionsSheet
        visible={showSessionsSheet}
        sessions={sessions}
        onClose={closeSessionsSheet}
        onRevoke={revokeSession}
      />

      <LoginHistorySheet
        visible={showLoginHistorySheet}
        entries={loginHistory}
        loading={loginHistoryLoading}
        onClose={closeLoginHistorySheet}
      />

      <ConfirmSheet
        visible={showLogoutConfirm}
        title="Log out?"
        message="You'll need to sign in again to access your EcoSpend account on this device."
        confirmLabel="Log Out"
        confirmVariant="warning"
        onClose={closeLogoutConfirm}
        onConfirm={handleLogout}
      />

      <ConfirmSheet
        visible={showDeleteConfirm}
        title="Delete account?"
        message="This action is permanent. All your goals, vaults, transactions, and profile data will be removed."
        confirmLabel="Delete Account"
        confirmVariant="danger"
        loading={isDeletingAccount}
        onClose={closeDeleteConfirm}
        onConfirm={handleDeleteAccount}
      />
    </ScreenWrapper>
  );
}

function SecurityStatusCard({
  title,
  subtitle,
  tone,
  twoFactorEnabled,
}: {
  title: string;
  subtitle: string;
  tone: 'strong' | 'moderate';
  twoFactorEnabled: boolean;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const gradientColors =
    tone === 'strong'
      ? ([colors.heroGradientStart, colors.heroGradientMid, colors.heroGradientEnd] as const)
      : ([colors.heroBlueStart, colors.heroBlueMid, colors.heroGradientMid] as const);

  return (
    <LinearGradient
      colors={[...gradientColors]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.statusCard}
    >
      <View style={styles.statusTopRow}>
        <View style={styles.statusIconRing}>
          <Ionicons name="shield-checkmark" size={22} color={colors.white} />
        </View>
        <View style={styles.statusTextBlock}>
          <Text style={styles.statusEyebrow}>Account Security</Text>
          <Text style={styles.statusTitle}>{title}</Text>
        </View>
        <View style={styles.statusPill}>
          <Text style={styles.statusPillText}>
            {twoFactorEnabled ? '2FA On' : '2FA Off'}
          </Text>
        </View>
      </View>
      <Text style={styles.statusSubtitle}>{subtitle}</Text>
    </LinearGradient>
  );
}

function SettingsRow({
  icon,
  iconColor,
  iconBackground,
  title,
  subtitle,
  onPress,
  showChevron = false,
  trailing,
  destructive = false,
  isLast = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBackground: string;
  title: string;
  subtitle: string;
  onPress?: () => void;
  showChevron?: boolean;
  trailing?: ReactNode;
  destructive?: boolean;
  isLast?: boolean;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const content = (
    <>
      <View style={[styles.rowIcon, { backgroundColor: iconBackground }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <View style={styles.rowTextBlock}>
        <Text style={[styles.rowTitle, destructive && styles.rowTitleDanger]}>
          {title}
        </Text>
        <Text style={styles.rowSubtitle}>{subtitle}</Text>
      </View>
      {trailing ??
        (showChevron ? (
          <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
        ) : null)}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.settingsRow,
          !isLast && styles.settingsRowSpacing,
          pressed && styles.settingsRowPressed,
        ]}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View style={[styles.settingsRow, !isLast && styles.settingsRowSpacing]}>
      {content}
    </View>
  );
}

function SectionLabel({
  title,
  icon,
  danger = false,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  danger?: boolean;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.sectionLabel}>
      <View
        style={[
          styles.sectionIconBadge,
          danger && styles.sectionIconBadgeDanger,
        ]}
      >
        <Ionicons
          name={icon}
          size={14}
          color={danger ? colors.error : colors.primary}
        />
      </View>
      <Text style={[styles.sectionLabelText, danger && styles.sectionLabelDanger]}>
        {title}
      </Text>
    </View>
  );
}

function PasswordSheet({
  visible,
  currentPassword,
  newPassword,
  confirmPassword,
  errors,
  loading,
  onChangeCurrent,
  onChangeNew,
  onChangeConfirm,
  onClose,
  onSave,
}: {
  visible: boolean;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  errors: { currentPassword?: string; newPassword?: string; confirmPassword?: string };
  loading: boolean;
  onChangeCurrent: (value: string) => void;
  onChangeNew: (value: string) => void;
  onChangeConfirm: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  const styles = useThemedStyles(createStyles);
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Change Password</Text>
          <Text style={styles.sheetSubtitle}>
            Choose a strong password you have not used elsewhere.
          </Text>

          <AppInput
            label="Current Password"
            value={currentPassword}
            onChangeText={onChangeCurrent}
            placeholder="Enter current password"
            secureTextEntry
            showToggle
            error={errors.currentPassword}
          />
          <AppInput
            label="New Password"
            value={newPassword}
            onChangeText={onChangeNew}
            placeholder="At least 8 characters"
            secureTextEntry
            showToggle
            error={errors.newPassword}
          />
          <AppInput
            label="Confirm New Password"
            value={confirmPassword}
            onChangeText={onChangeConfirm}
            placeholder="Re-enter new password"
            secureTextEntry
            showToggle
            error={errors.confirmPassword}
          />

          <AppButton title="Update Password" loading={loading} onPress={onSave} />
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [styles.sheetCancel, pressed && styles.sheetCancelPressed]}
          >
            <Text style={styles.sheetCancelText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function SessionsSheet({
  visible,
  sessions,
  onClose,
  onRevoke,
}: {
  visible: boolean;
  sessions: ActiveSession[];
  onClose: () => void;
  onRevoke: (sessionId: string) => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        <View style={styles.sheetLarge}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Active Sessions</Text>
          <Text style={styles.sheetSubtitle}>
            Devices currently signed in to your EcoSpend account.
          </Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {sessions.map((session, index) => (
              <View
                key={session.id}
                style={[
                  styles.sessionCard,
                  index < sessions.length - 1 && styles.sessionCardGap,
                ]}
              >
                <View style={styles.sessionTopRow}>
                  <View style={styles.sessionIcon}>
                    <Ionicons name="phone-portrait-outline" size={18} color={colors.primary} />
                  </View>
                  <View style={styles.sessionTextBlock}>
                    <Text style={styles.sessionDevice}>{session.device}</Text>
                    <Text style={styles.sessionMeta}>{session.lastActive}</Text>
                  </View>
                  {session.isCurrent ? (
                    <View style={styles.currentBadge}>
                      <Text style={styles.currentBadgeText}>This device</Text>
                    </View>
                  ) : (
                    <Pressable
                      onPress={() => onRevoke(session.id)}
                      style={({ pressed }) => [
                        styles.revokeBtn,
                        pressed && styles.revokeBtnPressed,
                      ]}
                    >
                      <Text style={styles.revokeBtnText}>Revoke</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>

          <Pressable
            onPress={onClose}
            style={({ pressed }) => [styles.sheetCancel, pressed && styles.sheetCancelPressed]}
          >
            <Text style={styles.sheetCancelText}>Done</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function LoginHistorySheet({
  visible,
  entries,
  loading,
  onClose,
}: {
  visible: boolean;
  entries: SessionHistoryEntry[];
  loading: boolean;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        <View style={styles.sheetLarge}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Login History</Text>
          <Text style={styles.sheetSubtitle}>
            Every time you've signed in to your EcoSpend account.
          </Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {loading ? (
              <Text style={styles.sessionMeta}>Loading…</Text>
            ) : (
              entries.map((entry, index) => (
                <View
                  key={entry.id}
                  style={[
                    styles.sessionCard,
                    index < entries.length - 1 && styles.sessionCardGap,
                  ]}
                >
                  <View style={styles.sessionTopRow}>
                    <View style={styles.sessionIcon}>
                      <Ionicons name="log-in-outline" size={18} color={colors.primary} />
                    </View>
                    <View style={styles.sessionTextBlock}>
                      <Text style={styles.sessionDevice}>{entry.device}</Text>
                      <Text style={styles.sessionMeta}>{entry.loggedInAt}</Text>
                    </View>
                    {entry.revoked ? (
                      <View style={styles.currentBadge}>
                        <Text style={styles.currentBadgeText}>Revoked</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              ))
            )}
          </ScrollView>

          <Pressable
            onPress={onClose}
            style={({ pressed }) => [styles.sheetCancel, pressed && styles.sheetCancelPressed]}
          >
            <Text style={styles.sheetCancelText}>Done</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function ConfirmSheet({
  visible,
  title,
  message,
  confirmLabel,
  confirmVariant,
  loading = false,
  onClose,
  onConfirm,
}: {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  confirmVariant: 'warning' | 'danger';
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const isDanger = confirmVariant === 'danger';

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.confirmOverlay}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        <View style={styles.confirmCard}>
          <View
            style={[
              styles.confirmIconRing,
              isDanger ? styles.confirmIconRingDanger : styles.confirmIconRingWarning,
            ]}
          >
            <Ionicons
              name={isDanger ? 'trash-outline' : 'log-out-outline'}
              size={22}
              color={isDanger ? colors.error : colors.warning}
            />
          </View>
          <Text style={styles.confirmTitle}>{title}</Text>
          <Text style={styles.confirmMessage}>{message}</Text>

          <AppButton
            title={confirmLabel}
            loading={loading}
            onPress={onConfirm}
            style={[
              styles.confirmPrimaryBtn,
              isDanger ? styles.confirmPrimaryBtnDanger : styles.confirmPrimaryBtnWarning,
            ]}
          />
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [styles.sheetCancel, pressed && styles.sheetCancelPressed]}
          >
            <Text style={styles.sheetCancelText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    borderBottomColor: colors.borderSubtle,
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backBtn: {
    alignItems: 'center',
    borderRadius: radius.full,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  backBtnPressed: {
    backgroundColor: colors.chipBg,
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    color: colors.textDark,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  headerSub: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  headerRight: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  statusCard: {
    borderRadius: radius.heroCard,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    padding: spacing.lg,
    ...shadowMd,
  },
  statusGlow: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radius.full,
    height: 100,
    position: 'absolute',
    right: -24,
    top: -24,
    width: 100,
  },
  statusTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  statusIconRing: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: radius.full,
    height: 44,
    justifyContent: 'center',
    marginRight: spacing.sm,
    width: 44,
  },
  statusTextBlock: {
    flex: 1,
  },
  statusEyebrow: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    marginBottom: 2,
    opacity: 0.82,
    textTransform: 'uppercase',
  },
  statusTitle: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  statusPill: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  statusPillText: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  statusSubtitle: {
    color: colors.white,
    fontSize: fontSize.sm,
    lineHeight: 20,
    opacity: 0.9,
  },
  successBanner: {
    alignItems: 'center',
    backgroundColor: colors.primaryBackground,
    borderColor: `${colors.primary}33`,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  successBannerText: {
    color: colors.primary,
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  sectionLabel: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionIconBadge: {
    alignItems: 'center',
    backgroundColor: colors.primaryBackground,
    borderRadius: radius.full,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  sectionIconBadgeDanger: {
    backgroundColor: colors.errorLight,
  },
  sectionLabelText: {
    color: colors.textDark,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  sectionLabelDanger: {
    color: colors.error,
  },
  settingsCard: {
    backgroundColor: colors.cardBackground,
    borderColor: colors.borderSubtle,
    borderRadius: radius.card,
    borderWidth: 1,
    marginBottom: spacing.xl,
    padding: spacing.sm,
    ...cardShadow,
  },
  dangerCard: {
    borderColor: `${colors.error}22`,
  },
  settingsRow: {
    alignItems: 'center',
    borderRadius: radius.md,
    flexDirection: 'row',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
  },
  settingsRowSpacing: {},
  settingsRowPressed: {
    backgroundColor: colors.chipBg,
  },
  rowDivider: {
    backgroundColor: colors.divider,
    height: 1,
    marginHorizontal: spacing.sm,
  },
  rowIcon: {
    alignItems: 'center',
    borderRadius: radius.md,
    height: 40,
    justifyContent: 'center',
    marginRight: spacing.sm,
    width: 40,
  },
  rowTextBlock: {
    flex: 1,
    marginRight: spacing.sm,
  },
  rowTitle: {
    color: colors.textDark,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    marginBottom: 2,
  },
  rowTitleDanger: {
    color: colors.error,
  },
  rowSubtitle: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  footerHint: {
    color: colors.textLight,
    fontSize: fontSize.xs,
    lineHeight: 18,
    textAlign: 'center',
  },
  bottomSpacer: {
    height: spacing.xxl,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  confirmOverlay: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  sheet: {
    backgroundColor: colors.cardBackground,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    ...shadowMd,
  },
  sheetLarge: {
    backgroundColor: colors.cardBackground,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    maxHeight: '78%',
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    ...shadowMd,
  },
  sheetHandle: {
    alignSelf: 'center',
    backgroundColor: colors.divider,
    borderRadius: radius.full,
    height: 4,
    marginBottom: spacing.md,
    width: 40,
  },
  sheetTitle: {
    color: colors.textDark,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
  },
  sheetSubtitle: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  sheetCancel: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  sheetCancelPressed: {
    opacity: 0.6,
  },
  sheetCancelText: {
    color: colors.textGrey,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  sessionCard: {
    backgroundColor: colors.pageBackground,
    borderColor: colors.borderSubtle,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
  },
  sessionCardGap: {
    marginBottom: spacing.sm,
  },
  sessionTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  sessionIcon: {
    alignItems: 'center',
    backgroundColor: colors.primaryBackground,
    borderRadius: radius.full,
    height: 36,
    justifyContent: 'center',
    marginRight: spacing.sm,
    width: 36,
  },
  sessionTextBlock: {
    flex: 1,
  },
  sessionDevice: {
    color: colors.textDark,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    marginBottom: 2,
  },
  sessionMeta: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
  currentBadge: {
    backgroundColor: colors.primaryBackground,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  currentBadgeText: {
    color: colors.primary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  revokeBtn: {
    backgroundColor: colors.errorLight,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  revokeBtnPressed: {
    opacity: 0.85,
  },
  revokeBtnText: {
    color: colors.error,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  confirmCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: radius.card,
    padding: spacing.lg,
    width: '100%',
    ...shadowMd,
  },
  confirmIconRing: {
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: radius.full,
    height: 56,
    justifyContent: 'center',
    marginBottom: spacing.md,
    width: 56,
  },
  confirmIconRingDanger: {
    backgroundColor: colors.errorLight,
  },
  confirmIconRingWarning: {
    backgroundColor: colors.warningLight,
  },
  confirmTitle: {
    color: colors.textDark,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  confirmMessage: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    lineHeight: 20,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  confirmPrimaryBtn: {
    backgroundColor: colors.warning,
  },
  confirmPrimaryBtnWarning: {
    backgroundColor: colors.warning,
  },
  confirmPrimaryBtnDanger: {
    backgroundColor: colors.error,
  },
});
