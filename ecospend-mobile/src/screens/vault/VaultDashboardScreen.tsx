import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import type { StackNavigationProp } from '@react-navigation/stack';

import FloatingActionButton from '../../components/finance/FloatingActionButton';
import VaultCard from '../../components/vault/VaultCard';
import VaultEmptyState from '../../components/vault/VaultEmptyState';
import VaultQuickActions from '../../components/vault/VaultQuickActions';
import VaultSummaryCard from '../../components/vault/VaultSummaryCard';
import { useVaultTheme } from '../../components/vault/vaultTheme';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import { useVaultDashboard } from '../../hooks/useVaultDashboard';
import { navigateApp } from '../../navigation/navigationRef';
import type { VaultStackParamList } from '../../navigation/types';
import type { Vault } from '../../types/vault';
import { fontSize, fontWeight, spacing } from '../../theme';

type VaultDashboardNavigationProp = StackNavigationProp<
  VaultStackParamList,
  'VaultDashboard'
>;

export default function VaultDashboardScreen() {
  const navigation = useNavigation<VaultDashboardNavigationProp>();
  const theme = useVaultTheme();
  const { vaults, activeVaults, summary, isEmpty } = useVaultDashboard();

  const openCreateVault = () => {
    navigateApp('CreateVault');
  };

  const openNotifications = () => {
    navigateApp('Notifications');
  };

  const openVaultDetails = (vault: Vault) => {
    navigation.navigate('VaultDetails', { vaultId: vault.id });
  };

  const openVaultHistory = () => {
    const historyVaultId = activeVaults[0]?.id ?? vaults[0]?.id ?? 'vault-emergency';
    navigation.navigate('VaultHistory', { vaultId: historyVaultId });
  };

  const openGroupVaults = () => {
    navigation.navigate('GroupVaultDashboard');
  };

  return (
    <ScreenWrapper background="page" padded={false}>
      <View style={[styles.screen, { backgroundColor: theme.background }]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.headerTextBlock}>
              <Text style={[styles.title, { color: theme.text }]}>My Vaults</Text>
              <Text style={[styles.subtitle, { color: theme.textMuted }]}>
                Secure savings with maturity goals
              </Text>
            </View>

            <View style={styles.headerActions}>
              <HeaderIconButton
                icon="notifications-outline"
                themeBackground={theme.chipBg}
                themeText={theme.text}
                onPress={openNotifications}
              />
              <HeaderIconButton
                icon="add"
                themeBackground={theme.chipBg}
                themeText={theme.text}
                onPress={openCreateVault}
              />
            </View>
          </View>

          {!isEmpty ? (
            <>
              <VaultSummaryCard summary={summary} theme={theme} />

              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Active Vaults
                </Text>
                <Text style={[styles.sectionMeta, { color: theme.textMuted }]}>
                  {activeVaults.length} active
                </Text>
              </View>

              {activeVaults.map((vault) => (
                <VaultCard
                  key={vault.id}
                  vault={vault}
                  theme={theme}
                  onPress={openVaultDetails}
                />
              ))}

              <VaultQuickActions
                theme={theme}
                onCreateVault={openCreateVault}
                onVaultHistory={openVaultHistory}
                onGroupVaults={openGroupVaults}
              />
            </>
          ) : (
            <VaultEmptyState theme={theme} onCreateVault={openCreateVault} />
          )}
        </ScrollView>

        {!isEmpty ? <FloatingActionButton onPress={openCreateVault} /> : null}
      </View>
    </ScreenWrapper>
  );
}

interface HeaderIconButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  themeBackground: string;
  themeText: string;
  onPress: () => void;
}

function HeaderIconButton({
  icon,
  themeBackground,
  themeText,
  onPress,
}: HeaderIconButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.iconButton,
        { backgroundColor: themeBackground },
        pressed && styles.iconButtonPressed,
      ]}
      onPress={onPress}
    >
      <Ionicons name={icon} size={22} color={themeText} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  headerTextBlock: {
    flex: 1,
    marginRight: spacing.md,
  },
  title: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconButton: {
    alignItems: 'center',
    borderRadius: 999,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  iconButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  sectionMeta: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
});
