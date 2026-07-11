import { useMemo } from 'react';

import { useVaults } from '../context/VaultContext';
import { buildVaultSummary } from '../data/mock/vaults';
import type { Vault, VaultSummary } from '../types/vault';

interface UseVaultDashboardResult {
  vaults: Vault[];
  activeVaults: Vault[];
  summary: VaultSummary;
  isEmpty: boolean;
}

export function useVaultDashboard(): UseVaultDashboardResult {
  const { vaults } = useVaults();

  const activeVaults = useMemo(
    () => vaults.filter((vault) => vault.status === 'active'),
    [vaults],
  );

  const summary = useMemo(() => buildVaultSummary(vaults), [vaults]);

  return {
    vaults,
    activeVaults,
    summary,
    isEmpty: vaults.length === 0,
  };
}
