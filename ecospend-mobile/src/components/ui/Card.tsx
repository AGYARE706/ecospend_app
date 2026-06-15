import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { cardShadow, colors, radius, spacing } from '../../theme';

/**
 * children — content rendered inside the card
 * variant — visual style: default white card, primary green hero, or insight tint
 * style — optional layout-only style overrides for the card container
 */
export interface CardProps {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'insight';
  style?: ViewStyle;
}

export default function Card({
  children,
  variant = 'default',
  style,
}: CardProps) {
  const variantStyle =
    variant === 'primary'
      ? styles.primary
      : variant === 'insight'
        ? styles.insight
        : styles.default;

  return <View style={[styles.base, variantStyle, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  default: {
    backgroundColor: colors.cardBackground,
    ...cardShadow,
  },
  primary: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    ...cardShadow,
  },
  insight: {
    backgroundColor: colors.primaryBackground,
    ...cardShadow,
  },
});
