import { StyleSheet, Text, View } from 'react-native';

import { radius, spacing, typography, useTheme, useThemedStyles } from '../../theme';
import type { ThemeColors } from '../../theme';
import AppButton from './AppButton';
import { Icon } from './icons';
import type { IconName } from './icons';

/**
 * icon — preferred: an SVG icon rendered inside a tinted medallion
 * emoji — legacy fallback medallion glyph (used when no icon is provided)
 * title — primary empty state message
 * subtitle — secondary helper text below the title
 * actionLabel / onAction — optional call-to-action button
 */
export interface EmptyStateProps {
  icon?: IconName | (string & {});
  emoji?: string;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon,
  emoji,
  title,
  subtitle,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.container}>
      <View style={styles.medallion}>
        {icon ? (
          <Icon name={icon} size={34} color={colors.primary} strokeWidth={1.6} />
        ) : (
          <Text style={styles.emoji}>{emoji ?? '✨'}</Text>
        )}
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {actionLabel && onAction ? (
        <AppButton
          title={actionLabel}
          onPress={onAction}
          variant="secondary"
          size="md"
          fullWidth={false}
          style={styles.action}
        />
      ) : null}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
  },
  medallion: {
    alignItems: 'center',
    backgroundColor: colors.primaryBackground,
    borderRadius: radius.full,
    height: 84,
    justifyContent: 'center',
    marginBottom: spacing.lg,
    width: 84,
  },
  emoji: {
    fontSize: 34,
  },
  title: {
    ...typography.subheading,
    color: colors.textDark,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
  action: {
    marginTop: spacing.lg,
  },
});
