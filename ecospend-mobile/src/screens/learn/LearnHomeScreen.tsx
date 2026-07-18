import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

import { Icon } from '../../components/ui/icons';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import { getLessonTracks, getStreak, getXp } from '../../api/engagementApi';
import type { LessonTrack } from '../../types/engagement';
import type { StreakStats, XpStats } from '../../types/engagement';
import type { ProfileStackParamList } from '../../navigation/types';
import {
  fontSize,
  fontWeight,
  radius,
  shadowSm,
  spacing,
  typography,
  useTheme,
  useThemedStyles,
} from '../../theme';
import type { ThemeColors } from '../../theme';

type LearnNavProp = StackNavigationProp<ProfileStackParamList, 'Learn'>;

const EMPTY_XP: XpStats = { totalXp: 0, level: 1 };
const EMPTY_STREAK: StreakStats = { currentStreak: 0, totalActiveDays: 0 };

export default function LearnHomeScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation<LearnNavProp>();
  const [tracks, setTracks] = useState<LessonTrack[]>([]);
  const [xp, setXp] = useState<XpStats>(EMPTY_XP);
  const [streak, setStreak] = useState<StreakStats>(EMPTY_STREAK);

  useFocusEffect(
    useCallback(() => {
      Promise.all([getLessonTracks(), getXp(), getStreak()])
        .then(([tracksResult, xpResult, streakResult]) => {
          setTracks(tracksResult);
          setXp(xpResult);
          setStreak(streakResult);
        })
        .catch(() => {
          // Leave whatever was last successfully loaded on screen.
        });
    }, []),
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
            <Icon name="chevron-left" size={24} color={colors.textDark} />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Financial Lessons</Text>
            <Text style={styles.headerSub}>Build your money skills</Text>
          </View>
          <View style={styles.headerRight} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Icon name="star" size={18} color={colors.gold} strokeWidth={1.9} />
              <Text style={styles.statValue}>Level {xp.level}</Text>
              <Text style={styles.statLabel}>{xp.totalXp} XP</Text>
            </View>
            <View style={styles.statCard}>
              <Icon name="flame" size={18} color={colors.warning} strokeWidth={1.9} />
              <Text style={styles.statValue}>{streak.currentStreak}d streak</Text>
              <Text style={styles.statLabel}>{streak.totalActiveDays} active days</Text>
            </View>
          </View>

          {tracks.map((track) => {
            const completedCount = track.lessons.filter((lesson) => lesson.completed).length;
            return (
              <Pressable
                key={track.id}
                style={({ pressed }) => [styles.trackCard, pressed && styles.trackCardPressed]}
                onPress={() => navigation.navigate('LessonTrack', { trackId: track.id })}
                accessibilityRole="button"
              >
                <View style={styles.trackIconBadge}>
                  <Icon name={track.icon} size={20} color={colors.primary} strokeWidth={1.9} />
                </View>
                <View style={styles.trackContent}>
                  <Text style={styles.trackTitle} numberOfLines={1}>{track.title}</Text>
                  <Text style={styles.trackDescription} numberOfLines={2}>{track.description}</Text>
                  <Text style={styles.trackProgress}>
                    {completedCount} / {track.lessons.length} lessons
                  </Text>
                </View>
                <Icon name="chevron-right" size={18} color={colors.textLight} strokeWidth={2} />
              </Pressable>
            );
          })}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>
    </ScreenWrapper>
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
    statsRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: spacing.lg,
    },
    statCard: {
      alignItems: 'flex-start',
      backgroundColor: colors.cardBackground,
      borderColor: colors.borderSubtle,
      borderRadius: radius.card,
      borderWidth: 1,
      flex: 1,
      gap: spacing.xs,
      padding: spacing.md,
      ...shadowSm,
    },
    statValue: {
      color: colors.textDark,
      fontSize: fontSize.md,
      fontWeight: fontWeight.bold,
    },
    statLabel: {
      color: colors.textMuted,
      fontSize: fontSize.xs,
    },
    trackCard: {
      alignItems: 'center',
      backgroundColor: colors.cardBackground,
      borderColor: colors.borderSubtle,
      borderRadius: radius.card,
      borderWidth: 1,
      flexDirection: 'row',
      gap: spacing.smd,
      marginBottom: spacing.sm,
      padding: spacing.md,
      ...shadowSm,
    },
    trackCardPressed: {
      opacity: 0.85,
    },
    trackIconBadge: {
      alignItems: 'center',
      backgroundColor: colors.primaryBackground,
      borderRadius: radius.md,
      height: 44,
      justifyContent: 'center',
      width: 44,
    },
    trackContent: {
      flex: 1,
    },
    trackTitle: {
      ...typography.label,
      color: colors.textDark,
      marginBottom: 2,
    },
    trackDescription: {
      ...typography.bodySm,
      color: colors.textMuted,
      marginBottom: spacing.xs,
    },
    trackProgress: {
      color: colors.primary,
      fontSize: fontSize.xs,
      fontWeight: fontWeight.semibold,
    },
    bottomSpacer: {
      height: spacing.xxl,
    },
  });
