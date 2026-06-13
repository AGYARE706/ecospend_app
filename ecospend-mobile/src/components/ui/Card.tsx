import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { cardShadow, colors, radius, spacing } from '../../theme';

/**
 * children — content rendered inside the card
 * style — optional layout-only style overrides for the card container
 */
export interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
}

export default function Card({ children, style }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...cardShadow,
  },
});
