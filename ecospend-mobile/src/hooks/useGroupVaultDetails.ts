import { useMemo } from 'react';

import { useVaults } from '../context/VaultContext';
import type { GroupVault, WithdrawalRequest } from '../types/groupVault';
import { formatVaultDate, getDaysRemaining } from '../utils/vault';

/**
 * One row of the contribution timeline. The timeline is the group's
 * REAL automatic plan (from the backend): every instalment each member
 * owes, from creation until the maturity date, marked as done/next/
 * upcoming as time passes.
 */
export interface GroupContributionTimelineItem {
  id: string;
  title: string;
  amount: number;
  date: string;
  kind: 'created' | 'past' | 'next' | 'upcoming';
  note?: string;
}

export interface GroupVaultDetailsData {
  vault: GroupVault;
  pendingRequests: WithdrawalRequest[];
  progressPct: number;
  daysRemaining: number;
  remainingAmount: number;
  /** Real amount each member has contributed so far (by member id). */
  memberContributionMap: Record<string, number>;
  timeline: GroupContributionTimelineItem[];
}

function buildPlanTimeline(vault: GroupVault): GroupContributionTimelineItem[] {
  const items: GroupContributionTimelineItem[] = [
    {
      id: `${vault.id}-created`,
      title: 'Group vault created',
      amount: 0,
      date: vault.createdDate,
      kind: 'created',
      note: `Target ${vault.targetAmount > 0 ? `GHS ${vault.targetAmount.toLocaleString()}` : 'not set'} · matures ${formatVaultDate(vault.maturityDate)}`,
    },
  ];

  const plan = vault.contributionPlan;
  if (!plan) {
    return items;
  }

  const todayIso = new Date().toISOString().slice(0, 10);

  for (const instalment of plan.instalments) {
    const isNext = plan.nextDueDate === instalment.dueDate;
    const isPast = !isNext && instalment.dueDate < todayIso;

    items.push({
      id: `${vault.id}-inst-${instalment.index}`,
      title: `Instalment ${instalment.index} of ${plan.instalmentCount}${isNext ? ' — next due' : ''}`,
      amount: plan.instalmentAmount,
      date: instalment.dueDate,
      kind: isNext ? 'next' : isPast ? 'past' : 'upcoming',
      note: `GHS ${plan.instalmentAmount.toFixed(2)} per member · GHS ${instalment.cumulativePerMember.toFixed(2)} each in total by this date`,
    });
  }

  return items;
}

export function useGroupVaultDetails(groupVaultId: string): GroupVaultDetailsData {
  const { getGroupVaultById, groupVaults, withdrawalRequests } = useVaults();
  const vault =
    getGroupVaultById(groupVaultId) ??
    groupVaults[0]!;

  return useMemo(() => {
    const progressPct =
      vault.targetAmount > 0
        ? Math.min(100, Math.round((vault.amountSaved / vault.targetAmount) * 100))
        : 0;
    const daysRemaining = getDaysRemaining(vault.maturityDate);
    const remainingAmount = Math.max(0, vault.targetAmount - vault.amountSaved);
    const pendingRequests = withdrawalRequests.filter(
      (r) => r.groupVaultId === vault.id && r.status === 'pending',
    );

    // Real contributions straight from the API — no synthesized numbers.
    const memberContributionMap: Record<string, number> = {};
    for (const member of vault.members) {
      memberContributionMap[member.id] = member.contributed ?? 0;
    }

    const timeline = buildPlanTimeline(vault);

    return {
      vault,
      pendingRequests,
      progressPct,
      daysRemaining,
      remainingAmount,
      memberContributionMap,
      timeline,
    };
  }, [vault, withdrawalRequests]);
}

export function formatGroupVaultDate(iso: string): string {
  return formatVaultDate(iso);
}
