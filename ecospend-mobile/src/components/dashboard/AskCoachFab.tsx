import { useEffect, useRef } from 'react';
import { Animated, Easing, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import {
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
 * Hovering launcher for Abena — bottom-right, teal to read as "the AI
 * thing" distinct from brand-green primary actions elsewhere.
 * A gentle bob is the "alive AI" cue; the label pill exists because a
 * lone floating icon doesn't self-explain what it opens.
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

  return (
    <Animated.View style={[styles.wrap, { transform: [{ translateY }] }]}>
      <View style={styles.row}>
        <View style={styles.buttonSlot}>
          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel="Ask Abena — your AI financial coach"
          >
            <View style={[styles.buttonInner, { borderColor: colors.accent }]}>
              <Image
                source={require('../../../assets/assistant.png')}
                style={styles.mascot}
                resizeMode="contain"
                accessibilityIgnoresInvertColors
              />
            </View>
          </Pressable>
        </View>

        <View style={styles.labelPill}>
          <Text style={styles.labelText}>Ask Abena</Text>
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
      alignItems: 'flex-end',
      bottom: spacing.lg,
      right: spacing.lg,
      position: 'absolute',
    },
    row: {
      alignItems: 'center',
      flexDirection: 'row-reverse',
      gap: spacing.sm,
    },
    buttonSlot: {
      alignItems: 'center',
      height: 56,
      justifyContent: 'center',
      width: 56,
    },
    button: {
      borderRadius: radius.full,
      opacity: 0.9,
      ...shadowLg,
    },
    buttonInner: {
      alignItems: 'center',
      backgroundColor: colors.cardBackground,
      borderRadius: radius.full,
      borderWidth: 2,
      height: 56,
      justifyContent: 'center',
      width: 56,
    },
    mascot: {
      height: 40,
      width: 40,
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
