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
import type { WeeklyInsight } from '../../types';

export interface DashboardInsightTeaserProps {
  insight: WeeklyInsight;
  onPress: () => void;
}

/** Quiet one-row teaser into the weekly report — no hero chrome. */
export default function DashboardInsightTeaser({
  insight,
  onPress,
}: DashboardInsightTeaserProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="View weekly insight report"
    >
      <View style={styles.iconBadge}>
        <Icon name="bulb" size={20} color={colors.primary} strokeWidth={1.9} />
      </View>

      <View style={styles.content}>
        <Text style={styles.eyebrow}>Weekly insight</Text>
        <Text style={styles.heading} numberOfLines={1}>
          {insight.heading}
        </Text>
        <Text style={styles.message} numberOfLines={2}>
          {insight.message}
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
      backgroundColor: colors.primaryBackground,
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
      color: colors.primary,
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
