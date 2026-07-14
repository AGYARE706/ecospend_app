import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import GhsText from '../ui/GhsText';
import { Icon } from '../ui/icons';
import {
  radius,
  shadowBrand,
  spacing,
  typography,
  useTheme,
  useThemedStyles,
} from '../../theme';
import type { ThemeColors } from '../../theme';

/**
 * Hero wallet card — the focal point of the dashboard. Shows the real
 * EcoSpend wallet balance with Top Up / Send actions, plus this month's
 * income / expense split footer.
 */
export interface BalanceCardProps {
  balance: number;
  income: number;
  expense: number;
  onTopUpPress?: () => void;
  onSendPress?: () => void;
}

export default function BalanceCard({
  balance,
  income,
  expense,
  onTopUpPress,
  onSendPress,
}: BalanceCardProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.shadowWrap}>
      <LinearGradient
        colors={[colors.heroGradientStart, colors.heroGradientMid, colors.heroGradientEnd]}
        style={styles.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.glowOrb} />
        <View style={styles.glowOrbSm} />

        <View style={styles.headerRow}>
          <Text style={styles.label}>Wallet Balance</Text>
          <View style={styles.iconBadge}>
            <Icon name="wallet" size={18} color={colors.white} />
          </View>
        </View>

        <GhsText
          amount={balance}
          variant="white"
          size="hero"
          style={styles.balance}
          numberOfLines={1}
          adjustsFontSizeToFit
        />

        {onTopUpPress || onSendPress ? (
          <View style={styles.actionsRow}>
            {onTopUpPress ? (
              <Pressable
                onPress={onTopUpPress}
                style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
                accessibilityRole="button"
                accessibilityLabel="Top up wallet"
              >
                <Icon name="plus-circle" size={16} color={colors.white} strokeWidth={2.2} />
                <Text style={styles.actionBtnText}>Top Up</Text>
              </Pressable>
            ) : null}
            {onSendPress ? (
              <Pressable
                onPress={onSendPress}
                style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
                accessibilityRole="button"
                accessibilityLabel="Send money"
              >
                <Icon name="send" size={16} color={colors.white} strokeWidth={2.2} />
                <Text style={styles.actionBtnText}>Send</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <View style={styles.statHeader}>
              <View style={styles.statIconCircle}>
                <Icon name="arrow-down" size={13} color={colors.white} strokeWidth={2.4} />
              </View>
              <Text style={styles.statLabel} numberOfLines={1}>Income</Text>
            </View>
            <GhsText amount={income} variant="white" size="sm" numberOfLines={1} adjustsFontSizeToFit />
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <View style={styles.statHeader}>
              <View style={styles.statIconCircle}>
                <Icon name="arrow-up" size={13} color={colors.white} strokeWidth={2.4} />
              </View>
              <Text style={styles.statLabel} numberOfLines={1}>Expenses</Text>
            </View>
            <GhsText amount={expense} variant="white" size="sm" numberOfLines={1} adjustsFontSizeToFit />
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  shadowWrap: {
    borderRadius: radius.heroCard,
    marginBottom: spacing.lg,
    ...shadowBrand,
  },
  card: {
    borderRadius: radius.heroCard,
    overflow: 'hidden',
    padding: spacing.lg,
  },
  glowOrb: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: radius.full,
    height: 150,
    position: 'absolute',
    right: -40,
    top: -50,
    width: 150,
  },
  glowOrbSm: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.full,
    bottom: -30,
    height: 90,
    left: -20,
    position: 'absolute',
    width: 90,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.smd,
  },
  iconBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: radius.md,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  label: {
    ...typography.bodySm,
    color: colors.white,
    fontWeight: typography.caption.fontWeight,
    letterSpacing: 0.2,
    opacity: 0.9,
  },
  balance: {
    marginBottom: spacing.lg,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  actionBtn: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: radius.full,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  actionBtnPressed: {
    opacity: 0.8,
  },
  actionBtnText: {
    ...typography.label,
    color: colors.white,
  },
  statsRow: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: radius.md,
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.smd,
  },
  statItem: {
    flex: 1,
  },
  statDivider: {
    backgroundColor: 'rgba(255,255,255,0.20)',
    height: 36,
    marginHorizontal: spacing.md,
    width: 1,
  },
  statHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  statIconCircle: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: radius.full,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  statLabel: {
    ...typography.caption,
    color: colors.white,
    opacity: 0.85,
  },
});
