import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useCallback, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import AppButton from '../../components/ui/AppButton';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import { useVaults } from '../../context/VaultContext';
import { MOCK_SAVE_DELAY_MS } from '../../data/mock/mockData';
import type { AppStackParamList } from '../../navigation/types';
import {
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
import type { GroupVault } from '../../types/groupVault';
import { formatVaultDate, getDaysRemaining } from '../../utils/vault';

// ─── Navigation ───────────────────────────────────────────────────────────────
type JoinGroupVaultNavProp = StackNavigationProp<
  AppStackParamList,
  'JoinGroupVault'
>;

interface JoinGroupVaultScreenProps {
  navigation: JoinGroupVaultNavProp;
}

// ─── Invite code length ───────────────────────────────────────────────────────
const CODE_LENGTH = 8; // matches "TRIP-2026" pattern
const LOOKUP_DELAY = 900; // simulate network
const DEMO_INVITE_CODES = ['TRIP-2026', 'TECH-TEAM', 'FAM-SAFE', 'STRT-PAD'];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function ghs(amount: number): string {
  return `GH₵ ${new Intl.NumberFormat('en-GH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)}`;
}

function progress(vault: GroupVault): number {
  if (vault.targetAmount <= 0) return 0;
  return Math.min(
    100,
    Math.round((vault.amountSaved / vault.targetAmount) * 100),
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function JoinGroupVaultScreen({
  navigation,
}: JoinGroupVaultScreenProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { lookupInviteCode, joinGroupVault } = useVaults();
  const [rawCode, setRawCode] = useState('');
  const [lookupState, setLookupState] = useState<
    'idle' | 'loading' | 'found' | 'not_found'
  >('idle');
  const [foundVault, setFoundVault] = useState<GroupVault | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const lookupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Normalise: uppercase, strip non-alphanum except hyphens
  const displayCode = rawCode.toUpperCase().replace(/[^A-Z0-9-]/g, '');

  // ─── Lookup on change ──────────────────────────────────────────────────
  const handleCodeChange = useCallback(
    (text: string) => {
      const normalised = text.toUpperCase().replace(/[^A-Z0-9-]/g, '');
      setRawCode(normalised);
      setFoundVault(null);
      setLookupState('idle');

      if (lookupTimer.current) clearTimeout(lookupTimer.current);

      if (normalised.length < 6) return;

      setLookupState('loading');
      lookupTimer.current = setTimeout(() => {
        const match = lookupInviteCode(normalised);
        setFoundVault(match);
        setLookupState(match ? 'found' : 'not_found');
      }, LOOKUP_DELAY);
    },
    [lookupInviteCode],
  );

  const clearCode = useCallback(() => {
    setRawCode('');
    setFoundVault(null);
    setLookupState('idle');
    if (lookupTimer.current) clearTimeout(lookupTimer.current);
  }, []);

  // ─── Join ──────────────────────────────────────────────────────────────
  const handleJoin = useCallback(async () => {
    if (!foundVault) return;
    setIsJoining(true);
    await new Promise((resolve) => setTimeout(resolve, MOCK_SAVE_DELAY_MS));
    const joined = joinGroupVault(displayCode);
    setIsJoining(false);
    navigation.replace('VaultSuccess', {
      message: `You've joined "${joined?.name ?? foundVault.name}"! Your contribution will help reach the shared goal.`,
    });
  }, [displayCode, foundVault, joinGroupVault, navigation]);

  return (
    <ScreenWrapper background="page" padded={false}>
      <View style={styles.screen}>
        {/* ─── Header ──────────────────────────────────────────── */}
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [
              styles.backBtn,
              pressed && styles.backBtnPressed,
            ]}
            hitSlop={spacing.sm}
          >
            <Ionicons name="chevron-back" size={24} color={colors.textDark} />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Join Group Vault</Text>
            <Text style={styles.headerSub}>Enter your invite code</Text>
          </View>
          <View style={styles.headerRight} />
        </View>

        <View style={styles.body}>
          {/* ─── Invite Code Input ─────────────────────────────── */}
          <View style={styles.codeSection}>
            <Text style={styles.codeHint}>
              Ask the group admin for a code, or tap a link in your SMS invite.
            </Text>

            <View
              style={[
                styles.codeInputWrapper,
                lookupState === 'found' && styles.codeInputFound,
                lookupState === 'not_found' && styles.codeInputError,
              ]}
            >
              <Ionicons
                name="key-outline"
                size={20}
                color={
                  lookupState === 'found'
                    ? colors.success
                    : lookupState === 'not_found'
                      ? colors.error
                      : colors.textMuted
                }
                style={styles.codeIcon}
              />
              <TextInput
                style={styles.codeInput}
                value={displayCode}
                onChangeText={handleCodeChange}
                placeholder="e.g. TRIP-2026"
                placeholderTextColor={colors.textLight}
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={12}
                returnKeyType="search"
              />
              {lookupState === 'loading' ? (
                <ActivityIndicator
                  size="small"
                  color={colors.primary}
                  style={styles.codeTrailing}
                />
              ) : displayCode.length > 0 ? (
                <Pressable
                  onPress={clearCode}
                  hitSlop={spacing.sm}
                  style={styles.codeTrailing}
                >
                  <Ionicons
                    name={lookupState === 'found' ? 'checkmark-circle' : 'close-circle'}
                    size={20}
                    color={lookupState === 'found' ? colors.success : colors.textMuted}
                  />
                </Pressable>
              ) : null}
            </View>

            {/* Feedback label */}
            {lookupState === 'not_found' ? (
              <View style={styles.feedbackRow}>
                <Ionicons
                  name="alert-circle-outline"
                  size={14}
                  color={colors.error}
                />
                <Text style={styles.feedbackError}>
                  No group found for this code. Check with your admin.
                </Text>
              </View>
            ) : lookupState === 'found' ? (
              <View style={styles.feedbackRow}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={14}
                  color={colors.success}
                />
                <Text style={styles.feedbackSuccess}>Group found!</Text>
              </View>
            ) : null}

            {/* Sample codes hint */}
            {lookupState === 'idle' && displayCode.length === 0 ? (
              <View style={styles.sampleCodes}>
                <Text style={styles.sampleLabel}>Try a demo code:</Text>
                {DEMO_INVITE_CODES.map((code) => (
                  <Pressable
                    key={code}
                    onPress={() => handleCodeChange(code)}
                    style={({ pressed }) => [
                      styles.sampleChip,
                      pressed && styles.sampleChipPressed,
                    ]}
                  >
                    <Text style={styles.sampleChipText}>{code}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>

          {/* ─── Group Preview Card ────────────────────────────── */}
          {lookupState === 'found' && foundVault ? (
            <GroupPreviewCard vault={foundVault} />
          ) : null}

          {/* ─── Spacer when nothing to show ───────────────────── */}
          {lookupState !== 'found' ? (
            <EmptyCodeIllustration />
          ) : null}
        </View>

        {/* ─── Sticky Footer ────────────────────────────────────── */}
        <View style={styles.footer}>
          <AppButton
            title="Join Group Vault"
            icon="enter-outline"
            onPress={() => {
              void handleJoin();
            }}
            loading={isJoining}
            disabled={lookupState !== 'found'}
          />
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [
              styles.cancelBtn,
              pressed && styles.cancelBtnPressed,
            ]}
          >
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </ScreenWrapper>
  );
}

// ─── GroupPreviewCard ─────────────────────────────────────────────────────────
function GroupPreviewCard({ vault }: { vault: GroupVault }) {
  const previewStyles = useThemedStyles(createPreviewStyles);
  const pct = progress(vault);
  const days = getDaysRemaining(vault.maturityDate);
  const totalContributed = vault.members.length; // used as member count

  return (
    <View style={previewStyles.wrapper}>
      {/* Gradient accent top bar */}
      <LinearGradient
        colors={[vault.accentColor, `${vault.accentColor}AA`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={previewStyles.accentBar}
      />

      <View style={previewStyles.body}>
        {/* Title row */}
        <View style={previewStyles.titleRow}>
          <View
            style={[
              previewStyles.iconRing,
              { backgroundColor: `${vault.accentColor}18` },
            ]}
          >
            <Ionicons name="people" size={20} color={vault.accentColor} />
          </View>
          <View style={previewStyles.titleBlock}>
            <Text style={previewStyles.vaultName}>{vault.name}</Text>
            <Text style={previewStyles.goalName}>{vault.goalName}</Text>
          </View>
          <View style={previewStyles.statusPill}>
            <View
              style={[
                previewStyles.statusDot,
                { backgroundColor: vault.accentColor },
              ]}
            />
            <Text style={[previewStyles.statusText, { color: vault.accentColor }]}>
              Active
            </Text>
          </View>
        </View>

        <View style={previewStyles.divider} />

        {/* Stats grid */}
        <View style={previewStyles.statsGrid}>
          <PreviewStatCell
            icon="wallet-outline"
            label="Pool Balance"
            value={ghs(vault.amountSaved)}
            large
          />
          <PreviewStatCell
            icon="flag-outline"
            label="Target"
            value={ghs(vault.targetAmount)}
          />
          <PreviewStatCell
            icon="people-outline"
            label="Members"
            value={`${totalContributed} joined`}
          />
          <PreviewStatCell
            icon="calendar-outline"
            label="Matures"
            value={formatVaultDate(vault.maturityDate)}
          />
        </View>

        {/* Progress bar */}
        <View style={previewStyles.progressSection}>
          <View style={previewStyles.progressRow}>
            <Text style={previewStyles.progressLabel}>
              Pool progress
            </Text>
            <Text style={previewStyles.progressPct}>{pct}%</Text>
          </View>
          <View style={previewStyles.progressTrack}>
            <View
              style={[
                previewStyles.progressFill,
                {
                  backgroundColor: vault.accentColor,
                  width: `${pct}%`,
                },
              ]}
            />
          </View>
        </View>

        {/* Admin + deadline footer */}
        <View style={previewStyles.footer}>
          <View style={previewStyles.adminRow}>
            <View style={previewStyles.adminAvatar}>
              <Text style={previewStyles.adminInitials}>
                {vault.members[0]?.initials ?? '??'}
              </Text>
            </View>
            <Text style={previewStyles.adminLabel}>
              Admin: {vault.members[0]?.name ?? 'Unknown'}
            </Text>
          </View>
          <View
            style={[
              previewStyles.daysBadge,
              { backgroundColor: `${vault.accentColor}18` },
            ]}
          >
            <Ionicons
              name="hourglass-outline"
              size={12}
              color={vault.accentColor}
            />
            <Text style={[previewStyles.daysText, { color: vault.accentColor }]}>
              {days > 0 ? `${days} days left` : 'Matured'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function PreviewStatCell({
  icon,
  label,
  value,
  large = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  large?: boolean;
}) {
  const statCellStyles = useThemedStyles(createStatCellStyles);
  const { colors } = useTheme();
  return (
    <View style={statCellStyles.cell}>
      <Ionicons name={icon} size={14} color={colors.textMuted} />
      <Text style={statCellStyles.label}>{label}</Text>
      <Text
        style={[statCellStyles.value, large && statCellStyles.valueLarge]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </Text>
    </View>
  );
}

const createStatCellStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  cell: {
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
    width: '50%',
  },
  label: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginBottom: spacing.xs,
    marginTop: spacing.xs,
  },
  value: {
    color: colors.textDark,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  valueLarge: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
});

const createPreviewStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  wrapper: {
    backgroundColor: colors.cardBackground,
    borderColor: colors.cardBorder,
    borderRadius: radius.card,
    borderWidth: 1,
    marginHorizontal: spacing.lg,
    overflow: 'hidden',
    ...shadowMd,
  },
  accentBar: {
    height: 4,
    width: '100%',
  },
  body: {
    padding: spacing.md,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  iconRing: {
    alignItems: 'center',
    borderRadius: radius.full,
    height: 46,
    justifyContent: 'center',
    marginRight: spacing.md,
    width: 46,
  },
  titleBlock: {
    flex: 1,
  },
  vaultName: {
    color: colors.textDark,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    marginBottom: 2,
  },
  goalName: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
  statusPill: {
    alignItems: 'center',
    backgroundColor: colors.successLight,
    borderRadius: radius.full,
    flexDirection: 'row',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  statusDot: {
    borderRadius: radius.full,
    height: 7,
    marginRight: 4,
    width: 7,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  divider: {
    backgroundColor: colors.divider,
    height: 1,
    marginBottom: spacing.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  progressSection: {
    marginBottom: spacing.md,
    marginTop: spacing.xs,
  },
  progressRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  progressLabel: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
  progressPct: {
    color: colors.textDark,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  progressTrack: {
    backgroundColor: colors.divider,
    borderRadius: radius.full,
    height: 8,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: radius.full,
    height: 8,
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  adminRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  adminAvatar: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    height: 26,
    justifyContent: 'center',
    marginRight: spacing.sm,
    width: 26,
  },
  adminInitials: {
    color: colors.white,
    fontSize: 9,
    fontWeight: fontWeight.bold,
  },
  adminLabel: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
  daysBadge: {
    alignItems: 'center',
    borderRadius: radius.full,
    flexDirection: 'row',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  daysText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    marginLeft: 4,
  },
});

// ─── EmptyCodeIllustration ────────────────────────────────────────────────────
function EmptyCodeIllustration() {
  const emptyStyles = useThemedStyles(createEmptyStyles);
  const { colors } = useTheme();
  return (
    <View style={emptyStyles.container}>
      <View style={emptyStyles.outerRing} />
      <View style={emptyStyles.innerRing} />
      <View style={emptyStyles.circle}>
        <Ionicons name="key" size={36} color={colors.textLight} />
      </View>
      <Text style={emptyStyles.title}>Enter your invite code</Text>
      <Text style={emptyStyles.body}>
        The group admin will share a unique code.{'\n'}
        Enter it above to preview the vault.
      </Text>
    </View>
  );
}

const createEmptyStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingBottom: spacing.xxl,
  },
  outerRing: {
    borderColor: colors.divider,
    borderRadius: radius.full,
    borderWidth: 1.5,
    height: 148,
    position: 'absolute',
    width: 148,
  },
  innerRing: {
    borderColor: colors.borderSubtle,
    borderRadius: radius.full,
    borderWidth: 1.5,
    height: 112,
    position: 'absolute',
    width: 112,
  },
  circle: {
    alignItems: 'center',
    backgroundColor: colors.chipBg,
    borderRadius: radius.full,
    height: 80,
    justifyContent: 'center',
    marginBottom: spacing.lg,
    width: 80,
  },
  title: {
    color: colors.textDark,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  body: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    lineHeight: 22,
    textAlign: 'center',
  },
});

// ─── Screen styles ────────────────────────────────────────────────────────────
const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderBottomColor: colors.borderSubtle,
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
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
  body: {
    flex: 1,
  },
  codeSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  codeHint: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    lineHeight: 20,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  codeInputWrapper: {
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    borderWidth: 2,
    flexDirection: 'row',
    height: 62,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    ...shadowSm,
  },
  codeInputFound: {
    borderColor: colors.success,
    backgroundColor: colors.successLight,
  },
  codeInputError: {
    borderColor: colors.error,
    backgroundColor: colors.errorLight,
  },
  codeIcon: {
    marginRight: spacing.sm,
  },
  codeInput: {
    color: colors.textDark,
    flex: 1,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    letterSpacing: 3,
  },
  codeTrailing: {
    marginLeft: spacing.sm,
  },
  feedbackRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  feedbackError: {
    color: colors.error,
    flex: 1,
    fontSize: fontSize.xs,
    marginLeft: spacing.xs,
  },
  feedbackSuccess: {
    color: colors.success,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    marginLeft: spacing.xs,
  },
  sampleCodes: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sampleLabel: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginRight: spacing.xs,
  },
  sampleChip: {
    backgroundColor: colors.chipBg,
    borderColor: colors.borderSubtle,
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  sampleChipPressed: {
    backgroundColor: colors.primaryBackground,
    borderColor: colors.primary,
  },
  sampleChipText: {
    color: colors.textGrey,
    fontFamily: 'monospace',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 1,
  },
  footer: {
    backgroundColor: colors.cardBackground,
    borderTopColor: colors.borderSubtle,
    borderTopWidth: 1,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    ...shadowMd,
  },
  cancelBtn: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  cancelBtnPressed: {
    opacity: 0.6,
  },
  cancelBtnText: {
    color: colors.textGrey,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
});
