import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import GhsText from '../ui/GhsText';
import { colors, fontSize, fontWeight, radius, shadowMd, spacing } from '../../theme';

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
  return (
    <LinearGradient
      colors={[colors.primary, colors.primaryDark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.glowOrb} />

      <View style={styles.headerRow}>
        <View style={styles.iconBadge}>
          <Ionicons name="flag" size={16} color={colors.white} />
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

const styles = StyleSheet.create({
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
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
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
    color: colors.white,
    fontSize: fontSize.xs,
    marginBottom: spacing.xs,
    opacity: 0.82,
  },
  statValue: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
});
