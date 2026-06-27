import { ReactNode } from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';

import { colors, radius, shadowMd, shadowSm, shadowXs, spacing } from '../../theme';

type CardPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';
type CardElevation = 'none' | 'xs' | 'sm' | 'md';

/**
 * children — content rendered inside the card
 * variant — default white surface, primary green hero, insight tint, or flat outlined
 * padding — internal padding scale (defaults to 'md')
 * elevation — shadow depth (defaults per variant)
 * onPress — when provided, the card becomes pressable with press feedback
 * style — optional layout-only style overrides for the card container
 */
export interface CardProps {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'insight' | 'outlined';
  padding?: CardPadding;
  elevation?: CardElevation;
  onPress?: () => void;
  style?: ViewStyle;
}

const paddingMap: Record<CardPadding, number> = {
  none: 0,
  sm: spacing.smd,
  md: spacing.md,
  lg: spacing.lg,
  xl: spacing.xl,
};

const elevationMap: Record<CardElevation, ViewStyle> = {
  none: {},
  xs: shadowXs,
  sm: shadowSm,
  md: shadowMd,
};

export default function Card({
  children,
  variant = 'default',
  padding = 'md',
  elevation,
  onPress,
  style,
}: CardProps) {
  const defaultElevation: CardElevation =
    variant === 'outlined' ? 'none' : variant === 'primary' ? 'md' : 'sm';
  const shadow = elevationMap[elevation ?? defaultElevation];

  const composedStyle: ViewStyle[] = [
    styles.base,
    variantStyles[variant],
    shadow,
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

const variantStyles: Record<NonNullable<CardProps['variant']>, ViewStyle> = {
  default: {
    backgroundColor: colors.cardBackground,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.card,
  },
  outlined: {
    backgroundColor: colors.cardBackground,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.card,
  },
  primary: {
    backgroundColor: colors.primary,
    borderRadius: radius.heroCard,
  },
  insight: {
    backgroundColor: colors.primaryBackground,
    borderColor: colors.primary + '22',
    borderWidth: 1,
    borderRadius: radius.card,
  },
};

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
});
