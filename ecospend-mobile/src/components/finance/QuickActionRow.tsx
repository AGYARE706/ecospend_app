import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, fontSize, fontWeight, radius, shadowSm, spacing } from '../../theme';

type QuickActionIcon = 'add' | 'transfer' | 'goals' | 'more';

/**
 * Row of quick action shortcuts on the dashboard.
 */
export interface QuickActionRowProps {
  onAddPress: () => void;
  onGoalsPress: () => void;
  onTransferPress?: () => void;
}

const ACTIONS: {
  key: QuickActionIcon;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
}[] = [
  { key: 'add', label: 'Add', icon: 'add-circle-outline', iconColor: colors.primary },
  { key: 'transfer', label: 'Transfer', icon: 'swap-horizontal', iconColor: colors.blue },
  { key: 'goals', label: 'Goals', icon: 'flag-outline', iconColor: '#6A1B9A' },
  { key: 'more', label: 'More', icon: 'grid-outline', iconColor: colors.warning },
];

export default function QuickActionRow({
  onAddPress,
  onGoalsPress,
  onTransferPress,
}: QuickActionRowProps) {
  const handlers: Record<QuickActionIcon, () => void> = {
    add: onAddPress,
    transfer: onTransferPress ?? (() => undefined),
    goals: onGoalsPress,
    more: () => undefined,
  };

  return (
    <View style={styles.container}>
      {ACTIONS.map((action) => (
        <Pressable
          key={action.key}
          style={({ pressed }) => [styles.action, pressed && styles.pressed]}
          onPress={handlers[action.key]}
        >
          <View style={styles.iconCircle}>
            <Ionicons name={action.icon} size={20} color={action.iconColor} />
          </View>
          <Text style={styles.label}>{action.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  action: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.borderSubtle,
    borderRadius: radius.card,
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.md,
    ...shadowSm,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  iconCircle: {
    alignItems: 'center',
    backgroundColor: colors.chipBg,
    borderRadius: radius.full,
    height: 40,
    justifyContent: 'center',
    marginBottom: spacing.sm,
    width: 40,
  },
  label: {
    color: colors.textDark,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    textAlign: 'center',
  },
});
