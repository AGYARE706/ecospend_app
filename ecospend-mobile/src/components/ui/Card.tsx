import { ReactNode } from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';

import { colors, radius, shadowMd, spacing } from '../../theme';

type CardPadding = 'none' | 'sm' | 'md' | 'lg';

/**
 * children — content rendered inside the card
 * variant — visual style: default white card, primary green hero, or insight tint
 * padding — internal padding scale (defaults to 'md')
 * onPress — when provided, the card becomes pressable with press feedback
 * style — optional layout-only style overrides for the card container
 */
export interface CardProps {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'insight';
  padding?: CardPadding;
  onPress?: () => void;
  style?: ViewStyle;
}

const paddingMap: Record<CardPadding, number> = {
  none: 0,
  sm: spacing.sm,
  md: spacing.md,
  lg: spacing.lg,
};

export default function Card({
  children,
  variant = 'default',
  padding = 'md',
  onPress,
  style,
}: CardProps) {
  const variantStyle =
    variant === 'primary'
      ? styles.primary
      : variant === 'insight'
        ? styles.insight
        : styles.default;

  const composedStyle: ViewStyle[] = [
    styles.base,
    variantStyle,
    { padding: paddingMap[padding] },
    style as ViewStyle,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [...composedStyle, pressed && styles.pressed]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={composedStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.card,
  },
  default: {
    backgroundColor: colors.cardBackground,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    ...shadowMd,
  },
  primary: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    ...shadowMd,
  },
  insight: {
    backgroundColor: colors.primaryBackground,
    ...shadowMd,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
});
