import { useMemo } from 'react';

import {
  buildGroupVaultSummary,
  mockGroupVaults,
  mockWithdrawalRequests,
} from '../data/mock/groupVaults';
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
  const groups = mockGroupVaults;
  const allRequests = mockWithdrawalRequests;

  return useMemo(() => {
    const activeGroups = groups.filter(
      (g) => g.status === 'active' || g.status === 'locked',
    );

    const pendingRequests = allRequests.filter(
      (r) => r.status === 'pending',
    );

    const summary = buildGroupVaultSummary(groups, pendingRequests);

    return {
      groups,
      activeGroups,
      pendingRequests,
      summary,
      isEmpty: groups.length === 0,
      hasPendingRequests: pendingRequests.length > 0,
    };
  }, [groups, allRequests]);
}
