import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, shadowSm, spacing, typography } from '../../theme';

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
    ...typography.overline,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: colors.white,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    ...shadowSm,
  },
});
