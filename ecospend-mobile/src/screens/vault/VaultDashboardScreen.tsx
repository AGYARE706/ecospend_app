import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

import FloatingActionButton from '../../components/finance/FloatingActionButton';
import VaultCard from '../../components/vault/VaultCard';
import VaultEmptyState from '../../components/vault/VaultEmptyState';
import VaultQuickActions from '../../components/vault/VaultQuickActions';
import VaultSummaryCard from '../../components/vault/VaultSummaryCard';
import { useVaultTheme } from '../../components/vault/vaultTheme';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import { useAuth } from '../../context/AuthContext';
import { useVaultDashboard } from '../../hooks/useVaultDashboard';
import { navigateApp, navigateToSubscription } from '../../navigation/navigationRef';
import type { VaultStackParamList } from '../../navigation/types';
import type { Vault } from '../../types/vault';
import { spacing, typography } from '../../theme';

type VaultDashboardNavigationProp = StackNavigationProp<
  VaultStackParamList,
  'VaultDashboard'
>;

export default function VaultDashboardScreen() {
  const navigation = useNavigation<VaultDashboardNavigationProp>();
  const theme = useVaultTheme();
  const { tier } = useAuth();
  const { vaults, activeVaults, summary, isEmpty } = useVaultDashboard();

  const openCreateVault = () => {
    navigateApp('CreateVault');
  };

  const openVaultDetails = (vault: Vault) => {
    navigation.navigate('VaultDetails', { vaultId: vault.id });
  };

  const openVaultHistory = () => {
    const historyVaultId = activeVaults[0]?.id ?? vaults[0]?.id ?? 'vault-emergency';
    navigation.navigate('VaultHistory', { vaultId: historyVaultId });
  };

  const openGroupVaults = () => {
    if (tier === 'FREE') {
      navigateToSubscription();
      return;
    }
    navigation.navigate('GroupVaultDashboard');
  };

  return (
    <ScreenWrapper background="page" padded={false} edges={[]}>
      <View style={[styles.screen, { backgroundColor: theme.background }]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>My Vaults</Text>
            <Text style={[styles.subtitle, { color: theme.textMuted }]}>
              Secure savings with maturity goals
            </Text>
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

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    // Clears the screen's own floating action button (60px + 24px offset).
    paddingBottom: spacing.xxxl + spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodySm,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.subheading,
    fontWeight: '700',
  },
  sectionMeta: {
    ...typography.bodySm,
    fontWeight: '500',
  },
});
