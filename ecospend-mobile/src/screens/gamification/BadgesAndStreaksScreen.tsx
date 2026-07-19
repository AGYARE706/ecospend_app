import { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import AchievementBadgeCard, {
  StreakHeroCard,
} from '../../components/gamification/AchievementBadgeCard';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import { useBadgesAndStreaks } from '../../hooks/useBadgesAndStreaks';
import type { ProfileStackParamList } from '../../navigation/types';
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

type BadgesNavProp = StackNavigationProp<
  ProfileStackParamList,
  'BadgesAndStreaks'
>;

export default function BadgesAndStreaksScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation<BadgesNavProp>();
  const {
    streak,
    unlockedAchievements,
    lockedAchievements,
    totalAchievements,
    unlockedCount,
    refresh,
  } = useBadgesAndStreaks();

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

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
            <Text style={styles.headerTitle}>Badges & Streaks</Text>
            <Text style={styles.headerSub}>Celebrate your savings milestones</Text>
          </View>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <StreakHeroCard
            currentStreak={streak.currentStreak}
            totalActiveDays={streak.totalActiveDays}
          />

          <SummaryStrip unlockedCount={unlockedCount} totalAchievements={totalAchievements} />

          {unlockedAchievements.length > 0 ? (
            <>
              <SectionLabel
                title="Achievements"
                icon="trophy"
                subtitle={`${unlockedAchievements.length} earned`}
              />
              {unlockedAchievements.map((achievement) => (
                <AchievementBadgeCard key={achievement.id} achievement={achievement} />
              ))}
            </>
          ) : null}

          {lockedAchievements.length > 0 ? (
            <>
              <SectionLabel
                title="Locked Achievements"
                icon="lock-closed-outline"
                subtitle={`${lockedAchievements.length} in progress`}
                muted
              />
              {lockedAchievements.map((achievement) => (
                <AchievementBadgeCard
                  key={achievement.id}
                  achievement={achievement}
                  locked
                />
              ))}
            </>
          ) : null}

          <View style={styles.tipCard}>
            <Ionicons name="sparkles-outline" size={18} color={colors.primary} />
            <Text style={styles.tipText}>
              Log transactions, contribute to goals, and maintain your streak to unlock
              more badges.
            </Text>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
}

function SummaryStrip({
  unlockedCount,
  totalAchievements,
}: {
  unlockedCount: number;
  totalAchievements: number;
}) {
  const styles = useThemedStyles(createStyles);
  const completionPercent =
    totalAchievements > 0
      ? Math.round((unlockedCount / totalAchievements) * 100)
      : 0;

  return (
    <View style={styles.summaryStrip}>
      <View style={styles.summaryItem}>
        <Text style={styles.summaryValue}>{unlockedCount}</Text>
        <Text style={styles.summaryLabel}>Earned</Text>
      </View>
      <View style={styles.summaryDivider} />
      <View style={styles.summaryItem}>
        <Text style={styles.summaryValue}>{totalAchievements - unlockedCount}</Text>
        <Text style={styles.summaryLabel}>Locked</Text>
      </View>
      <View style={styles.summaryDivider} />
      <View style={styles.summaryItem}>
        <Text style={styles.summaryValue}>{completionPercent}%</Text>
        <Text style={styles.summaryLabel}>Complete</Text>
      </View>
    </View>
  );
}

function SectionLabel({
  title,
  icon,
  subtitle,
  muted = false,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  subtitle: string;
  muted?: boolean;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleRow}>
        <View
          style={[
            styles.sectionIconBadge,
            muted && styles.sectionIconBadgeMuted,
          ]}
        >
          <Ionicons
            name={icon}
            size={14}
            color={muted ? colors.textMuted : colors.primary}
          />
        </View>
        <View>
          <Text style={[styles.sectionTitle, muted && styles.sectionTitleMuted]}>
            {title}
          </Text>
          <Text style={styles.sectionSubtitle}>{subtitle}</Text>
        </View>
      </View>
    </View>
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
  summaryStrip: {
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderColor: colors.borderSubtle,
    borderRadius: radius.card,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: spacing.xl,
    paddingVertical: spacing.md,
    ...cardShadow,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryDivider: {
    backgroundColor: colors.divider,
    height: 36,
    width: 1,
  },
  summaryValue: {
    color: colors.textDark,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginBottom: 2,
  },
  summaryLabel: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  sectionHeader: {
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  sectionTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  sectionIconBadge: {
    alignItems: 'center',
    backgroundColor: colors.primaryBackground,
    borderRadius: radius.full,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  sectionIconBadgeMuted: {
    backgroundColor: colors.chipBg,
  },
  sectionTitle: {
    color: colors.textDark,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  sectionTitleMuted: {
    color: colors.textGrey,
  },
  sectionSubtitle: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  tipCard: {
    alignItems: 'flex-start',
    backgroundColor: colors.primaryBackground,
    borderColor: `${colors.primary}33`,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
    padding: spacing.md,
  },
  tipText: {
    color: colors.textGrey,
    flex: 1,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  bottomSpacer: {
    height: spacing.xxl,
  },
});
