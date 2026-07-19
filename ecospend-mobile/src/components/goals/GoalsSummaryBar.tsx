import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import GhsText from '../ui/GhsText';
import GoalIcon from '../ui/GoalIcon';
import {
  radius,
  shadowMd,
  spacing,
  typography,
  useTheme,
  useThemedStyles,
} from '../../theme';
import type { ThemeColors } from '../../theme';

/**
 * Summary stat card showing active goal count and total saved amount.
 */
export interface GoalsSummaryBarProps {
  activeGoalCount: number;
  totalSaved: number;
}

export default function GoalsSummaryBar({
  activeGoalCount,
  totalSaved,
}: GoalsSummaryBarProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  return (
    <LinearGradient
      colors={[colors.primary, colors.primaryDark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >

      <View style={styles.headerRow}>
        <View style={styles.iconBadge}>
          <GoalIcon size={16} color={colors.white} />
        </View>
        <Text style={styles.headerLabel}>Your savings progress</Text>
      </View>

      <GhsText amount={totalSaved} variant="white" size="hero" style={styles.totalSaved} />

      <View style={styles.divider} />

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Active goals</Text>
          <Text style={styles.statValue}>{activeGoalCount}</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Status</Text>
          <Text style={styles.statValue}>
            {activeGoalCount > 0 ? 'On track' : 'Get started'}
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
    height: 100,
    position: 'absolute',
    right: -20,
    top: -20,
    width: 100,
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
    height: 28,
    justifyContent: 'center',
    marginRight: spacing.sm,
    width: 28,
  },
  headerLabel: {
    ...typography.label,
    color: colors.white,
    opacity: 0.92,
  },
  totalSaved: {
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
  statDivider: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    height: 32,
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
    color: colors.white,
  },
});
