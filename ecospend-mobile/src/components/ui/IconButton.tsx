import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { radius, shadowXs, spacing, useTheme } from '../../theme';
import type { ThemeColors } from '../../theme';
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
  /** Small red count badge in the top-right corner; omitted when 0 or undefined. */
  badgeCount?: number;
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
  badgeCount,
}: IconButtonProps) {
  const { colors } = useTheme();
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
        getVariantStyle(colors)[variant],
        variant === 'soft' && shadowXs,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Icon name={icon} size={dims.icon} color={iconColor} filled={filled} />
      {badgeCount ? (
        <View style={[styles.badge, { backgroundColor: colors.error, borderColor: colors.cardBackground }]}>
          <Text style={styles.badgeText}>{badgeCount > 9 ? '9+' : badgeCount}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const getVariantStyle = (
  colors: ThemeColors,
): Record<NonNullable<IconButtonProps['variant']>, ViewStyle> => ({
  soft: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  ghost: { backgroundColor: 'transparent' },
  solid: { backgroundColor: colors.primary },
  outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.border },
});

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
  badge: {
    alignItems: 'center',
    borderRadius: radius.full,
    borderWidth: 1.5,
    height: 18,
    justifyContent: 'center',
    minWidth: 18,
    paddingHorizontal: 3,
    position: 'absolute',
    right: -4,
    top: -4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});
