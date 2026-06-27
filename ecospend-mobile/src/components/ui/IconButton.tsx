import { Pressable, StyleSheet, ViewStyle } from 'react-native';

import { colors, radius, shadowXs, spacing } from '../../theme';
import { Icon } from './icons';
import type { IconName } from './icons';

/**
 * A square, tappable icon affordance — used for header actions, list controls
 * and toolbar buttons. Variants control the surface; the icon stays optically
 * centered with a comfortable 44pt minimum hit target.
 */
export interface IconButtonProps {
  icon: IconName | (string & {});
  onPress: () => void;
  variant?: 'soft' | 'ghost' | 'solid' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  filled?: boolean;
  accessibilityLabel?: string;
  disabled?: boolean;
  style?: ViewStyle;
}

const DIMS = {
  sm: { box: 36, icon: 18 },
  md: { box: 44, icon: 20 },
  lg: { box: 52, icon: 24 },
};

export default function IconButton({
  icon,
  onPress,
  variant = 'soft',
  size = 'md',
  color,
  filled,
  accessibilityLabel,
  disabled = false,
  style,
}: IconButtonProps) {
  const dims = DIMS[size];
  const iconColor = color ?? (variant === 'solid' ? colors.onPrimary : colors.textDark);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      hitSlop={spacing.xs}
      style={({ pressed }) => [
        styles.base,
        { width: dims.box, height: dims.box, borderRadius: dims.box / 2.6 },
        variantStyle[variant],
        variant === 'soft' && shadowXs,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Icon name={icon} size={dims.icon} color={iconColor} filled={filled} />
    </Pressable>
  );
}

const variantStyle: Record<NonNullable<IconButtonProps['variant']>, ViewStyle> = {
  soft: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.borderSubtle },
  ghost: { backgroundColor: 'transparent' },
  solid: { backgroundColor: colors.primary },
  outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.border },
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.94 }],
  },
  disabled: {
    opacity: 0.4,
  },
});
