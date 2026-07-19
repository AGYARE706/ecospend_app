import { Image, StyleSheet, Text, View } from 'react-native';
import type { ImageSourcePropType } from 'react-native';

import { radius, spacing, typography, useTheme, useThemedStyles } from '../../theme';
import type { ThemeColors } from '../../theme';
import AppButton from './AppButton';
import { Icon } from './icons';
import type { IconName } from './icons';

/**
 * icon — single-color SVG icon rendered inside a tinted medallion
 * imageSource — raster image instead of icon (e.g. a branded mark not in the vector set); takes priority over icon
 * title — primary empty state message
 * subtitle — secondary helper text below the title
 * actionLabel / onAction — optional call-to-action button
 */
export interface EmptyStateProps {
  icon?: IconName | (string & {});
  imageSource?: ImageSourcePropType;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon = 'sparkles',
  imageSource,
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
        {imageSource ? (
          <Image source={imageSource} style={styles.medallionImage} resizeMode="contain" />
        ) : (
          <Icon name={icon} size={32} color={colors.primary} strokeWidth={1.6} />
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
    height: 76,
    justifyContent: 'center',
    marginBottom: spacing.md,
    width: 76,
  },
  medallionImage: {
    height: 32,
    tintColor: colors.primary,
    width: 32,
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
