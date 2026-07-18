import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Icon } from '../ui/icons';
import {
  palette,
  radius,
  shadowLg,
  shadowSm,
  spacing,
  typography,
  useTheme,
  useThemedStyles,
} from '../../theme';
import type { ThemeColors } from '../../theme';

export interface AskCoachFabProps {
  onPress: () => void;
}

/**
 * Hovering launcher for Ask EcoSpend — bottom-left, teal to read as "the AI
 * thing" distinct from the bottom-right brand-green "add" FABs elsewhere.
 * A gentle bob + pulsing glow (one shared driver, two interpolations) is
 * the "alive AI" cue modern assistant bubbles use; the label pill exists
 * because a lone floating icon doesn't self-explain what it opens.
 */
export default function AskCoachFab({ onPress }: AskCoachFabProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const drive = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(drive, {
          toValue: 1,
          duration: 1700,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(drive, {
          toValue: 0,
          duration: 1700,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [drive]);

  const translateY = drive.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });
  const glowScale = drive.interpolate({ inputRange: [0, 1], outputRange: [1, 1.28] });
  const glowOpacity = drive.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.12] });

  return (
    <Animated.View style={[styles.wrap, { transform: [{ translateY }] }]}>
      <View style={styles.row}>
        <View style={styles.buttonSlot}>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.glow,
              {
                backgroundColor: colors.accent,
                opacity: glowOpacity,
                transform: [{ scale: glowScale }],
              },
            ]}
          />
          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel="Ask EcoSpend — your AI financial coach"
          >
            <LinearGradient
              colors={[palette.teal[500], palette.teal[700]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonInner}
            >
              <Icon name="sparkles" size={24} color={colors.onPrimary} strokeWidth={2} />
            </LinearGradient>
          </Pressable>
        </View>

        <View style={styles.labelPill}>
          <Text style={styles.labelText}>Ask AI</Text>
          <Text style={styles.labelSubtext} numberOfLines={1}>
            Your AI money coach
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    wrap: {
      alignItems: 'flex-start',
      bottom: spacing.lg,
      left: spacing.lg,
      position: 'absolute',
    },
    row: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: spacing.sm,
    },
    buttonSlot: {
      alignItems: 'center',
      height: 56,
      justifyContent: 'center',
      width: 56,
    },
    glow: {
      borderRadius: radius.full,
      height: 78,
      position: 'absolute',
      width: 78,
    },
    button: {
      borderRadius: radius.full,
      opacity: 0.9,
      ...shadowLg,
    },
    buttonInner: {
      alignItems: 'center',
      borderRadius: radius.full,
      height: 56,
      justifyContent: 'center',
      width: 56,
    },
    pressed: {
      opacity: 0.8,
      transform: [{ scale: 0.94 }],
    },
    labelPill: {
      backgroundColor: colors.cardBackground,
      borderColor: colors.borderSubtle,
      borderRadius: radius.lg,
      borderWidth: 1,
      maxWidth: 160,
      paddingHorizontal: spacing.smd,
      paddingVertical: spacing.xs,
      ...shadowSm,
    },
    labelText: {
      ...typography.label,
      color: colors.textDark,
    },
    labelSubtext: {
      ...typography.caption,
      color: colors.textMuted,
      marginTop: 1,
    },
  });
