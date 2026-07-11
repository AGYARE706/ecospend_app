import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Icon } from '../ui/icons';
import GhsText from '../ui/GhsText';
import type { VaultSummary } from '../../types/vault';
import { formatVaultDate } from '../../utils/vault';
import {
  radius,
  shadowMd,
  spacing,
  typography,
  useTheme,
  useThemedStyles,
} from '../../theme';
import type { ThemeColors } from '../../theme';
import type { VaultThemeColors } from './vaultTheme';

export interface VaultSummaryCardProps {
  summary: VaultSummary;
  theme: VaultThemeColors;
}

export default function VaultSummaryCard({
  summary,
  theme,
}: VaultSummaryCardProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  return (
    <LinearGradient
      colors={[...theme.heroGradient]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.glowOrb} />

      <View style={styles.headerRow}>
        <View style={styles.iconBadge}>
          <Icon name="shield-checkmark" size={18} color={colors.white} />
        </View>
        <Text style={styles.headerLabel}>Total Vault Balance</Text>
      </View>

      <GhsText
        amount={summary.totalBalance}
        variant="white"
        size="hero"
        style={styles.balance}
        numberOfLines={1}
        adjustsFontSizeToFit
      />

      <View style={styles.divider} />

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Active Vaults</Text>
          <Text style={styles.statValue}>{summary.activeVaultCount}</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={[styles.statItem, styles.statItemWide]}>
          <Text style={styles.statLabel}>Next Maturity</Text>
          <Text style={styles.statValue} numberOfLines={1}>
            {summary.nextMaturityDate
              ? formatVaultDate(summary.nextMaturityDate)
              : 'None scheduled'}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  card: {
    borderRadius: radius.heroCard,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    padding: spacing.lg,
    ...shadowMd,
  },
  glowOrb: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radius.full,
    height: 120,
    position: 'absolute',
    right: -24,
    top: -24,
    width: 120,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  iconBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: radius.full,
    height: 32,
    justifyContent: 'center',
    marginRight: spacing.sm,
    width: 32,
  },
  headerLabel: {
    ...typography.label,
    color: colors.white,
    fontWeight: '500',
    opacity: 0.92,
  },
  balance: {
    marginBottom: spacing.md,
  },
  divider: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    height: 1,
    marginBottom: spacing.md,
  },
  statsRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  statItem: {
    flex: 1,
  },
  statItemWide: {
    flex: 1.4,
  },
  statDivider: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    height: 36,
    marginHorizontal: spacing.md,
    width: 1,
  },
  statLabel: {
    ...typography.caption,
    color: colors.white,
    marginBottom: spacing.xs,
    opacity: 0.82,
  },
  statValue: {
    ...typography.subheading,
    fontSize: 15,
    color: colors.white,
  },
});
