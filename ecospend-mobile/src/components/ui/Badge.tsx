import { StyleSheet, Text, View, ViewStyle } from 'react-native';

import { fontSize, fontWeight, radius, spacing, useTheme } from '../../theme';
import type { ThemeColors } from '../../theme';
import { Icon } from './icons';
import type { IconName } from './icons';

/**
 * A compact status pill for labels, counts and states. Tones map onto the
 * semantic palette; `solid` flips to a filled treatment for stronger emphasis.
 */
export type BadgeTone = 'neutral' | 'primary' | 'success' | 'warning' | 'error' | 'info' | 'gold';

export interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  solid?: boolean;
  icon?: IconName | (string & {});
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

const getTones = (
  colors: ThemeColors,
): Record<BadgeTone, { fg: string; bg: string; solidBg: string }> => ({
  neutral: { fg: colors.textSecondary, bg: colors.chipBg, solidBg: colors.textSecondary },
  primary: { fg: colors.primary, bg: colors.primaryBackground, solidBg: colors.primary },
  success: { fg: colors.successStrong, bg: colors.successLight, solidBg: colors.success },
  warning: { fg: colors.warningStrong, bg: colors.warningLight, solidBg: colors.warning },
  error: { fg: colors.errorStrong, bg: colors.errorLight, solidBg: colors.error },
  info: { fg: colors.blue, bg: colors.blueLight, solidBg: colors.blue },
  gold: { fg: colors.gold, bg: colors.goldLight, solidBg: colors.gold },
});

export default function Badge({
  label,
  tone = 'neutral',
  solid = false,
  icon,
  size = 'md',
  style,
}: BadgeProps) {
  const { colors } = useTheme();
  const t = getTones(colors)[tone];
  const fg = solid ? colors.onPrimary : t.fg;
  const isSm = size === 'sm';

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: solid ? t.solidBg : t.bg,
          paddingVertical: isSm ? 3 : spacing.xs,
          paddingHorizontal: isSm ? spacing.sm : spacing.smd,
        },
        style,
      ]}
    >
      {icon ? <Icon name={icon} size={isSm ? 12 : 14} color={fg} strokeWidth={2} /> : null}
      <Text style={[styles.label, { color: fg, fontSize: isSm ? fontSize.xs : fontSize.sm }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radius.chip,
    flexDirection: 'row',
    gap: spacing.xs,
  },
  label: {
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.1,
  },
});
