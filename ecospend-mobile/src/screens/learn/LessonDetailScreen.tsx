import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

import { Icon } from '../../components/ui/icons';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import { completeLesson, getLesson } from '../../api/engagementApi';
import type { LessonCompletionResult, LessonDetail } from '../../types/engagement';
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

type LessonDetailNavProp = StackNavigationProp<ProfileStackParamList, 'LessonDetail'>;
type LessonDetailRouteProp = RouteProp<ProfileStackParamList, 'LessonDetail'>;

export default function LessonDetailScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation<LessonDetailNavProp>();
  const route = useRoute<LessonDetailRouteProp>();
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<LessonCompletionResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getLesson(route.params.lessonId)
      .then(setLesson)
      .catch(() => setLesson(null));
  }, [route.params.lessonId]);

  const paragraphs = useMemo(
    () => (lesson?.content ?? '').split('\n\n').filter((p) => p.trim().length > 0),
    [lesson?.content],
  );

  const allAnswered = lesson ? lesson.quiz.every((q) => answers[q.id] !== undefined) : false;

  const handleSubmit = async () => {
    if (!lesson || !allAnswered || submitting) {
      return;
    }
    setSubmitting(true);
    const correctCount = lesson.quiz.filter((q) => answers[q.id] === q.correctIndex).length;
    const score = Math.round((correctCount / lesson.quiz.length) * 100);
    try {
      const completionResult = await completeLesson(lesson.id, score);
      setResult(completionResult);
    } catch {
      // Leave the quiz interactive so the user can retry.
    } finally {
      setSubmitting(false);
    }
  };

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
            <Text style={styles.headerTitle} numberOfLines={1}>{lesson?.title ?? 'Lesson'}</Text>
          </View>
          <View style={styles.headerRight} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {paragraphs.map((paragraph, index) => (
            <Text key={index} style={styles.paragraph}>{paragraph}</Text>
          ))}

          {lesson && lesson.quiz.length > 0 ? (
            <View style={styles.quizSection}>
              <Text style={styles.quizHeading}>Quick check</Text>
              {lesson.quiz.map((question, qIndex) => {
                const selected = answers[question.id];
                const answered = selected !== undefined;
                return (
                  <View key={question.id} style={styles.questionCard}>
                    <Text style={styles.questionText}>{qIndex + 1}. {question.question}</Text>
                    {question.choices.map((choice, choiceIndex) => {
                      const isSelected = selected === choiceIndex;
                      const isCorrectChoice = choiceIndex === question.correctIndex;
                      const showFeedback = answered && (isSelected || isCorrectChoice);
                      return (
                        <Pressable
                          key={choiceIndex}
                          style={({ pressed }) => [
                            styles.choice,
                            isSelected && (isCorrectChoice ? styles.choiceCorrect : styles.choiceWrong),
                            showFeedback && !isSelected && isCorrectChoice && styles.choiceCorrectHint,
                            pressed && styles.choicePressed,
                          ]}
                          onPress={() => setAnswers((prev) => ({ ...prev, [question.id]: choiceIndex }))}
                        >
                          <Text style={styles.choiceText}>{choice}</Text>
                          {isSelected ? (
                            <Icon
                              name={isCorrectChoice ? 'check' : 'x'}
                              size={16}
                              color={isCorrectChoice ? colors.success : colors.error}
                            />
                          ) : null}
                        </Pressable>
                      );
                    })}
                    {answered ? <Text style={styles.explanation}>{question.explanation}</Text> : null}
                  </View>
                );
              })}

              {result ? (
                <View style={styles.resultCard}>
                  <Icon name="trophy" size={22} color={colors.gold} strokeWidth={1.9} />
                  <Text style={styles.resultTitle}>
                    {result.xpEarned > 0 ? `+${result.xpEarned} XP earned!` : 'Lesson updated'}
                  </Text>
                  {result.newlyUnlockedBadges.length > 0 ? (
                    <Text style={styles.resultSub}>
                      New badge unlocked: {result.newlyUnlockedBadges.map((b) => b.title).join(', ')}
                    </Text>
                  ) : null}
                  <Pressable
                    style={({ pressed }) => [styles.doneBtn, pressed && styles.doneBtnPressed]}
                    onPress={() => navigation.goBack()}
                  >
                    <Text style={styles.doneBtnText}>Back to lessons</Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  style={({ pressed }) => [
                    styles.submitBtn,
                    (!allAnswered || submitting) && styles.submitBtnDisabled,
                    pressed && allAnswered && !submitting && styles.submitBtnPressed,
                  ]}
                  onPress={handleSubmit}
                  disabled={!allAnswered || submitting}
                >
                  <Text style={styles.submitBtnText}>
                    {lesson.completed ? 'Retake & Update Score' : 'Complete Lesson'}
                  </Text>
                </Pressable>
              )}
            </View>
          ) : null}

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
    headerRight: {
      width: 40,
    },
    scrollContent: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
    },
    paragraph: {
      ...typography.body,
      color: colors.textDark,
      lineHeight: 23,
      marginBottom: spacing.md,
    },
    quizSection: {
      marginTop: spacing.md,
    },
    quizHeading: {
      color: colors.textDark,
      fontSize: fontSize.lg,
      fontWeight: fontWeight.bold,
      marginBottom: spacing.md,
    },
    questionCard: {
      backgroundColor: colors.cardBackground,
      borderColor: colors.borderSubtle,
      borderRadius: radius.card,
      borderWidth: 1,
      marginBottom: spacing.md,
      padding: spacing.md,
      ...shadowSm,
    },
    questionText: {
      ...typography.label,
      color: colors.textDark,
      marginBottom: spacing.sm,
    },
    choice: {
      alignItems: 'center',
      backgroundColor: colors.chipBg,
      borderColor: 'transparent',
      borderRadius: radius.md,
      borderWidth: 1.5,
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.xs,
      paddingHorizontal: spacing.smd,
      paddingVertical: spacing.sm,
    },
    choicePressed: {
      opacity: 0.85,
    },
    choiceCorrect: {
      backgroundColor: colors.successLight,
      borderColor: colors.success,
    },
    choiceWrong: {
      backgroundColor: colors.errorLight,
      borderColor: colors.error,
    },
    choiceCorrectHint: {
      borderColor: colors.success,
    },
    choiceText: {
      ...typography.bodySm,
      color: colors.textDark,
      flex: 1,
    },
    explanation: {
      ...typography.bodySm,
      color: colors.textMuted,
      marginTop: spacing.xs,
    },
    submitBtn: {
      alignItems: 'center',
      backgroundColor: colors.primary,
      borderRadius: radius.button,
      minHeight: 48,
      justifyContent: 'center',
    },
    submitBtnDisabled: {
      opacity: 0.4,
    },
    submitBtnPressed: {
      opacity: 0.88,
    },
    submitBtnText: {
      color: colors.onPrimary,
      fontSize: fontSize.md,
      fontWeight: fontWeight.semibold,
    },
    resultCard: {
      alignItems: 'center',
      backgroundColor: colors.goldLight,
      borderRadius: radius.card,
      gap: spacing.xs,
      padding: spacing.lg,
    },
    resultTitle: {
      color: colors.textDark,
      fontSize: fontSize.lg,
      fontWeight: fontWeight.bold,
    },
    resultSub: {
      ...typography.bodySm,
      color: colors.textMuted,
      textAlign: 'center',
    },
    doneBtn: {
      backgroundColor: colors.primary,
      borderRadius: radius.button,
      marginTop: spacing.sm,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
    },
    doneBtnPressed: {
      opacity: 0.88,
    },
    doneBtnText: {
      color: colors.onPrimary,
      fontSize: fontSize.sm,
      fontWeight: fontWeight.semibold,
    },
    bottomSpacer: {
      height: spacing.xxl,
    },
  });
