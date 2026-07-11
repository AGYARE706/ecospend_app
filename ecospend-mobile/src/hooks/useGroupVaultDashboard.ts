import { useMemo } from 'react';

import { useVaults } from '../context/VaultContext';
import { buildGroupVaultSummary } from '../data/mock/groupVaults';
import type { GroupVault, WithdrawalRequest } from '../types/groupVault';

export interface GroupVaultDashboardData {
  groups: GroupVault[];
  activeGroups: GroupVault[];
  pendingRequests: WithdrawalRequest[];
  summary: {
    totalGroupSavings: number;
    activeGroups: number;
    pendingApprovals: number;
  };
  isEmpty: boolean;
  hasPendingRequests: boolean;
}

export function useGroupVaultDashboard(): GroupVaultDashboardData {
  const { groupVaults, withdrawalRequests } = useVaults();

  return useMemo(() => {
    const activeGroups = groupVaults.filter(
      (g) => g.status === 'active' || g.status === 'locked',
    );

    const pendingRequests = withdrawalRequests.filter(
      (r) => r.status === 'pending',
    );

    const summary = buildGroupVaultSummary(groupVaults, pendingRequests);

    return {
      groups: groupVaults,
      activeGroups,
      pendingRequests,
      summary,
      isEmpty: groupVaults.length === 0,
      hasPendingRequests: pendingRequests.length > 0,
    };
  }, [groupVaults, withdrawalRequests]);
}
