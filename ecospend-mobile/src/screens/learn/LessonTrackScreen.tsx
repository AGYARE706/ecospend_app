import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

import { Icon } from '../../components/ui/icons';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import { getLessonTracks } from '../../api/engagementApi';
import type { LessonTrack } from '../../types/engagement';
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

type LessonTrackNavProp = StackNavigationProp<ProfileStackParamList, 'LessonTrack'>;
type LessonTrackRouteProp = RouteProp<ProfileStackParamList, 'LessonTrack'>;

export default function LessonTrackScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation<LessonTrackNavProp>();
  const route = useRoute<LessonTrackRouteProp>();
  const [track, setTrack] = useState<LessonTrack | null>(null);

  useFocusEffect(
    useCallback(() => {
      getLessonTracks()
        .then((tracks) => {
          setTrack(tracks.find((t) => t.id === route.params.trackId) ?? null);
        })
        .catch(() => {
          // Leave whatever was last successfully loaded on screen.
        });
    }, [route.params.trackId]),
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
            <Text style={styles.headerTitle} numberOfLines={1}>{track?.title ?? 'Lessons'}</Text>
            {track ? <Text style={styles.headerSub} numberOfLines={1}>{track.description}</Text> : null}
          </View>
          <View style={styles.headerRight} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {(track?.lessons ?? []).map((lesson, index) => (
            <Pressable
              key={lesson.id}
              style={({ pressed }) => [styles.lessonCard, pressed && styles.lessonCardPressed]}
              onPress={() => navigation.navigate('LessonDetail', { lessonId: lesson.id })}
              accessibilityRole="button"
            >
              <View style={[styles.lessonIndexBadge, lesson.completed && styles.lessonIndexBadgeDone]}>
                {lesson.completed ? (
                  <Icon name="check" size={16} color={colors.white} />
                ) : (
                  <Text style={styles.lessonIndexText}>{index + 1}</Text>
                )}
              </View>
              <View style={styles.lessonContent}>
                <Text style={styles.lessonTitle} numberOfLines={1}>{lesson.title}</Text>
                <Text style={styles.lessonSummary} numberOfLines={2}>{lesson.summary}</Text>
                <Text style={styles.lessonXp}>{lesson.xpReward} XP</Text>
              </View>
              <Icon name="chevron-right" size={18} color={colors.textLight} strokeWidth={2} />
            </Pressable>
          ))}

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
    lessonCard: {
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
    lessonCardPressed: {
      opacity: 0.85,
    },
    lessonIndexBadge: {
      alignItems: 'center',
      backgroundColor: colors.chipBg,
      borderRadius: radius.full,
      height: 32,
      justifyContent: 'center',
      width: 32,
    },
    lessonIndexBadgeDone: {
      backgroundColor: colors.success,
    },
    lessonIndexText: {
      color: colors.textMuted,
      fontSize: fontSize.sm,
      fontWeight: fontWeight.bold,
    },
    lessonContent: {
      flex: 1,
    },
    lessonTitle: {
      ...typography.label,
      color: colors.textDark,
      marginBottom: 2,
    },
    lessonSummary: {
      ...typography.bodySm,
      color: colors.textMuted,
      marginBottom: spacing.xs,
    },
    lessonXp: {
      color: colors.gold,
      fontSize: fontSize.xs,
      fontWeight: fontWeight.semibold,
    },
    bottomSpacer: {
      height: spacing.xxl,
    },
  });
