import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Icon } from '../ui/icons';
import {
  cardShadow,
  radius,
  shadowMd,
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
    >
      <LinearGradient
        colors={[colors.primaryBackground, colors.white]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.row}>
          <View style={styles.iconCircle}>
            <Icon name="bulb" size={22} color={colors.primary} />
          </View>
          <View style={styles.content}>
            <Text style={styles.eyebrow}>Weekly insight</Text>
            <Text style={styles.heading}>{insight.heading}</Text>
            <Text style={styles.message} numberOfLines={2}>
              {insight.message}
            </Text>
          </View>
        </View>
        <View style={styles.footer}>
          <Text style={styles.link}>View full report</Text>
          <Icon name="arrow-right" size={16} color={colors.primary} strokeWidth={2.2} />
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      borderRadius: radius.lg,
      marginBottom: spacing.lg,
      overflow: 'hidden',
      ...shadowMd,
    },
    pressed: {
      opacity: 0.95,
      transform: [{ scale: 0.99 }],
    },
    gradient: {
      borderColor: colors.borderSubtle,
      borderRadius: radius.lg,
      borderWidth: 1,
      padding: spacing.lg,
    },
    row: {
      flexDirection: 'row',
      marginBottom: spacing.md,
    },
    iconCircle: {
      alignItems: 'center',
      backgroundColor: colors.cardBackground,
      borderRadius: radius.full,
      height: 48,
      justifyContent: 'center',
      marginRight: spacing.md,
      width: 48,
      ...cardShadow,
    },
    content: {
      flex: 1,
    },
    eyebrow: {
      ...typography.overline,
      color: colors.primary,
      marginBottom: spacing.xs,
      textTransform: 'uppercase',
    },
    heading: {
      ...typography.subheading,
      color: colors.textDark,
      marginBottom: spacing.xs,
    },
    message: {
      ...typography.bodySm,
      color: colors.textMuted,
    },
    footer: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: spacing.xs,
      justifyContent: 'flex-end',
    },
    link: {
      ...typography.label,
      color: colors.primary,
    },
  });
