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
 * Hero wallet card — the focal point of the dashboard. A quiet deep-emerald
 * surface with the real wallet balance, Top Up / Send actions, and this
 * month's income / expense split under a hairline divider.
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
        colors={[colors.heroGradientStart, colors.heroGradientMid]}
        style={styles.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.9, y: 1.4 }}
      >
        <View style={styles.headerRow}>
          <Text style={styles.label}>Wallet balance</Text>
          <Icon name="wallet" size={18} color={colors.white} strokeWidth={1.8} />
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
                <Icon name="plus" size={15} color={colors.white} strokeWidth={2.2} />
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
                <Icon name="send" size={15} color={colors.white} strokeWidth={2.2} />
                <Text style={styles.actionBtnText}>Send</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel} numberOfLines={1}>
              Income this month
            </Text>
            <GhsText amount={income} variant="white" size="sm" numberOfLines={1} adjustsFontSizeToFit />
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statLabel} numberOfLines={1}>
              Spent this month
            </Text>
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
    marginBottom: spacing.mlg,
    ...shadowBrand,
  },
  card: {
    borderRadius: radius.heroCard,
    overflow: 'hidden',
    paddingHorizontal: spacing.mlg,
    paddingVertical: spacing.mlg,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.caption,
    color: colors.white,
    letterSpacing: 0.3,
    opacity: 0.85,
    textTransform: 'uppercase',
  },
  balance: {
    marginBottom: spacing.md,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  actionBtn: {
    alignItems: 'center',
    backgroundColor: colors.heroOverlay,
    borderRadius: radius.full,
    flex: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    minHeight: 38,
    paddingHorizontal: spacing.md,
  },
  actionBtnPressed: {
    opacity: 0.75,
  },
  actionBtnText: {
    ...typography.label,
    color: colors.white,
  },
  statsRow: {
    borderTopColor: colors.heroDivider,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    paddingTop: spacing.smd,
  },
  statItem: {
    flex: 1,
    gap: 2,
  },
  statDivider: {
    backgroundColor: colors.heroDivider,
    marginHorizontal: spacing.md,
    width: StyleSheet.hairlineWidth,
  },
  statLabel: {
    ...typography.caption,
    color: colors.white,
    opacity: 0.75,
  },
});
