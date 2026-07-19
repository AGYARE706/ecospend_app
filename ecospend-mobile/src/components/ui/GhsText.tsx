import { StyleSheet, Text, TextStyle } from 'react-native';

import { fontSize, fontWeight, useTheme } from '../../theme';

/**
 * amount — numeric monetary value to format as Ghana Cedis
 * variant — color style for income, expense, white-on-green, or default
 * size — typography scale for the amount display
 * style — optional text style overrides for layout or emphasis
 * numberOfLines — clamp the rendered amount to avoid wrapping/overflow in rows
 * adjustsFontSizeToFit — shrink large amounts to fit a constrained width
 * minimumFontScale — lower bound for adjustsFontSizeToFit scaling
 * compact — "₵33" instead of "GH₵ 33.00" (no decimals, short symbol) for cramped spaces like narrow cards
 */
export interface GhsTextProps {
  amount: number;
  variant?: 'default' | 'white' | 'income' | 'expense';
  size?: 'sm' | 'md' | 'lg' | 'hero';
  style?: TextStyle;
  numberOfLines?: number;
  adjustsFontSizeToFit?: boolean;
  minimumFontScale?: number;
  compact?: boolean;
}

function formatGhs(amount: number, compact?: boolean): string {
  if (compact) {
    return `₵${Math.round(amount).toLocaleString('en-GH')}`;
  }

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
  compact,
}: GhsTextProps) {
  const { colors } = useTheme();
  const variantColors: Record<NonNullable<GhsTextProps['variant']>, string> = {
    default: colors.textDark,
    white: colors.white,
    income: colors.success,
    expense: colors.error,
  };

  return (
    <Text
      style={[styles.base, sizeStyles[size], { color: variantColors[variant] }, style]}
      numberOfLines={numberOfLines}
      adjustsFontSizeToFit={adjustsFontSizeToFit}
      minimumFontScale={adjustsFontSizeToFit ? minimumFontScale : undefined}
    >
      {formatGhs(amount, compact)}
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

