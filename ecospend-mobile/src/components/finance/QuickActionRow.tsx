import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, fontSize, fontWeight, radius, spacing } from '../../theme';

type QuickActionIcon = 'add' | 'transfer' | 'goals' | 'more';

/**
 * Row of quick action shortcuts on the dashboard.
 */
export interface QuickActionRowProps {
  onAddPress: () => void;
  onGoalsPress: () => void;
}

const ACTIONS: {
  key: QuickActionIcon;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { key: 'add', label: 'Add', icon: 'add' },
  { key: 'transfer', label: 'Transfer', icon: 'swap-horizontal' },
  { key: 'goals', label: 'Goals', icon: 'flag-outline' },
  { key: 'more', label: 'More', icon: 'grid-outline' },
];

export default function QuickActionRow({
  onAddPress,
  onGoalsPress,
}: QuickActionRowProps) {
  const handlers: Record<QuickActionIcon, () => void> = {
    add: onAddPress,
    transfer: () => undefined,
    goals: onGoalsPress,
    more: () => undefined,
  };

  return (
    <View style={styles.container}>
      {ACTIONS.map((action) => (
        <Pressable
          key={action.key}
          style={styles.actionItem}
          onPress={handlers[action.key]}
        >
          <View style={styles.iconCircle}>
            <Ionicons name={action.icon} size={fontSize.lg} color={colors.primary} />
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
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  actionItem: {
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    alignItems: 'center',
    backgroundColor: colors.primaryBackground,
    borderRadius: radius.full,
    height: 48,
    justifyContent: 'center',
    marginBottom: spacing.sm,
    width: 48,
  },
  label: {
    color: colors.textDark,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
});
