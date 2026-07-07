import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  radius,
  shadowXs,
  spacing,
  typography,
  useTheme,
  useThemedStyles,
} from '../../theme';
import type { ThemeColors } from '../../theme';
import { Icon } from '../ui/icons';
import type { IconName } from '../ui/icons';

type QuickActionKey = 'add' | 'transfer' | 'goals' | 'more';

/**
 * Row of quick-action shortcuts on the dashboard. Each action gets a tinted
 * SVG medallion drawn from the semantic palette for a cohesive, scannable row.
 */
export interface QuickActionRowProps {
  onAddPress: () => void;
  onGoalsPress: () => void;
  onTransferPress?: () => void;
  onMorePress?: () => void;
}

const getActions = (
  colors: ThemeColors,
): {
  key: QuickActionKey;
  label: string;
  icon: IconName;
  tint: string;
  bg: string;
}[] => [
  { key: 'add', label: 'Add', icon: 'plus', tint: colors.primary, bg: colors.primaryBackground },
  { key: 'transfer', label: 'Transfer', icon: 'transfer', tint: colors.accent, bg: colors.accentLight },
  { key: 'goals', label: 'Goals', icon: 'flag', tint: colors.gold, bg: colors.goldLight },
  { key: 'more', label: 'More', icon: 'grid', tint: colors.textSecondary, bg: colors.chipBg },
];

export default function QuickActionRow({
  onAddPress,
  onGoalsPress,
  onTransferPress,
  onMorePress,
}: QuickActionRowProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const handlers: Record<QuickActionKey, () => void> = {
    add: onAddPress,
    transfer: onTransferPress ?? (() => undefined),
    goals: onGoalsPress,
    more: onMorePress ?? (() => undefined),
  };

  return (
    <View style={styles.container}>
      {getActions(colors).map((action) => (
        <Pressable
          key={action.key}
          style={({ pressed }) => [styles.action, pressed && styles.pressed]}
          onPress={handlers[action.key]}
          accessibilityRole="button"
          accessibilityLabel={action.label}
        >
          <View style={[styles.iconCircle, { backgroundColor: action.bg }]}>
            <Icon name={action.icon} size={22} color={action.tint} strokeWidth={2} />
          </View>
          <Text style={styles.label} numberOfLines={1}>
            {action.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.smd,
    marginBottom: spacing.xl,
  },
  action: {
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.md,
    ...shadowXs,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.97 }],
  },
  iconCircle: {
    alignItems: 'center',
    borderRadius: radius.full,
    height: 46,
    justifyContent: 'center',
    marginBottom: spacing.sm,
    width: 46,
  },
  label: {
    ...typography.caption,
    color: colors.textDark,
    fontWeight: typography.label.fontWeight,
    textAlign: 'center',
  },
});
