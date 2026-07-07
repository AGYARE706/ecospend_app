import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import type { AchievementProgress } from '../../types/achievement';
import {
  cardShadow,
  fontSize,
  fontWeight,
  radius,
  spacing,
  useTheme,
  useThemedStyles,
} from '../../theme';
import type { ThemeColors } from '../../theme';

export interface AchievementBadgeCardProps {
  achievement: AchievementProgress;
  locked?: boolean;
}

export default function AchievementBadgeCard({
  achievement,
  locked = false,
}: AchievementBadgeCardProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const isLocked = locked || !achievement.unlocked;
  const progressLabel = isLocked
    ? `${achievement.current} / ${achievement.target}`
    : achievement.unlockedLabel ?? 'Earned';

  return (
    <View
      style={[
        styles.card,
        isLocked ? styles.cardLocked : styles.cardUnlocked,
        !isLocked && { borderColor: `${achievement.accentColor}44` },
      ]}
    >
      {!isLocked ? <View style={[styles.shine, { backgroundColor: `${achievement.accentColor}12` }]} /> : null}

      <View style={styles.topRow}>
        <View
          style={[
            styles.iconRing,
            {
              backgroundColor: isLocked ? colors.chipBg : achievement.iconBackground,
            },
            isLocked && styles.iconRingLocked,
          ]}
        >
          <Ionicons
            name={achievement.icon}
            size={22}
            color={isLocked ? colors.textLight : achievement.iconColor}
          />
          {isLocked ? (
            <View style={styles.lockBadge}>
              <Ionicons name="lock-closed" size={10} color={colors.white} />
            </View>
          ) : (
            <View style={[styles.earnedBadge, { backgroundColor: achievement.accentColor }]}>
              <Ionicons name="checkmark" size={10} color={colors.white} />
            </View>
          )}
        </View>

        <View style={styles.textBlock}>
          <Text style={[styles.title, isLocked && styles.titleLocked]}>
            {achievement.title}
          </Text>
          <Text style={styles.description}>{achievement.description}</Text>
        </View>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={[styles.progressLabel, isLocked && styles.progressLabelLocked]}>
            {isLocked ? 'Progress' : 'Status'}
          </Text>
          <Text
            style={[
              styles.progressValue,
              !isLocked && { color: achievement.accentColor },
            ]}
          >
            {progressLabel}
          </Text>
        </View>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${achievement.progressPercent}%`,
                backgroundColor: isLocked ? colors.textLight : achievement.accentColor,
              },
            ]}
          />
        </View>

        {isLocked ? (
          <Text style={styles.progressHint}>
            {achievement.progressPercent}% complete — keep going!
          </Text>
        ) : null}
      </View>
    </View>
  );
}

export function StreakHeroCard({
  daysActive,
  savingsConsistency,
  consistencyLabel,
  nextMilestone,
}: {
  daysActive: number;
  savingsConsistency: number;
  consistencyLabel: string;
  nextMilestone: number;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const milestoneProgress = Math.min(
    Math.round((daysActive / nextMilestone) * 100),
    100,
  );

  return (
    <LinearGradient
      colors={[colors.streakGradientStart, colors.streakGradientMid, colors.streakGradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.streakCard}
    >
      <View style={styles.streakGlow} />

      <View style={styles.streakTopRow}>
        <View style={styles.streakIconRing}>
          <Ionicons name="flame" size={24} color={colors.white} />
        </View>
        <View style={styles.streakTextBlock}>
          <Text style={styles.streakEyebrow}>Current Streak</Text>
          <View style={styles.streakCountRow}>
            <Text style={styles.streakCount}>{daysActive}</Text>
            <Text style={styles.streakCountSuffix}>days active</Text>
          </View>
        </View>
        <View style={styles.streakPill}>
          <Text style={styles.streakPillText}>{milestoneProgress}% to 30d</Text>
        </View>
      </View>

      <View style={styles.streakDivider} />

      <View style={styles.streakStatsRow}>
        <View style={styles.streakStat}>
          <Text style={styles.streakStatLabel}>Days Active</Text>
          <Text style={styles.streakStatValue}>{daysActive}</Text>
        </View>

        <View style={styles.streakStatDivider} />

        <View style={styles.streakStat}>
          <Text style={styles.streakStatLabel}>Savings Consistency</Text>
          <Text style={styles.streakStatValue}>{savingsConsistency}%</Text>
        </View>
      </View>

      <Text style={styles.streakFootnote}>{consistencyLabel}</Text>
    </LinearGradient>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  card: {
    borderRadius: radius.card,
    borderWidth: 1,
    marginBottom: spacing.sm,
    overflow: 'hidden',
    padding: spacing.md,
    ...cardShadow,
  },
  cardUnlocked: {
    backgroundColor: colors.cardBackground,
  },
  cardLocked: {
    backgroundColor: colors.surfaceSunken,
    borderColor: colors.borderSubtle,
  },
  shine: {
    borderRadius: radius.full,
    height: 80,
    position: 'absolute',
    right: -20,
    top: -20,
    width: 80,
  },
  topRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  iconRing: {
    alignItems: 'center',
    borderRadius: radius.full,
    height: 52,
    justifyContent: 'center',
    marginRight: spacing.sm,
    position: 'relative',
    width: 52,
  },
  iconRingLocked: {
    opacity: 0.85,
  },
  lockBadge: {
    alignItems: 'center',
    backgroundColor: colors.textMuted,
    borderColor: colors.cardBackground,
    borderRadius: radius.full,
    borderWidth: 2,
    bottom: -2,
    height: 20,
    justifyContent: 'center',
    position: 'absolute',
    right: -2,
    width: 20,
  },
  earnedBadge: {
    alignItems: 'center',
    borderColor: colors.cardBackground,
    borderRadius: radius.full,
    borderWidth: 2,
    bottom: -2,
    height: 20,
    justifyContent: 'center',
    position: 'absolute',
    right: -2,
    width: 20,
  },
  textBlock: {
    flex: 1,
  },
  title: {
    color: colors.textDark,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
  },
  titleLocked: {
    color: colors.textGrey,
  },
  description: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    lineHeight: 19,
  },
  progressSection: {
    marginTop: spacing.xs,
  },
  progressHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  progressLabel: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    textTransform: 'uppercase',
  },
  progressLabelLocked: {
    color: colors.textLight,
  },
  progressValue: {
    color: colors.primary,
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
  progressHint: {
    color: colors.textLight,
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
  streakCard: {
    borderRadius: radius.heroCard,
    marginBottom: spacing.xl,
    overflow: 'hidden',
    padding: spacing.lg,
    ...cardShadow,
  },
  streakGlow: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: radius.full,
    height: 120,
    position: 'absolute',
    right: -30,
    top: -30,
    width: 120,
  },
  streakTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  streakIconRing: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: radius.full,
    height: 48,
    justifyContent: 'center',
    marginRight: spacing.sm,
    width: 48,
  },
  streakTextBlock: {
    flex: 1,
  },
  streakEyebrow: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    marginBottom: 2,
    opacity: 0.85,
    textTransform: 'uppercase',
  },
  streakCountRow: {
    alignItems: 'baseline',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  streakCount: {
    color: colors.white,
    fontSize: 36,
    fontWeight: fontWeight.bold,
    lineHeight: 40,
  },
  streakCountSuffix: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    opacity: 0.9,
  },
  streakPill: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  streakPillText: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  streakDivider: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    height: 1,
    marginBottom: spacing.md,
  },
  streakStatsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  streakStat: {
    flex: 1,
  },
  streakStatDivider: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    height: 36,
    marginHorizontal: spacing.md,
    width: 1,
  },
  streakStatLabel: {
    color: colors.white,
    fontSize: fontSize.xs,
    marginBottom: spacing.xs,
    opacity: 0.82,
  },
  streakStatValue: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  streakFootnote: {
    color: colors.white,
    fontSize: fontSize.sm,
    opacity: 0.9,
  },
});
