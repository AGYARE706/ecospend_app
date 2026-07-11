import { useCallback, useMemo, useState } from 'react';

import { useVaults } from '../context/VaultContext';
import type { Vault, VaultStatus } from '../types/vault';

export type HistoryFilter = 'all' | 'active' | 'matured' | 'withdrawn';

export const HISTORY_FILTERS: { key: HistoryFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'matured', label: 'Matured' },
  { key: 'withdrawn', label: 'Withdrawn' },
];

export interface VaultHistorySummary {
  totalVaults: number;
  totalSaved: number;
  totalFeesPaid: number;
}

function sortByNewest(a: Vault, b: Vault): number {
  return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
}

function matchesFilter(vault: Vault, filter: HistoryFilter): boolean {
  if (filter === 'all') return true;
  if (filter === 'active') {
    return (
      vault.status === 'active' ||
      vault.status === 'locked' ||
      vault.status === 'pending'
    );
  }
  return vault.status === (filter as VaultStatus);
}

function matchesQuery(vault: Vault, query: string): boolean {
  if (!query.trim()) return true;
  return vault.name.toLowerCase().includes(query.toLowerCase().trim());
}

export function useVaultHistory() {
  const { vaults } = useVaults();
  const [activeFilter, setActiveFilter] = useState<HistoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const allVaults = useMemo(() => [...vaults].sort(sortByNewest), [vaults]);

  const filteredVaults = useMemo(
    () =>
      allVaults
        .filter((v) => matchesFilter(v, activeFilter))
        .filter((v) => matchesQuery(v, searchQuery)),
    [allVaults, activeFilter, searchQuery],
  );

  const summary = useMemo<VaultHistorySummary>(() => {
    const totalSaved = allVaults.reduce((sum, v) => {
      const contributed = v.contributions.reduce((s, c) => s + c.amount, 0);
      return sum + contributed;
    }, 0);

    const totalFeesPaid = allVaults.reduce((sum, v) => {
      if (v.status === 'withdrawn' && v.feeCharged != null) {
        return sum + v.feeCharged;
      }
      return sum;
    }, 0);

    return {
      totalVaults: allVaults.length,
      totalSaved,
      totalFeesPaid,
    };
  }, [allVaults]);

  const filterCounts = useMemo<Record<HistoryFilter, number>>(
    () => ({
      all: allVaults.length,
      active: allVaults.filter((v) => matchesFilter(v, 'active')).length,
      matured: allVaults.filter((v) => v.status === 'matured').length,
      withdrawn: allVaults.filter((v) => v.status === 'withdrawn').length,
    }),
    [allVaults],
  );

  const clearSearch = useCallback(() => setSearchQuery(''), []);

  return {
    filteredVaults,
    summary,
    filterCounts,
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    clearSearch,
    hasResults: filteredVaults.length > 0,
  };
}
