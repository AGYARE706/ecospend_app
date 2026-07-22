import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

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

/** Below this drag distance (px), a touch is treated as a tap, not a drag. */
const DRAG_THRESHOLD = 6;
/** Keeps the FAB from being dragged off the top/left edge or under the status bar. */
const TOP_CLEARANCE = spacing.xl;
const SIDE_CLEARANCE = spacing.md;
/** Matches the default resting spot's own offset (styles.wrap) — the drag
 * never goes further right/down than where it already, correctly, sits. */
const REST_MARGIN = spacing.lg;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Hovering launcher for Abena — starts bottom-right, teal to read as "the AI
 * thing" distinct from brand-green primary actions elsewhere. Draggable
 * anywhere on screen so it never permanently blocks whatever's underneath;
 * a gentle bob is the "alive AI" cue, layered on top of wherever it's been
 * dragged to. The label pill exists because a lone floating icon doesn't
 * self-explain what it opens.
 */
export default function AskCoachFab({ onPress }: AskCoachFabProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const drive = useRef(new Animated.Value(0)).current;
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const basePosition = useRef({ x: 0, y: 0 });
  const [footprint, setFootprint] = useState({ width: 224, height: 64 });

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

  const bounds = useRef({ minX: 0, maxX: 0, minY: 0, maxY: 0 });
  useEffect(() => {
    const { width: screenW, height: screenH } = Dimensions.get('window');
    bounds.current = {
      minX: -(screenW - footprint.width - SIDE_CLEARANCE - REST_MARGIN),
      maxX: 0,
      minY: -(screenH - footprint.height - TOP_CLEARANCE - REST_MARGIN),
      maxY: 0,
    };
  }, [footprint]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_evt, gesture) =>
        Math.abs(gesture.dx) > DRAG_THRESHOLD || Math.abs(gesture.dy) > DRAG_THRESHOLD,
      onPanResponderGrant: () => {
        basePosition.current = {
          // @ts-expect-error — Animated.Value exposes no public sync getter; this is the standard RN drag pattern.
          x: pan.x._value,
          // @ts-expect-error — same as above.
          y: pan.y._value,
        };
      },
      onPanResponderMove: (_evt, gesture) => {
        const nextX = clamp(
          basePosition.current.x + gesture.dx,
          bounds.current.minX,
          bounds.current.maxX,
        );
        const nextY = clamp(
          basePosition.current.y + gesture.dy,
          bounds.current.minY,
          bounds.current.maxY,
        );
        pan.setValue({ x: nextX, y: nextY });
      },
    }),
  ).current;

  const bobTranslateY = drive.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });

  return (
    <Animated.View
      style={[
        styles.wrap,
        { transform: [{ translateX: pan.x }, { translateY: Animated.add(pan.y, bobTranslateY) }] },
      ]}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        if (width > 0 && height > 0) {
          setFootprint({ width, height });
        }
      }}
      {...panResponder.panHandlers}
    >
      <View style={styles.row}>
        <View style={styles.buttonSlot}>
          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel="Ask Abena — your AI financial coach. Drag to move."
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
