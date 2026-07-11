import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import ScreenWrapper from '../../components/ui/ScreenWrapper';
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

// ─── Navigation ───────────────────────────────────────────────────────────────
type VaultSuccessRouteProp = RouteProp<AppStackParamList, 'VaultSuccess'>;
type VaultSuccessNavProp = StackNavigationProp<AppStackParamList, 'VaultSuccess'>;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function ghs(amount: number): string {
  return `GH₵ ${new Intl.NumberFormat('en-GH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)}`;
}

function nowTimestamp(): string {
  return new Date().toLocaleString('en-GH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function mockRef(): string {
  return `EVT-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function VaultSuccessScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { params } = useRoute<VaultSuccessRouteProp>();
  const navigation = useNavigation<VaultSuccessNavProp>();

  const isWithdrawal = params?.isWithdrawal === true;
  const vaultName = params?.vaultName ?? 'My Vault';
  const amountReceived = params?.amountReceived;
  const feeCharged = params?.feeCharged;

  // Reference is stable for the lifetime of this screen render
  const ref = mockRef();
  const timestamp = nowTimestamp();

  function goToDashboard() {
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'MainTabs',
          params: { screen: 'VaultTab', params: { screen: 'VaultDashboard' } },
        },
      ],
    });
  }

  function goToHistory() {
    // Pop back to the vault stack then navigate to history
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'MainTabs',
          params: {
            screen: 'VaultTab',
            params: { screen: 'VaultHistory', params: { vaultId: 'vault-emergency' } },
          },
        },
      ],
    });
  }

  return (
    <ScreenWrapper background="page" padded={false}>
      <View style={styles.screen}>
        <View style={styles.topBar}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [
              styles.closeBtn,
              pressed && styles.closeBtnPressed,
            ]}
            hitSlop={spacing.sm}
          >
            <Ionicons name="close" size={24} color={colors.textDark} />
          </Pressable>
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* ─── Illustration hero ─────────────────────────────────── */}
          <View style={styles.illustrationWrapper}>
            <SuccessIllustration />
          </View>

          {/* ─── Headline ──────────────────────────────────────────── */}
          <View style={styles.headlineBlock}>
            <Text style={styles.headline}>
              {isWithdrawal ? 'Withdrawal Complete' : 'Vault Created'}
            </Text>
            <Text style={styles.subHeadline}>
              {isWithdrawal
                ? 'Your funds are on their way to your account.'
                : 'Your savings are locked and earning.'}
            </Text>
          </View>

          {/* ─── Receipt card ──────────────────────────────────────── */}
          <View style={styles.receiptCard}>
            {/* Jagged top edge */}
            <ReceiptEdge position="top" />

            <View style={styles.receiptBody}>
              {/* Vault name */}
              <ReceiptRow
                label="Vault"
                value={vaultName}
                icon="lock-closed-outline"
                iconColor={colors.primary}
              />

              <View style={styles.receiptDividerDashed} />

              {/* Withdrawal-specific fields */}
              {isWithdrawal && amountReceived !== undefined ? (
                <>
                  <ReceiptRow
                    label="Amount Received"
                    value={ghs(amountReceived)}
                    valueStyle="hero"
                    icon="cash-outline"
                    iconColor={colors.success}
                  />
                  {feeCharged !== undefined ? (
                    <ReceiptRow
                      label="Fee Charged"
                      value={`− ${ghs(feeCharged)}`}
                      icon="receipt-outline"
                      iconColor={colors.warning}
                      valueColor={colors.error}
                    />
                  ) : null}
                </>
              ) : null}

              {!isWithdrawal ? (
                <ReceiptRow
                  label="Status"
                  value="Locked & Saving"
                  icon="shield-checkmark-outline"
                  iconColor={colors.primary}
                  valueColor={colors.primary}
                />
              ) : null}

              <View style={styles.receiptDividerDashed} />

              {/* Meta */}
              <ReceiptRow
                label="Timestamp"
                value={timestamp}
                icon="time-outline"
                iconColor={colors.textGrey}
                valueStyle="muted"
              />
              <ReceiptRow
                label="Reference"
                value={ref}
                icon="barcode-outline"
                iconColor={colors.textGrey}
                valueStyle="mono"
              />

              {/* Status pill */}
              <View style={styles.statusPillRow}>
                <View style={styles.statusPill}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>Confirmed</Text>
                </View>
              </View>
            </View>

            {/* Jagged bottom edge */}
            <ReceiptEdge position="bottom" />
          </View>

          {/* ─── Trust row ─────────────────────────────────────────── */}
          <View style={styles.trustRow}>
            <TrustBadge
              icon="shield-checkmark"
              label="Secured"
            />
            <View style={styles.trustSep} />
            <TrustBadge
              icon="lock-closed"
              label="Encrypted"
            />
            <View style={styles.trustSep} />
            <TrustBadge
              icon="checkmark-circle"
              label="Verified"
            />
          </View>
        </ScrollView>

        {/* ─── Sticky actions ────────────────────────────────────── */}
        <View style={styles.footer}>
          <Pressable
            onPress={goToHistory}
            style={({ pressed }) => [
              styles.primaryBtn,
              pressed && styles.btnPressed,
            ]}
          >
            <Ionicons
              name="time-outline"
              size={20}
              color={colors.white}
              style={styles.btnIcon}
            />
            <Text style={styles.primaryBtnText}>View Vault History</Text>
          </Pressable>

          <Pressable
            onPress={goToDashboard}
            style={({ pressed }) => [
              styles.secondaryBtn,
              pressed && styles.btnPressed,
            ]}
          >
            <Ionicons
              name="wallet-outline"
              size={18}
              color={colors.primary}
              style={styles.btnIcon}
            />
            <Text style={styles.secondaryBtnText}>Back to Vault Dashboard</Text>
          </Pressable>
        </View>
      </View>
    </ScreenWrapper>
  );
}

// ─── SuccessIllustration ──────────────────────────────────────────────────────
// Premium geometric illustration built entirely from Views — no images needed
function SuccessIllustration() {
  const illustStyles = useThemedStyles(createIllustStyles);
  const { colors } = useTheme();
  return (
    <View style={illustStyles.container}>
      {/* Outer glow rings */}
      <View style={illustStyles.ringOuter} />
      <View style={illustStyles.ringMid} />

      {/* Main gradient circle */}
      <LinearGradient
        colors={[colors.primaryDark, colors.primary]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={illustStyles.circle}
      >
        {/* Inner white check ring */}
        <View style={illustStyles.checkRing}>
          <Ionicons name="checkmark" size={38} color={colors.primary} />
        </View>
      </LinearGradient>

      {/* Floating accent chips */}
      <View style={[illustStyles.chip, illustStyles.chipTopRight]}>
        <Ionicons name="trending-up" size={13} color={colors.primary} />
      </View>
      <View style={[illustStyles.chip, illustStyles.chipBottomLeft]}>
        <Ionicons name="shield-checkmark" size={13} color={colors.primary} />
      </View>
      <View style={[illustStyles.chip, illustStyles.chipTopLeft]}>
        <Ionicons name="lock-closed" size={11} color={colors.textMuted} />
      </View>
    </View>
  );
}

const createIllustStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  container: {
    alignItems: 'center',
    height: 200,
    justifyContent: 'center',
    width: '100%',
  },
  ringOuter: {
    borderColor: `${colors.primary}12`,
    borderRadius: radius.full,
    borderWidth: 1.5,
    height: 176,
    position: 'absolute',
    width: 176,
  },
  ringMid: {
    borderColor: `${colors.primary}22`,
    borderRadius: radius.full,
    borderWidth: 1.5,
    height: 148,
    position: 'absolute',
    width: 148,
  },
  circle: {
    alignItems: 'center',
    borderRadius: radius.full,
    height: 112,
    justifyContent: 'center',
    width: 112,
    ...shadowMd,
  },
  checkRing: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.full,
    height: 72,
    justifyContent: 'center',
    width: 72,
  },
  chip: {
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderColor: colors.cardBorder,
    borderRadius: radius.full,
    borderWidth: 1,
    height: 32,
    justifyContent: 'center',
    position: 'absolute',
    width: 32,
    ...shadowSm,
  },
  chipTopRight: {
    right: '22%',
    top: 16,
  },
  chipBottomLeft: {
    bottom: 20,
    left: '22%',
  },
  chipTopLeft: {
    left: '26%',
    top: 28,
  },
});

// ─── ReceiptEdge ─────────────────────────────────────────────────────────────
// Ticket / receipt torn edge using a row of circles
function ReceiptEdge({ position }: { position: 'top' | 'bottom' }) {
  const edgeStyles = useThemedStyles(createEdgeStyles);
  const dots = Array.from({ length: 14 });
  const isTop = position === 'top';
  return (
    <View
      style={[
        edgeStyles.row,
        isTop ? edgeStyles.rowTop : edgeStyles.rowBottom,
      ]}
    >
      {/* Left notch */}
      <View
        style={[
          edgeStyles.notch,
          isTop ? edgeStyles.notchTopLeft : edgeStyles.notchBottomLeft,
        ]}
      />
      {/* Dashes */}
      <View style={edgeStyles.dashes}>
        {dots.map((_, i) => (
          <View key={i} style={edgeStyles.dash} />
        ))}
      </View>
      {/* Right notch */}
      <View
        style={[
          edgeStyles.notch,
          isTop ? edgeStyles.notchTopRight : edgeStyles.notchBottomRight,
        ]}
      />
    </View>
  );
}

const NOTCH = 14;
const createEdgeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    height: NOTCH,
  },
  rowTop: {
    marginBottom: -NOTCH / 2,
  },
  rowBottom: {
    marginTop: -NOTCH / 2,
  },
  notch: {
    backgroundColor: colors.pageBackground,
    borderRadius: radius.full,
    height: NOTCH,
    width: NOTCH,
    zIndex: 1,
  },
  notchTopLeft: {
    marginLeft: -NOTCH / 2,
  },
  notchTopRight: {
    marginRight: -NOTCH / 2,
  },
  notchBottomLeft: {
    marginLeft: -NOTCH / 2,
  },
  notchBottomRight: {
    marginRight: -NOTCH / 2,
  },
  dashes: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    overflow: 'hidden',
  },
  dash: {
    backgroundColor: colors.borderSubtle,
    height: 2,
    width: 10,
  },
});

// ─── ReceiptRow ───────────────────────────────────────────────────────────────
function ReceiptRow({
  label,
  value,
  icon,
  iconColor,
  valueColor,
  valueStyle = 'normal',
}: {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  valueColor?: string;
  valueStyle?: 'normal' | 'hero' | 'muted' | 'mono';
}) {
  const rowStyles = useThemedStyles(createRowStyles);
  return (
    <View style={rowStyles.row}>
      <View style={rowStyles.labelBlock}>
        <View style={[rowStyles.iconRing, { backgroundColor: `${iconColor}15` }]}>
          <Ionicons name={icon} size={14} color={iconColor} />
        </View>
        <Text style={rowStyles.label}>{label}</Text>
      </View>
      <Text
        style={[
          rowStyles.value,
          valueStyle === 'hero' && rowStyles.valueHero,
          valueStyle === 'muted' && rowStyles.valueMuted,
          valueStyle === 'mono' && rowStyles.valueMono,
          valueColor ? { color: valueColor } : null,
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </Text>
    </View>
  );
}

const createRowStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  labelBlock: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  iconRing: {
    alignItems: 'center',
    borderRadius: radius.full,
    height: 26,
    justifyContent: 'center',
    marginRight: spacing.sm,
    width: 26,
  },
  label: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  value: {
    color: colors.textDark,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    maxWidth: '55%',
    textAlign: 'right',
  },
  valueHero: {
    color: colors.primary,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  valueMuted: {
    color: colors.textMuted,
    fontWeight: fontWeight.regular,
  },
  valueMono: {
    color: colors.textGrey,
    fontFamily: 'monospace',
    fontSize: fontSize.xs,
    letterSpacing: 1,
  },
});

// ─── TrustBadge ───────────────────────────────────────────────────────────────
function TrustBadge({
  icon,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  const trustStyles = useThemedStyles(createTrustStyles);
  const { colors } = useTheme();
  return (
    <View style={trustStyles.badge}>
      <Ionicons name={icon} size={14} color={colors.primary} />
      <Text style={trustStyles.label}>{label}</Text>
    </View>
  );
}

const createTrustStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  badge: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  label: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginLeft: spacing.xs,
  },
});

// ─── Screen styles ────────────────────────────────────────────────────────────
const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  screen: {
    flex: 1,
  },
  topBar: {
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  closeBtn: {
    alignItems: 'center',
    backgroundColor: colors.chipBg,
    borderRadius: radius.full,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  closeBtnPressed: {
    opacity: 0.85,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  illustrationWrapper: {
    marginBottom: spacing.sm,
  },
  headlineBlock: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headline: {
    color: colors.textDark,
    fontSize: 26,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subHeadline: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    lineHeight: 22,
    paddingHorizontal: spacing.xl,
    textAlign: 'center',
  },
  receiptCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: radius.card,
    marginBottom: spacing.lg,
    ...shadowMd,
    overflow: 'hidden',
  },
  receiptBody: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  receiptDividerDashed: {
    borderColor: colors.borderSubtle,
    borderStyle: 'dashed',
    borderTopWidth: 1,
    marginVertical: spacing.sm,
  },
  statusPillRow: {
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  statusPill: {
    alignItems: 'center',
    backgroundColor: colors.successLight,
    borderRadius: radius.full,
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  statusDot: {
    backgroundColor: colors.success,
    borderRadius: radius.full,
    height: 8,
    marginRight: spacing.sm,
    width: 8,
  },
  statusText: {
    color: colors.success,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  trustRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  trustSep: {
    backgroundColor: colors.divider,
    height: 14,
    marginHorizontal: spacing.md,
    width: 1,
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
  primaryBtn: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.button,
    flexDirection: 'row',
    height: 54,
    justifyContent: 'center',
    marginBottom: spacing.sm,
    ...shadowSm,
  },
  secondaryBtn: {
    alignItems: 'center',
    borderColor: colors.primary,
    borderRadius: radius.button,
    borderWidth: 1.5,
    flexDirection: 'row',
    height: 48,
    justifyContent: 'center',
  },
  btnIcon: {
    marginRight: spacing.sm,
  },
  primaryBtnText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  secondaryBtnText: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  btnPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
});
