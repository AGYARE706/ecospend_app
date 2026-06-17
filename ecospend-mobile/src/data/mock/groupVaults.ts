import type {
  GroupVault,
  GroupVaultSummary,
  WithdrawalRequest,
} from '../../types/groupVault';

// ─── Mock group vaults ────────────────────────────────────────────────────────
export const mockGroupVaults: GroupVault[] = [
  {
    id: 'gv-trip',
    name: 'London Trip Squad',
    goalName: 'Europe Vacation 2026',
    description: 'Saving up for a 10-day trip to London and Paris.',
    amountSaved: 18400,
    targetAmount: 32000,
    maturityDate: '2026-11-01',
    createdDate: '2026-01-15',
    status: 'active',
    accentColor: '#1565C0',
    myContribution: 5200,
    members: [
      { id: 'm1', name: 'Frank Mensah', initials: 'FM', role: 'admin', lastContribution: '2026-05-20' },
      { id: 'm2', name: 'Ama Boateng', initials: 'AB', role: 'member', lastContribution: '2026-05-18' },
      { id: 'm3', name: 'Kweku Asante', initials: 'KA', role: 'member', lastContribution: '2026-05-10' },
      { id: 'm4', name: 'Efua Darko', initials: 'ED', role: 'member', lastContribution: '2026-04-30' },
    ],
  },
  {
    id: 'gv-office',
    name: 'TechTeam Fund',
    goalName: 'Office Equipment Upgrade',
    description: 'Pooling funds for new laptops and ergonomic chairs.',
    amountSaved: 7600,
    targetAmount: 12000,
    maturityDate: '2026-08-15',
    createdDate: '2026-03-01',
    status: 'active',
    accentColor: '#6A1B9A',
    myContribution: 1800,
    members: [
      { id: 'm5', name: 'Frank Mensah', initials: 'FM', role: 'member', lastContribution: '2026-05-15' },
      { id: 'm6', name: 'Samuel Osei', initials: 'SO', role: 'admin', lastContribution: '2026-05-14' },
      { id: 'm7', name: 'Nana Yaa', initials: 'NY', role: 'member', lastContribution: '2026-05-12' },
      { id: 'm8', name: 'Kofi Adu', initials: 'KA', role: 'member', lastContribution: '2026-05-01' },
      { id: 'm9', name: 'Adwoa Mills', initials: 'AM', role: 'member', lastContribution: '2026-04-28' },
    ],
  },
  {
    id: 'gv-family',
    name: 'Family Safety Net',
    goalName: 'Emergency Reserve',
    description: 'A joint emergency fund for unexpected family expenses.',
    amountSaved: 22000,
    targetAmount: 30000,
    maturityDate: '2026-12-31',
    createdDate: '2025-10-01',
    status: 'locked',
    accentColor: '#2E7D32',
    myContribution: 8500,
    members: [
      { id: 'm10', name: 'Frank Mensah', initials: 'FM', role: 'admin', lastContribution: '2026-05-05' },
      { id: 'm11', name: 'Abena Mensah', initials: 'AM', role: 'member', lastContribution: '2026-04-25' },
      { id: 'm12', name: 'Yaw Mensah', initials: 'YM', role: 'member', lastContribution: '2026-03-30' },
      { id: 'm13', name: 'Akosua Mensah', initials: 'AM', role: 'member', lastContribution: '2026-02-14' },
    ],
  },
  {
    id: 'gv-startup',
    name: 'Startup Launchpad',
    goalName: 'Business Seed Capital',
    description: 'Friends pooling capital to launch a mobile app startup.',
    amountSaved: 45000,
    targetAmount: 50000,
    maturityDate: '2026-07-01',
    createdDate: '2025-07-01',
    status: 'matured',
    accentColor: '#E65100',
    myContribution: 12000,
    members: [
      { id: 'm14', name: 'Frank Mensah', initials: 'FM', role: 'admin', lastContribution: '2026-03-01' },
      { id: 'm15', name: 'Daniel Asare', initials: 'DA', role: 'member', lastContribution: '2026-03-01' },
      { id: 'm16', name: 'Priscilla Tetteh', initials: 'PT', role: 'member', lastContribution: '2026-02-15' },
    ],
  },
];

// ─── Pending withdrawal requests ──────────────────────────────────────────────
export const mockWithdrawalRequests: WithdrawalRequest[] = [
  {
    id: 'wr-1',
    groupVaultId: 'gv-family',
    groupVaultName: 'Family Safety Net',
    requestedBy: {
      id: 'm11',
      name: 'Abena Mensah',
      initials: 'AM',
      role: 'member',
    },
    amount: 3500,
    reason: 'Medical bills for a minor surgery.',
    requestedDate: '2026-06-14',
    votesFor: 1,
    votesAgainst: 0,
    requiredVotes: 3,
    status: 'pending',
    hasVoted: false,
  },
  {
    id: 'wr-2',
    groupVaultId: 'gv-trip',
    groupVaultName: 'London Trip Squad',
    requestedBy: {
      id: 'm2',
      name: 'Ama Boateng',
      initials: 'AB',
      role: 'member',
    },
    amount: 1200,
    reason: 'Advance flight booking — price will increase.',
    requestedDate: '2026-06-13',
    votesFor: 2,
    votesAgainst: 1,
    requiredVotes: 3,
    status: 'pending',
    hasVoted: true,
  },
  {
    id: 'wr-3',
    groupVaultId: 'gv-office',
    groupVaultName: 'TechTeam Fund',
    requestedBy: {
      id: 'm6',
      name: 'Samuel Osei',
      initials: 'SO',
      role: 'admin',
    },
    amount: 2800,
    reason: 'Deposit on a bulk laptop order — 20% discount expires Friday.',
    requestedDate: '2026-06-12',
    votesFor: 3,
    votesAgainst: 0,
    requiredVotes: 3,
    status: 'pending',
    hasVoted: false,
  },
];

// ─── Summary builder ──────────────────────────────────────────────────────────
export function buildGroupVaultSummary(
  vaults: GroupVault[],
  requests: WithdrawalRequest[],
): GroupVaultSummary {
  return {
    totalGroupSavings: vaults.reduce((s, v) => s + v.amountSaved, 0),
    activeGroups: vaults.filter(
      (v) => v.status === 'active' || v.status === 'locked',
    ).length,
    pendingApprovals: requests.filter((r) => r.status === 'pending' && !r.hasVoted)
      .length,
  };
}
