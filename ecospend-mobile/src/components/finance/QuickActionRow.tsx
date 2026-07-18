import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  radius,
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
  /** Wallet top-up via Paystack — the only way money enters the app. */
  onAddPress: () => void;
  onGoalsPress: () => void;
  /** Wallet money-out: send to any MoMo number. */
  onTransferPress?: () => void;
  /** Recurring bills paid from the wallet. */
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
  { key: 'add', label: 'Top Up', icon: 'plus', tint: colors.primary, bg: colors.primaryBackground },
  { key: 'transfer', label: 'Send', icon: 'send', tint: colors.accent, bg: colors.accentLight },
  { key: 'goals', label: 'Goals', icon: 'target', tint: colors.gold, bg: colors.goldLight },
  { key: 'more', label: 'Bills', icon: 'receipt', tint: colors.textSecondary, bg: colors.chipBg },
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
    justifyContent: 'space-between',
    marginBottom: spacing.mlg,
    paddingHorizontal: spacing.xs,
  },
  action: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: spacing.xs,
  },
  pressed: {
    opacity: 0.7,
  },
  iconCircle: {
    alignItems: 'center',
    borderRadius: radius.full,
    height: 48,
    justifyContent: 'center',
    marginBottom: spacing.xs + 2,
    width: 48,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: typography.label.fontWeight,
    textAlign: 'center',
  },
});
