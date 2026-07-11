import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { radius, shadowSm, spacing, typography, useThemedStyles } from '../../theme';
import type { ThemeColors } from '../../theme';

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
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.overline,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    ...shadowSm,
  },
});
