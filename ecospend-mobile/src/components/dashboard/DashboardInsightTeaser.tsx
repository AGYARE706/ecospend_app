import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Icon } from '../ui/icons';
import {
  fontSize,
  fontWeight,
  letterSpacing,
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

export default function DashboardInsightTeaser({
  insight,
  onPress,
}: DashboardInsightTeaserProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <Pressable
      style={({ pressed }) => [styles.shadowWrap, pressed && styles.pressed]}
      onPress={onPress}
    >
      <LinearGradient
        colors={[
          colors.heroGradientStart,
          colors.heroGradientMid,
          colors.heroGradientEnd,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.glowOrbLg} />
        <View style={styles.glowOrbSm} />

        <View style={styles.innerCard}>
          <View style={styles.eyebrowPill}>
            <Icon name="sparkles" size={13} color={colors.primary} />
            <Text style={styles.eyebrow}>Weekly insight</Text>
          </View>

          <View style={styles.contentRow}>
            <View style={styles.iconBadge}>
              <Icon name="bulb" size={22} color={colors.primary} />
            </View>
            <View style={styles.content}>
              <Text style={styles.heading}>{insight.heading}</Text>
              <Text style={styles.message} numberOfLines={3}>
                {insight.message}
              </Text>
            </View>
          </View>

          <View style={styles.ctaRow}>
            <Text style={styles.link}>View full report</Text>
            <View style={styles.ctaIcon}>
              <Icon name="arrow-right" size={14} color={colors.white} strokeWidth={2.4} />
            </View>
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    shadowWrap: {
      borderRadius: radius.heroCard,
      marginBottom: spacing.lg,
      ...shadowSm,
    },
    pressed: {
      opacity: 0.96,
      transform: [{ scale: 0.985 }],
    },
    gradient: {
      borderRadius: radius.heroCard,
      overflow: 'hidden',
      padding: spacing.xxs,
    },
    glowOrbLg: {
      backgroundColor: 'rgba(255,255,255,0.10)',
      borderRadius: radius.full,
      height: 120,
      position: 'absolute',
      right: -32,
      top: -40,
      width: 120,
    },
    glowOrbSm: {
      backgroundColor: 'rgba(255,255,255,0.06)',
      borderRadius: radius.full,
      bottom: -24,
      height: 80,
      left: -16,
      position: 'absolute',
      width: 80,
    },
    innerCard: {
      backgroundColor: colors.cardBackground,
      borderRadius: radius.lg,
      padding: spacing.lg,
    },
    eyebrowPill: {
      alignItems: 'center',
      alignSelf: 'flex-start',
      backgroundColor: colors.primaryBackground,
      borderRadius: radius.full,
      flexDirection: 'row',
      gap: spacing.xs,
      marginBottom: spacing.md,
      paddingHorizontal: spacing.smd,
      paddingVertical: spacing.xs,
    },
    eyebrow: {
      color: colors.primary,
      fontSize: fontSize.xs,
      fontWeight: fontWeight.bold,
      letterSpacing: letterSpacing.wide,
      textTransform: 'uppercase',
    },
    contentRow: {
      alignItems: 'flex-start',
      flexDirection: 'row',
      marginBottom: spacing.md,
    },
    iconBadge: {
      alignItems: 'center',
      backgroundColor: colors.primaryBackground,
      borderRadius: radius.md,
      height: 44,
      justifyContent: 'center',
      marginRight: spacing.smd,
      width: 44,
    },
    content: {
      flex: 1,
    },
    heading: {
      ...typography.subheading,
      color: colors.textDark,
      fontWeight: fontWeight.bold,
      marginBottom: spacing.xs,
    },
    message: {
      color: colors.textSecondary,
      fontSize: fontSize.md,
      fontWeight: fontWeight.medium,
      lineHeight: 22,
    },
    ctaRow: {
      alignItems: 'center',
      alignSelf: 'stretch',
      backgroundColor: colors.primary,
      borderRadius: radius.button,
      flexDirection: 'row',
      gap: spacing.sm,
      justifyContent: 'center',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.smd,
    },
    link: {
      ...typography.label,
      color: colors.white,
      fontSize: fontSize.md,
      fontWeight: fontWeight.semibold,
    },
    ctaIcon: {
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.20)',
      borderRadius: radius.full,
      height: 26,
      justifyContent: 'center',
      width: 26,
    },
  });
