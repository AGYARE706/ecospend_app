import { useEffect, useMemo, useRef } from 'react';
import { Animated, Dimensions, Easing, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import AppButton from './AppButton';
import { Icon } from './icons';
import type { IconName } from './icons';
import {
  palette,
  radius,
  shadowLg,
  spacing,
  typography,
  useTheme,
  useThemedStyles,
} from '../../theme';
import type { ThemeColors } from '../../theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CONFETTI_COUNT = 28;
const CONFETTI_COLORS = [
  palette.green[500],
  palette.teal[500],
  palette.gold[500],
  palette.green[300],
  palette.teal[300],
];

interface ConfettiConfig {
  left: number;
  color: string;
  size: number;
  delay: number;
  duration: number;
  rotateStart: number;
  drift: number;
}

function makeConfettiPieces(): ConfettiConfig[] {
  return Array.from({ length: CONFETTI_COUNT }, () => ({
    left: Math.random() * SCREEN_WIDTH,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    size: 6 + Math.random() * 6,
    delay: Math.random() * 300,
    duration: 1800 + Math.random() * 1000,
    rotateStart: Math.random() * 360,
    drift: (Math.random() - 0.5) * 80,
  }));
}

function ConfettiPiece({ config }: { config: ConfettiConfig }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration: config.duration,
      delay: config.delay,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-40, SCREEN_HEIGHT * 0.75],
  });
  const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [0, config.drift] });
  const rotate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [`${config.rotateStart}deg`, `${config.rotateStart + 360}deg`],
  });
  const opacity = progress.interpolate({ inputRange: [0, 0.85, 1], outputRange: [1, 1, 0] });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.confettiPiece,
        {
          left: config.left,
          width: config.size,
          height: config.size * 1.6,
          backgroundColor: config.color,
          opacity,
          transform: [{ translateY }, { translateX }, { rotate }],
        },
      ]}
    />
  );
}

export interface CompletionCelebrationProps {
  visible: boolean;
  /** Icon shown in the badge above the title. Defaults to "trophy". */
  icon?: IconName | (string & {});
  title: string;
  subtitle: string;
  primaryLabel: string;
  onPrimaryPress: () => void;
  primaryIcon?: IconName | (string & {});
  /** Omit for a single-action celebration (e.g. a vault, where there's no shortcut to offer). */
  secondaryLabel?: string;
  onSecondaryPress?: () => void;
  /** Android back button / backdrop request-close — defaults to the secondary action, falling back to the primary one. */
  onDismiss?: () => void;
}

/**
 * Shared confetti-celebration modal for "you hit your target" moments
 * (savings goals, vaults, group vaults) — each call site supplies its own
 * copy and actions rather than this component knowing about any of them.
 */
export default function CompletionCelebration({
  visible,
  icon = 'trophy',
  title,
  subtitle,
  primaryLabel,
  onPrimaryPress,
  primaryIcon = 'arrow-right',
  secondaryLabel,
  onSecondaryPress,
  onDismiss,
}: CompletionCelebrationProps) {
  const { colors } = useTheme();
  const themedStyles = useThemedStyles(createStyles);
  const scale = useRef(new Animated.Value(0.8)).current;
  const confettiPieces = useMemo(() => (visible ? makeConfettiPieces() : []), [visible]);
  const requestClose = onDismiss ?? onSecondaryPress ?? onPrimaryPress;

  useEffect(() => {
    if (visible) {
      scale.setValue(0.8);
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 6,
        tension: 60,
      }).start();
    }
  }, [visible, scale]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={requestClose}>
      <View style={themedStyles.backdrop}>
        {confettiPieces.map((config, index) => (
          <ConfettiPiece key={index} config={config} />
        ))}

        <Animated.View style={[themedStyles.card, { transform: [{ scale }] }]}>
          <View style={themedStyles.iconBadge}>
            <Icon name={icon} size={32} color={colors.success} />
          </View>
          <Text style={themedStyles.title}>{title}</Text>
          <Text style={themedStyles.subtitle}>{subtitle}</Text>

          <View style={themedStyles.actions}>
            <AppButton
              title={primaryLabel}
              onPress={onPrimaryPress}
              variant="primary"
              size="lg"
              fullWidth
              icon={primaryIcon}
            />
            {secondaryLabel && onSecondaryPress ? (
              <Pressable
                style={({ pressed }) => [themedStyles.laterButton, pressed && themedStyles.laterButtonPressed]}
                onPress={onSecondaryPress}
              >
                <Text style={themedStyles.laterText}>{secondaryLabel}</Text>
              </Pressable>
            ) : null}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  confettiPiece: {
    position: 'absolute',
    top: 0,
    borderRadius: 2,
  },
});

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      alignItems: 'center',
      backgroundColor: 'rgba(9, 13, 20, 0.55)',
      justifyContent: 'center',
      paddingHorizontal: spacing.xl,
    },
    card: {
      alignItems: 'center',
      backgroundColor: colors.cardBackground,
      borderRadius: radius.sheet,
      padding: spacing.xl,
      width: '100%',
      ...shadowLg,
    },
    iconBadge: {
      alignItems: 'center',
      backgroundColor: colors.successLight,
      borderRadius: radius.full,
      height: 72,
      justifyContent: 'center',
      marginBottom: spacing.md,
      width: 72,
    },
    title: {
      ...typography.h2,
      color: colors.textDark,
      marginBottom: spacing.xs,
      textAlign: 'center',
    },
    subtitle: {
      ...typography.body,
      color: colors.textMuted,
      marginBottom: spacing.lg,
      textAlign: 'center',
    },
    actions: {
      gap: spacing.sm,
      width: '100%',
    },
    laterButton: {
      alignItems: 'center',
      paddingVertical: spacing.sm,
    },
    laterButtonPressed: {
      opacity: 0.6,
    },
    laterText: {
      ...typography.label,
      color: colors.textMuted,
    },
  });
