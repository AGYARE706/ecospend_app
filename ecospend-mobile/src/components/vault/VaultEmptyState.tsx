import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '../ui/icons';
import AppButton from '../ui/AppButton';
import { radius, spacing, typography, useTheme } from '../../theme';
import type { VaultThemeColors } from './vaultTheme';

export interface VaultEmptyStateProps {
  theme: VaultThemeColors;
  onCreateVault: () => void;
}

export default function VaultEmptyState({
  theme,
  onCreateVault,
}: VaultEmptyStateProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <View style={[styles.illustration, { backgroundColor: theme.chipBg }]}>
        <View style={styles.iconRing}>
          <Icon name="lock-closed" size={42} color={colors.primary} />
        </View>
        <View style={[styles.orbit, styles.orbitOne]} />
        <View style={[styles.orbit, styles.orbitTwo]} />
      </View>

      <Text style={[styles.title, { color: theme.text }]}>
        Start your first Vault
      </Text>
      <Text style={[styles.subtitle, { color: theme.textMuted }]}>
        Lock away savings with clear goals, maturity dates, and transparent
        withdrawal fees.
      </Text>

      <AppButton
        title="Create Vault"
        icon="add"
        onPress={onCreateVault}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  illustration: {
    alignItems: 'center',
    borderRadius: radius.xl,
    height: 180,
    justifyContent: 'center',
    marginBottom: spacing.lg,
    overflow: 'hidden',
    width: '100%',
  },
  iconRing: {
    alignItems: 'center',
    backgroundColor: 'rgba(46, 125, 50, 0.12)',
    borderRadius: radius.full,
    height: 88,
    justifyContent: 'center',
    width: 88,
  },
  orbit: {
    backgroundColor: 'rgba(46, 125, 50, 0.08)',
    borderRadius: radius.full,
    position: 'absolute',
  },
  orbitOne: {
    height: 120,
    width: 120,
  },
  orbitTwo: {
    height: 150,
    opacity: 0.5,
    width: 150,
  },
  title: {
    ...typography.h3,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  button: {
    maxWidth: 240,
  },
});
