import { useMemo } from 'react';

import { mockGroupVaults, mockWithdrawalRequests } from '../data/mock/groupVaults';
import type { GroupVault, WithdrawalRequest } from '../types/groupVault';
import { formatVaultDate, getDaysRemaining } from '../utils/vault';

export interface GroupContributionTimelineItem {
  id: string;
  memberName: string;
  memberInitials: string;
  amount: number;
  date: string;
  kind: 'contribution' | 'milestone' | 'created';
  note?: string;
}

export interface GroupVaultDetailsData {
  vault: GroupVault;
  pendingRequests: WithdrawalRequest[];
  progressPct: number;
  daysRemaining: number;
  remainingAmount: number;
  memberContributionMap: Record<string, number>;
  timeline: GroupContributionTimelineItem[];
}

function buildMemberContributionMap(vault: GroupVault): Record<string, number> {
  const weights = vault.members.map((m, idx) => ({
    id: m.id,
    // members earlier in array contribute slightly more for realism
    weight: Math.max(1, vault.members.length - idx),
  }));
  const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0) || 1;

  let allocated = 0;
  const map: Record<string, number> = {};

  weights.forEach((w, idx) => {
    if (idx === weights.length - 1) {
      map[w.id] = Math.max(0, vault.amountSaved - allocated);
      return;
    }
    const portion = Math.round((vault.amountSaved * w.weight) / totalWeight);
    map[w.id] = portion;
    allocated += portion;
  });

  return map;
}

function buildTimeline(vault: GroupVault): GroupContributionTimelineItem[] {
  const timeline: GroupContributionTimelineItem[] = [];
  const createdDate = new Date(vault.createdDate);
  const maturity = new Date(vault.maturityDate);
  const spanDays = Math.max(
    30,
    Math.ceil((maturity.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)),
  );

  // Created event
  const admin = vault.members.find((m) => m.role === 'admin') ?? vault.members[0];
  timeline.push({
    id: `${vault.id}-created`,
    memberName: admin?.name ?? 'Group Admin',
    memberInitials: admin?.initials ?? 'GA',
    amount: 0,
    date: vault.createdDate,
    kind: 'created',
    note: 'Group vault created',
  });

  // Generate contribution events from members with deterministic spacing
  const checkpoints = [0.12, 0.28, 0.46, 0.62, 0.78, 0.9];
  const memberCount = Math.max(1, vault.members.length);
  const baseAmount = Math.max(100, Math.round(vault.amountSaved / (checkpoints.length + 2)));
  let runningTotal = 0;

  checkpoints.forEach((ratio, idx) => {
    const member = vault.members[idx % memberCount] ?? admin;
    const atDays = Math.round(spanDays * ratio);
    const dt = new Date(createdDate);
    dt.setDate(createdDate.getDate() + atDays);
    const amount = Math.max(80, Math.round(baseAmount * (0.8 + (idx % 3) * 0.25)));
    runningTotal += amount;
    timeline.push({
      id: `${vault.id}-c-${idx}`,
      memberName: member?.name ?? 'Member',
      memberInitials: member?.initials ?? 'MB',
      amount,
      date: dt.toISOString().slice(0, 10),
      kind: 'contribution',
      note: idx % 2 === 0 ? 'Weekly contribution' : undefined,
    });
  });

  // Milestone event
  const milestonePct = Math.min(100, Math.max(25, Math.round((vault.amountSaved / vault.targetAmount) * 100)));
  const milestoneDate = new Date(createdDate);
  milestoneDate.setDate(createdDate.getDate() + Math.round(spanDays * 0.7));
  timeline.push({
    id: `${vault.id}-milestone`,
    memberName: 'Group Milestone',
    memberInitials: 'MS',
    amount: 0,
    date: milestoneDate.toISOString().slice(0, 10),
    kind: 'milestone',
    note: `${milestonePct}% of target reached`,
  });

  // Sort newest first
  timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return timeline;
}

export function useGroupVaultDetails(groupVaultId: string): GroupVaultDetailsData {
  const vault =
    mockGroupVaults.find((g) => g.id === groupVaultId) ??
    mockGroupVaults[0]!;

  return useMemo(() => {
    const progressPct =
      vault.targetAmount > 0
        ? Math.min(100, Math.round((vault.amountSaved / vault.targetAmount) * 100))
        : 0;
    const daysRemaining = getDaysRemaining(vault.maturityDate);
    const remainingAmount = Math.max(0, vault.targetAmount - vault.amountSaved);
    const pendingRequests = mockWithdrawalRequests.filter(
      (r) => r.groupVaultId === vault.id && r.status === 'pending',
    );
    const memberContributionMap = buildMemberContributionMap(vault);
    const timeline = buildTimeline(vault);

    return {
      vault,
      pendingRequests,
      progressPct,
      daysRemaining,
      remainingAmount,
      memberContributionMap,
      timeline,
    };
  }, [vault]);
}

export function formatGroupVaultDate(iso: string): string {
  return formatVaultDate(iso);
}
