import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '../ui/icons';
import type { IconName } from '../ui/icons';
import { radius, shadowSm, spacing, typography, useTheme } from '../../theme';
import type { VaultThemeColors } from './vaultTheme';

export interface VaultQuickActionsProps {
  theme: VaultThemeColors;
  onCreateVault: () => void;
  onVaultHistory: () => void;
  onGroupVaults: () => void;
}

export default function VaultQuickActions({
  theme,
  onCreateVault,
  onVaultHistory,
  onGroupVaults,
}: VaultQuickActionsProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <QuickAction
          icon="add-circle-outline"
          iconColor={colors.healthy}
          label="Create Vault"
          theme={theme}
          onPress={onCreateVault}
        />
        <QuickAction
          icon="time-outline"
          iconColor={colors.blue}
          label="Vault History"
          theme={theme}
          onPress={onVaultHistory}
        />
        <QuickAction
          icon="people-outline"
          iconColor={colors.purple}
          label="Group Vaults"
          theme={theme}
          onPress={onGroupVaults}
        />
      </View>
    </View>
  );
}

function QuickAction({
  icon,
  iconColor,
  label,
  theme,
  onPress,
}: {
  icon: IconName | (string & {});
  iconColor: string;
  label: string;
  theme: VaultThemeColors;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.action,
        { backgroundColor: theme.card, borderColor: theme.cardBorder },
        pressed && styles.pressed,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={[styles.iconCircle, { backgroundColor: theme.chipBg }]}>
        <Icon name={icon} size={20} color={iconColor} />
      </View>
      <Text style={[styles.label, { color: theme.text }]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  action: {
    alignItems: 'center',
    borderRadius: radius.card,
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
    ...shadowSm,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  iconCircle: {
    alignItems: 'center',
    borderRadius: radius.full,
    height: 40,
    justifyContent: 'center',
    marginBottom: spacing.sm,
    width: 40,
  },
  label: {
    ...typography.label,
    textAlign: 'center',
  },
});
