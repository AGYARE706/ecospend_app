import { ActivityIndicator, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';

import {
  colors,
  fontSize,
  fontWeight,
  radius,
  shadowBrand,
  shadowXs,
  spacing,
} from '../../theme';
import { Icon } from './icons';
import type { IconName } from './icons';

/**
 * Button hierarchy:
 *   primary      — the main affirmative action (filled green, brand glow)
 *   secondary    — supporting action (tonal / outlined)
 *   tertiary     — low-emphasis inline action (ghost)
 *   destructive  — irreversible/danger action (red)
 *   success      — positive confirmation (kept distinct from primary)
 *   text         — link-style affordance (legacy alias of tertiary-link)
 *
 * Legacy variant names (outline, ghost) are mapped onto the new hierarchy so
 * existing screens keep working during the migration.
 */
export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'destructive'
  | 'success'
  | 'text'
  | 'outline'
  | 'ghost';

export type ButtonSize = 'sm' | 'md' | 'lg';

export interface AppButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName | (string & {});
  iconPosition?: 'left' | 'right';
  /** Stretch to fill the parent width. Defaults to true for primary CTAs. */
  fullWidth?: boolean;
  style?: ViewStyle;
}

type Resolved =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'destructive'
  | 'success'
  | 'link';

const resolveVariant = (v: ButtonVariant): Resolved => {
  switch (v) {
    case 'outline':
      return 'secondary';
    case 'ghost':
      return 'tertiary';
    case 'text':
      return 'link';
    default:
      return v;
  }
};

const SIZES: Record<
  ButtonSize,
  { height: number; padX: number; font: number; icon: number; gap: number }
> = {
  sm: { height: 40, padX: spacing.md, font: fontSize.sm, icon: 16, gap: spacing.xs },
  md: { height: 48, padX: spacing.mlg, font: fontSize.md, icon: 18, gap: spacing.sm },
  lg: { height: 54, padX: spacing.lg, font: fontSize.lg, icon: 20, gap: spacing.sm },
};

/** Foreground (label + icon) color per resolved variant. */
const foreground: Record<Resolved, string> = {
  primary: colors.onPrimary,
  secondary: colors.primary,
  tertiary: colors.textSecondary,
  destructive: colors.onPrimary,
  success: colors.onPrimary,
  link: colors.primary,
};

export default function AppButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  size,
  icon,
  iconPosition = 'left',
  fullWidth,
  style,
}: AppButtonProps) {
  const resolved = resolveVariant(variant);
  const isDisabled = disabled || loading;

  // Sensible defaults: primary/destructive/success default to large full-width
  // CTAs; supporting variants are compact and hug their content.
  const sizeKey: ButtonSize =
    size ?? (resolved === 'secondary' || resolved === 'tertiary' ? 'md' : 'lg');
  const dims = SIZES[sizeKey];
  const stretch =
    fullWidth ??
    (resolved === 'primary' || resolved === 'destructive' || resolved === 'success');

  // ---- Link (text) variant ----
  if (resolved === 'link') {
    return (
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        hitSlop={spacing.sm}
        style={({ pressed }) => [styles.linkRow, (pressed || isDisabled) && styles.dim]}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled, busy: loading }}
      >
        {icon ? <Icon name={icon} size={18} color={colors.primary} /> : null}
        <Text style={styles.linkText}>{title}</Text>
      </Pressable>
    );
  }

  const fg = foreground[resolved];

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        { height: dims.height, paddingHorizontal: dims.padX, borderRadius: radius.button },
        stretch ? styles.full : styles.hug,
        variantContainer[resolved],
        resolved === 'primary' && !isDisabled && shadowBrand,
        (resolved === 'secondary' || resolved === 'tertiary') && shadowXs,
        pressed && !isDisabled && variantPressed[resolved],
        pressed && !isDisabled && styles.pressedScale,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={[styles.content, { gap: dims.gap }]}>
          {icon && iconPosition === 'left' ? (
            <Icon name={icon} size={dims.icon} color={fg} strokeWidth={2} />
          ) : null}
          <Text style={[styles.label, { fontSize: dims.font, color: fg }]} numberOfLines={1}>
            {title}
          </Text>
          {icon && iconPosition === 'right' ? (
            <Icon name={icon} size={dims.icon} color={fg} strokeWidth={2} />
          ) : null}
        </View>
      )}
    </Pressable>
  );
}

const variantContainer: Record<Resolved, ViewStyle> = {
  primary: { backgroundColor: colors.primary },
  secondary: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  tertiary: { backgroundColor: colors.chipBg },
  destructive: { backgroundColor: colors.error },
  success: { backgroundColor: colors.success },
  link: {},
};

const variantPressed: Record<Resolved, ViewStyle> = {
  primary: { backgroundColor: colors.primaryPressed },
  secondary: { backgroundColor: colors.primaryBackground, borderColor: colors.primary },
  tertiary: { backgroundColor: colors.border },
  destructive: { backgroundColor: colors.errorStrong },
  success: { backgroundColor: colors.successStrong },
  link: {},
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  full: { width: '100%' },
  hug: { alignSelf: 'flex-start' },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  label: {
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.1,
  },
  pressedScale: {
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.45,
  },
  dim: {
    opacity: 0.55,
  },
  linkRow: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  linkText: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
});
