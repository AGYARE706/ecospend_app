import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { fontSize, fontWeight, radius, shadowSm, spacing } from '../../theme';
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
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <QuickAction
          icon="add-circle-outline"
          iconColor="#2E7D32"
          label="Create Vault"
          theme={theme}
          onPress={onCreateVault}
        />
        <QuickAction
          icon="time-outline"
          iconColor="#1565C0"
          label="Vault History"
          theme={theme}
          onPress={onVaultHistory}
        />
        <QuickAction
          icon="people-outline"
          iconColor="#6A1B9A"
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
  icon: keyof typeof Ionicons.glyphMap;
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
    >
      <View style={[styles.iconCircle, { backgroundColor: theme.chipBg }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
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
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    textAlign: 'center',
  },
});
