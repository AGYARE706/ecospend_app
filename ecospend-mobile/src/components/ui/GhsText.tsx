import { StyleSheet, Text, TextStyle } from 'react-native';

import { colors, fontSize, fontWeight } from '../../theme';

/**
 * amount — numeric monetary value to format as Ghana Cedis
 * variant — color style for income, expense, white-on-green, or default
 * size — typography scale for the amount display
 * style — optional text style overrides for layout or emphasis
 * numberOfLines — clamp the rendered amount to avoid wrapping/overflow in rows
 * adjustsFontSizeToFit — shrink large amounts to fit a constrained width
 * minimumFontScale — lower bound for adjustsFontSizeToFit scaling
 */
export interface GhsTextProps {
  amount: number;
  variant?: 'default' | 'white' | 'income' | 'expense';
  size?: 'sm' | 'md' | 'lg' | 'hero';
  style?: TextStyle;
  numberOfLines?: number;
  adjustsFontSizeToFit?: boolean;
  minimumFontScale?: number;
}

function formatGhs(amount: number): string {
  const formatted = new Intl.NumberFormat('en-GH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return `GH₵ ${formatted}`;
}

export default function GhsText({
  amount,
  variant = 'default',
  size = 'md',
  style,
  numberOfLines,
  adjustsFontSizeToFit,
  minimumFontScale = 0.7,
}: GhsTextProps) {
  return (
    <Text
      style={[styles.base, sizeStyles[size], variantStyles[variant], style]}
      numberOfLines={numberOfLines}
      adjustsFontSizeToFit={adjustsFontSizeToFit}
      minimumFontScale={adjustsFontSizeToFit ? minimumFontScale : undefined}
    >
      {formatGhs(amount)}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    fontWeight: fontWeight.semibold,
  },
});

const sizeStyles = StyleSheet.create({
  sm: {
    fontSize: fontSize.sm,
  },
  md: {
    fontSize: fontSize.lg,
  },
  lg: {
    fontSize: fontSize.xl,
  },
  hero: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
  },
});

const variantStyles = StyleSheet.create({
  default: {
    color: colors.textDark,
  },
  white: {
    color: colors.white,
  },
  income: {
    color: colors.success,
  },
  expense: {
    color: colors.error,
  },
});
