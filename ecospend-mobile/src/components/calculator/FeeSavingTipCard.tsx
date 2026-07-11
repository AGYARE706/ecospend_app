import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import {
  cardShadow,
  fontSize,
  fontWeight,
  radius,
  spacing,
  useTheme,
  useThemedStyles,
} from '../../theme';
import type { ThemeColors } from '../../theme';

/**
 * Always-visible tip card with provider-specific fee-saving advice.
 */
export interface FeeSavingTipCardProps {
  tip: string;
}

export default function FeeSavingTipCard({ tip }: FeeSavingTipCardProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Ionicons name="bulb-outline" size={fontSize.lg} color={colors.primary} />
        <Text style={styles.title}>Fee-saving tip</Text>
      </View>
      <Text style={styles.tip}>{tip}</Text>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  card: {
    backgroundColor: colors.primaryBackground,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    ...cardShadow,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  title: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    marginLeft: spacing.sm,
  },
  tip: {
    color: colors.textDark,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
});
