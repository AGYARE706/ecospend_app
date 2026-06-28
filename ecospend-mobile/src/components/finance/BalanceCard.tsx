import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import GhsText from '../ui/GhsText';
import { Icon } from '../ui/icons';
import { colors, palette, radius, shadowBrand, spacing, typography } from '../../theme';

/**
 * Hero balance card — the focal point of the dashboard. A deep emerald
 * gradient with a soft glow orb and an income / expense split footer.
 */
export interface BalanceCardProps {
  balance: number;
  income: number;
  expense: number;
}

export default function BalanceCard({ balance, income, expense }: BalanceCardProps) {
  return (
    <View style={styles.shadowWrap}>
      <LinearGradient
        colors={[palette.green[500], palette.green[700], palette.green[800]]}
        style={styles.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.glowOrb} />
        <View style={styles.glowOrbSm} />

        <View style={styles.headerRow}>
          <Text style={styles.label}>Total Balance</Text>
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

const styles = StyleSheet.create({
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
