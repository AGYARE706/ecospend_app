import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '../ui/icons';
import {
  radius,
  shadowSm,
  spacing,
  typography,
  useTheme,
  useThemedStyles,
} from '../../theme';
import type { ThemeColors } from '../../theme';

export interface LearnTeaserCardProps {
  currentStreak: number;
  onPress: () => void;
}

/** Entry point into Financial Lessons — same skeleton as InsightOfTheDayCard, warning accent to tie into the streak flame theme. */
export default function LearnTeaserCard({ currentStreak, onPress }: LearnTeaserCardProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  const message = currentStreak > 0
    ? `You're on a ${currentStreak}-day streak — keep it alive with a quick lesson.`
    : 'Bite-sized lessons on budgeting, saving and more — earn XP and badges as you go.';

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Financial Lessons"
    >
      <View style={styles.iconBadge}>
        <Icon name="book" size={20} color={colors.warning} strokeWidth={1.9} />
      </View>

      <View style={styles.content}>
        <Text style={styles.eyebrow}>Financial Lessons</Text>
        <Text style={styles.heading} numberOfLines={1}>
          Learn something new today
        </Text>
        <Text style={styles.message} numberOfLines={2}>
          {message}
        </Text>
      </View>

      <Icon name="chevron-right" size={18} color={colors.textLight} strokeWidth={2} />
    </Pressable>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      alignItems: 'center',
      backgroundColor: colors.cardBackground,
      borderColor: colors.borderSubtle,
      borderRadius: radius.card,
      borderWidth: 1,
      flexDirection: 'row',
      gap: spacing.smd,
      marginBottom: spacing.mlg,
      padding: spacing.md,
      ...shadowSm,
    },
    pressed: {
      opacity: 0.85,
    },
    iconBadge: {
      alignItems: 'center',
      backgroundColor: colors.orangeLight,
      borderRadius: radius.md,
      height: 40,
      justifyContent: 'center',
      width: 40,
    },
    content: {
      flex: 1,
    },
    eyebrow: {
      ...typography.overline,
      color: colors.warning,
      marginBottom: 1,
      textTransform: 'uppercase',
    },
    heading: {
      ...typography.label,
      color: colors.textDark,
      fontSize: 15,
      marginBottom: 1,
    },
    message: {
      ...typography.bodySm,
      color: colors.textMuted,
    },
  });
