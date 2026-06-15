import { StyleSheet, Text, View } from 'react-native';

import { colors, fontSize, fontWeight, spacing } from '../../theme';

/**
 * emoji — large emoji displayed above the title
 * title — primary empty state message
 * subtitle — secondary helper text below the title
 */
export interface EmptyStateProps {
  emoji: string;
  title: string;
  subtitle: string;
}

export default function EmptyState({ emoji, title, subtitle }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
  },
  emoji: {
    fontSize: fontSize.xxxl,
    marginBottom: spacing.md,
  },
  title: {
    color: colors.textDark,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textGrey,
    fontSize: fontSize.md,
    textAlign: 'center',
  },
});
