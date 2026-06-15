import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { cardShadow, colors, fontSize, fontWeight, radius, spacing } from '../../theme';

/**
 * Rounded section card wrapper for grouped flat transaction rows.
 */
export interface TransactionSectionCardProps {
  title: string;
  children: ReactNode;
}

export default function TransactionSectionCard({
  title,
  children,
}: TransactionSectionCardProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...cardShadow,
  },
});
