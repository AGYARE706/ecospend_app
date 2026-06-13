import { StyleSheet, Text, TextStyle } from 'react-native';

import { colors, fontSize, fontWeight } from '../../theme';

/**
 * amount — numeric monetary value to format as Ghana Cedis
 * style — optional text style overrides for layout or emphasis
 */
export interface GhsTextProps {
  amount: number;
  style?: TextStyle;
}

function formatGhs(amount: number): string {
  const formatted = new Intl.NumberFormat('en-GH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return `GH₵ ${formatted}`;
}

export default function GhsText({ amount, style }: GhsTextProps) {
  return <Text style={[styles.text, style]}>{formatGhs(amount)}</Text>;
}

const styles = StyleSheet.create({
  text: {
    color: colors.textDark,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
});
