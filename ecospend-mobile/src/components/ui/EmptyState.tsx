import { StyleSheet, Text, View } from 'react-native';

import { colors, fontSize, fontWeight, radius, spacing } from '../../theme';

/**
 * emoji — large emoji displayed inside a tinted medallion
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
      <View style={styles.medallion}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>
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
  medallion: {
    alignItems: 'center',
    backgroundColor: colors.chipBg,
    borderRadius: radius.full,
    height: 88,
    justifyContent: 'center',
    marginBottom: spacing.lg,
    width: 88,
  },
  emoji: {
    fontSize: fontSize.xxxl,
  },
  title: {
    color: colors.textDark,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: fontSize.md,
    lineHeight: 22,
    textAlign: 'center',
  },
});
